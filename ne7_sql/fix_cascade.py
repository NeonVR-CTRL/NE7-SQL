import os

# Fix the phantom BufferPool import in access.js
with open('src/access.js', 'r') as f:
    content = f.read()

content = content.replace(
    "import { BufferPool, PageHeader, PageOperations, ItemId, ItemPointer, getBufferPool } from './buffer.js';",
    "import { PageHeader, PageOperations, ItemId, ItemPointer, getBufferPool } from './buffer.js';"
)

with open('src/access.js', 'w') as f:
    f.write(content)

print("✅ Fixed ESM Cascade Failure in access.js")
