import os

# 1. Fix core.js (Rename constant to MAXALIGN_SIZE)
core_js = """
export const BLCKSZ = 8192;
export const MAXALIGN_SIZE = 8;
export const SizeOfPageHeaderData = 24;
export const HEAP_XMAX_COMMITTED = 0x0004;
export const InvalidTransactionId = 0;
export const FirstNormalTransactionId = 3;
export const MaxTransactionId = 4294967295;

export const logger = {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
  debug: (msg, meta) => {},
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || '')
};

export function crc32c(data) {
  let crc = 0xFFFFFFFF;
  const table = getCRC32CTable();
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
let crc32cTable = null;
function getCRC32CTable() {
  if (crc32cTable) return crc32cTable;
  crc32cTable = new Uint32Array(256);
  const p = 0x82F63B78;
  for (let i = 0; i < 256; i++) { let c = i; for (let j = 0; j < 8; j++) c = (c & 1) ? (c >>> 1) ^ p : c >>> 1; crc32cTable[i] = c >>> 0; }
  return crc32cTable;
}
export function MAXALIGN(len) { return ((len) + (MAXALIGN_SIZE - 1)) & ~(MAXALIGN_SIZE - 1); }
"""

with open('src/core.js', 'w') as f:
    f.write(core_js)

# 2. Fix buffer.js to use the MAXALIGN() function properly
with open('src/buffer.js', 'r') as f:
    buf = f.read()

# Replace the raw math with the proper function call
buf = buf.replace(
    "return ((size) + (MAXALIGN - 1)) & ~(MAXALIGN - 1);",
    "return MAXALIGN(size);"
)

with open('src/buffer.js', 'w') as f:
    f.write(buf)

print("✅ Fixed MAXALIGN duplicate declaration and buffer alignment math.")
