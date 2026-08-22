export default `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>NE7-SQL — Enterprise Cloud Database</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
@property --angle { syntax:'<angle>'; initial-value:0deg; inherits:false; }
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#060608;--surface:rgba(17,17,20,.72);--surface2:rgba(24,24,28,.85);--surface3:#1F1F23;--border:rgba(255,255,255,.06);--border2:rgba(255,255,255,.12);--text:#FAFAFA;--text2:#A1A1AA;--text3:#71717A;--accent:#818CF8;--accent2:#C084FC;--accent3:#38BDF8;--accentGlow:rgba(129,140,248,.16);--green:#34D399;--red:#F87171;--amber:#FBBF24;--radius:16px;--radius-sm:10px;--shadow-lg:0 8px 40px rgba(0,0,0,.5);--ease:cubic-bezier(.4,0,.2,1);--ease-out:cubic-bezier(.16,1,.3,1)}
html{font-size:15px}body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;transition:filter .3s var(--ease)}
::selection{background:var(--accent);color:#fff}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--surface3);border-radius:3px}::-webkit-scrollbar-thumb:hover{background:var(--text3)}button{font-family:inherit}input,select{font-family:inherit}
.hidden{display:none!important}
#bg-canvas{position:fixed;inset:0;z-index:0;pointer-events:none}.grid-overlay{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(ellipse 90% 70% at 50% 0%,black 30%,transparent 90%)}.noise{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.035;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}.aurora{position:fixed;top:0;left:0;right:0;height:2px;z-index:60;background:linear-gradient(90deg,transparent,var(--accent),var(--accent2),var(--accent3),transparent);background-size:200% 100%;animation:auroraSlide 6s linear infinite;opacity:.7}@keyframes auroraSlide{0%{background-position:0% 0}100%{background-position:200% 0}}
.boot{position:fixed;inset:0;z-index:500;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;transition:opacity .6s var(--ease),visibility .6s}.boot.hidden{opacity:0;visibility:hidden;pointer-events:none}.boot-logo{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px var(--accentGlow);animation:bootPulse 1.6s var(--ease) infinite}.boot-logo svg{width:28px;height:28px;stroke:#fff;fill:none;stroke-width:2}@keyframes bootPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06);box-shadow:0 0 70px rgba(129,140,248,.4)}}.boot-text{font-size:.8rem;color:var(--text3);letter-spacing:.2em;text-transform:uppercase;font-weight:600}.boot-bar{width:200px;height:2px;background:var(--surface3);border-radius:1px;overflow:hidden}.boot-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width 1.2s var(--ease-out)}
.screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;position:relative;z-index:2}
.auth-card{background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:36px;width:100%;max-width:420px;backdrop-filter:blur(20px);box-shadow:var(--shadow-lg)}.auth-card h1{font-size:1.3rem;margin-bottom:6px;letter-spacing:-.02em}.auth-card p{color:var(--text3);font-size:.85rem;margin-bottom:22px}.switch-line{margin-top:14px;font-size:.78rem;color:var(--text3);text-align:center}.switch-line a{color:var(--accent);text-decoration:none;cursor:pointer}
.field{margin-bottom:16px}.field label{display:block;font-size:.75rem;font-weight:600;color:var(--text2);margin-bottom:6px}.field input{width:100%;padding:11px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.9rem;outline:none;transition:all .25s var(--ease)}.field input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accentGlow)}
.app{display:flex;min-height:100vh;position:relative;z-index:2}.sidebar{width:240px;position:fixed;top:0;left:0;bottom:0;background:rgba(10,10,12,.85);backdrop-filter:blur(24px) saturate(1.4);border-right:1px solid var(--border);display:flex;flex-direction:column;z-index:100;padding:20px 12px;transition:transform .35s var(--ease-out)}.main{flex:1;margin-left:240px;padding:32px 40px;max-width:1400px;width:100%;transition:filter .35s var(--ease), transform .35s var(--ease)}
.mobile-topbar{display:none;position:fixed;top:0;left:0;right:0;height:56px;background:rgba(6,6,8,.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);z-index:90;align-items:center;justify-content:space-between;padding:0 16px}.menu-btn{background:none;border:none;color:var(--text);cursor:pointer;padding:8px;border-radius:8px;display:flex;align-items:center;justify-content:center}.menu-btn svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2}.mobile-logo{font-weight:700;font-size:1rem;letter-spacing:-.02em}.sidebar-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:95;opacity:0;visibility:hidden;transition:opacity .3s, visibility .3s}.sidebar-backdrop.active{opacity:1;visibility:visible}
body.sidebar-open .main {filter: blur(12px) brightness(0.5);pointer-events: none;transform: scale(0.98);}
.logo{display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:32px}.logo-mark{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px var(--accentGlow);position:relative}.logo-mark::after{content:'';position:absolute;inset:-3px;border-radius:11px;background:conic-gradient(from var(--angle),transparent 60%,var(--accent),transparent);animation:spin 4s linear infinite;opacity:.5;z-index:-1}@keyframes spin{to{--angle:360deg}}.logo-mark svg{width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2}.logo-text{font-weight:700;font-size:.95rem;letter-spacing:-.02em}.logo-text span{color:var(--text3);font-weight:400;font-size:.72rem;margin-left:6px}.nav-section{margin-bottom:24px}.nav-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:var(--text3);padding:0 12px;margin-bottom:8px;font-weight:600}.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);color:var(--text2);cursor:pointer;transition:all .25s var(--ease);font-size:.85rem;font-weight:500;position:relative;margin-bottom:2px;-webkit-tap-highlight-color:transparent}.nav-item:hover{background:rgba(255,255,255,.04);color:var(--text);transform:translateX(2px)}.nav-item.active{background:var(--accentGlow);color:var(--accent)}.nav-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:16px;background:var(--accent);border-radius:0 3px 3px 0;box-shadow:0 0 10px var(--accent)}.nav-item svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8;flex-shrink:0}.nav-badge{margin-left:auto;background:var(--surface3);color:var(--text3);font-size:.65rem;padding:2px 7px;border-radius:5px;font-weight:600}.sidebar-footer{margin-top:auto;padding:12px;border-top:1px solid var(--border)}.status-pill{display:flex;align-items:center;gap:8px;font-size:.75rem;color:var(--text2)}.status-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.85)}}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;gap:16px;flex-wrap:wrap}.header h1{font-size:1.7rem;font-weight:800;letter-spacing:-.03em;background:linear-gradient(135deg,#fff,#A1A1AA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.header-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.search-btn{display:flex;align-items:center;gap:8px;padding:9px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text3);font-size:.8rem;cursor:pointer;transition:all .25s var(--ease);min-width:180px;backdrop-filter:blur(10px)}.search-btn:hover{border-color:var(--accent);color:var(--text2);box-shadow:0 0 20px var(--accentGlow);transform:translateY(-1px)}.search-btn kbd{margin-left:auto;background:var(--surface3);padding:2px 6px;border-radius:4px;font-size:.65rem;font-family:'JetBrains Mono',monospace;border:1px solid var(--border)}
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:var(--radius-sm);font-size:.82rem;font-weight:600;cursor:pointer;transition:all .25s var(--ease);border:1px solid transparent;position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent}.btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2}.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;box-shadow:0 2px 16px var(--accentGlow)}.btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 28px rgba(129,140,248,.4)}.btn-ghost{background:var(--surface);border-color:var(--border);color:var(--text2);backdrop-filter:blur(10px)}.btn-ghost:hover{border-color:var(--accent);color:var(--text);transform:translateY(-1px)}.btn-danger{background:rgba(248,113,113,.08);color:var(--red);border-color:rgba(248,113,113,.2)}.btn-danger:hover{background:rgba(248,113,113,.18)}.btn-danger-solid{background:var(--red);color:#fff;border-color:var(--red)}.btn-danger-solid:hover{background:#DC2626;transform:translateY(-1px);box-shadow:0 4px 20px rgba(248,113,113,.4)}.btn-sm{padding:6px 10px;font-size:.72rem}.ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.35);transform:scale(0);animation:rippleAnim .6s var(--ease-out);pointer-events:none}@keyframes rippleAnim{to{transform:scale(4);opacity:0}}
.bento{display:grid;grid-template-columns:repeat(12,1fr);gap:16px;margin-bottom:32px}.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;transition:transform .3s var(--ease),border-color .3s,box-shadow .3s;position:relative;overflow:hidden;backdrop-filter:blur(20px);transform-style:preserve-3d}.card::before{content:'';position:absolute;inset:0;background:radial-gradient(500px circle at var(--mx,50%) var(--my,50%),rgba(129,140,248,.09),transparent 45%);opacity:0;transition:opacity .4s;pointer-events:none;z-index:1}.card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .3s}.card:hover{border-color:var(--border2);box-shadow:var(--shadow-lg),0 0 40px var(--accentGlow)}.card:hover::before{opacity:1}.card:hover::after{opacity:1}.card > *{position:relative;z-index:2}.span-3{grid-column:span 3}.span-4{grid-column:span 4}.span-6{grid-column:span 6}.span-8{grid-column:span 8}.span-12{grid-column:span 12}
.stat-card{display:flex;flex-direction:column;gap:12px}.stat-header{display:flex;justify-content:space-between;align-items:center}.stat-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;transition:transform .3s var(--ease)}.card:hover .stat-icon{transform:scale(1.1) rotate(-4deg)}.stat-icon svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2}.stat-icon.purple{background:rgba(129,140,248,.12);color:var(--accent)}.stat-icon.green{background:rgba(52,211,153,.12);color:var(--green)}.stat-icon.amber{background:rgba(251,191,36,.12);color:var(--amber)}.stat-icon.red{background:rgba(248,113,113,.12);color:var(--red)}.stat-value{font-size:2rem;font-weight:800;letter-spacing:-.04em;font-variant-numeric:tabular-nums}.stat-label{font-size:.75rem;color:var(--text3);font-weight:500}.stat-change{font-size:.7rem;display:flex;align-items:center;gap:4px;font-weight:600}.stat-change.up{color:var(--green)}.stat-change.down{color:var(--red)}
.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.section-title{font-size:1rem;font-weight:700;letter-spacing:-.02em;display:flex;align-items:center;gap:10px}
.db-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}.db-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;cursor:pointer;transition:transform .3s var(--ease),border-color .3s,box-shadow .3s;position:relative;overflow:hidden;backdrop-filter:blur(20px);transform-style:preserve-3d;-webkit-tap-highlight-color:transparent}.card-enter{animation:cardIn .6s var(--ease-out)}@keyframes cardIn{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}.db-card::before{content:'';position:absolute;inset:0;background:radial-gradient(400px circle at var(--mx,50%) var(--my,50%),rgba(52,211,153,.07),transparent 45%);opacity:0;transition:opacity .4s;pointer-events:none}.db-card:hover{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent),0 8px 32px var(--accentGlow)}.db-card:hover::before{opacity:1}.db-card > *{position:relative;z-index:2}.db-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;gap:8px}.db-name{font-weight:700;font-size:.9rem;font-family:'JetBrains Mono',monospace;letter-spacing:-.01em;word-break:break-all}.db-status{font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:3px 8px;border-radius:4px;display:flex;align-items:center;gap:5px;flex-shrink:0}.db-status.active{background:rgba(52,211,153,.1);color:var(--green)}.db-status.active::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}.db-meta{display:flex;gap:16px;font-size:.72rem;color:var(--text3);margin-bottom:16px;flex-wrap:wrap}.db-meta span{display:flex;align-items:center;gap:4px}.db-meta svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2}.db-actions{display:flex;gap:6px;margin-top:14px;flex-wrap:wrap}
.table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow-x:auto;-webkit-overflow-scrolling:touch;backdrop-filter:blur(20px)}table{width:100%;border-collapse:collapse;min-width:640px}th{text-align:left;padding:12px 20px;font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);font-weight:600;background:var(--surface2);border-bottom:1px solid var(--border);white-space:nowrap}td{padding:14px 20px;font-size:.82rem;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace}tr:last-child td{border-bottom:none}tbody tr{transition:background .2s}tbody tr:hover{background:rgba(129,140,248,.04)}.key-cell{display:flex;align-items:center;gap:8px}.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:.68rem;font-weight:600;white-space:nowrap}.badge-green{background:rgba(52,211,153,.1);color:var(--green)}.badge-red{background:rgba(248,113,113,.1);color:var(--red)}.badge-amber{background:rgba(251,191,36,.1);color:var(--amber)}.badge-purple{background:rgba(129,140,248,.1);color:var(--accent)}.key-actions{display:flex;gap:6px}.icon-btn{width:36px;height:36px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s var(--ease);flex-shrink:0;-webkit-tap-highlight-color:transparent}.icon-btn:hover{border-color:var(--accent);color:var(--accent);transform:translateY(-1px)}.icon-btn.danger:hover{border-color:var(--red);color:var(--red)}.icon-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2}
.terminal{background:rgba(8,8,10,.9);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;font-family:'JetBrains Mono',monospace;backdrop-filter:blur(20px)}.terminal-header{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--surface2);border-bottom:1px solid var(--border)}.terminal-dots{display:flex;gap:6px}.terminal-dots span{width:10px;height:10px;border-radius:50%;transition:transform .2s}.terminal-dots span:hover{transform:scale(1.2)}.terminal-dots span:nth-child(1){background:#FF5F57}.terminal-dots span:nth-child(2){background:#FEBC2E}.terminal-dots span:nth-child(3){background:#28C840}.terminal-title{font-size:.7rem;color:var(--text3)}.terminal-body{padding:16px;height:320px;overflow-y:auto;font-size:.75rem;line-height:1.9}.log-line{display:flex;gap:12px;flex-wrap:wrap}.log-time{color:var(--text3);flex-shrink:0}.log-level{font-weight:700;flex-shrink:0;width:50px}.log-level.INFO{color:var(--green)}.log-level.WARN{color:var(--amber)}.log-level.ERROR{color:var(--red)}.log-module{color:var(--accent);flex-shrink:0}.log-msg{color:var(--text2);word-break:break-all}
.sql-input-wrap{display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(8,8,10,.9);border:1px solid var(--border);border-radius:var(--radius-sm);transition:all .3s var(--ease)}.sql-input-wrap:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px var(--accentGlow),0 0 24px var(--accentGlow)}.sql-prompt{color:var(--accent);font-weight:600;font-size:.8rem;flex-shrink:0}.sql-input{flex:1;background:none;border:none;outline:none;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:.8rem;min-width:0}.sql-input::placeholder{color:var(--text3)}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(10px);display:none;align-items:center;justify-content:center;z-index:200;padding:16px}.modal-overlay.active{display:flex;animation:fadeIn .25s var(--ease)}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.modal{background:var(--surface2);border:1px solid var(--border2);border-radius:20px;padding:32px;width:100%;max-width:440px;box-shadow:var(--shadow-lg),0 0 60px var(--accentGlow);animation:modalIn .4s var(--ease-out);backdrop-filter:blur(30px);position:relative;overflow:hidden;max-height:90vh;overflow-y:auto}.modal::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--accent),var(--accent2),transparent)}@keyframes modalIn{from{opacity:0;transform:scale(.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}.modal h2{font-size:1.1rem;font-weight:700;margin-bottom:4px;letter-spacing:-.02em}.modal p{font-size:.8rem;color:var(--text3);margin-bottom:24px}.form-group{margin-bottom:18px}.form-label{display:block;font-size:.75rem;font-weight:600;color:var(--text2);margin-bottom:6px}.form-input{width:100%;padding:11px 14px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:inherit;font-size:.85rem;transition:all .25s var(--ease);outline:none}.form-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accentGlow)}.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:28px;flex-wrap:wrap}
.confirm-modal{text-align:center;max-width:400px}.confirm-icon-wrap{display:flex;justify-content:center;margin-bottom:20px}.confirm-icon{width:68px;height:68px;border-radius:50%;background:rgba(248,113,113,.1);display:flex;align-items:center;justify-content:center;animation:confirmPulse 1.6s var(--ease) infinite}.confirm-icon svg{width:30px;height:30px;stroke:var(--red);fill:none;stroke-width:2}@keyframes confirmPulse{0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,.35)}50%{box-shadow:0 0 0 16px rgba(248,113,113,0)}}.confirm-modal h2{margin-bottom:8px}.confirm-modal .modal-actions{justify-content:center}
.cmd-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);display:none;align-items:flex-start;justify-content:center;padding:14vh 16px 16px;z-index:300}.cmd-overlay.active{display:flex;animation:fadeIn .2s var(--ease)}.cmd-palette{background:var(--surface2);border:1px solid var(--border2);border-radius:16px;width:100%;max-width:560px;box-shadow:var(--shadow-lg),0 0 60px var(--accentGlow);overflow:hidden;animation:modalIn .3s var(--ease-out);backdrop-filter:blur(30px)}.cmd-input-wrap{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border)}.cmd-input-wrap svg{width:18px;height:18px;stroke:var(--text3);fill:none;stroke-width:2;flex-shrink:0}.cmd-input{flex:1;background:none;border:none;outline:none;color:var(--text);font-size:.9rem;font-family:inherit;min-width:0}.cmd-results{max-height:320px;overflow-y:auto;padding:8px}.cmd-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:var(--radius-sm);cursor:pointer;transition:all .2s var(--ease);font-size:.85rem;-webkit-tap-highlight-color:transparent}.cmd-item:hover{background:var(--accentGlow);transform:translateX(3px)}.cmd-item svg{width:16px;height:16px;stroke:var(--text3);fill:none;stroke-width:2;flex-shrink:0}.cmd-item .shortcut{margin-left:auto;font-size:.65rem;color:var(--text3);background:var(--surface3);padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace}
.toast-container{position:fixed;bottom:24px;right:24px;z-index:400;display:flex;flex-direction:column;gap:10px}.toast{display:flex;align-items:center;gap:12px;padding:14px 20px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius);box-shadow:var(--shadow-lg);animation:toastIn .4s var(--ease-out);min-width:260px;backdrop-filter:blur(20px)}@keyframes toastIn{from{opacity:0;transform:translateX(60px) scale(.95)}to{opacity:1;transform:translateX(0) scale(1)}}.toast-icon{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}.toast-icon.success{background:rgba(52,211,153,.15);color:var(--green)}.toast-icon.error{background:rgba(248,113,113,.15);color:var(--red)}.toast-icon svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5}.toast-msg{font-size:.8rem;font-weight:500}
.key-mini-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}.key-mini-item:last-child{border-bottom:none}
.empty-state{text-align:center;padding:60px 20px;color:var(--text3)}.empty-state svg{width:48px;height:48px;stroke:var(--text3);fill:none;stroke-width:1.5;margin-bottom:16px;opacity:.5}.empty-state h3{font-size:1rem;color:var(--text2);margin-bottom:8px}.empty-state p{font-size:.8rem;margin-bottom:20px}
.danger-zone{border:1px solid rgba(248,113,113,.35);border-radius:var(--radius);padding:22px;background:rgba(248,113,113,.04)}.danger-zone h3{color:var(--red);margin-bottom:6px}.danger-zone p{color:var(--text3);font-size:.85rem;margin-bottom:14px}
.arch-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-bottom:14px}.arch-card h3{font-size:.95rem;margin-bottom:8px;color:var(--accent)}.arch-card p{font-size:.82rem;color:var(--text2);line-height:1.6}
.flow{background:rgba(8,8,10,.95);border:1px solid var(--border);border-radius:10px;padding:16px;font-family:'JetBrains Mono',monospace;font-size:.78rem;color:var(--green);white-space:pre;overflow-x:auto;line-height:1.7}
.src-wrap{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}.src-list{width:220px;max-height:480px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;background:var(--surface)}.src-file{padding:9px 12px;font-size:.75rem;font-family:'JetBrains Mono',monospace;cursor:pointer;color:var(--text2);border-bottom:1px solid var(--border)}.src-file.active{color:var(--accent);background:rgba(129,140,248,.1)}.src-view{flex:1;min-width:0;max-height:480px;overflow:auto;background:rgba(8,8,10,.95);border:1px solid var(--border);border-radius:10px;padding:16px}.src-view pre{font-size:.72rem;line-height:1.6;color:#E2E8F0;white-space:pre-wrap;word-break:break-word;font-family:'JetBrains Mono',monospace}
@media(max-width:1200px){.span-3{grid-column:span 6}.span-4{grid-column:span 6}.span-8{grid-column:span 12}}@media(max-width:900px){.mobile-topbar{display:flex}.sidebar{transform:translateX(-100%);width:260px;padding-top:72px}.sidebar.open{transform:translateX(0);box-shadow:20px 0 60px rgba(0,0,0,.5)}.main{margin-left:0;padding:72px 16px 32px}.span-3,.span-4,.span-6,.span-8{grid-column:span 12}}@media(max-width:640px){html{font-size:14px}.main{padding:68px 12px 24px}.bento,.db-grid{gap:12px}.card{padding:18px}.stat-value{font-size:1.6rem}.header h1{font-size:1.35rem}.search-btn{min-width:0;display:none}.header-actions{width:100%}.header-actions .btn{flex:1;justify-content:center}.modal{padding:24px;border-radius:16px}.cmd-overlay{padding-top:8vh}.toast-container{left:12px;right:12px;bottom:12px}.toast{min-width:auto;width:100%}.terminal-body{height:260px;font-size:.7rem}}
</style></head><body>
<canvas id="bg-canvas"></canvas><div class="grid-overlay"></div><div class="noise"></div><div class="aurora"></div>
<div class="boot" id="boot"><div class="boot-logo"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div><div class="boot-text">Initializing NE7-SQL</div><div class="boot-bar"><div class="boot-bar-fill" id="boot-fill"></div></div></div>

<div class="screen hidden" id="screen-setup"><div class="auth-card"><h1>NE7-SQL Setup</h1><p>First run — create your admin account and connect Drime storage.</p>
<div class="field"><label>Admin Email</label><input id="su-email" type="email"></div>
<div class="field"><label>Admin Password</label><input id="su-pass" type="password"></div>
<div class="field"><label>Drime API Key</label><input id="su-key"></div>
<button class="btn btn-primary" id="su-go" style="width:100%;justify-content:center">Initialize</button>
<p class="switch-line">Already set up? <a id="go-login">Sign in</a></p></div></div>

<div class="screen hidden" id="screen-login"><div class="auth-card"><h1>NE7-SQL</h1><p>Sign in — admins get full control, customers get their workspace.</p>
<div class="field"><label>Email</label><input id="li-email" type="email"></div>
<div class="field"><label>Password</label><input id="li-pass" type="password"></div>
<button class="btn btn-primary" id="li-go" style="width:100%;justify-content:center">Sign In</button>
<p class="switch-line">First run? <a id="go-setup">Initialize platform</a></p></div></div>

<div class="mobile-topbar hidden" id="mobile-topbar"><button class="menu-btn" id="menu-btn" aria-label="Menu"><svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button><div class="mobile-logo">NE7-SQL</div><div style="width:38px"></div></div>
<div class="sidebar-backdrop" id="sidebar-backdrop"></div>

<div class="app hidden" id="app"><aside class="sidebar" id="sidebar"><div class="logo"><div class="logo-mark"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div><div class="logo-text">NE7-SQL<span>Enterprise</span></div></div><div class="nav-section"><div class="nav-label">Platform</div><div class="nav-item active" data-view="overview"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>Overview</div><div class="nav-item" data-view="databases"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>Databases<span class="nav-badge" id="nav-db-count">0</span></div><div class="nav-item" data-view="keys"><svg viewBox="0 0 24 24"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>API Keys<span class="nav-badge" id="nav-key-count">0</span></div><div class="nav-item" data-view="admins"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Admins</div><div class="nav-item" data-view="customers"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Customers</div></div><div class="nav-section"><div class="nav-label">Tools</div><div class="nav-item" data-view="console"><svg viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>SQL Console</div><div class="nav-item" data-view="panel"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>NE7 Panel</div><div class="nav-item" id="cmd-open"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Command<span class="nav-badge">⌘K</span></div></div><div class="nav-section"><div class="nav-label">System</div><div class="nav-item" data-view="settings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</div><div class="nav-item" id="logout" style="color:var(--red)"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Logout</div></div><div class="sidebar-footer"><div class="status-pill"><span class="status-dot"></span>All systems operational</div></div></aside>

<main class="main">
<div id="view-overview"><div class="header"><h1>Overview</h1><div class="header-actions"><div class="search-btn" id="cmd-open-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Search...<kbd>⌘K</kbd></div><button class="btn btn-primary" id="new-db-btn"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>New Database</button></div></div><div class="bento"><div class="card span-3 stat-card"><div class="stat-header"><div class="stat-icon purple"><svg viewBox="0 0 24 24"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></div></div><div><div class="stat-value" id="stat-keys">0</div><div class="stat-label">API Keys</div></div></div><div class="card span-3 stat-card"><div class="stat-header"><div class="stat-icon green"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div></div><div><div class="stat-value"><span id="stat-total">0</span><span style="font-size:1rem;color:var(--text3)"> GB</span></div><div class="stat-label">Grand Total</div></div></div><div class="card span-3 stat-card"><div class="stat-header"><div class="stat-icon amber"><svg viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></div></div><div><div class="stat-value"><span id="stat-used">0</span><span style="font-size:1rem;color:var(--text3)"> GB</span></div><div class="stat-label">Grand Used</div></div></div><div class="card span-3 stat-card"><div class="stat-header"><div class="stat-icon red"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div></div><div><div class="stat-value"><span id="stat-balance">0</span><span style="font-size:1rem;color:var(--text3)"> GB</span></div><div class="stat-label">Grand Balance</div></div></div><div class="card span-12"><div class="section-header"><div class="section-title">Storage per API Key</div></div><div class="table-wrap"><table><thead><tr><th>Key</th><th>Status</th><th>Capacity</th><th>Used</th><th>Balance</th></tr></thead><tbody id="overview-storage-body"></tbody></table></div></div></div></div>

<div id="view-databases" style="display:none"><div class="header"><h1 id="db-title">Databases</h1><div class="header-actions"><button class="btn btn-primary" id="new-db-btn-2"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>New Database</button></div></div><div class="db-grid" id="db-grid"></div></div>

<div id="view-keys" style="display:none"><div class="header"><h1>API Keys</h1><div class="header-actions"><button class="btn btn-primary" id="add-key-btn"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add Key</button></div></div><div class="table-wrap"><table><thead><tr><th>Nickname</th><th>API Key</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead><tbody id="key-table"></tbody></table></div></div>

<div id="view-admins" style="display:none"><div class="header"><h1>Admins</h1><div class="header-actions"><button class="btn btn-primary" id="add-admin-btn"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add Admin</button></div></div><div class="table-wrap"><table><thead><tr><th>Email</th><th>Actions</th></tr></thead><tbody id="admin-table"></tbody></table></div></div>

<div id="view-customers" style="display:none"><div class="header"><h1>Customers</h1><div class="header-actions"><button class="btn btn-primary" id="add-cust-btn"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add Customer</button></div></div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Tenant</th><th>Actions</th></tr></thead><tbody id="cust-table"></tbody></table></div></div>

<div id="view-console" style="display:none"><div class="header"><h1>SQL Console</h1></div><div class="terminal"><div class="terminal-header"><div class="terminal-dots"><span></span><span></span><span></span></div><div class="terminal-title">psql — ne7sql</div></div><div class="terminal-body" id="console-output" style="height:400px"><div class="log-line"><span class="log-msg" style="color:var(--green)">Connected to NE7-SQL Enterprise</span></div></div><div style="padding:12px 16px;border-top:1px solid var(--border)"><div class="sql-input-wrap"><span class="sql-prompt">ne7sql=#</span><input class="sql-input" id="sql-db" placeholder="tenant" style="max-width:140px"><input class="sql-input" id="sql-input" placeholder="SELECT * FROM users..." autocomplete="off"><button class="btn btn-primary btn-sm" id="sql-run">Run</button></div></div></div></div>

<div id="view-panel" style="display:none"><div class="header"><h1>NE7 Panel — Full Stack</h1></div>
<div class="arch-card"><h3>Architecture (CF + Drime)</h3><p><b>Cloudflare Worker</b> = the brain. <b>KV</b> = keyring (Drime keys, admins, customers, signing secret). <b>Drime</b> = warehouse (customer data). Zero VPS.</p></div>
<div class="arch-card"><h3>Inverted Postgres</h3><p>TCP socket lives client-side. The Hyperwire Agent binds localhost:5432 and tunnels Postgres wire bytes over WebSocket to the Worker.</p><div class="flow">[psql / DBeaver]
   |  TCP (localhost:5432)
   v
[Hyperwire Agent]
   |  WebSocket
   v
[CF Worker /cable] -> Executor -> Drime</div></div>
<div class="arch-card"><h3>Full Source Code</h3><p>Every file that powers this platform.</p><div class="src-wrap"><div class="src-list" id="src-list"></div><div class="src-view"><pre id="src-code">Select a file...</pre></div></div></div></div>

<div id="view-settings" style="display:none"><div class="header"><h1>Settings</h1></div><div class="danger-zone"><h3>Danger Zone</h3><p>Reset wipes all databases and customers from Drime, but keeps admins and API keys. Cannot be undone.</p><button class="btn btn-danger" id="reset-btn">Reset Platform</button></div></div>
</main></div>

<div class="cmd-overlay" id="cmd-overlay"><div class="cmd-palette"><div class="cmd-input-wrap"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="cmd-input" id="cmd-input" placeholder="Type a command..." autocomplete="off"></div><div class="cmd-results"><div class="cmd-item" data-nav="overview"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/></svg>Go to Overview</div><div class="cmd-item" data-nav="databases"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/></svg>Go to Databases</div><div class="cmd-item" data-nav="keys"><svg viewBox="0 0 24 24"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777z"/></svg>Go to API Keys</div><div class="cmd-item" data-nav="console"><svg viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>Open SQL Console</div></div></div></div>

<div class="modal-overlay" id="modal-db"><div class="modal"><h2>Create Database</h2><p>Provision a new isolated database.</p><div class="form-group"><label class="form-label">Database Name</label><input class="form-input" id="db-name" placeholder="analytics_prod"></div><div class="form-group"><label class="form-label">Password (optional)</label><input class="form-input" id="db-pass" type="password" placeholder="••••••••"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="create-db">Create Database</button></div></div></div>

<div class="modal-overlay" id="modal-key"><div class="modal"><h2>Add Drime API Key</h2><p>Each key adds 20GB of cloud storage to your pool.</p><div class="form-group"><label class="form-label">Nickname</label><input class="form-input" id="key-nick" placeholder="EU-Node-01"></div><div class="form-group"><label class="form-label">API Key</label><input class="form-input" id="key-val" placeholder="54148|jg0i..."></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="add-key">Add Key</button></div></div></div>

<div class="modal-overlay" id="modal-admin"><div class="modal"><h2>Add Admin</h2><p>Grant full platform access to another user.</p><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="admin-email" type="email"></div><div class="form-group"><label class="form-label">Password</label><input class="form-input" id="admin-pass" type="password"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="add-admin">Add Admin</button></div></div></div>

<div class="modal-overlay" id="modal-cust"><div class="modal"><h2>Add Customer</h2><p>Create a tenant and provision their database.</p><div class="form-group"><label class="form-label">Name</label><input class="form-input" id="cust-name"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="cust-email" type="email"></div><div class="form-group"><label class="form-label">Password</label><input class="form-input" id="cust-pass" type="password"></div><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" id="add-cust">Create + Provision</button></div></div></div>

<div class="modal-overlay" id="modal-confirm"><div class="modal confirm-modal"><div class="confirm-icon-wrap"><div class="confirm-icon"><svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></div></div><h2 id="confirm-title">Are you sure?</h2><p id="confirm-message">This action cannot be undone.</p><div class="modal-actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-danger-solid" id="confirm-yes">Delete</button></div></div></div>

<div class="toast-container" id="toasts"></div>

<script>
(function(){
'use strict';
var TOKEN = localStorage.getItem('ne7_token') || '';
var ROLE = '', NAME = '';
var canvas = document.getElementById('bg-canvas');
var ctx = canvas.getContext('2d');
var W, H, orbs = [];
var mx = 0, my = 0;
function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();
document.addEventListener('mousemove', function(e){ mx = (e.clientX / W - 0.5) * 2; my = (e.clientY / H - 0.5) * 2; });
orbs = [
  {x:.2,y:.25,r:Math.max(W,H)*.4,c:'129,140,248',baseA:.10,vx:.00025,vy:.0002,phase:0},
  {x:.8,y:.7,r:Math.max(W,H)*.45,c:'192,132,252',baseA:.08,vx:-.0002,vy:.00028,phase:1},
  {x:.5,y:.95,r:Math.max(W,H)*.38,c:'56,189,248',baseA:.07,vx:.00022,vy:-.0002,phase:2},
  {x:.9,y:.15,r:Math.max(W,H)*.3,c:'52,211,153',baseA:.05,vx:-.00018,vy:.0002,phase:3}
];
function drawBG(){
  ctx.clearRect(0,0,W,H);
  var t = Date.now() * 0.001;
  for(var i=0;i<orbs.length;i++){
    var o = orbs[i];
    o.x += o.vx + mx * 0.00005; o.y += o.vy + my * 0.00005;
    if(o.x < -.1 || o.x > 1.1) o.vx *= -1; if(o.y < -.1 || o.y > 1.1) o.vy *= -1;
    var a = o.baseA + Math.sin(t + o.phase) * 0.02;
    var g = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r);
    g.addColorStop(0, 'rgba(' + o.c + ',' + a + ')'); g.addColorStop(1, 'rgba(' + o.c + ',0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  }
  requestAnimationFrame(drawBG);
}
drawBG();

var canHover = window.matchMedia('(hover: hover)').matches;
var revealedKeys = {}, fullKeys = {};
var confirmCallback = null;

var ICON_EYE = '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
var ICON_EYE_OFF = '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
var ICON_COPY = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
var ICON_TRASH = '<svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

function $(s){ return document.querySelector(s); }
function $$(s){ return document.querySelectorAll(s); }
function api(path, method, body){
  var h = {'Content-Type':'application/json'};
  if (TOKEN) h['Authorization'] = 'Bearer ' + TOKEN;
  return fetch(path, { method: method || 'GET', headers: h, body: body ? JSON.stringify(body) : undefined })
    .then(function(r){ return r.json(); }).catch(function(){ return null; });
}
function toast(msg, type){
  type = type || 'success'; var c = $('#toasts'); var t = document.createElement('div'); t.className = 'toast';
  var icon = type === 'success' ? '<path d="M20 6 9 17l-5-5"/>' : '<path d="M18 6 6 18M6 6l12 12"/>';
  t.innerHTML = '<div class="toast-icon ' + type + '"><svg viewBox="0 0 24 24">' + icon + '</svg></div><div class="toast-msg">' + msg + '</div>';
  c.appendChild(t); setTimeout(function(){ t.style.opacity='0'; t.style.transform='translateX(60px)'; t.style.transition='all .4s var(--ease)'; setTimeout(function(){ t.remove(); }, 400); }, 3500);
}
function copyText(text){
  if(navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(text).then(function(){ toast('Copied to clipboard'); }); } else {
    var ta = document.createElement('textarea'); ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); toast('Copied to clipboard'); } catch(e){ toast('Copy failed','error'); }
    document.body.removeChild(ta);
  }
}
function animateValue(id, target){
  var el = document.getElementById(id); if(!el) return;
  var start = parseFloat(String(el.textContent).replace(/,/g,'')) || 0; var diff = target - start;
  if(diff === 0){ el.textContent = target; return; }
  var t0 = performance.now();
  function step(t){ var p = Math.min((t - t0)/700, 1); var e = 1 - Math.pow(1-p, 3); el.textContent = (start + diff*e).toFixed(target%1===0?0:2); if(p < 1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
function attachTilt(el){
  if(!canHover) return;
  el.addEventListener('mousemove', function(e){
    var r = el.getBoundingClientRect(); var x = e.clientX - r.left, y = e.clientY - r.top;
    var cx = r.width/2, cy = r.height/2; var rx = ((y - cy)/cy) * -3.5, ry = ((x - cx)/cx) * 3.5;
    el.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-3px)';
    el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px');
  });
  el.addEventListener('mouseleave', function(){ el.style.transform = ''; el.style.transition = 'transform .5s var(--ease)'; setTimeout(function(){ el.style.transition=''; }, 500); });
}
function attachRipple(btn){
  btn.addEventListener('click', function(e){
    var r = btn.getBoundingClientRect(); var rip = document.createElement('span'); rip.className = 'ripple';
    var size = Math.max(r.width, r.height); rip.style.width = rip.style.height = size + 'px';
    rip.style.left = (e.clientX - r.left - size/2) + 'px'; rip.style.top = (e.clientY - r.top - size/2) + 'px';
    btn.appendChild(rip); setTimeout(function(){ rip.remove(); }, 600);
  });
}
$$('.btn').forEach(attachRipple);

function openSidebar(){ $('#sidebar').classList.add('open'); $('#sidebar-backdrop').classList.add('active'); document.body.classList.add('sidebar-open'); }
function closeSidebar(){ $('#sidebar').classList.remove('open'); $('#sidebar-backdrop').classList.remove('active'); document.body.classList.remove('sidebar-open'); }
$('#menu-btn').addEventListener('click', openSidebar); $('#sidebar-backdrop').addEventListener('click', closeSidebar);

function nav(view){
  $$('.main > div[id^="view-"]').forEach(function(v){ v.style.display = 'none'; });
  var el = document.getElementById('view-' + view); if(el){ el.style.display = 'block'; }
  $$('.nav-item[data-view]').forEach(function(n){ n.classList.toggle('active', n.dataset.view === view); });
  closeSidebar();
  if (view === 'overview') loadOverview();
  else if (view === 'databases') loadDatabases();
  else if (view === 'keys') loadKeys();
  else if (view === 'admins') loadAdmins();
  else if (view === 'customers') loadCustomers();
  else if (view === 'panel') loadSource();
}
$$('.nav-item[data-view]').forEach(function(item){ item.addEventListener('click', function(){ nav(item.dataset.view); }); });
$('#logout').addEventListener('click', function(){ localStorage.removeItem('ne7_token'); location.reload(); });

function openCmd(){ $('#cmd-overlay').classList.add('active'); $('#cmd-input').focus(); }
function closeCmd(){ $('#cmd-overlay').classList.remove('active'); $('#cmd-input').value=''; }
$('#cmd-open').addEventListener('click', openCmd); $('#cmd-open-2').addEventListener('click', openCmd);
$('#cmd-overlay').addEventListener('click', function(e){ if(e.target === this) closeCmd(); });
$$('.cmd-item').forEach(function(item){ item.addEventListener('click', function(){ if(item.dataset.nav) nav(item.dataset.nav); closeCmd(); }); });
document.addEventListener('keydown', function(e){ if((e.metaKey || e.ctrlKey) && e.key === 'k'){ e.preventDefault(); openCmd(); } if(e.key === 'Escape'){ closeCmd(); closeAllModals(); } });

function openModal(id){ document.getElementById(id).classList.add('active'); }
function closeModal(id){ document.getElementById(id).classList.remove('active'); }
function closeAllModals(){ $$('.modal-overlay').forEach(function(m){ m.classList.remove('active'); }); }
$$('[data-close]').forEach(function(b){ b.addEventListener('click', function(){ b.closest('.modal-overlay').classList.remove('active'); }); });
$$('.modal-overlay').forEach(function(m){ m.addEventListener('click', function(e){ if(e.target === m) m.classList.remove('active'); }); });

function showConfirm(title, message, onConfirm){
  $('#confirm-title').textContent = title; $('#confirm-message').textContent = message;
  confirmCallback = onConfirm; openModal('modal-confirm');
}
$('#confirm-yes').addEventListener('click', function(){ if(confirmCallback) confirmCallback(); confirmCallback = null; closeModal('modal-confirm'); });

function showLogin(){ $('#screen-setup').classList.add('hidden'); $('#screen-login').classList.remove('hidden'); }
function showSetup(){ $('#screen-login').classList.add('hidden'); $('#screen-setup').classList.remove('hidden'); }

api('/api/status').then(function(st){
  if (st && st.setup === true) {
    api('/api/me').then(function(me){
      if (me && me.role) { ROLE = me.role; NAME = me.name; enterApp(); }
      else { showLogin(); }
    });
  } else if (st && st.setup === false) {
    showSetup();
  } else {
    showLogin();
  }
});

var bootFill = $('#boot-fill');
setTimeout(function(){ bootFill.style.width = '40%'; }, 100);
setTimeout(function(){ bootFill.style.width = '75%'; }, 500);
setTimeout(function(){ bootFill.style.width = '100%'; }, 900);
setTimeout(function(){ $('#boot').classList.add('hidden'); }, 1400);

$('#go-login').addEventListener('click', function(e){ e.preventDefault(); showLogin(); });
$('#go-setup').addEventListener('click', function(e){ e.preventDefault(); showSetup(); });
$('#su-go').addEventListener('click', function(){
  api('/api/setup','POST',{adminEmail:$('#su-email').value, adminPassword:$('#su-pass').value, drimeKey:$('#su-key').value}).then(function(r){
    if (r.ok) { toast('Initialized! Sign in.'); showLogin(); }
    else { toast(r.error || 'Failed','error'); }
  });
});
$('#li-go').addEventListener('click', function(){
  api('/api/login','POST',{email:$('#li-email').value, password:$('#li-pass').value}).then(function(r){
    if (r.token) { TOKEN = r.token; ROLE = r.role; NAME = r.name; localStorage.setItem('ne7_token', TOKEN); enterApp(); }
    else { toast(r.error || 'Login failed','error'); }
  });
});
function enterApp(){
  $('#screen-setup').classList.add('hidden');
  $('#screen-login').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#mobile-topbar').classList.remove('hidden');
  $$('.nav-item').forEach(function(n){
    if (n.dataset.view === 'admins' || n.dataset.view === 'customers' || n.dataset.view === 'keys' || n.dataset.view === 'settings' || n.dataset.view === 'panel') {
      n.style.display = ROLE === 'admin' ? '' : 'none';
    }
  });
  $('#new-db-btn').style.display = ROLE === 'admin' ? '' : 'none';
  $('#new-db-btn-2').style.display = ROLE === 'admin' ? '' : 'none';
  nav(ROLE === 'admin' ? 'overview' : 'databases');
}

function loadOverview(){
  api('/api/admin/storage').then(function(s){
    if (!s) return;
    $('#stat-keys').textContent = s.rows.length;
    $('#stat-total').textContent = s.grandTotalGB;
    $('#stat-used').textContent = s.grandUsedGB;
    $('#stat-balance').textContent = s.grandBalanceGB;
    var body = $('#overview-storage-body');
    body.innerHTML = s.rows.map(function(r){
      return '<tr><td style="font-family:Inter;font-weight:600">' + r.nickname + '</td><td><span class="badge ' + (r.status==='HEALTHY'?'badge-green':'badge-red') + '">' + r.status + '</span></td><td>' + r.capacityGB + ' GB</td><td>' + r.usedGB + ' GB</td><td>' + r.balanceGB + ' GB</td></tr>';
    }).join('');
  });
  api('/api/databases').then(function(d){ if(d){ $('#nav-db-count').textContent = d.length; } });
  api('/api/admin/keys').then(function(k){ if(k){ $('#nav-key-count').textContent = k.length; } });
}

function loadDatabases(){
  $('#db-title').textContent = ROLE === 'admin' ? 'All Databases' : 'My Databases';
  api('/api/databases').then(function(dbs){
    var grid = $('#db-grid');
    if(!dbs || !dbs.length){ grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg><h3>No databases yet</h3><p>Create your first database to get started.</p></div>'; return; }
    grid.innerHTML = '';
    dbs.forEach(function(db){
      var card = document.createElement('div');
      card.className = 'db-card card-enter';
      card.innerHTML = '<div class="db-card-top"><div class="db-name">' + db.name + '</div><div class="db-status active">Active</div></div>' +
        '<div class="db-meta"><span><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>' + db.tables + ' tables</span>' +
        (db.key ? '<span><svg viewBox="0 0 24 24"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777z"/></svg>' + db.key + '</span>' : '') +
        '</div>';
      attachTilt(card);
      grid.appendChild(card);
    });
  });
}

function loadKeys(){
  api('/api/admin/keys').then(function(ks){
    var tbody = $('#key-table');
    if(!ks || !ks.length){ tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:40px">No API keys added yet</td></tr>'; return; }
    tbody.innerHTML = '';
    ks.forEach(function(k){
      var row = document.createElement('tr'); row.dataset.id = k.id;
      row.innerHTML = '<td style="font-family:Inter;font-weight:600">' + k.nickname + '</td><td><div class="key-cell"><span class="key-text">' + k.key + '</span></div></td><td>' + k.capacityGB + ' GB</td><td><span class="badge ' + (k.status==='HEALTHY'?'badge-green':'badge-red') + '">' + (k.status || 'UNKNOWN') + '</span></td><td><div class="key-actions"><button class="icon-btn" data-act="eye" title="Show/Hide">' + ICON_EYE + '</button><button class="icon-btn" data-act="copy" title="Copy">' + ICON_COPY + '</button><button class="icon-btn danger" data-act="delkey" data-nick="' + k.nickname + '" title="Delete">' + ICON_TRASH + '</button></div></td>';
      tbody.appendChild(row);
    });
    $$('#key-table [data-act]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var act = btn.dataset.act;
        var row = btn.closest('tr'); var id = row.dataset.id;
        if(act === 'eye') toggleKey(id, row);
        else if(act === 'copy') copyKey(id);
        else if(act === 'delkey') showConfirm('Remove "' + btn.dataset.nick + '"?', 'This API key will be removed from the storage pool.', function(){ api('/api/admin/keys/' + id, 'DELETE').then(function(){ toast('Key removed'); loadKeys(); }); });
      });
    });
  });
}

function toggleKey(id, row){
  var textEl = row.querySelector('.key-text');
  var btn = row.querySelector('[data-act="eye"]');
  if(revealedKeys[id]){ delete revealedKeys[id]; textEl.textContent = fullKeys[id].slice(0,6) + '••••••••' + fullKeys[id].slice(-4); btn.innerHTML = ICON_EYE; return; }
  api('/api/admin/keys/' + id + '/reveal').then(function(res){
    if(res && res.key){ fullKeys[id] = res.key; revealedKeys[id] = true; textEl.textContent = res.key; btn.innerHTML = ICON_EYE_OFF; }
  });
}
function copyKey(id){
  if(fullKeys[id]){ copyText(fullKeys[id]); return; }
  api('/api/admin/keys/' + id + '/reveal').then(function(res){ if(res && res.key){ fullKeys[id] = res.key; copyText(res.key); } });
}

function loadAdmins(){
  api('/api/admin/admins').then(function(list){
    var tbody = $('#admin-table');
    if(!list || !list.length){ tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--text3);padding:40px">No admins</td></tr>'; return; }
    tbody.innerHTML = list.map(function(e){ return '<tr data-email="' + encodeURIComponent(e) + '"><td style="font-family:Inter;font-weight:600">' + e + '</td><td><button class="icon-btn danger" data-act="deladmin">' + ICON_TRASH + '</button></td></tr>'; }).join('');
    $$('#admin-table [data-act]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var row = btn.closest('tr'); var email = row.dataset.email;
        showConfirm('Remove admin?', 'This user loses access immediately.', function(){ api('/api/admin/admins/' + email, 'DELETE').then(function(){ toast('Admin removed'); loadAdmins(); }); });
      });
    });
  });
}
function loadCustomers(){
  api('/api/admin/customers').then(function(list){
    var tbody = $('#cust-table');
    if(!list || !list.length){ tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text3);padding:40px">No customers</td></tr>'; return; }
    tbody.innerHTML = list.map(function(c){ return '<tr data-id="' + c.id + '"><td style="font-family:Inter;font-weight:600">' + c.name + '</td><td>' + c.email + '</td><td style="color:var(--text3)">' + c.tenantId + '</td><td><button class="icon-btn danger" data-act="delcust">' + ICON_TRASH + '</button></td></tr>'; }).join('');
    $$('#cust-table [data-act]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var row = btn.closest('tr'); var id = row.dataset.id;
        showConfirm('Delete customer?', 'This removes their access and workspace.', function(){ api('/api/admin/customers/' + id, 'DELETE').then(function(){ toast('Customer deleted'); loadCustomers(); }); });
      });
    });
  });
}

function loadSource(){
  api('/api/admin/source').then(function(src){
    var el = $('#src-list');
    var names = Object.keys(src);
    el.innerHTML = names.map(function(n){ return '<div class="src-file" data-f="' + n + '">' + n + '</div>'; }).join('');
    $$('#src-list .src-file').forEach(function(f){
      f.addEventListener('click', function(){
        $$('#src-list .src-file').forEach(function(x){ x.classList.remove('active'); });
        f.classList.add('active');
        $('#src-code').textContent = src[f.dataset.f];
      });
    });
  });
}

$('#new-db-btn').addEventListener('click', function(){ openModal('modal-db'); });
$('#new-db-btn-2').addEventListener('click', function(){ openModal('modal-db'); });
$('#add-key-btn').addEventListener('click', function(){ openModal('modal-key'); });
$('#add-admin-btn').addEventListener('click', function(){ openModal('modal-admin'); });
$('#add-cust-btn').addEventListener('click', function(){ openModal('modal-cust'); });

$('#create-db').addEventListener('click', function(){
  var name = $('#db-name').value.trim(); if(!name){ toast('Database name required','error'); return; }
  api('/api/admin/customers','POST',{ name:name, email:name + '@internal', password:$('#db-pass').value || Math.random().toString(36).slice(2) }).then(function(){ closeModal('modal-db'); toast('Database "' + name + '" created'); $('#db-name').value=''; $('#db-pass').value=''; loadDatabases(); });
});
$('#add-key').addEventListener('click', function(){
  var nick = $('#key-nick').value.trim(), key = $('#key-val').value.trim(); if(!nick || !key){ toast('All fields required','error'); return; }
  api('/api/admin/keys','POST',{ nickname:nick, key:key }).then(function(){ closeModal('modal-key'); toast('Key "' + nick + '" added'); $('#key-nick').value=''; $('#key-val').value=''; loadKeys(); });
});
$('#add-admin').addEventListener('click', function(){
  var email = $('#admin-email').value.trim(), pass = $('#admin-pass').value; if(!email || !pass){ toast('All fields required','error'); return; }
  api('/api/admin/admins','POST',{ email:email, password:pass }).then(function(){ closeModal('modal-admin'); toast('Admin added'); $('#admin-email').value=''; $('#admin-pass').value=''; loadAdmins(); });
});
$('#add-cust').addEventListener('click', function(){
  var name = $('#cust-name').value.trim(), email = $('#cust-email').value.trim(), pass = $('#cust-pass').value; if(!name || !email || !pass){ toast('All fields required','error'); return; }
  api('/api/admin/customers','POST',{ name:name, email:email, password:pass }).then(function(r){ closeModal('modal-cust'); toast('Provisioned on key: ' + (r.key || 'default')); $('#cust-name').value=''; $('#cust-email').value=''; $('#cust-pass').value=''; loadCustomers(); });
});

$('#reset-btn').addEventListener('click', function(){
  showConfirm('Confirm Reset', 'Type RESET in the next prompt to wipe everything.', function(){
    var w = prompt('Type RESET to confirm');
    if (w === 'RESET') { api('/api/admin/reset','POST',{}).then(function(r){ toast('Deleted ' + r.deleted + ' files.'); loadOverview(); }); }
    else { toast('Aborted'); }
  });
});

function runSQL(){
  var sql = $('#sql-input').value.trim(); if(!sql) return;
  var tenant = $('#sql-db').value.trim();
  var out = $('#console-output');
  out.innerHTML += '<div class="log-line"><span class="log-module">ne7sql=#</span><span class="log-msg">' + sql + '</span></div>';
  $('#sql-input').value = '';
  api('/api/query','POST',{ sql:sql, tenantId:tenant }).then(function(res){
    if (!res) return;
    var lvl = res.error ? 'ERROR' : 'INFO';
    var msg = res.error || res.message || 'OK';
    var extra = res.rows ? NL + JSON.stringify(res.rows.slice(0,10), null, 1) : '';
    out.innerHTML += '<div class="log-line"><span class="log-level ' + lvl + '">' + msg + '</span><span class="log-msg">' + extra + '</span></div>';
    out.scrollTop = out.scrollHeight;
  });
}
$('#sql-run').addEventListener('click', runSQL);
$('#sql-input').addEventListener('keydown', function(e){ if(e.key === 'Enter') runSQL(); });

var NL = String.fromCharCode(10);
})();
</script></body></html>`;
