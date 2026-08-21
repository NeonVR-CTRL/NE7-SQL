
import { PageHeader, PageOperations, ItemId, ItemPointer, getBufferPool } from './buffer.js';
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
