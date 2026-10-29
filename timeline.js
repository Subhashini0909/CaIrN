// Timeline tab (Study): events, people and journeys on one scrollable timeline, Creation to Revelation,
// with a "you are here" marker for the chapter being read. Data: events.json + the journey maps in maps.js.
(()=>{
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// [key, name, description, first year, last year]  (BC is negative)
const ERAS=[['origins','Origins','Creation to Babel',-99999,-2201],['patriarchs','Patriarchs','Abraham to Joseph',-2200,-1572],['exodus','Exodus and Judges','Moses to Samuel',-1571,-1096],['kings','Kings','Saul to the fall of Jerusalem',-1095,-587],['exile','Exile and return','Babylon to the end of the Old Testament',-586,-5],['gospels','Gospels','The life of Jesus',-4,30],['church','Church','Acts, the letters and Revelation',31,99999]];
const eraOf=y=>{for(let i=0;i<ERAS.length;i++)if(y>=ERAS[i][3]&&y<=ERAS[i][4])return i;return ERAS.length-1};
// Journeys come from maps.js: [title, year (BC negative), book index, chapter, verse]
const JM={abraham:['Abraham’s journey',-1921,0,12,1],wild:['Exodus and the wilderness',-1491,1,12,1],david:['David’s journeys',-1062,8,19,1],elijah:['Elijah’s journeys',-910,10,17,1],jonah:['Jonah’s journey',-785,31,1,1],exile:['Exile and return',-586,11,24,1],jesus:['Jesus’ ministry',27,39,3,1],pj1:['Paul’s first journey',46,43,13,1],pj2:['Paul’s second journey',49,43,15,36],pj3:['Paul’s third journey',53,43,18,23],prome:['Paul’s voyage to Rome',59,43,27,1],seven:['The seven churches',96,65,2,1]};
// Events in events.json that have no year. Everything else without one takes the year of its nearest dated neighbour.
const OV={'War: Abraham rescues Lot':-1913,'Battle: Egypt and the Red Sea':-1491,'Battle: Israel vs Amalek':-1491,'Battle: the fall of Jericho':-1451,'Battle: Ai':-1451,'Battle: Gibeon and the long day':-1451,'Battle: Deborah, Barak and Sisera':-1277,'Battle: Gideon and the Midianites':-1249,'Battle: David and Goliath':-1063,'Battle: Mount Gilboa':-1056,'War: Jehoshaphat vs Moab and Ammon':-895,'Paul Writes Galatians':50};
const TN={e:'Event',p:'Person',j:'Journey'};
const TL={f:'all',q:'',open:null,did:0};
let D=null,ld=0;

const yr=s=>{const m=/(\d+)\s*(BC|AD)/i.exec(s||'');return m?(m[2].toUpperCase()==='BC'?-(+m[1]):+m[1]):null};
const yl=(y,ap)=>(ap?'c. ':'')+(y<0?(-y)+' BC':y+' AD');
const refT=it=>{if(it.k==='j')return BIB[it.b][0]+' '+it.c;let s=BIB[it.b][0]+' '+it.c+':'+it.v;if(it.c2!==it.c||it.v2!==it.v)s+=it.c2===it.c?'\u2013'+it.v2:'\u2013'+it.c2+':'+it.v2;return s};

function build(raw){
 const items=[],dated=[];
 raw.forEach((e,i)=>{
  if(!e||!e.r||!e.r.length||/^Creation: the seven days/.test(e.t))return; // duplicate of "Creation of all things"
  const a=e.r[0],z=e.r[1]&&e.r[1][0]===a[0]?e.r[1]:a;let y=yr(e.y),ap=/^about/i.test(e.y||'');
  if(y==null&&OV[e.t]!=null){y=OV[e.t];ap=true}
  const it={k:/^(Lifetime|Reign) of /.test(e.t)?'p':'e',t:e.t,y,ap,b:a[0],c:a[1],v:a[2]||1,b2:z[0],c2:z[1],v2:z[2]||1,who:e.who||[],at:e.at||[],d:e.d||'',id:'e'+i};
  items.push(it);if(y!=null)dated.push(it)});
 items.forEach(it=>{if(it.y!=null)return;let best=null,bd=1e9;dated.forEach(o=>{const d=Math.abs(o.b-it.b)*1000+Math.abs(o.c-it.c);if(d<bd){bd=d;best=o}});it.y=best?best.y:0;it.ap=true});
 const J=(window.BKX&&window.BKX.mapData)||{};
 const JE={pj1:'First Missionary Journey',pj2:'Second Missionary Journey',pj3:'Third Missionary Journey',prome:'Paul\u2019s Journey to Rome',wild:'Exodus from Egypt',elijah:'Prophecies of Elijah',jesus:'First Passover and Temple Cleansing'};
 Object.keys(JM).forEach(k=>{const m=JM[k],j=J[k];if(!j)return;
  const me=JE[k]&&dated.find(o=>o.t===JE[k].replace('\u2019',"'")&&o.k==='e'),yy=me&&k!=='jesus'?me.y:m[1];const st=[];((j.routes&&j.routes[0]&&j.routes[0].st)||[]).forEach(s=>{if(s[0]&&st.indexOf(s[0])<0)st.push(s[0])});
  items.push({k:'j',t:m[0],y:yy,ap:true,b:m[2],c:m[3],v:m[4],b2:m[2],c2:m[3],v2:m[4],who:[],at:st,d:'',cap:j.cap||'',id:'j'+k})});
 items.sort((a,b)=>a.y-b.y||a.b-b.b||a.c-b.c||a.v-b.v);
 return items}

function load(){if(D!==null||ld)return;ld=1;fetch('events.json').then(r=>r.json()).then(j=>{D=build(j.e||[])}).catch(()=>{D=0}).then(()=>{ld=0;if(typeof tab!=='undefined'&&tab==='study'&&document.querySelector('.tlv'))render()})}

// The event that best covers the chapter being read: the one covering the most of that chapter's verses
// (so a one-verse mention such as "Sojourn in Egypt" in Exodus 12:40 does not beat the Exodus itself), then the narrowest span.
// When none covers it, the closest one by book and chapter, never Job/Psalms/Proverbs/Ecclesiastes/Song of Solomon for a chapter
// outside them: they sit in the middle of the Bible but are not dated by their place in it (Job's Trial is 1649 BC, next to Nehemiah in book order).
function anchor(items,p){
 const pb=p[0],pc=p[1],key=pb*1000+pc,vc=(window.NM&&NM.cfg&&NM.cfg.vc)?NM.cfg.vc(pb,pc):0;
 let best=null,bo=-1,bs=1e9;
 items.forEach(it=>{if(it.k==='j')return;const lo=it.b*1000+it.c,hi=it.b2*1000+it.c2;if(key<lo||key>hi)return;
  const from=(it.b===pb&&it.c===pc)?it.v:1,to=(it.b2===pb&&it.c2===pc)?it.v2:(vc||1000),ov=Math.max(1,to-from+1),sp=hi-lo;
  if(ov>bo||(ov===bo&&sp<bs)){bo=ov;bs=sp;best=it}});
 if(best)return{it:best,exact:true};
 const FLOAT=[17,18,19,20,21],skip=FLOAT.indexOf(pb)<0;
 let nd=1e9;items.forEach(it=>{if(it.k==='j'||(skip&&FLOAT.indexOf(it.b)>=0))return;const d=Math.abs(it.b-pb)*1000+Math.abs(it.c-pc);if(d<nd){nd=d;best=it}});
 return best?{it:best,exact:false}:null}

const hay=it=>(it.t+' '+it.who.join(' ')+' '+it.at.join(' ')+' '+yl(it.y,it.ap)+' '+refT(it)).toLowerCase();
const pos=()=>{const w=window.NM&&NM.cfg&&NM.cfg.where?NM.cfg.where():null;return w||[0,1]};

function row(it,A){
 const here=A&&A.it===it,p=pos();
 const chips=(it.k==='j'?'':it.who.concat(it.at).slice(0,5).map(n=>`<span class="tlpp">${esc(n)}</span>`).join(''));
 const stops=it.k==='j'&&it.at.length?`<div class="tlstops">${it.at.slice(0,6).map(esc).join(' <span aria-hidden="true">\u2192</span> ')}${it.at.length>6?' \u2026':''}</div>`:'';
 const cap=it.k==='j'&&it.cap?`<div class="tlcap">${esc(it.cap)}</div>`:'';
 const act=here?`<div class="tlact"><button class="s" data-tl="open:${p[0]}.${p[1]}.0">Back to chapter</button>${A.exact?'':'<span class="mute small">Closest event to this chapter</span>'}</div>`:'';
 return `<div class="tlrow${here?' tlhere':''}"${here?' id="tl-here"':''}><div class="tly">${esc(yl(it.y,it.ap))}</div><div class="tlrail"><i class="tld ${it.k}"></i></div>
 <div class="tlcd">${here?`<span class="tlpill">You are here \u00B7 ${esc(BIB[p[0]][0]+' '+p[1])}</span>`:''}<div class="tlty ${it.k}">${TN[it.k]}</div><div class="tltt">${esc(it.t)}</div>
 <button class="tlref" data-tl="open:${it.b}.${it.c}.${it.v}">${esc(refT(it))}</button>${it.d?`<span class="mute small"> \u00B7 ${esc(it.d)}</span>`:''}${stops}${cap}${chips?`<div>${chips}</div>`:''}${act}</div></div>`}

function filtered(A){
 const q=TL.q.trim().toLowerCase();
 return D.filter(it=>(!q&&A&&it===A.it)||((TL.f==='all'||TL.f===it.k)&&(!q||hay(it).includes(q))))}

function listHTML(A){
 const L=filtered(A),q=TL.q.trim();
 if(!L.length)return `<p class="mute">Nothing matches${q?' \u201C'+esc(q)+'\u201D':''}. Try a name, a place or a year such as 586 BC.</p>`;
 const g=ERAS.map(()=>[]);L.forEach(it=>g[eraOf(it.y)].push(it));
 return ERAS.map((E,i)=>{if(!g[i].length)return '';const open=q||TL.open.has(E[0]);
  return `<section class="tlera"><button class="tlband" id="tl-era-${E[0]}" data-tl="era:${E[0]}" aria-expanded="${!!open}"><span>${E[1]} <small>${E[2]}</small></span><span>${g[i].length} ${open?'\u25BE':'\u25B8'}</span></button>${open?g[i].map(it=>row(it,A)).join(''):''}</section>`}).join('')}

function scrubber(A){
 const L=filtered(A),n=ERAS.map(()=>0);L.forEach(it=>n[eraOf(it.y)]++);
 const tot=L.length||1,w=n.map(x=>x?Math.max(x,tot*.06):0),W=w.reduce((a,b)=>a+b,0)||1;
 let mk='';if(A){const ei=eraOf(A.it.y),idx=L.filter(it=>eraOf(it.y)===ei).indexOf(A.it);let before=0;for(let i=0;i<ei;i++)before+=w[i];mk=`<div class="tlmk" style="left:${((before+(idx+.5)/n[ei]*w[ei])/W*100).toFixed(2)}%"><span>You are here</span><b></b></div>`}
 const cur=A?eraOf(A.it.y):-1;
 return `<div class="tlsc">${mk}<div class="tlbars" role="group" aria-label="Jump to a period">${ERAS.map((E,i)=>n[i]?`<button class="tlseg${i===cur?' on':''}" style="flex:${w[i]}" data-tl="scrub:${E[0]}" aria-label="${E[1]}, ${n[i]} items"><i></i><span>${E[1].split(' and ')[0]}</span></button>`:'').join('')}</div></div>`}

function view(){
 load();
 if(D===null)return `<div class="card tlv"><div class="tlh"><h2>Timeline</h2></div><div class="skel" style="height:18px;margin:10px 0"></div><div class="skel" style="height:90px;margin:10px 0"></div><div class="skel" style="height:90px;margin:10px 0"></div></div>`;
 if(!D||!D.length)return `<div class="card tlv"><div class="tlh"><h2>Timeline</h2></div><p class="mute">The timeline could not be loaded. Check your connection and open this tab again.</p></div>`;
 const A=anchor(D,pos());
 if(TL.open===null)TL.open=new Set([ERAS[A?eraOf(A.it.y):0][0]]);
 const c={e:0,p:0,j:0};D.forEach(it=>c[it.k]++);
 const hk=pos().join('.');
 if(TL.did!==hk){TL.did=hk;if(A&&TL.open)TL.open.add(ERAS[eraOf(A.it.y)][0]);setTimeout(()=>{const h=document.getElementById('tl-here');if(h)h.scrollIntoView({block:'center'})},60)}
 const chip=(k,l,n)=>`<button class="tlc${TL.f===k?' on':''}" data-tl="f:${k}" aria-pressed="${TL.f===k}">${l} <small>${n}</small></button>`;
 return `<div class="card tlv${TL.q?' tlsearching':''}"><div class="tlh"><h2>Timeline</h2><span class="mute small">Creation to Revelation</span></div>
 <input id="tlq" class="srch" type="search" placeholder="Try Elijah, Exodus or 586 BC" value="${esc(TL.q)}" autocomplete="off" aria-label="Search the timeline">
 <div id="tlsc">${TL.q?'':scrubber(A)}</div>
 <div class="tlf">${chip('all','All',D.length)}${chip('e','Events',c.e)}${chip('p','People',c.p)}${chip('j','Journeys',c.j)}<button class="tlc tlgold" data-tl="jump">Jump to where you are</button></div>
 <div id="tllist">${listHTML(A)}</div></div>`}

const redraw=y=>{render();if(y!=null)scrollTo(0,y)};
document.addEventListener('click',e=>{
 const t=e.target.closest&&e.target.closest('[data-tl]');if(!t||typeof tab==='undefined'||tab!=='study')return;
 e.preventDefault();const s=t.dataset.tl,i=s.indexOf(':'),a=i<0?s:s.slice(0,i),x=i<0?'':s.slice(i+1),y=scrollY;
 if(a==='open'){const r=x.split('.').map(Number);window.NM&&NM.cfg.go&&NM.cfg.go(r[0],r[1],r[2]);return}
 if(!D)return;
 if(a==='f'){TL.f=x;redraw(y)}
 else if(a==='era'){TL.open.has(x)?TL.open.delete(x):TL.open.add(x);redraw(y)}
 else if(a==='jump'||a==='scrub'){TL.q='';const A=anchor(D,pos());
  if(a==='scrub')TL.open.add(x);else if(A)TL.open.add(ERAS[eraOf(A.it.y)][0]);
  render();const el=document.getElementById(a==='scrub'?'tl-era-'+x:'tl-here');if(el)el.scrollIntoView({block:a==='scrub'?'start':'center',behavior:'smooth'})}});
document.addEventListener('input',e=>{
 if(!e.target||e.target.id!=='tlq'||!D)return;TL.q=e.target.value;
 const A=anchor(D,pos());document.getElementById('tllist').innerHTML=listHTML(A);
 document.getElementById('tlsc').innerHTML=TL.q?'':scrubber(A);
 const v=document.querySelector('.tlv');v&&v.classList.toggle('tlsearching',!!TL.q)});
window.TLV={view};
})();