import { DrimeSmgr } from './storage/drime_smgr.js';
import { parseSQL } from './parser/parser.js';
import { planQuery } from './planner/planner.js';
import { Executor } from './executor/executor.js';
import { provisionDatabase } from './tenant/provision.js';
import { DRIME_BASE } from './core/constants.js';
import { WireBrain } from './protocol/wire_brain.js';
import { hashPassword, signToken, verifyToken, uid } from './auth.js';
import { SOURCE } from './source_bundle.js';
import HTML_DASHBOARD from './dashboard_html.js';

const K = { config: 'config', keys: 'keys', customers: 'customers' };
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};
const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: cors });

async function kvGet(kv, k){ try { return await kv.get(k, 'json'); } catch (e) { return null; } }
async function kvPut(kv, k, v){ await kv.put(k, JSON.stringify(v)); }

async function listFiles(apiKey){
  try {
    const r = await fetch(DRIME_BASE + '/drive/file-entries?workspaceId=0', { headers: { Authorization: 'Bearer ' + apiKey, Accept: 'application/json' } });
    if (!r.ok) return [];
    const d = await r.json();
    return d.data || [];
  } catch (e) { return []; }
}
async function downloadRaw(apiKey, id){
  try {
    const h = btoa(String(id));
    const r = await fetch(DRIME_BASE + '/file-entries/download/' + h, { headers: { Authorization: 'Bearer ' + apiKey } });
    if (!r.ok) return null;
    return new Uint8Array(await r.arrayBuffer());
  } catch (e) { return null; }
}
async function deleteFile(apiKey, id){
  const tries = [
    () => fetch(DRIME_BASE + '/file-entries/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + apiKey, Accept: 'application/json' } }),
    () => fetch(DRIME_BASE + '/file-entries/' + id + '?_method=DELETE', { method: 'POST', headers: { Authorization: 'Bearer ' + apiKey, Accept: 'application/json' } })
  ];
  for (const t of tries) { try { const r = await t(); if (r.ok || r.status === 204) return true; } catch (e) {} }
  return false;
}
async function spaceUsage(apiKey){
  try {
    const r = await fetch(DRIME_BASE + '/user/space-usage?workspaceId=0', { headers: { Authorization: 'Bearer ' + apiKey, Accept: 'application/json' } });
    if (r.ok) { const s = await r.json(); return { used: s.used || 0, available: s.available || 0, healthy: true }; }
  } catch (e) {}
  return { used: 0, available: 0, healthy: false };
}

export default {
  async fetch(request, env) {
    const kv = env.NE7_KV;
    const url = new URL(request.url);

    // ── WebSocket (Inverted Postgres wire) ──
    if (request.headers.get('Upgrade') === 'websocket') {
      const keys = (await kvGet(kv, K.keys)) || [];
      const key = url.searchParams.get('key') || (keys.length ? keys[0].key : null);
      const pair = new WebSocketPair();
      const client = pair[0], server = pair[1];
      server.accept();
      const smgr = new DrimeSmgr(key, DRIME_BASE);
      const brain = new WireBrain({ smgr, onSend: (b) => server.send(b) });
      server.addEventListener('message', (e) => brain.feed(e.data));
      return new Response(null, { status: 101, webSocket: client });
    }
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(HTML_DASHBOARD, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (!kv) return json({ error: 'KV not bound' }, 500);

    // ── SETUP (first run) ──
    if (url.pathname === '/api/setup' && request.method === 'POST') {
      const b = await request.json();
      const existing = await kvGet(kv, K.config);
      if (existing && existing.setupDone) return json({ error: 'Already set up' }, 400);
      const su = await spaceUsage(b.drimeKey);
      if (!su.healthy) return json({ error: 'Invalid Drime key' }, 400);
      const salt = uid();
      const config = { setupDone: true, signSecret: uid() + uid(), admins: [{ email: (b.adminEmail || '').toLowerCase(), salt, passHash: await hashPassword(b.adminPassword || '', salt) }] };
      await kvPut(kv, K.config, config);
      await kvPut(kv, K.keys, [{ id: uid(), nickname: 'Primary', key: b.drimeKey, capacityGB: 20, status: 'HEALTHY' }]);
      await kvPut(kv, K.customers, []);
      return json({ ok: true });
    }

    const config = (await kvGet(kv, K.config)) || { admins: [], signSecret: 'x' };

    // ── STATUS (does the dashboard show Setup or Login?) ──
    if (url.pathname === '/api/status') return json({ setup: !!(config.setupDone) });

    // ── LOGIN ──
    if (url.pathname === '/api/login' && request.method === 'POST') {
      const b = await request.json();
      const customers = (await kvGet(kv, K.customers)) || [];
      const email = (b.email || '').toLowerCase();
      let role = null, tenantId = null, name = email;
      const admin = config.admins.find((a) => a.email === email);
      if (admin) { if (await hashPassword(b.password || '', admin.salt) === admin.passHash) role = 'admin'; }
      else {
        const c = customers.find((x) => x.email === email);
        if (c) { if (await hashPassword(b.password || '', c.salt) === c.passHash) { role = 'customer'; tenantId = c.tenantId; name = c.name; } }
      }
      if (!role) return json({ error: 'Invalid credentials' }, 401);
      const token = await signToken({ email, role, tenantId, name, exp: Date.now() + 7 * 864e5 }, config.signSecret);
      return json({ token, role, name });
    }

    const headerKey = (request.headers.get('Authorization') || '').replace('Bearer ', '');
    const auth = await verifyToken(headerKey, config.signSecret);
    const isAuthed = auth && auth.exp > Date.now();
    const isAdmin = isAuthed && auth.role === 'admin';

    if (url.pathname === '/api/me') {
      return isAuthed ? json({ email: auth.email, role: auth.role, name: auth.name, tenantId: auth.tenantId }) : json({ error: 'unauthed' }, 401);
    }

    const keys = (await kvGet(kv, K.keys)) || [];

    // ══ ADMIN ══
    if (url.pathname.startsWith('/api/admin/')) {
      if (!isAdmin) return json({ error: 'Admin only' }, 403);

      if (url.pathname === '/api/admin/keys' && request.method === 'GET') {
        return json(keys.map((k) => ({ id: k.id, nickname: k.nickname, key: k.key.slice(0, 6) + '••••••••' + k.key.slice(-4), capacityGB: k.capacityGB, status: k.status })));
      }
      if (url.pathname === '/api/admin/keys' && request.method === 'POST') {
        const b = await request.json();
        const su = await spaceUsage(b.key);
        keys.push({ id: uid(), nickname: b.nickname || 'Key', key: b.key, capacityGB: b.capacityGB || 20, status: su.healthy ? 'HEALTHY' : 'DOWN' });
        await kvPut(kv, K.keys, keys);
        return json({ ok: true, healthy: su.healthy });
      }
      let m = url.pathname.match(/^\/api\/admin\/keys\/([^/]+)\/reveal$/);
      if (m) { const k = keys.find((x) => x.id === m[1]); return json({ key: k ? k.key : null }); }
      m = url.pathname.match(/^\/api\/admin\/keys\/([^/]+)$/);
      if (m && request.method === 'DELETE') { await kvPut(kv, K.keys, keys.filter((k) => k.id !== m[1])); return json({ ok: true }); }

      if (url.pathname === '/api/admin/admins' && request.method === 'GET') return json(config.admins.map((a) => a.email));
      if (url.pathname === '/api/admin/admins' && request.method === 'POST') {
        const b = await request.json();
        const salt = uid();
        config.admins.push({ email: (b.email || '').toLowerCase(), salt, passHash: await hashPassword(b.password || '', salt) });
        await kvPut(kv, K.config, config);
        return json({ ok: true });
      }
      m = url.pathname.match(/^\/api\/admin\/admins\/(.+)$/);
      if (m && request.method === 'DELETE') { config.admins = config.admins.filter((a) => a.email !== decodeURIComponent(m[1])); await kvPut(kv, K.config, config); return json({ ok: true }); }

      if (url.pathname === '/api/admin/customers' && request.method === 'GET') {
        const cs = (await kvGet(kv, K.customers)) || [];
        return json(cs.map((c) => ({ id: c.id, name: c.name, email: c.email, tenantId: c.tenantId })));
      }
      if (url.pathname === '/api/admin/customers' && request.method === 'POST') {
        const b = await request.json();
        const cs = (await kvGet(kv, K.customers)) || [];
        const tenant = (b.name || '').replace(/[^a-z0-9_]/gi, '_').toLowerCase();
        const salt = uid();
        cs.push({ id: uid(), email: (b.email || '').toLowerCase(), name: b.name, tenantId: tenant, salt, passHash: await hashPassword(b.password || '', salt) });
        await kvPut(kv, K.customers, cs);
        let best = keys[0], bestFree = -1;
        for (const k of keys) { const su = await spaceUsage(k.key); if (su.healthy && su.available > bestFree) { bestFree = su.available; best = k; } }
        const smgr = new DrimeSmgr(best.key, DRIME_BASE);
        const prov = await provisionDatabase(best.key, tenant, tenant, smgr, best.id);
        return json({ ok: true, key: best.nickname, dsn: prov.dsn, token: prov.token });
      }
      m = url.pathname.match(/^\/api\/admin\/customers\/([^/]+)$/);
      if (m && request.method === 'DELETE') { await kvPut(kv, K.customers, ((await kvGet(kv, K.customers)) || []).filter((c) => c.id !== m[1])); return json({ ok: true }); }

      if (url.pathname === '/api/admin/storage') {
        let gT = 0, gU = 0; const rows = [];
        for (const k of keys) {
          const su = await spaceUsage(k.key);
          const used = +(su.used / 1e9).toFixed(2);
          gT += k.capacityGB; gU += used;
          k.status = su.healthy ? 'HEALTHY' : 'DOWN';
          rows.push({ id: k.id, nickname: k.nickname, capacityGB: k.capacityGB, usedGB: used, balanceGB: +(k.capacityGB - used).toFixed(2), status: k.status });
        }
        await kvPut(kv, K.keys, keys);
        return json({ rows, grandTotalGB: gT, grandUsedGB: +gU.toFixed(2), grandBalanceGB: +(gT - gU).toFixed(2) });
      }

      if (url.pathname === '/api/admin/reset') {
        let deleted = 0;
        for (const k of keys) {
          const files = await listFiles(k.key);
          for (const f of files) {
            if (f.name.startsWith('t_') || f.name.startsWith('ne7_index')) { if (await deleteFile(k.key, f.id)) deleted++; }
          }
        }
        await kvPut(kv, K.customers, []);
        return json({ ok: true, deleted });
      }

      if (url.pathname === '/api/admin/source') return json(SOURCE);
      return json({ error: 'not found' }, 404);
    }

    // ══ DATA (any authed user) ══
    if (!isAuthed) return json({ error: 'unauthed' }, 401);

    if (url.pathname === '/api/databases') {
      const dbs = []; const seen = {};
      for (const k of keys) {
        const files = await listFiles(k.key);
        for (const mf of files.filter((f) => f.name.includes('__manifest.json'))) {
          const tid = mf.name.replace('__manifest.json', '').replace(/^t_/, '');
          if (!isAdmin && tid !== auth.tenantId) continue;
          if (seen[tid]) continue; seen[tid] = true;
          const raw = await downloadRaw(k.key, mf.id);
          if (raw) {
            try {
              const mm = JSON.parse(new TextDecoder().decode(raw));
              dbs.push({ id: mm.tenant, name: mm.name || mm.tenant, tables: Object.keys(mm.tables || {}).length, key: k.nickname });
            } catch (e) {}
          }
        }
      }
      return json(dbs);
    }

    if (url.pathname === '/api/query' && request.method === 'POST') {
      const b = await request.json();
      const tenant = isAdmin ? (b.tenantId || auth.tenantId || 'default') : auth.tenantId;
      let useKey = keys[0] ? keys[0].key : null;
      for (const k of keys) {
        const files = await listFiles(k.key);
        if (files.some((f) => f.name === 't_' + tenant + '__manifest.json')) { useKey = k.key; break; }
      }
      const smgr = new DrimeSmgr(useKey, DRIME_BASE);
      try {
        const ast = parseSQL(b.sql);
        const plan = planQuery(ast);
        const exec = new Executor(smgr, tenant);
        const res = await exec.execute(plan);
        return json({ ...res, ms: 5, message: res.command });
      } catch (e) {
        return json({ error: e.message, message: e.message }, 400);
      }
    }

    return json({ engine: 'NE7-SQL', status: 'Online' });
  }
};
