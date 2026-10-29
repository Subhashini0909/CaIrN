// Names and places for the Study tab: hover/tap cards inside KJV verses and a full detail sheet.
// Data: names.json (+ names-bg.json, loaded only when a sheet opens). Built from STEPBible TIPNR (Tyndale House, CC BY 4.0),
// STEPBible TBESH/TBESG lexicons (CC BY 4.0) and Strong's Dictionary (Open Scriptures, CC BY-SA). Easton's Bible Dictionary text and
// verse events come from events.json / names-bg.json (Theographic, CC BY-SA 4.0).
(()=>{
const NM=window.NM={cfg:{text:()=>null,go:()=>{}}};
let D=null,LX={},BG=null,busy=0,bgBusy=0;const waiting=[],IDX=new Map(),VC=new Map();
const TYPE={Male:'Man',Female:'Woman',Group:'People or group',Place:'Place',Supernatural:'Supernatural',Time:'Festival or month',Title:'Title',Language:'Language',Musical:'Musical term',Star:'Star or constellation',Other:'Other'};
// Position of a place. The source data uses 0,14 as a placeholder for "unknown" (Eden, Nod, Havilah and others), so those are treated as unmapped.
const LLFIX={'Hazor':[33.0167,35.5683],'Gerasa':[32.2811,35.8914],'Plains of Moab':[31.83,35.57]};
const ll=e=>e&&e.t==='l'&&e.ll&&!(e.ll[0]===0&&e.ll[1]===14)?e.ll:(e&&e.t==='l'&&LLFIX[e.n])||null;
// A "place" record that is really a nation or tribe (Ammon, Edom, Egypt, Amalek) is labelled as such
const natl=e=>{const t=e.br||e.bf||e.d||'';return /^(?:an? |the )?(?:(?:ancient|nomadic|arabian|israelite|great|powerful) )*(?:nation|people|tribe)\b/i.test(t)||(/\b(?:nation|people group)\b/i.test(t)&&!/^(?:an? )?(?:town|city|village|gate|valley|mountain|fortified|region|capital|port)/i.test(t))};
const kind=e=>e.t==='l'?(natl(e)?'Nation or people':'Place'):e.t==='p'?(TYPE[e.ty]||'Person'):(TYPE[e.ty]||'Name');
// A people named after a place (Ammonites, Egyptians, Samaritans, Philistines): the word in the verse is the people, not the land
const demo=(t,e)=>{if(!e||e.t!=='l')return false;const a=String(t).toLowerCase().replace(/['\u2019]s$/,''),n=e.n.toLowerCase();
 if(a===n||/\s/.test(a)||/^(mount|valley|forest|gate|sea|river|plain)/.test(a))return false;
 if(/(?:ites?|ians?|eans?)$/.test(a))return true;
 return /(?:ans?|ines?)$/.test(a)&&/[aeiouy]$/.test(n)&&a.slice(0,3)===n.slice(0,3)};
const vk=(b,c,v)=>b*1e6+c*1e3+v,vp=k=>[Math.floor(k/1e6),Math.floor(k%1e6/1e3),k%1e3];
const refs=e=>{if(e._r)return e._r;const s=new Set();e.rw.forEach(r=>{let p=0;r.r.forEach(d=>{p+=d;s.add(p)})});return e._r=[...s].sort((a,b)=>a-b)};
const vname=(b,c,v)=>`${BIB[b][0]} ${c}:${v}`;
const fixc=s=>String(s||'').replace(/\b([HG])0+(\d)/g,'$1$2');
const isH=s=>/^H/.test(s||''),lang=(r)=>r.g==='a'||r.g==='ac'?'Aramaic':isH(r.s)?'Hebrew':/^G/.test(r.s||'')||r.g==='g'?'Greek':/[\u0370-\u03FF\u1F00-\u1FFF]/.test(r.w||'')?'Greek':'Hebrew';
const scr=(w,l)=>w?`<span class="${l==='Greek'?'gk':'hb'}" lang="${l==='Greek'?'el':l==='Aramaic'?'arc':'he'}" dir="${l==='Greek'?'ltr':'rtl'}">${esc(w)}</span>`:'';

// ---------- loading ----------
NM.ready=()=>!!D;
NM.load=cb=>{loadEv();if(cb)waiting.push(cb);if(D||busy)return;busy=1;
 fetch('names.json').then(r=>r.json()).then(j=>{D=j.e;LX=j.L||{};
  D.forEach((e,i)=>e.rw.forEach((r,ri)=>{let p=0;r.r.forEach(d=>{p+=d;const a=IDX.get(p);a?a.push([i,ri]):IDX.set(p,[[i,ri]])})}));
  busy=0;waiting.splice(0).forEach(f=>f())}).catch(()=>{busy=0;NM.err=1;waiting.splice(0).forEach(f=>f())})};
let EV=null,VM=null,evBusy=0,BYN=null;
const loadEv=()=>{if(EV||evBusy)return;evBusy=1;fetch('events.json').then(r=>r.json()).then(j=>{EV=j.e;VM=j.v;evBusy=0;if(NM.cfg.refresh)NM.cfg.refresh();if(typeof sheet!=='undefined'&&sheet&&stack.length)fillLife(stack[stack.length-1])}).catch(()=>{evBusy=0;EV=false;if(typeof sheet!=='undefined'&&sheet&&stack.length)fillLife(stack[stack.length-1])})};
const nameIdx=n=>{if(!D)return null;if(!BYN){BYN=new Map();D.forEach((e,i)=>{const c=BYN.get(e.n);if(c==null||refs(D[c]).length<refs(e).length)BYN.set(e.n,i)})}const i=BYN.get(n);return i==null?null:i};
NM.ev=(b,c,v)=>{if(!VM)return '';const k=b+'.'+c+'.'+v;return VM[k]?` class="evm" data-ev="${k}" tabindex="0" role="button" title="What is happening in this verse"`:''};
const loadBg=cb=>{if(BG)return cb();if(bgBusy)return;bgBusy=1;fetch('names-bg.json').then(r=>r.json()).then(j=>{BG=j;bgBusy=0;cb()}).catch(()=>{bgBusy=0;BG=false;cb()})};

// ---------- matching names inside a KJV verse ----------
const L='A-Za-z\\u00C0-\\u024F',RC=new Map();
const rx=(f,ci)=>{const k=(ci?'i:':'s:')+f;let r=RC.get(k);if(!r){r=new RegExp(`(^|[^${L}])(${f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})(s|es)?(?:['\u2019]s?)?(?![${L}])`,ci?'gi':'g');RC.set(k,r)}r.lastIndex=0;return r};
const skel=w=>w.toLowerCase().replace(/ph/g,'f').replace(/ch|ck|k|q/g,'c').replace(/th/g,'t').replace(/sh/g,'s').replace(/h/g,'').replace(/[yj]/g,'i').replace(/(.)\1+/g,'$1');
function spans(b,c,v,text){const key=vk(b,c,v),pr=IDX.get(key);if(!pr)return[];const raw=[];
 pr.forEach(([i,ri])=>{const e=D[i],r=e.rw[ri];let hit=0;
  // the record's own (modern) spelling is tried too, because the KJV spelling is not always the one in the NLT (Shechaniah / Shecaniah, Abiah / Abijah)
  const fs=e.t==='o'||r.k.some(k=>k.toLowerCase()===e.n.toLowerCase())?r.k:r.k.concat(e.n);
  for(let pass=0;pass<2&&!hit;pass++)for(let fi=0;fi<fs.length;fi++){const f=fs[fi];if(f.length<2||(pass&&(f.length<5||fi>=r.k.length)&&e.t!=='o'))continue;const re=rx(f,pass);let m;
   while((m=re.exec(text))){const s=m.index+m[1].length,en=s+m[2].length+(m[3]||'').length;raw.push({s,e:en,i,ri});hit=1;if(m[0]===''){re.lastIndex++}}}
  // still nothing: a capitalised word that is spelled differently but sounds the same (Zechariah / Zachariah is NOT matched; Shechaniah / Shecaniah is)
  if(!hit&&(e.t==='p'||e.t==='l')){const sk=new Set(fs.filter(f=>f.length>=5&&!/\s/.test(f)).map(skel));if(sk.size){const re=/[A-Z\u00C0-\u00DE][A-Za-z\u00C0-\u024F]{4,}/g;let m;while((m=re.exec(text))){if(sk.has(skel(m[0])))raw.push({s:m.index,e:m.index+m[0].length,i,ri})}}}});
 // identical spans share one marker (several people or places with the same name); longer spans beat shorter overlapping ones
 const g=new Map();raw.forEach(x=>{const k=x.s+':'+x.e,o=g.get(k);if(o){if(!o.ids.some(z=>z.i===x.i))o.ids.push({i:x.i,ri:x.ri})}else g.set(k,{s:x.s,e:x.e,ids:[{i:x.i,ri:x.ri}]})});
 const all=[...g.values()].sort((a,b)=>a.s-b.s||(b.e-b.s)-(a.e-a.s)),out=[];let end=-1;
 all.forEach(x=>{if(x.s>=end){out.push(x);end=x.e}});
 out.forEach(x=>x.ids.sort((a,b)=>refs(D[b.i]).length-refs(D[a.i]).length));return out}
NM.mark=(b,c,v,text)=>{if(!D)return esc(text);const key=vk(b,c,v)+':'+text;let h=VC.get(key);if(h!=null)return h;
 const sp=spans(b,c,v,text);if(!sp.length){VC.set(key,esc(text));return esc(text)}
 h='';let p=0;sp.forEach(x=>{h+=esc(text.slice(p,x.s))+`<span class="nm n-${demo(text.slice(x.s,x.e),D[x.ids[0].i])?'p':D[x.ids[0].i].t}" data-nm="${x.ids.map(z=>z.i+'.'+z.ri).join(',')}" tabindex="0" role="button">${esc(text.slice(x.s,x.e))}</span>`;p=x.e});
 h+=esc(text.slice(p));VC.set(key,h);return h};

// ---------- people and places in a chapter ----------
NM.chapter=(b,c,n)=>{if(!D)return null;const seen=new Map();
 for(let v=1;v<=n;v++)(IDX.get(vk(b,c,v))||[]).forEach(([i])=>{if(!seen.has(i))seen.set(i,v)});
 const G={p:[],l:[],o:[]};[...seen.entries()].sort((a,b)=>a[1]-b[1]).forEach(([i])=>G[D[i].t].push(i));return G};

// ---------- hover card ----------
let pop=null,hideT=0,showT=0;
const brief=e=>e.br||e.bf||e.d||'';
const parse=s=>s.split(',').map(x=>{const[a,b]=x.split('.');return{i:+a,ri:+b}});
// what the tapped word itself means: its own form, not the merged record (Jacob is not Israel)
const rowMean=(e,r)=>r.m||(!r.alt&&e.m)||'';
const rowDef=r=>{const x=r.s&&LX[r.s];return x&&x.d?x.d:''};
const firstForm=e=>{const r=e.rw.filter(r=>r.w&&!r.alt&&r.g!=='nc'&&r.g!=='sc'&&r.g!=='lx').sort((a,b)=>(isH(b.s)?1:0)-(isH(a.s)?1:0)||b.r.length-a.r.length);return r[0]||e.rw.find(r=>r.w)};
const formLine=e=>{const out=[],seen=new Set();e.rw.filter(r=>r.w&&!r.alt&&['n','a','g'].includes(r.g)).sort((a,b)=>b.r.length-a.r.length).forEach(r=>{const l=lang(r),k=l+r.w;if(seen.has(l)||seen.has(k))return;seen.add(l);out.push(`${scr(r.w,l)}${r.x?` <i>${esc(r.x)}</i>`:''} <span class="lg">${l}</span>`)});return out.slice(0,3).join('')};
const one=(r,l)=>`${scr(r.w,l)}${r.x?` <i>${esc(r.x)}</i>`:''} <span class="lg">${l}</span>${r.s?` <span class="nmtag">${fixc(r.s)}</span>`:''}`;
const popHtml=(its,txt)=>{const{i,ri}=its[0],e=D[i],r=e.rw[ri],n=refs(e).length,l=lang(r),ml=rowMean(e,r)||(r.alt?rowDef(r):''),dm=demo(txt,e);
 const other=formLine(e).split('</span>').length>1&&!r.alt?formLine(e):'';
 return `<div class="nmp-h"><b>${esc(txt)}</b><span class="nmtag">${esc(dm?'People or group':kind(e))}</span></div>${dm||r.alt||txt!==e.n&&!txt.startsWith(e.n)?`<div class="nmp-s">${dm?'People of':r.alt?'Also known as':'Entry'}: ${esc(e.n)}</div>`:''}
 ${(e.d||e.ar)&&!dm?`<div class="nmp-s">${esc(e.t==='l'?(e.ar?'Region: '+e.ar:''):e.d)}</div>`:''}
 <div class="nmp-w">${r.w?one(r,l):''}${r.alt?'':(other?'':'')}</div>
 ${ml?`<div class="nmp-m"><b>${rowMean(e,r)?'Means':'Strong\'s'}</b> ${esc(ml)}</div>`:''}
 ${brief(e)?`<div class="nmp-b">${esc(brief(e))}</div>`:''}
 ${its.length>1?`<div class="nmp-s">${its.length} people or places share this name here</div>`:''}
 <div class="nmp-f">${n} verse${n===1?'':'s'} · ${matchMedia('(hover:hover)').matches?'click':'tap'} for full details</div>`};
const hidePop=()=>{clearTimeout(showT);if(pop){pop.remove();pop=null}};
const showPop=el=>{if(!D||sheet)return;const ids=parse(el.dataset.nm);hidePop();
 pop=document.createElement('div');pop.className='nmpop';pop.setAttribute('role','tooltip');pop.innerHTML=popHtml(ids,el.textContent);document.body.appendChild(pop);
 pop.addEventListener('mouseenter',()=>clearTimeout(hideT));pop.addEventListener('mouseleave',()=>hideT=setTimeout(hidePop,150));
 const r=el.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;let x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2)),y=r.bottom+8;if(y+h>innerHeight-8&&r.top>h+16)y=r.top-h-8;
 pop.style.left=x+'px';pop.style.top=Math.max(8,y)+'px'};
document.addEventListener('mouseover',e=>{const el=e.target.closest&&e.target.closest('.nm');if(!el||!matchMedia('(hover:hover)').matches)return;clearTimeout(hideT);clearTimeout(showT);showT=setTimeout(()=>showPop(el),220)});
document.addEventListener('mouseover',e=>{const el=e.target.closest&&e.target.closest('sup.evm');if(!el||!matchMedia('(hover:hover)').matches||sheet||!EV)return;clearTimeout(hideT);clearTimeout(showT);
 showT=setTimeout(()=>{const ix=(VM[el.dataset.ev]||[]).slice(0,3);hidePop();pop=document.createElement('div');pop.className='nmpop';pop.innerHTML=`<div class="nmp-h"><b>What is happening here</b></div>`+ix.map(n=>`<div class="nmp-b">${EV[n].c?'📖':'📌'} ${esc(EV[n].t)}${EV[n].y?` <span class="mute">(${esc(EV[n].c?EV[n].y:'about '+EV[n].y)})</span>`:''}</div>`).join('')+`<div class="nmp-f">click for details</div>`;document.body.appendChild(pop);
  const r=el.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;let x=Math.max(8,Math.min(innerWidth-w-8,r.left)),y=r.bottom+8;if(y+h>innerHeight-8&&r.top>h+16)y=r.top-h-8;pop.style.left=x+'px';pop.style.top=Math.max(8,y)+'px'},250)});
document.addEventListener('mouseout',e=>{if(e.target.closest&&e.target.closest('sup.evm')){clearTimeout(showT);hideT=setTimeout(hidePop,150)}});
document.addEventListener('mouseout',e=>{const el=e.target.closest&&e.target.closest('.nm');if(!el)return;clearTimeout(showT);hideT=setTimeout(hidePop,150)});
document.addEventListener('focusin',e=>{const el=e.target.closest&&e.target.closest('.nm');if(el)showPop(el)});
document.addEventListener('focusout',e=>{if(e.target.closest&&e.target.closest('.nm'))hidePop()});
addEventListener('scroll',hidePop,{passive:true});

// ---------- detail sheet ----------
let sheet=null,stack=[],RI=[],alts=null;
const chip=(i,extra)=>{const e=D[i];return `<button class="nmc n-${e.t}" data-nmo="${i}">${esc(e.n)}${extra?`<small>${esc(extra)}</small>`:''}</button>`};
const relChips=(arr,fl)=>(arr||[]).map(x=>{const i=Array.isArray(x)?x[0]:x,f=Array.isArray(x)?x[1]:'';return chip(i,f?fl[f]:'')}).join('');
const FL={d:'descendants',a:'ancestor',f:'founder'};
const sec=(t,h,cls)=>h?`<section class="nms ${cls||''}"><h3>${t}</h3>${h}</section>`:'';
const row=(k,v)=>v?`<div class="nmr"><span>${k}</span><div>${v}</div></div>`:'';
function forms(e,ti){const seen=new Set(),out=[];
 e.rw.map((r,x)=>[r,x]).sort((a,b)=>(b[1]===ti)-(a[1]===ti)).forEach(([r,x])=>{if(!r.w||(r.alt&&x!==ti)||r.g==='lx')return;const l=lang(r),key=l+'|'+r.w+'|'+(r.s||'');if(seen.has(key))return;seen.add(key);
  const lex=r.s&&LX[r.s],gk=l==='Greek';
  let mean=r.m||'';if(!mean&&gk&&!r.alt&&e.m&&lex&&/Hebrew|Chaldee/.test(lex.dv||''))mean=e.m+' (from the Hebrew)';if(!mean&&lex&&lex.d)mean=lex.d;
  const tag=x===ti&&r.alt?'The name you tapped':r.g==='s'||r.g==='sc'?'Variant spelling':r.g==='nc'||r.g==='ac'?'Part of a combined name':'';
  out.push(`<div class="nmf"><div class="nmf1">${scr(r.w,l)}<i>${esc(r.x||(lex&&lex.x)||'')}</i></div><div class="nmf2"><span class="lg">${l}</span>${r.s?`<span class="nmtag">${fixc(r.s)}</span>`:''}${tag?`<small>${tag}</small>`:''}</div>${mean?`<div class="nmf3"><span>Meaning</span> ${esc(mean)}</div>`:''}</div>`)});
 return out.length?out.slice(0,10).join('')+(out.length>10?`<p class="mute">${out.length-10} more spellings are not shown.</p>`:''):''}
function alsoCalled(e){const out=e.rw.filter(r=>r.alt&&r.w&&r.g!=='lx'&&!/^(God|Lord|LORD|Most High)$/.test(r.alt)).reduce((a,r)=>{const k=r.alt+r.w;if(!a.some(x=>x.k===k))a.push({k,r});return a},[]);
 return out.length?`<ul class="nml">${out.slice(0,12).map(({r})=>{const l=lang(r),v=vp(r.r.reduce((a,d,i)=>i?a:d,0));return `<li><b>${esc(r.alt)}</b> ${scr(r.w,l)} ${r.x?`<i>${esc(r.x)}</i>`:''} <span class="lg">${l}</span> <button class="nmv" data-nmgo="${v.join(':')}">${vname(...v)}</button>${r.m?` <span class="mute">· ${esc(r.m)}</span>`:''}</li>`}).join('')}</ul>`:''}
// Strong's codes inside a derivation (H6310) are shown with the word and its short meaning: peh “the mouth” H6310
const shortD=d=>{const w=String(d||'').split(/[;,(…:]/)[0].trim().split(/\s+/);return w.slice(0,5).join(' ')};
const dvHtml=t=>{let o='',p=0,m;const re=/\b([HG])(\d+)[a-z]?\b/g;t=String(t);
 while((m=re.exec(t))){const k=m[1]+m[2],x=LX[k];o+=esc(t.slice(p,m.index));
  o+=x?`<i>${esc(x.x||'')}</i>${x.d?` “${esc(shortD(x.d))}”`:''} <span class="nmtag">${k}</span>`:`<span class="nmtag">${k}</span>`;p=m.index+m[0].length}
 return o+esc(t.slice(p))};
function roots(e,r0){const cs=[...(r0&&r0.alt&&r0.s?[r0.s]:[]),...(e.lx||[])].filter((c,x,a)=>a.indexOf(c)===x);const items=cs.map(c=>[c,LX[c]]).filter(x=>x[1]);if(!items.length)return '';
 return items.map(([c,it])=>{const l=isH(c)?'Hebrew':'Greek',dv=fixc(it.dv||'');
  const ro=(it.ro||[]).map(rc=>{const r=LX[rc];if(!r)return '';const rl=isH(rc)?'Hebrew':'Greek';return `<div class="nmroot"><div>${scr(r.w,rl)} <i>${esc(r.x)}</i> <span class="nmtag">${fixc(rc)}</span></div><div><b>Root meaning:</b> ${esc(r.d)}</div>${r.k?`<div class="mute">Rendered in the KJV as: ${esc(r.k)}</div>`:''}</div>`}).join('');
  const none=!ro&&/primary|uncertain|foreign|origin/.test(dv);
  return `<div class="nmx"><div class="nmxh">${scr(it.w,l)} <i>${esc(it.x)}</i>${it.p?` <span class="mute">/${esc(it.p)}/</span>`:''} <span class="lg">${l}</span> <span class="nmtag">${fixc(c)}</span></div>
  ${it.d?`<p><b>Strong's definition:</b> ${esc(it.d)}</p>`:''}${it.k?`<p class="mute">KJV: ${esc(it.k)}</p>`:''}
  ${dv?`<p><b>Root word (derivation):</b> ${dvHtml(dv)}</p>`:''}${ro}</div>`}).join('')}
function family(e){let h='';
 if(e.t==='p'){h+=row('Tribe or nation',esc(e.tr||''));h+=row('Parents',relChips(e.par,FL));h+=row('Brothers and sisters',relChips(e.sib,FL));h+=row('Spouse',relChips(e.ptr,FL));h+=row('Children',relChips(e.off,FL))}
 else if(e.t==='l'){h+=row('Region',esc(e.ar||''));h+=row('Founded or built by',relChips(e.fd,FL));h+=row('People who lived there',relChips(e.pp,FL))}
 return h}

// ---------- family tree (inside a person's sheet) ----------
// Built from the parent / child / spouse / sibling links in names.json. Ancestors follow the father's line (the mother is shown beside him),
// descendants are shown three generations down. Every name opens that person's own sheet, so the tree can be walked in either direction.
const pid=x=>Array.isArray(x)?x[0]:x;
const GEN=['Father','Grandfather','Great-grandfather'];
const genLabel=n=>GEN[n-1]||(n+' generations back');
function fatherOf(e){const ps=(e.par||[]).map(pid).filter(j=>D[j]);return{f:ps.find(j=>D[j].ty==='Male')??ps[0]??null,rest:ps}}
function famTree(i){const e=D[i];if(e.t!=='p')return '';
 const up=[],seen=new Set([i]);let cur=i;
 while(up.length<60){const{f,rest}=fatherOf(D[cur]);if(f==null||seen.has(f))break;seen.add(f);up.push({f,m:rest.filter(j=>j!==f&&!seen.has(j))});cur=f}
 const sib=(e.sib||[]).map(pid).filter(j=>D[j]),sp=(e.ptr||[]).map(pid).filter(j=>D[j]),kids=(e.off||[]).map(pid).filter(j=>D[j]);
 if(!up.length&&!sib.length&&!sp.length&&!kids.length)return '';
 const row=(g,k)=>`<div class="ftg"><span class="ftgl">${genLabel(k+1)}</span><div class="ftgc">${chip(g.f)}${g.m.length?`<span class="ftm">with ${g.m.map(j=>chip(j)).join(' ')}</span>`:''}</div></div>`;
 const NEAR=6,near=up.slice(0,NEAR).map((g,k)=>row(g,k)).reverse().join(''),far=up.slice(NEAR).map((g,k)=>row(g,k+NEAR)).reverse().join('');
 const upH=up.length?`<div class="ftup">${far?`<details class="ftfar"><summary>${up.length-NEAR} earlier generation${up.length-NEAR===1?'':'s'} back to ${esc(D[up[up.length-1].f].n)}</summary>${far}</details>`:''}${near}</div>`:'';
 const meH=`<div class="ftg me"><span class="ftgl">${up.length?'This person':'Starting point'}</span><div class="ftgc"><span class="ftme">${esc(e.n)}</span>${sp.length?`<span class="ftm">married to ${sp.slice(0,8).map(j=>chip(j)).join(' ')}</span>`:''}</div></div>`;
 const sibH=sib.length?`<div class="ftsib"><span class="ftgl">Brothers and sisters</span><div class="nmcs">${sib.slice(0,16).map(j=>chip(j)).join('')}${sib.length>16?`<span class="mute"> +${sib.length-16} more</span>`:''}</div></div>`:'';
 const MAXD=3,CAP=14,sn=new Set([i]);
 const dn=(j,d)=>{const k=(D[j].off||[]).map(pid).filter(x=>D[x]&&!sn.has(x));const li=`<li>${chip(j,d===MAXD&&k.length?k.length+(k.length===1?' child':' children'):'')}`;
  if(d>=MAXD||!k.length)return li+'</li>';
  const shown=k.slice(0,CAP);shown.forEach(x=>sn.add(x));
  return li+`<ul>${shown.map(x=>dn(x,d+1)).join('')}${k.length>CAP?`<li class="mute">+${k.length-CAP} more</li>`:''}</ul></li>`};
 const kk=kids.filter(x=>!sn.has(x)).slice(0,CAP);kk.forEach(x=>sn.add(x));
 const dnH=kk.length?`<div class="ftdn"><span class="ftgl">Children and descendants</span><ul>${kk.map(x=>dn(x,1)).join('')}${kids.length>CAP?`<li class="mute">+${kids.length-CAP} more children</li>`:''}</ul></div>`:'';
 return `<div class="ft">${upH}${meH}${sibH}${dnH}<p class="nmsrc">Tap any name to open that person. Links come from the Tyndale (TIPNR) name data and follow the father’s line upward.</p></div>`}
// ---------- life story (character page): a person's life as a mini timeline ----------
// Sources: (1) dated events in events.json whose "who" list names the person (birth, death, calling, key moments);
// (2) the background note in names-bg.json, whose sentences and Scripture references fill any gap (birth, calling, key moments, death);
// (3) the person's own verse list (first and last mention). Every step links to the verse in the reader.
const ABB='Gen Exo Lev Num Deu Jos Jdg Rut 1Sa 2Sa 1Ki 2Ki 1Ch 2Ch Ezr Neh Est Job Psa Pro Ecc Sng Isa Jer Lam Ezk Dan Hos Jol Amo Oba Jon Mic Nam Hab Zep Hag Zec Mal Mat Mrk Luk Jhn Act Rom 1Co 2Co Gal Eph Php Col 1Th 2Th 1Ti 2Ti Tit Phm Heb Jas 1Pe 2Pe 1Jn 2Jn 3Jn Jud Rev'.split(' ');
const NRM=s=>String(s||'').replace(/\([^)]*\)/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
// Names used in events.json that differ from the name database
const WALIAS={'jesus christ':'jesus','simon peter':'peter','john the apostle':'john','john the baptist':'john','john mark':'mark','phillip the evangelist':'philip','phillip the apostle':'philip','timotheus':'timothy','portius festus':'festus','herod agrippa i':'herod','herod antipas':'herod','judas iscariot':'judas','jacob (israel)':'israel','levi (patriarch)':'levi','judah (patriarch)':'judah'};
let NIX=null;
const nameIx=()=>{if(NIX)return NIX;NIX=new Map();D.forEach((e,i)=>{if(e.t!=='p')return;const s=new Set([NRM(e.n)]);e.rw.forEach(r=>{if(r.alt)s.add(NRM(r.alt))});s.forEach(k=>{if(!k)return;const a=NIX.get(k);a?a.push(i):NIX.set(k,[i])})});return NIX};
const lowB=(a,x)=>{let l=0,h=a.length;while(l<h){const m=(l+h)>>1;a[m]<x?l=m+1:h=m}return l};
const evKey=e=>{const a=e.r[0],z=e.r[1]||a;return[vk(a[0],a[1],a[2]||1),vk(z[0],z[1],z[2]||999)]};
const overlaps=(i,e)=>{const r=refs(D[i]),[lo,hi]=evKey(e),j=lowB(r,lo);return j<r.length&&r[j]<=hi};
// does this event belong to person i? the name must match, and when several people share it the verses decide
function evPos(i,e){const ix=nameIx(),w=e.who||[];for(let p=0;p<w.length;p++){const k=WALIAS[String(w[p]).toLowerCase()]||NRM(w[p]),c=ix.get(k);if(!c||!c.includes(i))continue;
  if(c.length===1)return p;const ov=c.filter(j=>overlaps(j,e));
  if(ov.length){if(ov.includes(i))return p}else{const pr=c.filter(j=>NRM(D[j].n)===k);if(pr.length&&pr.reduce((a,j)=>refs(D[j]).length>refs(D[a]).length?j:a,pr[0])===i)return p}}return -1}
const yNum=s=>{const m=/(\d+)\s*(BC|AD)/i.exec(s||'');return m?(m[2].toUpperCase()==='BC'?-(+m[1]):+m[1]):null};
const yShow=s=>String(s||'').replace(/^about\s+/i,'c. ');
const rr=(b,c,v,c2,v2)=>({b,c,v:v||0,c2:c2||c,v2:v2||0});
const rLabel=x=>`${BIB[x.b][0]} ${x.c}${x.v?':'+x.v:''}${x.c2!==x.c?'\u2013'+x.c2+(x.v2?':'+x.v2:''):x.v2&&x.v2!==x.v?'\u2013'+x.v2:''}`;
const rKey=x=>vk(x.b,x.c,x.v||1);
// book names for plain-text references inside the background note (Genesis 12:1-3, 1Samuel 17, Psalms 3, 23, 51)
let PRE=null;
const prx=()=>{if(PRE)return PRE;const nm=BIB.map((x,b)=>[x[0],b]).concat([['Psalm',18],['Song of Songs',21]]).sort((a,b)=>b[0].length-a[0].length);
 PRE={map:new Map(nm.map(([n,b])=>[n.toLowerCase().replace(/\s+/g,''),b])),re:new RegExp('\\b('+nm.map(([n])=>n.replace(/^(\d) /,'$1 ?').replace(/ /g,'\\s+')).join('|')+')\\s+(\\d+)(?::(\\d+))?(?:\\s?[\u2013-]\\s?(\\d+)(?::(\\d+))?)?((?:,\\s*\\d+(?![\\d:]))*)','g')};return PRE};
function refsIn(t){const P=prx(),out=[];P.re.lastIndex=0;let m;
 while((m=P.re.exec(t))){const b=P.map.get(m[1].toLowerCase().replace(/\s+/g,''));if(b==null)continue;const c=+m[2];
  if(m[3]){const v=+m[3];if(m[5])out.push(rr(b,c,v,+m[4],+m[5]));else out.push(rr(b,c,v,c,m[4]?+m[4]:0))}
  else{out.push(rr(b,c,0,m[4]?+m[4]:c,0));(m[6]||'').split(',').map(x=>+x).filter(Boolean).forEach(c2=>out.push(rr(b,c2,0)))}}
 return out}
// the background note as plain sentences, each with the Scripture it cites
function bioSentences(i){const g=BG&&BG[i];const a=g&&g[1];if(!a)return[];
 const txt=String(a).replace(/<ref="([^"]*)">[^<]*<\/ref>/g,(m,r)=>{const p=r.split('.'),b=ABB.indexOf(p[0]);if(b<0||!+p[1])return '';return `${BIB[b][0]} ${p[1]}${p[2]?':'+p[2].replace(/^(\d+)-(\d+)$/,'$1\u2013$2'):''}`}).replace(/<BR>/gi,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
 return txt.split(/(?<=[.!?])\s+(?=[A-Z\u201C"(])/).map(t=>({t:t.trim(),r:refsIn(t)})).filter(x=>x.t.length>25)}
const RX_BIRTH=/\b(was born|were born|born (?:in|to|at|of|into|during|about|around|a )|his birth|her birth|his early life|her early life)\b/i;
const RX_CALL=/\b(called (?:him|her|by god)|was called|calling|commissioned|anointed|chosen|chose|appointed|appeared to (?:him|her)|summoned|conver(?:ted|sion)|ordained|raised up|set apart|sent by god|god sent|vision|baptized)\b/i;
const RX_DEATH=/\b(?:he|she|they)\b[^.;]{0,60}?\b(?:died|was (?:buried|killed|executed|stoned|slain|murdered|crucified|beheaded|assassinated|martyred|put to death))\b|\b(?:his|her) (?:death|burial|martyrdom|execution)\b|\bdied (?:in|at|of|after|during|when|as)\b|\bwas martyred\b|\bmartyred\b/i;
const short=(t,n)=>t.length>n?t.slice(0,n).replace(/\s+\S*$/,'')+'\u2026':t;
const KEYS=e=>{const s=new Set([NRM(e.n)]);e.rw.forEach(r=>{if(r.alt)s.add(NRM(r.alt))});return[...s].filter(x=>x.length>2)};
const hasName=(t,ks)=>{const l=t.toLowerCase();return ks.some(k=>new RegExp('\\b'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b').test(l))};
function lifeData(i){const e=D[i];if(!e||e.t!=='p'||(e.ty!=='Male'&&e.ty!=='Female'))return null;
 const ks=KEYS(e),R=refs(e),nodes=[];let span='';
 // 1) events
 const mine=EV?EV.map(x=>[x,x.r&&x.r.length?evPos(i,x):-1]).filter(([x,p])=>p>=0):[];
 let ba=null,da=null,ca=null;const mom=[];
 mine.forEach(([x,p])=>{const t=x.t,named=hasName(t,ks),lead=named||p===0;
  if(/^(Lifetime|Reign) of /.test(t)){if(named&&!span)span=`${t.replace(/ of .*/,'')}: ${[x.y&&yShow(x.y),x.d].filter(Boolean).join(' \u00B7 ')}`;return}
  if(/^Birth of /.test(t)&&named&&!ba){ba=x;return}
  if((/^(Death|Burial|Martyrdom|Execution|Crucifixion)\b|\bbeheaded\b|\bis stoned\b/i.test(t))&&lead&&!da){da=x;return}
  if(/call|commission|anoint|vision|bush|conver|chosen|appoint|ordain|baptis/i.test(t)&&!ca&&lead)ca=x;else mom.push([x,p])});
 const evNode=(st,x)=>({st,title:x.t,yr:x.y?yShow(x.y):'',sub:x.d||'',refs:[rr(x.r[0][0],x.r[0][1],x.r[0][2],(x.r[1]||x.r[0])[1],(x.r[1]||x.r[0])[2])],src:'ev'});
 // 2) the background note
 const bs=bioSentences(i),used=new Set();
 const bio=(st,s)=>({st,title:short(s.t,230),yr:'',sub:'',refs:s.r.slice(0,3),src:'bio'});
 let bB=null,bC=null,bD=null;
 if(!ba)for(let k=0;k<Math.min(4,bs.length);k++)if(RX_BIRTH.test(bs[k].t)&&!/gave birth|bore /i.test(bs[k].t)){bB=bs[k];used.add(k);break}
 if(!ca)for(let k=0;k<bs.length*.7;k++)if(!used.has(k)&&RX_CALL.test(bs[k].t)){bC=bs[k];used.add(k);break}
 if(!da)for(let k=bs.length-1;k>=Math.floor(bs.length*.3);k--)if(!used.has(k)&&RX_DEATH.test(bs[k].t)){bD=bs[k];used.add(k);break}
 const mineV=x=>{const lo=vk(x.b,x.c,x.v||1),hi=vk(x.b,x.c2,x.v2||999),j=lowB(R,lo);return j<R.length&&R[j]<=hi};
 const bm=[];bs.forEach((s,k)=>{if(!used.has(k)&&s.r.length&&s.t.length<400&&!/^(This|These|However|Additionally|Overall|Today|Furthermore|Despite|In (?:summary|conclusion))\b/.test(s.t)&&!/New Testament|prophecy was fulfilled|significance/i.test(s.t)&&s.r.some(mineV))bm.push(s)});
 // assemble: first mention / birth, calling, key moments (in the order of the Bible text), death / last mention
 const first=R.length?(()=>{const[b,c,v]=vp(R[0]);return{st:'first',title:'First mentioned in Scripture',yr:'',sub:'',refs:[rr(b,c,v)],src:'v'}})():null;
 const last=R.length>1?(()=>{const[b,c,v]=vp(R[R.length-1]);return{st:'last',title:'Last mentioned in Scripture',yr:'',sub:'',refs:[rr(b,c,v)],src:'v'}})():null;
 nodes.push(ba?evNode('birth',ba):bB?bio('birth',bB):first);
 if(ca)nodes.push(evNode('call',ca));else if(bC)nodes.push(bio('call',bC));
 const by0=ba?yNum(ba.y):null,prim=mom.filter(([x,p])=>p===0||hasName(x.t,ks)||(p===1&&(x.who||[]).length<=3)),use=(prim.length>=3?prim:mom).map(m=>m[0]).filter(x=>{const y=yNum(x.y);return !(by0!=null&&y!=null&&y<by0)});
 let mm=use.map(x=>evNode('moment',x));
 if(mm.length<3)mm=mm.concat(bm.slice(0,Math.max(0,7-mm.length)).map(s=>bio('moment',s)));
 mm.sort((a,b)=>rKey(a.refs[0])-rKey(b.refs[0]));
 const dn=da?evNode('death',da):bD?bio('death',bD):last;
 // a moment that repeats the calling or the death by its verses is dropped
 const dup=n=>nodes.concat(dn?[dn]:[]).some(o=>o!==n&&o.refs[0]&&n.refs[0]&&rKey(o.refs[0])===rKey(n.refs[0]));
 mm=mm.filter(n=>!dup(n));
 // when the calling comes first in the text it goes first; otherwise the verse order decides
 const out=nodes.filter(Boolean).concat(mm);if(dn)out.push(dn);
 const by=ba&&da?[yNum(ba.y),yNum(da.y)]:null;
 if(by&&by[0]!=null&&by[1]!=null){const n=Math.abs(by[1]-by[0]);span=`${yShow(ba.y)} \u2013 ${yShow(da.y)} \u00B7 about ${n} years`+(span?' \u00B7 '+span:'')}
 if(!span){const x=BG&&BG[i]&&BG[i][2]&&BG[i][2].yr;if(x)span=String(x)}
 return{span,nodes:out,count:R.length}}
const LBL={birth:'Birth',call:'Calling',moment:'Key moment',death:'Death',first:'First mention',last:'Last mention'};
function lifeHtml(i){const e=D[i];if(!e||e.t!=='p'||(e.ty!=='Male'&&e.ty!=='Female'))return '';
 if(BG===null||EV===null)return '<p class="mute">Loading life story\u2026</p>';
 const L=lifeData(i);if(!L||!L.nodes.length)return '';
 const node=n=>{const f=n.refs[0],t=f?NM.cfg.text(f.b,f.c,f.v||1):'';
  return `<li class="lfn ${n.st}"><span class="lfk">${LBL[n.st]}</span><div class="lfb"><div class="lft">${esc(n.title)}</div>${n.yr||n.sub?`<div class="lfy">${esc([n.yr,n.sub].filter(Boolean).join(' \u00B7 '))}</div>`:''}\n  ${t?`<div class="lfq">${esc(short(t,170))}</div>`:''}<div class="lfr">${n.refs.map(x=>`<button class="nmvl nmin" data-nmgo="${x.b}:${x.c}:${x.v||1}">${esc(rLabel(x))}</button>`).join('')}</div></div></li>`};
 const mo=L.nodes.filter(n=>n.st==='moment'),head=L.nodes.filter(n=>n.st!=='moment'&&n.st!=='death'&&n.st!=='last'),tail=L.nodes.filter(n=>n.st==='death'||n.st==='last');
 const CAP=8,shown=mo.slice(0,CAP),rest=mo.slice(CAP);
 return `<div class="lf">${L.span?`<p class="lfspan">${esc(L.span)}</p>`:''}<ol class="lfl">${head.map(node).join('')}${shown.map(node).join('')}${rest.length?`<li class="lfmore"><details><summary>${rest.length} more key moment${rest.length===1?'':'s'}</summary><ol class="lfl">${rest.map(node).join('')}</ol></details></li>`:''}${tail.map(node).join('')}</ol>
  <p class="lfall"><button type="button" class="nmc" data-nmjump="vs">All ${L.count} verse${L.count===1?'':'s'} \u2193</button></p>
  <p class="nmsrc">Dates and events come from Theographic (CC BY-SA 4.0). Steps marked from the background note are AI-assisted summaries (STEPBible, Tyndale House) matched to the verses they cite; check them against the text.</p></div>`}
const fillLife=i=>{const b=sheet&&i>=0&&stack[stack.length-1]===i&&sheet.querySelector('.nmlife');if(b)b.innerHTML=lifeHtml(i)};
NM.life=lifeData;
function mapLink(e){const q=ll(e);return q?`<a class="btn nmmap" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${q[0]},${q[1]}">Open on map ↗</a> <span class="mute">${q[0]}°, ${q[1]}° (approximate, from OpenBible geolocation)</span>`:''}
function related(i){const e=D[i],cnt=new Map(),rs=refs(e);rs.forEach(k=>(IDX.get(k)||[]).forEach(([j])=>{if(j!==i&&D[j].t!=='o')cnt.set(j,(cnt.get(j)||0)+1)}));
 const fam=new Set([...(e.par||[]),...(e.sib||[]),...(e.ptr||[]),...(e.off||[]),...(e.fd||[]),...(e.pp||[])].map(x=>Array.isArray(x)?x[0]:x));
 const top=[...cnt.entries()].filter(([j,c])=>c>=2&&!fam.has(j)).map(([j,c])=>[j,c,c/Math.sqrt(refs(D[j]).length)]).sort((a,b)=>b[2]-a[2]).slice(0,10);
 return top.length?`<p class="mute">People and places that appear in the same verses as ${esc(e.n)}.</p><div class="nmcs">${top.map(([j,c])=>chip(j,c+'×')).join('')}</div>`:''}
const byBook=e=>{const by=new Map();refs(e).forEach(k=>{const b=Math.floor(k/1e6);(by.get(b)||by.set(b,[]).get(b)).push(k)});return by};
function verses(i){const e=D[i],rs=refs(e),by=byBook(e),open=rs.length<=40;
 return `<p class="mute">${rs.length} verse${rs.length===1?'':'s'} in ${by.size} book${by.size===1?'':'s'}. Tap a verse to read it in the Bible.</p>`+[...by.entries()].map(([b,ks],n)=>{const o=open||n===0&&rs.length<=120;return `<details class="nmb" data-b="${b}" ${o?'open data-done="1"':''}><summary>${esc(BIB[b][0])} <span class="nmtag">${ks.length}</span></summary><div class="nmvs">${o?vlist(ks):''}</div></details>`}).join('')}
function vlist(ks){return ks.slice(0,300).map(k=>{const[b,c,v]=vp(k),t=NM.cfg.text(b,c,v);return `<button class="nmvl" data-nmgo="${b}:${c}:${v}"><b>${c}:${v}</b>${t?`<span>${esc(t)}</span>`:''}</button>`}).join('')+(ks.length>300?`<p class="mute">Showing the first 300 of ${ks.length}.</p>`:'')}
function bgHtml(i){const e=D[i];if(BG===null)return '<p class="mute">Loading background…</p>';const g=BG&&BG[i]||['',''],sh=g[0],ar=g[1],x=g[2]||{};
 const one=x.sum||sh||e.br||e.bf||'';if(!one&&!ar&&!x.ea)return '<p class="mute">No background note is available for this name.</p>';
 const T=t=>esc(String(t).replace(/<[^>]+>/g,'').trim());
 return (one?`<p class="nmsum">${esc(one)}</p>`:'')+(x.yr?`<p><b>When:</b> ${esc(x.yr)}</p>`:'')+(x.nt?`<p>${esc(x.nt)}</p>`:'')
  +(ar?ar.split(/<BR>/i).map(p=>`<p>${T(p)}</p>`).join('')+`<p class="nmsrc">Background notes are AI-assisted summaries supplied with the STEPBible name database (Tyndale House). Check them against the linked verses.</p>`:'')
  +(x.ea?`<details class="nmea"><summary>Easton’s Bible Dictionary (1897)</summary><p>${T(x.ea)}</p><p class="nmsrc">Public-domain text, older wording; matched to this person by name and verses.</p></details>`:'')}
function detail(i,ri){const e=D[i],n=refs(e).length,r0=ri!=null?e.rw[ri]:null,al=r0&&r0.alt,title=al?r0.alt:e.n,mean=r0?rowMean(e,r0):e.m;
 const altH=alts&&alts.length>1?`<div class="nmalt"><span class="mute">Same name in this verse:</span> ${alts.map(z=>`<button class="nmc ${z.i===i?'on':''} n-${D[z.i].t}" data-nmo="${z.i}.${z.ri}" data-keep="1">${esc(kind(D[z.i]))}${D[z.i].d?' · '+esc(D[z.i].d.replace(/ living at the time of /,' · ')):''}</button>`).join('')}</div>`:'';
 return `<div class="nmhd"><button class="g s" data-nmback ${stack.length>1?'':'hidden'}>‹ Back</button><span class="grow"></span><button class="g s" data-nmx aria-label="Close">✕</button></div>
 <div class="nmbody"><div class="nmtitle"><h2>${esc(title)}</h2><span class="nmtag big">${esc(kind(e))}</span></div>
 <p class="nmsub">${al?`Another name for <b>${esc(e.n)}</b>. `:''}${esc(e.t==='l'?[e.ar&&'Region: '+e.ar,e.ty&&e.ty!=='Place'?e.ty:''].filter(Boolean).join(' · '):e.d||'')}${e.t==='p'&&e.tr?' · '+esc(e.tr):''}</p>${altH}
 ${ll(e)?`<p class="nmatlr"><button type="button" class="s nmatl" data-atlp="${i}">📍 Show on map</button></p>`:''}
 ${mean?`<div class="nmmean"><span>Meaning of the name${al?' “'+esc(title)+'”':''}</span><b>${esc(mean)}</b></div>`:''}
 ${sec('Name in the original languages',forms(e,ri))}
 ${sec('Also called',alsoCalled(e))}
 ${sec('Root word and root meaning',roots(e,r0))}
 ${sec('Background',`<div class="nmbg">${bgHtml(i)}</div>${e.t==='l'?mapLink(e):''}`)}
 ${e.t==='p'&&(e.ty==='Male'||e.ty==='Female')?sec('Life story','<div class="nmlife">'+lifeHtml(i)+'</div>','lfs'):''}
 ${e.t==='p'?sec('Family tree',famTree(i)):''}
 ${sec(e.t==='l'?'People and places connected':'Family and connections',family(e))}
 ${sec('Related people and places',related(i))}
 ${sec('Linked verses ('+n+')',verses(i),'vs')}
 <p class="nmsrc">Sources: STEPBible TIPNR and lexicons (Tyndale House, CC BY 4.0); Strong's Dictionary (Open Scriptures, CC BY-SA); Easton’s Bible Dictionary and Theographic (CC BY-SA 4.0); OpenBible geolocation.</p></div>`}
const evRow=(l,h)=>h?`<div class="nmevr"><b>${l}</b><div>${h}</div></div>`:'';
const EVRE=new RegExp('\\b('+BIB.map(x=>x[0]).sort((a,b)=>b.length-a.length).join('|')+') (\\d+):(\\d+)(?:[–-]\\d+)?','g');
const evLink=t=>esc(t).replace(EVRE,(m,n,c,v)=>{const b=BIB.findIndex(x=>x[0]===n);return `<button class="nmvl nmin" data-nmgo="${b}:${c}:${v}">${m}</button>`});
const evChip=n=>{const i=nameIdx(n);return i!=null?chip(i):esc(n)};
const evRng=r=>{const a=r[0],b=r[1];return `<button class="nmvl nmin" data-nmgo="${a[0]}:${a[1]}:${a[2]}">${esc(BIB[a[0]][0])} ${a[1]}:${a[2]}${a[1]===b[1]&&a[2]===b[2]?'':'–'+(a[1]===b[1]?'':b[1]+':')+b[2]}</button>`};
const evOne=(e,o,n)=>`<details class="nmev"${o?' open':''}><summary>${e.c?'📖':'📌'} <b>${esc(e.t)}</b></summary>`
 +evRow('When',esc([e.y&&(e.c?e.y:'about '+e.y),e.d].filter(Boolean).join(' · ')))+(e.sec||[]).map(([l,t])=>evRow(esc(l),evLink(t))).join('')
 +(n!=null&&(e.r||(e.at||[]).length)?`<div class="nmevr"><button type="button" class="s nmatl" data-atle="${n}">📍 Passage and map</button></div>`:'')+evRow('Who',(e.who||[]).map(evChip).join(' '))+evRow('Where',(e.at||[]).map(evChip).join(' '))+evRow('Part of',esc((e.po||[]).join(', ')))+evRow('Includes',esc((e.in||[]).join(' · ')))
 +evRow('Happened before',esc((e.pre||[]).join(', ')))+evRow('Happened after',esc((e.nx||[]).join(', ')))+(e.r?evRow('Passage',evRng(e.r)):'')+'</details>';
const evHtml=k=>{const[b,c,v]=k.split('.').map(Number),ix=(VM&&VM[k]||[]).slice(0,4);
 return `<div class="nmhd"><button class="g s" data-nmback ${stack.length>1?'':'hidden'}>‹ Back</button><span class="grow"></span><button class="g s" data-nmx aria-label="Close">✕</button></div>
 <div class="nmbody"><div class="nmtitle"><h2>${esc(BIB[b][0])} ${c}:${v}</h2><span class="nmtag big">What is happening here</span></div>${ix.map((n,j)=>evOne(EV[n],j===0,n)).join('')}
 <p class="nmsrc">📖 summaries are written from the Scripture text. 📌 events, people and places come from Theographic (CC BY-SA 4.0); dates are approximate scholarly estimates.</p></div>`};
let EVK=[];
NM.openEv=k=>{if(!EV||!VM||!VM[k])return;hidePop();
 if(!sheet){sheet=document.createElement('div');sheet.className='nmsheet';sheet.innerHTML='<div class="nmscrim" data-nmx></div><div class="nmpanel" role="dialog" aria-modal="true" aria-label="Verse events" tabindex="-1"></div>';document.body.appendChild(sheet);document.body.classList.add('nmlock')}
 stack=[-1];RI=[undefined];EVK=[k];draw();sheet.querySelector('.nmpanel').focus({preventScroll:true})};
const draw=()=>{if(!sheet)return;const i=stack[stack.length-1];if(i<0){const p=sheet.querySelector('.nmpanel');p.innerHTML=evHtml(EVK[0]);p.scrollTop=0;return}sheet.querySelector('.nmpanel').innerHTML=detail(i,RI[RI.length-1]);sheet.querySelector('.nmpanel').scrollTop=0};
NM.open=(i,a,ri)=>{if(!D||!D[i])return;hidePop();
 if(!sheet){sheet=document.createElement('div');sheet.className='nmsheet';sheet.innerHTML='<div class="nmscrim" data-nmx></div><div class="nmpanel" role="dialog" aria-modal="true" aria-label="Name details" tabindex="-1"></div>';document.body.appendChild(sheet);document.body.classList.add('nmlock')}
 alts=a||null;stack.push(i);RI.push(ri);draw();sheet.querySelector('.nmpanel').focus({preventScroll:true});loadBg(()=>{if(sheet&&stack[stack.length-1]===i){const b=sheet.querySelector('.nmbg');if(b)b.innerHTML=bgHtml(i);fillLife(i)}})};
NM.close=()=>{if(sheet){sheet.remove();sheet=null}stack=[];RI=[];EVK=[];alts=null;document.body.classList.remove('nmlock');hidePop()};
const fillBg=i=>i<0?0:loadBg(()=>{const b=sheet&&stack[stack.length-1]===i&&sheet.querySelector('.nmbg');if(b)b.innerHTML=bgHtml(i);fillLife(i)});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.nm,sup.evm,[data-nmo],[data-nmx],[data-nmback],[data-nmgo],[data-nmjump]');if(!t)return;
 const stop=()=>{e.preventDefault();e.stopPropagation()};
 if(t.matches('sup.evm')){stop();NM.openEv(t.dataset.ev);return}
 if(t.classList.contains('nm')){stop();const ids=parse(t.dataset.nm);stack=[];RI=[];NM.open(ids[0].i,ids,ids[0].ri);return}
 if(t.hasAttribute('data-nmx')){stop();NM.close();return}
 if(t.hasAttribute('data-nmback')){stop();stack.pop();RI.pop();alts=null;draw();fillBg(stack[stack.length-1]);return}
 if(t.dataset.nmjump){stop();const vs=sheet&&sheet.querySelector('.nms.vs');if(vs){const d=vs.querySelector('details.nmb');if(d&&!d.open)d.open=true;vs.scrollIntoView({behavior:'smooth',block:'start'})}return}
  if(t.dataset.nmgo){stop();const[b,c,v]=t.dataset.nmgo.split(':').map(Number);NM.close();NM.cfg.go(b,c,v);return}
 if(t.dataset.nmo!=null){stop();const[ia,ib]=t.dataset.nmo.split('.'),i=+ia,ri=ib==null||ib===''?undefined:+ib;
  if(t.dataset.keep){stack[stack.length-1]=i;RI[RI.length-1]=ri;draw();fillBg(i)}      // switching between same-name candidates
  else if(sheet)NM.open(i);                                           // moving on to a relative or related place
  else{stack=[];RI=[];NM.open(i)}}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(sheet)NM.close();else hidePop()}else if((e.key==='Enter'||e.key===' ')&&e.target.classList&&(e.target.classList.contains('nm')||e.target.matches('sup.evm'))){e.preventDefault();e.target.click()}});
// verse lists inside a collapsed book are filled the first time it is opened
document.addEventListener('toggle',e=>{const d=e.target;if(!d.classList||!d.classList.contains('nmb')||!d.open||d.dataset.done)return;d.dataset.done=1;
 const i=stack[stack.length-1],ks=(byBook(D[i]).get(+d.dataset.b)||[]);d.querySelector('.nmvs').innerHTML=vlist(ks)},true);
NM.names=i=>D&&D[i];NM.chip=i=>D?chip(i):'';NM.idx=nameIdx;NM.ll=ll;NM.refs=i=>D&&D[i]?refs(D[i]):[];
})();