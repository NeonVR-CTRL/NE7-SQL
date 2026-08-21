import re

with open('public/index.html', 'r') as f: html = f.read()

old_runsql = """function runSQL(){
  var input = $('#sql-input'); var sql = input.value.trim(); if(!sql) return;
  var out = $('#console-output'); out.innerHTML += '<div class="log-line"><span class="log-module">ne7sql=#</span><span class="log-msg">' + sql + '</span></div>'; input.value = '';
  api('/api/query','POST',{ sql:sql }).then(function(res){ if(res) out.innerHTML += '<div class="log-line"><span class="log-level INFO">OK</span><span class="log-msg">' + res.message + ' (' + res.ms + 'ms)</span></div>'; out.scrollTop = out.scrollHeight; });
}"""

new_runsql = """function runSQL(){
  var input = $('#sql-input'); var sql = input.value.trim(); if(!sql) return;
  var out = $('#console-output'); out.innerHTML += '<div class="log-line"><span class="log-module">ne7sql=#</span><span class="log-msg">' + sql + '</span></div>'; input.value = '';
  api('/api/query','POST',{ sql:sql }).then(function(res){ 
    if(res && res.error) {
      out.innerHTML += '<div class="log-line"><span class="log-level ERROR">ERROR:</span><span class="log-msg" style="color:var(--red)">' + res.error + '</span></div>';
    } else if(res && res.rows && res.rows.length > 0) {
      var cols = Object.keys(res.rows[0]);
      var tbl = '<table style="width:100%;border-collapse:collapse;margin:8px 0;font-size:.75rem;background:rgba(255,255,255,0.02)"><thead><tr>';
      cols.forEach(function(c){ tbl += '<th style="border:1px solid #333;padding:6px 12px;color:var(--accent);text-align:left;font-weight:600">' + c + '</th>'; });
      tbl += '</tr></thead><tbody>';
      res.rows.forEach(function(r){ tbl += '<tr>'; cols.forEach(function(c){ tbl += '<td style="border:1px solid #333;padding:6px 12px;color:var(--text2)">' + (r[c] !== null ? r[c] : '<span style="color:var(--text3)">NULL</span>') + '</td>'; }); tbl += '</tr>'; });
      tbl += '</tbody></table>';
      out.innerHTML += tbl;
      out.innerHTML += '<div class="log-line"><span class="log-level INFO">OK</span><span class="log-msg">(' + res.rowCount + ' rows, ' + res.ms + 'ms)</span></div>';
    } else if(res) {
      out.innerHTML += '<div class="log-line"><span class="log-level INFO">OK</span><span class="log-msg">' + res.command + ' ' + res.rowCount + ' (' + res.ms + 'ms)</span></div>';
    }
    out.scrollTop = out.scrollHeight; 
  }).catch(function(e){ out.innerHTML += '<div class="log-line"><span class="log-level ERROR">ERROR</span></div>'; out.scrollTop = out.scrollHeight; });
}"""

html = html.replace(old_runsql, new_runsql)
with open('public/index.html', 'w') as f: f.write(html)
print("HTML patched with Table Renderer.")
