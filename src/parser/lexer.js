export class Token {
  constructor(type, value) { this.type = type; this.value = value; }
}

export function tokenize(sql) {
  const tokens = [];
  let i = 0;
  const len = sql.length;
  
  while (i < len) {
    let c = sql[i];
    
    // Skip whitespace
    if (/\s/.test(c)) { i++; continue; }
    
    // String literals
    if (c === "'") {
      i++; let val = '';
      while (i < len && sql[i] !== "'") {
        if (sql[i] === "'" && sql[i+1] === "'") { val += "'"; i += 2; } 
        else { val += sql[i]; i++; }
      }
      i++; tokens.push(new Token('STRING', val));
      continue;
    }
    
    // Numbers
    if (/[0-9]/.test(c)) {
      let val = '';
      while (i < len && /[0-9.]/.test(sql[i])) { val += sql[i]; i++; }
      tokens.push(new Token('NUMBER', parseFloat(val)));
      continue;
    }
    
    // Identifiers and Keywords
    if (/[a-zA-Z_]/.test(c)) {
      let val = '';
      while (i < len && /[a-zA-Z0-9_]/.test(sql[i])) { val += sql[i]; i++; }
      const upper = val.toUpperCase();
      const kws = ['SELECT','FROM','WHERE','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','DROP','AND','OR'];
      tokens.push(new Token(kws.includes(upper) ? upper : 'IDENT', val));
      continue;
    }
    
    // Operators & Punctuation
    if (/[(),=*<>!]/.test(c)) {
      let op = c;
      if (i+1 < len && (c === '<' && sql[i+1] === '=' || c === '>' && sql[i+1] === '=' || c === '!' && sql[i+1] === '=')) {
        op += sql[i+1]; i++;
      }
      i++; tokens.push(new Token('OP', op));
      continue;
    }
    
    i++; // Skip unknown
  }
  return tokens;
}
