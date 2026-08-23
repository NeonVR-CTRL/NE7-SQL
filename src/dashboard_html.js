export default `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>NE7-SQL — Enterprise Cloud Database</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
@property --angle { syntax:'<angle>'; initial-value:0deg; inherits:false; }
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#060608;--surface:rgba(17,17,20,.72);--surface2:rgba(24,24,28,.85);--surface3:#1F1F23;--border:rgba(255,255,255,.06);--border2:rgba(255,255,255,.12);--text:#FAFAFA;--text2:#A1A1AA;--text3:#71717A;--accent:#818CF8;--accent2:#C084FC;--accent3:#38BDF8;--accentGlow:rgba(129,140,248,.16);--green:#34D399;--red:#F87171;--amber:#FBBF24;--radius:16px;--radius-sm:10px;--shadow-lg:0 8px 40px rgba(0,0,0,.5);--ease:cubic-bezier(.4,0,.2,1);--ease-out:cubic-bezier(.16,1,.3,1)}
html{font-size:15px}body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
::selection{background:var(--accent);color:#fff}button{font-family:inherit;cursor:pointer}input,select{font-family:inherit}
.hidden{display:none!important}
#bg-canvas{position:fixed;inset:0;z-index:0;pointer-events:none}.grid-overlay{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:56px 56px}.aurora{position:fixed;top:0;left:0;right:0;height:2px;z-index:60;background:linear-gradient(90deg,transparent,var(--accent),var(--accent2),var(--accent3),transparent);background-size:200% 100%;animation:aur 6s linear infinite;opacity:.7}@keyframes aur{0%{background-position:0% 0}100%{background-position:200% 0}}
.boot{position:fixed;inset:0;z-index:500;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;transition:opacity .6s var(--ease),visibility .6s}.boot.hidden{opacity:0;visibility:hidden;pointer-events:none}.boot-logo{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px var(--accentGlow);animation:bp 1.6s var(--ease) infinite}.boot-logo svg{width:28px;height:28px;stroke:#fff;fill:none;stroke-width:2}@keyframes bp{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}.boot-text{font-size:.8rem;color:var(--text3);letter-spacing:.2em;text-transform:uppercase;font-weight:600}.boot-bar{width:200px;height:2px;background:var(--surface3);border-radius:1px;overflow:hidden}.boot-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width 1.2s var(--ease-out)}
.screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;position:relative;z-index:2}
.auth-card{background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:36px;width:100%;max-width:420px;backdrop-filter:blur(20px);box-shadow:var(--shadow-lg)}.auth-card h1{font-size:1.3rem;margin-bottom:6px}.auth-card p{color:var(--text3);font-size:.85rem;margin-bottom:22px}.switch-line{margin-top:14px;font-size:.78rem;color:var(--text3);text-align:center}.switch-line a{color:var(--accent);cursor:pointer}
.field{margin-bottom:16px}.field label{display:block;font-size:.75rem;font-weight:600;color:var(--text2);margin-bottom:6px}.field input{width:100%;padding:11px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.9rem;outline:none}.field input:focus{border-color:var(--accent)}
.app{display:flex;min-height:100vh;position:relative;z-index:2}.sidebar{width:240px;position:fixed;top:0;left:0;bottom:0;background:rgba(10,10,12,.85);backdrop-filter:blur(24px);border-right:1px solid var(--border);display:flex;flex-direction:column;z-index:100;padding:20px 12px}.main{flex:1;margin-left:240px;padding:32px 40px;max-width:1400px;width:100%}
.mobile-topbar{display:none;position:fixed;top:0;left:0;right:0;height:56px;background:rgba(6,6,8,.85);border-bottom:1px solid var(--border);z-index:90;align-items:center;justify-content:space-between;padding:0 16px}.menu-btn{background:none;border:none;color:var(--text);cursor:pointer;padding:8px}.mobile-logo{font-weight:700}.sidebar-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:95;opacity:0;visibility:hidden}.sidebar-backdrop.active{opacity:1;visibility:visible}
.logo{display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:32px}.logo-mark{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center}.logo-mark svg{width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2}.logo-text{font-weight:700;font-size:.95rem}.logo-text span{color:var(--text3);font-weight:400;font-size:.72rem;margin-left:6px}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);color:var(--text2);cursor:pointer;font-size:.85rem;font-weight:500;margin-bottom:2px}.nav-item:hover{background:rgba(255,255,255,.04);color:var(--text)}.nav-item.active{background:var(--accentGlow);color:var(--accent)}.nav-item svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;gap:16px;flex-wrap:wrap}.header h1{font-size:1.7rem;font-weight:800;background:linear-gradient(135deg,#fff,#A1A1AA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.header-actions{display:flex;gap:10px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:var(--radius-sm);font-size:.82rem;font-weight:600;cursor:pointer;border:1px solid transparent}.btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2}.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff}.btn-ghost{background:var(--surface);border-color:var(--border);color:var(--text2)}.btn-danger{background:rgba(248,113,113,.08);color:var(--red);border-color:rgba(248,113,113,.2)}.btn-sm{padding:6px 10px;font-size:.72rem}
.bento{display:grid;grid-template-columns:repeat(12,1fr);gap:16px;margin-bottom:32px}.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px}.card:hover{border-color:var(--border2)}.span-3{grid-column:span 3}.span-12{grid-column:span 12}
.stat-value{font-size:2rem;font-weight:800}.stat-label{font-size:.75rem;color:var(--text3)}
.table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:640px}th{text-align:left;padding:12px 20px;font-size:.65rem;text-transform:uppercase;color:var(--text3);background:var(--surface2)}td{padding:14px 20px;font-size:.82rem;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace}
.badge{padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:600}.badge-green{background:rgba(52,211,153,.1);color:var(--green)}.badge-red{background:rgba(248,113,113,.1);color:var(--red)}.badge-amber{background:rgba(251,191,36,.1);color:var(--amber)}
.icon-btn{width:36px;height:36px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text2);display:inline-flex;align-items:center;justify-content:center;margin-right:4px;cursor:pointer}.icon-btn:hover{color:var(--accent)}.icon-btn.danger:hover{color:var(--red)}.icon-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2}
.db-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}.db-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px}.db-card:hover{border-color:var(--accent)}.db-name{font-weight:700;font-family:'JetBrains Mono',monospace}.db-status{font-size:.6rem;font-weight:700;padding:3px 8px;border-radius:4px;background:rgba(52,211,153,.1);color:var(--green)}.db-meta{display:flex;gap:16px;font-size:.72rem;color:var(--text3);margin:12px 0}.db-actions{display:flex;gap:6px;margin-top:14px;flex-wrap:wrap}
.terminal{background:rgba(8,8,10,.9);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;font-family:'JetBrains Mono',monospace}.terminal-body{padding:16px;height:320px;overflow-y:auto;font-size:.75rem;line-height:1.9}.log-line{display:flex;gap:12px;flex-wrap:wrap}.log-level.INFO{color:var(--green)}.log-level.ERROR{color:var(--red)}.log-module{color:var(--accent)}.log-msg{color:var(--text2);word-break:break-all}
.sql-input-wrap{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border)}.sql-prompt{color:var(--accent);font-weight:600}.sql-input{flex:1;background:none;border:none;outline:none;color:var(--text);font-family:'JetBrains Mono',monospace}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:none;align-items:center;justify-content:center;z-index:200;padding:16px}.modal-overlay.active{display:flex}.modal{background:var(--surface2);border:1px solid var(--border2);border-radius:20px;padding:32px;width:100%;max-width:460px;max-height:90vh;overflow-y:auto}.modal h2{margin-bottom:4px}.modal p{font-size:.8rem;color:var(--text3);margin-bottom:24px}.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:28px;flex-wrap:wrap}
.form-input{width:100%;padding:11px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);outline:none}.form-label{display:block;font-size:.75rem;font-weight:600;color:var(--text2);margin-bottom:6px}.form-group{margin-bottom:18px}
.toast-container{position:fixed;bottom:24px;right:24px;z-index:400;display:flex;flex-direction:column;gap:10px}.toast{padding:14px 20px;background:var(--surface2);border:1px solid var(--border2);border-radius:12px;font-size:.85rem;max-width:420px}
.danger-zone{border:1px solid rgba(248,113,113,.35);border-radius:var(--radius);padding:22px;background:rgba(248,113,113,.04)}.danger-zone h3{color:var(--red);margin-bottom:6px}.danger-zone p{color:var(--text3);margin-bottom:14px}
.arch-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-bottom:14px}.arch-card h3{color:var(--accent);margin-bottom:8px}.arch-card p{color:var(--text2);line-height:1.6}
.flow{background:rgba(8,8,10,.95);border:1px solid var(--border);border-radius:10px;padding:16px;font-family:'JetBrains Mono',monospace;font-size:.78rem;color:var(--green);white-space:pre;overflow-x:auto}
.src-wrap{display:flex;gap:14px;flex-wrap:wrap}.src-list{width:220px;max-height:480px;overflow-y:auto;border:1px solid var(--border);border-radius:10px}.src-file{padding:9px 12px;font-size:.75rem;font-family:'JetBrains Mono',monospace;cursor:pointer;color:var(--text2);border-bottom:1px solid var(--border)}.src-file.active{color:var(--accent)}.src-view{flex:1;min-width:0;max-height:480px;overflow:auto;background:rgba(8,8,10,.95);border:1px solid var(--border);border-radius:10px;padding:16px}.src-view pre{font-size:.72rem;color:#E2E8F0;white-space:pre-wrap;word-break:break-word}
@media(max-width:1200px){.span-3{grid-column:span 6}}@media(max-width:900px){.mobile-topbar{display:flex}.sidebar{transform:translateX(-100%);width:260px;padding-top:72px}.sidebar.open{transform:translateX(0)}.main{margin-left:0;padding:72px 16px 32px}.span-3{grid-column:span 12}}
</style></head><body>
<canvas id="bg-canvas"></canvas><div class="grid-overlay"></div><div class="aurora"></div>
<div class="boot" id="boot"><div class="boot-logo"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div><div class="boot-text">Initializing NE7-SQL</div><div class="boot-bar"><div class="boot-bar-fill" id="boot-fill"></div></div></div>
<div class="mobile-topbar" id="mobile-topbar"><button class="menu-btn" id="menu-btn">☰</button><div class="mobile-logo">NE7-SQL</div><div style="width:38px"></div></div>
<div class="sidebar-backdrop" id="sidebar-backdrop"></div>
<div class="screen hidden" id="screen-setup"><div class="auth-card"><h1>NE7-SQL Setup</h1><p>First run — create your admin account and connect Drime storage.</p><div class="field"><label>Admin Email</label><input id="su-email" type="email"></div><div class="field"><label>Admin Password</label><input id="su-pass" type="password"></div><div class="field"><label>Drime API Key</label><input id="su-key"></div><button class="btn btn-primary" id="su-go" style="width:100%;justify-content:center">Initialize</button><p class="switch-line">Already set up? <a id="go-login">Sign in</a></p></div></div>
<div class="screen hidden" id="screen-login"><div class="auth-card"><h1>NE7-SQL</h1><p>Sign in — admins get full control, customers get their workspace.</p><div class="field"><label>Email</label><input id="li-email" type="email"></div><div class="field"><label>Password</label><input id="li-pass" type="password"></div><button class="btn btn-primary" id="li-go" style="width:100%;justify-content:center">Sign In</button><p class="switch-line">First run? <a id="go-setup">Initialize platform</a></p></div></div>
<div class="app hidden" id="app"><aside class="sidebar" id="sidebar"><div class="logo"><div class="logo-mark"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div><div class="logo-text">NE7-SQL<span>Enterprise</span></div></div><div id="nav"></div></aside><main class="main"><div id="content"></div></main></div>
<div id="modal-root"></div><div class="toast-container" id="toasts"></div>
<script>
(function(){
'use strict';
var NL = String.fromCharCode(10);
var TOKEN = localStorage.getItem('ne7_token') || '';
var ROLE = '', NAME = '', TENANT = '';
var cachedDatabases = [], cachedCustomers = [];
function $(s){ return document.querySelector(s); }
function $all(s){ return document.querySelectorAll(s); }
function api(p, m, b){ var h = {'Content-Type':'application/json'}; if (TOKEN) h['Authorization'] = 'Bearer ' + TOKEN; return fetch(p, { method: m || 'GET', headers: h, body: b ? JSON.stringify(b) : undefined }).then(function(r){ return r.json(); }).catch(function(){ return null; }); }
function toast(m){ var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; $('#toasts').appendChild(t); setTimeout(function(){ t.remove(); }, 4000); }
function modal(h){ $('#modal-root').innerHTML = '<div class="modal-overlay active"><div class="modal">' + h + '</div></div>'; $all('#modal-root [data-close]').forEach(function(b){ b.onclick = closeModal; }); }
function closeModal(){ $('#modal-root').innerHTML = ''; }
function confirmBox(t, msg, cb){ modal('<h2>' + t + '</h2><p>' + msg + '</p><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-danger" id="cfy">Confirm</button></div>'); $('#cfy').onclick = function(){ closeModal(); cb(); }; }

var bootFill = document.getElementById('boot-fill');
setTimeout(function(){ if (bootFill) bootFill.style.width = '40%'; }, 100);
setTimeout(function(){ if (bootFill) bootFill.style.width = '80%'; }, 600);
setTimeout(function(){ document.getElementById('boot').classList.add('hidden'); }, 1400);

var canvas = document.getElementById('bg-canvas');
var ctx = canvas.getContext('2d');
var W, H, orbs = [];
function rs(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
window.addEventListener('resize', rs); rs();
orbs = [ {x:.2,y:.25,r:Math.max(W,H)*.4,c:'129,140,248',a:.10,vx:.00025,vy:.0002}, {x:.8,y:.7,r:Math.max(W,H)*.45,c:'192,132,252',a:.08,vx:-.0002,vy:.00028}, {x:.5,y:.95,r:Math.max(W,H)*.38,c:'56,189,248',a:.07,vx:.00022,vy:-.0002} ];
function drawBG(){ ctx.clearRect(0,0,W,H); for (var i=0;i<orbs.length;i++){ var o=orbs[i]; o.x+=o.vx; o.y+=o.vy; if(o.x<-.1||o.x>1.1)o.vx*=-1; if(o.y<-.1||o.y>1.1)o.vy*=-1; var g=ctx.createRadialGradient(o.x*W,o.y*H,0,o.x*W,o.y*H,o.r); g.addColorStop(0,'rgba('+o.c+','+o.a+')'); g.addColorStop(1,'rgba('+o.c+',0)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);} requestAnimationFrame(drawBG); }
drawBG();

function showLogin(){ $('#screen-setup').classList.add('hidden'); $('#screen-login').classList.remove('hidden'); }
function showSetup(){ $('#screen-login').classList.add('hidden'); $('#screen-setup').classList.remove('hidden'); }

api('/api/status').then(function(st){
  if (st && st.setup === true) {
    api('/api/me').then(function(me){ if (me && me.role) { ROLE = me.role; NAME = me.name || me.email; TENANT = me.tenantId || ''; enterApp(); } else { showLogin(); } });
  } else if (st && st.setup === false) { showSetup(); }
  else { showLogin(); }
});

$('#go-login').onclick = function(){ showLogin(); };
$('#go-setup').onclick = function(){ showSetup(); };
$('#su-go').onclick = function(){ api('/api/setup','POST',{ adminEmail: $('#su-email').value, adminPassword: $('#su-pass').value, drimeKey: $('#su-key').value }).then(function(r){ if (r && r.ok) { toast('Initialized! Sign in.'); showLogin(); } else { toast((r && r.error) || 'Failed'); } }); };
$('#li-go').onclick = function(){ api('/api/login','POST',{ email: $('#li-email').value, password: $('#li-pass').value }).then(function(r){ if (r && r.token) { TOKEN = r.token; ROLE = r.role; NAME = r.name || r.email; TENANT = r.tenantId || ''; localStorage.setItem('ne7_token', TOKEN); enterApp(); } else { toast((r && r.error) || 'Login failed'); } }); };
$('#menu-btn').onclick = function(){ $('#sidebar').classList.add('open'); $('#sidebar-backdrop').classList.add('active'); };
$('#sidebar-backdrop').onclick = function(){ $('#sidebar').classList.remove('open'); $('#sidebar-backdrop').classList.remove('active'); };

function enterApp(){
  $('#screen-setup').classList.add('hidden'); $('#screen-login').classList.add('hidden');
  $('#app').classList.remove('hidden'); $('#mobile-topbar').classList.remove('hidden');
  buildNav();
  nav(ROLE === 'admin' ? 'overview' : 'databases');
}
function buildNav(){
  var items = ROLE === 'admin' ? ['overview','databases','keys','admins','customers','console','panel','settings'] : ['databases','console'];
  $('#nav').innerHTML = items.map(function(v){ return '<div class="nav-item" data-v="' + v + '">' + v.toUpperCase() + '</div>'; }).join('') + '<div class="nav-item" id="logout" style="color:var(--red)">LOGOUT</div>';
  $all('.nav-item').forEach(function(n){ n.onclick = function(){ if (n.id === 'logout') { localStorage.removeItem('ne7_token'); location.reload(); } nav(n.getAttribute('data-v')); }; });
}
function nav(v){
  $all('.nav-item').forEach(function(n){ n.classList.toggle('active', n.getAttribute('data-v') === v); });
  $('#sidebar').classList.remove('open'); $('#sidebar-backdrop').classList.remove('active');
  if (v === 'overview') vOverview(); else if (v === 'databases') vDatabases(); else if (v === 'keys') vKeys(); else if (v === 'admins') vAdmins(); else if (v === 'customers') vCustomers(); else if (v === 'console') vConsole(); else if (v === 'panel') vPanel(); else if (v === 'settings') vSettings();
}
function vOverview(){
  api('/api/admin/storage').then(function(s){ if (!s) return;
    $('#content').innerHTML = '<div class="header"><h1>Overview</h1></div><div class="bento"><div class="card span-3"><div class="stat-value">' + s.rows.length + '</div><div class="stat-label">API Keys</div></div><div class="card span-3"><div class="stat-value">' + s.grandTotalGB + ' GB</div><div class="stat-label">Grand Total</div></div><div class="card span-3"><div class="stat-value">' + s.grandUsedGB + ' GB</div><div class="stat-label">Grand Used</div></div><div class="card span-3"><div class="stat-value">' + s.grandBalanceGB + ' GB</div><div class="stat-label">Grand Balance</div></div><div class="card span-12"><div class="table-wrap"><table><tr><th>Key</th><th>Status</th><th>Capacity</th><th>Used</th><th>Balance</th></tr>' + s.rows.map(function(r){ return '<tr><td>' + r.nickname + '</td><td><span class="badge ' + (r.status==='HEALTHY'?'badge-green':'badge-red') + '">' + r.status + '</span></td><td>' + r.capacityGB + ' GB</td><td>' + r.usedGB + ' GB</td><td>' + r.balanceGB + ' GB</td></tr>'; }).join('') + '</table></div></div></div>';
  });
}
function vDatabases(){
  api('/api/databases').then(function(dbs){ cachedDatabases = dbs || [];
    var list = ROLE === 'admin' ? cachedDatabases : cachedDatabases.filter(function(d){ return d.tenantId === TENANT; });
    var html = '<div class="header"><h1>' + (ROLE === 'admin' ? 'All Databases' : 'My Databases') + '</h1>' + (ROLE === 'admin' ? '<div class="header-actions"><button class="btn btn-primary" id="new-db">+ Create Database</button></div>' : '') + '</div><div class="db-grid">';
    if (!list.length) html += '<div class="card" style="grid-column:1/-1;text-align:center;color:var(--text3)">No databases yet.</div>';
    list.forEach(function(db){
      html += '<div class="db-card"><div style="display:flex;justify-content:space-between"><div class="db-name">' + db.name + '</div><div class="db-status">Active</div></div><div class="db-meta"><span>' + db.tables + ' tables</span><span>key: ' + (db.key || '-') + '</span></div>' + (ROLE === 'admin' ? ('<div class="db-actions"><button class="btn btn-amber btn-sm" data-topup="' + db.tenantId + '">Top Up</button><button class="btn btn-ghost btn-sm" data-assign="' + db.tenantId + '">Assign</button><button class="btn btn-danger btn-sm" data-del="' + db.tenantId + '" data-name="' + db.name + '">Delete</button></div>') : ('<div class="db-actions"><button class="btn btn-ghost btn-sm" data-use="' + db.tenantId + '">Use in Console</button></div>')) + '</div>';
    });
    html += '</div>';
    $('#content').innerHTML = html;
    var nb = $('#new-db'); if (nb) nb.onclick = openCreateDb;
    $all('[data-topup]').forEach(function(b){ b.onclick = function(){ openTopup(b.getAttribute('data-topup')); }; });
    $all('[data-assign]').forEach(function(b){ b.onclick = function(){ openAssign(b.getAttribute('data-assign')); }; });
    $all('[data-del]').forEach(function(b){ b.onclick = function(){ var id = b.getAttribute('data-del'); var nm = b.getAttribute('data-name'); confirmBox('Delete ' + nm + '?', 'This permanently removes the database and its data.', function(){ api('/api/admin/customers/' + id, 'DELETE').then(function(){ toast('Deleted'); vDatabases(); }); }); }; });
    $all('[data-use]').forEach(function(b){ b.onclick = function(){ nav('console'); $('#sql-db').value = b.getAttribute('data-use'); }; });
  });
}
function openCreateDb(){
  api('/api/admin/customers').then(function(cs){ cachedCustomers = cs || [];
    modal('<h2>Create Isolated Database</h2><p>Each DB is a fully isolated tenant with its own credentials.</p><div class="form-group"><label class="form-label">Database Nickname</label><input class="form-input" id="db-name"></div><div class="form-group"><label class="form-label">Initial Storage (GB)</label><input class="form-input" id="db-size" type="number" value="5" min="1" max="20"></div><div class="form-group"><label class="form-label">Assign to Customer (optional)</label><select class="form-input" id="db-assign"><option value="">- Unassigned -</option>' + cachedCustomers.map(function(c){ return '<option value="' + c.id + '" data-email="' + c.email + '">' + c.name + ' (' + c.email + ')</option>'; }).join('') + '</select></div><div class="form-group"><label class="form-label">Password (blank = auto)</label><input class="form-input" id="db-pass"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="db-go">Create + Provision</button></div>');
    $('#db-go').onclick = function(){
      var name = $('#db-name').value.trim(); if (!name) { toast('Name required'); return; }
      var sel = $('#db-assign'); var opt = sel.selectedOptions[0];
      api('/api/admin/customers','POST',{ name: name, email: (opt && opt.getAttribute('data-email')) || (name.toLowerCase().replace(/[^a-z0-9]/g,'') + '@internal.ne7'), password: $('#db-pass').value || '', storageGB: parseInt($('#db-size').value) || 5 }).then(function(r){ if (r && r.ok) { closeModal(); toast('Database created. Password: ' + ($('#db-pass').value || '(auto)')); vDatabases(); } else { toast((r && r.error) || 'Failed'); } });
    };
  });
}
function openTopup(tid){ modal('<h2>Top Up Storage</h2><div class="form-group"><label class="form-label">Add Storage (GB)</label><input class="form-input" id="tu-amt" type="number" value="5" min="1" max="20"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="tu-go">Top Up</button></div>'); $('#tu-go').onclick = function(){ api('/api/admin/databases/' + tid + '/topup','POST',{ amountGB: parseInt($('#tu-amt').value) || 5 }).then(function(r){ if (r && r.ok) { closeModal(); toast('Topped up'); vDatabases(); } else { toast((r && r.error) || 'Failed'); } }); }; }
function openAssign(tid){ api('/api/admin/customers').then(function(cs){ cachedCustomers = cs || []; modal('<h2>Assign Database</h2><div class="form-group"><label class="form-label">Assign to Customer</label><select class="form-input" id="as-cust"><option value="">- Unassign -</option>' + cachedCustomers.map(function(c){ return '<option value="' + c.id + '">' + c.name + ' (' + c.email + ')</option>'; }).join('') + '</select></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="as-go">Assign</button></div>'); $('#as-go').onclick = function(){ api('/api/admin/databases/' + tid + '/assign','POST',{ customerId: $('#as-cust').value }).then(function(r){ if (r && r.ok) { closeModal(); toast('Assigned'); vDatabases(); } else { toast((r && r.error) || 'Failed'); } }); }; }); }
function vKeys(){
  api('/api/admin/keys').then(function(ks){ if (!ks) return;
    $('#content').innerHTML = '<div class="header"><h1>API Keys</h1><div class="header-actions"><button class="btn btn-primary" id="add-key">+ Add Key</button></div></div><div class="table-wrap"><table><tr><th>Nickname</th><th>API Key</th><th>Status</th><th>Capacity</th><th>Actions</th></tr>' + ks.map(function(k){ return '<tr data-id="' + k.id + '"><td>' + k.nickname + '</td><td class="key-text">' + k.key + '</td><td><span class="badge ' + (k.status==='HEALTHY'?'badge-green':'badge-red') + '">' + (k.status || 'UNKNOWN') + '</span></td><td>' + k.capacityGB + ' GB</td><td><button class="icon-btn" data-eye="' + k.id + '">E</button><button class="icon-btn" data-copy="' + k.id + '">C</button><button class="icon-btn danger" data-delkey="' + k.id + '" data-nick="' + k.nickname + '">X</button></td></tr>'; }).join('') + '</table></div>';
    $('#add-key').onclick = function(){ modal('<h2>Add Drime API Key</h2><div class="form-group"><label class="form-label">Nickname</label><input class="form-input" id="k-nick"></div><div class="form-group"><label class="form-label">API Key</label><input class="form-input" id="k-val"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="k-go">Add Key</button></div>'); $('#k-go').onclick = function(){ api('/api/admin/keys','POST',{ nickname: $('#k-nick').value, key: $('#k-val').value }).then(function(r){ if (r && r.ok) { closeModal(); toast('Key added'); vKeys(); } else { toast((r && r.error) || 'Failed'); } }); }; };
    $all('[data-eye]').forEach(function(b){ b.onclick = function(){ var id = b.getAttribute('data-eye'); var row = b.closest('tr'); var cell = row.querySelector('.key-text'); if (cell.getAttribute('data-rev')) { cell.textContent = cell.getAttribute('data-mask'); cell.removeAttribute('data-rev'); } else { api('/api/admin/keys/' + id + '/reveal').then(function(r){ if (r && r.key) { cell.setAttribute('data-mask', cell.textContent); cell.textContent = r.key; cell.setAttribute('data-rev','1'); } }); } }; });
    $all('[data-copy]').forEach(function(b){ b.onclick = function(){ var id = b.getAttribute('data-copy'); api('/api/admin/keys/' + id + '/reveal').then(function(r){ if (r && r.key && navigator.clipboard) { navigator.clipboard.writeText(r.key); toast('Copied'); } }); }; });
    $all('[data-delkey]').forEach(function(b){ b.onclick = function(){ var id = b.getAttribute('data-delkey'); confirmBox('Remove ' + b.getAttribute('data-nick') + '?', 'This key is removed from the pool.', function(){ api('/api/admin/keys/' + id, 'DELETE').then(function(){ toast('Removed'); vKeys(); }); }); }; });
  });
}
function vAdmins(){
  api('/api/admin/admins').then(function(list){ if (!list) return;
    $('#content').innerHTML = '<div class="header"><h1>Admins</h1><div class="header-actions"><button class="btn btn-primary" id="add-admin">+ Add Admin</button></div></div><div class="table-wrap"><table><tr><th>Email</th><th>Actions</th></tr>' + list.map(function(e){ return '<tr><td>' + e + '</td><td><button class="icon-btn danger" data-deladmin="' + encodeURIComponent(e) + '">X</button></td></tr>'; }).join('') + '</table></div>';
    $('#add-admin').onclick = function(){ modal('<h2>Add Admin</h2><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="a-email"></div><div class="form-group"><label class="form-label">Password</label><input class="form-input" id="a-pass"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="a-go">Add Admin</button></div>'); $('#a-go').onclick = function(){ api('/api/admin/admins','POST',{ email: $('#a-email').value, password: $('#a-pass').value }).then(function(r){ if (r && r.ok) { closeModal(); toast('Admin added'); vAdmins(); } }); }; };
    $all('[data-deladmin]').forEach(function(b){ b.onclick = function(){ confirmBox('Remove admin?', 'This admin loses access.', function(){ api('/api/admin/admins/' + b.getAttribute('data-deladmin'), 'DELETE').then(function(){ toast('Removed'); vAdmins(); }); }); }; });
  });
}
function vCustomers(){
  api('/api/admin/customers').then(function(cs){ cachedCustomers = cs || [];
    api('/api/databases').then(function(dbs){ dbs = dbs || [];
      $('#content').innerHTML = '<div class="header"><h1>Customers</h1><div class="header-actions"><button class="btn btn-primary" id="add-cust">+ Add Customer</button></div></div><div class="table-wrap"><table><tr><th>Name</th><th>Email</th><th>Tenant</th><th>DBs</th><th>Actions</th></tr>' + cachedCustomers.map(function(c){ var n = dbs.filter(function(d){ return d.tenantId === c.tenantId; }).length; return '<tr><td>' + c.name + '</td><td>' + c.email + '</td><td>' + c.tenantId + '</td><td><span class="badge badge-amber">' + n + '</span></td><td><button class="icon-btn danger" data-delcust="' + c.id + '">X</button></td></tr>'; }).join('') + '</table></div>';
      $('#add-cust').onclick = function(){ modal('<h2>Add Customer</h2><div class="form-group"><label class="form-label">Name</label><input class="form-input" id="c-name"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="c-email"></div><div class="form-group"><label class="form-label">Password</label><input class="form-input" id="c-pass"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="c-go">Create Customer</button></div>'); $('#c-go').onclick = function(){ api('/api/admin/customers','POST',{ name: $('#c-name').value, email: $('#c-email').value, password: $('#c-pass').value }).then(function(r){ if (r && r.ok) { closeModal(); toast('Customer created'); vCustomers(); } else { toast((r && r.error) || 'Failed'); } }); }; };
      $all('[data-delcust]').forEach(function(b){ b.onclick = function(){ confirmBox('Delete customer?', 'Their access is removed; DBs become unassigned.', function(){ api('/api/admin/customers/' + b.getAttribute('data-delcust'), 'DELETE').then(function(){ toast('Deleted'); vCustomers(); }); }); }; });
    });
  });
}
function vConsole(){
  $('#content').innerHTML = '<div class="header"><h1>SQL Console</h1></div><div class="terminal"><div class="terminal-body" id="term"><div class="log-line"><span class="log-msg" style="color:var(--green)">Connected to NE7-SQL</span></div></div><div class="sql-input-wrap"><span class="sql-prompt">ne7sql=#</span><input class="sql-input" id="sql-db" placeholder="tenant" style="max-width:140px"><input class="sql-input" id="sql-input" placeholder="SELECT * FROM ..."><button class="btn btn-primary btn-sm" id="sql-run">Run</button></div></div>';
  function run(){ var s = $('#sql-input').value.trim(); if (!s) return; var t = $('#sql-db').value.trim() || TENANT; if (!t) { toast('No tenant'); return; } if (ROLE !== 'admin' && t !== TENANT) { toast('Access denied'); return; } $('#term').innerHTML += '<div class="log-line"><span class="log-module">' + t + '=#</span><span class="log-msg">' + s + '</span></div>'; $('#sql-input').value = ''; api('/api/query','POST',{ sql: s, tenantId: t }).then(function(r){ if (!r) return; var lvl = r.error ? 'ERROR' : 'INFO'; var extra = r.rows ? NL + JSON.stringify(r.rows.slice(0,10), null, 1) : ''; $('#term').innerHTML += '<div class="log-line"><span class="log-level ' + lvl + '">' + (r.error || r.message || 'OK') + '</span><span class="log-msg">' + extra + '</span></div>'; $('#term').scrollTop = 1e9; }); }
  $('#sql-run').onclick = run; $('#sql-input').onkeydown = function(e){ if (e.key === 'Enter') run(); };
}
function vPanel(){
  $('#content').innerHTML = '<div class="header"><h1>NE7 Panel — Full Stack</h1></div><div class="arch-card"><h3>Architecture (CF + Drime)</h3><p>Worker = brain, KV = keyring, Drime = warehouse. Zero VPS.</p></div><div class="arch-card"><h3>Inverted Postgres</h3><p>TCP socket lives client-side; wire bytes tunnel over WebSocket.</p><div class="flow">[psql / DBeaver]' + NL + '   |  TCP (localhost:5432)' + NL + '   v' + NL + '[Hyperwire Agent]' + NL + '   |  WebSocket' + NL + '   v' + NL + '[CF Worker] -&gt; Executor -&gt; Drime</div></div><div class="arch-card"><h3>Full Source Code</h3><div class="src-wrap"><div class="src-list" id="src-list"></div><div class="src-view"><pre id="src-code">Select a file...</pre></div></div></div>';
  api('/api/admin/source').then(function(src){ if (!src) return; var names = Object.keys(src); $('#src-list').innerHTML = names.map(function(n){ return '<div class="src-file" data-f="' + n + '">' + n + '</div>'; }).join(''); $all('.src-file').forEach(function(f){ f.onclick = function(){ $all('.src-file').forEach(function(x){ x.classList.remove('active'); }); f.classList.add('active'); $('#src-code').textContent = src[f.getAttribute('data-f')]; }; }); });
}
function vSettings(){
  $('#content').innerHTML = '<div class="header"><h1>Settings</h1></div><div class="danger-zone"><h3>Danger Zone</h3><p>Reset wipes all databases and customers from Drime, keeps admins and API keys.</p><button class="btn btn-danger" id="reset-btn">Reset Platform</button></div>';
  $('#reset-btn').onclick = function(){ confirmBox('Confirm Reset', 'Type RESET in the next prompt to wipe everything.', function(){ var w = prompt('Type RESET to confirm'); if (w === 'RESET') { api('/api/admin/reset','POST',{}).then(function(r){ toast('Deleted ' + ((r && r.deleted) || 0) + ' files.'); vOverview(); }); } else { toast('Aborted'); } }); };
}
})();
</script></body></html>`;
