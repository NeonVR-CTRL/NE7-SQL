export default `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<title>NE7-SQL — Enterprise Cloud Database</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#060608;--surface:rgba(17,17,20,.8);--surface2:rgba(24,24,28,.92);--surface3:#1F1F23;--border:rgba(255,255,255,.08);--text:#FAFAFA;--text2:#A1A1AA;--text3:#71717A;--accent:#818CF8;--accent2:#C084FC;--green:#34D399;--red:#F87171;--amber:#FBBF24;--radius:14px}
body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
button{font-family:inherit;cursor:pointer}input,select{font-family:inherit}
.hidden{display:none!important}
.screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}
.auth-card{background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:36px;width:100%;max-width:420px}
.auth-card h1{font-size:1.3rem;margin-bottom:6px}.auth-card p{color:var(--text3);font-size:.85rem;margin-bottom:22px}
.field{margin-bottom:16px}.field label{display:block;font-size:.75rem;font-weight:600;color:var(--text2);margin-bottom:6px}
.field input{width:100%;padding:11px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.9rem;outline:none}
.field input:focus{border-color:var(--accent)}
.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:10px;font-size:.85rem;font-weight:600;border:1px solid transparent}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff}
.btn-ghost{background:var(--surface);border-color:var(--border);color:var(--text2)}
.btn-danger{background:rgba(248,113,113,.12);color:var(--red);border-color:rgba(248,113,113,.3)}
.btn-sm{padding:6px 10px;font-size:.75rem}
.app{display:flex;min-height:100vh}
.sidebar{width:230px;background:rgba(10,10,12,.92);border-right:1px solid var(--border);padding:20px 12px;position:fixed;inset:0 auto 0 0;display:flex;flex-direction:column;overflow-y:auto}
.logo{font-weight:800;font-size:1rem;margin-bottom:24px;padding:0 12px}.logo span{color:var(--text3);font-weight:400;font-size:.7rem}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;color:var(--text2);font-size:.85rem;font-weight:500;cursor:pointer;margin-bottom:2px}
.nav-item:hover{background:rgba(255,255,255,.05);color:var(--text)}
.nav-item.active{background:rgba(129,140,248,.15);color:var(--accent)}
.nav-sep{font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);padding:14px 12px 6px}
.main{flex:1;margin-left:230px;padding:28px 36px;max-width:1300px}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:12px;flex-wrap:wrap}
.header h1{font-size:1.5rem;font-weight:800}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin-bottom:24px}
.stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px}
.stat .v{font-size:1.6rem;font-weight:800}.stat .l{font-size:.75rem;color:var(--text3)}
.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:20px}
.panel-h{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:.9rem;flex-wrap:wrap;gap:8px}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:10px 18px;font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);background:var(--surface2)}
td{padding:12px 18px;font-size:.83rem;border-top:1px solid var(--border);font-family:ui-monospace,monospace}
.badge{padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:600}
.badge-green{background:rgba(52,211,153,.12);color:var(--green)}
.badge-red{background:rgba(248,113,113,.12);color:var(--red)}
.badge-purple{background:rgba(129,140,248,.12);color:var(--accent)}
.icon-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text2);display:inline-flex;align-items:center;justify-content:center;margin-right:4px}
.icon-btn:hover{color:var(--accent);border-color:var(--accent)}
.icon-btn.danger:hover{color:var(--red);border-color:var(--red)}
.bar{height:6px;background:var(--surface3);border-radius:3px;overflow:hidden}.bar>div{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2))}
.terminal{background:rgba(8,8,10,.95);border:1px solid var(--border);border-radius:var(--radius);font-family:ui-monospace,monospace}
.term-body{padding:14px;height:300px;overflow-y:auto;font-size:.78rem;line-height:1.8}
.term-in{display:flex;gap:8px;padding:12px;border-top:1px solid var(--border)}
.term-in input{flex:1;background:none;border:none;outline:none;color:var(--text);font-family:inherit;font-size:.8rem}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px}
.modal-card{background:var(--surface2);border:1px solid var(--border);border-radius:18px;padding:28px;width:100%;max-width:460px;max-height:85vh;overflow-y:auto}
.toast{position:fixed;bottom:20px;right:20px;background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:12px 18px;font-size:.85rem;z-index:200;max-width:90vw}
.danger-zone{border:1px solid rgba(248,113,113,.35);border-radius:var(--radius);padding:22px;background:rgba(248,113,113,.04)}
.danger-zone h3{color:var(--red);margin-bottom:6px}.danger-zone p{color:var(--text3);font-size:.85rem;margin-bottom:14px}
.src-wrap{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}
.src-list{width:220px;max-height:480px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;background:var(--surface)}
.src-file{padding:9px 12px;font-size:.75rem;font-family:ui-monospace,monospace;cursor:pointer;color:var(--text2);border-bottom:1px solid var(--border)}
.src-file:hover{background:rgba(255,255,255,.04)}.src-file.active{color:var(--accent);background:rgba(129,140,248,.1)}
.src-view{flex:1;min-width:0;max-height:480px;overflow:auto;background:rgba(8,8,10,.95);border:1px solid var(--border);border-radius:10px;padding:16px}
.src-view pre{font-size:.72rem;line-height:1.6;color:#E2E8F0;white-space:pre-wrap;word-break:break-word}
.arch-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-bottom:14px}
.arch-card h3{font-size:.95rem;margin-bottom:8px;color:var(--accent)}
.arch-card p{font-size:.82rem;color:var(--text2);line-height:1.6}
.flow{background:rgba(8,8,10,.95);border:1px solid var(--border);border-radius:10px;padding:16px;font-family:ui-monospace,monospace;font-size:.78rem;color:var(--green);white-space:pre;overflow-x:auto;line-height:1.7}
@media(max-width:900px){.sidebar{display:none}.main{margin-left:0;padding:16px}}
</style></head><body>

<div id="screen-setup" class="screen hidden"><div class="auth-card"><h1>⚡ NE7-SQL Setup</h1><p>First run — create your admin account and connect Drime storage.</p>
<div class="field"><label>Admin Email</label><input id="su-email" type="email" placeholder="you@company.com"></div>
<div class="field"><label>Admin Password</label><input id="su-pass" type="password"></div>
<div class="field"><label>Drime API Key</label><input id="su-key" placeholder="54148|..."></div>
<button class="btn btn-primary" id="su-go" style="width:100%;justify-content:center">Initialize Platform</button></div></div>

<div id="screen-login" class="screen hidden"><div class="auth-card"><h1>⚡ NE7-SQL</h1><p>Sign in — admins get full control, customers get their workspace.</p>
<div class="field"><label>Email</label><input id="li-email" type="email"></div>
<div class="field"><label>Password</label><input id="li-pass" type="password"></div>
<button class="btn btn-primary" id="li-go" style="width:100%;justify-content:center">Sign In</button></div></div>

<div id="app" class="app hidden">
<aside class="sidebar"><div class="logo">NE7-SQL <span id="role-tag"></span></div><div id="nav"></div></aside>
<main class="main"><div id="content"></div></main>
</div>
<div id="modal-root"></div><div id="toast-root"></div>

<script>
(function(){
'use strict';
var TOKEN=localStorage.getItem('ne7_token')||'';var ROLE='',NAME='';
function $(s){return document.querySelector(s);}
function api(path,method,body){var h={'Content-Type':'application/json'};if(TOKEN)h['Authorization']='Bearer '+TOKEN;return fetch(path,{method:method||'GET',headers:h,body:body?JSON.stringify(body):undefined}).then(function(r){return r.json();});}
function toast(m){var t=document.createElement('div');t.className='toast';t.textContent=m;$('#toast-root').appendChild(t);setTimeout(function(){t.remove();},3500);}
function modal(html){$('#modal-root').innerHTML='<div class="modal"><div class="modal-card">'+html+'</div></div>';}
function closeModal(){$('#modal-root').innerHTML='';}
api('/api/me').then(function(me){if(me&&me.role){ROLE=me.role;NAME=me.name;enterApp();}else{$('#screen-setup').classList.remove('hidden');$('#screen-login').classList.remove('hidden');$('#screen-setup').classList.add('hidden');}});
$('#su-go').addEventListener('click',function(){api('/api/setup','POST',{adminEmail:$('#su-email').value,adminPassword:$('#su-pass').value,drimeKey:$('#su-key').value}).then(function(r){if(r.ok){toast('Platform initialized! Now sign in.');$('#screen-setup').classList.add('hidden');$('#screen-login').classList.remove('hidden');}else toast(r.error||'Failed');});});
$('#li-go').addEventListener('click',function(){api('/api/login','POST',{email:$('#li-email').value,password:$('#li-pass').value}).then(function(r){if(r.token){TOKEN=r.token;ROLE=r.role;NAME=r.name;localStorage.setItem('ne7_token',TOKEN);enterApp();}else toast(r.error||'Login failed');});});
function enterApp(){$('#screen-setup').classList.add('hidden');$('#screen-login').classList.add('hidden');$('#app').classList.remove('hidden');$('#role-tag').textContent=ROLE==='admin'?'ADMIN':'CUSTOMER';buildNav();nav(ROLE==='admin'?'overview':'databases');}
function buildNav(){var items=ROLE==='admin'?[['overview','Overview'],['databases','All Databases'],['keys','API Keys'],['admins','Admins'],['customers','Customers'],['console','SQL Console'],['panel','NE7 Panel'],['settings','Settings']]:[['databases','My Databases'],['console','SQL Console']];
$('#nav').innerHTML=items.map(function(i){return '<div class="nav-item" data-v="'+i[0]+'">'+i[1]+'</div>';}).join('')+'<div class="nav-sep">Session</div><div class="nav-item" id="logout">Logout</div>';
document.querySelectorAll('.nav-item').forEach(function(n){n.addEventListener('click',function(){if(n.id==='logout'){localStorage.removeItem('ne7_token');location.reload();}nav(n.dataset.v);});});}
function nav(v){document.querySelectorAll('.nav-item').forEach(function(n){n.classList.toggle('active',n.dataset.v===v);});
if(v==='overview')viewOverview();if(v==='databases')viewDatabases();if(v==='keys')viewKeys();if(v==='admins')viewAdmins();if(v==='customers')viewCustomers();if(v==='console')viewConsole();if(v==='panel')viewPanel();if(v==='settings')viewSettings();}

function viewOverview(){api('/api/admin/storage').then(function(s){
$('#content').innerHTML='<div class="header"><h1>Overview</h1></div><div class="grid">'
+'<div class="stat"><div class="v">'+s.grandTotalGB+' GB</div><div class="l">Grand Total Storage</div></div>'
+'<div class="stat"><div class="v">'+s.grandUsedGB+' GB</div><div class="l">Grand Used</div></div>'
+'<div class="stat"><div class="v">'+s.grandBalanceGB+' GB</div><div class="l">Grand Balance</div></div></div>'
+'<div class="panel"><div class="panel-h">Storage per API Key (auto-failover pool)</div><table><tr><th>Key</th><th>Status</th><th>Capacity</th><th>Used</th><th>Balance</th><th>Utilization</th></tr>'
+s.rows.map(function(r){var pct=Math.round(r.usedGB/r.capacityGB*100);return '<tr><td>'+r.nickname+'</td><td><span class="badge '+(r.status==='HEALTHY'?'badge-green':'badge-red')+'">'+r.status+'</span></td><td>'+r.capacityGB+' GB</td><td>'+r.usedGB+' GB</td><td>'+r.balanceGB+' GB</td><td style="width:140px"><div class="bar"><div style="width:'+pct+'%"></div></div></td></tr>';}).join('')
+'</table></div>';});}

function viewDatabases(){api('/api/databases').then(function(dbs){
$('#content').innerHTML='<div class="header"><h1>'+(ROLE==='admin'?'All Databases':'My Databases')+'</h1></div><div class="grid">'
+(dbs.length?dbs.map(function(d){return '<div class="stat"><div class="v" style="font-size:1rem">'+d.name+'</div><div class="l">'+d.tables+' tables'+(d.key?' · key: '+d.key:'')+'</div></div>';}).join(''):'<div class="stat"><div class="l">No databases yet</div></div>')+'</div>';});}

function viewKeys(){api('/api/admin/keys').then(function(keys){
$('#content').innerHTML='<div class="header"><h1>API Keys</h1><button class="btn btn-primary" id="add-key">+ Add Key</button></div>'
+'<div class="panel"><table><tr><th>Nickname</th><th>API Key</th><th>Status</th><th>Capacity</th><th>Actions</th></tr>'
+keys.map(function(k){return '<tr><td>'+k.nickname+'</td><td data-full="'+k.id+'">'+k.key+'</td><td><span class="badge '+(k.status==='HEALTHY'?'badge-green':'badge-red')+'">'+(k.status||'UNKNOWN')+'</span></td><td>'+k.capacityGB+' GB</td><td>'
+'<button class="icon-btn" data-eye="'+k.id+'">👁</button><button class="icon-btn" data-copy="'+k.id+'">⧉</button><button class="icon-btn" data-edit="'+k.id+'" data-nick="'+k.nickname+'">✎</button><button class="icon-btn danger" data-del="'+k.id+'">🗑</button></td></tr>';}).join('')+'</table></div>';
$('#add-key').addEventListener('click',function(){modal('<h2>Add API Key</h2><div class="field"><label>Nickname</label><input id="k-nick"></div><div class="field"><label>Key</label><input id="k-val"></div><button class="btn btn-primary" id="k-save">Save</button>');$('#k-save').addEventListener('click',function(){api('/api/admin/keys','POST',{nickname:$('#k-nick').value,key:$('#k-val').value}).then(function(r){closeModal();toast(r.healthy?'Key added (healthy)':'Key added but unreachable');viewKeys();});});});
document.querySelectorAll('[data-eye]').forEach(function(b){b.addEventListener('click',function(){var id=b.dataset.eye;var td=document.querySelector('[data-full="'+id+'"]');api('/api/admin/keys/'+id+'/reveal').then(function(r){td.textContent=td.dataset.shown?r.key.slice(0,6)+'••••••••'+r.key.slice(-4):r.key;td.dataset.shown=td.dataset.shown?'':'1';});});});
document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){api('/api/admin/keys/'+b.dataset.copy+'/reveal').then(function(r){navigator.clipboard.writeText(r.key);toast('Copied');});});});
document.querySelectorAll('[data-edit]').forEach(function(b){b.addEventListener('click',function(){var id=b.dataset.edit;modal('<h2>Edit Key</h2><div class="field"><label>Nickname</label><input id="e-nick" value="'+b.dataset.nick+'"></div><button class="btn btn-primary" id="e-save">Save</button>');$('#e-save').addEventListener('click',function(){api('/api/admin/keys','PUT',{id:id,nickname:$('#e-nick').value}).then(function(){closeModal();viewKeys();});});});});
document.querySelectorAll('[data-del]').forEach(function(b){b.addEventListener('click',function(){if(confirm('Delete this key?'))api('/api/admin/keys/'+b.dataset.del,'DELETE').then(viewKeys);});});});}

function viewAdmins(){api('/api/admin/admins').then(function(list){
$('#content').innerHTML='<div class="header"><h1>Admins</h1><button class="btn btn-primary" id="add-admin">+ Add Admin</button></div>'
+'<div class="panel"><table><tr><th>Email</th><th>Actions</th></tr>'+list.map(function(e){return '<tr><td>'+e+'</td><td><button class="icon-btn danger" data-del="'+encodeURIComponent(e)+'">🗑</button></td></tr>';}).join('')+'</table></div>';
$('#add-admin').addEventListener('click',function(){modal('<h2>Add Admin</h2><div class="field"><label>Email</label><input id="a-email"></div><div class="field"><label>Temp Password</label><input id="a-pass" value="admin123"></div><button class="btn btn-primary" id="a-save">Save</button>');$('#a-save').addEventListener('click',function(){api('/api/admin/admins','POST',{email:$('#a-email').value,password:$('#a-pass').value}).then(function(){closeModal();viewAdmins();});});});
document.querySelectorAll('[data-del]').forEach(function(b){b.addEventListener('click',function(){if(confirm('Remove admin?'))api('/api/admin/admins/'+b.dataset.del,'DELETE').then(viewAdmins);});});});}

function viewCustomers(){api('/api/admin/customers').then(function(list){
$('#content').innerHTML='<div class="header"><h1>Customers</h1><button class="btn btn-primary" id="add-cust">+ Add Customer</button></div>'
+'<div class="panel"><table><tr><th>Name</th><th>Email</th><th>Tenant</th><th>Actions</th></tr>'
+list.map(function(c){return '<tr><td>'+c.name+'</td><td>'+c.email+'</td><td>'+c.tenantId+'</td><td><button class="icon-btn danger" data-del="'+c.id+'">🗑</button></td></tr>';}).join('')+'</table></div>';
$('#add-cust').addEventListener('click',function(){modal('<h2>Add Customer</h2><div class="field"><label>Name</label><input id="c-name"></div><div class="field"><label>Email</label><input id="c-email"></div><div class="field"><label>Password</label><input id="c-pass"></div><button class="btn btn-primary" id="c-save">Create + Provision DB</button>');$('#c-save').addEventListener('click',function(){api('/api/admin/customers','POST',{name:$('#c-name').value,email:$('#c-email').value,password:$('#c-pass').value}).then(function(r){closeModal();toast('Provisioned on key: '+r.key);viewCustomers();});});});
document.querySelectorAll('[data-del]').forEach(function(b){b.addEventListener('click',function(){if(confirm('Delete customer?'))api('/api/admin/customers/'+b.dataset.del,'DELETE').then(viewCustomers);});});});}

var curDb=null;
function viewConsole(){api('/api/databases').then(function(dbs){
$('#content').innerHTML='<div class="header"><h1>SQL Console</h1><select id="db-sel" style="padding:8px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--text)">'+dbs.map(function(d){return '<option value="'+d.id+'">'+d.name+'</option>';}).join('')+'</select></div>'
+'<div class="terminal"><div class="term-body" id="term"></div><div class="term-in"><span style="color:var(--accent)">=#</span><input id="sql" placeholder="SELECT * FROM ..."><button class="btn btn-primary" id="run">Run</button></div></div>';
curDb=dbs.length?dbs[0].id:null;
$('#db-sel').addEventListener('change',function(e){curDb=e.target.value;});
function run(){var sql=$('#sql').value;if(!sql||!curDb)return;$('#term').innerHTML+='<div style="color:var(--accent)">=&gt; '+sql+'</div>';$('#sql').value='';
api('/api/query'+(ROLE==='admin'?'?tenant='+curDb:''),'POST',{sql:sql,tenantId:curDb}).then(function(r){$('#term').innerHTML+='<div>'+(r.error?('<span style="color:var(--red)">'+r.error+'</span>'):(r.message+' '+(r.rows?('('+r.rows.length+' rows) '+JSON.stringify(r.rows.slice(0,5)):''))+(r.key?(' <span style="color:var(--text3)">[key:'+r.key+']</span>'):'')))+'</div>';$('#term').scrollTop=1e9;});}
$('#run').addEventListener('click',run);$('#sql').addEventListener('keydown',function(e){if(e.key==='Enter')run();});});}

function viewPanel(){
$('#content').innerHTML='<div class="header"><h1>📘 NE7 Panel — Full Stack</h1></div>'
+'<div class="arch-card"><h3>Architecture (CF + Drime, zero secrets)</h3><p><b>Cloudflare Worker</b> = the brain (SQL engine + auth + routing). <b>Cloudflare KV</b> = secure keyring holding your Drime keys, admins, customers, and signing secret. <b>Drime</b> = the warehouse holding all customer data. The Worker wakes up, reads the keyring from KV, and uses a Drime key to serve data.</p></div>'
+'<div class="arch-card"><h3>How the database connects (Inverted Postgres)</h3><p>Standard Postgres tools speak raw TCP. Cloudflare can\'t listen on TCP. So the TCP socket is <b>inverted</b>: a tiny client-side Hyperwire Agent binds <code>localhost:5432</code>, tunnels the wire bytes over WebSocket to the Worker, which executes SQL against Drime and streams real Postgres bytes back.</p>'
+'<div class="flow">[psql / DBeaver]\n   |  TCP (localhost:5432)\n   v\n[Hyperwire Agent]  (client-side, invisible)\n   |  WebSocket (Postgres wire bytes)\n   v\n[CF Worker /cable]  -> Executor -> Drime\n   |  results\n   v\n[back to psql as Postgres bytes]</div></div>'
+'<div class="arch-card"><h3>Data flow per query</h3><p>1. Client sends SQL. 2. Worker verifies session token (HMAC, secret in KV). 3. Worker picks the tenant\'s Drime key (auto-failover to next healthy key). 4. Executor reads the tenant manifest + WAL from Drime. 5. Results returned as JSON or Postgres bytes.</p></div>'
+'<div class="arch-card"><h3>Full Source Code</h3><p>Browse every file that powers this platform.</p><div class="src-wrap"><div class="src-list" id="src-list"></div><div class="src-view"><pre id="src-code">Select a file…</pre></div></div></div>';
api('/api/admin/source').then(function(src){var names=Object.keys(src);$('#src-list').innerHTML=names.map(function(n){return '<div class="src-file" data-f="'+n+'">'+n+'</div>';}).join('');
document.querySelectorAll('.src-file').forEach(function(f){f.addEventListener('click',function(){document.querySelectorAll('.src-file').forEach(function(x){x.classList.remove('active');});f.classList.add('active');$('#src-code').textContent=src[f.dataset.f];});});});}

function viewSettings(){
$('#content').innerHTML='<div class="header"><h1>Settings</h1></div>'
+'<div class="danger-zone"><h3>⚠ Danger Zone</h3><p>Reset wipes <b>all databases and all customers</b> from Drime, but <b>keeps your admins and API keys</b>. This cannot be undone.</p><button class="btn btn-danger" id="reset-btn">Reset Platform (wipe DBs + customers)</button></div>';
$('#reset-btn').addEventListener('click',function(){modal('<h2 style="color:var(--red)">Confirm Full Reset</h2><p style="color:var(--text3);margin:12px 0">This deletes every database and customer. Admins and API keys are preserved. Type <b>RESET</b> to confirm.</p><div class="field"><input id="reset-word" placeholder="RESET"></div><button class="btn btn-danger" id="reset-do" style="width:100%;justify-content:center">Wipe Everything</button>');
$('#reset-do').addEventListener('click',function(){if($('#reset-word').value!=='RESET'){toast('Type RESET to confirm','error');return;}api('/api/admin/reset','POST',{}).then(function(r){closeModal();toast('Reset complete. Deleted '+r.deleted+' files.');});});});}
})();
</script></body></html>\`;
