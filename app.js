// Daylog v2: automatic steps (Health Connect / HealthKit on the mobile app, motion sensor in the browser)
const KEY='daylog.v2',$=(s,r=document)=>r.querySelector(s);
const iso=d=>{const x=new Date(d);return new Date(x-x.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const today=()=>iso(Date.now()),uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('daylog.v1')||'null')||{days:{},tasks:[],tx:[]};
S.days=S.days||{};S.tasks=S.tasks||[];S.tx=S.tx||[];S.goals=Object.assign({steps:8000,active:60,budget:1000},S.goals);S.cur=S.cur||'₹';
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
function addSteps(n){day(today()).steps+=n;clearTimeout(tmr);tmr=setTimeout(()=>{save();if(tab==='today'||tab==='journey')render()},1500)}
function onMotion(e){const a=e.accelerationIncludingGravity;if(!a)return;const m=Math.hypot(a.x||0,a.y||0,a.z||0);
 onMotion.g=(onMotion.g||9.8)*.92+m*.08;const t=Date.now();
 if(m-onMotion.g>1.5&&t-lastStep>320){run=t-lastStep>1500?1:run+1;lastStep=t;if(run===5)addSteps(5);else if(run>5)addSteps(1)}} // needs 5 steps in a row to count
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
const views={
today(){const t=today(),y=last(2)[0],d=peek(t),g=S.goals,tt=S.tasks.filter(x=>x.date===t),dn=tt.filter(x=>x.done).length,sp=spend(t),runT=S.tasks.find(x=>x.run),w=last(7),
 mo=S.tx.filter(x=>x.date.startsWith(t.slice(0,7))&&x.type==='dr'),c={};mo.forEach(x=>c[x.cat||'Other']=(c[x.cat||'Other']||0)+x.amount);
 const en=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5),tot=mo.reduce((a,x)=>a+x.amount,0),rec=[...S.tx].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 return `<div class="dash"><div class="stats">
 ${stat('c1','step','Steps',d.steps.toLocaleString(),pill(d.steps,peek(y).steps),`${Math.round(Math.min(100,d.steps/g.steps*100))}% of ${g.steps.toLocaleString()} goal<div style="margin-top:8px">${status()}</div>`)}
 ${stat('c2','act','Active time',`${Math.floor(act(t)/60)}h ${act(t)%60}m`,pill(act(t),act(y)),`Goal ${g.active} min a day`)}
 ${stat('c4','wal','Spent today',money(sp),pill(sp,spend(y),1),`Budget ${money(g.budget)} a day`)}
 ${stat('c3','chk','Tasks',`${dn} of ${tt.length}`,'',`${streak()}-day step streak`)}</div>
 <div class="card quick"><h2>Quick add</h2><div class="form"><select id="ty"><option value="dr">Expense</option><option value="cr">Credit</option></select><input id="am" type="number" min="0" step="0.01" placeholder="Amount"><input id="ca" placeholder="Category"><input id="no" placeholder="Note"><select id="tg" aria-label="Worth it"><option value="useful">Useful spend</option><option value="unwanted">Unwanted spend</option></select></div><button class="send" id="addtx">Add entry</button>
 <details style="margin-top:14px"><summary>Adjust steps or minutes</summary><div class="form"><input id="st" type="number" min="0" placeholder="Steps"><button class="g" id="addst">Add steps</button><input id="ac" type="number" min="0" placeholder="Minutes"><button class="g" id="addac">Add minutes</button></div></details></div>
 ${dueCard()}${revBanner()}${runT?`<div class="card live span3"><div class="lbl">In focus · ${esc(runT.title)}</div><div class="num" id="fz">${fmt(secs(runT))}</div></div>`:''}
 <div class="card span2"><h2>Steps overview</h2>${bars(w.map(x=>peek(x).steps),w.map(x=>new Date(x+'T12:00').toLocaleDateString(undefined,{weekday:'short'})))}</div>
 <div class="card"><h2>Spending overview</h2>${tot?`<div style="text-align:center">${donut(en,tot)}</div><div class="legend">${en.map(([k,v],i)=>`<span><i style="background:${PAL[i%5]}"></i>${esc(k)}</span>`).join('')}</div>`:'<div class="empty">No expenses this month.</div>'}</div>
 <div class="card span3"><h2>Recent transactions</h2><div class="tbl"><div class="r h"><span>Transaction</span><span>Date</span><span>Category</span><span>Amount</span><span>Type</span></div>
 ${rec.length?rec.map((x,i)=>`<div class="r"><div class="n"><div class="chipic c${i%4+1}" style="font-weight:600">${esc((x.note||x.cat||'?')[0].toUpperCase())}</div><span>${esc(x.note||x.cat||'Entry')}</span></div><span class="mute">${x.date}</span><span>${esc(x.cat||'Other')}</span><b>${money(x.amount)}</b><span><span class="pill ${x.type}">${x.type==='cr'?'Credit':'Expense'}</span></span></div>`).join(''):'<div class="empty">Add your first entry with Quick add.</div>'}</div></div></div>`},
focus(){const tt=S.tasks.filter(t=>t.date===today()||!t.done);
 return `<div class="form"><input id="tt" placeholder="What will you focus on?" aria-label="Task"><button id="addt">Add task</button></div>
 <div class="card">${tt.length?tt.map(t=>`<div class="item ${t.done?'done':''}"><input type="checkbox" data-done="${t.id}" ${t.done?'checked':''} style="width:20px;height:20px;accent-color:var(--acc)" aria-label="Done"><div class="t"><b>${esc(t.title)}</b><div class="mute ${t.run?'run':''}" data-tm="${t.id}">${fmt(secs(t))}${t.run?' · focusing':''}</div></div>${t.done?'':`<button class="s ${t.run?'':'g'}" data-tog="${t.id}">${t.run?'Pause':'Start'}</button>`}<button class="s g" data-del="${t.id}" aria-label="Delete">✕</button></div>`).join(''):'<div class="empty">No tasks yet. Add one and start its timer.</div>'}</div>`},
wallet(){const tx=S.tx.filter(t=>t.date.startsWith(month)).sort((a,b)=>b.date.localeCompare(a.date)),cr=tx.filter(t=>t.type==='cr').reduce((a,t)=>a+t.amount,0),dr=tx.filter(t=>t.type==='dr').reduce((a,t)=>a+t.amount,0),c={};
 tx.filter(t=>t.type==='dr').forEach(t=>c[t.cat||'Other']=(c[t.cat||'Other']||0)+t.amount);
 return `<div class="form"><select id="ty"><option value="dr">Expense</option><option value="cr">Credit</option></select><input id="am" type="number" min="0" step="0.01" placeholder="Amount"><input id="ca" placeholder="Category" list="cl"><datalist id="cl"><option>Food<option>Transport<option>Bills<option>Shopping<option>Salary</datalist><input id="no" placeholder="Note"><select id="tg" aria-label="Worth it"><option value="useful">Useful spend</option><option value="unwanted">Unwanted spend</option></select><button id="addtx">Save</button></div>
 <div class="card"><div class="row"><h2>Month</h2><input type="month" id="mo" value="${month}" style="width:auto"></div><div class="grid" style="gap:10px"><div><div class="sub">Credits</div><div class="num cr">${money(cr)}</div></div><div><div class="sub">Expenses</div><div class="num dr">${money(dr)}</div></div></div>
 <p class="mute" style="margin:12px 0 0">Balance ${money(cr-dr)}${Object.keys(c).length?' · '+Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>esc(k)+' '+money(v)).join(', '):''}</p></div>
 <div class="card">${tx.length?tx.map(t=>`<div class="item"><div class="t"><b>${esc(t.cat||'Other')}</b><div class="mute">${t.date}${t.note?' · '+esc(t.note):''}${t.tag==='unwanted'?' · Unwanted':''}</div></div><b class="${t.type}">${t.type==='cr'?'+':'−'}${money(t.amount)}</b><button class="s g" data-deltx="${t.id}" aria-label="Delete">✕</button></div>`).join(''):'<div class="empty">Nothing logged this month.</div>'}</div>`},
journey(){const w=last(14),ds=Object.keys(S.days).filter(hasData).sort().reverse().slice(0,30);
 return `<div class="card"><h2>Insights</h2>${insights()}</div>
 <div class="card"><h2>Day score, last 12 weeks</h2>${heat()}<div class="sub">Brighter means a better day: steps, active time, tasks and budget.</div></div>
 <div class="card"><h2>Steps, last 14 days</h2>${bars(w.map(d=>peek(d).steps),w.map(d=>d.slice(8)))}</div>
 <div class="card"><h2>Daily log</h2>${ds.length?ds.map(d=>{const tt=S.tasks.filter(t=>t.date===d&&t.done),net=S.tx.filter(t=>t.date===d).reduce((a,t)=>a+(t.type==='cr'?t.amount:-t.amount),0);
 return `<div class="item"><div class="t"><b>${d}</b> <span class="run">${score(d)}</span><div class="mute">${peek(d).steps.toLocaleString()} steps · ${act(d)} min active · ${tt.length} tasks (${fmt(tt.reduce((a,t)=>a+secs(t),0))})</div></div><b class="${net<0?'dr':'cr'}">${money(net)}</b></div>`}).join(''):'<div class="empty">Your history builds up here.</div>'}</div>`},
subs(){const tot=S.subs.reduce((a,s)=>a+perMonth(s),0),L=[...S.subs].sort((a,b)=>a.next.localeCompare(b.next));
 return `<div class="card"><h2>Add a recharge or subscription</h2><div class="form"><select id="sp" aria-label="Type">${Object.entries(PRN).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><input id="sn" value="Jio recharge" placeholder="Name"><input id="sa" type="number" min="0" placeholder="Amount"><select id="scy" aria-label="Repeats">${Object.entries(CYC).map(([k,v])=>`<option value="${k}" ${k==='28'?'selected':''}>${v}</option>`).join('')}</select><input id="sd" type="date" value="${today()}" aria-label="Next due date"><select id="sr" aria-label="Remind"><option value="1">Remind 1 day before</option><option value="3" selected>Remind 3 days before</option><option value="7">Remind 7 days before</option></select><select id="stg" aria-label="Worth it"><option value="useful">Useful</option><option value="unwanted">Unwanted</option></select><button id="addsub">Add</button></div>
 <p class="mute" style="margin:0">Enter your current plan amount and the date it expires (for a recharge, the validity end date). Pick the validity under Repeats.</p>${'Notification' in window&&Notification.permission==='default'?'<button class="g s" id="notif" style="margin-top:10px">Allow notifications</button>':''}</div>
 <div class="card"><div class="row"><h2 style="margin:0">Your plans</h2><span class="mute">about ${money(tot)} a month</span></div>${L.length?L.map((s,i)=>`<div class="item"><div class="chipic c${i%4+1}" style="font-weight:600">${esc(s.name[0]||'?').toUpperCase()}</div><div class="t"><b>${esc(s.name)}</b><div class="mute">${money(s.amount)} · ${CYC[s.cycle]} · next ${s.next}${s.tag==='unwanted'?' · Unwanted':''}</div></div><span class="pill ${daysLeft(s.next)<=s.remind?'dn':'up'}">${dueTxt(s)}</span><button class="s" data-pay="${s.id}">Paid</button><button class="s g" data-delsub="${s.id}" aria-label="Delete">✕</button></div>`).join(''):'<div class="empty">No plans yet. Add Jio, Airtel, Netflix, Prime or JioFiber above.</div>'}</div>`},
budget(){const m=month,B=S.budgets[m]||{total:0,cats:{}},tx=S.tx.filter(x=>x.date.startsWith(m)&&x.type==='dr'),by={};tx.forEach(x=>{const k=x.cat||'Other';by[k]=(by[k]||0)+x.amount});
 const sp=tx.reduce((a,x)=>a+x.amount,0),sub=S.subs.reduce((a,s)=>a+perMonth(s),0),names=[...new Set([...Object.keys(B.cats),...Object.keys(by)])];
 return `<div class="card"><div class="row"><h2 style="margin:0">Monthly plan</h2>${monthPick()}</div><div class="form" style="margin-top:14px"><input id="bt" type="number" min="0" value="${B.total||''}" placeholder="Total budget for the month"><button id="savebt">Save plan</button></div>
 <div class="row"><b>${money(sp)} spent</b><span class="mute">${B.total?`${money(Math.abs(B.total-sp))} ${sp>B.total?'over':'left'} of ${money(B.total)}`:'Set a total to track it'}</span></div>${meter(sp,B.total)}
 <p class="mute" style="margin:12px 0 0">Subscriptions and recharges commit about ${money(sub)} a month${B.total?` (${Math.round(sub/B.total*100)}% of your plan)`:''}.</p></div>
 <div class="card"><h2>Category limits</h2><div class="form"><input id="bc" placeholder="Category, e.g. Food"><input id="ba" type="number" min="0" placeholder="Limit"><button id="addcat">Set limit</button></div>
 ${names.length?names.map(k=>`<div class="item" style="display:block"><div class="row"><b>${esc(k)}</b><span class="mute">${money(by[k]||0)}${B.cats[k]?' of '+money(B.cats[k]):''}</span>${B.cats[k]!==undefined?`<button class="s g" data-delcat="${esc(k)}" aria-label="Remove">✕</button>`:''}</div>${B.cats[k]?meter(by[k]||0,B.cats[k]):''}</div>`).join(''):'<div class="empty">Set a limit to start planning.</div>'}</div>`},
review(){const m=month,ds=dm(m),g=S.goals,tx=S.tx.filter(x=>x.date.startsWith(m)),dr=tx.filter(x=>x.type==='dr'),cr=tx.filter(x=>x.type==='cr').reduce((a,x)=>a+x.amount,0),
 sp=dr.reduce((a,x)=>a+x.amount,0),bad=dr.filter(x=>x.tag==='unwanted').sort((a,b)=>b.amount-a.amount),badT=bad.reduce((a,x)=>a+x.amount,0),B=S.budgets[m]||{},
 data=ds.filter(hasData),avg=data.length?data.reduce((a,d)=>a+peek(d).steps,0)/data.length:0,hit=ds.filter(d=>peek(d).steps>=g.steps).length,lazy=data.filter(d=>peek(d).steps<g.steps*.3).length,ratio=data.length?hit/data.length:0,
 tk=S.tasks.filter(t=>t.date.startsWith(m)),dn=tk.filter(t=>t.done),ft=tk.reduce((a,t)=>a+secs(t),0),
 vS=!sp?'No spending':badT/sp<.1?'Disciplined':badT/sp<.25?'Fair':'Needs attention',vA=!data.length?'No data':ratio>=.6?'Active':ratio>=.3?'Balanced':'Lazy',
 vT=!tk.length?'No tasks':dn.length/tk.length>=.8?'Productive':dn.length/tk.length>=.5?'Steady':'Behind',F=[],uw=S.subs.filter(s=>s.tag==='unwanted');
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
settings(){return `${window.Cloud?Cloud.card():''}<div class="card"><h2>Goals and data</h2><div class="form"><input id="gs" type="number" value="${S.goals.steps}" aria-label="Step goal"><input id="ga" type="number" value="${S.goals.active}" aria-label="Active minutes goal"><input id="gb" type="number" value="${S.goals.budget}" aria-label="Daily budget"><input id="cu" value="${esc(S.cur)}" style="max-width:70px" aria-label="Currency"><button id="sg">Save</button></div>
 <div class="form"><button class="g" id="ex">Export backup</button><button class="g" id="im">Import backup</button><input type="file" id="fi" accept=".json" hidden></div></div>`}};

function render(){$('#view').innerHTML=views[tab]();$('#dl').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
 const h=new Date().getHours();$('#gr').textContent=(h<12?'Good morning':h<18?'Good afternoon':'Good evening')+'!';$('#score').textContent=`Day score ${score(today())}`;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab))}
const num=id=>Math.max(0,parseFloat($(id).value)||0);

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const D=b.dataset,id=b.id;
 if(D.tab){tab=D.tab;return render()}
 if(id==='motion')return enableMotion();
 if(id==='addst')day(today()).steps+=Math.round(num('#st'));
 else if(id==='addac')day(today()).extra+=Math.round(num('#ac'));
 else if(id==='addt'){const v=$('#tt').value.trim();if(!v)return;S.tasks.push({id:uid(),title:v,date:today(),done:false,spent:0,run:null})}
 else if(D.tog){const t=S.tasks.find(x=>x.id===D.tog);if(t.run){t.spent=secs(t);t.run=null}else{S.tasks.forEach(x=>{if(x.run){x.spent=secs(x);x.run=null}});t.run=Date.now()}}
 else if(D.del)S.tasks=S.tasks.filter(x=>x.id!==D.del);
 else if(id==='addtx'){const a=num('#am');if(!a)return;S.tx.push({id:uid(),date:today(),type:$('#ty').value,amount:a,cat:$('#ca').value.trim(),note:$('#no').value.trim(),tag:$('#tg')?$('#tg').value:'useful'})}
 else if(D.deltx)S.tx=S.tx.filter(x=>x.id!==D.deltx);
 else if(id==='sg'){S.goals={steps:num('#gs')||8000,active:num('#ga')||60,budget:num('#gb')||1000};S.cur=$('#cu').value||'₹'}
 else if(id==='addsub'){const n=$('#sn').value.trim(),a=num('#sa'),d=$('#sd').value;if(!n||!a||!d)return alert('Add a name, amount and next due date.');
  S.subs.push({id:uid(),name:n,amount:a,cycle:$('#scy').value,next:d,remind:+$('#sr').value,tag:$('#stg').value,cat:(PRE[$('#sp').value]||PRE.other)[2]})}
 else if(D.pay){const x=S.subs.find(v=>v.id===D.pay);S.tx.push({id:uid(),date:today(),type:'dr',amount:x.amount,cat:x.cat||'Subscriptions',note:x.name,tag:x.tag||'useful'});x.next=nextDue(isNaN(x.cycle)?x.next:today(),x.cycle)}
 else if(D.delsub)S.subs=S.subs.filter(v=>v.id!==D.delsub);
 else if(id==='notif'){Notification.requestPermission().then(render);return}
 else if(id==='savebt'){(S.budgets[month]=S.budgets[month]||{total:0,cats:{}}).total=num('#bt')}
 else if(id==='addcat'){const k=$('#bc').value.trim();if(!k||!num('#ba'))return;(S.budgets[month]=S.budgets[month]||{total:0,cats:{}}).cats[k]=num('#ba')}
 else if(D.delcat)delete S.budgets[month].cats[D.delcat];
 else if(D.rev){month=D.rev;tab='review';return render()}
 else if(id==='ex'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download=`daylog-${today()}.json`;return a.click()}
 else if(id==='im')return $('#fi').click();
 else return;
 save();render()});
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.done){const k=S.tasks.find(x=>x.id===t.dataset.done);if(k.run){k.spent=secs(k);k.run=null}k.done=t.checked;k.date=today();save();render()}
 if(t.id==='sp'){const q=PRE[t.value];$('#sn').value=q[0];$('#scy').value=q[1]}
 if(t.id==='mo'){month=t.value||month;render()}
 if(t.id==='fi'){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.days||!d.tasks||!d.tx)throw 0;d.uid=S.uid;S=d;save();location.reload()}catch{alert('Not a valid Daylog backup.')}};r.readAsText(t.files[0])}});
setInterval(()=>{S.tasks.filter(t=>t.run).forEach(t=>{const e=$(`[data-tm="${t.id}"]`);if(e)e.textContent=fmt(secs(t))+' · focusing';const f=$('#fz');if(f)f.textContent=fmt(secs(t))})},1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncHealth()});setInterval(syncHealth,3e5);
if(S.motion&&!NATIVE&&!(window.DeviceMotionEvent&&DeviceMotionEvent.requestPermission)){addEventListener('devicemotion',onMotion);motionOn=true}
render();syncHealth();checkDue();
if('serviceWorker' in navigator&&!NATIVE)navigator.serviceWorker.register('sw.js');