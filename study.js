// Study: Bible reader (KJV offline, NLT live, NIV and Tamil via links) + notes library + My notes
(()=>{
const ST=S.st=Object.assign({ver:'KJV',bk:10,ch:1,fs:21,hl:{},my:[]},S.st),U={sub:'read',nid:null,edit:null,q:'',tq:'',msg:''};
let KJV=null,ld=0;const NC={};
const VER={KJV:'KJV',NIV:'NIV',NLT:'NLT',TAM:'தமிழ்'};
const load=()=>{if(KJV||ld)return;ld=1;fetch('kjv.json').then(r=>r.json()).then(j=>{KJV=j;ld=0;if(tab==='study')render()}).catch(()=>{ld=0;U.err=1;if(tab==='study')render()})};
const ref=()=>`${BIB[ST.bk][0]} ${ST.ch}`;
const nm=BIB.map(x=>x[0]).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),RE=new RegExp(`\\b(${nm}) (\\d{1,3})(?::\\d+(?:[–-]\\d+)?)?`,'g');
const link=h=>h.replace(/>([^<]+)</g,(m,t)=>'>'+t.replace(RE,(s,n,c)=>{const b=BIB.findIndex(x=>x[0]===n);return b<0||+c>BIB[b][1]?s:`<a class="xr" data-sx="ref:${b}:${c}" href="#">${s}</a>`})+'<');
const TXT=window.NOTES.map(n=>({id:n.id,t:(n.title+' '+n.sum+' '+n.secs.map(s=>s.h.replace(/<[^>]+>/g,' ')).join(' ')).toLowerCase()}));
const step=d=>{let b=ST.bk,c=ST.ch+d;if(c<1){if(b===0)return;b--;c=BIB[b][1]}else if(c>BIB[b][1]){if(b===65)return;b++;c=1}ST.bk=b;ST.ch=c};
const sel=()=>`<div class="pick"><select id="sxb" aria-label="Book"><optgroup label="Old Testament">${BIB.slice(0,39).map((x,i)=>`<option value="${i}" ${i===ST.bk?'selected':''}>${x[0]}</option>`).join('')}</optgroup><optgroup label="New Testament">${BIB.slice(39).map((x,i)=>`<option value="${i+39}" ${i+39===ST.bk?'selected':''}>${x[0]}</option>`).join('')}</optgroup></select><select id="sxc" aria-label="Chapter">${[...Array(BIB[ST.bk][1])].map((_,i)=>`<option ${i+1===ST.ch?'selected':''}>${i+1}</option>`).join('')}</select></div>`;
function body(){const k=`${ST.bk}:${ST.ch}`,r=encodeURIComponent(ref()),v=ST.ver;
 if(v==='KJV'){load();if(!KJV)return U.err?'<div class="empty">Could not load the KJV text. Check that kjv.json is next to index.html.</div>':'<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  return `<div class="scr" style="font-size:${ST.fs}px">${KJV[ST.bk].chapters[ST.ch-1].map((t,i)=>`<span class="vs${ST.hl[k+':'+(i+1)]?' hl':''}" data-sx="vs:${i+1}"><sup>${i+1}</sup>${esc(t)} </span>`).join('')}</div><p class="mute" style="margin:14px 0 0">Tap any verse to highlight it. King James Version, public domain, works offline.</p>`}
 if(v==='NLT'){if(NC[k])return `<div class="scr nlt" style="font-size:${ST.fs}px">${NC[k]}</div><p class="mute">New Living Translation, loaded live from api.nlt.to.</p>`;
  if(NC[k]===0)return ext('NLT',`https://www.biblegateway.com/passage/?search=${r}&version=NLT`,'The live NLT feed is unavailable right now (it needs internet).');
  NC[k]=null;fetch(`https://api.nlt.to/api/passages?ref=${r}&key=TEST`).then(x=>x.text()).then(h=>{const d=new DOMParser().parseFromString(h,'text/html');d.querySelectorAll('script,style,link,iframe').forEach(e=>e.remove());d.querySelectorAll('*').forEach(e=>[...e.attributes].forEach(a=>/^on/i.test(a.name)&&e.removeAttribute(a.name)));
   NC[k]=d.body.innerHTML.trim()||0;if(tab==='study'&&U.sub==='read')render()}).catch(()=>{NC[k]=0;if(tab==='study'&&U.sub==='read')render()});return '<div class="skel"></div><div class="skel"></div><div class="skel"></div>'}
 return v==='NIV'?ext('NIV',`https://www.biblegateway.com/passage/?search=${r}&version=NIV`,'The NIV is licensed text, so it opens in BibleGateway in a new tab.'):ext('TAM','https://www.bible.com/languages/tam','The Tamil Bible opens in the YouVersion Tamil library. Pick your Tamil version there and go to '+esc(ref())+'.')}
const ext=(v,u,t)=>`<div class="extc"><div class="big2" style="font-family:var(--serif)">${VER[v]} · ${esc(ref())}</div><p class="mute">${t}</p><a class="btn" href="${u}" target="_blank" rel="noopener">Open ${VER[v]} · ${esc(ref())} ↗</a><p class="mute" style="margin-top:14px">Tip: switch to KJV above to read the same chapter in-app, then compare.</p></div>`;
const read=()=>`<div class="seg" role="tablist">${Object.entries(VER).map(([k,l])=>`<button class="${ST.ver===k?'on':''}" data-sx="ver:${k}">${l}</button>`).join('')}</div>
<div class="card rd"><div class="rdh">${sel()}<div class="tools"><button class="g s" data-sx="fs:-1" aria-label="Smaller text">A−</button><button class="g s" data-sx="fs:1" aria-label="Larger text">A+</button></div></div>
<h2 class="ref">${esc(ref())}</h2>${body()}
<div class="rdf"><button class="g" data-sx="nav:-1">‹ Previous</button><button data-sx="mark">${rcv(ST.bk,ST.ch-1)?'✓ Read · mark again':'Mark chapter read'}</button><button class="g" data-sx="note">＋ Note</button><button class="g" data-sx="nav:1">Next ›</button></div>${U.msg?`<p class="mute" style="text-align:center">${U.msg}</p>`:''}</div>`;
const lib=()=>{const q=U.tq.toLowerCase();return `<input id="sxq" class="srch" placeholder="Search all notes: prophet, king, Elijah, Hezekiah…" value="${esc(U.tq)}"><div class="ng">${window.NOTES.map(n=>`<button class="nc" data-sx="open:${n.id}" ${q&&!TXT.find(t=>t.id===n.id).t.includes(q)?'hidden':''}><span class="ni">${n.ico}</span><b>${esc(n.title)}</b><span class="mute">${esc(n.sum)}</span><small>${n.secs.length} section${n.secs.length>1?'s':''} · tap to open</small></button>`).join('')}</div>`};
const view=()=>{const n=window.NOTES.find(x=>x.id===U.nid);return `<button class="g s" data-sx="back">‹ All notes</button><div class="card nb"><h2 class="ref">${n.ico} ${esc(n.title)}</h2><p class="mute">${esc(n.sum)} Scripture references are tappable and open the chapter in the reader.</p><div class="chips">${n.secs.map((s,i)=>`<button class="g s" data-sx="sec:${i}">${esc(s.t)}</button>`).join('')}</div>${n.secs.map((s,i)=>`<section id="sxs${i}">${link(s.h)}</section>`).join('')}</div>`};
const TAGS=['Study','Prophets','Kings','Sermon','Prayer','Personal'];
const mine=()=>{const e=U.edit,q=U.mq.toLowerCase?U.mq.toLowerCase():'';
 if(e)return `<div class="card"><h2>${e.id?'Edit note':'New note'}</h2><div class="form"><input id="sxnt" placeholder="Title" value="${esc(e.title||'')}"><input id="sxnp" placeholder="Passage, e.g. 1 Kings 18" value="${esc(e.passage||'')}"><select id="sxng">${TAGS.map(t=>`<option ${t===(e.tag||'Study')?'selected':''}>${t}</option>`).join('')}</select></div><textarea id="sxnb" class="ta" placeholder="Write what you learned, questions, applications, prayer points…">${esc(e.body||'')}</textarea><div class="form" style="margin-top:12px"><button data-sx="nsave">Save note</button><button class="g" data-sx="ncancel">Cancel</button></div></div>`;
 const L=[...ST.my].sort((a,b)=>b.ts-a.ts);return `<div class="row" style="margin-bottom:12px"><span class="mute">${L.length} personal note${L.length===1?'':'s'}</span><button data-sx="nnew">＋ New note</button></div>${L.length?L.map(m=>`<div class="card mn"><div class="row"><b>${esc(m.title||'Untitled')}</b><span class="pill up">${esc(m.tag)}</span></div>${m.passage?`<div class="mute">${link('>'+esc(m.passage)+'<').slice(1,-1)}</div>`:''}<p class="mbody">${esc(m.body).replace(/\n/g,'<br>')}</p><div class="form" style="margin:0"><button class="s g" data-sx="ned:${m.id}">Edit</button><button class="s g" data-sx="ndel:${m.id}">Delete</button></div></div>`).join(''):'<div class="card empty">No notes yet. Tap “＋ Note” while reading a chapter, or start one here.</div>'}`};
U.mq='';
views.study=()=>`<div class="seg main">${[['read','Read Bible'],['notes','Study notes'],['mine',`My notes${ST.my.length?' · '+ST.my.length:''}`]].map(([k,l])=>`<button class="${U.sub===k?'on':''}" data-sx="sub:${k}">${l}</button>`).join('')}</div>${U.sub==='read'?read():U.sub==='notes'?(U.nid?view():lib()):mine()}`;
const go=()=>{render();};
document.addEventListener('click',e=>{const t=e.target.closest('[data-sx]');if(!t)return;e.preventDefault();const[a,x,y]=t.dataset.sx.split(':');U.msg='';
 if(a==='sub'){U.sub=x;U.edit=null;if(x==='notes')U.nid=null}
 else if(a==='ver')ST.ver=x;else if(a==='nav')step(+x);else if(a==='fs')ST.fs=Math.max(15,Math.min(32,ST.fs+(+x)*2));
 else if(a==='vs'){const k=`${ST.bk}:${ST.ch}:${x}`;ST.hl[k]?delete ST.hl[k]:ST.hl[k]=1}
 else if(a==='mark'){rcs(ST.bk,ST.ch-1,1);U.msg=`${esc(ref())} marked as read.`}
 else if(a==='note'){U.sub='mine';U.edit={passage:ref(),tag:'Study'}}
 else if(a==='open'){U.nid=x}else if(a==='back')U.nid=null;
 else if(a==='sec'){const el=document.getElementById('sxs'+x);el&&el.scrollIntoView({behavior:'smooth',block:'start'});return}
 else if(a==='ref'){ST.bk=+x;ST.ch=+y;U.sub='read'}
 else if(a==='nnew')U.edit={tag:'Study'};else if(a==='ncancel')U.edit=null;
 else if(a==='ned')U.edit={...ST.my.find(m=>m.id===x)};
 else if(a==='ndel'){if(!confirm('Delete this note?'))return;ST.my=ST.my.filter(m=>m.id!==x)}
 else if(a==='nsave'){const n={id:U.edit.id||uid(),title:$('#sxnt').value.trim(),passage:$('#sxnp').value.trim(),tag:$('#sxng').value,body:$('#sxnb').value.trim(),ts:Date.now()};if(!n.title&&!n.body)return;ST.my=ST.my.filter(m=>m.id!==n.id);ST.my.push(n);U.edit=null}
 else return;
 save();go();if(['ref','sub','open','back','nav','ver'].includes(a))scrollTo({top:0})});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='sxb'){ST.bk=+t.value;ST.ch=1;save();go()}else if(t.id==='sxc'){ST.ch=+t.value;save();go()}});
document.addEventListener('input',e=>{if(e.target.id!=='sxq')return;U.tq=e.target.value;const q=U.tq.toLowerCase();document.querySelectorAll('.nc').forEach((b,i)=>b.hidden=!!q&&!TXT[i].t.includes(q))});
})();