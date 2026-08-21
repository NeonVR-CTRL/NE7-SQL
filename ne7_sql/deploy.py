import os

state_ts = """import * as fs from 'fs';

export interface LogEntry { id: number; time: string; level: string; module: string; msg: string; }
export interface Database { id: string; name: string; group: string; maxSizeMB: number; usedMB: number; password: string; tables: number; createdAt: string; }
export interface ApiKey { id: string; nickname: string; key: string; capacityGB: number; usedGB: number; status: string; error: string; }
export interface Group { id: string; name: string; color: string; }

const PRIMARY_DRIME_KEY = '54148|jg0i3xkpkDJeRANumhJqwO8AIFy8OM0iirtvw8Fi96d6a13d';

class State {
  logs: LogEntry[] = [];
  databases: Database[] = [];
  keys: ApiKey[] = [];
  groups: Group[] = [
    { id: 'g1', name: 'Production', color: '#34D399' },
    { id: 'g2', name: 'Staging', color: '#FBBF24' },
    { id: 'g3', name: 'Analytics', color: '#818CF8' }
  ];
  private logId = 0;

  constructor() {
    this.load();
    if (this.databases.length === 0) {
      this.databases.push({ id: 'db_default', name: 'ne7sql_prod', group: 'Production', maxSizeMB: 500, usedMB: 0.01, password: '', tables: 4, createdAt: new Date().toISOString() });
    }
    if (!this.keys.some(k => k.key === PRIMARY_DRIME_KEY)) {
      this.keys.unshift({ id: 'key_primary', nickname: 'Drime Primary', key: PRIMARY_DRIME_KEY, capacityGB: 20, usedGB: 0.01, status: 'HEALTHY', error: '' });
      this.log('INFO', 'KeyPool', 'Preloaded Drime Primary API key (20GB)');
    }
    this.save();
  }

  log(level: string, module: string, msg: string) {
    this.logs.unshift({ id: this.logId++, time: new Date().toISOString(), level, module, msg });
    if (this.logs.length > 200) this.logs.pop();
  }

  load() {
    try {
      if (fs.existsSync('config/ne7_state.json')) {
        const d = JSON.parse(fs.readFileSync('config/ne7_state.json', 'utf8'));
        this.databases = d.databases || [];
        this.keys = d.keys || [];
        if (d.groups && d.groups.length) this.groups = d.groups;
      }
    } catch {}
  }

  save() {
    try {
      fs.mkdirSync('config', { recursive: true });
      fs.writeFileSync('config/ne7_state.json', JSON.stringify({ databases: this.databases, keys: this.keys, groups: this.groups }, null, 2));
    } catch {}
  }

  updateDb(id: string, updates: any) {
    const db = this.databases.find(d => d.id === id);
    if (db) {
      if (updates.name) db.name = updates.name;
      if (updates.group) db.group = updates.group;
      if (updates.maxSizeMB) db.maxSizeMB = updates.maxSizeMB;
      this.save();
    }
  }

  deleteGroup(id: string) {
    const group = this.groups.find(g => g.id === id);
    if (!group || group.name === 'Production') return;
    this.groups = this.groups.filter(g => g.id !== id);
    this.databases.forEach(db => { if (db.group === group.name) db.group = 'Production'; });
    this.save();
  }
}

export const state = new State();
"""

server_ts = """import * as http from 'http';
import * as fs from 'fs';
import { state } from '../core/state.js';

function readBody(req: http.IncomingMessage): Promise<any> {
  return new Promise(resolve => {
    let data = '';
    req.on('data', c => data += c);
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
    catch { res.writeHead(500); res.end('Error'); }
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  try {
    if (p === '/api/overview') {
      res.end(JSON.stringify({
        dbs: state.databases.length, keys: state.keys.length, groups: state.groups.length,
        totalStorageMB: state.databases.reduce((s,d) => s + d.usedMB, 0),
        totalCapacityMB: state.databases.reduce((s,d) => s + d.maxSizeMB, 0),
        queries: Math.floor(Math.random()*5000)+12000, latency: (Math.random()*3+0.4).toFixed(1)
      }));
    }
    else if (p === '/api/databases' && req.method === 'GET') { res.end(JSON.stringify(state.databases)); }
    else if (p === '/api/databases' && req.method === 'POST') {
      const b = await readBody(req);
      state.databases.push({ id: 'db_' + Date.now(), name: b.name, group: b.group || 'Production', maxSizeMB: b.maxSizeMB || 100, usedMB: 0, password: b.password || '', tables: 0, createdAt: new Date().toISOString() });
      state.save(); state.log('INFO','ControlPlane','Database created: ' + b.name);
      res.end(JSON.stringify({ success: true }));
    }
    else if (p.startsWith('/api/databases/') && req.method === 'PUT') {
      const id = decodeURIComponent(p.split('/')[3]);
      const b = await readBody(req);
      state.updateDb(id, b);
      state.log('INFO','ControlPlane','Database updated: ' + id);
      res.end(JSON.stringify({ success: true }));
    }
    else if (p.startsWith('/api/databases/') && req.method === 'DELETE') {
      const id = decodeURIComponent(p.split('/')[3]);
      const db = state.databases.find(d => d.id === id);
      state.databases = state.databases.filter(d => d.id !== id);
      state.save(); state.log('WARN','ControlPlane','Database deleted: ' + (db ? db.name : id));
      res.end(JSON.stringify({ success: true }));
    }
    else if (p === '/api/groups' && req.method === 'GET') { res.end(JSON.stringify(state.groups)); }
    else if (p === '/api/groups' && req.method === 'POST') {
      const b = await readBody(req);
      state.groups.push({ id: 'g_' + Date.now(), name: b.name, color: b.color || '#818CF8' });
      state.save(); res.end(JSON.stringify({ success: true }));
    }
    else if (p.startsWith('/api/groups/') && req.method === 'DELETE') {
      const id = decodeURIComponent(p.split('/')[3]);
      state.deleteGroup(id);
      state.log('WARN','ControlPlane','Group deleted: ' + id);
      res.end(JSON.stringify({ success: true }));
    }
    else if (p === '/api/keys/reveal' && req.method === 'POST') {
      const b = await readBody(req);
      const k = state.keys.find(x => x.id === b.id);
      if (k) res.end(JSON.stringify({ key: k.key }));
      else { res.writeHead(404); res.end(JSON.stringify({ error: 'not found' })); }
    }
    else if (p === '/api/keys' && req.method === 'GET') {
      const masked = state.keys.map(k => ({ id: k.id, nickname: k.nickname, key: k.key.slice(0,8) + '••••••••' + k.key.slice(-4), capacityGB: k.capacityGB, usedGB: k.usedGB, status: k.status, error: k.error }));
      res.end(JSON.stringify(masked));
    }
    else if (p === '/api/keys' && req.method === 'POST') {
      const b = await readBody(req);
      state.keys.push({ id: 'key_' + Date.now(), nickname: b.nickname, key: b.key, capacityGB: 20, usedGB: 0, status: 'HEALTHY', error: '' });
      state.save(); state.log('INFO','KeyPool','API key added: ' + b.nickname);
      res.end(JSON.stringify({ success: true }));
    }
    else if (p.startsWith('/api/keys/') && req.method === 'DELETE') {
      const id = decodeURIComponent(p.split('/')[3]);
      state.keys = state.keys.filter(k => k.id !== id);
      state.save(); state.log('WARN','KeyPool','API key removed');
      res.end(JSON.stringify({ success: true }));
    }
    else if (p === '/api/logs') { res.end(JSON.stringify(state.logs.slice(0, 100))); }
    else if (p === '/api/query' && req.method === 'POST') {
      const b = await readBody(req);
      state.log('INFO','SQL', b.sql || '');
      res.end(JSON.stringify({ success: true, message: 'Executed: ' + b.sql, rows: [], ms: Math.floor(Math.random()*50)+2 }));
    }
    else { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); }
  } catch (e: any) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
});

server.listen(8080, '0.0.0.0', () => {
  state.log('INFO','System','NE7-SQL Enterprise Engine online');
  console.log('NE7-SQL running on http://0.0.0.0:8080');
});
"""

# The HTML is massive, writing it directly
with open('src/backend/core/state.ts', 'w') as f: f.write(state_ts)
with open('src/backend/api/server.ts', 'w') as f: f.write(server_ts)
print("Backend files written successfully.")
