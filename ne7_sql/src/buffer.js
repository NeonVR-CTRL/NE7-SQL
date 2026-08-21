
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
