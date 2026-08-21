import os

sql_engine_ts = """import { state } from './state.js';

function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inString = false;
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'") {
      if (inString && sql[i+1] === "'") { current += "''"; i++; continue; }
      inString = !inString;
    }
    if (char === ';' && !inString) {
      if (current.trim()) statements.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

function parseValues(valStr: string): any[] {
  const values: any[] = [];
  let current = '';
  let inString = false;
  for (let i = 0; i < valStr.length; i++) {
    const char = valStr[i];
    if (char === "'" && !inString) { inString = true; continue; }
    if (char === "'" && inString) {
      if (valStr[i+1] === "'") { current += "'"; i++; continue; }
      inString = false; continue;
    }
    if (char === ',' && !inString) {
      values.push(parseVal(current.trim()));
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) values.push(parseVal(current.trim()));
  return values;
}

function parseVal(v: string): any {
  if (v.toUpperCase() === 'NULL') return null;
  if (v.toUpperCase() === 'TRUE') return true;
  if (v.toUpperCase() === 'FALSE') return false;
  if (!isNaN(Number(v)) && v !== '') return Number(v);
  return v;
}

export class SqlEngine {
  execute(dbId: string, sql: string): any {
    const db = state.databases.find(d => d.id === dbId);
    if (!db) throw new Error('Database not found');
    
    if (!db.tableMeta) db.tableMeta = [];
    if (!db.rows) db.rows = {};

    const statements = splitStatements(sql);
    let lastResult: any = null;

    for (const stmt of statements) {
      lastResult = this.executeSingle(db, stmt);
    }
    
    return lastResult || { command: 'OK', rowCount: 0, rows: [] };
  }

  private executeSingle(db: any, sql: string): any {
    const upper = sql.toUpperCase();

    if (upper.startsWith('CREATE TABLE')) {
      const match = sql.match(/CREATE TABLE\\s+([a-zA-Z0-9_]+)\\s*\\((.*)\\)/i);
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
      const tableName = sql.split(/\\s+/)[2];
      db.tableMeta = db.tableMeta.filter((t: any) => t.name !== tableName);
      delete db.rows[tableName];
      db.tables = db.tableMeta.length;
      state.save();
      return { command: 'DROP TABLE', rowCount: 0, rows: [] };
    }

    if (upper.startsWith('INSERT INTO')) {
      const match = sql.match(/INSERT INTO\\s+([a-zA-Z0-9_]+)\\s*(?:\\(([^)]+)\\))?\\s*VALUES\\s*\\((.*)\\)\\s*$/i);
      if (!match) throw new Error('Invalid INSERT syntax');
      const tableName = match[1];
      const table = db.tableMeta.find((t: any) => t.name === tableName);
      if (!table) throw new Error(`Table ${tableName} does not exist`);
      
      const values = parseValues(match[3]);
      const row: any = {};
      table.columns.forEach((col: any, i: number) => {
        row[col.name] = values[i] !== undefined ? values[i] : null;
      });
      db.rows[tableName].push(row);
      state.save();
      return { command: 'INSERT', rowCount: 1, rows: [] };
    }

    if (upper.startsWith('SELECT')) {
      const match = sql.match(/SELECT\\s+(.*)\\s+FROM\\s+([a-zA-Z0-9_]+)/i);
      if (!match) throw new Error('Invalid SELECT syntax');
      const cols = match[1].trim();
      const tableName = match[2];
      const table = db.tableMeta.find((t: any) => t.name === tableName);
      if (!table) throw new Error(`Table ${tableName} does not exist`);
      
      let rows = db.rows[tableName] || [];
      const whereMatch = sql.match(/WHERE\\s+([a-zA-Z0-9_]+)\\s*=\\s*'?([^']+)'?/i);
      if (whereMatch) {
        const col = whereMatch[1];
        const val = parseVal(whereMatch[2]);
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
      const match = sql.match(/DELETE FROM\\s+([a-zA-Z0-9_]+)(?:\\s+WHERE\\s+(.+))?/i);
      if (!match) throw new Error('Invalid DELETE syntax');
      const tableName = match[1];
      if (!db.rows[tableName]) throw new Error('Table not found');
      
      let deleted = 0;
      if (match[2]) {
        const wMatch = match[2].match(/([a-zA-Z0-9_]+)\\s*=\\s*'?([^']+)'?/i);
        if (wMatch) {
          const col = wMatch[1];
          const val = parseVal(wMatch[2]);
          const before = db.rows[tableName].length;
          db.rows[tableName] = db.rows[tableName].filter((r: any) => r[col] != val);
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

with open('src/backend/core/sql_engine.ts', 'w') as f: f.write(sql_engine_ts)
print("✅ Robust SQL Engine v2 written.")
