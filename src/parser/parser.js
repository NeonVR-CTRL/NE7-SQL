import { tokenize } from './lexer.js';

class Parser {
  constructor(tokens) { this.tokens = tokens; this.pos = 0; }
  peek() { return this.tokens[this.pos]; }
  consume(type) { 
    const t = this.peek(); 
    if (!t || (type && t.type !== type)) throw new Error(`Expected ${type} but got ${t?.type}`); 
    this.pos++; return t; 
  }
  match(type) { return this.peek()?.type === type; }

  parse() {
    const t = this.peek();
    if (!t) throw new Error('Empty query');
    if (t.type === 'SELECT') return this.parseSelect();
    if (t.type === 'INSERT') return this.parseInsert();
    if (t.type === 'CREATE') return this.parseCreate();
    if (t.type === 'DROP') return this.parseDrop();
    throw new Error('Unsupported statement: ' + t.type);
  }

  parseSelect() {
    this.consume('SELECT');
    const cols = this.match('OP') && this.peek().value === '*' ? (this.consume('OP'), ['*']) : this.parseColList();
    this.consume('FROM');
    const table = this.consume('IDENT').value;
    let where = null;
    if (this.match('WHERE')) { this.consume('WHERE'); where = this.parseExpr(); }
    return { type: 'SELECT', columns: cols, table, where };
  }

  parseInsert() {
    this.consume('INSERT'); this.consume('INTO');
    const table = this.consume('IDENT').value;
    const cols = this.match('OP') && this.peek().value === '(' ? this.parseParenList() : [];
    this.consume('VALUES');
    const values = this.parseParenList();
    return { type: 'INSERT', table, columns: cols, values };
  }

  parseCreate() {
    this.consume('CREATE'); this.consume('TABLE');
    const table = this.consume('IDENT').value;
    this.consume('OP'); // (
    const cols = [];
    while (!this.match('OP') || this.peek().value !== ')') {
      const name = this.consume('IDENT').value;
      const dtype = this.consume('IDENT').value;
      cols.push({ name, type: dtype });
      if (this.match('OP') && this.peek().value === ',') this.consume('OP');
    }
    this.consume('OP'); // )
    return { type: 'CREATE_TABLE', table, columns: cols };
  }

  parseDrop() {
    this.consume('DROP'); this.consume('TABLE');
    const table = this.consume('IDENT').value;
    return { type: 'DROP_TABLE', table };
  }

  parseColList() {
    const cols = [this.consume('IDENT').value];
    while (this.match('OP') && this.peek().value === ',') { this.consume('OP'); cols.push(this.consume('IDENT').value); }
    return cols;
  }

  parseParenList() {
    this.consume('OP'); // (
    const items = [];
    while (!this.match('OP') || this.peek().value !== ')') {
      const t = this.peek();
      if (t.type === 'STRING' || t.type === 'NUMBER') { 
        items.push({ type: 'LITERAL', value: t.value }); 
        this.consume(); // 🛡️ FIXED: Only consume once for literals
      } else { 
        items.push({ type: 'COLUMN', name: this.consume('IDENT').value }); 
      }
      if (this.match('OP') && this.peek().value === ',') this.consume('OP');
    }
    this.consume('OP'); // )
    return items;
  }

  parseExpr() {
    let left = this.parsePrimary();
    while (this.match('OP') || this.match('AND') || this.match('OR')) {
      const op = this.consume().value;
      const right = this.parsePrimary();
      left = { type: 'BINOP', op, left, right };
    }
    return left;
  }

  parsePrimary() {
    const t = this.peek();
    if (t.type === 'STRING' || t.type === 'NUMBER') { this.consume(); return { type: 'LITERAL', value: t.value }; }
    if (t.type === 'IDENT') { this.consume(); return { type: 'COLUMN', name: t.value }; }
    throw new Error('Unexpected token in expression: ' + t.type);
  }
}

export function parseSQL(sql) {
  const tokens = tokenize(sql);
  return new Parser(tokens).parse();
}
