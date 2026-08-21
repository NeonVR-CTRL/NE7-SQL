import { startAPI } from './backend/api.js';
import { startTCP } from './backend/tcp.js';
import { logger } from './core.js';
logger.info('Booting NE7-SQL God-Tier Architecture...');
startAPI(8080);
startTCP(5432);
