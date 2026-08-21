import os

state_ts = """import * as fs from 'fs';

export interface LogEntry { id: number; time: string; level: string; module: string; msg: string; }
export interface Database { 
  id: string; name: string; group: string; maxSizeMB: number; usedMB: number; 
  password: string; tables: number; tableMeta: any[]; rows: Record<string, any[]>; createdAt: string; 
}
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
      this.databases.push({ 
        id: 'db_default', name: 'ne7sql_prod', group: 'Production', 
        maxSizeMB: 500, usedMB: 0.01, password: '', tables: 0, 
        tableMeta: [], rows: {}, createdAt: new Date().toISOString() 
      });
    } else {
      this.databases.forEach(db => {
        if (!db.tableMeta) db.tableMeta = [];
        if (!db.rows) db.rows = {};
      });
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

sql_engine_ts = """import { state } from './state.js';

export class SqlEngine {
  execute(dbId: string, sql: string): any {
    const db = state.databases.find(d => d.id === dbId);
    if (!db) throw new Error('Database not found');
    
    if (!db.tableMeta) db.tableMeta = [];
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
      db.tableMeta.push({ name: tableName, columns });
      db.rows[tableName] = [];
      db.tables = db.tableMeta.length;
      state.save();
      return { command: 'CREATE TABLE', rowCount: 0, rows: [] };
    }
    
    if (upper.startsWith('DROP TABLE')) {
      const tableName = cleanSql.split(/\\s+/)[2];
      db.tableMeta = db.tableMeta.filter(t => t.name !== tableName);
      delete db.rows[tableName];
      db.tables = db.tableMeta.length;
      state.save();
      return { command: 'DROP TABLE', rowCount: 0, rows: [] };
    }

    if (upper.startsWith('INSERT INTO')) {
      const match = cleanSql.match(/INSERT INTO\\s+([a-zA-Z0-9_]+)\\s*(?:\\(([^)]+)\\))?\\s*VALUES\\s*\\((.*)\\)/i);
      if (!match) throw new Error('Invalid INSERT syntax');
      const tableName = match[1];
      const table = db.tableMeta.find(t => t.name === tableName);
      if (!table) throw new Error(`Table ${tableName} does not exist`);
      
      const values = match[3].split(',').map(v => v.trim().replace(/^'|'$/g, ''));
      const row: any = {};
      table.columns.forEach((col: any, i: number) => {
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
      const table = db.tableMeta.find(t => t.name === tableName);
      if (!table) throw new Error(`Table ${tableName} does not exist`);
      
      let rows = db.rows[tableName] || [];
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

with open('src/backend/core/state.ts', 'w') as f: f.write(state_ts)
with open('src/backend/core/sql_engine.ts', 'w') as f: f.write(sql_engine_ts)
print("✅ SQL Engine & State patched successfully.")
