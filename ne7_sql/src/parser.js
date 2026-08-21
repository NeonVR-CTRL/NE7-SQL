
export class Token { constructor(type, value, pos) { this.type = type; this.value = value; this.position = pos; } }
export class Lexer {
  constructor(sql) { this.sql = sql; this.pos = 0; this.tokens = []; }
  tokenize() {
    while (this.pos < this.sql.length) {
      this.skipWhitespace(); if (this.pos >= this.sql.length) break;
      const c = this.sql[this.pos];
      if (c === "'") this.readString();
      else if (/[a-zA-Z_]/.test(c)) this.readIdentifier();
      else if (/[0-9]/.test(c)) this.readNumber();
      else if (/[(),=<>!+\-*/%;&|]/.test(c)) this.readOperator();
      else if (c === '.') { this.tokens.push(new Token('DOT', '.', this.pos)); this.pos++; }
      else if (c === '*') { this.tokens.push(new Token('STAR', '*', this.pos)); this.pos++; }
      else this.pos++;
    }
    return this.tokens;
  }
  skipWhitespace() { while (this.pos < this.sql.length && /\s/.test(this.sql[this.pos])) this.pos++; }
  readString() {
    const start = this.pos; this.pos++; let v = '';
    while (this.pos < this.sql.length && this.sql[this.pos] !== "'") {
      if (this.sql[this.pos] === "'" && this.sql[this.pos+1] === "'") { v += "'"; this.pos += 2; } else { v += this.sql[this.pos]; this.pos++; }
    }
    this.pos++; this.tokens.push(new Token('STRING', v, start));
  }
  readIdentifier() {
    const start = this.pos; let v = '';
    while (this.pos < this.sql.length && /[a-zA-Z0-9_]/.test(this.sql[this.pos])) { v += this.sql[this.pos]; this.pos++; }
    const up = v.toUpperCase();
    const kw = ['SELECT','INSERT','UPDATE','DELETE','FROM','WHERE','INTO','VALUES','SET','CREATE','TABLE','DROP','INDEX','ON','AND','OR','NOT','NULL','IS','LIKE','IN','BETWEEN','ORDER','BY','ASC','DESC','LIMIT','OFFSET','JOIN','INNER','LEFT','RIGHT','OUTER','AS','DISTINCT','GROUP','HAVING'];
    this.tokens.push(new Token(kw.includes(up) ? up : 'IDENTIFIER', v, start));
  }
  readNumber() {
    const start = this.pos; let v = ''; let dot = false;
    while (this.pos < this.sql.length && /[0-9.]/.test(this.sql[this.pos])) { if (this.sql[this.pos]==='.') { if(dot) break; dot=true; } v += this.sql[this.pos]; this.pos++; }
    this.tokens.push(new Token(dot ? 'FLOAT' : 'INTEGER', v, start));
  }
  readOperator() {
    const start = this.pos; let v = this.sql[this.pos];
    if (this.pos+1 < this.sql.length) { const n = this.sql[this.pos+1]; if ((v==='='&&n==='>')||(v==='<'&&n==='=')||(v==='>'&&n==='=')||(v==='!'&&n==='=')||(v==='|'&&n==='|')||(v==='&'&&n==='&')) { v+=n; this.pos++; } }
    this.pos++; this.tokens.push(new Token(v.length===1 && /[(),;]/.test(v) ? v : 'OPERATOR', v, start));
  }
}
export class ASTNode { constructor(type, children={}, value=null) { this.type = type; this.children = children; this.value = value; } }
export class SQLParser {
  constructor(tokens) { this.tokens = tokens; this.pos = 0; }
  parse() {
    if (!this.tokens.length) throw new Error('Empty SQL');
    const t = this.tokens[0].type;
    if (t==='SELECT') return this.parseSelect(); if (t==='INSERT') return this.parseInsert();
    if (t==='UPDATE') return this.parseUpdate(); if (t==='DELETE') return this.parseDelete();
    if (t==='CREATE') return this.parseCreate(); if (t==='DROP') return this.parseDrop();
    throw new Error('Unsupported: ' + t);
  }
  current() { return this.tokens[this.pos]; }
  consume(t) { const tok = this.current(); if (!tok || tok.type !== t) throw new Error(`Expected ${t}`); this.pos++; return tok; }
  match(...types) { const t = this.current(); return t && types.includes(t.type); }
  parseSelect() {
    this.consume('SELECT'); const dist = this.match('DISTINCT'); if(dist) this.consume('DISTINCT');
    const cols = this.parseSelectList(); this.consume('FROM'); const table = this.parseTableRef();
    let where = null; if (this.match('WHERE')) { this.consume('WHERE'); where = this.parseExpr(); }
    let orderBy = null; if (this.match('ORDER')) { this.consume('ORDER'); this.consume('BY'); orderBy = this.parseOrderBy(); }
    let limit = null; if (this.match('LIMIT')) { this.consume('LIMIT'); limit = this.current().value; this.pos++; }
    return new ASTNode('SELECT', { distinct: dist, columns: cols, table, where, orderBy, limit });
  }
  parseSelectList() {
    const cols = []; if (this.match('STAR')) { this.consume('STAR'); cols.push({type:'star'}); return cols; }
    cols.push(this.parseColRef()); while (this.match(',')) { this.consume(','); cols.push(this.parseColRef()); } return cols;
  }
  parseColRef() { const t = this.current().value; this.pos++; if (this.match('DOT')) { this.consume('DOT'); const c = this.current().value; this.pos++; return {type:'column', table:t, column:c}; } return {type:'column', column:t}; }
  parseTableRef() { const n = this.current().value; this.pos++; let a = null; if (this.match('AS')) { this.consume('AS'); a = this.current().value; this.pos++; } else if (this.match('IDENTIFIER')) { a = this.current().value; this.pos++; } return {name:n, alias:a}; }
  parseExpr() {
    let left = this.parsePrimary();
    while (this.match('OPERATOR','AND','OR','LIKE','IN','BETWEEN','IS')) {
      const op = this.current().value || this.current().type; this.pos++;
      if (op.toUpperCase()==='IS') { if(this.match('NOT')){this.consume('NOT');this.consume('NULL');left=new ASTNode('IS_NOT_NULL',{left});}else{this.consume('NULL');left=new ASTNode('IS_NULL',{left});} }
      else if (op.toUpperCase()==='IN') { this.consume('('); const v=this.parseValList(); this.consume(')'); left=new ASTNode('IN',{left,values:v}); }
      else if (op.toUpperCase()==='BETWEEN') { const l=this.parsePrimary(); this.consume('AND'); const h=this.parsePrimary(); left=new ASTNode('BETWEEN',{left,low:l,high:h}); }
      else { const r = this.parsePrimary(); left = new ASTNode('BINARY_OP', {left, right}, op); }
    }
    return left;
  }
  parsePrimary() {
    if (this.match('STRING')) { const v = this.current().value; this.pos++; return new ASTNode('LITERAL', {}, v); }
    if (this.match('INTEGER','FLOAT')) { const v = this.current().value; this.pos++; return new ASTNode('LITERAL', {}, parseFloat(v)); }
    if (this.match('NULL')) { this.consume('NULL'); return new ASTNode('NULL', {}); }
    return this.parseColRef();
  }
  parseValList() { const v=[]; v.push(this.parsePrimary()); while(this.match(',')){this.consume(',');v.push(this.parsePrimary());} return v; }
  parseOrderBy() { const i=[]; i.push(this.parseOrderItem()); while(this.match(',')){this.consume(',');i.push(this.parseOrderItem());} return i; }
  parseOrderItem() { const c=this.parseColRef(); let d='ASC'; if(this.match('ASC')){this.consume('ASC');d='ASC';}else if(this.match('DESC')){this.consume('DESC');d='DESC';} return {column:c, direction:d}; }
  parseInsert() { this.consume('INSERT'); this.consume('INTO'); const t=this.current().value; this.pos++; let c=[]; if(this.match('(')){this.consume('(');c=this.parseColNames();this.consume(')');} this.consume('VALUES'); this.consume('('); const v=this.parseValList(); this.consume(')'); return new ASTNode('INSERT',{table:t,columns:c,values:v}); }
  parseColNames() { const c=[]; c.push(this.current().value); this.pos++; while(this.match(',')){this.consume(',');c.push(this.current().value);this.pos++;} return c; }
  parseUpdate() { this.consume('UPDATE'); const t=this.current().value; this.pos++; this.consume('SET'); const a=this.parseAssignments(); let w=null; if(this.match('WHERE')){this.consume('WHERE');w=this.parseExpr();} return new ASTNode('UPDATE',{table:t,assignments:a,where:w}); }
  parseAssignments() { const a=[]; a.push(this.parseAssign()); while(this.match(',')){this.consume(',');a.push(this.parseAssign());} return a; }
  parseAssign() { const c=this.current().value; this.pos++; this.consume('OPERATOR'); const v=this.parsePrimary(); return {column:c,value:v}; }
  parseDelete() { this.consume('DELETE'); this.consume('FROM'); const t=this.current().value; this.pos++; let w=null; if(this.match('WHERE')){this.consume('WHERE');w=this.parseExpr();} return new ASTNode('DELETE',{table:t,where:w}); }
  parseCreate() { this.consume('CREATE'); if(this.match('TABLE')) return this.parseCreateTable(); if(this.match('INDEX')) return this.parseCreateIndex(); throw new Error('Expected TABLE/INDEX'); }
  parseCreateTable() { this.consume('TABLE'); const n=this.current().value; this.pos++; this.consume('('); const c=this.parseColDefs(); this.consume(')'); return new ASTNode('CREATE_TABLE',{name:n,columns:c}); }
  parseColDefs() { const c=[]; c.push(this.parseColDef()); while(this.match(',')){this.consume(',');c.push(this.parseColDef());} return c; }
  parseColDef() { const n=this.current().value; this.pos++; const t=this.current().value.toUpperCase(); this.pos++; const con=[]; while(this.match('NOT','NULL','PRIMARY','KEY','UNIQUE')){if(this.match('NOT')){this.consume('NOT');this.consume('NULL');con.push('NOT NULL');}else if(this.match('PRIMARY')){this.consume('PRIMARY');this.consume('KEY');con.push('PK');}else if(this.match('UNIQUE')){this.consume('UNIQUE');con.push('UQ');}} return {name:n,type:t,constraints:con}; }
  parseCreateIndex() { this.consume('INDEX'); const n=this.current().value; this.pos++; this.consume('ON'); const t=this.current().value; this.pos++; this.consume('('); const c=this.parseColNames(); this.consume(')'); return new ASTNode('CREATE_INDEX',{indexName:n,tableName:t,columns:c}); }
  parseDrop() { this.consume('DROP'); let t; if(this.match('TABLE')){this.consume('TABLE');t='TABLE';}else if(this.match('INDEX')){this.consume('INDEX');t='INDEX';}else throw new Error('Expected TABLE/INDEX'); const n=this.current().value; this.pos++; return new ASTNode('DROP',{type:t,name:n}); }
}
export function parseSQL(sql) { return new SQLParser(new Lexer(sql).tokenize()).parse(); }
