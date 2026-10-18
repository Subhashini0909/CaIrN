// Daylog v2: automatic steps (Health Connect / HealthKit on the mobile app, motion sensor in the browser)
const KEY='daylog.v2',$=(s,r=document)=>r.querySelector(s);
const iso=d=>{const x=new Date(d);return new Date(x-x.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const today=()=>iso(Date.now()),uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('daylog.v1')||'null')||{days:{},tasks:[],tx:[]};
S.days=S.days||{};S.tasks=S.tasks||[];S.tx=S.tx||[];S.goals=Object.assign({steps:8000,active:60,budget:1000},S.goals);S.cur=S.cur||'₹';S.events=S.events||[];S.bible=S.bible||null;S.rc=S.rc||{};S.bgoals=S.bgoals||[];S.pm=S.pm||['ICICI RuPay Credit','ICICI Amazon Pay Credit','SBI Debit','ICICI Debit','Pay Later','Pay in 3','UPI','Cash'];
const save=()=>{S.mod=Date.now();localStorage.setItem(KEY,JSON.stringify(S));window.Cloud&&Cloud.queue()};
const peek=d=>S.days[d]||{steps:0,extra:0};
const day=d=>{const x=S.days[d]||(S.days[d]={steps:0,extra:0});if(x.extra===undefined)x.extra=x.active||0;return x};
const act=d=>Math.round(peek(d).steps/100)+(peek(d).extra||0); // ~100 steps/min brisk cadence
const money=n=>S.cur+Number(n).toLocaleString(undefined,{maximumFractionDigits:2});
const secs=t=>t.spent+(t.run?(Date.now()-t.run)/1e3:0);
const fmt=s=>{s=Math.round(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h}h ${m}m`:m?`${m}m ${s%60}s`:`${s}s`};
const last=n=>[...Array(n)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(n-1-i));return iso(d)});
const spend=d=>S.tx.filter(t=>t.date===d&&t.type==='dr').reduce((a,t)=>a+t.amount,0);
const hasData=d=>peek(d).steps||S.tx.some(t=>t.date===d)||S.tasks.some(t=>t.date===d);
const score=d=>{const g=S.goals,all=S.tasks.filter(t=>t.date===d),dn=all.filter(t=>t.done).length,sp=spend(d);
 return Math.round(40*Math.min(1,peek(d).steps/g.steps)+25*Math.min(1,act(d)/g.active)+25*(all.length?dn/all.length:.5)+10*(sp<=g.budget?1:g.budget/sp))};
let tab='today',month=today().slice(0,7);

// ---------- automatic step tracking ----------
const NATIVE=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
let motionOn=false,lastStep=0,run=0,tmr;
function addSteps(n){day(today()).steps+=n;clearTimeout(tmr);tmr=setTimeout(()=>{save();const ae=document.activeElement;if((tab==='today'||tab==='journey')&&!(ae&&/INPUT|SELECT/.test(ae.tagName)))render()},1500)}
let G=9.8,F=0,up=false;
function onMotion(e){const a=e.accelerationIncludingGravity;if(!a)return;const m=Math.hypot(a.x||0,a.y||0,a.z||0),t=Date.now(),thr=S.thr||1.1;
 G=G*.98+m*.02;F=F*.6+(m-G)*.4; // slow gravity baseline, smoothed motion signal
 if(!up&&F>thr&&t-lastStep>300){up=true;run=t-lastStep>1500?1:run+1;lastStep=t;if(run===4)addSteps(4);else if(run>4)addSteps(1)} // 4 steps in a row start a walk
 else if(up&&F<thr*.4)up=false}
async function enableMotion(){try{
 if(window.DeviceMotionEvent&&DeviceMotionEvent.requestPermission&&await DeviceMotionEvent.requestPermission()!=='granted')return alert('Motion permission was denied.');
 if(!motionOn){addEventListener('devicemotion',onMotion);motionOn=true}S.motion=1;try{await navigator.wakeLock.request('screen')}catch{}save();render()}catch{alert('Motion sensor is not available on this device.')}}
async function syncHealth(){if(!NATIVE)return;try{const H=Capacitor.registerPlugin('Health');
 await H.requestAuthorization({read:['steps']});
 const s=new Date();s.setDate(s.getDate()-13);s.setHours(0,0,0,0);
 const r=await H.queryAggregated({dataType:'steps',startDate:s.toISOString(),endDate:new Date().toISOString(),bucket:'day',aggregation:'sum'});
 (r.samples||[]).forEach(x=>{const d=day(iso(x.startDate));d.steps=Math.max(d.steps,Math.round(x.value||0))});
 S.sync=Date.now();S.err='';save()}catch(e){S.err=String(e.message||e)}if(tab==='today'||tab==='journey')render()}
const status=()=>NATIVE?(S.sync?`<span class="chip ok">Synced from Health · ${new Date(S.sync).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>`:`<span class="chip">${esc(S.err||'Syncing with Health…')}</span>`)
 :motionOn?'<span class="chip ok">Counting steps live · keep this page open</span>':'<button class="g s" id="motion" style="margin-top:6px">Enable automatic step counting</button>';

// ---------- visuals ----------
function ring(v,g){const R=88,C=2*Math.PI*R;return `<svg viewBox="0 0 200 200" class="ring" role="img" aria-label="${v} of ${g} steps"><circle cx="100" cy="100" r="${R}" class="trk"/><circle cx="100" cy="100" r="${R}" class="val" stroke-dasharray="${C*Math.min(1,v/g)} ${C}" transform="rotate(-90 100 100)"/><text x="100" y="106" text-anchor="middle" class="rn">${v.toLocaleString()}</text><text x="100" y="128" text-anchor="middle" class="rl">of ${g.toLocaleString()} steps</text></svg>`}
function bars(vals,labels){const w=320,h=110,mx=Math.max(...vals,1),bw=w/vals.length,n=vals.length;
 return `<svg viewBox="0 0 ${w} ${h+18}" width="100%">${vals.map((v,i)=>{const x=i*bw+bw*.18,ww=bw*.64,bh=Math.max(v?6:0,v/mx*h);return `<rect x="${x}" y="0" width="${ww}" height="${h}" rx="9" fill="var(--track)"/><rect x="${x}" y="${h-bh}" width="${ww}" height="${bh}" rx="9" fill="var(--acc)" opacity="${i===n-1?1:.4}"/><text x="${i*bw+bw/2}" y="${h+14}" text-anchor="middle">${labels[i]}</text>`}).join('')}</svg>`}
const PAL=['#5B52D9','#F08A4B','#43B05C','#E8B40C','#B9B5F0'];
function donut(en,tot){const R=60,C=2*Math.PI*R;let o=0;return `<svg viewBox="0 0 160 160" width="170"><g transform="rotate(-90 80 80)"><circle cx="80" cy="80" r="${R}" fill="none" stroke="var(--track)" stroke-width="18"/>${en.map(([k,v],i)=>{const l=v/tot*C,c=`<circle cx="80" cy="80" r="${R}" fill="none" stroke="${PAL[i%5]}" stroke-width="18" stroke-dasharray="${Math.max(l-2,1)} ${C}" stroke-dashoffset="${-o}"/>`;o+=l;return c}).join('')}</g><text x="80" y="76" text-anchor="middle">Spent this month</text><text x="80" y="96" text-anchor="middle" style="font-size:15px;font-weight:600;fill:var(--ink)">${money(tot)}</text></svg>`}
const pill=(c,p,inv)=>{if(!p)return'';const r=Math.round((c-p)/p*100),up=r>=0;return `<span class="pill ${up!==!!inv?'up':'dn'}">${up?'+':''}${r}%</span>`};
const stat=(cls,ic,l,v,pl,ft)=>`<div class="card stat"><div class="row"><div class="chipic ${cls}"><svg viewBox="0 0 24 24">${P[ic]}</svg></div><span class="lbl2">${l}</span></div><div class="val2">${v} ${pl}</div><div class="foot2">${ft}</div></div>`;
function heat(){return `<svg viewBox="0 0 288 168" width="100%">${last(84).map((d,i)=>`<rect x="${Math.floor(i/7)*24}" y="${i%7*24}" width="20" height="20" rx="5" fill="var(--acc)" opacity="${hasData(d)?.18+score(d)/100*.82:.06}"><title>${d}: ${hasData(d)?score(d):'no data'}</title></rect>`).join('')}</svg>`}
function streak(){let n=0,d=new Date();if(peek(today()).steps<S.goals.steps)d.setDate(d.getDate()-1);while(peek(iso(d)).steps>=S.goals.steps){n++;d.setDate(d.getDate()-1)}return n}
function insights(){const w=last(7),p=last(14).slice(0,7),sum=a=>a.reduce((s,d)=>s+peek(d).steps,0),a=sum(w)/7,b=sum(p)/7,o=[];
 if(a)o.push(`You average ${Math.round(a).toLocaleString()} steps a day this week${b?`, ${a>=b?'up':'down'} ${Math.abs(Math.round((a-b)/b*100))}% on last week`:''}.`);
 const best=Object.keys(S.days).sort((x,y)=>peek(y).steps-peek(x).steps)[0];if(best&&peek(best).steps)o.push(`Your best day was ${best}, with ${peek(best).steps.toLocaleString()} steps.`);
 const f=S.tasks.filter(t=>w.includes(t.date)).reduce((s,t)=>s+t.spent,0);if(f)o.push(`You focused for ${fmt(f)} this week.`);
 const sp=w.reduce((s,d)=>s+spend(d),0);if(sp)o.push(`You spent ${money(sp)} this week, ${money(sp/7)} a day.`);
 return o.length?o.map(x=>`<p class="ins">${x}</p>`).join(''):'<div class="empty">Insights appear after a few days of data.</div>'}

// ---------- views ----------
const P={step:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',act:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',wal:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',chk:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',fire:'<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>'};
const tile=(i,l,v,sub,pc)=>`<div class="tile"><div class="ico"><svg viewBox="0 0 24 24">${P[i]}</svg></div><div class="lbl">${l}</div><div class="val">${v}</div><div class="sub">${sub}</div>${pc==null?'':`<div class="bar"><i style="width:${Math.min(100,pc)}%;${pc>100&&i==='wal'?'background:var(--rose)':''}"></i></div>`}</div>`;

// ---------- subscriptions, budget plan, monthly review ----------
S.subs=S.subs||[];S.budgets=S.budgets||{};
const CYC={monthly:'Monthly',yearly:'Yearly',28:'Every 28 days',56:'Every 56 days',84:'Every 84 days',365:'Every 365 days'};
const PRE={jio:['Jio recharge','28','Recharge'],airtel:['Airtel recharge','28','Recharge'],netflix:['Netflix','monthly','Subscriptions'],prime:['Amazon Prime','yearly','Subscriptions'],fibre:['JioFiber','monthly','Bills'],other:['','monthly','Subscriptions']};
const PRN={jio:'Jio recharge',airtel:'Airtel recharge',netflix:'Netflix',prime:'Amazon Prime',fibre:'JioFiber',other:'Other'};
const daysLeft=d=>Math.round((new Date(d+'T00:00')-new Date(today()+'T00:00'))/864e5);
const dueTxt=s=>{const n=daysLeft(s.next);return n<0?`overdue by ${-n} day${-n>1?'s':''}`:n===0?'due today':`due in ${n} day${n>1?'s':''}`};
const nextDue=(d,cy)=>{const x=new Date(d+'T12:00');if(cy==='monthly')x.setMonth(x.getMonth()+1);else if(cy==='yearly')x.setFullYear(x.getFullYear()+1);else x.setDate(x.getDate()+Number(cy));return iso(x)};
const perMonth=s=>s.cycle==='monthly'?s.amount:s.cycle==='yearly'?s.amount/12:s.amount*30/Number(s.cycle);
const dm=m=>{const[y,mo]=m.split('-').map(Number),o=[];for(let i=1;i<=new Date(y,mo,0).getDate();i++){const d=`${m}-${String(i).padStart(2,'0')}`;if(d<=today())o.push(d)}return o};
const act_=ds=>ds.reduce((a,d)=>a+act(d),0);
const dueCard=()=>{const L=S.subs.filter(s=>daysLeft(s.next)<=s.remind).sort((a,b)=>a.next.localeCompare(b.next));
 return L.length?`<div class="card span3"><h2>Upcoming renewals</h2>${L.map(s=>`<div class="item"><div class="t"><b>${esc(s.name)}</b><div class="mute">${money(s.amount)} · ${dueTxt(s)}</div></div><button class="s" data-pay="${s.id}">Mark paid</button></div>`).join('')}</div>`:''};
const revBanner=()=>{const n=new Date(),dom=n.getDate(),dim=new Date(n.getFullYear(),n.getMonth()+1,0).getDate();if(dom<dim-2&&dom>3)return'';
 const m=dom>3?today().slice(0,7):iso(new Date(n.getFullYear(),n.getMonth()-1,15)).slice(0,7);
 return `<div class="card span3 row"><div><h2 style="margin:0">Your ${m} review is ready</h2><div class="mute">Useful vs unwanted spends, activity and task progress.</div></div><button data-rev="${m}">Open review</button></div>`};
function checkDue(){if(!('Notification' in window)||Notification.permission!=='granted')return;S.subs.forEach(s=>{if(daysLeft(s.next)<=s.remind&&s.notified!==today()){s.notified=today();try{new Notification('Daylog: '+s.name,{body:`${money(s.amount)} ${dueTxt(s)}`})}catch{}}});save()}
const meter=(v,l)=>`<div class="bar"><i style="width:${l?Math.min(100,v/l*100):0}%;${l&&v>l?'background:var(--rose)':''}"></i></div>`;
const monthPick=()=>`<input type="month" id="mo" value="${month}" style="width:auto" aria-label="Month">`;
// ---------- Bible reading plan and calendar ----------
const BIB=[['Genesis',50],['Exodus',40],['Leviticus',27],['Numbers',36],['Deuteronomy',34],['Joshua',24],['Judges',21],['Ruth',4],['1 Samuel',31],['2 Samuel',24],['1 Kings',22],['2 Kings',25],['1 Chronicles',29],['2 Chronicles',36],['Ezra',10],['Nehemiah',13],['Esther',10],['Job',42],['Psalms',150],['Proverbs',31],['Ecclesiastes',12],['Song of Solomon',8],['Isaiah',66],['Jeremiah',52],['Lamentations',5],['Ezekiel',48],['Daniel',12],['Hosea',14],['Joel',3],['Amos',9],['Obadiah',1],['Jonah',4],['Micah',7],['Nahum',3],['Habakkuk',3],['Zephaniah',3],['Haggai',2],['Zechariah',14],['Malachi',4],['Matthew',28],['Mark',16],['Luke',24],['John',21],['Acts',28],['Romans',16],['1 Corinthians',16],['2 Corinthians',13],['Galatians',6],['Ephesians',6],['Philippians',4],['Colossians',4],['1 Thessalonians',5],['2 Thessalonians',3],['1 Timothy',6],['2 Timothy',4],['Titus',3],['Philemon',1],['Hebrews',13],['James',5],['1 Peter',5],['2 Peter',3],['1 John',5],['2 John',1],['3 John',1],['Jude',1],['Revelation',22]];
const TOT=1189; // chapters in one reading
const OFF=BIB.map((_,i)=>BIB.slice(0,i).reduce((a,x)=>a+x[1],0));
const gi=(b,c)=>OFF[b]+c-1; // book index + chapter (1-based) -> global chapter index
const fromGi=g=>{g=((g%TOT)+TOT)%TOT;let b=BIB.length-1;while(OFF[b]>g)b--;return[b,g-OFF[b]]}; // -> [book index, chapter index 0-based]
const rcv=(b,c)=>(S.rc[b]||[])[c]||0;
const rcs=(b,c,d)=>{const a=S.rc[b]||(S.rc[b]=Array(BIB[b][1]).fill(0));a[c]=Math.max(0,(a[c]||0)+d)};
const bump=(g,n,d)=>{for(let i=0;i<n;i++){const[b,c]=fromGi(g+i);rcs(b,c,d)}};
const bprog=b=>(S.rc[b]||[]).filter(v=>v>0).length;
function bstats(){let bd=0,ot=0,nt=0,ch=0,full=Infinity;BIB.forEach(([n,c],b)=>{const a=S.rc[b]||[];let ok=true,mn=Infinity;for(let i=0;i<c;i++){const v=a[i]||0;if(v>0)ch++;else ok=false;mn=Math.min(mn,v)}if(ok){bd++;b<39?ot++:nt++}full=Math.min(full,mn)});return{bd,ot,nt,ch,full:isFinite(full)?full:0}}
let R={f:0,t:9,step:0},bsel=0;
const bp=p=>{p=((p%TOT)+TOT)%TOT;for(const[n,c]of BIB){if(p<c)return[n,p+1];p-=c}};
const bpos=p=>bp(p).join(' ');
const brange=(p,n)=>{if(n<=0)return'—';const a=bp(p),b=bp(p+n-1);return n===1?bpos(p):a[0]===b[0]?`${a[0]} ${a[1]} to ${b[1]}`:`${bpos(p)} to ${bpos(p+n-1)}`};
const dayDiff=(a,b)=>Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5);
function bstat(){const B=S.bible;if(!B)return null;const t=today(),total=B.rounds*TOT,rt=B.log[t]||0,p0=B.pos-rt,left=total-p0,dl=Math.max(1,dayDiff(t,B.end)+1),span=Math.max(1,dayDiff(B.start,B.end)+1),el=Math.min(span,Math.max(0,dayDiff(B.start,t)+1));
 const started=t>=B.start,done=B.pos>=total;
 return{B,total,rt,p0,left,done,started,target:done||!started?0:Math.ceil(left/dl),diff:started?B.pos-total*el/span:0,round:Math.min(B.rounds,Math.floor(B.pos/TOT)+1),inRound:done?TOT:B.pos%TOT,pct:B.pos/total*100}}
const bread=n=>{const B=S.bible,t=today();n=Math.max(0,Math.min(Math.round(n)||0,B.rounds*TOT-B.pos));bump(B.pos,n,1);B.pos+=n;B.log[t]=(B.log[t]||0)+n};
if(!S.rcInit){if(S.bible)bump(0,S.bible.pos,1);S.rcInit=1}
const bstreak=()=>{const L=S.bible.log;let n=0,d=new Date();if(!L[today()])d.setDate(d.getDate()-1);while(L[iso(d)]>0){n++;d.setDate(d.getDate()-1)}return n};
let calM=today().slice(0,7),selD=today();
const evSort=(a,b)=>(a.time||'').localeCompare(b.time||'');
const evRow=e=>`<div class="item ${e.done?'done':''}"><input type="checkbox" data-doneev="${e.id}" ${e.done?'checked':''} style="width:20px;height:20px;accent-color:var(--acc)" aria-label="Done"><div class="t"><b>${esc(e.title)}</b><div class="mute">${e.time||'All day'}</div></div><button class="s g" data-delev="${e.id}" aria-label="Delete">✕</button></div>`;
const bibleCard=()=>{const b=bstat();if(!b||b.done||!b.started)return'';return `<div class="card span3 row"><div><h2 style="margin:0">Today's Bible reading</h2><div class="mute">${brange(b.p0,b.target)} · ${b.target} chapters</div></div>${b.rt>=b.target?'<span class="pill up">Done</span>':'<button data-bdone="1">Mark done</button>'}</div>`};
const schedCard=()=>{const L=S.events.filter(e=>e.date===today()).sort(evSort);return L.length?`<div class="card span3"><h2>Today's schedule</h2>${L.map(evRow).join('')}</div>`:''};
const grp=(tx,f)=>{const o={};tx.forEach(x=>{const k=f(x);if(k)o[k]=(o[k]||0)+x.amount});return Object.entries(o).sort((a,b)=>b[1]-a[1])};
const walletSummary=tx=>{const d=tx.filter(x=>x.type==='dr'),m=grp(d,x=>x.pm),a=grp(d.filter(x=>x.ch==='online'),x=>x.app),L=r=>r.map(([k,v])=>`<div class="row" style="padding:5px 0"><span>${esc(k)}</span><b>${money(v)}</b></div>`).join('');
 return m.length||a.length?`<div class="grid" style="margin-bottom:14px"><div class="card"><h2>By card or method</h2>${L(m)||'<div class="mute">No data</div>'}</div><div class="card"><h2>Online, by app</h2>${L(a)||'<div class="mute">No online spends</div>'}</div></div>`:''};
const views={
today(){const t=today(),y=last(2)[0],d=peek(t),g=S.goals,tt=S.tasks.filter(x=>x.date===t),dn=tt.filter(x=>x.done).length,sp=spend(t),runT=S.tasks.find(x=>x.run),w=last(7),
 mo=S.tx.filter(x=>x.date.startsWith(t.slice(0,7))&&x.type==='dr'),c={};mo.forEach(x=>c[x.cat||'Other']=(c[x.cat||'Other']||0)+x.amount);
 const en=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5),tot=mo.reduce((a,x)=>a+x.amount,0),rec=[...S.tx].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 return `<div class="dash"><div class="stats">
 ${stat('c1','step','Steps',d.steps.toLocaleString(),pill(d.steps,peek(y).steps),`${Math.round(Math.min(100,d.steps/g.steps*100))}% of ${g.steps.toLocaleString()} goal<div style="margin-top:8px">${status()}</div>`)}
 ${stat('c2','act','Active time',`${Math.floor(act(t)/60)}h ${act(t)%60}m`,pill(act(t),act(y)),`Goal ${g.active} min a day`)}
 ${stat('c4','wal','Spent today',money(sp),pill(sp,spend(y),1),`Budget ${money(g.budget)} a day`)}
 ${stat('c3','chk','Tasks',`${dn} of ${tt.length}`,'',`${streak()}-day step streak`)}</div>
 <div class="card quick"><h2>Quick add</h2><div class="form"><select id="ty"><option value="dr">Expense</option><option value="cr">Credit</option></select><input id="am" type="number" min="0" step="0.01" placeholder="Amount"><input id="ca" placeholder="Category"><input id="no" placeholder="Note"><select id="tg" aria-label="Worth it"><option value="useful">Useful spend</option><option value="unwanted">Unwanted spend</option></select><select id="pm" aria-label="Paid with">${S.pm.map(p=>`<option>${esc(p)}</option>`).join("")}</select><select id="ch" aria-label="Where"><option value="offline">Offline</option><option value="online">Online</option></select><input id="ap" placeholder="App or site used (e.g. Amazon)" hidden></div><button class="send" id="addtx">Add entry</button>
 <details style="margin-top:14px"><summary>Adjust steps or minutes</summary><div class="form"><input id="st" type="number" min="0" placeholder="Steps"><button class="g" id="addst">Add steps</button><button class="g" id="setst">Set total</button><input id="ac" type="number" min="0" placeholder="Minutes"><button class="g" id="addac">Add minutes</button></div></details></div>
 ${schedCard()}${bibleCard()}${dueCard()}${revBanner()}${runT?`<div class="card live span3"><div class="lbl">In focus · ${esc(runT.title)}</div><div class="num" id="fz">${fmt(secs(runT))}</div></div>`:''}
 <div class="card span2"><h2>Steps overview</h2>${bars(w.map(x=>peek(x).steps),w.map(x=>new Date(x+'T12:00').toLocaleDateString(undefined,{weekday:'short'})))}</div>
 <div class="card"><h2>Spending overview</h2>${tot?`<div style="text-align:center">${donut(en,tot)}</div><div class="legend">${en.map(([k,v],i)=>`<span><i style="background:${PAL[i%5]}"></i>${esc(k)}</span>`).join('')}</div>`:'<div class="empty">No expenses this month.</div>'}</div>
 <div class="card span3"><h2>Recent transactions</h2><div class="tbl"><div class="r h"><span>Transaction</span><span>Date</span><span>Category</span><span>Amount</span><span>Type</span></div>
 ${rec.length?rec.map((x,i)=>`<div class="r"><div class="n"><div class="chipic c${i%4+1}" style="font-weight:600">${esc((x.note||x.cat||'?')[0].toUpperCase())}</div><span>${esc(x.note||x.cat||'Entry')}</span></div><span class="mute">${x.date}</span><span>${esc(x.cat||'Other')}</span><b>${money(x.amount)}</b><span><span class="pill ${x.type}">${x.type==='cr'?'Credit':'Expense'}</span></span></div>`).join(''):'<div class="empty">Add your first entry with Quick add.</div>'}</div></div></div>`},
focus(){const tt=S.tasks.filter(t=>t.date===today()||!t.done);
 return `<div class="form"><input id="tt" placeholder="What will you focus on?" aria-label="Task"><button id="addt">Add task</button></div>
 <div class="card">${tt.length?tt.map(t=>`<div class="item ${t.done?'done':''}"><input type="checkbox" data-done="${t.id}" ${t.done?'checked':''} style="width:20px;height:20px;accent-color:var(--acc)" aria-label="Done"><div class="t"><b>${esc(t.title)}</b><div class="mute ${t.run?'run':''}" data-tm="${t.id}">${fmt(secs(t))}${t.run?' · focusing':''}</div></div>${t.done?'':`<button class="s ${t.run?'':'g'}" data-tog="${t.id}">${t.run?'Pause':'Start'}</button>`}<button class="s g" data-del="${t.id}" aria-label="Delete">✕</button></div>`).join(''):'<div class="empty">No tasks yet. Add one and start its timer.</div>'}</div>`},
wallet(){const tx=S.tx.filter(t=>t.date.startsWith(month)).sort((a,b)=>b.date.localeCompare(a.date)),cr=tx.filter(t=>t.type==='cr').reduce((a,t)=>a+t.amount,0),dr=tx.filter(t=>t.type==='dr').reduce((a,t)=>a+t.amount,0),c={};
 tx.filter(t=>t.type==='dr').forEach(t=>c[t.cat||'Other']=(c[t.cat||'Other']||0)+t.amount);
 return `<div class="form"><select id="ty"><option value="dr">Expense</option><option value="cr">Credit</option></select><input id="am" type="number" min="0" step="0.01" placeholder="Amount"><input id="ca" placeholder="Category" list="cl"><datalist id="cl"><option>Food<option>Transport<option>Bills<option>Shopping<option>Salary</datalist><input id="no" placeholder="Note"><select id="tg" aria-label="Worth it"><option value="useful">Useful spend</option><option value="unwanted">Unwanted spend</option></select><select id="pm" aria-label="Paid with">${S.pm.map(p=>`<option>${esc(p)}</option>`).join("")}</select><select id="ch" aria-label="Where"><option value="offline">Offline</option><option value="online">Online</option></select><input id="ap" placeholder="App or site used (e.g. Amazon)" hidden><button id="addtx">Save</button></div>
 <div class="card"><div class="row"><h2>Month</h2><input type="month" id="mo" value="${month}" style="width:auto"></div><div class="grid" style="gap:10px"><div><div class="sub">Credits</div><div class="num cr">${money(cr)}</div></div><div><div class="sub">Expenses</div><div class="num dr">${money(dr)}</div></div></div>
 <p class="mute" style="margin:12px 0 0">Balance ${money(cr-dr)}${Object.keys(c).length?' · '+Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>esc(k)+' '+money(v)).join(', '):''}</p></div>
 ${walletSummary(tx)}<div class="card">${tx.length?tx.map(t=>`<div class="item"><div class="t"><b>${esc(t.cat||'Other')}</b><div class="mute">${t.date}${t.note?' · '+esc(t.note):''}${t.tag==='unwanted'?' · Unwanted':''}${t.pm?' · '+esc(t.pm):''}${t.app?' · via '+esc(t.app):''}</div></div><b class="${t.type}">${t.type==='cr'?'+':'−'}${money(t.amount)}</b><button class="s g" data-deltx="${t.id}" aria-label="Delete">✕</button></div>`).join(''):'<div class="empty">Nothing logged this month.</div>'}</div>`},
journey(){const w=last(14),ds=Object.keys(S.days).filter(hasData).sort().reverse().slice(0,30);
 return `<div class="card"><h2>Insights</h2>${insights()}</div>
 <div class="card"><h2>Day score, last 12 weeks</h2>${heat()}<div class="sub">Brighter means a better day: steps, active time, tasks and budget.</div></div>
 <div class="card"><h2>Steps, last 14 days</h2>${bars(w.map(d=>peek(d).steps),w.map(d=>d.slice(8)))}</div>
 <div class="card"><h2>Daily log</h2>${ds.length?ds.map(d=>{const tt=S.tasks.filter(t=>t.date===d&&t.done),net=S.tx.filter(t=>t.date===d).reduce((a,t)=>a+(t.type==='cr'?t.amount:-t.amount),0);
 return `<div class="item"><div class="t"><b>${d}</b> <span class="run">${score(d)}</span><div class="mute">${peek(d).steps.toLocaleString()} steps · ${act(d)} min active · ${tt.length} tasks (${fmt(tt.reduce((a,t)=>a+secs(t),0))})</div></div><b class="${net<0?'dr':'cr'}">${money(net)}</b></div>`}).join(''):'<div class="empty">Your history builds up here.</div>'}</div>`},
subs(){const tot=S.subs.filter(s=>!s.noTx).reduce((a,s)=>a+perMonth(s),0),L=[...S.subs].sort((a,b)=>a.next.localeCompare(b.next));
 return `<div class="card"><h2>Add a recharge or subscription</h2><div class="form"><select id="sp" aria-label="Type">${Object.entries(PRN).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><input id="sn" value="Jio recharge" placeholder="Name"><input id="sa" type="number" min="0" placeholder="Amount"><select id="scy" aria-label="Repeats">${Object.entries(CYC).map(([k,v])=>`<option value="${k}" ${k==='28'?'selected':''}>${v}</option>`).join('')}</select><input id="sd" type="date" value="${today()}" aria-label="Next due date"><select id="sr" aria-label="Remind"><option value="1">Remind 1 day before</option><option value="3" selected>Remind 3 days before</option><option value="7">Remind 7 days before</option></select><select id="stg" aria-label="Worth it"><option value="useful">Useful</option><option value="unwanted">Unwanted</option></select><button id="addsub">Add</button></div>
 <p class="mute" style="margin:0"></p>${'Notification' in window&&Notification.permission==='default'?'<button class="g s" id="notif" style="margin-top:10px">Allow notifications</button>':''}</div>
 <div class="card"><div class="row"><h2 style="margin:0">Your plans</h2><span class="mute">about ${money(tot)} a month</span></div>${L.length?L.map((s,i)=>`<div class="item"><div class="chipic c${i%4+1}" style="font-weight:600">${esc(s.name[0]||'?').toUpperCase()}</div><div class="t"><b>${esc(s.name)}</b><div class="mute">${money(s.amount)} · ${s.left?s.left+' left · ':''}${CYC[s.cycle]} · next ${s.next}${s.tag==='unwanted'?' · Unwanted':''}</div></div><span class="pill ${daysLeft(s.next)<=s.remind?'dn':'up'}">${dueTxt(s)}</span><button class="s" data-pay="${s.id}">Paid</button><button class="s g" data-delsub="${s.id}" aria-label="Delete">✕</button></div>`).join(''):'<div class="empty">No plans yet. </div>'}</div>`},
budget(){const m=month,B=S.budgets[m]||{total:0,cats:{}},tx=S.tx.filter(x=>x.date.startsWith(m)&&x.type==='dr'),by={};tx.forEach(x=>{const k=x.cat||'Other';by[k]=(by[k]||0)+x.amount});
 const sp=tx.reduce((a,x)=>a+x.amount,0),sub=S.subs.filter(s=>!s.noTx).reduce((a,s)=>a+perMonth(s),0),names=[...new Set([...Object.keys(B.cats),...Object.keys(by)])];
 return `<div class="card"><div class="row"><h2 style="margin:0">Monthly plan</h2>${monthPick()}</div><div class="form" style="margin-top:14px"><input id="bt" type="number" min="0" value="${B.total||''}" placeholder="Total budget for the month"><button id="savebt">Save plan</button></div>
 <div class="row"><b>${money(sp)} spent</b><span class="mute">${B.total?`${money(Math.abs(B.total-sp))} ${sp>B.total?'over':'left'} of ${money(B.total)}`:'Set a total to track it'}</span></div>${meter(sp,B.total)}
 <p class="mute" style="margin:12px 0 0">${B.total?` (${Math.round(sub/B.total*100)}% of your plan)`:''}.</p></div>
 <div class="card"><h2>Category limits</h2><div class="form"><input id="bc" placeholder="Category, e.g. Food"><input id="ba" type="number" min="0" placeholder="Limit"><button id="addcat">Set limit</button></div>
 ${names.length?names.map(k=>`<div class="item" style="display:block"><div class="row"><b>${esc(k)}</b><span class="mute">${money(by[k]||0)}${B.cats[k]?' of '+money(B.cats[k]):''}</span>${B.cats[k]!==undefined?`<button class="s g" data-delcat="${esc(k)}" aria-label="Remove">✕</button>`:''}</div>${B.cats[k]?meter(by[k]||0,B.cats[k]):''}</div>`).join(''):'<div class="empty">Set a limit to start planning.</div>'}</div>`},
review(){const m=month,ds=dm(m),g=S.goals,tx=S.tx.filter(x=>x.date.startsWith(m)),dr=tx.filter(x=>x.type==='dr'),cr=tx.filter(x=>x.type==='cr').reduce((a,x)=>a+x.amount,0),
 sp=dr.reduce((a,x)=>a+x.amount,0),bad=dr.filter(x=>x.tag==='unwanted').sort((a,b)=>b.amount-a.amount),badT=bad.reduce((a,x)=>a+x.amount,0),B=S.budgets[m]||{},
 data=ds.filter(hasData),avg=data.length?data.reduce((a,d)=>a+peek(d).steps,0)/data.length:0,hit=ds.filter(d=>peek(d).steps>=g.steps).length,lazy=data.filter(d=>peek(d).steps<g.steps*.3).length,ratio=data.length?hit/data.length:0,
 tk=S.tasks.filter(t=>t.date.startsWith(m)),dn=tk.filter(t=>t.done),ft=tk.reduce((a,t)=>a+secs(t),0),
 vS=!sp?'No spending':badT/sp<.1?'Disciplined':badT/sp<.25?'Fair':'Needs attention',vA=!data.length?'No data':ratio>=.6?'Active':ratio>=.3?'Balanced':'Lazy',
 vT=!tk.length?'No tasks':dn.length/tk.length>=.8?'Productive':dn.length/tk.length>=.5?'Steady':'Behind',F=[],uw=S.subs.filter(s=>s.tag==='unwanted'&&!s.noTx);
 if(sp)F.push(`You spent ${money(sp)}: ${money(sp-badT)} (${Math.round((sp-badT)/sp*100)}%) was useful and ${money(badT)} was unwanted.`);
 if(bad.length)F.push(`Your biggest unwanted spend was ${esc(bad[0].cat||'Other')} at ${money(bad[0].amount)} on ${bad[0].date}. Cutting that alone saves it every month.`);
 if(uw.length)F.push(`You pay about ${money(uw.reduce((a,s)=>a+perMonth(s),0))} a month for plans marked unwanted (${uw.map(s=>esc(s.name)).join(', ')}). Consider cancelling.`);
 if(B.total)F.push(sp>B.total?`You went ${money(sp-B.total)} over your ${money(B.total)} plan.`:`You stayed ${money(B.total-sp)} under your ${money(B.total)} plan.`);
 if(cr)F.push(cr>=sp?`You saved ${money(cr-sp)} against your credits.`:`You spent ${money(sp-cr)} more than you received.`);
 if(data.length)F.push(`You averaged ${Math.round(avg).toLocaleString()} steps a day and met your goal on ${hit} of ${data.length} tracked days. ${lazy} days were very low (under 30% of goal).`);
 if(tk.length)F.push(`You finished ${dn.length} of ${tk.length} tasks and focused for ${fmt(ft)}${dn.length?`, about ${fmt(dn.reduce((a,t)=>a+secs(t),0)/dn.length)} per completed task`:''}.`);
 const st=t=>t.done?['Done','up']:secs(t)>0?['In progress','']:['Not started','dn'];
 return `<div class="card row"><h2 style="margin:0">Monthly review</h2>${monthPick()}</div>
 <div class="three"><div class="card"><div class="lbl">Spending</div><div class="num">${vS}</div><div class="sub">${money(badT)} unwanted of ${money(sp)}</div></div><div class="card"><div class="lbl">Activity</div><div class="num">${vA}</div><div class="sub">${Math.round(avg).toLocaleString()} steps a day, ${act_(ds)} active min</div></div><div class="card"><div class="lbl">Productivity</div><div class="num">${vT}</div><div class="sub">${dn.length}/${tk.length} tasks, ${fmt(ft)} focused</div></div></div>
 <div class="card"><h2>Feedback</h2>${F.length?F.map(x=>`<p class="ins">${x}</p>`).join(''):'<div class="empty">Log some days and this fills in.</div>'}</div>
 ${bad.length?`<div class="card"><h2>Unwanted spends</h2>${bad.slice(0,6).map(x=>`<div class="item"><div class="t"><b>${esc(x.cat||'Other')}</b><div class="mute">${x.date}${x.note?' · '+esc(x.note):''}</div></div><b class="dr">${money(x.amount)}</b></div>`).join('')}</div>`:''}
 <div class="card"><h2>Task progress and time taken</h2>${tk.length?[...tk].sort((a,b)=>secs(b)-secs(a)).slice(0,20).map(t=>`<div class="item"><div class="t"><b>${esc(t.title)}</b></div><span class="pill ${st(t)[1]}">${st(t)[0]}</span><span class="mute" style="min-width:64px;text-align:right">${fmt(secs(t))}</span></div>`).join(''):'<div class="empty">No tasks this month.</div>'}</div>`},
bible(){const b=bstat(),st=bstats(),[fb,fc]=fromGi(R.f),[tb,tc]=fromGi(R.t),n=R.t-R.f+1,pct=st.ch/TOT*100,
 G=S.bgoals.map(g=>{const t=g.t-g.f+1;let d=0;for(let i=g.f;i<=g.t;i++){const[x,y]=fromGi(i);if(rcv(x,y)>g.base)d++}const left=t-d,dl=Math.max(1,dayDiff(today(),g.end)+1),span=Math.max(1,dayDiff(g.start,g.end)+1),el=Math.min(span,Math.max(0,dayDiff(g.start,today())+1));return{g,t,d,left,pd:Math.ceil(left/dl),diff:d-t*el/span}}),
 opt=(sel)=>BIB.map((x,i)=>`<option value="${i}" ${i===sel?'selected':''}>${x[0]}</option>`).join(''),chs=(bk,sel)=>[...Array(BIB[bk][1])].map((_,i)=>`<option value="${i+1}" ${i===sel?'selected':''}>${i+1}</option>`).join(''),
 shelf=(a,z,l)=>`<h2 style="margin:14px 0 8px">${l} · ${BIB.slice(a,z).filter((_,i)=>bprog(a+i)===BIB[a+i][1]).length} of ${z-a} books complete</h2><div class="bks">${BIB.slice(a,z).map(([nm,c],j)=>{const i=a+j,p=bprog(i);return `<button class="bk${p===c?' ok':''}${i===bsel?' on':''}" style="--p:${p/c*100}%" data-bk="${i}"><span>${nm}</span><small>${p}/${c}</small></button>`}).join('')}</div>`;
 return `<div class="card hero2"><div class="bring"><svg viewBox="0 0 120 120" role="img" aria-label="${Math.round(pct)}% of the Bible read"><circle cx="60" cy="60" r="46" class="btrk"/><circle cx="60" cy="60" r="46" class="bval rv" stroke-dasharray="${289*pct/100} 289" transform="rotate(-90 60 60)"/><text x="60" y="62" text-anchor="middle" style="font-size:22px;font-weight:600;fill:var(--ink)">${Math.round(pct)}%</text><text x="60" y="78" text-anchor="middle">of the Bible</text></svg></div>
 <div class="bstats"><div><div class="lbl">Books completed</div><div class="num">${st.bd} <span class="mute">of 66</span></div></div><div><div class="lbl">Books pending</div><div class="num">${66-st.bd}</div></div><div><div class="lbl">Chapters read</div><div class="num">${st.ch}<span class="mute"> / 1,189</span></div></div><div><div class="lbl">Old Testament</div><div class="num">${st.ot}<span class="mute"> / 39</span></div></div><div><div class="lbl">New Testament</div><div class="num">${st.nt}<span class="mute"> / 27</span></div></div><div><div class="lbl">Full readings</div><div class="num">${st.full}</div></div></div></div>
 ${b?`<div class="card"><div class="row"><h2 style="margin:0">Daily plan: ${b.B.rounds} readings in a year</h2><span class="pill ${b.diff>=0?'up':'dn'}">${!b.started?'Starts '+b.B.start:b.done?'Plan complete':b.diff>=0?'Ahead by '+Math.round(b.diff):'Behind by '+Math.round(-b.diff)}</span></div>
 <div class="big2">${b.done?'All readings complete':!b.started?'Not started yet':brange(b.p0,b.target)}</div><div class="mute">${b.target} chapters today · ${b.rt} read · ${bstreak()}-day streak</div>${meter(b.rt,b.target||1)}
 <div class="form" style="margin:14px 0 0">${b.rt<b.target?'<button id="bdone">Mark today done</button>':''}<input id="bn" type="number" min="1" placeholder="Chapters read"><button class="g" id="badd">Add chapters</button><button class="g" id="bundo">Undo today</button></div>
 <div class="row" style="margin-top:6px"><span class="mute">${b.B.start} to ${b.B.end}</span><button class="g s" id="breset">Restart plan</button></div></div>`
 :`<div class="card"><h2>Daily plan</h2><p class="mute" style="margin-top:0"></p><div class="form"><label class="mute" style="flex:1 1 100%">Start date<input id="bs" type="date" value="${today()}"></label><label class="mute" style="flex:1 1 100%">End date<input id="be" type="date" value="${iso(Date.now()+364*864e5)}"></label><label class="mute" style="flex:1 1 100%">Times to read the Bible<input id="br" type="number" min="1" max="10" value="3"></label><button id="bstart" style="flex:1 1 100%">Start plan</button></div></div>`}
 ${G.map(({g,t,d,left,pd,diff})=>`<div class="card"><div class="row"><b>${esc(g.name)}</b><button class="s g" data-gdel="${g.id}" aria-label="Delete goal">✕</button></div><div class="mute">${brange(g.f,t)} · finish by ${g.end}</div>${meter(d,t)}<div class="row" style="margin-top:8px"><span class="mute">${d} of ${t} chapters${left&&diff<-.5?' · behind':''}</span><span class="pill ${left?(diff<-.5?'dn':'up'):'up'}">${left?pd+' a day':'Complete'}</span></div>${left?`<button class="s" data-gread="${g.id}" style="margin-top:10px">Mark today's ${pd}</button>`:''}</div>`).join('')}
 <div class="card"><h2>Choose chapters</h2><div class="mute" style="margin-bottom:6px">From</div><div class="form"><select id="fb" aria-label="From book">${opt(fb)}</select><select id="fc" aria-label="From chapter" style="flex:0 1 90px">${chs(fb,fc)}</select></div>
 <div class="mute" style="margin-bottom:6px">To</div><div class="form"><select id="tb" aria-label="To book">${opt(tb)}</select><select id="tc" aria-label="To chapter" style="flex:0 1 90px">${chs(tb,tc)}</select></div>
 <p style="margin:0 0 12px"><b>${brange(R.f,n)}</b> <span class="mute">· ${n} chapter${n>1?'s':''}</span></p>
 <div class="form"><button id="rmark">Mark as read</button><button class="g" id="runmark">Unmark</button></div>
 <div class="mute" style="margin:4px 0 6px"></div><div class="form"><input id="gn" placeholder="Goal name (optional)"><input id="ge" type="date" value="${iso(Date.now()+29*864e5)}" aria-label="Finish by"><button class="g" id="gcreate">Create goal</button></div></div>
 <div class="card"><h2>Books of the Bible</h2><div class="mute">Tap a book to pick it, then tap chapters to choose a start and an end.</div>${shelf(0,39,'Old Testament')}${shelf(39,66,'New Testament')}</div>
 <div class="card"><div class="row"><h2 style="margin:0">${BIB[bsel][0]}</h2><span class="mute">${bprog(bsel)} of ${BIB[bsel][1]} chapters read</span></div>
 <div class="chaps" style="margin-top:12px">${[...Array(BIB[bsel][1])].map((_,i)=>{const c=rcv(bsel,i),g=gi(bsel,i+1);return `<button class="chap c${Math.min(2,c)}${g>=R.f&&g<=R.t?' in':''}" data-ch="${bsel}:${i+1}" aria-label="${BIB[bsel][0]} ${i+1}">${i+1}</button>`}).join('')}</div>
 <div class="legend2"><span><i class="c0"></i>Not read</span><span><i class="c1"></i>Read</span><span><i class="c2"></i>Read 2+ times</span><span><i class="in"></i>Selected</span></div></div>`},
calendar(){const[y,mo]=calM.split('-').map(Number),first=new Date(y,mo-1,1).getDay(),n=new Date(y,mo,0).getDate(),evs=d=>S.events.filter(e=>e.date===d),dues=d=>S.subs.filter(s=>s.next===d);
 let cells='';for(let i=0;i<first;i++)cells+='<span></span>';
 for(let i=1;i<=n;i++){const d=`${calM}-${String(i).padStart(2,'0')}`;cells+=`<button class="day${d===today()?' tod':''}${d===selD?' sel':''}" data-sel="${d}" aria-label="${d}">${i}${evs(d).length||dues(d).length?'<i></i>':''}</button>`}
 const E=evs(selD).sort(evSort),Dd=dues(selD),end=iso(Date.now()+7*864e5),up=S.events.filter(e=>e.date>=today()&&e.date<=end&&!e.done).sort((a,b)=>a.date.localeCompare(b.date)||evSort(a,b));
 return `<div class="card"><div class="row"><button class="g s" data-cal="-1" aria-label="Previous month">‹</button><b>${new Date(y,mo-1,1).toLocaleDateString(undefined,{month:'long',year:'numeric'})}</b><span><button class="g s" id="caltoday">Today</button> <button class="g s" data-cal="1" aria-label="Next month">›</button></span></div>
 <div class="cal" style="margin-top:14px">${['S','M','T','W','T','F','S'].map(x=>`<span class="dow">${x}</span>`).join('')}${cells}</div></div>
 <div class="card"><h2>${new Date(selD+'T12:00').toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})}</h2>
 <div class="form"><input id="ev" placeholder="Add a schedule, e.g. Church meeting" aria-label="Title"><input id="et" type="time" aria-label="Time" style="flex:0 1 130px"><button id="addev">Add</button></div>
 ${E.map(evRow).join('')}${Dd.map(s=>`<div class="item"><div class="chipic c4">₹</div><div class="t"><b>${esc(s.name)}</b><div class="mute">Payment due · ${money(s.amount)}</div></div></div>`).join('')}
 ${E.length||Dd.length?'':'<div class="empty">Nothing planned for this day.</div>'}</div>
 ${up.length?`<div class="card"><h2>Next 7 days</h2>${up.map(e=>`<div class="item"><div class="t"><b>${esc(e.title)}</b><div class="mute">${e.date}${e.time?' · '+e.time:''}</div></div></div>`).join('')}</div>`:''}`},
settings(){return `${window.Cloud?Cloud.card():''}<div class="card"><h2>Goals and data</h2><div class="form"><input id="gs" type="number" value="${S.goals.steps}" aria-label="Step goal"><input id="ga" type="number" value="${S.goals.active}" aria-label="Active minutes goal"><input id="gb" type="number" value="${S.goals.budget}" aria-label="Daily budget"><input id="cu" value="${esc(S.cur)}" style="max-width:70px" aria-label="Currency"><input id="pms" value="${esc(S.pm.join(', '))}" aria-label="Payment methods, comma separated" style="flex:1 1 100%"><select id="sens" aria-label="Step sensitivity" style="flex:1 1 100%"><option value="0.7" ${S.thr===0.7?'selected':''}>Step sensitivity: High (counts light steps)</option><option value="1.1" ${!S.thr||S.thr===1.1?'selected':''}>Step sensitivity: Normal</option><option value="1.6" ${S.thr===1.6?'selected':''}>Step sensitivity: Low (ignores small movement)</option></select><button id="sg">Save</button></div>
 <div class="form"><button class="g" id="ex">Export backup</button><button class="g" id="im">Import backup</button><input type="file" id="fi" accept=".json" hidden></div></div>`}};

function animate(v,on){if(!on||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))return;v.classList.remove('enter');void v.offsetWidth;
 v.querySelectorAll('.card').forEach((e,i)=>e.style.setProperty('--i',Math.min(i,12)));v.querySelectorAll('.chap,.bk,.day').forEach((e,i)=>e.style.setProperty('--i',Math.min(i,40)));
 v.classList.add('enter');clearTimeout(animate.t);animate.t=setTimeout(()=>v.classList.remove('enter'),1500)}
function render(anim){const v=$('#view');v.innerHTML=views[tab]();animate(v,anim);$('#dl').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
 const h=new Date().getHours();$('#gr').textContent=(h<12?'Good morning':h<18?'Good afternoon':'Good evening')+'!';$('#score').textContent=`Day score ${score(today())}`;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab))}
const num=id=>Math.max(0,parseFloat($(id).value)||0);

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const D=b.dataset,id=b.id;
 if(D.tab){tab=D.tab;scrollTo&&scrollTo({top:0});return render(true)}
 if(id==='motion')return enableMotion();
 if(id==='addst')day(today()).steps+=Math.round(num('#st'));
 else if(id==='setst')day(today()).steps=Math.round(num('#st'));
 else if(id==='addac')day(today()).extra+=Math.round(num('#ac'));
 else if(id==='addt'){const v=$('#tt').value.trim();if(!v)return;S.tasks.push({id:uid(),title:v,date:today(),done:false,spent:0,run:null})}
 else if(D.tog){const t=S.tasks.find(x=>x.id===D.tog);if(t.run){t.spent=secs(t);t.run=null}else{S.tasks.forEach(x=>{if(x.run){x.spent=secs(x);x.run=null}});t.run=Date.now()}}
 else if(D.del)S.tasks=S.tasks.filter(x=>x.id!==D.del);
 else if(id==='addtx'){const a=num('#am');if(!a)return;const ty=$('#ty').value,pm=$('#pm')?$('#pm').value:'',on=ty==='dr'&&$('#ch')&&$('#ch').value==='online',cat=$('#ca').value.trim(),note=$('#no').value.trim(),tag=$('#tg')?$('#tg').value:'useful';
  S.tx.push({id:uid(),date:today(),type:ty,amount:a,cat,note,tag,pm,ch:on?'online':'offline',app:on?($('#ap').value.trim()||'Online'):''});
  if(ty==='dr'&&/later|in 3/i.test(pm)){const n=/in 3/i.test(pm)?3:1;S.subs.push({id:uid(),name:(note||cat||'Purchase')+(n>1?' (Pay in 3)':' (Pay later)'),amount:Math.round(a/n*100)/100,cycle:'monthly',next:nextDue(today(),'monthly'),remind:3,tag,cat:'Pay later dues',left:n,noTx:true})}}
 else if(D.deltx)S.tx=S.tx.filter(x=>x.id!==D.deltx);
 else if(id==='sg'){S.goals={steps:num('#gs')||8000,active:num('#ga')||60,budget:num('#gb')||1000};S.cur=$('#cu').value||'₹';S.pm=$('#pms').value.split(',').map(x=>x.trim()).filter(Boolean);if(!S.pm.length)S.pm=['Cash'];S.thr=parseFloat($('#sens').value)||1.1}
 else if(id==='addsub'){const n=$('#sn').value.trim(),a=num('#sa'),d=$('#sd').value;if(!n||!a||!d)return alert('Add a name, amount and next due date.');
  S.subs.push({id:uid(),name:n,amount:a,cycle:$('#scy').value,next:d,remind:+$('#sr').value,tag:$('#stg').value,cat:(PRE[$('#sp').value]||PRE.other)[2]})}
 else if(D.pay){const x=S.subs.find(v=>v.id===D.pay);if(x.noTx){x.left--;if(x.left<=0)S.subs=S.subs.filter(v=>v!==x);else x.next=nextDue(x.next,'monthly')}else{S.tx.push({id:uid(),date:today(),type:'dr',amount:x.amount,cat:x.cat||'Subscriptions',note:x.name,tag:x.tag||'useful'});x.next=nextDue(isNaN(x.cycle)?x.next:today(),x.cycle)}}
 else if(D.delsub)S.subs=S.subs.filter(v=>v.id!==D.delsub);
 else if(id==='notif'){Notification.requestPermission().then(render);return}
 else if(id==='savebt'){(S.budgets[month]=S.budgets[month]||{total:0,cats:{}}).total=num('#bt')}
 else if(id==='addcat'){const k=$('#bc').value.trim();if(!k||!num('#ba'))return;(S.budgets[month]=S.budgets[month]||{total:0,cats:{}}).cats[k]=num('#ba')}
 else if(D.delcat)delete S.budgets[month].cats[D.delcat];
 else if(D.rev){month=D.rev;tab='review';return render(true)}
 else if(id==='addev'){const v=$('#ev').value.trim();if(!v)return;S.events.push({id:uid(),date:selD,time:$('#et').value,title:v,done:false})}
 else if(D.delev)S.events=S.events.filter(v=>v.id!==D.delev);
 else if(D.sel){selD=D.sel;return render()}
 else if(D.cal){const[y,m]=calM.split('-').map(Number);calM=iso(new Date(y,m-1+Number(D.cal),1)).slice(0,7);return render(true)}
 else if(id==='caltoday'){calM=today().slice(0,7);selD=today();return render()}
 else if(id==='bstart'){const st=$('#bs').value||today(),en=$('#be').value;if(!en||en<st)return alert('Choose an end date after the start date.');S.bible={start:st,end:en,rounds:Math.max(1,Math.round(num('#br'))||3),pos:0,log:{}}}
 else if(id==='bdone'||D.bdone){const b=bstat();bread(b.target-b.rt)}
 else if(id==='badd')bread(num('#bn'));
 else if(id==='bundo'){const B=S.bible,r=B.log[today()]||0;bump(B.pos-r,r,-1);B.pos-=r;B.log[today()]=0}
 else if(id==='breset'){if(!confirm('Restart the plan? Your reading progress will be cleared.'))return;S.bible=null}
 else if(D.ch){const[x,y]=D.ch.split(':').map(Number),g=gi(x,y);bsel=x;if(!R.step){R.f=R.t=g;R.step=1}else{if(g<R.f){R.t=R.f;R.f=g}else R.t=g;R.step=0}return render()}
 else if(D.bk){bsel=+D.bk;R.f=gi(bsel,1);R.t=gi(bsel,BIB[bsel][1]);R.step=0;return render()}
 else if(id==='rmark')bump(R.f,R.t-R.f+1,1);
 else if(id==='runmark')bump(R.f,R.t-R.f+1,-1);
 else if(id==='gcreate'){const e=$('#ge').value;if(!e||e<today())return alert('Choose a finish date that is today or later.');let mn=Infinity;for(let i=R.f;i<=R.t;i++){const[x,y]=fromGi(i);mn=Math.min(mn,rcv(x,y))}
  S.bgoals.push({id:uid(),name:$('#gn').value.trim()||brange(R.f,R.t-R.f+1),f:R.f,t:R.t,start:today(),end:e,base:mn})}
 else if(D.gdel)S.bgoals=S.bgoals.filter(v=>v.id!==D.gdel);
 else if(D.gread){const g=S.bgoals.find(v=>v.id===D.gread);let left=0;for(let i=g.f;i<=g.t;i++){const[x,y]=fromGi(i);if(rcv(x,y)<=g.base)left++}
  let n=Math.ceil(left/Math.max(1,dayDiff(today(),g.end)+1));for(let i=g.f;i<=g.t&&n>0;i++){const[x,y]=fromGi(i);if(rcv(x,y)<=g.base){rcs(x,y,1);n--}}}
 else if(id==='ex'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download=`daylog-${today()}.json`;return a.click()}
 else if(id==='im')return $('#fi').click();
 else return;
 save();render()});
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.done){const k=S.tasks.find(x=>x.id===t.dataset.done);if(k.run){k.spent=secs(k);k.run=null}k.done=t.checked;k.date=today();save();render()}
 if(t.id==='sp'){const q=PRE[t.value];$('#sn').value=q[0];$('#scy').value=q[1]}
 if(t.dataset.doneev){const x=S.events.find(v=>v.id===t.dataset.doneev);x.done=t.checked;save();render()}
 if(['fb','fc','tb','tc'].includes(t.id)){const fb=+$('#fb').value,tb=+$('#tb').value,f=t.id==='fb'?1:Math.min(+$('#fc').value,BIB[fb][1]),e=t.id==='tb'?BIB[tb][1]:Math.min(+$('#tc').value,BIB[tb][1]);R.f=gi(fb,f);R.t=Math.max(R.f,gi(tb,e));R.step=0;render()}
 if(t.id==='ty'||t.id==='ch'){const cr=$('#ty').value==='cr';$('#ch').hidden=cr;$('#tg').hidden=cr;$('#ap').hidden=cr||$('#ch').value!=='online'}
 if(t.id==='mo'){month=t.value||month;render()}
 if(t.id==='fi'){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.days||!d.tasks||!d.tx)throw 0;d.uid=S.uid;S=d;save();location.reload()}catch{alert('Not a valid Daylog backup.')}};r.readAsText(t.files[0])}});
setInterval(()=>{S.tasks.filter(t=>t.run).forEach(t=>{const e=$(`[data-tm="${t.id}"]`);if(e)e.textContent=fmt(secs(t))+' · focusing';const f=$('#fz');if(f)f.textContent=fmt(secs(t))})},1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncHealth()});setInterval(syncHealth,3e5);
if(S.motion&&!NATIVE&&!(window.DeviceMotionEvent&&DeviceMotionEvent.requestPermission)){addEventListener('devicemotion',onMotion);motionOn=true}
render(true);syncHealth();checkDue();
if('serviceWorker' in navigator&&!NATIVE)navigator.serviceWorker.register('sw.js');