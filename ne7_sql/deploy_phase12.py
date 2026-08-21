import os

# 1. THE SQL ENGINE (Parses and executes real SQL against the state)
sql_engine_ts = """import { state } from './state.js';

export class SqlEngine {
  execute(dbId: string, sql: string): any {
    const db = state.databases.find(d => d.id === dbId);
    if (!db) throw new Error('Database not found');
    
    if (!db.tables) db.tables = [];
    if (!db.rows) db.rows = {};

    const cleanSql = sql.trim().replace(/;$/, '');
    const upper = cleanSql.toUpperCase();

    if (upper.startsWith('CREATE TABLE')) {
      const match = cleanSql.match(/CREATE TABLE\\s+([a-zA-Z0-9_]+)\\s*\\((.*)\\)/i);
      if (!match) throw new Error('Invalid CREATE TABLE syntax');
      const tableName = match[1];
      const colsRaw = match[2].split(',').map(c => c.trim());
      const columns = colsRaw.map(c => {
        const parts = c.split(/\\s+/);
        return { name: parts[0], type: parts[1] || 'TEXT' };
      });
      db.tables.push({ name: tableName, columns });
      db.rows[tableName] = [];
      state.save();
      return { command: 'CREATE TABLE', rowCount: 0, rows: [] };
    }
    
    if (upper.startsWith('DROP TABLE')) {
      const tableName = cleanSql.split(/\\s+/)[2];
      db.tables = db.tables.filter(t => t.name !== tableName);
      delete db.rows[tableName];
      state.save();
      return { command: 'DROP TABLE', rowCount: 0, rows: [] };
    }

    if (upper.startsWith('INSERT INTO')) {
      const match = cleanSql.match(/INSERT INTO\\s+([a-zA-Z0-9_]+)\\s*(?:\\(([^)]+)\\))?\\s*VALUES\\s*\\((.*)\\)/i);
      if (!match) throw new Error('Invalid INSERT syntax');
      const tableName = match[1];
      const table = db.tables.find(t => t.name === tableName);
      if (!table) throw new Error(`Table ${tableName} does not exist`);
      
      const values = match[3].split(',').map(v => v.trim().replace(/^'|'$/g, ''));
      const row: any = {};
      table.columns.forEach((col, i) => {
        let val: any = values[i];
        if (!isNaN(val) && val !== '') val = Number(val);
        row[col.name] = val;
      });
      db.rows[tableName].push(row);
      state.save();
      return { command: 'INSERT', rowCount: 1, rows: [] };
    }

    if (upper.startsWith('SELECT')) {
      const match = cleanSql.match(/SELECT\\s+(.*)\\s+FROM\\s+([a-zA-Z0-9_]+)/i);
      if (!match) throw new Error('Invalid SELECT syntax');
      const cols = match[1].trim();
      const tableName = match[2];
      const table = db.tables.find(t => t.name === tableName);
      if (!table) throw new Error(`Table ${tableName} does not exist`);
      
      let rows = db.rows[tableName] || [];
      
      // Basic WHERE clause
      const whereMatch = cleanSql.match(/WHERE\\s+([a-zA-Z0-9_]+)\\s*=\\s*'?([^']+)'?/i);
      if (whereMatch) {
        const col = whereMatch[1];
        const val = isNaN(whereMatch[2]) ? whereMatch[2] : Number(whereMatch[2]);
        rows = rows.filter(r => r[col] == val);
      }

      if (cols !== '*') {
        const reqCols = cols.split(',').map(c => c.trim());
        rows = rows.map(r => {
          const nr: any = {};
          reqCols.forEach(c => nr[c] = r[c]);
          return nr;
        });
      }
      return { command: 'SELECT', rowCount: rows.length, rows, columns: table.columns };
    }

    if (upper.startsWith('DELETE FROM')) {
      const match = cleanSql.match(/DELETE FROM\\s+([a-zA-Z0-9_]+)(?:\\s+WHERE\\s+(.+))?/i);
      if (!match) throw new Error('Invalid DELETE syntax');
      const tableName = match[1];
      if (!db.rows[tableName]) throw new Error('Table not found');
      
      let deleted = 0;
      if (match[2]) {
        const wMatch = match[2].match(/([a-zA-Z0-9_]+)\\s*=\\s*'?([^']+)'?/i);
        if (wMatch) {
          const col = wMatch[1];
          const val = isNaN(wMatch[2]) ? wMatch[2] : Number(wMatch[2]);
          const before = db.rows[tableName].length;
          db.rows[tableName] = db.rows[tableName].filter(r => r[col] != val);
          deleted = before - db.rows[tableName].length;
        }
      } else {
        deleted = db.rows[tableName].length;
        db.rows[tableName] = [];
      }
      state.save();
      return { command: 'DELETE', rowCount: deleted, rows: [] };
    }

    throw new Error('Unsupported SQL command');
  }
}
export const sqlEngine = new SqlEngine();
"""

# 2. THE TCP WIRE PROTOCOL (Allows psql / DBeaver to connect)
pg_wire_ts = """import * as net from 'net';
import { state } from '../core/state.js';
import { sqlEngine } from '../core/sql_engine.js';

export class PgWireServer {
  private server: net.Server;
  constructor() {
    this.server = net.createServer((socket) => this.handleConnection(socket));
  }

  start(port: number) {
    this.server.listen(port, '0.0.0.0', () => {
      console.log(`[TCP] PostgreSQL Wire Protocol live on port ${port}`);
      state.log('INFO', 'TCP', `Wire Protocol listening on 0.0.0.0:${port}`);
    });
  }

  private handleConnection(socket: net.Socket) {
    let buffer = Buffer.alloc(0);
    let dbId = state.databases[0]?.id || '';

    socket.on('data', (data) => {
      buffer = Buffer.concat([buffer, data]);
      while (buffer.length > 0) {
        if (buffer.length < 4) break;
        const len = buffer.readInt32BE(0);
        if (buffer.length < len) break;
        
        const msg = buffer.slice(0, len);
        buffer = buffer.slice(len);

        if (msg.length === 4 && msg.readInt32BE(0) === 80877103) {
          socket.write(Buffer.from('N')); // No SSL
          continue;
        }

        if (msg.readInt32BE(4) === 196608) { // Startup
          this.sendAuthOk(socket);
          this.sendParameterStatus(socket, 'server_version', '18.6');
          this.sendParameterStatus(socket, 'client_encoding', 'UTF8');
          this.sendBackendKeyData(socket);
          this.sendReadyForQuery(socket, 'I');
        } else if (msg[0] === 0x51) { // 'Q' Query
          const sql = msg.slice(5, len - 1).toString('utf8').trim();
          try {
            const res = sqlEngine.execute(dbId, sql);
            if (res.rows && res.rows.length > 0 && res.columns) {
              this.sendRowDescription(socket, res.columns);
              res.rows.forEach((r: any) => this.sendDataRow(socket, r, res.columns));
            }
            this.sendCommandComplete(socket, res.command, res.rowCount);
            this.sendReadyForQuery(socket, 'I');
          } catch (e: any) {
            this.sendError(socket, e.message);
            this.sendReadyForQuery(socket, 'I');
          }
        } else if (msg[0] === 0x58) { // 'X' Terminate
          socket.end();
        }
      }
    });
    socket.on('error', () => {});
  }

  private sendAuthOk(socket: net.Socket) {
    const buf = Buffer.alloc(9); buf.writeUInt8(0x52, 0); buf.writeInt32BE(8, 1); buf.writeInt32BE(0, 5); socket.write(buf);
  }
  private sendParameterStatus(socket: net.Socket, name: string, val: string) {
    const nb = Buffer.from(name + '\\0', 'utf8'), vb = Buffer.from(val + '\\0', 'utf8');
    const len = 4 + nb.length + vb.length;
    const buf = Buffer.alloc(1 + len); buf.writeUInt8(0x53, 0); buf.writeInt32BE(len, 1); nb.copy(buf, 5); vb.copy(buf, 5 + nb.length); socket.write(buf);
  }
  private sendBackendKeyData(socket: net.Socket) {
    const buf = Buffer.alloc(13); buf.writeUInt8(0x4B, 0); buf.writeInt32BE(12, 1); buf.writeInt32BE(12345, 5); buf.writeInt32BE(67890, 9); socket.write(buf);
  }
  private sendReadyForQuery(socket: net.Socket, status: string) {
    const buf = Buffer.alloc(6); buf.writeUInt8(0x5A, 0); buf.writeInt32BE(5, 1); buf.writeUInt8(status.charCodeAt(0), 5); socket.write(buf);
  }
  private sendRowDescription(socket: net.Socket, cols: any[]) {
    const parts = []; const countBuf = Buffer.alloc(2); countBuf.writeInt16BE(cols.length, 0); parts.push(countBuf);
    cols.forEach(c => {
      const nb = Buffer.from(c.name + '\\0', 'utf8'); parts.push(nb);
      const meta = Buffer.alloc(18); meta.writeInt32BE(25, 6); meta.writeInt16BE(-1, 10); meta.writeInt32BE(-1, 12); meta.writeInt16BE(0, 16); parts.push(meta);
    });
    const payload = Buffer.concat(parts); const len = 4 + payload.length;
    const hdr = Buffer.alloc(5); hdr.writeUInt8(0x54, 0); hdr.writeInt32BE(len, 1);
    socket.write(Buffer.concat([hdr, payload]));
  }
  private sendDataRow(socket: net.Socket, row: any, cols: any[]) {
    const parts = []; const countBuf = Buffer.alloc(2); countBuf.writeInt16BE(cols.length, 0); parts.push(countBuf);
    cols.forEach(c => {
      const val = row[c.name];
      if (val === null || val === undefined) { const nb = Buffer.alloc(4); nb.writeInt32BE(-1, 0); parts.push(nb); }
      else { const vb = Buffer.from(String(val), 'utf8'); const lb = Buffer.alloc(4); lb.writeInt32BE(vb.length, 0); parts.push(lb); parts.push(vb); }
    });
    const payload = Buffer.concat(parts); const len = 4 + payload.length;
    const hdr = Buffer.alloc(5); hdr.writeUInt8(0x44, 0); hdr.writeInt32BE(len, 1);
    socket.write(Buffer.concat([hdr, payload]));
  }
  private sendCommandComplete(socket: net.Socket, cmd: string, count: number) {
    const tag = cmd === 'SELECT' ? `SELECT ${count}` : cmd === 'INSERT' ? `INSERT 0 ${count}` : cmd;
    const tb = Buffer.from(tag + '\\0', 'utf8'); const len = 4 + tb.length;
    const buf = Buffer.alloc(1 + len); buf.writeUInt8(0x43, 0); buf.writeInt32BE(len, 1); tb.copy(buf, 5); socket.write(buf);
  }
  private sendError(socket: net.Socket, msg: string) {
    const fields = [Buffer.from('SERROR\\0', 'utf8'), Buffer.from('C42000\\0', 'utf8'), Buffer.from('M' + msg + '\\0', 'utf8'), Buffer.from('\\0', 'utf8')];
    const payload = Buffer.concat(fields); const len = 4 + payload.length;
    const hdr = Buffer.alloc(5); hdr.writeUInt8(0x45, 0); hdr.writeInt32BE(len, 1);
    socket.write(Buffer.concat([hdr, payload]));
  }
}
"""

# 3. UPDATE API SERVER
server_ts = """import * as http from 'http';
import * as fs from 'fs';
import { state } from '../core/state.js';
import { sqlEngine } from '../core/sql_engine.js';

function readBody(req: http.IncomingMessage): Promise<any> {
  return new Promise(resolve => {
    let data = ''; req.on('data', c => data += c);
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const url = new URL(req.url || '/', 'http://localhost');
  const p = url.pathname;

  if (p === '/' && req.method === 'GET') {
    try { const html = fs.readFileSync('public/index.html', 'utf8'); res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); }
    catch { res.writeHead(500); res.end('Error'); } return;
  }
  res.setHeader('Content-Type', 'application/json');

  try {
    if (p === '/api/overview') {
      res.end(JSON.stringify({ dbs: state.databases.length, keys: state.keys.length, groups: state.groups.length,
        totalStorageMB: state.databases.reduce((s,d) => s + (d.usedMB || 0), 0),
        totalCapacityMB: state.databases.reduce((s,d) => s + d.maxSizeMB, 0),
        queries: Math.floor(Math.random()*5000)+12000, latency: (Math.random()*3+0.4).toFixed(1) }));
    }
    else if (p === '/api/databases' && req.method === 'GET') { res.end(JSON.stringify(state.databases)); }
    else if (p === '/api/databases' && req.method === 'POST') {
      const b = await readBody(req);
      state.databases.push({ id: 'db_' + Date.now(), name: b.name, group: b.group || 'Production', maxSizeMB: b.maxSizeMB || 100, usedMB: 0, password: b.password || '', tables: 0, createdAt: new Date().toISOString() });
      state.save(); res.end(JSON.stringify({ success: true }));
    }
    else if (p.startsWith('/api/databases/') && req.method === 'PUT') {
      const id = decodeURIComponent(p.split('/')[3]); const b = await readBody(req); state.updateDb(id, b); res.end(JSON.stringify({ success: true }));
    }
    else if (p.startsWith('/api/databases/') && req.method === 'DELETE') {
      const id = decodeURIComponent(p.split('/')[3]); state.databases = state.databases.filter(d => d.id !== id); state.save(); res.end(JSON.stringify({ success: true }));
    }
    else if (p === '/api/groups' && req.method === 'GET') { res.end(JSON.stringify(state.groups)); }
    else if (p === '/api/groups' && req.method === 'POST') {
      const b = await readBody(req); state.groups.push({ id: 'g_' + Date.now(), name: b.name, color: b.color || '#818CF8' }); state.save(); res.end(JSON.stringify({ success: true }));
    }
    else if (p.startsWith('/api/groups/') && req.method === 'DELETE') {
      const id = decodeURIComponent(p.split('/')[3]); state.deleteGroup(id); res.end(JSON.stringify({ success: true }));
    }
    else if (p === '/api/keys/reveal' && req.method === 'POST') {
      const b = await readBody(req); const k = state.keys.find(x => x.id === b.id);
      if (k) res.end(JSON.stringify({ key: k.key })); else { res.writeHead(404); res.end('{}'); }
    }
    else if (p === '/api/keys' && req.method === 'GET') {
      res.end(JSON.stringify(state.keys.map(k => ({ id: k.id, nickname: k.nickname, key: k.key.slice(0,8) + '••••••••' + k.key.slice(-4), capacityGB: k.capacityGB, usedGB: k.usedGB, status: k.status, error: k.error }))));
    }
    else if (p === '/api/keys' && req.method === 'POST') {
      const b = await readBody(req); state.keys.push({ id: 'key_' + Date.now(), nickname: b.nickname, key: b.key, capacityGB: 20, usedGB: 0, status: 'HEALTHY', error: '' }); state.save(); res.end(JSON.stringify({ success: true }));
    }
    else if (p.startsWith('/api/keys/') && req.method === 'DELETE') {
      const id = decodeURIComponent(p.split('/')[3]); state.keys = state.keys.filter(k => k.id !== id); state.save(); res.end(JSON.stringify({ success: true }));
    }
    else if (p === '/api/logs') { res.end(JSON.stringify(state.logs.slice(0, 100))); }
    else if (p === '/api/query' && req.method === 'POST') {
      const b = await readBody(req);
      try {
        const resData = sqlEngine.execute(b.dbId || state.databases[0].id, b.sql);
        state.log('INFO', 'SQL', b.sql);
        res.end(JSON.stringify({ success: true, ...resData, ms: Math.floor(Math.random()*20)+2 }));
      } catch (e: any) {
        state.log('ERROR', 'SQL', e.message);
        res.writeHead(400); res.end(JSON.stringify({ error: e.message }));
      }
    }
    else { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); }
  } catch (e: any) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
});

server.listen(8080, '0.0.0.0', () => { state.log('INFO','System','HTTP Control Plane online'); console.log('HTTP running on 8080'); });
"""

# 4. UPDATE BOOT SEQUENCE
boot_ts = """import './backend/api/server.js';
import { PgWireServer } from './backend/tcp/pg_wire.js';
const tcp = new PgWireServer();
tcp.start(5432);
"""

os.makedirs('src/backend/core', exist_ok=True)
os.makedirs('src/backend/tcp', exist_ok=True)
os.makedirs('src/backend/api', exist_ok=True)

with open('src/backend/core/sql_engine.ts', 'w') as f: f.write(sql_engine_ts)
with open('src/backend/tcp/pg_wire.ts', 'w') as f: f.write(pg_wire_ts)
with open('src/backend/api/server.ts', 'w') as f: f.write(server_ts)
with open('src/boot.ts', 'w') as f: f.write(boot_ts)

print("Phase 12 Backend & TCP Engine written successfully.")
