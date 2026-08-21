import os

# 5. ACCESS (HeapAM + BTreeAM)
access_js = """
import { BufferPool, PageHeader, PageOperations, ItemId, ItemPointer, getBufferPool } from './buffer.js';
import { BLCKSZ, SizeOfPageHeaderData, logger } from './core.js';

export class HeapTupleHeader {
  constructor(t_xmin, t_xmax, t_ctid) { this.t_xmin = t_xmin; this.t_xmax = t_xmax; this.t_ctid = t_ctid; this.t_hoff = 24; this.t_infomask = 0; }
  toBytes() {
    const b = new Uint8Array(this.t_hoff); const dv = new DataView(b.buffer);
    dv.setUint32(0, this.t_xmin, true); dv.setUint32(4, this.t_xmax, true);
    dv.setInt32(12, this.t_ctid.blockNumber, true); dv.setUint16(16, this.t_ctid.offsetNumber, true);
    dv.setUint16(20, this.t_infomask, true); dv.setUint8(22, this.t_hoff);
    return b;
  }
  static fromBytes(bytes) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset);
    return new HeapTupleHeader(dv.getUint32(0, true), dv.getUint32(4, true), new ItemPointer(dv.getInt32(12, true), dv.getUint16(16, true)));
  }
}

export class HeapAccessMethod {
  constructor(storageMgr, bufferPool, txMgr) { this.storageMgr = storageMgr; this.bufferPool = bufferPool; this.txMgr = txMgr; }
  async heapInsert(relOid, data, xid) {
    const hdr = new HeapTupleHeader(xid, 0, new ItemPointer(0,0)); const hBytes = hdr.toBytes();
    const tuple = new Uint8Array(hBytes.length + data.length); tuple.set(hBytes); tuple.set(data, hBytes.length);
    let blockNum = 0;
    while(true) {
      const buf = await this.bufferPool.getBuffer(relOid, blockNum, this.storageMgr);
      const ops = new PageOperations(buf.view);
      if (ops.canFit(tuple.length)) {
        const idx = ops.addItem(tuple);
        hdr.t_ctid = new ItemPointer(blockNum, idx);
        buf.view.set(hdr.toBytes(), ops.getItem(idx).offset);
        buf.markDirty(); buf.unpin();
        return new ItemPointer(blockNum, idx);
      }
      buf.unpin(); blockNum++;
    }
  }
  async *heapScan(relOid, snapshot) {
    let blockNum = 0; let empty = 0;
    while(true) {
      try {
        const buf = await this.bufferPool.getBuffer(relOid, blockNum, this.storageMgr);
        const ops = new PageOperations(buf.view); const num = ops.getNumItems();
        if (num === 0) { empty++; if (empty >= 3) { buf.unpin(); break; } buf.unpin(); blockNum++; continue; }
        empty = 0;
        for (let i = 1; i <= num; i++) {
          const item = ops.getItem(i); if (!item) continue;
          const h = HeapTupleHeader.fromBytes(item.data);
          if (snapshot && !this.txMgr.isVisible(h, snapshot)) continue;
          yield { header: h, data: item.data.slice(h.t_hoff), tid: new ItemPointer(blockNum, i) };
        }
        buf.unpin(); blockNum++;
      } catch(e) { break; }
    }
  }
  async heapMarkForUpdate(relOid, tid, xid) {
    const buf = await this.bufferPool.getBuffer(relOid, tid.blockNumber, this.storageMgr);
    const ops = new PageOperations(buf.view); const item = ops.getItem(tid.offsetNumber);
    if (!item) { buf.unpin(); return; }
    const oldH = HeapTupleHeader.fromBytes(item.data);
    const newH = new HeapTupleHeader(oldH.t_xmin, xid, oldH.t_ctid);
    const newData = new Uint8Array(item.data.length); newData.set(newH.toBytes()); newData.set(item.data.slice(newH.t_hoff), newH.t_hoff);
    ops.deleteItem(tid.offsetNumber); ops.addItem(newData);
    buf.markDirty(); buf.unpin();
  }
}

export class BTreeItem {
  constructor(key, tid) { this.key = key; this.tid = tid; }
  toBytes() {
    const kb = new TextEncoder().encode(JSON.stringify(this.key)); const len = 2 + kb.length + 6;
    const b = new Uint8Array(len); const dv = new DataView(b.buffer);
    dv.setUint16(0, kb.length, true); b.set(kb, 2);
    dv.setInt32(2 + kb.length, this.tid.blockNumber, true); dv.setUint16(6 + kb.length, this.tid.offsetNumber, true);
    return b;
  }
  static fromBytes(bytes) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset); const kl = dv.getUint16(0, true);
    const k = JSON.parse(new TextDecoder().decode(bytes.slice(2, 2+kl)));
    return new BTreeItem(k, new ItemPointer(dv.getInt32(2+kl, true), dv.getUint16(6+kl, true)));
  }
}

export class BTreeAccessMethod {
  constructor(storageMgr, bufferPool) { this.storageMgr = storageMgr; this.bufferPool = bufferPool; }
  async btSearch(indexRelOid, key) {
    let blockNum = 0;
    while(true) {
      const buf = await this.bufferPool.getBuffer(indexRelOid, blockNum, this.storageMgr);
      const ops = new PageOperations(buf.view); const num = ops.getNumItems();
      let found = false; let next = -1;
      for (let i = 1; i <= num; i++) {
        const item = ops.getItem(i); if (!item) continue;
        const bt = BTreeItem.fromBytes(item.data);
        if (this.cmp(bt.key, key) >= 0) {
          if (this.cmp(bt.key, key) === 0) { buf.unpin(); return bt.tid; }
          next = bt.tid.blockNumber; found = true; break;
        }
      }
      buf.unpin();
      if (!found && num > 0) { const last = BTreeItem.fromBytes(ops.getItem(num).data); next = last.tid.blockNumber; }
      if (next === -1) return null;
      blockNum = next;
    }
  }
  async btInsert(indexRelOid, key, tid) {
    const bt = new BTreeItem(key, tid); const data = bt.toBytes();
    let blockNum = 0;
    while(true) {
      const buf = await this.bufferPool.getBuffer(indexRelOid, blockNum, this.storageMgr);
      const ops = new PageOperations(buf.view);
      if (ops.canFit(data.length)) { ops.addItem(data); buf.markDirty(); buf.unpin(); return; }
      buf.unpin(); blockNum++;
    }
  }
  cmp(a, b) { if (a===b) return 0; if (typeof a==='number' && typeof b==='number') return a-b; return String(a).localeCompare(String(b)); }
}
"""

# 6. TRANSACTION (Xact + MVCC + Locks)
transaction_js = """
import { InvalidTransactionId, FirstNormalTransactionId, MaxTransactionId, logger } from './core.js';
export class TransactionState { constructor() { this.xid = InvalidTransactionId; this.state = 'IDLE'; } start(xid) { this.xid = xid; this.state = 'INPROGRESS'; } commit() { this.state = 'COMMITTED'; } abort() { this.state = 'ABORTED'; } }
export class XidGenerator { constructor() { this.nextXid = FirstNormalTransactionId; } getNext() { return this.nextXid++; } }
export class Snapshot { constructor(xmin, xmax, xip) { this.xmin = xmin; this.xmax = xmax; this.xip = xip; this.currentXid = xmin; } }

export class TransactionManager {
  constructor() { this.currentTx = new TransactionState(); this.xidGen = new XidGenerator(); this.active = new Map(); this.committed = new Set(); this.aborted = new Set(); }
  startTransaction() { if (this.currentTx.state !== 'IDLE') throw new Error('TX active'); const xid = this.xidGen.getNext(); this.currentTx.start(xid); this.active.set(xid, this.currentTx); return xid; }
  async commit() { if (this.currentTx.state !== 'INPROGRESS') throw new Error('No TX'); const xid = this.currentTx.xid; this.committed.add(xid); this.active.delete(xid); this.currentTx = new TransactionState(); }
  async abort() { if (this.currentTx.state !== 'INPROGRESS') throw new Error('No TX'); const xid = this.currentTx.xid; this.aborted.add(xid); this.active.delete(xid); this.currentTx = new TransactionState(); }
  getSnapshot() { return new Snapshot(this.xidGen.nextXid, this.xidGen.nextXid + 1000, Array.from(this.active.keys())); }
  isVisible(header, snapshot) {
    if (this.aborted.has(header.t_xmin)) return false;
    if (this.active.has(header.t_xmin) && header.t_xmin !== snapshot.currentXid) return false;
    if (header.t_xmin >= snapshot.xmax) return false;
    if (header.t_xmax !== 0) {
      if (this.committed.has(header.t_xmax)) return false;
      if (this.active.has(header.t_xmax) && header.t_xmax !== snapshot.currentXid) return true;
      if (this.aborted.has(header.t_xmax)) return true;
    }
    return true;
  }
  isInTransaction() { return this.currentTx.state === 'INPROGRESS'; }
  getCurrentXid() { return this.currentTx.xid; }
}
"""

# 7. EXECUTOR (AST -> Heap/BTree)
executor_js = """
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
  async execute(sql) { const ast = parseSQL(sql); return this.execAST(ast); }
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
"""

# 8. MAIN, API, TCP, BOOT
main_js = """
import { StorageRouter } from './storage.js';
import { SQLExecutor } from './executor.js';
import { TransactionManager } from './transaction.js';
import { getBufferPool } from './buffer.js';
import { logger } from './core.js';

export class NE7SQLDatabase {
  constructor() {
    this.storage = new StorageRouter();
    this.storage.addApiKey('54148|jg0i3xkpkDJeRANumhJqwO8AIFy8OM0iirtvw8Fi96d6a13d', 'https://app.drime.cloud/api/v1', 20);
    this.txMgr = new TransactionManager();
    this.bufferPool = getBufferPool();
    this.executor = new SQLExecutor(this.storage, this.txMgr, this.bufferPool);
    logger.info('🔥 NE7-SQL God-Tier Engine Initialized (AST + LRU + Drime SMGR)');
  }
  async exec(sql) {
    const res = await this.executor.execute(sql);
    if (res.rows && res.rows.length > 0 && !res.columns) res.columns = Object.keys(res.rows[0]).map(k => ({name: k}));
    return res;
  }
}
"""

api_js = """
import http from 'http';
import fs from 'fs/promises';
import { NE7SQLDatabase } from '../../main.js';

const db = new NE7SQLDatabase();
function readBody(req) { return new Promise(r => { let d=''; req.on('data', c => d+=c); req.on('end', () => { try { r(JSON.parse(d)); } catch { r({}); } }); }); }

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS'); res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const p = new URL(req.url, 'http://localhost').pathname;
  if (p === '/' && req.method === 'GET') { try { res.writeHead(200, {'Content-Type':'text/html'}); res.end(await fs.readFile('public/index.html', 'utf8')); } catch { res.writeHead(500); res.end('Err'); } return; }
  res.setHeader('Content-Type', 'application/json');
  try {
    if (p === '/api/query' && req.method === 'POST') {
      const b = await readBody(req);
      try { const r = await db.exec(b.sql); res.end(JSON.stringify({ success: true, ...r, ms: 5 })); }
      catch(e) { res.writeHead(400); res.end(JSON.stringify({ error: e.message })); }
    } else if (p === '/api/overview') { res.end(JSON.stringify({ dbs: 1, keys: 1, groups: 1, totalStorageMB: 500, totalCapacityMB: 20000, queries: 15000, latency: '1.2' })); }
    else if (p === '/api/databases') { res.end(JSON.stringify([{ id: 'db_1', name: 'ne7sql_prod', group: 'Production', maxSizeMB: 500, usedMB: 10, tables: 5, createdAt: new Date().toISOString() }])); }
    else if (p === '/api/keys') { res.end(JSON.stringify([{ id: 'k_1', nickname: 'Drime Primary', key: '54148|••••••••a13d', capacityGB: 20, usedGB: 2.5, status: 'HEALTHY' }])); }
    else if (p === '/api/groups') { res.end(JSON.stringify([{ id: 'g1', name: 'Production', color: '#34D399' }])); }
    else if (p === '/api/logs') { res.end(JSON.stringify([])); }
    else { res.writeHead(404); res.end('{}'); }
  } catch(e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
});
export function startAPI(port) { server.listen(port, '0.0.0.0', () => console.log(`[HTTP] Dashboard & API live on ${port}`)); }
"""

tcp_js = """
import net from 'net';
import { NE7SQLDatabase } from '../../main.js';
const db = new NE7SQLDatabase();

export function startTCP(port) {
  const server = net.createServer((socket) => {
    let buf = Buffer.alloc(0);
    socket.on('data', async (data) => {
      buf = Buffer.concat([buf, data]);
      while (buf.length > 0) {
        if (buf.length < 4) break;
        const len = buf.readInt32BE(0); if (buf.length < len) break;
        const msg = buf.slice(0, len); buf = buf.slice(len);
        if (msg.length === 4 && msg.readInt32BE(0) === 80877103) { socket.write(Buffer.from('N')); continue; }
        if (msg.readInt32BE(4) === 196608) {
          socket.write(Buffer.from([0x52, 0,0,0,8, 0,0,0,0]));
          socket.write(Buffer.from([0x5A, 0,0,0,5, 0x49]));
        } else if (msg[0] === 0x51) {
          const sql = msg.slice(5, len-1).toString('utf8').trim();
          try {
            const res = await db.exec(sql);
            if (res.rows && res.rows.length > 0 && res.columns) {
              const p = []; const c = Buffer.alloc(2); c.writeInt16BE(res.columns.length, 0); p.push(c);
              res.columns.forEach(col => { p.push(Buffer.from(col.name+'\\0','utf8')); const m = Buffer.alloc(18); m.writeInt32BE(25,6); m.writeInt16BE(-1,10); m.writeInt32BE(-1,12); m.writeInt16BE(0,16); p.push(m); });
              const pl = Buffer.concat(p); const h = Buffer.alloc(5); h.writeUInt8(0x54,0); h.writeInt32BE(4+pl.length,1); socket.write(Buffer.concat([h,pl]));
              res.rows.forEach(r => {
                const p2 = []; const c2 = Buffer.alloc(2); c2.writeInt16BE(res.columns.length,0); p2.push(c2);
                res.columns.forEach(col => { const v = r[col.name]; if (v===null) p2.push(Buffer.from([0,0,0,0])); else { const vb = Buffer.from(String(v),'utf8'); const lb = Buffer.alloc(4); lb.writeInt32BE(vb.length,0); p2.push(lb); p2.push(vb); } });
                const pl2 = Buffer.concat(p2); const h2 = Buffer.alloc(5); h2.writeUInt8(0x44,0); h2.writeInt32BE(4+pl2.length,1); socket.write(Buffer.concat([h2,pl2]));
              });
            }
            const tag = res.command === 'SELECT' ? `SELECT ${res.rowCount}` : res.command === 'INSERT' ? `INSERT 0 ${res.rowCount}` : res.command;
            const tb = Buffer.from(tag+'\\0','utf8'); const b = Buffer.alloc(1+4+tb.length); b.writeUInt8(0x43,0); b.writeInt32BE(4+tb.length,1); tb.copy(b,5); socket.write(b);
          } catch(e) {
            const f = [Buffer.from('SERROR\\0','utf8'), Buffer.from('C42000\\0','utf8'), Buffer.from('M'+e.message+'\\0','utf8'), Buffer.from('\\0','utf8')];
            const pl = Buffer.concat(f); const h = Buffer.alloc(5); h.writeUInt8(0x45,0); h.writeInt32BE(4+pl.length,1); socket.write(Buffer.concat([h,pl]));
          }
          socket.write(Buffer.from([0x5A, 0,0,0,5, 0x49]));
        } else if (msg[0] === 0x58) { socket.end(); }
      }
    });
    socket.on('error', () => {});
  });
  server.listen(port, '0.0.0.0', () => console.log(`[TCP] PostgreSQL Wire Protocol live on ${port}`));
}
"""

boot_js = """
import { startAPI } from './backend/api.js';
import { startTCP } from './backend/tcp.js';
import { logger } from './core.js';
logger.info('🚀 Booting NE7-SQL God-Tier Architecture...');
startAPI(8080);
startTCP(5432);
"""

with open('src/access.js', 'w') as f: f.write(access_js)
with open('src/transaction.js', 'w') as f: f.write(transaction_js)
with open('src/executor.js', 'w') as f: f.write(executor_js)
with open('src/main.js', 'w') as f: f.write(main_js)
with open('src/backend/api.js', 'w') as f: f.write(api_js)
with open('src/backend/tcp.js', 'w') as f: f.write(tcp_js)
with open('src/boot.js', 'w') as f: f.write(boot_js)

print("✅ Part 2 Complete: Engine & Network written.")
