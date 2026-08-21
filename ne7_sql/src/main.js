import { StorageRouter } from './storage.js';
import { SQLExecutor } from './executor.js';
import { TransactionManager } from './transaction.js';
import { getBufferPool } from './buffer.js';
import { logger } from './core.js';

class NE7SQLDatabase {
  constructor() {
    this.storage = new StorageRouter();
    this.storage.addApiKey('54148|jg0i3xkpkDJeRANumhJqwO8AIFy8OM0iirtvw8Fi96d6a13d', 'https://app.drime.cloud/api/v1', 20);
    this.txMgr = new TransactionManager();
    this.bufferPool = getBufferPool();
    this.executor = new SQLExecutor(this.storage, this.txMgr, this.bufferPool);
    logger.info('NE7-SQL God-Tier Engine Initialized');
  }
  async exec(sql) {
    const res = await this.executor.execute(sql);
    if (res && res.rows && res.rows.length > 0 && !res.columns) {
      res.columns = Object.keys(res.rows[0]).map(k => ({name: k}));
    }
    return res;
  }
}

export const db = new NE7SQLDatabase();
