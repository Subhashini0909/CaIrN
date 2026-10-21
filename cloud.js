// Daylog cloud: username login and sync through Supabase (plain REST, no library)
(()=>{
const CFG=window.DAYLOG_CLOUD||{},AK='daylog.auth';
try{const u=new URL((CFG.url||'').trim());CFG.url=u.protocol==='https:'||u.hostname==='localhost'?u.origin:''}catch{CFG.url=''}CFG.key=(CFG.key||'').trim();const ON=!!(CFG.url&&CFG.key);
let A=JSON.parse(localStorage.getItem(AK)||'null'),msg='',q;
const H=t=>{const h={apikey:CFG.key,'Content-Type':'application/json'};if(t||CFG.key.startsWith('eyJ'))h.Authorization='Bearer '+(t||CFG.key);return h};
async function api(path,body){const r=await fetch(CFG.url+'/auth/v1/'+path,{method:'POST',headers:H(),body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.msg||j.error_description||j.message||'Request failed');return j}
const setA=j=>{A={access:j.access_token,refresh:j.refresh_token,exp:Date.now()+(j.expires_in-60)*1e3,uid:j.user.id,name:(j.user.email||'').split('@')[0]};localStorage.setItem(AK,JSON.stringify(A))};
async function token(){if(!A)return null;if(Date.now()>A.exp){try{setA(await api('token?grant_type=refresh_token',{refresh_token:A.refresh}))}catch(e){if(e instanceof TypeError)return null;A=null;localStorage.removeItem(AK);location.reload();return null}}return A.access}
async function row(){const t=await token();if(!t)throw new Error('offline');const r=await fetch(`${CFG.url}/rest/v1/daylog_data?select=data&user_id=eq.${A.uid}`,{headers:H(t)});if(!r.ok)throw new Error('load');return ((await r.json())[0]||{}).data||null}
async function push(){const t=await token();if(!t)throw new Error('offline');const r=await fetch(`${CFG.url}/rest/v1/daylog_data?on_conflict=user_id`,{method:'POST',headers:{...H(t),Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:A.uid,data:S,updated_at:new Date().toISOString()})});if(!r.ok)throw new Error('save')}
const note=m=>{msg=m;if(tab==='settings')render()};
const hhmm=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
function queue(){if(!A)return;clearTimeout(q);q=setTimeout(()=>push().then(()=>note('Synced '+hhmm())).catch(()=>note('Offline. Will retry on your next change.')),2000)}
const local=d=>{localStorage.setItem(KEY,JSON.stringify(d));location.reload()};
const hasLocal=()=>S.tasks.length||S.tx.length||Object.keys(S.days).length;
async function sync(){if(!A)return;try{const c=await row();
 if(S.uid&&S.uid!==A.uid)return local({...(c||{days:{},tasks:[],tx:[]}),uid:A.uid});
 if(c&&(c.mod||0)>(S.mod||0)&&(S.uid||!hasLocal()||confirm('This device already has data.\nOK = replace it with your cloud data.\nCancel = keep this device data and overwrite the cloud.')))return local({...c,uid:A.uid});
 S.uid=A.uid;save();note('Synced '+hhmm())}catch{note('Offline. Working locally.')}}
function gate(){const g=document.createElement('div');g.className='gate';
 g.innerHTML=`<div class="box"><span class="logo"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg></span><h1 style="margin:14px 0 4px">Daylog</h1><p class="mute" style="margin:0 0 16px">Sign in to keep your data synced on all your devices.</p><input id="lu" placeholder="Username" autocomplete="username" autocapitalize="none"><input id="lp" type="password" placeholder="Password" autocomplete="current-password" style="margin-top:10px"><div class="err" id="le" role="alert"></div><button class="send" id="li">Sign in</button><button class="send g" id="lc" style="margin-top:8px">Create account</button><p class="mute" style="margin:14px 0 0;font-size:12px">Username: 3 to 20 letters, numbers or underscores. Password: 8 or more characters, not easy to guess. There is no password reset, so remember it and export backups.</p></div>`;
 document.body.appendChild(g)}
const FK='daylog.authfail',COMMON=['password','passw0rd','12345678','123456789','1234567890','qwertyui','qwerty123','iloveyou','11111111','abcd1234','daylog123','password1','password123','letmein123','welcome123'];
const fails=()=>{try{return JSON.parse(localStorage.getItem(FK)||'{}')}catch{return{}}};
const weak=(p,u)=>p.length<8?'Choose a password with 8 or more characters.':COMMON.includes(p.toLowerCase())||/^(.)\1+$/.test(p)?'That password is too easy to guess. Try a few unrelated words.':p.toLowerCase().includes(u)?'The password should not contain your username.':/^\d+$/.test(p)?'Add some letters to your password, not only numbers.':'';
async function go(up){const u=$('#lu').value.trim().toLowerCase(),p=$('#lp').value,e=$('#le');e.textContent='';
 const F=fails();if(F.until&&Date.now()<F.until)return e.textContent=`Too many attempts. Try again in ${Math.ceil((F.until-Date.now())/1000)} seconds.`;
 if(!/^[a-z0-9_]{3,20}$/.test(u))return e.textContent='Use 3 to 20 letters, numbers or underscores.';
 if(!p)return e.textContent='Enter your password.';
 if(up){const w=weak(p,u);if(w)return e.textContent=w}
 try{const b={email:u+'@daylog.app',password:p},j=up?await api('signup',b):await api('token?grant_type=password',b);
  if(!j.access_token)throw new Error('Account created, but Supabase still wants email confirmation. Turn off "Confirm email" in Supabase.');
  localStorage.removeItem(FK);setA(j);$('.gate').remove();sync()}
 catch(x){if(!(x instanceof TypeError)){const n=(F.n||0)+1;localStorage.setItem(FK,JSON.stringify({n,until:n>=5?Date.now()+Math.min(900,15*2**(n-5))*1e3:0}))}
  e.textContent=x instanceof TypeError?'No internet connection.':/invalid login/i.test(x.message)?'Wrong username or password.':/already/i.test(x.message)?'That username is taken.':x.message}}
async function logout(){clearTimeout(q);try{await push()}catch{if(!confirm('Your latest changes could not be uploaded. Sign out anyway and lose them on this device?'))return}
 [KEY,'daylog.v1',AK].forEach(k=>localStorage.removeItem(k));location.reload()}
document.addEventListener('click',e=>{const id=e.target.id;if(id==='li')go(false);else if(id==='lc')go(true);else if(id==='logout')logout()});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('.gate'))go(false)});
window.Cloud={queue,card:()=>`<div class="card"><h2>Account</h2>${A?`<div class="row"><div><b>${esc(A.name)}</b><div class="mute">${esc(msg||'Signed in')}</div></div><button class="g" id="logout">Sign out</button></div>`:'<p class="mute" style="margin:0">Cloud sync is off. Add your Supabase keys in config.js to turn on login and sync.</p>'}</div>`};
if(ON){if(A){sync();document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()})}else gate()}
})();