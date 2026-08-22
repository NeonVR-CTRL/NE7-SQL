export function planQuery(ast) {
  if (ast.type === 'SELECT') {
    if (ast.where && ast.where.type === 'BINOP' && ast.where.op === '=') {
      return { 
        type: 'IndexScan', 
        table: ast.table, 
        filter: ast.where, 
        columns: ast.columns, 
        cost: 50,
        routing: 'INLINE'
      };
    }
    return { 
      type: 'SeqScan', 
      table: ast.table, 
      columns: ast.columns, 
      cost: 1000,
      routing: 'ASYNC'
    };
  }
  
  if (ast.type === 'INSERT') {
    // 🛡️ Pass columns and values through to Executor
    return { type: 'Insert', table: ast.table, columns: ast.columns, values: ast.values, cost: 10, routing: 'INLINE' };
  }
  
  if (ast.type === 'CREATE_TABLE' || ast.type === 'DROP_TABLE') {
    // 🛡️ Pass columns through to Executor for DDL
    return { type: 'DDL', action: ast.type, table: ast.table, columns: ast.columns, cost: 5, routing: 'INLINE' };
  }

  return { type: 'Unknown', cost: 9999, routing: 'ASYNC' };
}
