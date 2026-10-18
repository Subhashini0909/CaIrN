// Study: Bible reader (KJV offline, NLT live, NIV and Tamil via links) + notes library + My notes
(()=>{
const ST=S.st=Object.assign({ver:'KJV',bk:10,ch:1,fs:21,hl:{},my:[],ov:{}},S.st),U={sub:'read',nid:null,edit:null,q:'',tq:'',msg:''};
ST.ov=ST.ov||{};ST.my=ST.my.map(m=>m.secs?m:{id:m.id,title:m.title||'Untitled',sum:[m.passage,m.tag].filter(Boolean).join(' · '),ico:'📝',secs:[{t:'Notes',h:'<p>'+esc(m.body||'').replace(/\n/g,'<br>')+'</p>',hd:1}],ts:m.ts});
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
const clean=h=>{const d=new DOMParser().parseFromString('<body>'+h+'</body>','text/html');d.querySelectorAll('script,style,iframe,object,embed,link,meta,form').forEach(e=>e.remove());d.body.querySelectorAll('*').forEach(e=>{const c=/^(tw|b)$/.test(e.className)?e.className:'';[...e.attributes].forEach(a=>e.removeAttribute(a.name));if(c)e.className=c});return d.body.innerHTML};
const plain=h=>h.replace(/<[^>]+>/g,' ');
const tx=n=>(n.title+' '+(n.sum||'')+' '+n.secs.map(s=>s.t+' '+plain(s.h)).join(' ')).toLowerCase();
const all=()=>[...window.NOTES.map(n=>({...(ST.ov[n.id]||n),id:n.id,orig:1,edited:!!ST.ov[n.id]})),...ST.my.map(m=>({...m,mine:1}))];
const getN=id=>all().find(n=>n.id===id);
const lib=(list,mineTab)=>{const q=U.tq.toLowerCase();return `<input id="sxq" class="srch" placeholder="Search notes: prophet, king, Elijah, Hezekiah…" value="${esc(U.tq)}"><div class="ng"><button class="nc add" data-sx="newn"><span class="ni">＋</span><b>Create a note</b><span class="mute">Title, summary and as many sections as you like, just like the study notes.</span></button>${list.map(n=>`<button class="nc" data-nid="${n.id}" data-sx="open:${n.id}" ${q&&!tx(n).includes(q)?'hidden':''}><span class="ni">${n.ico||'📝'}</span>${n.mine?'<span class="tag">Mine</span>':n.edited?'<span class="tag">Edited</span>':''}<b>${esc(n.title)}</b><span class="mute">${esc(n.sum||'')}</span><small>${n.secs.length} section${n.secs.length===1?'':'s'} · tap to open</small></button>`).join('')}</div>${mineTab&&!list.length?'<p class="mute" style="text-align:center;margin-top:18px">Your own notes will appear here.</p>':''}`};
const view=()=>{const n=getN(U.nid);return `<div class="row"><button class="g s" data-sx="back">‹ All notes</button><span class="acts"><button class="s" data-sx="edit">✎ Edit</button>${n.mine?'<button class="g s" data-sx="edel">Delete</button>':n.edited?'<button class="g s" data-sx="ereset">Reset to original</button>':''}</span></div><div class="card nb"><h2 class="ref">${n.ico||'📝'} ${esc(n.title)}</h2><p class="mute">${esc(n.sum||'')} Scripture references are tappable and open the chapter in the reader.</p><div class="chips">${n.secs.map((s,i)=>`<button class="g s" data-sx="sec:${i}">${esc(s.t)}</button>`).join('')}</div>${n.secs.map((s,i)=>`<section id="sxs${i}">${s.hd?`<h1>${esc(s.t)}</h1>`:''}${link(s.h)}</section>`).join('')}</div>`};
const ICOS=['📖','📝','🔥','👑','⏳','✨','🕊️','🙏','⛪','🌿','📜','💡'];
const secEd=(s,i,n)=>`<div class="ed-sec"><div class="row"><span class="mute">Section ${i+1}</span><span><button class="s g" data-sx="up:${i}" ${i?'':'disabled'} aria-label="Move up">↑</button> <button class="s g" data-sx="dn:${i}" ${i<n-1?'':'disabled'} aria-label="Move down">↓</button> <button class="s g" data-sx="delsec:${i}">Remove</button></span></div><input class="sxst" placeholder="Section heading, e.g. Key events" value="${esc(s.t)}"><div class="rte" contenteditable="true" data-ph="Write here. Use the toolbar for headings, bullets and highlights.">${s.h}</div></div>`;
const editor=()=>{const e=U.edit;return `<div class="card ed"><h2>${e.id?'Edit note':'New note'}</h2><div class="icos">${ICOS.map(x=>`<button class="ic${x===e.ico?' on':''}" data-sx="ico:${x}" aria-label="Icon ${x}">${x}</button>`).join('')}</div><input id="sxet" class="edt" placeholder="Note title" value="${esc(e.title)}"><input id="sxes" placeholder="One-line summary shown on the card" value="${esc(e.sum)}"><div class="tb" role="toolbar" aria-label="Formatting"><button data-sx="fmt:bold"><b>B</b></button><button data-sx="fmt:italic"><i>I</i></button><button data-sx="fmt:h2">Heading</button><button data-sx="fmt:p">Text</button><button data-sx="fmt:list">• List</button><button data-sx="fmt:mark">Highlight</button><button data-sx="fmt:clear">Clear</button></div>${e.secs.map((s,i)=>secEd(s,i,e.secs.length)).join('')}<button class="g addsec" data-sx="addsec">＋ Add section</button><div class="edbar"><button data-sx="esave">Save note</button><button class="g" data-sx="ecancel">Cancel</button></div></div>`};
const pull=()=>{const e=U.edit;if(!e||!$('#sxet'))return;e.title=$('#sxet').value;e.sum=$('#sxes').value;e.secs=[...document.querySelectorAll('.ed-sec')].map(x=>({t:x.querySelector('.sxst').value,h:x.querySelector('.rte').innerHTML}))};
const blank=(t)=>({title:t||'',sum:'',ico:'📝',secs:[{t:'Key points',h:'<p><br></p>'}]});
views.study=()=>{const mc=ST.my.slice().sort((a,b)=>b.ts-a.ts),n=U.nid&&getN(U.nid);return `<div class="seg main">${[['read','Read Bible'],['notes','Study notes'],['mine',`My notes${ST.my.length?' · '+ST.my.length:''}`]].map(([k,l])=>`<button class="${U.sub===k?'on':''}" data-sx="sub:${k}">${l}</button>`).join('')}</div>${U.sub==='read'&&!U.edit?read():U.edit?editor():n?view():U.sub==='mine'?lib(mc,1):lib(all().filter(x=>x.orig))}`};
const go=()=>render();
document.addEventListener('mousedown',e=>{if(e.target.closest('.tb button'))e.preventDefault()});
document.addEventListener('paste',e=>{if(!e.target.closest||!e.target.closest('.rte'))return;e.preventDefault();document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain'))});
document.addEventListener('click',e=>{const t=e.target.closest('[data-sx]');if(!t)return;e.preventDefault();const[a,x,y]=t.dataset.sx.split(':');U.msg='';
 if(a==='fmt'){const c=document.execCommand.bind(document);if(x==='bold')c('bold');else if(x==='italic')c('italic');else if(x==='h2')c('formatBlock',false,'H2');else if(x==='p')c('formatBlock',false,'P');else if(x==='list')c('insertUnorderedList');else if(x==='clear')c('removeFormat');else if(x==='mark'){const s=String(getSelection());if(s)c('insertHTML',false,'<mark>'+esc(s)+'</mark>')}return}
 if(a==='sec'){const el=document.getElementById('sxs'+x);el&&el.scrollIntoView({behavior:'smooth',block:'start'});return}
 pull();const E=U.edit;let top=0;
 if(a==='sub'){if(E&&!confirm('Discard this unsaved note?'))return;U.sub=x;U.edit=null;U.nid=null;top=1}
 else if(a==='ver')ST.ver=x;else if(a==='nav'){step(+x);top=1}else if(a==='fs')ST.fs=Math.max(15,Math.min(32,ST.fs+(+x)*2));
 else if(a==='vs'){const k=`${ST.bk}:${ST.ch}:${x}`;ST.hl[k]?delete ST.hl[k]:ST.hl[k]=1}
 else if(a==='mark'){rcs(ST.bk,ST.ch-1,1);U.msg=`${esc(ref())} marked as read.`}
 else if(a==='note'){U.sub='mine';U.nid=null;U.edit={...blank('Notes on '+ref()),sum:'Reading notes',secs:[{t:ref(),h:'<p><br></p>'}]};top=1}
 else if(a==='open'){U.nid=x;top=1}else if(a==='back'){U.nid=null;top=1}
 else if(a==='ref'){ST.bk=+x;ST.ch=+y;U.sub='read';U.nid=null;U.edit=null;top=1}
 else if(a==='newn'){U.edit=blank();top=1}
 else if(a==='edit'){const n=getN(U.nid);U.edit={id:n.id,orig:!!n.orig,title:n.title,sum:n.sum||'',ico:n.ico||'📝',secs:n.secs.map(s=>({t:s.t,h:s.h.replace(/^\s*<h[12][^>]*>[\s\S]*?<\/h[12]>/,'')||'<p><br></p>'}))};top=1}
 else if(a==='ico')E.ico=x;
 else if(a==='addsec')E.secs.push({t:'',h:'<p><br></p>'});
 else if(a==='delsec'){if(E.secs.length>1||confirm('Remove the only section?'))E.secs.splice(+x,1)}
 else if(a==='up'||a==='dn'){const i=+x,j=a==='up'?i-1:i+1;[E.secs[i],E.secs[j]]=[E.secs[j],E.secs[i]]}
 else if(a==='ecancel'){U.edit=null;top=1}
 else if(a==='esave'){const secs=E.secs.map(s=>({t:s.t.trim(),h:clean(s.h),hd:1})).filter(s=>s.t||plain(s.h).trim());secs.forEach(s=>{if(!s.t)s.t='Notes'});if(!E.title.trim()&&!secs.length)return alert('Add a title or some text first.');
  const n={title:E.title.trim()||'Untitled',sum:E.sum.trim(),ico:E.ico||'📝',secs};if(E.orig)ST.ov[E.id]=n;else{n.id=E.id||uid();n.ts=Date.now();ST.my=ST.my.filter(m=>m.id!==n.id);ST.my.push(n);E.id=n.id}
  U.nid=E.id;U.edit=null;top=1}
 else if(a==='edel'){if(!confirm('Delete this note permanently?'))return;ST.my=ST.my.filter(m=>m.id!==U.nid);U.nid=null;top=1}
 else if(a==='ereset'){if(!confirm('Discard your edits and restore the original note?'))return;delete ST.ov[U.nid];top=1}
 else return;
 save();go();if(top)scrollTo({top:0})});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='sxb'){ST.bk=+t.value;ST.ch=1;save();go()}else if(t.id==='sxc'){ST.ch=+t.value;save();go()}});
document.addEventListener('input',e=>{if(e.target.id!=='sxq')return;U.tq=e.target.value;const q=U.tq.toLowerCase();document.querySelectorAll('.nc[data-nid]').forEach(b=>{const n=getN(b.dataset.nid);b.hidden=!!q&&!!n&&!tx(n).includes(q)})});
})();