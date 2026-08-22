import { parseSQL } from '../parser/parser.js';
import { planQuery } from '../planner/planner.js';
import { Executor } from '../executor/executor.js';

export class WireBrain {
  constructor({ smgr, onSend, defaultTenant }) {
    this.smgr = smgr;
    this.onSend = onSend;
    this.tenant = defaultTenant || 'phase_c_test';
    this.buf = Buffer.alloc(0);
    this.handshake = false;
  }

  send(b){ this.onSend(b); }

  feed(chunk){
    this.buf = Buffer.concat([this.buf, Buffer.from(chunk)]);
    while (this.buf.length >= 4) {
      if (!this.handshake) {
        const len = this.buf.readInt32BE(0);
        if (this.buf.length < len) break;
        const code = this.buf.readInt32BE(4);
        if (len === 8 && code === 80877103) { this.send(Buffer.from('N')); this.buf = this.buf.slice(8); continue; }
        if (code === 196608) { this.parseStartup(this.buf.slice(8, len)); this.sendStartupReply(); this.handshake = true; this.buf = this.buf.slice(len); continue; }
        this.buf = this.buf.slice(len); continue;
      }
      if (this.buf.length < 5) break;
      const type = this.buf[0];
      const mlen = this.buf.readInt32BE(1);
      const total = 1 + mlen;
      if (this.buf.length < total) break;
      const payload = this.buf.slice(5, total);
      this.buf = this.buf.slice(total);
      this.handle(type, payload);
    }
  }

  parseStartup(body){
    let i = 0; const p = {};
    const read = () => { const s = i; while (i < body.length && body[i] !== 0) i++; const v = body.slice(s, i).toString(); i++; return v; };
    while (i < body.length - 1) { const k = read(); if (!k) break; p[k] = read(); }
    if (p.database) this.tenant = p.database;
  }

  sendStartupReply(){
    this.send(Buffer.from([0x52,0,0,0,8,0,0,0,0])); // AuthOk
    const param = (k,v) => { const kb=Buffer.from(k+'\0'), vb=Buffer.from(v+'\0'); const m=Buffer.alloc(5+kb.length+vb.length); m.writeUInt8(0x53,0); m.writeInt32BE(m.length-1,1); kb.copy(m,5); vb.copy(m,5+kb.length); this.send(m); };
    param('server_version','15.0'); param('server_encoding','UTF8'); param('client_encoding','UTF8');
    param('DateStyle','ISO, MDY'); param('TimeZone','UTC'); param('is_superuser','on');
    const k = Buffer.alloc(13); k.writeUInt8(0x4B,0); k.writeInt32BE(12,1); k.writeInt32BE(1,5); k.writeInt32BE(1,9); this.send(k);
    this.send(Buffer.from([0x5A,0,0,0,5,0x49])); // ReadyForQuery
  }

  async handle(type, payload){
    if (type === 0x51) { // Simple Query
      const sql = payload.slice(0, payload.length-1).toString('utf8').trim();
      try {
        const ast = parseSQL(sql);
        const plan = planQuery(ast);
        const exec = new Executor(this.smgr, this.tenant);
        const res = await exec.execute(plan);
        if (res.columns && res.columns.length) {
          // RowDescription
          const p=[]; const c=Buffer.alloc(2); c.writeInt16BE(res.columns.length,0); p.push(c);
          res.columns.forEach(col=>{ p.push(Buffer.from(col.name+'\0')); const m=Buffer.alloc(18); m.writeInt32BE(25,6); p.push(m); });
          const pl=Buffer.concat(p); const h=Buffer.alloc(5); h.writeUInt8(0x54,0); h.writeInt32BE(4+pl.length,1); this.send(Buffer.concat([h,pl]));
          // DataRows
          (res.rows||[]).forEach(r=>{ const p2=[]; const c2=Buffer.alloc(2); c2.writeInt16BE(res.columns.length,0); p2.push(c2);
            res.columns.forEach(col=>{ const v=r[col.name]; const vb=Buffer.from(String(v??'')); const lb=Buffer.alloc(4); lb.writeInt32BE(vb.length,0); p2.push(lb); p2.push(vb); });
            const pl2=Buffer.concat(p2); const h2=Buffer.alloc(5); h2.writeUInt8(0x44,0); h2.writeInt32BE(4+pl2.length,1); this.send(Buffer.concat([h2,pl2])); });
        }
        const tag = res.command==='SELECT' ? `SELECT ${res.rowCount}` : res.command;
        const tb=Buffer.from(tag+'\0'); const b=Buffer.alloc(5+tb.length); b.writeUInt8(0x43,0); b.writeInt32BE(4+tb.length,1); tb.copy(b,5); this.send(b);
      } catch(e){
        const f=[Buffer.from('SERROR\0'),Buffer.from('C42000\0'),Buffer.from('M'+e.message+'\0'),Buffer.from('\0')];
        const pl=Buffer.concat(f); const h=Buffer.alloc(5); h.writeUInt8(0x45,0); h.writeInt32BE(4+pl.length,1); this.send(Buffer.concat([h,pl]));
      }
      this.send(Buffer.from([0x5A,0,0,0,5,0x49]));
    } else if (type === 0x58) { /* terminate */ }
    else { this.send(Buffer.from([0x5A,0,0,0,5,0x49])); }
  }
}
