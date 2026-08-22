import { defaultManifest, saveManifest } from '../storage/manifest.js';
import { randomToken } from '../core/utils.js';
import { DRIME_BASE, GATEWAY_HOST, GATEWAY_PORT } from '../core/constants.js';
export async function provisionDatabase(apiKey, tenantId, dbName, smgr = null, keyId = null) {
  if (!smgr) { const { DrimeSmgr } = await import('../storage/drime_smgr.js'); smgr = new DrimeSmgr(apiKey, DRIME_BASE); }
  const manifest = defaultManifest(tenantId, dbName);
  if (keyId) manifest.keyId = keyId;
  await saveManifest(smgr, tenantId, manifest, 0);
  const token = randomToken();
  const dsn = `postgresql://${dbName}:${token}@${GATEWAY_HOST}:${GATEWAY_PORT}/${dbName}?sslmode=require`;
  return { tenantId, dbName, token, dsn };
}
