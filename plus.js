/* Mayschat : ajouts (statuts, caméra, appels style WhatsApp, bannière d'inscription, notifications push) */
(function(){
"use strict";
/* ====== À REMPLIR : réglages Firebase (console Firebase > Paramètres du projet) ====== */
const FB={apiKey:"COLLE_ICI",authDomain:"COLLE_ICI",projectId:"COLLE_ICI",messagingSenderId:"COLLE_ICI",appId:"COLLE_ICI"},VAPID="COLLE_ICI";
/* ================================================================================== */
let SS=[];
const SIMG=/^[0-9a-f-]{36}\/[0-9]{10,}\.jpg$/,SCOL=/^#[0-9a-fA-F]{6}$/;
const css=document.createElement("style");
css.textContent=`.toast.match{border-left-color:#25D366}.tb{display:flex;gap:10px;align-items:center}.tb small{color:var(--mute)}
.cam{position:fixed;inset:0;z-index:70;background:#000}.cam video,.cam img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cx{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));left:14px;width:44px;height:44px;border-radius:50%;border:0;background:#0006;color:#fff;font-size:20px;cursor:pointer;z-index:2}
.cb{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-around;align-items:center;padding:20px 16px calc(24px + env(safe-area-inset-bottom,0px));background:linear-gradient(#0000,#0009);z-index:2}.cb[hidden],.cam img[hidden]{display:none}
.cr{width:50px;height:50px;border-radius:50%;border:0;background:#fff3;color:#fff;font-size:22px;display:grid;place-items:center;cursor:pointer}
.csh{width:76px;height:76px;border-radius:50%;border:5px solid #fff;background:#fff4;cursor:pointer}
.inc{position:fixed;inset:0;z-index:65;background:linear-gradient(#0F3A57,#0B141A);color:#fff;display:flex;flex-direction:column;justify-content:space-between;align-items:center}`;
document.head.appendChild(css);
IC.s="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14z";

/* ---------- Sons ---------- */
let AC=null,RT=null;
function tone(seq){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();let t=AC.currentTime;seq.forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d);t+=d})}catch(x){}}
const SND={msg:[[880,.1],[1175,.15]],reg:[[660,.18]],match:[[784,.12],[988,.12],[1319,.12],[1568,.3]]};
document.addEventListener("pointerdown",()=>tone([]),{once:true});
function ring(){clearInterval(RT);const go=()=>{if(!document.querySelector(".inc")){clearInterval(RT);return}tone([[440,.35],[554,.35]]);navigator.vibrate&&navigator.vibrate([400,200,400])};go();RT=setInterval(go,2200)}

/* ---------- Bannière (inscriptions, messages) ---------- */
const _toast=window.toast;
window.toast=function(t,f,s){_toast(t,f);$("toast").classList.toggle("match",s==="match");if(s)tone(SND[s])};
window.newMember=function(r){if(!ready)return;const m=(r.skills||[]).filter(x=>hs(ME.skills,x)),same=r.city&&ME.city&&key(r.city)===key(ME.city),sk=m[0]||(r.skills||[])[0]||"";
 toast(`<div class="tb">${av(r,44)}<div><b>${e(r.name)}</b> vient de s’inscrire${m.length?' · <b style="color:#128C4A">même métier que vous</b>':""}<br><small>${e(sk)}${r.city?" · "+e(r.city)+(same?" (votre ville)":""):""}</small></div></div>`,()=>showP(r.id),m.length?"match":"reg")};
const _om=window.onMsg;window.onMsg=function(m){_om(m);if(m.sender!==U.id)tone(SND.msg)};

/* ---------- Caméra style WhatsApp ---------- */
function camera(cb,face){const V=navigator.mediaDevices;
 if(!(V&&V.getUserMedia)){const i=document.createElement("input");i.type="file";i.accept="image/*";i.setAttribute("capture",face==="user"?"user":"environment");i.onchange=()=>{const fl=i.files[0];if(fl)shrink(fl,900,cb)};i.click();return}
 let f=face||"environment",st=null,blob=null,fl=false;
 const d=document.createElement("div");d.className="cam";
 d.innerHTML=`<video autoplay playsinline muted></video><img id="cp" hidden><button class="cx" id="c1">✕</button><button class="cx" id="c2" style="left:auto;right:14px;opacity:.7">⚡</button><div class="cb" id="cb1"><label class="cr">🖼️<input type="file" accept="image/*" hidden id="c3"></label><button class="csh" id="c4"></button><button class="cr" id="c5">🔄</button></div><div class="cb" id="cb2" hidden><button class="cr" id="c6">↺</button><button class="cr" id="c7" style="background:#25D366">➤</button></div>`;
 document.body.appendChild(d);const vd=d.querySelector("video"),g=i=>d.querySelector("#"+i);
 const stop=()=>{st&&st.getTracks().forEach(t=>t.stop())},close=()=>{stop();d.remove()};
 const start=async()=>{stop();try{st=await V.getUserMedia({video:{facingMode:f},audio:false});vd.srcObject=st;vd.style.transform=f==="user"?"scaleX(-1)":"none"}catch(er){d.remove();toast(e(camErr(er)))}};
 g("c1").onclick=close;g("c5").onclick=()=>{f=f==="user"?"environment":"user";fl=false;start()};
 g("c2").onclick=()=>{const t=st&&st.getVideoTracks()[0];if(!t)return;t.applyConstraints({advanced:[{torch:!fl}]}).then(()=>{fl=!fl;g("c2").style.opacity=fl?1:.7}).catch(()=>toast("Flash indisponible sur cet appareil."))};
 g("c3").onchange=ev=>{const x=ev.target.files[0];if(x)shrink(x,900,b=>{close();cb(b)})};
 g("c4").onclick=()=>{if(!vd.videoWidth)return;const c=document.createElement("canvas"),k=Math.min(1,900/Math.max(vd.videoWidth,vd.videoHeight));c.width=Math.round(vd.videoWidth*k);c.height=Math.round(vd.videoHeight*k);const x=c.getContext("2d");if(f==="user"){x.translate(c.width,0);x.scale(-1,1)}x.drawImage(vd,0,0,c.width,c.height);c.toBlob(b=>{blob=b;g("cp").src=URL.createObjectURL(b);g("cp").hidden=false;g("cb1").hidden=true;g("cb2").hidden=false},"image/jpeg",.8)};
 g("c6").onclick=()=>{blob=null;g("cp").hidden=true;g("cb2").hidden=true;g("cb1").hidden=false};
 g("c7").onclick=()=>{const b=blob;close();cb(b)};
 start()}
const _oc=window.openChat;
window.openChat=function(id,after){_oc(id,after);const b=$("ca");if(b)b.onclick=()=>camera(async bl=>{const path=`${U.id}/${id}/${Date.now()}.jpg`,up=await sb.storage.from("chat-images").upload(path,bl,{contentType:"image/jpeg"});if(up.error)return toast("Photo non envoyée : "+e(up.error.message));sendMsg("",path)})};
const _pb=window.profileBind;
window.profileBind=function(first){_pb(first);$("psf").onclick=()=>camera(b=>{PF.blob=b;$("ph").innerHTML=`<div class="av" style="width:96px;height:96px;background-image:url(${URL.createObjectURL(b)})"></div>`},"user")};

/* ---------- Statuts ---------- */
const fresh=()=>SS.filter(s=>Date.now()-new Date(s.created_at)<864e5);
function renderS(v){const by=new Map();fresh().forEach(s=>{if(!by.has(s.user_id))by.set(s.user_id,[]);by.get(s.user_id).push(s)});
 const mine=by.get(U.id)||[];by.delete(U.id);const sk=id=>Number(ls.get("mayschat_sv_"+id))||0,last=l=>new Date(l[l.length-1].created_at);
 const rows=[...by.entries()].map(([id,l])=>({id,l,seen:sk(id)>=last(l).getTime()})).sort((a,b)=>(a.seen-b.seen)||last(b.l)-last(a.l));
 v.innerHTML=`<div class="item" id="ms"><div class="${mine.length?"ring":""}">${av(ME,mine.length?44:50)}</div><div class="b"><b>Mon statut</b><p>${mine.length?mine.length+" statut(s) · toucher pour voir":"Toucher pour ajouter un statut"}</p></div></div>`+
 (rows.length?'<div class="sec">Mises à jour récentes</div>'+rows.map(r=>`<div class="item" data-s="${r.id}"><div class="ring${r.seen?" seen":""}">${av(PR.get(r.id),44)}</div><div class="b"><b>${e(pname(r.id))}</b><p>${hhmm(last(r.l))}</p></div></div>`).join(""):'<p style="padding:16px;color:var(--mute)">Aucun statut récent. Les statuts disparaissent après 24 h.</p>')+'<button class="fab" id="fs">+</button>';
 $("ms").onclick=()=>mine.length?viewS(U.id):newS();$("fs").onclick=newS;v.querySelectorAll("[data-s]").forEach(x=>x.onclick=()=>viewS(x.dataset.s))}
function viewS(id){const l=fresh().filter(s=>s.user_id===id);if(!l.length)return;let i=0,t=null;
 const d=document.createElement("div");d.className="sv";document.body.appendChild(d);
 const done=()=>{clearTimeout(t);d.remove();ls.set("mayschat_sv_"+id,String(new Date(l[l.length-1].created_at).getTime()));if(tab==="s"&&view==="list")draw()};
 const show=()=>{clearTimeout(t);if(i>=l.length)return done();const s=l[i],im=s.image_path&&SIMG.test(s.image_path);
  d.style.background=im?"#000":(SCOL.test(s.color||"")?s.color:"#1A78BC");
  d.innerHTML=`<i></i><u>${e(pname(id))} · ${hhmm(s.created_at)}</u><button class="cx" id="sx" style="left:auto;right:14px;top:calc(24px + env(safe-area-inset-top,0px))">✕</button>${im?`<img src="${SBURL}/storage/v1/object/public/statuses/${s.image_path}" style="max-width:100%;max-height:100%;object-fit:contain">`:""}${s.body?`<div style="${im?"position:absolute;bottom:70px;left:0;right:0;background:#0007;padding:10px;font-size:18px":""}">${e(s.body)}</div>`:""}${id===U.id?'<button class="cx" id="sd2" style="top:auto;bottom:20px">🗑</button>':""}`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const b=d.querySelector("i");if(b)b.style.width="calc(100% - 20px)"}));
  t=setTimeout(()=>{i++;show()},5000);
  $("sx").onclick=ev=>{ev.stopPropagation();done()};
  if($("sd2"))$("sd2").onclick=async ev=>{ev.stopPropagation();clearTimeout(t);await sb.from("statuses").delete().eq("id",s.id);SS=SS.filter(x=>x.id!==s.id);d.remove();if(tab==="s"&&view==="list")draw()}};
 d.onclick=ev=>{if(ev.clientX<d.clientWidth/3&&i>0)i--;else i++;show()};show()}
function newS(){sub("Nouveau statut");const C=["#1A78BC","#2E7D32","#C2571A","#6A4C93","#AD1457","#37474F"];let col=C[0],blob=null;
 $("v").innerHTML=`<div class="form"><div id="sp" style="border-radius:14px;min-height:220px;display:grid;place-items:center;padding:16px;color:#fff;font-size:24px;font-weight:600;text-align:center;background:${col}">Votre texte</div><textarea id="st" rows="3" maxlength="300" placeholder="Écrivez votre statut…"></textarea><div>${C.map(c=>`<button class="sk" data-c="${c}" style="background:${c};width:34px;height:34px;padding:0"></button>`).join("")}</div><div style="display:flex;gap:8px"><button class="btn o" id="sc" style="flex:1">📷 Photo</button><label class="btn o" style="flex:1;text-align:center">🖼️ Galerie<input type="file" accept="image/*" hidden id="sg"></label></div><button class="btn" id="so">Publier</button><p id="er" style="color:#C62828;margin:0"></p></div>`;
 const pv=()=>{const p=$("sp");p.style.background=blob?`url(${URL.createObjectURL(blob)}) center/cover`:col;p.textContent=blob?"":($("st").value||"Votre texte")};
 $("st").oninput=pv;$("v").querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{col=b.dataset.c;blob=null;pv()});
 $("sc").onclick=()=>camera(b=>{blob=b;pv()});$("sg").onchange=ev=>{const x=ev.target.files[0];if(x)shrink(x,900,b=>{blob=b;pv()})};
 $("so").onclick=async()=>{const t=$("st").value.trim(),er=m=>{$("er").textContent=m};if(!t&&!blob)return er("Écrivez un texte ou ajoutez une photo.");$("so").disabled=true;let path=null;
  if(blob){path=`${U.id}/${Date.now()}.jpg`;const up=await sb.storage.from("statuses").upload(path,blob,{contentType:"image/jpeg"});if(up.error){$("so").disabled=false;return er("Photo non envoyée : "+up.error.message)}}
  const r=await sb.from("statuses").insert({body:t||null,color:col,image_path:path}).select().single();$("so").disabled=false;
  if(r.error)return er("Publication impossible : "+r.error.message);SS.push(r.data);tab="s";draw()}}
const _dr=window.draw;
window.draw=function(){if(tab!=="s")return _dr();view="list";peer=null;CHAT=null;document.querySelectorAll("#nv button").forEach(b=>b.setAttribute("aria-selected",b.dataset.t===tab));$("nv").style.display="flex";$("tp").innerHTML="<h1>Statuts</h1>";const v=$("v");v.style.cssText="position:relative";renderS(v)};
const _sh=window.shell;
window.shell=function(){_sh();const n=$("nv");n.innerHTML=[["c","Discussions"],["s","Statuts"],["k","Contrats"],["p","Profil"]].map(x=>`<button data-t="${x[0]}"><svg viewBox="0 0 24 24"><path d="${IC[x[0]]}"/></svg>${x[1]}</button>`).join("");n.querySelectorAll("button").forEach(b=>b.onclick=()=>{tab=b.dataset.t;draw()});draw();
 if(!window.__pushDone){window.__pushDone=1;pushInit();askPush()}};
const _la=window.loadAll;
window.loadAll=async function(){const ok=await _la();if(ok){const s=await sb.from("statuses").select("*").order("created_at");SS=s.data||[]}return ok};
const _lv=window.live;
window.live=function(){_lv();sb.channel("statuses").on("postgres_changes",{event:"*",schema:"public",table:"statuses"},pl=>{if(pl.eventType==="DELETE")SS=SS.filter(x=>x.id!==(pl.old||{}).id);else if(pl.new&&!SS.some(x=>x.id===pl.new.id))SS.push(pl.new);refresh()}).subscribe()};

/* ---------- Appels vidéo style WhatsApp ---------- */
const _ask=window.ask;
window.ask=function(html,yes,lab,nc,no){const mm=/vous appelle en vidéo/.test(html)&&html.match(/<b>📹 (.*?)<\/b>/);if(!mm)return _ask(html,yes,lab,nc,no);
 const p=[...PR.values()].find(x=>e(x.name)===mm[1])||{name:"?"},d=document.createElement("div");d.className="inc";
 const bt=(i,bg,ic,t)=>`<div style="text-align:center"><button id="${i}" style="width:66px;height:66px;border-radius:50%;border:0;background:${bg};color:#fff;font-size:26px;cursor:pointer">${ic}</button><div style="font-size:13px;margin-top:6px">${t}</div></div>`;
 d.innerHTML=`<div style="margin-top:14vh;text-align:center"><div style="display:flex;justify-content:center">${av(p,120)}</div><h2 style="margin:18px 0 4px">${mm[1]}</h2><div style="opacity:.8">Appel vidéo Mayschat</div></div><div style="display:flex;gap:80px;padding-bottom:calc(48px + env(safe-area-inset-bottom,0px))">${bt("i2","#D32F2F","📞","Refuser")}${bt("i1","#25D366","📹","Répondre")}</div>`;
 document.body.appendChild(d);d.querySelector("#i1").onclick=()=>{d.remove();yes()};d.querySelector("#i2").onclick=()=>{d.remove();no&&no()};ring();return d};
window.callUI=function(id){const d=document.createElement("div");d.id="call";d.style.cssText="position:fixed;inset:0;z-index:60;background:#0b141a;color:#fff;display:flex;flex-direction:column";
 const b=(i,t,ic,bg)=>`<button id="${i}" title="${t}" style="width:54px;height:54px;border-radius:50%;border:0;background:${bg||"#ffffff26"};color:#fff;font-size:22px;cursor:pointer">${ic}</button>`;
 d.innerHTML=`<video id="rv" autoplay playsinline style="flex:1;width:100%;object-fit:cover;background:#0b141a"></video><div id="cav" style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:18vh;background:linear-gradient(#0F3A57,#0B141A)">${av(PR.get(id)||{id:id,name:"?"},120)}</div><video id="lv" autoplay playsinline muted style="position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:12px;width:96px;height:128px;object-fit:cover;border-radius:12px;border:2px solid #fff4;background:#222"></video><div style="position:absolute;top:calc(14px + env(safe-area-inset-top,0px));left:16px;text-shadow:0 1px 4px #000"><b style="font-size:20px">${e(pname(id))}</b><div id="cs" style="font-size:14px;opacity:.9">Appel…</div></div><div style="position:absolute;left:12px;right:12px;bottom:calc(14px + env(safe-area-inset-bottom,0px));display:flex;justify-content:space-around;padding:12px;border-radius:32px;background:#1f2c33ee">${b("cf","Retourner","🔄")}${b("cv","Caméra","📹")}${b("cm","Micro","🎤")}${b("ce","Raccrocher","📞","#D32F2F")}</div>`;
 document.body.appendChild(d);$("lv").srcObject=CALL.local;
 $("cm").onclick=()=>{CALL.local.getAudioTracks().forEach(t=>t.enabled=!t.enabled);$("cm").style.opacity=CALL.local.getAudioTracks().some(t=>t.enabled)?1:.4};
 $("cv").onclick=()=>{CALL.local.getVideoTracks().forEach(t=>t.enabled=!t.enabled);$("cv").style.opacity=CALL.local.getVideoTracks().some(t=>t.enabled)?1:.4};
 $("cf").onclick=flipCam;$("ce").onclick=()=>endCall(true)};
function startTimer(){const a=$("cav");if(a)a.style.display="none";if(!CALL)return;clearInterval(CALL.tm);CALL.tm=setInterval(()=>{const s=$("cs");if(s&&CALL&&CALL.at)s.textContent=fmtDur(Date.now()-CALL.at)},1000)}
const _mk=window.mkPC;
window.mkPC=function(){_mk();const pc=CALL.pc,o=pc.onconnectionstatechange;pc.onconnectionstatechange=()=>{o&&o();if(pc.connectionState==="connected")startTimer()}};
const _ec=window.endCall;
window.endCall=function(n){if(CALL)clearInterval(CALL.tm);_ec(n)};

/* ---------- Notifications push (Firebase) ---------- */
const loadJS=u=>new Promise(r=>{const s=document.createElement("script");s.src=u;s.onload=s.onerror=r;document.head.appendChild(s)});
async function pushInit(){try{if(!("serviceWorker" in navigator)||!("Notification" in window)||Notification.permission!=="granted"||/COLLE/.test(FB.apiKey))return;
 if(!window.firebase){await loadJS("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");await loadJS("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js")}
 const reg=await navigator.serviceWorker.register("firebase-messaging-sw.js");if(!window.firebase.apps.length)window.firebase.initializeApp(FB);
 const t=await window.firebase.messaging().getToken({vapidKey:VAPID,serviceWorkerRegistration:reg});if(t)await sb.rpc("save_push_token",{t:t})}catch(x){console.warn("push",x)}}
function askPush(){if(!("Notification" in window)||Notification.permission!=="default"||ls.get("mayschat_pushask"))return;ls.set("mayschat_pushask","1");
 setTimeout(()=>ask("🔔 Activer les notifications pour recevoir les messages et les nouveaux professionnels, même quand l’app est fermée ?",()=>Notification.requestPermission().then(pushInit),"Activer"),1500)}
})();
