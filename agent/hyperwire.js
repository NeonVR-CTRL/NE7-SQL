import net from 'net';
import WebSocket from 'ws';

const WS_URL = process.env.NE7_WS_URL || 'ws://localhost:8788/cable';
const PORT = parseInt(process.env.NE7_PORT || '5433', 10);

console.log(`🔌 Hyperwire Agent: binding 127.0.0.1:${PORT} -> ${WS_URL}`);

net.createServer((sock) => {
  const ws = new WebSocket(WS_URL);
  const pend = [];
  ws.on('open', () => { pend.forEach(b => ws.send(b)); pend.length = 0; });
  ws.on('message', (d) => sock.write(d));
  sock.on('data', (d) => { if (ws.readyState === 1) ws.send(d); else pend.push(d); });
  sock.on('end', () => ws.close());
  sock.on('error', () => ws.close());
  ws.on('close', () => sock.end());
  ws.on('error', () => sock.end());
}).listen(PORT, '127.0.0.1', () => {
  console.log(`🔥 Hyperwire ready. Point psql/DBeaver at 127.0.0.1:${PORT}`);
});
