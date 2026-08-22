export default `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<title>NE7-SQL — Enterprise Cloud Database</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#060608;--surface:rgba(17,17,20,.8);--surface2:rgba(24,24,28,.92);--surface3:#1F1F23;--border:rgba(255,255,255,.08);--border2:rgba(255,255,255,.12);--text:#FAFAFA;--text2:#A1A1AA;--text3:#71717A;--accent:#818CF8;--accent2:#C084FC;--accent3:#38BDF8;--green:#34D399;--red:#F87171;--amber:#FBBF24;--radius:16px;--radius-sm:10px}
body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}
button{font-family:inherit;cursor:pointer}input,select{font-family:inherit}
.hidden{display:none!important}
#bg-canvas{position:fixed;inset:0;z-index:0;pointer-events:none}
.aurora{position:fixed;top:0;left:0;right:0;height:2px;z-index:60;background:linear-gradient(90deg,transparent,var(--accent),var(--accent2),var(--accent3),transparent);background-size:200% 100%;animation:aur 6s linear infinite;opacity:.7}
@keyframes aur{0%{background-position:0% 0}100%{background-position:200% 0}}
.boot{position:fixed;inset:0;z-index:500;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;transition:opacity .6s,visibility .6s}
.boot.hidden{opacity:0;visibility:hidden;pointer-events:none}
.boot-logo{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--accent2));animation:bp 1.6s infinite}
@keyframes bp{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
.boot-text{font-size:.8rem;color:var(--text3);letter-spacing:.2em;text-transform:uppercase;font-weight:600}
.screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;position:relative;z-index:2}
.auth-card{background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:36px;width:100%;max-width:420px}
.auth-card h1{font-size:1.3rem;margin-bottom:6px}.auth-card p{color:var(--text3);font-size:.85rem;margin-bottom:22px}
.switch-line{margin-top:14px;font-size:.78rem;color:var(--text3);text-align:center}
.switch-line a{color:var(--accent);text-decoration:none}
.field{margin-bottom:16px}.field label{display:block;font-size:.75rem;font-weight:600;color:var(--text2);margin-bottom:6px}
.field input{width:100%;padding:11px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.9rem;outline:none}
.field input:focus{border-color:var(--accent)}
.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:10px;font-size:.85rem;font-weight:600;border:1px solid transparent}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff}
.btn-ghost{background:var(--surface);border-color:var(--border);color:var(--text2)}
.btn-danger{background:rgba(248,113,113,.12);color:var(--red);border-color:rgba(248,113,113,.3)}
.btn-sm{padding:6px 10px;font-size:.72rem}
.app{display:flex;min-height:100vh;position:relative;z-index:2}
.sidebar{width:230px;background:rgba(10,10,12,.92);border-right:1px solid var(--border);padding:20px 12px;position:fixed;inset:0 auto 0 0;display:flex;flex-direction:column;overflow-y:auto;z-index:100}
.logo{font-weight:800;font-size:1rem;margin-bottom:24px;padding:0 12px}.logo span{color:var(--text3);font-weight:400;font-size:.7rem}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;color:var(--text2);font-size:.85rem;font-weight:500;cursor:pointer;margin-bottom:2px}
.nav-item:hover{background:rgba(255,255,255,.05);color:var(--text)}
.nav-item.active{background:rgba(129,140,248,.15);color:var(--accent)}
.nav-sep{font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);padding:14px 12px 6px}
.sidebar-footer{margin-top:auto;padding:12px;border-top:1px solid var(--border)}
.status-pill{display:flex;align-items:center;gap:8px;font-size:.75rem;color:var(--text2)}
.status-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:pul 2s infinite}
@keyframes pul{0%,100%{opacity:1}50%{opacity:.4}}
.main{flex:1;margin-left:230px;padding:28px 36px;max-width:1300px}
.mobile-topbar{display:none;position:fixed;top:0;left:0;right:0;height:56px;background:rgba(6,6,8,.85);border-bottom:1px solid var(--border);z-index:90;align-items:center;justify-content:space-between;padding:0 16px}
.menu-btn{background:none;border:none;color:var(--text);cursor:pointer;padding:8px;font-size:1.2rem}
.mobile-logo{font-weight:700}
.sidebar-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:95;opacity:0;visibility:hidden;transition:.3s}
.sidebar-backdrop.active{opacity:1;visibility:visible}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:12px;flex-wrap:wrap}
.header h1{font-size:1.5rem;font-weight:800}
.header-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.bento{display:grid;grid-template-columns:repeat(12,1fr);gap:16px;margin-bottom:24px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;transition:.3s}
.card:hover{border-color:var(--border2)}
.span-3{grid-column:span 3}.span-4{grid-column:span 4}.span-8{grid-column:span 8}
.stat-card{display:flex;flex-direction:column;gap:12px}
.stat-value{font-size:2rem;font-weight:800}
.stat-label{font-size:.75rem;color:var(--text3)}
.section-title{font-size:1rem;font-weight:700;margin-bottom:16px}
.db-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.db-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;cursor:pointer;transition:.3s}
.db-card:hover{border-color:var(--accent)}
.db-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;gap:8px}
.db-name{font-weight:700;font-size:.9rem;font-family:ui-monospace,monospace;word-break:break-all}
.db-status{font-size:.6rem;font-weight:700;text-transform:uppercase;padding:3px 8px;border-radius:4px;background:rgba(52,211,153,.1);color:var(--green)}
.db-meta{display:flex;gap:16px;font-size:.72rem;color:var(--text3);margin-bottom:16px;flex-wrap:wrap}
.table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow-x:auto}
table{width:100%;border-collapse:collapse;min-width:640px}
th{text-align:left;padding:12px 20px;font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);background:var(--surface2)}
td{padding:14px 20px;font-size:.82rem;border-bottom:1px solid var(--border);font-family:ui-monospace,monospace}
.badge{padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:600}
.badge-green{background:rgba(52,211,153,.1);color:var(--green)}.badge-red{background:rgba(248,113,113,.1);color:var(--red)}
.icon-btn{width:36px;height:36px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text2);display:inline-flex;align-items:center;justify-content:center;margin-right:4px}
.icon-btn:hover{color:var(--accent);border-color:var(--accent)}
.icon-btn.danger:hover{color:var(--red);border-color:var(--red)}
.terminal{background:rgba(8,8,10,.95);border:1px solid var(--border);border-radius:var(--radius);font-family:ui-monospace,monospace}
.terminal-body{padding:16px;height:320px;overflow-y:auto;font-size:.78rem;line-height:1.9}
.log-line{display:flex;gap:12px;flex-wrap:wrap}
.log-level.INFO{color:var(--green)}.log-level.ERROR{color:var(--red)}
.log-module{color:var(--accent)}
.log-msg{color:var(--text2);word-break:break-all}
.sql-input-wrap{display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(8,8,10,.9);border:1px solid var(--border);border-radius:10px}
.sql-prompt{color:var(--accent);font-weight:600;font-size:.8rem}
.sql-input{flex:1;background:none;border:none;outline:none;color:var(--text);font-family:ui-monospace,monospace;font-size:.8rem}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:none;align-items:center;justify-content:center;z-index:200;padding:16px}
.modal-overlay.active{display:flex}
.modal{background:var(--surface2);border:1px solid var(--border2);border-radius:20px;padding:32px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto}
.modal h2{font-size:1.1rem;margin-bottom:4px}.modal p{font-size:.8rem;color:var(--text3);margin-bottom:24px}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:28px;flex-wrap:wrap}
.form-input{width:100%;padding:11px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.85rem;outline:none}
.form-label{display:block;font-size:.75rem;font-weight:600;color:var(--text2);margin-bottom:6px}
.form-group{margin-bottom:18px}
.danger-zone{border:1px solid rgba(248,113,113,.35);border-radius:var(--radius);padding:22px;background:rgba(248,113,113,.04)}
.danger-zone h3{color:var(--red);margin-bottom:6px}.danger-zone p{color:var(--text3);font-size:.85rem;margin-bottom:14px}
.arch-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-bottom:14px}
.arch-card h3{font-size:.95rem;margin-bottom:8px;color:var(--accent)}
.arch-card p{font-size:.82rem;color:var(--text2);line-height:1.6}
.flow{background:rgba(8,8,10,.95);border:1px solid var(--border);border-radius:10px;padding:16px;font-family:ui-monospace,monospace;font-size:.78rem;color:var(--green);white-space:pre;overflow-x:auto;line-height:1.7}
.src-wrap{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}
.src-list{width:220px;max-height:480px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;background:var(--surface)}
.src-file{padding:9px 12px;font-size:.75rem;font-family:ui-monospace,monospace;cursor:pointer;color:var(--text2);border-bottom:1px solid var(--border)}
.src-file.active{color:var(--accent);background:rgba(129,140,248,.1)}
.src-view{flex:1;min-width:0;max-height:480px;overflow:auto;background:rgba(8,8,10,.95);border:1px solid var(--border);border-radius:10px;padding:16px}
.src-view pre{font-size:.72rem;line-height:1.6;color:#E2E8F0;white-space:pre-wrap;word-break:break-word}
.toast-container{position:fixed;bottom:24px;right:24px;z-index:400;display:flex;flex-direction:column;gap:10px}
.toast{display:flex;align-items:center;gap:12px;padding:14px 20px;background:var(--surface2);border:1px solid var(--border2);border-radius:12px;font-size:.85rem;max-width:90vw}
@media(max-width:1200px){.span-3{grid-column:span 6}.span-4{grid-column:span 6}.span-8{grid-column:span 12}}
@media(max-width:900px){.mobile-topbar{display:flex}.sidebar{transform:translateX(-100%);width:260px;padding-top:72px}.sidebar.open{transform:translateX(0)}.main{margin-left:0;padding:72px 16px 32px}.span-3,.span-4,.span-8{grid-column:span 12}}
@media(max-width:640px){.main{padding:68px 12px 24px}.bento,.db-grid{gap:12px}.card{padding:18px}.stat-value{font-size:1.6rem}.header h1{font-size:1.35rem}.header-actions{width:100%}.header-actions .btn{flex:1;justify-content:center}.modal{padding:24px}.toast-container{left:12px;right:12px;bottom:12px}.toast{width:100%}}
</style></head><body>
<canvas id="bg-canvas"></canvas><div class="aurora"></div>
<div class="boot" id="boot"><div class="boot-logo"></div><div class="boot-text">Initializing NE7-SQL</div></div>
<div class="mobile-topbar"><button class="menu-btn" id="menu-btn">☰</button><div class="mobile-logo">NE7-SQL</div><div style="width:38px"></div></div>
<div class="sidebar-backdrop" id="backdrop"></div>
<div class="screen hidden" id="screen-setup"><div class="auth-card"><h1>NE7-SQL Setup</h1><p>First run — create your admin account and connect Drime storage.</p>
<div class="field"><label>Admin Email</label><input id="su-email" type="email"></div>
<div class="field"><label>Admin Password</label><input id="su-pass" type="password"></div>
<div class="field"><label>Drime API Key</label><input id="su-key"></div>
<button class="btn btn-primary" id="su-go" style="width:100%;justify-content:center">Initialize</button>
<p class="switch-line">Already set up? <a href="#" id="go-login">Sign in</a></p></div></div>
<div class="screen hidden" id="screen-login"><div class="auth-card"><h1>NE7-SQL</h1><p>Sign in — admins get full control, customers get their workspace.</p>
<div class="field"><label>Email</label><input id="li-email" type="email"></div>
<div class="field"><label>Password</label><input id="li-pass" type="password"></div>
<button class="btn btn-primary" id="li-go" style="width:100%;justify-content:center">Sign In</button>
<p class="switch-line">First run? <a href="#" id="go-setup">Initialize platform</a></p></div></div>
<div class="app hidden" id="app">
<aside class="sidebar" id="sidebar"><div class="logo">NE7-SQL <span>Enterprise</span></div><div id="nav"></div>
<div class="sidebar-footer"><div class="status-pill"><span class="status-dot"></span>All systems operational</div></div></aside>
<main class="main"><div id="content"></div></main>
</div>
<div id="modal-root"></div><div class="toast-container" id="toasts"></div>
<script>
(function(){
'use strict';
var NL = String.fromCharCode(10);
var TOKEN = localStorage.getItem('ne7_token') || '';
var ROLE = '';
function $(s){ return document.querySelector(s); }
function $$(s){ return document.querySelectorAll(s); }
function api(p, m, b){
  var h = {'Content-Type':'application/json'};
  if (TOKEN) { h['Authorization'] = 'Bearer ' + TOKEN; }
  return fetch(p, {method: m || 'GET', headers: h, body: b ? JSON.stringify(b) : undefined}).then(function(r){ return r.json(); });
}
function toast(m){ var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; $('#toasts').appendChild(t); setTimeout(function(){ t.remove(); }, 3500); }
function modal(h){ $('#modal-root').innerHTML = '<div class="modal-overlay active"><div class="modal">' + h + '</div></div>'; $$('[data-close]').forEach(function(b){ b.onclick = closeModal; }); }
function closeModal(){ $('#modal-root').innerHTML = ''; }
function confirmBox(t, msg, cb){ modal('<h2 style="color:var(--red)">' + t + '</h2><p>' + msg + '</p><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-danger" id="cfy">Confirm</button></div>'); $('#cfy').onclick = function(){ closeModal(); cb(); }; }
function showLogin(){ $('#screen-setup').classList.add('hidden'); $('#screen-login').classList.remove('hidden'); }
function showSetup(){ $('#screen-login').classList.add('hidden'); $('#screen-setup').classList.remove('hidden'); }

var cv = document.getElementById('bg-canvas'), cx = cv.getContext('2d'), W, H, orbs = [];
function rs(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener('resize', rs); rs();
orbs = [{x:.2,y:.25,r:Math.max(W,H)*.4,c:'129,140,248',a:.10,vx:.00025,vy:.0002},{x:.8,y:.7,r:Math.max(W,H)*.45,c:'192,132,252',a:.08,vx:-.0002,vy:.00028},{x:.5,y:.95,r:Math.max(W,H)*.38,c:'56,189,248',a:.07,vx:.00022,vy:-.0002}];
function draw(){ cx.clearRect(0,0,W,H); for (var i=0;i<orbs.length;i++){ var o=orbs[i]; o.x+=o.vx; o.y+=o.vy; if(o.x<-.1||o.x>1.1)o.vx*=-1; if(o.y<-.1||o.y>1.1)o.vy*=-1; var g=cx.createRadialGradient(o.x*W,o.y*H,0,o.x*W,o.y*H,o.r); g.addColorStop(0,'rgba('+o.c+','+o.a+')'); g.addColorStop(1,'rgba('+o.c+',0)'); cx.fillStyle=g; cx.fillRect(0,0,W,H);} requestAnimationFrame(draw); }
draw();

api('/api/status').then(function(st){
  if (st && st.setup === true) {
    api('/api/me').then(function(me){
      if (me && me.role) { ROLE = me.role; enter(); } else { showLogin(); }
    });
  } else if (st && st.setup === false) {
    showSetup();
  } else {
    showLogin();
  }
});
setTimeout(function(){ $('#boot').classList.add('hidden'); }, 900);

$('#go-login').onclick = function(e){ e.preventDefault(); showLogin(); };
$('#go-setup').onclick = function(e){ e.preventDefault(); showSetup(); };

$('#su-go').onclick = function(){
  api('/api/setup','POST',{adminEmail:$('#su-email').value, adminPassword:$('#su-pass').value, drimeKey:$('#su-key').value}).then(function(r){
    if (r.ok) { toast('Initialized! Sign in.'); showLogin(); }
    else { toast(r.error || 'Failed'); }
  });
};
$('#li-go').onclick = function(){
  api('/api/login','POST',{email:$('#li-email').value, password:$('#li-pass').value}).then(function(r){
    if (r.token) { TOKEN = r.token; ROLE = r.role; localStorage.setItem('ne7_token', TOKEN); enter(); }
    else { toast(r.error || 'Login failed'); }
  });
};
function enter(){
  $('#screen-setup').classList.add('hidden');
  $('#screen-login').classList.add('hidden');
  $('#app').classList.remove('hidden');
  buildNav();
  nav(ROLE === 'admin' ? 'overview' : 'databases');
}
$('#menu-btn').onclick = function(){ $('#sidebar').classList.add('open'); $('#backdrop').classList.add('active'); };
$('#backdrop').onclick = function(){ $('#sidebar').classList.remove('open'); $('#backdrop').classList.remove('active'); };

function buildNav(){
  var items = ROLE === 'admin' ? ['overview','databases','keys','admins','customers','console','panel','settings'] : ['databases','console'];
  $('#nav').innerHTML = items.map(function(v){ return '<div class="nav-item" data-v="' + v + '">' + v.toUpperCase() + '</div>'; }).join('') + '<div class="nav-sep">Session</div><div class="nav-item" id="lo">LOGOUT</div>';
  $$('.nav-item').forEach(function(n){
    n.onclick = function(){
      if (n.id === 'lo') { localStorage.removeItem('ne7_token'); location.reload(); }
      nav(n.getAttribute('data-v'));
    };
  });
}
function nav(v){
  $$('.nav-item').forEach(function(n){ n.classList.toggle('active', n.getAttribute('data-v') === v); });
  $('#sidebar').classList.remove('open');
  $('#backdrop').classList.remove('active');
  if (v === 'overview') { vOverview(); }
  else if (v === 'databases') { vDbs(); }
  else if (v === 'keys') { vKeys(); }
  else if (v === 'admins') { vAdmins(); }
  else if (v === 'customers') { vCust(); }
  else if (v === 'console') { vConsole(); }
  else if (v === 'panel') { vPanel(); }
  else if (v === 'settings') { vSettings(); }
}

function vOverview(){
  api('/api/admin/storage').then(function(s){
    $('#content').innerHTML = '<div class="header"><h1>Overview</h1></div><div class="bento">'
      + '<div class="card span-3 stat-card"><div class="stat-value">' + s.rows.length + '</div><div class="stat-label">API Keys</div></div>'
      + '<div class="card span-3 stat-card"><div class="stat-value">' + s.grandTotalGB + ' GB</div><div class="stat-label">Grand Total</div></div>'
      + '<div class="card span-3 stat-card"><div class="stat-value">' + s.grandUsedGB + ' GB</div><div class="stat-label">Grand Used</div></div>'
      + '<div class="card span-3 stat-card"><div class="stat-value">' + s.grandBalanceGB + ' GB</div><div class="stat-label">Grand Balance</div></div></div>'
      + '<div class="card"><div class="section-title">Storage per Key</div><div class="table-wrap"><table><tr><th>Key</th><th>Status</th><th>Cap</th><th>Used</th><th>Balance</th></tr>'
      + s.rows.map(function(r){ return '<tr><td>' + r.nickname + '</td><td><span class="badge ' + (r.status === 'HEALTHY' ? 'badge-green' : 'badge-red') + '">' + r.status + '</span></td><td>' + r.capacityGB + ' GB</td><td>' + r.usedGB + ' GB</td><td>' + r.balanceGB + ' GB</td></tr>'; }).join('')
      + '</table></div></div>';
  });
}
function vDbs(){
  api('/api/databases').then(function(d){
    $('#content').innerHTML = '<div class="header"><h1>Databases</h1><button class="btn btn-primary" id="adddb">+ New Database</button></div><div class="db-grid">'
      + (d.length ? d.map(function(x){ return '<div class="db-card"><div class="db-card-top"><div class="db-name">' + x.name + '</div><div class="db-status">Active</div></div><div class="db-meta"><span>' + x.tables + ' tables</span>' + (x.key ? '<span>key: ' + x.key + '</span>' : '') + '</div></div>'; }).join('') : '<div class="card">No databases yet.</div>')
      + '</div>';
    var b = $('#adddb');
    if (b) {
      b.onclick = function(){
        modal('<h2>Create Database</h2><div class="form-group"><label class="form-label">Name</label><input class="form-input" id="nd"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="ndg">Create</button></div>');
        $('#ndg').onclick = function(){
          api('/api/admin/customers','POST',{name:$('#nd').value, email:$('#nd').value + '@internal', password:Math.random().toString(36).slice(2)}).then(function(){ closeModal(); toast('Created'); vDbs(); });
        };
      };
    }
  });
}
function vKeys(){
  api('/api/admin/keys').then(function(k){
    $('#content').innerHTML = '<div class="header"><h1>API Keys</h1><button class="btn btn-primary" id="addk">+ Add Key</button></div><div class="table-wrap"><table><tr><th>Nick</th><th>Key</th><th>Status</th><th>Cap</th><th>Actions</th></tr>'
      + k.map(function(x){ return '<tr><td>' + x.nickname + '</td><td data-f="' + x.id + '">' + x.key + '</td><td><span class="badge ' + (x.status === 'HEALTHY' ? 'badge-green' : 'badge-red') + '">' + (x.status || 'UNKNOWN') + '</span></td><td>' + x.capacityGB + ' GB</td><td><button class="icon-btn" data-eye="' + x.id + '">E</button><button class="icon-btn" data-copy="' + x.id + '">C</button><button class="icon-btn danger" data-del="' + x.id + '" data-n="' + x.nickname + '">X</button></td></tr>'; }).join('')
      + '</table></div>';
    $('#addk').onclick = function(){
      modal('<h2>Add Key</h2><div class="form-group"><label class="form-label">Nickname</label><input class="form-input" id="kn"></div><div class="form-group"><label class="form-label">Key</label><input class="form-input" id="kv"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="kg">Save</button></div>');
      $('#kg').onclick = function(){ api('/api/admin/keys','POST',{nickname:$('#kn').value, key:$('#kv').value}).then(function(){ closeModal(); toast('Added'); vKeys(); }); };
    };
    $$('[data-eye]').forEach(function(b){
      b.onclick = function(){
        var id = b.getAttribute('data-eye');
        var td = document.querySelector('[data-f="' + id + '"]');
        api('/api/admin/keys/' + id + '/reveal').then(function(r){
          if (td.getAttribute('data-s')) { td.textContent = r.key.slice(0,6) + '...' + r.key.slice(-4); td.setAttribute('data-s',''); }
          else { td.textContent = r.key; td.setAttribute('data-s','1'); }
        });
      };
    });
    $$('[data-copy]').forEach(function(b){
      b.onclick = function(){ api('/api/admin/keys/' + b.getAttribute('data-copy') + '/reveal').then(function(r){ if (navigator.clipboard) { navigator.clipboard.writeText(r.key); } toast('Copied'); }); };
    });
    $$('[data-del]').forEach(function(b){
      b.onclick = function(){ confirmBox('Delete key?', 'Remove ' + b.getAttribute('data-n'), function(){ api('/api/admin/keys/' + b.getAttribute('data-del'), 'DELETE').then(vKeys); }); };
    });
  });
}
function vAdmins(){
  api('/api/admin/admins').then(function(l){
    $('#content').innerHTML = '<div class="header"><h1>Admins</h1><button class="btn btn-primary" id="adda">+ Add Admin</button></div><div class="table-wrap"><table><tr><th>Email</th><th>Actions</th></tr>'
      + l.map(function(e){ return '<tr><td>' + e + '</td><td><button class="icon-btn danger" data-del="' + encodeURIComponent(e) + '">X</button></td></tr>'; }).join('')
      + '</table></div>';
    $('#adda').onclick = function(){
      modal('<h2>Add Admin</h2><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="ae"></div><div class="form-group"><label class="form-label">Password</label><input class="form-input" id="ap"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="ag">Save</button></div>');
      $('#ag').onclick = function(){ api('/api/admin/admins','POST',{email:$('#ae').value, password:$('#ap').value}).then(function(){ closeModal(); vAdmins(); }); };
    };
    $$('[data-del]').forEach(function(b){
      b.onclick = function(){ confirmBox('Remove admin?', 'This admin loses access.', function(){ api('/api/admin/admins/' + b.getAttribute('data-del'), 'DELETE').then(vAdmins); }); };
    });
  });
}
function vCust(){
  api('/api/admin/customers').then(function(l){
    $('#content').innerHTML = '<div class="header"><h1>Customers</h1><button class="btn btn-primary" id="addc">+ Add Customer</button></div><div class="table-wrap"><table><tr><th>Name</th><th>Email</th><th>Tenant</th><th>Actions</th></tr>'
      + l.map(function(c){ return '<tr><td>' + c.name + '</td><td>' + c.email + '</td><td>' + c.tenantId + '</td><td><button class="icon-btn danger" data-del="' + c.id + '">X</button></td></tr>'; }).join('')
      + '</table></div>';
    $('#addc').onclick = function(){
      modal('<h2>Add Customer</h2><div class="form-group"><label class="form-label">Name</label><input class="form-input" id="cn"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="ce"></div><div class="form-group"><label class="form-label">Password</label><input class="form-input" id="cp"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="cg">Create + Provision</button></div>');
      $('#cg').onclick = function(){ api('/api/admin/customers','POST',{name:$('#cn').value, email:$('#ce').value, password:$('#cp').value}).then(function(r){ closeModal(); toast('Provisioned on key: ' + r.key); vCust(); }); };
    };
    $$('[data-del]').forEach(function(b){
      b.onclick = function(){ confirmBox('Delete customer?', 'This removes their access.', function(){ api('/api/admin/customers/' + b.getAttribute('data-del'), 'DELETE').then(vCust); }); };
    });
  });
}
function vConsole(){
  $('#content').innerHTML = '<div class="header"><h1>SQL Console</h1></div><div class="terminal"><div class="terminal-body" id="term"></div><div style="padding:12px 16px;border-top:1px solid var(--border)"><div class="sql-input-wrap"><span class="sql-prompt">ne7sql=#</span><input class="sql-input" id="dbx" placeholder="tenant" style="max-width:140px"><input class="sql-input" id="sql" placeholder="SELECT * FROM ..."><button class="btn btn-primary btn-sm" id="run">Run</button></div></div></div>';
  function run(){
    var s = $('#sql').value;
    if (!s) { return; }
    $('#term').innerHTML += '<div class="log-line"><span class="log-module">=&gt;</span><span class="log-msg">' + s + '</span></div>';
    $('#sql').value = '';
    api('/api/query','POST',{sql:s, tenantId:$('#dbx').value}).then(function(r){
      $('#term').innerHTML += '<div class="log-line"><span class="log-level ' + (r.error ? 'ERROR' : 'INFO') + '">' + (r.error || r.message || 'OK') + '</span><span class="log-msg">' + (r.rows ? NL + JSON.stringify(r.rows.slice(0,10), null, 1) : '') + '</span></div>';
      $('#term').scrollTop = 1e9;
    });
  }
  $('#run').onclick = run;
  $('#sql').onkeydown = function(e){ if (e.key === 'Enter') { run(); } };
}
function vPanel(){
  $('#content').innerHTML = '<div class="header"><h1>NE7 Panel — Full Stack</h1></div>'
    + '<div class="arch-card"><h3>Architecture (CF + Drime)</h3><p><b>Cloudflare Worker</b> = the brain. <b>KV</b> = keyring (Drime keys, admins, customers, signing secret). <b>Drime</b> = warehouse (customer data). Zero VPS.</p></div>'
    + '<div class="arch-card"><h3>Inverted Postgres</h3><p>TCP socket lives client-side. The Hyperwire Agent binds localhost:5432 and tunnels Postgres wire bytes over WebSocket to the Worker.</p><div class="flow">[psql / DBeaver]' + NL + '   |  TCP (localhost:5432)' + NL + '   v' + NL + '[Hyperwire Agent]' + NL + '   |  WebSocket' + NL + '   v' + NL + '[CF Worker /cable] -&gt; Executor -&gt; Drime</div></div>'
    + '<div class="arch-card"><h3>Full Source Code</h3><p>Every file that powers this platform.</p><div class="src-wrap"><div class="src-list" id="src-list"></div><div class="src-view"><pre id="src-code">Select a file...</pre></div></div></div>';
  api('/api/admin/source').then(function(src){
    var names = Object.keys(src);
    $('#src-list').innerHTML = names.map(function(n){ return '<div class="src-file" data-f="' + n + '">' + n + '</div>'; }).join('');
    $$('.src-file').forEach(function(f){
      f.onclick = function(){ $$('.src-file').forEach(function(x){ x.classList.remove('active'); }); f.classList.add('active'); $('#src-code').textContent = src[f.getAttribute('data-f')]; };
    });
  });
}
function vSettings(){
  $('#content').innerHTML = '<div class="header"><h1>Settings</h1></div><div class="danger-zone"><h3>Danger Zone</h3><p>Reset wipes all databases and customers from Drime, but keeps admins and API keys. Cannot be undone.</p><button class="btn btn-danger" id="reset-btn">Reset Platform</button></div>';
  $('#reset-btn').onclick = function(){
    confirmBox('Confirm Reset', 'Type RESET in the next prompt to wipe everything.', function(){
      var w = prompt('Type RESET to confirm');
      if (w === 'RESET') { api('/api/admin/reset','POST',{}).then(function(r){ toast('Deleted ' + r.deleted + ' files.'); }); }
      else { toast('Aborted'); }
    });
  };
}
})();
</script></body></html>`;
