
import { parseSQL } from './parser.js';
import { HeapAccessMethod, BTreeAccessMethod } from './access.js';
import { logger } from './core.js';

export class SQLExecutor {
  constructor(storageMgr, txMgr, bufferPool) {
    this.storageMgr = storageMgr; this.txMgr = txMgr; this.bufferPool = bufferPool;
    this.heapAM = new HeapAccessMethod(storageMgr, bufferPool, txMgr);
    this.btreeAM = new BTreeAccessMethod(storageMgr, bufferPool);
    this.catalogs = new Map();
  }
  splitSQL(sql) {
    const stmts = []; let cur = ''; let inStr = false;
    for (let i = 0; i < sql.length; i++) {
      const c = sql[i];
      if (c === "'") { if (inStr && sql[i+1] === "'") { cur += "''"; i++; continue; } inStr = !inStr; }
      if (c === ';' && !inStr) { if (cur.trim()) stmts.push(cur.trim()); cur = ''; } 
      else cur += c;
    }
    if (cur.trim()) stmts.push(cur.trim());
    return stmts;
  }

  async execute(sql) {
    const stmts = this.splitSQL(sql);
    let lastRes = null;
    for (const s of stmts) {
      const ast = parseSQL(s);
      lastRes = await this.execAST(ast);
    }
    return lastRes || { command: 'OK', rowCount: 0, rows: [] };
  }
  async execAST(ast) {
    if (ast.type === 'CREATE_TABLE') {
      const oid = Math.floor(Math.random()*100000)+16384;
      this.catalogs.set(ast.children.name, { relOid: oid, columns: ast.children.columns, indexes: [] });
      await this.storageMgr.createRelation(oid);
      return { command: 'CREATE TABLE', rowCount: 0, rows: [] };
    }
    if (ast.type === 'CREATE_INDEX') {
      const meta = this.catalogs.get(ast.children.tableName); if (!meta) throw new Error('Table not found');
      const oid = Math.floor(Math.random()*100000)+50000;
      meta.indexes.push({ name: ast.children.indexName, relOid: oid, columns: ast.children.columns });
      await this.storageMgr.createRelation(oid);
      return { command: 'CREATE INDEX', rowCount: 0, rows: [] };
    }
    if (ast.type === 'INSERT') {
      const meta = this.catalogs.get(ast.children.table); if (!meta) throw new Error('Table not found');
      const started = !this.txMgr.isInTransaction(); const xid = started ? this.txMgr.startTransaction() : this.txMgr.getCurrentXid();
      const row = {}; ast.children.values.forEach((v, i) => row[meta.columns[i].name] = v.value);
      const buf = new TextEncoder().encode(JSON.stringify(row));
      const tid = await this.heapAM.heapInsert(meta.relOid, buf, xid);
      for (const idx of meta.indexes) { const k = row[idx.columns[0]]; if (k !== undefined) await this.btreeAM.btInsert(idx.relOid, k, tid); }
      if (started) await this.txMgr.commit();
      return { command: 'INSERT', rowCount: 1, rows: [] };
    }
    if (ast.type === 'SELECT') {
      const meta = this.catalogs.get(ast.children.table.name); if (!meta) throw new Error('Table not found');
      const snap = this.txMgr.getSnapshot(); const rows = [];
      for await (const t of this.heapAM.heapScan(meta.relOid, snap)) {
        const row = JSON.parse(new TextDecoder().decode(t.data));
        if (ast.children.where && !this.evalWhere(ast.children.where, row)) continue;
        rows.push(row);
      }
      if (ast.children.orderBy) {
        const col = ast.children.orderBy[0].column.column; const dir = ast.children.orderBy[0].direction === 'DESC' ? -1 : 1;
        rows.sort((a,b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * dir);
      }
      if (ast.children.limit) rows.splice(parseInt(ast.children.limit));
      return { command: 'SELECT', rowCount: rows.length, rows, columns: meta.columns.map(c => ({name: c.name})) };
    }
    if (ast.type === 'UPDATE') {
      const meta = this.catalogs.get(ast.children.table); if (!meta) throw new Error('Table not found');
      const started = !this.txMgr.isInTransaction(); const xid = started ? this.txMgr.startTransaction() : this.txMgr.getCurrentXid();
      const snap = this.txMgr.getSnapshot(); let count = 0;
      for await (const t of this.heapAM.heapScan(meta.relOid, snap)) {
        const row = JSON.parse(new TextDecoder().decode(t.data));
        if (ast.children.where && !this.evalWhere(ast.children.where, row)) continue;
        await this.heapAM.heapMarkForUpdate(meta.relOid, t.tid, xid);
        for (const a of ast.children.assignments) row[a.column] = a.value.value;
        await this.heapAM.heapInsert(meta.relOid, new TextEncoder().encode(JSON.stringify(row)), xid);
        count++;
      }
      if (started) await this.txMgr.commit();
      return { command: 'UPDATE', rowCount: count, rows: [] };
    }
    if (ast.type === 'DELETE') {
      const meta = this.catalogs.get(ast.children.table); if (!meta) throw new Error('Table not found');
      const started = !this.txMgr.isInTransaction(); const xid = started ? this.txMgr.startTransaction() : this.txMgr.getCurrentXid();
      const snap = this.txMgr.getSnapshot(); let count = 0;
      for await (const t of this.heapAM.heapScan(meta.relOid, snap)) {
        const row = JSON.parse(new TextDecoder().decode(t.data));
        if (ast.children.where && !this.evalWhere(ast.children.where, row)) continue;
        await this.heapAM.heapMarkForUpdate(meta.relOid, t.tid, xid); count++;
      }
      if (started) await this.txMgr.commit();
      return { command: 'DELETE', rowCount: count, rows: [] };
    }
    if (ast.type === 'DROP') { this.catalogs.delete(ast.children.name); return { command: 'DROP', rowCount: 0, rows: [] }; }
    throw new Error('Unsupported AST: ' + ast.type);
  }
  evalWhere(expr, row) {
    if (expr.type === 'BINARY_OP') {
      const l = this.getVal(expr.children.left, row); const r = this.getVal(expr.children.right, row);
      if (expr.value === '=') return l == r; if (expr.value === '<') return l < r; if (expr.value === '>') return l > r;
      if (expr.value === 'AND') return l && r; if (expr.value === 'OR') return l || r;
    }
    return true;
  }
  getVal(node, row) { if (node.type === 'LITERAL') return node.value; if (node.type === 'column') return row[node.column]; return null; }
}
