export function defaultManifest(tenantId, dbName) {
  return {
    version: 0,
    tenant: tenantId,
    name: dbName,
    tables: {},
    wal: [],
    segments: [],
    indexes: []
  };
}

export async function loadManifest(smgr, tenantId) {
  const b = await smgr.get(`t_${tenantId}/manifest.json`);
  if (!b) return null;
  const text = new TextDecoder().decode(b);
  // 🛡️ MASTER FIX: If Drime returns an HTML error page instead of JSON, treat it as missing.
  if (!text.trim().startsWith('{')) return null; 
  return JSON.parse(text);
}

export async function saveManifest(smgr, tenantId, manifest, expectedVersion) {
  const cur = await loadManifest(smgr, tenantId);
  if (cur && cur.version !== expectedVersion) {
    throw new Error('MANIFEST_CONFLICT: Concurrent writer detected');
  }
  manifest.version = expectedVersion + 1;
  const data = new TextEncoder().encode(JSON.stringify(manifest));
  await smgr.put(`t_${tenantId}/manifest.json`, data);
  return manifest;
}
