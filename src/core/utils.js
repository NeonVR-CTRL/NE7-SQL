export function randomId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function randomToken() {
  const a = new Uint8Array(24);
  // Works in both Node 22 and CF Workers
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : require('crypto').webcrypto;
  cryptoObj.getRandomValues(a);
  return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
}
