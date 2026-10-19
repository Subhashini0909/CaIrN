// Names and places for the Study tab: hover/tap cards inside KJV verses and a full detail sheet.
// Data: names.json (+ names-bg.json, loaded only when a sheet opens). Built from STEPBible TIPNR (Tyndale House, CC BY 4.0),
// STEPBible TBESH/TBESG lexicons (CC BY 4.0) and Strong's Dictionary (Open Scriptures, CC BY-SA). Easton's Bible Dictionary text and
// verse events come from events.json / names-bg.json (Theographic, CC BY-SA 4.0).
(()=>{
const NM=window.NM={cfg:{text:()=>null,go:()=>{}}};
let D=null,LX={},BG=null,busy=0,bgBusy=0;const waiting=[],IDX=new Map(),VC=new Map();
const TYPE={Male:'Man',Female:'Woman',Group:'People or group',Place:'Place',Supernatural:'Supernatural',Time:'Festival or month',Title:'Title',Language:'Language',Musical:'Musical term',Star:'Star or constellation',Other:'Other'};
const kind=e=>e.t==='l'?'Place':e.t==='p'?(TYPE[e.ty]||'Person'):(TYPE[e.ty]||'Name');
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
const loadEv=()=>{if(EV||evBusy)return;evBusy=1;fetch('events.json').then(r=>r.json()).then(j=>{EV=j.e;VM=j.v;evBusy=0;if(NM.cfg.refresh)NM.cfg.refresh()}).catch(()=>{evBusy=0})};
const nameIdx=n=>{if(!D)return null;if(!BYN){BYN=new Map();D.forEach((e,i)=>{const c=BYN.get(e.n);if(c==null||refs(D[c]).length<refs(e).length)BYN.set(e.n,i)})}const i=BYN.get(n);return i==null?null:i};
NM.ev=(b,c,v)=>{if(!VM)return '';const k=b+'.'+c+'.'+v;return VM[k]?` class="evm" data-ev="${k}" tabindex="0" role="button" title="What is happening in this verse"`:''};
const loadBg=cb=>{if(BG)return cb();if(bgBusy)return;bgBusy=1;fetch('names-bg.json').then(r=>r.json()).then(j=>{BG=j;bgBusy=0;cb()}).catch(()=>{bgBusy=0;BG=false;cb()})};

// ---------- matching names inside a KJV verse ----------
const L='A-Za-z\\u00C0-\\u024F',RC=new Map();
const rx=(f,ci)=>{const k=(ci?'i:':'s:')+f;let r=RC.get(k);if(!r){r=new RegExp(`(^|[^${L}])(${f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})(s|es)?(?:['\u2019]s?)?(?![${L}])`,ci?'gi':'g');RC.set(k,r)}r.lastIndex=0;return r};
function spans(b,c,v,text){const key=vk(b,c,v),pr=IDX.get(key);if(!pr)return[];const raw=[];
 pr.forEach(([i,ri])=>{const e=D[i],r=e.rw[ri];let hit=0;
  for(let pass=0;pass<2&&!hit;pass++)for(const f of r.k){if(f.length<2||(pass&&f.length<5&&e.t!=='o'))continue;const re=rx(f,pass);let m;
   while((m=re.exec(text))){const s=m.index+m[1].length,en=s+m[2].length+(m[3]||'').length;raw.push({s,e:en,i,ri});hit=1;if(m[0]===''){re.lastIndex++}}}});
 // identical spans share one marker (several people or places with the same name); longer spans beat shorter overlapping ones
 const g=new Map();raw.forEach(x=>{const k=x.s+':'+x.e,o=g.get(k);if(o){if(!o.ids.some(z=>z.i===x.i))o.ids.push({i:x.i,ri:x.ri})}else g.set(k,{s:x.s,e:x.e,ids:[{i:x.i,ri:x.ri}]})});
 const all=[...g.values()].sort((a,b)=>a.s-b.s||(b.e-b.s)-(a.e-a.s)),out=[];let end=-1;
 all.forEach(x=>{if(x.s>=end){out.push(x);end=x.e}});
 out.forEach(x=>x.ids.sort((a,b)=>refs(D[b.i]).length-refs(D[a.i]).length));return out}
NM.mark=(b,c,v,text)=>{if(!D)return esc(text);const key=vk(b,c,v)+':'+text;let h=VC.get(key);if(h!=null)return h;
 const sp=spans(b,c,v,text);if(!sp.length){VC.set(key,esc(text));return esc(text)}
 h='';let p=0;sp.forEach(x=>{h+=esc(text.slice(p,x.s))+`<span class="nm n-${D[x.ids[0].i].t}" data-nm="${x.ids.map(z=>z.i+'.'+z.ri).join(',')}" tabindex="0" role="button">${esc(text.slice(x.s,x.e))}</span>`;p=x.e});
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
const popHtml=(its,txt)=>{const{i,ri}=its[0],e=D[i],r=e.rw[ri],n=refs(e).length,l=lang(r),ml=rowMean(e,r)||(r.alt?rowDef(r):'');
 const other=formLine(e).split('</span>').length>1&&!r.alt?formLine(e):'';
 return `<div class="nmp-h"><b>${esc(txt)}</b><span class="nmtag">${esc(kind(e))}</span></div>${r.alt||txt!==e.n&&!txt.startsWith(e.n)?`<div class="nmp-s">${r.alt?'Also known as':'Entry'}: ${esc(e.n)}</div>`:''}
 ${e.d||e.ar?`<div class="nmp-s">${esc(e.t==='l'?(e.ar?'Region: '+e.ar:''):e.d)}</div>`:''}
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
function roots(e,r0){const cs=[...(r0&&r0.alt&&r0.s?[r0.s]:[]),...(e.lx||[])].filter((c,x,a)=>a.indexOf(c)===x);const items=cs.map(c=>[c,LX[c]]).filter(x=>x[1]);if(!items.length)return '';
 return items.map(([c,it])=>{const l=isH(c)?'Hebrew':'Greek',dv=fixc(it.dv||'');
  const ro=(it.ro||[]).map(rc=>{const r=LX[rc];if(!r)return '';const rl=isH(rc)?'Hebrew':'Greek';return `<div class="nmroot"><div>${scr(r.w,rl)} <i>${esc(r.x)}</i> <span class="nmtag">${fixc(rc)}</span></div><div><b>Root meaning:</b> ${esc(r.d)}</div>${r.k?`<div class="mute">Rendered in the KJV as: ${esc(r.k)}</div>`:''}</div>`}).join('');
  const none=!ro&&/primary|uncertain|foreign|origin/.test(dv);
  return `<div class="nmx"><div class="nmxh">${scr(it.w,l)} <i>${esc(it.x)}</i>${it.p?` <span class="mute">/${esc(it.p)}/</span>`:''} <span class="lg">${l}</span> <span class="nmtag">${fixc(c)}</span></div>
  ${it.d?`<p><b>Strong's definition:</b> ${esc(it.d)}</p>`:''}${it.k?`<p class="mute">KJV: ${esc(it.k)}</p>`:''}
  ${dv?`<p><b>Root word (derivation):</b> ${esc(dv)}${none?'':''}</p>`:''}${ro}</div>`}).join('')}
function family(e){let h='';
 if(e.t==='p'){h+=row('Tribe or nation',esc(e.tr||''));h+=row('Parents',relChips(e.par,FL));h+=row('Brothers and sisters',relChips(e.sib,FL));h+=row('Spouse',relChips(e.ptr,FL));h+=row('Children',relChips(e.off,FL))}
 else if(e.t==='l'){h+=row('Region',esc(e.ar||''));h+=row('Founded or built by',relChips(e.fd,FL));h+=row('People who lived there',relChips(e.pp,FL))}
 return h}
function mapLink(e){return e.ll?`<a class="btn nmmap" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${e.ll[0]},${e.ll[1]}">Open on map ↗</a> <span class="mute">${e.ll[0]}°, ${e.ll[1]}° (approximate, from OpenBible geolocation)</span>`:''}
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
 ${mean?`<div class="nmmean"><span>Meaning of the name${al?' “'+esc(title)+'”':''}</span><b>${esc(mean)}</b></div>`:''}
 ${sec('Name in the original languages',forms(e,ri))}
 ${sec('Also called',alsoCalled(e))}
 ${sec('Root word and root meaning',roots(e,r0))}
 ${sec('Background',`<div class="nmbg">${bgHtml(i)}</div>${e.t==='l'?mapLink(e):''}`)}
 ${sec(e.t==='l'?'People and places connected':'Family and connections',family(e))}
 ${sec('Related people and places',related(i))}
 ${sec('Linked verses ('+n+')',verses(i),'vs')}
 <p class="nmsrc">Sources: STEPBible TIPNR and lexicons (Tyndale House, CC BY 4.0); Strong's Dictionary (Open Scriptures, CC BY-SA); Easton’s Bible Dictionary and Theographic (CC BY-SA 4.0); OpenBible geolocation.</p></div>`}
const evRow=(l,h)=>h?`<div class="nmevr"><b>${l}</b><div>${h}</div></div>`:'';
const EVRE=new RegExp('\\b('+BIB.map(x=>x[0]).sort((a,b)=>b.length-a.length).join('|')+') (\\d+):(\\d+)(?:[–-]\\d+)?','g');
const evLink=t=>esc(t).replace(EVRE,(m,n,c,v)=>{const b=BIB.findIndex(x=>x[0]===n);return `<button class="nmvl nmin" data-nmgo="${b}:${c}:${v}">${m}</button>`});
const evChip=n=>{const i=nameIdx(n);return i!=null?chip(i):esc(n)};
const evRng=r=>{const a=r[0],b=r[1];return `<button class="nmvl nmin" data-nmgo="${a[0]}:${a[1]}:${a[2]}">${esc(BIB[a[0]][0])} ${a[1]}:${a[2]}${a[1]===b[1]&&a[2]===b[2]?'':'–'+(a[1]===b[1]?'':b[1]+':')+b[2]}</button>`};
const evOne=(e,o)=>`<details class="nmev"${o?' open':''}><summary>${e.c?'📖':'📌'} <b>${esc(e.t)}</b></summary>`
 +evRow('When',esc([e.y&&(e.c?e.y:'about '+e.y),e.d].filter(Boolean).join(' · ')))+(e.sec||[]).map(([l,t])=>evRow(esc(l),evLink(t))).join('')
 +evRow('Who',(e.who||[]).map(evChip).join(' '))+evRow('Where',(e.at||[]).map(evChip).join(' '))+evRow('Part of',esc((e.po||[]).join(', ')))+evRow('Includes',esc((e.in||[]).join(' · ')))
 +evRow('Happened before',esc((e.pre||[]).join(', ')))+evRow('Happened after',esc((e.nx||[]).join(', ')))+(e.r?evRow('Passage',evRng(e.r)):'')+'</details>';
const evHtml=k=>{const[b,c,v]=k.split('.').map(Number),ix=(VM&&VM[k]||[]).slice(0,4);
 return `<div class="nmhd"><button class="g s" data-nmback ${stack.length>1?'':'hidden'}>‹ Back</button><span class="grow"></span><button class="g s" data-nmx aria-label="Close">✕</button></div>
 <div class="nmbody"><div class="nmtitle"><h2>${esc(BIB[b][0])} ${c}:${v}</h2><span class="nmtag big">What is happening here</span></div>${ix.map((n,j)=>evOne(EV[n],j===0)).join('')}
 <p class="nmsrc">📖 summaries are written from the Scripture text. 📌 events, people and places come from Theographic (CC BY-SA 4.0); dates are approximate scholarly estimates.</p></div>`};
let EVK=[];
NM.openEv=k=>{if(!EV||!VM||!VM[k])return;hidePop();
 if(!sheet){sheet=document.createElement('div');sheet.className='nmsheet';sheet.innerHTML='<div class="nmscrim" data-nmx></div><div class="nmpanel" role="dialog" aria-modal="true" aria-label="Verse events" tabindex="-1"></div>';document.body.appendChild(sheet);document.body.classList.add('nmlock')}
 stack=[-1];RI=[undefined];EVK=[k];draw();sheet.querySelector('.nmpanel').focus({preventScroll:true})};
const draw=()=>{if(!sheet)return;const i=stack[stack.length-1];if(i<0){const p=sheet.querySelector('.nmpanel');p.innerHTML=evHtml(EVK[0]);p.scrollTop=0;return}sheet.querySelector('.nmpanel').innerHTML=detail(i,RI[RI.length-1]);sheet.querySelector('.nmpanel').scrollTop=0};
NM.open=(i,a,ri)=>{if(!D||!D[i])return;hidePop();
 if(!sheet){sheet=document.createElement('div');sheet.className='nmsheet';sheet.innerHTML='<div class="nmscrim" data-nmx></div><div class="nmpanel" role="dialog" aria-modal="true" aria-label="Name details" tabindex="-1"></div>';document.body.appendChild(sheet);document.body.classList.add('nmlock')}
 alts=a||null;stack.push(i);RI.push(ri);draw();sheet.querySelector('.nmpanel').focus({preventScroll:true});loadBg(()=>{if(sheet&&stack[stack.length-1]===i){const b=sheet.querySelector('.nmbg');if(b)b.innerHTML=bgHtml(i)}})};
NM.close=()=>{if(sheet){sheet.remove();sheet=null}stack=[];RI=[];EVK=[];alts=null;document.body.classList.remove('nmlock');hidePop()};
const fillBg=i=>i<0?0:loadBg(()=>{const b=sheet&&stack[stack.length-1]===i&&sheet.querySelector('.nmbg');if(b)b.innerHTML=bgHtml(i)});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.nm,sup.evm,[data-nmo],[data-nmx],[data-nmback],[data-nmgo]');if(!t)return;
 const stop=()=>{e.preventDefault();e.stopPropagation()};
 if(t.matches('sup.evm')){stop();NM.openEv(t.dataset.ev);return}
 if(t.classList.contains('nm')){stop();const ids=parse(t.dataset.nm);stack=[];RI=[];NM.open(ids[0].i,ids,ids[0].ri);return}
 if(t.hasAttribute('data-nmx')){stop();NM.close();return}
 if(t.hasAttribute('data-nmback')){stop();stack.pop();RI.pop();alts=null;draw();fillBg(stack[stack.length-1]);return}
 if(t.dataset.nmgo){stop();const[b,c,v]=t.dataset.nmgo.split(':').map(Number);NM.close();NM.cfg.go(b,c,v);return}
 if(t.dataset.nmo!=null){stop();const[ia,ib]=t.dataset.nmo.split('.'),i=+ia,ri=ib==null||ib===''?undefined:+ib;
  if(t.dataset.keep){stack[stack.length-1]=i;RI[RI.length-1]=ri;draw();fillBg(i)}      // switching between same-name candidates
  else if(sheet)NM.open(i);                                           // moving on to a relative or related place
  else{stack=[];RI=[];NM.open(i)}}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(sheet)NM.close();else hidePop()}else if((e.key==='Enter'||e.key===' ')&&e.target.classList&&(e.target.classList.contains('nm')||e.target.matches('sup.evm'))){e.preventDefault();e.target.click()}});
// verse lists inside a collapsed book are filled the first time it is opened
document.addEventListener('toggle',e=>{const d=e.target;if(!d.classList||!d.classList.contains('nmb')||!d.open||d.dataset.done)return;d.dataset.done=1;
 const i=stack[stack.length-1],ks=(byBook(D[i]).get(+d.dataset.b)||[]);d.querySelector('.nmvs').innerHTML=vlist(ks)},true);
NM.names=i=>D&&D[i];NM.chip=i=>D?chip(i):'';
})();