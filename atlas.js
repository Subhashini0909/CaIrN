/* Atlas: connects verses, places, the map and the timeline.
   - Tap a place name in a verse > Place sheet > "Show on map": opens this map on that place.
   - Tap an event (timeline, or the ⓘ next to a verse number) > passage text + the places where it happened, on the map.
   - Tap a place name inside a passage, or a place chip, and the map jumps to it.
   - The Map button in the reader shows every place of the chapter, with the chapter's events listed below.
   Data: place positions from names.json (OpenBible geolocation), events from events.json (Theographic, CC BY-SA 4.0).
   Map: Esri tiles when online; the drawn map (maps.js) when offline. Needs names.js (NM). */
(()=>{
const NM=window.NM;if(!NM)return;
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const TILES={topo:['Satellite','https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}','Tiles \u00A9 Esri, HERE, Garmin, USGS, NGA'],sat:['Terrain','https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}','Tiles \u00A9 Esri, Maxar, Earthstar Geographics']};
const mx=(lon,z)=>(lon+180)/360*256*2**z,my=(lat,z)=>{const r=lat*Math.PI/180;return (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*256*2**z};
const vkb=k=>Math.floor(k/1e6),vkc=k=>Math.floor(k%1e6/1e3),vkv=k=>k%1e3;

// ---------- data ----------
let EVJ=null,EVP=null,AT=null;
const loadEv=cb=>{if(EVJ!==null)return cb();(EVP=EVP||fetch('events.json').then(r=>r.json()).then(j=>{EVJ=j}).catch(()=>{EVJ=false})).then(()=>cb())};
const atIdx=()=>{if(AT)return AT;AT=new Map();if(EVJ)EVJ.e.forEach((e,k)=>(e.at||[]).forEach(n=>{(AT.get(n)||AT.set(n,[]).get(n)).push(k)}));return AT};
const P=i=>{const e=NM.names(i),q=NM.ll(e);return q?{i,n:e.n,lat:q[0],lon:q[1],e}:null};
const byName=n=>{const i=NM.idx(n);return i==null?null:P(i)};
const chapterPlaces=(b,c)=>{const n=NM.cfg.vc?NM.cfg.vc(b,c):0;const G=NM.chapter(b,c,n);return G?G.l.map(P).filter(Boolean):[]};
const chapterEvents=(b,c)=>{if(!EVJ)return[];const n=NM.cfg.vc?NM.cfg.vc(b,c):0,seen=new Set(),out=[];for(let v=1;v<=n;v++)(EVJ.v[b+'.'+c+'.'+v]||[]).forEach(k=>{if(!seen.has(k)&&EVJ.e[k]&&!/^Lifetime of /.test(EVJ.e[k].t)){seen.add(k);out.push([k,v])}});return out};
const evPlaces=k=>{const e=EVJ&&EVJ.e[k];return e?(e.at||[]).map(byName).filter(Boolean):[]};
const refText=r=>{const a=r[0],z=r[1];return `${BIB[a[0]][0]} ${a[1]}:${a[2]}`+(a[0]===z[0]&&a[1]===z[1]&&a[2]===z[2]?'':a[0]!==z[0]?'':'\u2013'+(a[1]===z[1]?'':z[1]+':')+z[2])};
// verses of an event, from its first verse; stops at the end of the range, or at the end of the first chapter when the range crosses books
function passage(r,max){const a=r[0],z=r[1],out=[];let b=a[0],c=a[1],v=a[2];const cross=a[0]!==z[0];
 while(out.length<max){const t=NM.cfg.text(b,c,v);if(t==null)break;out.push([b,c,v,t]);if(b===z[0]&&c===z[1]&&v===z[2])break;
  v++;if(v>(NM.cfg.vc?NM.cfg.vc(b,c):0)){if(cross)break;c++;v=1;if(c>BIB[b][1])break}}
 return out}

// ---------- the map ----------
function MapV(host,onPick){
 host.innerHTML=`<div class="lmv atlv"><div class="lmt"></div><svg class="lmo"></svg><div class="lmctl"><button type="button" data-z="1" aria-label="Zoom in">+</button><button type="button" data-z="-1" aria-label="Zoom out">\u2212</button><button type="button" data-f="1" class="lml2">Fit</button><button type="button" data-l="1" class="lml2"></button></div><div class="lma"></div></div>`;
 const v=host.firstChild,tl=v.querySelector('.lmt'),sv=v.querySelector('.lmo'),lb=v.querySelector('[data-l]'),at=v.querySelector('.lma');
 let pts=[],sel=null,z=8,c={x:0,y:0},layer='topo',loaded=0,err=0,dead=0,H=300;const tiles=new Map();
 const staticMap=()=>{if(typeof window.JMAP!=='function')return '<p class="mute small">The map could not be drawn offline.</p>';
  const f=pts.filter(p=>p.f),a=f.length?f:pts;let w=1e9,e=-1e9,s=1e9,n=-1e9;a.forEach(p=>{w=Math.min(w,p.lon);e=Math.max(e,p.lon);s=Math.min(s,p.lat);n=Math.max(n,p.lat)});
  const cx=(w+e)/2,cy=(s+n)/2,sw=Math.max((e-w)*1.5,2.4),sh=Math.max((n-s)*1.5,1.8);
  const h=window.JMAP({box:[cx-sw/2,cx+sw/2,cy-sh/2,cy+sh/2],w:640,title:'',cap:'Offline map. Connect to the internet for the real terrain view.',pins:pts.filter(p=>p.f).map(p=>[p.n,p.lon,p.lat,'xr']),extra:pts.filter(p=>!p.f).map(p=>[p.n,p.lon,p.lat,'r'])});
  return h.replace('class="jm"','class="jm pol"')};
 const fallback=()=>{if(dead)return;dead=1;host.innerHTML=`<div class="atlfb">${staticMap()}</div>`};
 const fit=()=>{const W=v.clientWidth||340,f=pts.filter(p=>p.f),a=f.length?f:pts;if(!a.length)return;
  let w=1e9,e=-1e9,s=1e9,n=-1e9;a.forEach(p=>{w=Math.min(w,p.lon);e=Math.max(e,p.lon);s=Math.min(s,p.lat);n=Math.max(n,p.lat)});
  if(e-w<.02&&n-s<.02)z=9;else{z=10;while(z>3&&(mx(e,z)-mx(w,z)>W-90||my(s,z)-my(n,z)>H-90))z--}
  c={x:(mx(w,z)+mx(e,z))/2,y:(my(s,z)+my(n,z))/2}};
 const draw=()=>{if(dead)return;const W=v.clientWidth||340,L=c.x-W/2,T=c.y-H/2,n=2**z,need=new Set(),X=(lon)=>(mx(lon,z)-L).toFixed(1),Y=(lat)=>(my(lat,z)-T).toFixed(1);
  for(let ty=Math.floor(T/256);ty<=Math.floor((T+H)/256);ty++){if(ty<0||ty>=n)continue;for(let tx=Math.floor(L/256);tx<=Math.floor((L+W)/256);tx++){const k=layer+z+'/'+tx+'/'+ty;need.add(k);let im=tiles.get(k);
   if(!im){im=new Image();im.alt='';im.draggable=false;im.onload=()=>{loaded++};im.onerror=()=>{err++;if(!loaded&&err>=4)fallback()};im.src=TILES[layer][1].replace('{z}',z).replace('{x}',((tx%n)+n)%n).replace('{y}',ty);tl.appendChild(im);tiles.set(k,im)}
   im.style.left=(tx*256-L)+'px';im.style.top=(ty*256-T)+'px'}}
  tiles.forEach((im,k)=>{if(!need.has(k)){im.remove();tiles.delete(k)}});
  const showAll=pts.length<=14||z>=8;let o='',f='';
  pts.forEach(p=>{const x=X(p.lon),y=Y(p.lat);if(x<-40||y<-40||x>W+40||y>H+40)return;const s=p.i===sel;
   const g=p.f?`<g data-pi="${p.i}" tabindex="0" role="button" aria-label="${esc(p.n)}" class="atlpin${s?' sel':''}"><circle cx="${x}" cy="${y}" r="${s?15:12}" fill="${s?'#B45309':'#fff'}" fill-opacity="${s?.18:.01}" stroke="${s?'#B45309':'none'}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="8" fill="#B45309" stroke="#fff" stroke-width="2.5"/></g>`
    :`<g data-pi="${p.i}" tabindex="0" role="button" aria-label="${esc(p.n)}" class="atlpin${s?' sel':''}"><circle cx="${x}" cy="${y}" r="14" fill="#fff" fill-opacity=".01"/><circle cx="${x}" cy="${y}" r="${s?7:5}" fill="${s?'#B45309':'#23407E'}" stroke="#fff" stroke-width="2"/></g>`;
   const lab=(p.f||s||showAll)?`<text class="lml" x="${+x+(p.f?14:10)}" y="${+y+4}">${esc(p.n)}</text>`:'';
   if(p.f||s)f+=g+lab;else o+=g+lab});
  sv.innerHTML=o+f;lb.textContent=TILES[layer][0];at.textContent=TILES[layer][2]};
 const zoom=dz=>{const nz=Math.max(3,Math.min(13,z+dz));if(nz===z)return;const k=2**(nz-z);c.x*=k;c.y*=k;z=nz;draw()};
 let drag=null,moved=0,wt=0;
 v.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY};moved=0});
 v.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<5)return;if(!moved)v.setPointerCapture(e.pointerId);moved=1;c.x-=dx;c.y-=dy;drag={x:e.clientX,y:e.clientY};draw()});
 ['pointerup','pointercancel'].forEach(t=>v.addEventListener(t,()=>{drag=null}));
 v.addEventListener('wheel',e=>{e.preventDefault();if(Date.now()-wt<250)return;wt=Date.now();zoom(e.deltaY<0?1:-1)},{passive:false});
 v.addEventListener('click',e=>{const b=e.target.closest('button');if(b){if(b.dataset.z)zoom(+b.dataset.z);else if(b.dataset.f){fit();draw()}else{layer=layer==='topo'?'sat':'topo';draw()}return}
  if(moved){moved=0;return}const g=e.target.closest('[data-pi]');if(g)onPick(+g.dataset.pi)});
 if(navigator.onLine===false)setTimeout(fallback,0);
 return{
  set(P2,s,refit){pts=P2;sel=s;if(dead){if(host.querySelector('.atlfb'))host.querySelector('.atlfb').innerHTML=staticMap();return}if(refit)fit();draw()},
  fly(i){const p=pts.find(x=>x.i===i);if(!p||dead){sel=i;draw();return}sel=i;z=Math.max(z,9);c={x:mx(p.lon,z),y:my(p.lat,z)};draw()},
  mark(i){sel=i;draw()}}}

// ---------- the sheet ----------
let el=null,S=null,HIST=[],mv=null;
const mkPts=s=>{const f=new Set(s.focus),out=[],seen=new Set();
 s.focus.forEach(i=>{const p=P(i);if(p&&!seen.has(i)){seen.add(i);out.push(Object.assign({f:1},p))}});
 const oth=[];if(s.mode==='place'&&s.ctx)chapterPlaces(s.ctx[0],s.ctx[1]).forEach(p=>oth.push(p));
 (s.extra||[]).forEach(i=>{const p=P(i);if(p)oth.push(p)});
 oth.slice(0,60).forEach(p=>{if(!seen.has(p.i)){seen.add(p.i);out.push(Object.assign({f:0},p))}});return out};
const g=(b,c,v)=>`${b}:${c}:${v}`;
const verseBtn=(b,c,v,t,withName)=>`<button type="button" class="nmvl" data-atlgo="${g(b,c,v)}"><b>${withName?esc(BIB[b][0])+' ':''}${c}:${v}</b>${t?`<span>${esc(t)}</span>`:''}</button>`;
const evRows=list=>list.slice(0,14).map(k=>{const e=EVJ.e[k];return `<button type="button" class="atlev${S&&S.ev===k?' on':''}" data-atle="${k}"><span class="yr">${esc(e.y||'')}</span><b>${esc(e.t)}</b></button>`}).join('')+(list.length>14?`<p class="mute small">Showing 14 of ${list.length}.</p>`:'');

function placeCard(s){const p=P(s.sel);if(!p)return '';const e=p.e,a=atIdx().get(e.n)||[],ctx=s.ctx;
 let vs=[];const rf=NM.refs(p.i);
 if(ctx)vs=rf.filter(k=>vkb(k)===ctx[0]&&vkc(k)===ctx[1]).slice(0,8).map(k=>verseBtn(vkb(k),vkc(k),vkv(k),NM.cfg.text(vkb(k),vkc(k),vkv(k)),0));
 if(!vs.length)vs=rf.slice(0,5).map(k=>verseBtn(vkb(k),vkc(k),vkv(k),NM.cfg.text(vkb(k),vkc(k),vkv(k)),1));
 const brief=e.br||e.bf||e.d||'';
 return `<div class="atlcard"><div class="atlch"><b>${esc(e.n)}</b><span class="nmtag">Place</span></div>
 ${e.ar?`<p class="nmsub">Region: ${esc(e.ar)}</p>`:''}${brief?`<p class="atlbr">${esc(brief)}</p>`:''}
 <div class="atlbtns"><button type="button" class="g s" data-atld="${p.i}">Full details</button><a class="g s btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}">Open in Maps \u2197</a></div>
 <p class="mute small">${p.lat.toFixed(3)}\u00B0, ${p.lon.toFixed(3)}\u00B0 \u00B7 approximate position</p>
 ${vs.length?`<h4>${ctx&&rf.some(k=>vkb(k)===ctx[0]&&vkc(k)===ctx[1])?'Where it appears in this chapter':'Where it appears'}</h4>${vs.join('')}`:''}
 ${a.length?`<h4>Events here</h4>${evRows(a)}`:''}</div>`}

function eventCard(s){const e=EVJ&&EVJ.e[s.ev];if(!e)return '';
 const when=[e.y&&(e.c?e.y:'about '+e.y),e.d].filter(Boolean).join(' \u00B7 '),
  who=(e.who||[]).slice(0,10).map(n=>{const i=NM.idx(n);return i!=null?NM.chip(i):esc(n)}).join(' '),
  where=(e.at||[]).map(n=>{const p=byName(n);return p?`<button type="button" class="nmc n-l${s.sel===p.i?' on':''}" data-atlpick="${p.i}">\uD83D\uDCCD ${esc(n)}</button>`:`<span class="mute">${esc(n)}</span> `}).join(' ');
 let ps='';
 if(e.r){const rows=passage(e.r,30),a=e.r[0];
  ps=`<h4>Passage \u00B7 ${esc(refText(e.r))}</h4>`+(rows.length?`<div class="atlpass">${rows.map(([b,c,v,t])=>`<p><button type="button" class="atlvn" data-atlgo="${g(b,c,v)}" aria-label="Read ${esc(BIB[b][0])} ${c}:${v} in the Bible">${c===a[1]&&b===a[0]?'':c+':'}${v}</button> ${NM.ready()?NM.mark(b,c,v,t):esc(t)}</p>`).join('')}</div>`:'<p class="mute small">The text of this passage is not loaded yet. Open the Study tab once, then try again.</p>')
   +`<div class="atlbtns"><button type="button" class="s" data-atlgo="${g(a[0],a[1],a[2])}">Read in the Bible</button></div>`}
 const sec=(e.sec||[]).map(([l,t])=>`<p><b>${esc(l)}</b><br>${esc(t)}</p>`).join('');
 return `<div class="atlcard"><div class="atlch"><b>${esc(e.t)}</b><span class="nmtag">Event</span></div>
 ${when?`<p class="nmsub">${esc(when)}</p>`:''}
 ${where?`<h4>Where</h4><div class="nmcs">${where}</div>`:''}${who?`<h4>Who</h4><div class="nmcs">${who}</div>`:''}
 ${sec}${ps}
 ${(e.pre||[]).length||(e.nx||[]).length?`<p class="mute small">${(e.pre||[]).length?'Before: '+esc(e.pre.join(', '))+'. ':''}${(e.nx||[]).length?'After: '+esc(e.nx.join(', '))+'.':''}</p>`:''}</div>`}

function chapterCard(s){const[b,c]=s.ctx,pl=chapterPlaces(b,c),ev=chapterEvents(b,c);
 return `<div class="atlcard"><div class="atlch"><b>${esc(BIB[b][0])} ${c}</b><span class="nmtag">Chapter</span></div>
 ${pl.length?`<h4>Places (${pl.length})</h4><div class="nmcs">${pl.map(p=>`<button type="button" class="nmc n-l${s.sel===p.i?' on':''}" data-atlpick="${p.i}">\uD83D\uDCCD ${esc(p.n)}</button>`).join('')}</div>`:'<p class="mute">No places with a known position appear in this chapter.</p>'}
 ${ev.length?`<h4>Events in this chapter</h4>${ev.slice(0,14).map(([k,v])=>`<button type="button" class="atlev" data-atle="${k}"><span class="yr">v. ${v}</span><b>${esc(EVJ.e[k].t)}</b></button>`).join('')}`:''}</div>`}

function title(s){
 if(s.mode==='place'){const p=P(s.sel);return[p?p.n:'Map',p&&p.e.ar?'Region: '+p.e.ar:'']}
 if(s.mode==='event'){const e=EVJ&&EVJ.e[s.ev];return[e?e.t:'Event',e&&e.y?(e.c?e.y:'about '+e.y):'']}
 return[BIB[s.ctx[0]][0]+' '+s.ctx[1],'Places and events in this chapter']}

function paint(refit){const s=S;if(!el)return;const[h,sub]=title(s),pts=mkPts(s);
 el.querySelector('.atlh').textContent=h;el.querySelector('.atls').textContent=sub;
 el.querySelector('[data-atlb]').hidden=!HIST.length;
 const mapEl=el.querySelector('.atlmap');
 if(!pts.length){mapEl.innerHTML='<p class="atlnone">No map position is recorded for this '+(s.mode==='event'?'event':'chapter')+'. Its passage is shown below.</p>';mv=null}
 else{const fresh=!mv||!mapEl.querySelector('.atlv,.atlfb');if(fresh)mv=MapV(mapEl,i=>pick(i,0));mv.set(pts,s.sel,refit||fresh)}
 el.querySelector('.atlbody').innerHTML=(s.mode==='chapter'?chapterCard(s):s.mode==='event'?eventCard(s):'')+(s.sel!=null?placeCard(s):'');
 const pn=el.querySelector('.nmpanel');if(refit)pn.scrollTop=0}

function pick(i,fly){if(!S||!P(i))return;S.sel=i;if(!mkPts(S).some(p=>p.i===i)){S.extra=(S.extra||[]).concat(i);paint(0)}else paint(0);if(mv)fly?mv.fly(i):mv.mark(i)}

function show(s,push){if(push&&S)HIST.push(S);S=s;mv=null;paint(1)}
function shell(){if(el)return;el=document.createElement('div');el.className='nmsheet atl';
 el.innerHTML='<div class="nmscrim" data-atlx></div><div class="nmpanel" role="dialog" aria-modal="true" aria-label="Map" tabindex="-1"><div class="nmhd"><button type="button" class="g s" data-atlb hidden>\u2039 Back</button><span class="grow"></span><button type="button" class="g s" data-atlx aria-label="Close">\u2715</button></div><div class="nmbody"><div class="nmtitle"><h2 class="atlh"></h2><span class="nmtag big">Map</span></div><p class="nmsub atls"></p><div class="atlmap"></div><div class="atlbody"></div><p class="nmsrc">Positions are approximate (OpenBible geolocation); events and dates from Theographic (CC BY-SA 4.0). Tap a pin, a place name or an event to explore.</p></div></div>';
 document.body.appendChild(el);document.body.classList.add('nmlock');el.querySelector('.nmpanel').focus({preventScroll:true})}
const close=()=>{if(el){el.remove();el=null}S=null;HIST=[];mv=null;if(!document.querySelector('.nmsheet'))document.body.classList.remove('nmlock')};

// ---------- entry points ----------
const ready=cb=>NM.ready()?loadEv(cb):NM.load(()=>loadEv(cb));
const where=()=>NM.cfg.where?NM.cfg.where():null;
const ATL=window.ATL={
 place(i,ctx){ready(()=>{const p=P(i);if(!p)return;NM.close();shell();HIST=[];show({mode:'place',sel:i,focus:[i],ctx:ctx||where()},0)})},
 event(k,ctx){ready(()=>{if(!EVJ||!EVJ.e[k])return;if(!el)NM.close();shell();const ps=evPlaces(k).map(p=>p.i);const s={mode:'event',ev:k,sel:ps.length?ps[0]:null,focus:ps,ctx:ctx||where()};
  if(S&&el)show(s,1);else{HIST=[];show(s,0)}})},
 chapter(b,c){ready(()=>{if(b==null){const w=where();if(!w)return;b=w[0];c=w[1]}NM.close();shell();const pl=chapterPlaces(b,c).map(p=>p.i);HIST=[];show({mode:'chapter',sel:pl.length?pl[0]:null,focus:pl,ctx:[b,c]},0)})},
 close};

// ---------- clicks (the window listener runs before names.js, so names tapped inside the sheet jump on the map) ----------
window.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
 const stop=()=>{e.preventDefault();e.stopPropagation()};
 let x;
 if((x=t.closest('[data-atlp]'))){stop();ATL.place(+x.dataset.atlp);return}
 if((x=t.closest('[data-atle]'))){stop();ATL.event(+x.dataset.atle);return}
 if((x=t.closest('[data-atlch]'))){stop();ATL.chapter();return}
 if(!el||!el.contains(t))return;
 if(t.closest('[data-atlx]')){stop();close();return}
 if(t.closest('[data-atlb]')){stop();if(HIST.length){S=HIST.pop();mv=null;paint(1)}return}
 if((x=t.closest('[data-atlpick]'))){stop();pick(+x.dataset.atlpick,1);return}
 if((x=t.closest('[data-atld]'))){stop();NM.open(+x.dataset.atld);return}
 if((x=t.closest('[data-atlgo]'))){stop();const[b,c,v]=x.dataset.atlgo.split(':').map(Number);close();NM.close();NM.cfg.go(b,c,v);return}
 if((x=t.closest('.nm'))){stop();const ids=x.dataset.nm.split(',').map(s=>+s.split('.')[0]);const m=ids.find(i=>P(i));if(m!=null)pick(m,1);else NM.open(ids[0]);return}
},true);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&el&&!document.querySelector('.nmsheet:not(.atl)')){e.stopPropagation();close()}
 else if((e.key==='Enter'||e.key===' ')&&el&&e.target.closest&&e.target.closest('.atl [data-pi]')){e.preventDefault();pick(+e.target.closest('[data-pi]').dataset.pi,1)}},true);
})();
