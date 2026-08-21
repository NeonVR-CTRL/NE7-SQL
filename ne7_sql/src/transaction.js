
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
