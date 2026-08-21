import http from 'http';
import fs from 'fs/promises';
import { db } from '../main.js';

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
export function startAPI(port) { server.listen(port, '0.0.0.0', () => console.log('[HTTP] Dashboard & API live on ' + port)); }
