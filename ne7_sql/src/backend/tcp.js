import net from 'net';
import { db } from '../main.js';

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
              res.columns.forEach(col => { p.push(Buffer.from(col.name+'\0','utf8')); const m = Buffer.alloc(18); m.writeInt32BE(25,6); m.writeInt16BE(-1,10); m.writeInt32BE(-1,12); m.writeInt16BE(0,16); p.push(m); });
              const pl = Buffer.concat(p); const h = Buffer.alloc(5); h.writeUInt8(0x54,0); h.writeInt32BE(4+pl.length,1); socket.write(Buffer.concat([h,pl]));
              res.rows.forEach(r => {
                const p2 = []; const c2 = Buffer.alloc(2); c2.writeInt16BE(res.columns.length,0); p2.push(c2);
                res.columns.forEach(col => { const v = r[col.name]; if (v===null) p2.push(Buffer.from([0,0,0,0])); else { const vb = Buffer.from(String(v),'utf8'); const lb = Buffer.alloc(4); lb.writeInt32BE(vb.length,0); p2.push(lb); p2.push(vb); } });
                const pl2 = Buffer.concat(p2); const h2 = Buffer.alloc(5); h2.writeUInt8(0x44,0); h2.writeInt32BE(4+pl2.length,1); socket.write(Buffer.concat([h2,pl2]));
              });
            }
            const tag = res.command === 'SELECT' ? `SELECT ${res.rowCount}` : res.command === 'INSERT' ? `INSERT 0 ${res.rowCount}` : res.command;
            const tb = Buffer.from(tag+'\0','utf8'); const b = Buffer.alloc(1+4+tb.length); b.writeUInt8(0x43,0); b.writeInt32BE(4+tb.length,1); tb.copy(b,5); socket.write(b);
          } catch(e) {
            const f = [Buffer.from('SERROR\0','utf8'), Buffer.from('C42000\0','utf8'), Buffer.from('M'+e.message+'\0','utf8'), Buffer.from('\0','utf8')];
            const pl = Buffer.concat(f); const h = Buffer.alloc(5); h.writeUInt8(0x45,0); h.writeInt32BE(4+pl.length,1); socket.write(Buffer.concat([h,pl]));
          }
          socket.write(Buffer.from([0x5A, 0,0,0,5, 0x49]));
        } else if (msg[0] === 0x58) { socket.end(); }
      }
    });
    socket.on('error', () => {});
  });
  server.listen(port, '0.0.0.0', () => console.log('[TCP] PostgreSQL Wire Protocol live on ' + port));
}
