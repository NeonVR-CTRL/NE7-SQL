import os

# 1. CORE (Constants, Logger, Utils, Types)
core_js = """
export const BLCKSZ = 8192;
export const MAXALIGN = 8;
export const SizeOfPageHeaderData = 24;
export const HEAP_XMAX_COMMITTED = 0x0004;
export const InvalidTransactionId = 0;
export const FirstNormalTransactionId = 3;
export const MaxTransactionId = 4294967295;

export const logger = {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
  debug: (msg, meta) => {}, // Suppressed for performance
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || '')
};

export function crc32c(data) {
  let crc = 0xFFFFFFFF;
  const table = getCRC32CTable();
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
let crc32cTable = null;
function getCRC32CTable() {
  if (crc32cTable) return crc32cTable;
  crc32cTable = new Uint32Array(256);
  const p = 0x82F63B78;
  for (let i = 0; i < 256; i++) { let c = i; for (let j = 0; j < 8; j++) c = (c & 1) ? (c >>> 1) ^ p : c >>> 1; crc32cTable[i] = c >>> 0; }
  return crc32cTable;
}
export function MAXALIGN(len) { return ((len) + (MAXALIGN - 1)) & ~(MAXALIGN - 1); }
"""

# 2. BUFFER (ItemPointer, PageHeader, PageOps, SharedBufferPool)
buffer_js = """
import { BLCKSZ, SizeOfPageHeaderData, MAXALIGN, logger } from './core.js';

export class ItemId {
  constructor(offset = 0, len = 0) { this.offset = offset; this.len = len; this.used = offset > 0; }
  isValid() { return this.used && this.offset > 0 && this.len > 0; }
  static fromBytes(bytes) { const dv = new DataView(bytes.buffer, bytes.byteOffset, 4); return new ItemId(dv.getUint16(0, true), dv.getUint16(2, true)); }
  toBytes() { const b = new Uint8Array(4); const dv = new DataView(b.buffer); dv.setUint16(0, this.offset, true); dv.setUint16(2, this.len, true); return b; }
}
export class ItemPointer {
  constructor(blockNumber = 0, offsetNumber = 0) { this.blockNumber = blockNumber; this.offsetNumber = offsetNumber; }
  toString() { return `(${this.blockNumber},${this.offsetNumber})`; }
}

export class PageHeader {
  constructor(view) { this.view = view; }
  init() {
    this.view.fill(0);
    const dv = new DataView(this.view.buffer, 0, BLCKSZ);
    dv.setUint16(12, SizeOfPageHeaderData, true);
    dv.setUint16(14, BLCKSZ, true);
    dv.setUint16(16, BLCKSZ, true);
    dv.setUint16(18, 4, true);
    dv.setUint16(20, BLCKSZ, true);
  }
  getLower() { return new DataView(this.view.buffer, 0, BLCKSZ).getUint16(12, true); }
  setLower(v) { new DataView(this.view.buffer, 0, BLCKSZ).setUint16(12, v, true); }
  getUpper() { return new DataView(this.view.buffer, 0, BLCKSZ).getUint16(14, true); }
  setUpper(v) { new DataView(this.view.buffer, 0, BLCKSZ).setUint16(14, v, true); }
  getFreeSpace() { return this.getUpper() - this.getLower(); }
}

export class PageOperations {
  constructor(view) { this.view = view; this.header = new PageHeader(view); }
  canFit(itemSize) { return this.header.getFreeSpace() >= MAXALIGN(itemSize + 4); }
  addItem(data) {
    const itemSize = data.byteLength || data.length;
    if (!this.canFit(itemSize)) return -1;
    const lower = this.header.getLower(); const upper = this.header.getUpper();
    const itemOffset = upper - itemSize;
    this.view.set(data, itemOffset);
    const itemIdIndex = Math.floor((lower - SizeOfPageHeaderData) / 4) + 1;
    const itemIdOffset = SizeOfPageHeaderData + ((itemIdIndex - 1) * 4);
    this.view.set(new ItemId(itemOffset, itemSize).toBytes(), itemIdOffset);
    this.header.setLower(lower + 4); this.header.setUpper(itemOffset);
    return itemIdIndex;
  }
  getItem(itemIdIndex) {
    const itemIdOffset = SizeOfPageHeaderData + ((itemIdIndex - 1) * 4);
    const itemId = ItemId.fromBytes(this.view.slice(itemIdOffset, itemIdOffset + 4));
    if (!itemId.isValid()) return null;
    return { itemId, data: this.view.slice(itemId.offset, itemId.offset + itemId.len), offset: itemId.offset };
  }
  getNumItems() { return Math.floor((this.header.getLower() - SizeOfPageHeaderData) / 4); }
  deleteItem(itemIdIndex) {
    const itemIdOffset = SizeOfPageHeaderData + ((itemIdIndex - 1) * 4);
    this.view.set(new ItemId(0, 0).toBytes(), itemIdOffset);
  }
}

export class BufferDesc {
  constructor(blockId) { this.blockId = blockId; this.frame = new ArrayBuffer(BLCKSZ); this.view = new Uint8Array(this.frame); this.pinCount = 0; this.dirty = false; this.usageCount = 0; this.relOid = null; this.blockNum = -1; }
  pin() { this.pinCount++; }
  unpin() { if (this.pinCount > 0) this.pinCount--; }
  incrementUsage() { this.usageCount = Math.min(this.usageCount + 1, 255); }
  markDirty() { this.dirty = true; }
  markClean() { this.dirty = false; }
}

export class SharedBufferPool {
  constructor(size = 128) {
    this.buffers = new Array(size); this.freeList = []; this.hashMap = new Map(); this.size = size;
    for (let i = 0; i < size; i++) { this.buffers[i] = new BufferDesc(i); this.freeList.push(i); }
    logger.info(`Shared buffer pool initialized (${size} buffers)`);
  }
  findBuffer(relOid, blockNum) {
    const index = this.hashMap.get(`${relOid}:${blockNum}`);
    if (index !== undefined) { this.buffers[index].incrementUsage(); return this.buffers[index]; }
    return null;
  }
  async getBuffer(relOid, blockNum, storageMgr) {
    let buffer = this.findBuffer(relOid, blockNum);
    if (buffer) { buffer.pin(); return buffer; }
    let bufferIndex = this.freeList.length > 0 ? this.freeList.pop() : this.findVictim();
    if (bufferIndex === -1) throw new Error('No free buffers');
    const victim = this.buffers[bufferIndex];
    if (victim.dirty) await this.flushBuffer(victim, storageMgr);
    if (victim.relOid !== null) this.hashMap.delete(`${victim.relOid}:${victim.blockNum}`);
    buffer = this.buffers[bufferIndex];
    buffer.relOid = relOid; buffer.blockNum = blockNum; buffer.pinCount = 1; buffer.dirty = false; buffer.usageCount = 1;
    this.hashMap.set(`${relOid}:${blockNum}`, bufferIndex);
    const data = await storageMgr.readBlock(relOid, blockNum);
    if (data) buffer.view.set(data); else new PageHeader(buffer.view).init();
    return buffer;
  }
  findVictim() {
    let start = Math.floor(Math.random() * this.size);
    for (let i = 0; i < this.size; i++) {
      const idx = (start + i) % this.size; const b = this.buffers[idx];
      if (b.pinCount === 0) { if (b.usageCount === 0) return idx; b.usageCount--; }
    }
    return -1;
  }
  async flushBuffer(buffer, storageMgr) {
    if (buffer.dirty && buffer.relOid !== null) {
      await storageMgr.writeBlock(buffer.relOid, buffer.blockNum, buffer.view);
      buffer.markClean();
    }
  }
}
let globalBufferPool = null;
export function getBufferPool() { if (!globalBufferPool) globalBufferPool = new SharedBufferPool(256); return globalBufferPool; }
"""

# 3. STORAGE (DrimeSMGR + StorageRouter + WAL)
storage_js = """
import { BLCKSZ, crc32c, logger } from './core.js';

export class DrimeStorageManager {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey; this.baseUrl = baseUrl; this.openFiles = new Map(); this.nextFd = 100;
  }
  async smgrcreate(relnode) { return true; }
  async smgropen(relnode) { const fd = this.nextFd++; this.openFiles.set(fd, { relnode, blocks: [] }); return fd; }
  async smgrread(fd, blockNum) {
    const info = this.openFiles.get(fd); if (!info) throw new Error('Invalid FD');
    const key = `${info.relnode}/${blockNum}`;
    try {
      const r = await fetch(`${this.baseUrl}/objects/${key}`, { headers: { 'Authorization': `Bearer ${this.apiKey}` } });
      if (r.ok) { const buf = Buffer.from(await r.arrayBuffer()); if (buf.length === BLCKSZ) return buf; }
    } catch(e) {}
    return null;
  }
  async smgrwrite(fd, blockNum, data) {
    const info = this.openFiles.get(fd); if (!info) throw new Error('Invalid FD');
    const checksum = crc32c(data.slice(4)); data.writeUInt32LE(checksum, 0);
    const key = `${info.relnode}/${blockNum}`;
    try {
      await fetch(`${this.baseUrl}/objects/${key}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/octet-stream' }, body: data });
    } catch(e) { logger.warn('Drime push failed, cached locally'); }
    if (blockNum >= info.blocks.length) info.blocks.length = blockNum + 1;
    info.blocks[blockNum] = data;
    return true;
  }
}

export class StorageRouter {
  constructor() { this.keyPool = []; this.memoryStore = new Map(); this.relationSizes = new Map(); }
  addApiKey(apiKey, endpoint, capacityGB = 20) { this.keyPool.push({ apiKey, endpoint, capacity: capacityGB * 1024**3, used: 0 }); }
  route() { return this.keyPool.reduce((a, b) => a.used <= b.used ? a : b); }
  async readBlock(relOid, blockNum) {
    const pageId = `${relOid}:${blockNum}`;
    if (this.memoryStore.has(pageId)) return this.memoryStore.get(pageId);
    const shard = this.route();
    try {
      const r = await fetch(`${shard.endpoint}/objects/${pageId}`, { headers: { 'Authorization': `Bearer ${shard.apiKey}` } });
      if (r.ok) { const d = new Uint8Array(await r.arrayBuffer()); this.memoryStore.set(pageId, d); return d; }
    } catch(e) {}
    return null;
  }
  async writeBlock(relOid, blockNum, data) {
    const pageId = `${relOid}:${blockNum}`; const shard = this.route();
    this.memoryStore.set(pageId, new Uint8Array(data));
    const max = this.relationSizes.get(relOid) || 0; if (blockNum >= max) this.relationSizes.set(relOid, blockNum + 1);
    shard.used += data.byteLength;
    try { await fetch(`${shard.endpoint}/objects/${pageId}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${shard.apiKey}`, 'Content-Type': 'application/octet-stream' }, body: data }); } catch(e) {}
    return true;
  }
  async createRelation(relOid) { this.relationSizes.set(relOid, 0); return true; }
}
"""

# 4. PARSER (Lexer + AST)
parser_js = """
export class Token { constructor(type, value, pos) { this.type = type; this.value = value; this.position = pos; } }
export class Lexer {
  constructor(sql) { this.sql = sql; this.pos = 0; this.tokens = []; }
  tokenize() {
    while (this.pos < this.sql.length) {
      this.skipWhitespace(); if (this.pos >= this.sql.length) break;
      const c = this.sql[this.pos];
      if (c === "'") this.readString();
      else if (/[a-zA-Z_]/.test(c)) this.readIdentifier();
      else if (/[0-9]/.test(c)) this.readNumber();
      else if (/[(),=<>!+\\-*/%;&|]/.test(c)) this.readOperator();
      else if (c === '.') { this.tokens.push(new Token('DOT', '.', this.pos)); this.pos++; }
      else if (c === '*') { this.tokens.push(new Token('STAR', '*', this.pos)); this.pos++; }
      else this.pos++;
    }
    return this.tokens;
  }
  skipWhitespace() { while (this.pos < this.sql.length && /\\s/.test(this.sql[this.pos])) this.pos++; }
  readString() {
    const start = this.pos; this.pos++; let v = '';
    while (this.pos < this.sql.length && this.sql[this.pos] !== "'") {
      if (this.sql[this.pos] === "'" && this.sql[this.pos+1] === "'") { v += "'"; this.pos += 2; } else { v += this.sql[this.pos]; this.pos++; }
    }
    this.pos++; this.tokens.push(new Token('STRING', v, start));
  }
  readIdentifier() {
    const start = this.pos; let v = '';
    while (this.pos < this.sql.length && /[a-zA-Z0-9_]/.test(this.sql[this.pos])) { v += this.sql[this.pos]; this.pos++; }
    const up = v.toUpperCase();
    const kw = ['SELECT','INSERT','UPDATE','DELETE','FROM','WHERE','INTO','VALUES','SET','CREATE','TABLE','DROP','INDEX','ON','AND','OR','NOT','NULL','IS','LIKE','IN','BETWEEN','ORDER','BY','ASC','DESC','LIMIT','OFFSET','JOIN','INNER','LEFT','RIGHT','OUTER','AS','DISTINCT','GROUP','HAVING'];
    this.tokens.push(new Token(kw.includes(up) ? up : 'IDENTIFIER', v, start));
  }
  readNumber() {
    const start = this.pos; let v = ''; let dot = false;
    while (this.pos < this.sql.length && /[0-9.]/.test(this.sql[this.pos])) { if (this.sql[this.pos]==='.') { if(dot) break; dot=true; } v += this.sql[this.pos]; this.pos++; }
    this.tokens.push(new Token(dot ? 'FLOAT' : 'INTEGER', v, start));
  }
  readOperator() {
    const start = this.pos; let v = this.sql[this.pos];
    if (this.pos+1 < this.sql.length) { const n = this.sql[this.pos+1]; if ((v==='='&&n==='>')||(v==='<'&&n==='=')||(v==='>'&&n==='=')||(v==='!'&&n==='=')||(v==='|'&&n==='|')||(v==='&'&&n==='&')) { v+=n; this.pos++; } }
    this.pos++; this.tokens.push(new Token(v.length===1 && /[(),;]/.test(v) ? v : 'OPERATOR', v, start));
  }
}
export class ASTNode { constructor(type, children={}, value=null) { this.type = type; this.children = children; this.value = value; } }
export class SQLParser {
  constructor(tokens) { this.tokens = tokens; this.pos = 0; }
  parse() {
    if (!this.tokens.length) throw new Error('Empty SQL');
    const t = this.tokens[0].type;
    if (t==='SELECT') return this.parseSelect(); if (t==='INSERT') return this.parseInsert();
    if (t==='UPDATE') return this.parseUpdate(); if (t==='DELETE') return this.parseDelete();
    if (t==='CREATE') return this.parseCreate(); if (t==='DROP') return this.parseDrop();
    throw new Error('Unsupported: ' + t);
  }
  current() { return this.tokens[this.pos]; }
  consume(t) { const tok = this.current(); if (!tok || tok.type !== t) throw new Error(`Expected ${t}`); this.pos++; return tok; }
  match(...types) { const t = this.current(); return t && types.includes(t.type); }
  parseSelect() {
    this.consume('SELECT'); const dist = this.match('DISTINCT'); if(dist) this.consume('DISTINCT');
    const cols = this.parseSelectList(); this.consume('FROM'); const table = this.parseTableRef();
    let where = null; if (this.match('WHERE')) { this.consume('WHERE'); where = this.parseExpr(); }
    let orderBy = null; if (this.match('ORDER')) { this.consume('ORDER'); this.consume('BY'); orderBy = this.parseOrderBy(); }
    let limit = null; if (this.match('LIMIT')) { this.consume('LIMIT'); limit = this.current().value; this.pos++; }
    return new ASTNode('SELECT', { distinct: dist, columns: cols, table, where, orderBy, limit });
  }
  parseSelectList() {
    const cols = []; if (this.match('STAR')) { this.consume('STAR'); cols.push({type:'star'}); return cols; }
    cols.push(this.parseColRef()); while (this.match(',')) { this.consume(','); cols.push(this.parseColRef()); } return cols;
  }
  parseColRef() { const t = this.current().value; this.pos++; if (this.match('DOT')) { this.consume('DOT'); const c = this.current().value; this.pos++; return {type:'column', table:t, column:c}; } return {type:'column', column:t}; }
  parseTableRef() { const n = this.current().value; this.pos++; let a = null; if (this.match('AS')) { this.consume('AS'); a = this.current().value; this.pos++; } else if (this.match('IDENTIFIER')) { a = this.current().value; this.pos++; } return {name:n, alias:a}; }
  parseExpr() {
    let left = this.parsePrimary();
    while (this.match('OPERATOR','AND','OR','LIKE','IN','BETWEEN','IS')) {
      const op = this.current().value || this.current().type; this.pos++;
      if (op.toUpperCase()==='IS') { if(this.match('NOT')){this.consume('NOT');this.consume('NULL');left=new ASTNode('IS_NOT_NULL',{left});}else{this.consume('NULL');left=new ASTNode('IS_NULL',{left});} }
      else if (op.toUpperCase()==='IN') { this.consume('('); const v=this.parseValList(); this.consume(')'); left=new ASTNode('IN',{left,values:v}); }
      else if (op.toUpperCase()==='BETWEEN') { const l=this.parsePrimary(); this.consume('AND'); const h=this.parsePrimary(); left=new ASTNode('BETWEEN',{left,low:l,high:h}); }
      else { const r = this.parsePrimary(); left = new ASTNode('BINARY_OP', {left, right}, op); }
    }
    return left;
  }
  parsePrimary() {
    if (this.match('STRING')) { const v = this.current().value; this.pos++; return new ASTNode('LITERAL', {}, v); }
    if (this.match('INTEGER','FLOAT')) { const v = this.current().value; this.pos++; return new ASTNode('LITERAL', {}, parseFloat(v)); }
    if (this.match('NULL')) { this.consume('NULL'); return new ASTNode('NULL', {}); }
    return this.parseColRef();
  }
  parseValList() { const v=[]; v.push(this.parsePrimary()); while(this.match(',')){this.consume(',');v.push(this.parsePrimary());} return v; }
  parseOrderBy() { const i=[]; i.push(this.parseOrderItem()); while(this.match(',')){this.consume(',');i.push(this.parseOrderItem());} return i; }
  parseOrderItem() { const c=this.parseColRef(); let d='ASC'; if(this.match('ASC')){this.consume('ASC');d='ASC';}else if(this.match('DESC')){this.consume('DESC');d='DESC';} return {column:c, direction:d}; }
  parseInsert() { this.consume('INSERT'); this.consume('INTO'); const t=this.current().value; this.pos++; let c=[]; if(this.match('(')){this.consume('(');c=this.parseColNames();this.consume(')');} this.consume('VALUES'); this.consume('('); const v=this.parseValList(); this.consume(')'); return new ASTNode('INSERT',{table:t,columns:c,values:v}); }
  parseColNames() { const c=[]; c.push(this.current().value); this.pos++; while(this.match(',')){this.consume(',');c.push(this.current().value);this.pos++;} return c; }
  parseUpdate() { this.consume('UPDATE'); const t=this.current().value; this.pos++; this.consume('SET'); const a=this.parseAssignments(); let w=null; if(this.match('WHERE')){this.consume('WHERE');w=this.parseExpr();} return new ASTNode('UPDATE',{table:t,assignments:a,where:w}); }
  parseAssignments() { const a=[]; a.push(this.parseAssign()); while(this.match(',')){this.consume(',');a.push(this.parseAssign());} return a; }
  parseAssign() { const c=this.current().value; this.pos++; this.consume('OPERATOR'); const v=this.parsePrimary(); return {column:c,value:v}; }
  parseDelete() { this.consume('DELETE'); this.consume('FROM'); const t=this.current().value; this.pos++; let w=null; if(this.match('WHERE')){this.consume('WHERE');w=this.parseExpr();} return new ASTNode('DELETE',{table:t,where:w}); }
  parseCreate() { this.consume('CREATE'); if(this.match('TABLE')) return this.parseCreateTable(); if(this.match('INDEX')) return this.parseCreateIndex(); throw new Error('Expected TABLE/INDEX'); }
  parseCreateTable() { this.consume('TABLE'); const n=this.current().value; this.pos++; this.consume('('); const c=this.parseColDefs(); this.consume(')'); return new ASTNode('CREATE_TABLE',{name:n,columns:c}); }
  parseColDefs() { const c=[]; c.push(this.parseColDef()); while(this.match(',')){this.consume(',');c.push(this.parseColDef());} return c; }
  parseColDef() { const n=this.current().value; this.pos++; const t=this.current().value.toUpperCase(); this.pos++; const con=[]; while(this.match('NOT','NULL','PRIMARY','KEY','UNIQUE')){if(this.match('NOT')){this.consume('NOT');this.consume('NULL');con.push('NOT NULL');}else if(this.match('PRIMARY')){this.consume('PRIMARY');this.consume('KEY');con.push('PK');}else if(this.match('UNIQUE')){this.consume('UNIQUE');con.push('UQ');}} return {name:n,type:t,constraints:con}; }
  parseCreateIndex() { this.consume('INDEX'); const n=this.current().value; this.pos++; this.consume('ON'); const t=this.current().value; this.pos++; this.consume('('); const c=this.parseColNames(); this.consume(')'); return new ASTNode('CREATE_INDEX',{indexName:n,tableName:t,columns:c}); }
  parseDrop() { this.consume('DROP'); let t; if(this.match('TABLE')){this.consume('TABLE');t='TABLE';}else if(this.match('INDEX')){this.consume('INDEX');t='INDEX';}else throw new Error('Expected TABLE/INDEX'); const n=this.current().value; this.pos++; return new ASTNode('DROP',{type:t,name:n}); }
}
export function parseSQL(sql) { return new SQLParser(new Lexer(sql).tokenize()).parse(); }
"""

os.makedirs("src", exist_ok=True)
with open('src/core.js', 'w') as f: f.write(core_js)
with open('src/buffer.js', 'w') as f: f.write(buffer_js)
with open('src/storage.js', 'w') as f: f.write(storage_js)
with open('src/parser.js', 'w') as f: f.write(parser_js)
print("✅ Part 1 Complete: Core, Buffer Pool, Drime SMGR, AST Parser written.")
