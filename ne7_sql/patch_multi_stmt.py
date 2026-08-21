import os

with open('src/executor.js', 'r') as f:
    content = f.read()

# Find the old execute method and replace it with the multi-statement version
old_execute = """  async execute(sql) {
    const ast = parseSQL(sql);
    return this.execAST(ast);
  }"""

new_execute = """  splitSQL(sql) {
    const stmts = []; let cur = ''; let inStr = false;
    for (let i = 0; i < sql.length; i++) {
      const c = sql[i];
      if (c === "'") { if (inStr && sql[i+1] === "'") { cur += "''"; i++; continue; } inStr = !inStr; }
      if (c === ';' && !inStr) { if (cur.trim()) stmts.push(cur.trim()); cur = ''; } 
      else cur += c;
    }
    if (cur.trim()) stmts.push(cur.trim());
    return stmts;
  }

  async execute(sql) {
    const stmts = this.splitSQL(sql);
    let lastRes = null;
    for (const s of stmts) {
      const ast = parseSQL(s);
      lastRes = await this.execAST(ast);
    }
    return lastRes || { command: 'OK', rowCount: 0, rows: [] };
  }"""

content = content.replace(old_execute, new_execute)

with open('src/executor.js', 'w') as f:
    f.write(content)

print("✅ Patched executor.js to handle multi-statement AST parsing.")
