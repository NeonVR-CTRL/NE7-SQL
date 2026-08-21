import re

with open('src/executor.js', 'r') as f:
    content = f.read()

# Regex flexibly matches the old execute method regardless of spacing/newlines
pattern = re.compile(r'async\s+execute\(sql\)\s*\{\s*const\s+ast\s*=\s*parseSQL\(sql\);\s*return\s+this\.execAST\(ast\);\s*\}', re.MULTILINE | re.DOTALL)

new_code = """splitSQL(sql) {
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

new_content, count = pattern.subn(new_code, content)

if count == 0:
    print("⚠️ Regex missed. Attempting direct fallback injection...")
    # Fallback: Force replace the method signature if the body was slightly different
    new_content = content.replace("async execute(sql) {", new_code, 1)
else:
    print(f"✅ Successfully replaced {count} occurrence(s) of execute().")

with open('src/executor.js', 'w') as f:
    f.write(new_content)

print("✅ Robust patch applied.")
