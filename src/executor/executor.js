import { loadManifest, saveManifest } from '../storage/manifest.js';
import { randomId } from '../core/utils.js';

export class Executor {
  constructor(smgr, tenantId) {
    this.smgr = smgr;
    this.tenantId = tenantId;
  }

  async execute(plan) {
    const manifest = await loadManifest(this.smgr, this.tenantId);
    if (!manifest) throw new Error('Tenant not found');

    // ═══ DDL EXECUTION ═══
    if (plan.type === 'DDL') {
      if (plan.action === 'CREATE_TABLE') {
        manifest.tables[plan.table] = { columns: plan.columns, segments: [], wal: [] };
        await saveManifest(this.smgr, this.tenantId, manifest, manifest.version);
        return { command: 'CREATE TABLE', rowCount: 0 };
      }
      if (plan.action === 'DROP_TABLE') {
        delete manifest.tables[plan.table];
        await saveManifest(this.smgr, this.tenantId, manifest, manifest.version);
        return { command: 'DROP TABLE', rowCount: 0 };
      }
    }

    // ═══ INSERT EXECUTION (Append to WAL) ═══
    if (plan.type === 'Insert') {
      const tableMeta = manifest.tables[plan.table];
      if (!tableMeta) throw new Error(`Table ${plan.table} not found`);
      
      const row = {};
      const cols = tableMeta.columns.map(c => c.name);
      plan.values.forEach((v, i) => { row[cols[i]] = v.value; });

      // Get or create active WAL segment ID
      const walId = tableMeta.wal[0] || randomId();
      if (!tableMeta.wal.includes(walId)) tableMeta.wal.push(walId);
      
      const walKey = `t_${this.tenantId}/wal_${walId}.json`;
      const existing = await this.smgr.get(walKey);
      const rows = existing ? JSON.parse(new TextDecoder().decode(existing)) : [];
      rows.push(row);
      
      await this.smgr.put(walKey, new TextEncoder().encode(JSON.stringify(rows)));
      await saveManifest(this.smgr, this.tenantId, manifest, manifest.version);
      
      return { command: 'INSERT', rowCount: 1 };
    }

    // ═══ SELECT EXECUTION (Scan WAL) ═══
    if (plan.type === 'IndexScan' || plan.type === 'SeqScan') {
      const tableMeta = manifest.tables[plan.table];
      if (!tableMeta) throw new Error(`Table ${plan.table} not found`);
      
      const rows = [];
      for (const walId of tableMeta.wal) {
        const walKey = `t_${this.tenantId}/wal_${walId}.json`;
        const data = await this.smgr.get(walKey);
        if (data) rows.push(...JSON.parse(new TextDecoder().decode(data)));
      }
      
      // Apply WHERE filter (IndexScan)
      if (plan.type === 'IndexScan' && plan.filter) {
        const { op, left, right } = plan.filter;
        const colName = left.name;
        const filterVal = right.value;
        return {
          command: 'SELECT',
          rows: rows.filter(r => r[colName] == filterVal),
          columns: tableMeta.columns
        };
      }
      
      return { command: 'SELECT', rows, columns: tableMeta.columns };
    }

    throw new Error('Unsupported plan: ' + plan.type);
  }
}
