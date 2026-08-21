
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
