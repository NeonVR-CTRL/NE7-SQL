export class DrimeSmgr {
  constructor(apiKey, base) {
    this.apiKey = apiKey;
    this.base = base;
    this.index = new Map();
    this.indexLoaded = false;
    this.cache = new Map(); 
  }

  safeKey(key) { return key.replace(/\//g, '__'); }

  getApiHeaders() {
    return { 'Authorization': `Bearer ${this.apiKey}`, 'Accept': 'application/json' };
  }

  getDownloadHeaders() {
    return { 'Authorization': `Bearer ${this.apiKey}` };
  }

  async loadIndex() {
    if (this.indexLoaded) return;
    try {
      const listR = await fetch(`${this.base}/drive/file-entries?workspaceId=0`, { headers: this.getApiHeaders() });
      if (listR.ok) {
        const data = await listR.json();
        // Sort to get the newest index file
        const files = data.data.sort((a, b) => b.id - a.id);
        const indexFile = files.find(f => f.name.startsWith('ne7_index'));
        
        if (indexFile) {
          // 🛡️ MASTER FIX: Base64 encode the ID and use /file-entries/download/
          const hash = btoa(String(indexFile.id));
          const dl = await fetch(`${this.base}/file-entries/download/${hash}`, { headers: this.getDownloadHeaders() });
          
          if (dl.ok) {
            const text = await dl.text();
            if (text.trim().startsWith('{')) {
              this.index = new Map(Object.entries(JSON.parse(text)));
              this.indexLoaded = true;
              return;
            }
          }
        }
      }
    } catch(e) {}
    
    // Fallback: Rebuild from file list
    try {
      const listR = await fetch(`${this.base}/drive/file-entries?workspaceId=0`, { headers: this.getApiHeaders() });
      if (listR.ok) {
        const data = await listR.json();
        for (const file of data.data) if (!file.name.startsWith('ne7_index')) this.index.set(file.name, file.id);
      }
    } catch(e) {}
    this.indexLoaded = true;
  }

  async saveIndex() {
    const data = new TextEncoder().encode(JSON.stringify(Object.fromEntries(this.index)));
    const fd = new FormData();
    fd.append('file', new Blob([data]), `ne7_index_${Date.now()}.json`);
    fd.append('parentId', ''); fd.append('workspaceId', '0');
    const r = await fetch(`${this.base}/uploads`, { method: 'POST', headers: this.getApiHeaders(), body: fd });
    if (r.ok) console.log('✅ Index saved to Drime');
  }

  async get(key) {
    const sKey = this.safeKey(key);
    if (this.cache.has(sKey)) return this.cache.get(sKey);
    
    await this.loadIndex();
    const fileId = this.index.get(sKey);
    if (!fileId) return null;

    try {
      // 🛡️ MASTER FIX: Base64 encode the ID and use /file-entries/download/
      const hash = btoa(String(fileId));
      const r = await fetch(`${this.base}/file-entries/download/${hash}`, { headers: this.getDownloadHeaders() });
      
      if (!r.ok) return null;
      const data = new Uint8Array(await r.arrayBuffer());
      
      this.cache.set(sKey, data);
      return data;
    } catch (e) { return null; }
  }

  async put(key, data) {
    await this.loadIndex();
    const sKey = this.safeKey(key);
    this.cache.set(sKey, data);
    
    const fd = new FormData();
    fd.append('file', new Blob([data]), sKey);
    fd.append('parentId', ''); fd.append('workspaceId', '0');
    
    const r = await fetch(`${this.base}/uploads`, { method: 'POST', headers: this.getApiHeaders(), body: fd });
    if (!r.ok) throw new Error(`Upload failed: ${r.status}`);
    const res = await r.json();
    
    this.index.set(sKey, res.fileEntry.id);
    await this.saveIndex();
    return true;
  }
}
