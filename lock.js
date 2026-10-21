// Daylog app lock: an optional passcode screen.
// It hides the app while the page is in the background, and asks for the passcode after the time you choose.
// It keeps other people out of the app on this device. It does not encrypt the data saved in the browser.
(()=>{
const LK='daylog.lock',FK='daylog.lockfail',ITER=200000,subtle=window.crypto&&crypto.subtle,enc=new TextEncoder();
const b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))),unb=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const cfg=()=>{try{const c=JSON.parse(localStorage.getItem(LK)||'null');return c&&c.h&&c.s?c:null}catch{return null}};
const fails=()=>{try{return JSON.parse(localStorage.getItem(FK)||'{}')}catch{return{}}};
async function hash(pin,salt,it){const k=await subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']);return new Uint8Array(await subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:it},k,256))}
const same=(a,b)=>{if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];return d===0};
async function verify(pin){const c=cfg();return !c||same(await hash(pin,unb(c.s),c.i),unb(c.h))}
async function save(pin,mins){const salt=crypto.getRandomValues(new Uint8Array(16));localStorage.setItem(LK,JSON.stringify({v:1,s:b64(salt),h:b64(await hash(pin,salt,ITER)),i:ITER,m:mins}))}
const weak=p=>p.length<4?'Use at least 4 characters.':/^(.)\1+$/.test(p)||['1234','4321','12345','123456','0123','1111','0000','password','qwerty'].includes(p.toLowerCase())?'That passcode is too easy to guess.':'';
const MINS=[[0,'Every time I leave the app'],[1,'After 1 minute'],[5,'After 5 minutes'],[15,'After 15 minutes'],[60,'After 1 hour']];
let locked=false,hiddenAt=0,idle=0,root;
const shell=()=>document.querySelector('.shell');
const el=()=>root||(root=Object.assign(document.createElement('div'),{id:'lockscreen',className:'gate lockscreen',hidden:true}));
const LOGO='<span class="logo"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg></span>';
function show(html){const r=el();if(!r.isConnected)document.body.appendChild(r);r.innerHTML=`<div class="box">${LOGO}${html}</div>`;r.hidden=false;r.removeAttribute('data-cover');if(shell())shell().inert=true}
function cover(){const r=el();if(!r.isConnected)document.body.appendChild(r);r.innerHTML=`<div class="box">${LOGO}</div>`;r.setAttribute('data-cover','1');r.hidden=false}
function hide(){const r=el();r.hidden=true;r.innerHTML='';if(shell())shell().inert=false}
function lock(){if(!cfg())return;locked=true;show(`<h1 style="margin:14px 0 4px">Daylog is locked</h1><p class="mute" style="margin:0 0 14px">Enter your passcode to continue.</p><input id="lkpin" type="password" autocomplete="off" placeholder="Passcode" aria-label="Passcode"><div class="err" id="lkerr" role="alert"></div><button class="send" id="lkgo">Unlock</button><button class="send g" id="lkforgot" style="margin-top:8px">Forgot passcode?</button>`);setTimeout(()=>{const i=document.getElementById('lkpin');i&&i.focus()},30)}
async function tryUnlock(){const i=document.getElementById('lkpin'),e=document.getElementById('lkerr');if(!i)return;const F=fails();
 if(F.until&&Date.now()<F.until)return e.textContent=`Too many tries. Wait ${Math.ceil((F.until-Date.now())/1000)} seconds.`;
 let ok=false;try{ok=await verify(i.value)}catch{}
 if(ok){localStorage.removeItem(FK);locked=false;hide();arm();return}
 const n=(F.n||0)+1;localStorage.setItem(FK,JSON.stringify({n,until:n>=3?Date.now()+Math.min(900,15*2**(n-3))*1e3:0}));i.value='';e.textContent=n>=3?'Wrong passcode. Please wait before trying again.':'Wrong passcode.';i.focus()}
function forgot(){if(!confirm('Forgot your passcode?\n\nThe only way in is to sign out and erase the Daylog data stored on this device. If you use cloud sign-in, your cloud copy is not touched. Anything that exists only on this device will be lost.\n\nContinue?'))return;
 if((prompt('Type ERASE to confirm.')||'').trim().toUpperCase()!=='ERASE')return;
 ['daylog.v2','daylog.v1','daylog.auth','daylog.authfail','daylog.corrupt',LK,FK].forEach(k=>localStorage.removeItem(k));location.reload()}
// ---- when to lock ----
function arm(){clearTimeout(idle);const c=cfg();if(!c||locked)return;idle=setTimeout(lock,Math.max(1,c.m)*6e4)}
['pointerdown','keydown','touchstart'].forEach(t=>document.addEventListener(t,()=>{if(!locked&&cfg())arm()},{passive:true,capture:true}));
document.addEventListener('visibilitychange',()=>{const c=cfg();if(!c||locked)return;
 if(document.hidden){hiddenAt=Date.now();cover()}
 else{const mins=(Date.now()-hiddenAt)/6e4;if(c.m===0||mins>=c.m)lock();else{hide();arm()}}});
// ---- settings card and dialogs ----
function modal(kind){const c=cfg(),title={on:'Turn on app lock',change:'Change passcode',off:'Turn off app lock'}[kind];
 const f=(id,l,ac)=>`<label class="lkl" for="${id}">${l}</label><input id="${id}" type="password" autocomplete="${ac||'off'}">`;
 const d=document.createElement('div');d.className='gate lkmodal';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label',title);
 d.innerHTML=`<div class="box"><h1 style="margin:0 0 6px;font-size:22px">${title}</h1>${kind==='on'?'<p class="mute" style="margin:0 0 10px">Choose a passcode you can remember. There is no reset: if you forget it, the only way in is to sign out and erase this device\'s data.</p>':''}${kind!=='on'?f('lk0','Current passcode'):''}${kind!=='off'?f('lk1','New passcode')+f('lk2','Repeat new passcode'):''}<div class="err" id="lkmerr" role="alert"></div><button class="send" id="lkok">${kind==='off'?'Turn off':'Save'}</button><button class="send g" id="lkcancel" style="margin-top:8px">Cancel</button></div>`;
 document.body.appendChild(d);const first=d.querySelector('input');first&&first.focus();
 const close=()=>d.remove(),err=t=>{d.querySelector('#lkmerr').textContent=t};
 d.addEventListener('click',async e=>{if(e.target.id==='lkcancel')return close();if(e.target.id!=='lkok')return;
  const v=id=>(d.querySelector('#'+id)||{}).value||'';
  if(kind!=='on'&&!(await verify(v('lk0')).catch(()=>false)))return err('The current passcode is not right.');
  if(kind==='off'){localStorage.removeItem(LK);localStorage.removeItem(FK);clearTimeout(idle);close();return refresh()}
  const w=weak(v('lk1'));if(w)return err(w);if(v('lk1')!==v('lk2'))return err('The two passcodes do not match.');
  await save(v('lk1'),c?c.m:5);close();arm();refresh()});
 d.addEventListener('keydown',e=>{if(e.key==='Enter')d.querySelector('#lkok').click();if(e.key==='Escape')close()})}
const refresh=()=>{if(typeof render==='function'&&typeof tab!=='undefined'&&tab==='settings')render()};
document.addEventListener('click',e=>{const t=e.target;if(t.id==='lkgo')return tryUnlock();if(t.id==='lkforgot')return forgot();const k=t.dataset&&t.dataset.lk;if(!k)return;
 if(k==='now')lock();else modal(k)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='lkpin')tryUnlock()});
document.addEventListener('change',e=>{if(e.target.id!=='lkauto')return;const c=cfg();if(c){c.m=+e.target.value;localStorage.setItem(LK,JSON.stringify(c));arm();refresh()}});
window.Lock={card(){const c=cfg();return `<div class="card"><h2>App lock</h2>${!subtle?'<p class="mute" style="margin:0">This browser cannot make a secure passcode here. Open Daylog over https in a current browser.</p>':c?`<div class="row"><div><b>On</b><div class="mute">Hides Daylog when you leave it.</div></div><button class="g" data-lk="now">Lock now</button></div><div style="margin:12px 0"><label class="lkl" for="lkauto">Ask for the passcode</label><select id="lkauto">${MINS.map(([m,l])=>`<option value="${m}"${c.m===m?' selected':''}>${l}</option>`).join('')}</select></div><div class="row" style="gap:8px;justify-content:flex-start"><button class="g" data-lk="change">Change passcode</button><button class="g" data-lk="off">Turn off</button></div>`:`<div class="row"><div><b>Off</b><div class="mute">Ask for a passcode when you open Daylog.</div></div><button class="g" data-lk="on">Turn on</button></div>`}</div>`}};
if(cfg()&&subtle){lock()}
})();
