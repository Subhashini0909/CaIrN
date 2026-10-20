// Study: Bible reader (KJV and Tamil offline, NLT live, NIV via link) + notes library (your own notes live here too)
(()=>{
const ST=S.st=Object.assign({ver:'KJV',bk:10,ch:1,fs:21,hl:{},my:[],ov:{},nm:true},S.st),U={sub:'read',nid:null,edit:null,q:'',tq:'',msg:'',sel:null,selId:null};
ST.ov=ST.ov||{};ST.an=ST.an||{};ST.del=ST.del||{};ST.tool=ST.tool||'h';Object.keys(ST.hl).forEach(k=>{if(ST.hl[k]===1||ST.hl[k]===true)ST.hl[k]='h'});ST.my=ST.my.map(m=>m.secs?m:{id:m.id,title:m.title||'Untitled',sum:[m.passage,m.tag].filter(Boolean).join(' · '),ico:'📝',secs:[{t:'Notes',h:'<p>'+esc(m.body||'').replace(/\n/g,'<br>')+'</p>',hd:1}],ts:m.ts});
let KJV=null,ld=0;const NC={};
const flash=()=>{const v=U.flash;if(!v)return;const el=document.querySelector(`.scr .vs[data-sx="vs:${v}"]`);if(!el)return;U.flash=0;el.scrollIntoView({block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),2600)};
const rr=()=>{if(tab==='study'){render();flash()}};
const VER={KJV:'KJV',NIV:'NIV',NLT:'NLT',TAM:'தமிழ்'};
const load=()=>{if(KJV||ld)return;ld=1;fetch('kjv.json').then(r=>r.json()).then(j=>{KJV=j;ld=0;rr()}).catch(()=>{ld=0;U.err=1;if(tab==='study')render()})};
let TAM=null,ldT=0;const loadT=()=>{if(TAM||ldT)return;ldT=1;fetch('tamil.json').then(r=>r.json()).then(j=>{TAM=j;ldT=0;rr()}).catch(()=>{ldT=0;U.errT=1;if(tab==='study')render()})};
const ref=()=>`${BIB[ST.bk][0]} ${ST.ch}`;
NM.cfg.refresh=()=>{if(tab==='study')render()};
NM.cfg.text=(b,c,v)=>KJV&&KJV[b]&&KJV[b].chapters[c-1]?KJV[b].chapters[c-1][v-1]:null;
NM.cfg.go=(b,c,v)=>{ST.bk=b;ST.ch=c;U.sub='read';U.nid=null;U.edit=null;U.flash=v;if(ST.ver!=='KJV'&&ST.ver!=='TAM')ST.ver='KJV';if(tab!=='study'){const t=document.querySelector('[data-tab=study]');t&&t.click()}save();go();if(!U.flash)return;scrollTo({top:0})};
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('nmlist'))U.nmopen=e.target.open},true);
// ---- reading tools: Highlight (h), Underline (u), Important (i), Clear (x) ----
const TL=[['h','Highlight'],['u','Underline'],['i','Important'],['x','Clear']];
const canon=f=>[...new Set(f)].sort().join('');
const tog=(f,t)=>{f=f||'';return f.includes(t)?f.replace(t,''):canon(f+t)};
const vcls=f=>f?(f.includes('h')?' hl':'')+(f.includes('u')?' ul':'')+(f.includes('i')?' imp':''):'';
const hash=t=>{let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return h};
const secTxt=x=>{const d=document.createElement('div');d.innerHTML=(x.hd?`<h1>${esc(x.t)}</h1>`:'')+x.h;return d.textContent};
const tools=nmb=>`<div class="rtools" role="toolbar" aria-label="Reading tools">${TL.map(([k,l])=>`<button class="${ST.tool===k?'on':''}" data-sx="tool:${k}" aria-pressed="${ST.tool===k}"><span class="sw ${k==='x'?'':'a-'+k}">${k==='x'?'✕':'Aa'}</span>${l}</button>`).join('')}${nmb?`<button class="nmtog ${ST.nm?'on':''}" data-sx="nmtog" aria-pressed="${!!ST.nm}" title="Show details when you hover over names and places"><span class="sw nmsw">Ab</span>Names</button>`:''}</div>`;
// segments are [start,end,flags] over a section's text; toggling a flag already on every character removes it
const paint=(list,s0,e0,t)=>{const out=[],mid=[];
 list.forEach(([a,b,f])=>{if(b<=s0||a>=e0){out.push([a,b,f]);return}if(a<s0)out.push([a,s0,f]);if(b>e0)out.push([e0,b,f]);mid.push([Math.max(a,s0),Math.min(b,e0),f])});
 mid.sort((x,y)=>x[0]-y[0]);const full=[];let c=s0;mid.forEach(([a,b,f])=>{if(a>c)full.push([c,a,'']);full.push([a,b,f]);c=b});if(c<e0)full.push([c,e0,'']);
 const on=t!=='x'&&full.every(x=>x[2].includes(t));
 full.forEach(x=>{x[2]=t==='x'?'':on?x[2].replace(t,''):canon(x[2]+t)});
 const m=[];[...out,...full.filter(x=>x[2])].sort((x,y)=>x[0]-y[0]).forEach(x=>{const p=m[m.length-1];if(p&&p[1]===x[0]&&p[2]===x[2])p[1]=x[1];else m.push([...x])});return m};
const wrap=(html,segs)=>{const d=document.createElement('div');d.innerHTML=html;
 const w=document.createTreeWalker(d,NodeFilter.SHOW_TEXT),L=[];let p=0,n;while((n=w.nextNode())){L.push([n,p,p+n.data.length]);p+=n.data.length}
 L.forEach(([n,a,b])=>{if(n.parentElement&&n.parentElement.closest('svg'))return;const hit=segs.filter(([x,y])=>y>a&&x<b);if(!hit.length)return;const fr=document.createDocumentFragment(),tx=n.data;let c=0;
  hit.forEach(([x,y,f])=>{const i=Math.max(x,a)-a,j=Math.min(y,b)-a;if(i>c)fr.append(tx.slice(c,i));const sp=document.createElement('span');sp.className='a '+[...f].map(k=>'a-'+k).join(' ');sp.textContent=tx.slice(i,j);fr.append(sp);c=j});
  if(c<tx.length)fr.append(tx.slice(c));n.replaceWith(fr)});return d.innerHTML};
const htmlTxt=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent};
// Names and places inside the live NLT text: find the verse each piece of text belongs to, then mark names the same way as in the KJV
const nmNLT=(h,b,c)=>{const d=document.createElement('div');d.innerHTML=h;let v=0;const T=[],w=document.createTreeWalker(d,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){if(n.nodeType===1){const a=n.getAttribute('vn');if(a&&/^\d+$/.test(a))v=+a;else if(n.classList.contains('vn')){const t=parseInt(n.textContent,10);if(t>0)v=t}}
  else if(v&&n.data.trim()&&n.parentElement&&!n.parentElement.closest('.vn,.tn,.footnote,.a-tn,sup,a,h1,h2,h3,h4,.bk_ch_vs_header,.subhead'))T.push([n,v])}
 T.forEach(([n,v])=>{const x=NM.mark(b,c,v,n.data);if(x===esc(n.data))return;const t=document.createElement('template');t.innerHTML=x;n.replaceWith(t.content)});return d.innerHTML};
const txtOf=(id,i)=>{if(id.startsWith('NLT:')){const h=NC[id.slice(4)];return typeof h==='string'?htmlTxt(h):null}const n=getN(id),x=n&&n.secs[i];return x?secTxt(x):null};
const markSel=(id,t)=>{const A=ST.an[id]||(ST.an[id]={});
 U.sel.forEach(({i,s:a,e:b})=>{const tx=txtOf(id,i);if(tx==null)return;const h=hash(tx),cur=A[i]&&A[i].h===h?A[i].r:[],r=paint(cur,a,b,t);if(r.length)A[i]={h,r};else delete A[i]});
 if(!Object.keys(A).length)delete ST.an[id]};
// keep marks in place when a note's text is edited: marks before the change stay, marks after it shift, marks inside it are dropped
const shift=(r,a,b)=>{if(a===b)return r;const m=Math.min(a.length,b.length);let p=0;while(p<m&&a[p]===b[p])p++;let q=0;while(q<m-p&&a[a.length-1-q]===b[b.length-1-q])q++;const d=b.length-a.length,cut=a.length-q;
 return r.filter(([x,y])=>y<=p||x>=cut).map(([x,y,f])=>y<=p?[x,y,f]:[x+d,y+d,f])};
const remap=(id,old,nw)=>{const A=ST.an[id];if(!A)return;const out={};
 nw.forEach((x,i)=>{if(x.oi==null)return;const o=A[x.oi],os=old.secs[x.oi];if(!o||!os)return;const a=secTxt(os);if(o.h!==hash(a))return;const b=secTxt(x),r=shift(o.r,a,b);if(r.length)out[i]={h:hash(b),r}});
 if(Object.keys(out).length)ST.an[id]=out;else delete ST.an[id]};
const nm=BIB.map(x=>x[0]).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),RE=new RegExp(`\\b(${nm}) (\\d{1,3})(?::\\d+(?:[–-]\\d+)?)?`,'g');
const link=h=>h.replace(/>([^<]+)</g,(m,t)=>'>'+t.replace(RE,(s,n,c)=>{const b=BIB.findIndex(x=>x[0]===n);return b<0||+c>BIB[b][1]?s:`<a class="xr" data-sx="ref:${b}:${c}" href="#">${s}</a>`})+'<');
const TXT=window.NOTES.map(n=>({id:n.id,t:(n.title+' '+n.sum+' '+n.secs.map(s=>s.h.replace(/<[^>]+>/g,' ')).join(' ')).toLowerCase()}));
const step=d=>{let b=ST.bk,c=ST.ch+d;if(c<1){if(b===0)return;b--;c=BIB[b][1]}else if(c>BIB[b][1]){if(b===65)return;b++;c=1}ST.bk=b;ST.ch=c};
const sel=()=>`<div class="pick"><select id="sxb" aria-label="Book"><optgroup label="Old Testament">${BIB.slice(0,39).map((x,i)=>`<option value="${i}" ${i===ST.bk?'selected':''}>${x[0]}</option>`).join('')}</optgroup><optgroup label="New Testament">${BIB.slice(39).map((x,i)=>`<option value="${i+39}" ${i+39===ST.bk?'selected':''}>${x[0]}</option>`).join('')}</optgroup></select><select id="sxc" aria-label="Chapter">${[...Array(BIB[ST.bk][1])].map((_,i)=>`<option ${i+1===ST.ch?'selected':''}>${i+1}</option>`).join('')}</select></div>`;
function body(){const k=`${ST.bk}:${ST.ch}`,r=encodeURIComponent(ref()),v=ST.ver;
 if(v==='KJV'){load();if(!KJV)return U.err?'<div class="empty">Could not load the KJV text. Check that kjv.json is next to index.html.</div>':'<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  return `<div class="scr" style="font-size:${ST.fs}px">${KJV[ST.bk].chapters[ST.ch-1].map((t,i)=>`<span class="vs${vcls(ST.hl[k+':'+(i+1)])}" data-sx="vs:${i+1}"><sup${NM.ev(ST.bk,ST.ch,i+1)}>${i+1}</sup>${ST.nm&&NM.ready()?NM.mark(ST.bk,ST.ch,i+1,t):esc(t)} </span>`).join('')}</div><p class="mute" style="margin:14px 0 0">Pick a tool above, then tap a verse to mark it. Tap it again to remove the mark.${ST.nm?' Underlined names and places show their meaning and original Hebrew, Aramaic or Greek when you hover over them (tap on a phone). Click one for the full details.':''} King James Version, public domain, works offline.</p>`}
 if(v==='TAM'){loadT();if(!TAM)return U.errT?'<div class="empty">Could not load the Tamil text. Check that tamil.json is next to index.html.</div>':'<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  return `<div class="scr tam" style="font-size:${ST.fs}px">${TAM[ST.bk].chapters[ST.ch-1].map((t,i)=>`<span class="vs${vcls(ST.hl[k+':'+(i+1)])}" data-sx="vs:${i+1}"><sup>${i+1}</sup>${esc(t)} </span>`).join('')}</div><p class="mute" style="margin:14px 0 0">Tamil Bible, works offline. Pick a tool above, then tap a verse to mark it. Marks are shared with the KJV verse of the same number. The people and places in this chapter are listed below; tap one for its details.</p>`}
 if(v==='NLT'){if(NC[k]){let h=NC[k];if(ST.nm&&NM.ready())h=nmNLT(h,ST.bk,ST.ch);const a=ST.an['NLT:'+k]&&ST.an['NLT:'+k][0];if(a&&a.r.length&&a.h===hash(htmlTxt(h)))h=wrap(h,a.r);return `<div class="scr nlt" style="font-size:${ST.fs}px">${h}</div><p class="mute">New Living Translation, loaded live from api.nlt.to. To mark text, select it and tap Highlight, Underline or Important.${ST.nm?' Underlined names and places show their details when you hover over them (tap on a phone). Names are matched by their King James spelling, so a few modern spellings may not be underlined.':''}</p>`};
  if(NC[k]===0)return ext('NLT',`https://www.biblegateway.com/passage/?search=${r}&version=NLT`,'The live NLT feed is unavailable right now (it needs internet).');
  if(NC[k]===null)return '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  NC[k]=null;const lang=h=>{const t=htmlTxt(h),a=t.slice(0,160),b=t.slice(0,600);return /\b(NTV|NVI|RVR)\b/.test(a)||(/[áéíóúñ¿¡]/.test(b)&&/ (el|la|los|las|del|que|y) /.test(b))},
   get=n=>fetch(`https://api.nlt.to/api/passages?ref=${r}${n?'':'&version=NLT'}&key=TEST${n?'&_='+Date.now():''}`,{headers:{'Accept-Language':'en'}}).then(x=>x.text()).then(h=>{const d=new DOMParser().parseFromString(h,'text/html');d.querySelectorAll('script,style,link,iframe').forEach(e=>e.remove());d.querySelectorAll('*').forEach(e=>[...e.attributes].forEach(a=>/^on/i.test(a.name)&&e.removeAttribute(a.name)));const o=d.body.innerHTML.trim();if(!o||lang(o))throw 0;return o});
  get(0).catch(()=>get(1)).then(o=>{NC[k]=o;if(tab==='study'&&U.sub==='read')render()}).catch(()=>{NC[k]=0;if(tab==='study'&&U.sub==='read')render()});return '<div class="skel"></div><div class="skel"></div><div class="skel"></div>'}
 return ext('NIV',`https://www.biblegateway.com/passage/?search=${r}&version=NIV`,'Opens in BibleGateway.')}
const ext=(v,u,t)=>`<div class="extc"><div class="big2" style="font-family:var(--serif)">${VER[v]} · ${esc(ref())}</div><p class="mute">${t}</p><a class="btn" href="${u}" target="_blank" rel="noopener">Open ${VER[v]} · ${esc(ref())} ↗</a><p class="mute" style="margin-top:14px"></p></div>`;
const nmList=()=>{if(ST.ver==='NIV')return '';load();if(!NM.ready()){if(!U.nmReq){U.nmReq=1;NM.load(()=>{U.nmReq=0;rr()})}return NM.err?'':'<p class="mute" style="margin-top:14px">Loading names and places…</p>'}
 const ch=(KJV||TAM)&&(KJV||TAM)[ST.bk].chapters[ST.ch-1],G=ch&&NM.chapter(ST.bk,ST.ch,ch.length);if(!G)return '';const tot=G.p.length+G.l.length+G.o.length;
 return `<details class="nmlist" ${U.nmopen?'open':''}><summary>People and places in this chapter <span class="nmtag">${tot}</span></summary>${tot?[['p','People and groups'],['l','Places'],['o','Titles, festivals and other names']].filter(g=>G[g[0]].length).map(([k,l])=>`<div class="nmgrp"><b>${l}</b><div class="nmcs">${G[k].map(i=>NM.chip(i)).join('')}</div></div>`).join(''):'<p class="mute">No named people or places are recorded in this chapter.</p>'}</details>`};
const read=()=>`<div class="seg" role="tablist">${Object.entries(VER).map(([k,l])=>`<button class="${ST.ver===k?'on':''}" data-sx="ver:${k}">${l}</button>`).join('')}</div>
<div class="card rd"><div class="rdh">${sel()}<div class="tools"><button class="g s" data-sx="fs:-1" aria-label="Smaller text">A−</button><button class="g s" data-sx="fs:1" aria-label="Larger text">A+</button></div></div>
${ST.ver==='KJV'||ST.ver==='TAM'||ST.ver==='NLT'?tools(ST.ver==='KJV'||ST.ver==='NLT'):''}<h2 class="ref">${esc(ref())}</h2>${body()}${nmList()}
<div class="rdf"><button class="g" data-sx="nav:-1">‹ Previous</button><button data-sx="mark">${rcv(ST.bk,ST.ch-1)?'✓ Read · mark again':'Mark chapter read'}</button><button class="g" data-sx="note">＋ Note</button><button class="g" data-sx="nav:1">Next ›</button></div>${U.msg?`<p class="mute" style="text-align:center">${U.msg}</p>`:''}</div>`;
const clean=h=>{const d=new DOMParser().parseFromString('<body>'+h+'</body>','text/html');d.querySelectorAll('script,style,iframe,object,embed,link,meta,form').forEach(e=>e.remove());d.body.querySelectorAll('*').forEach(e=>{if(e.closest('.jm'))return;const c=/^(tw|b|imp|sm|hint|jr|rf|jm|dg|tw sm)$/.test(e.className)?e.className:'';[...e.attributes].forEach(a=>e.removeAttribute(a.name));if(c)e.className=c});return d.body.innerHTML};
const plain=h=>h.replace(/<[^>]+>/g,' ');
const tx=n=>(n.title+' '+(n.sum||'')+' '+n.secs.map(s=>s.t+' '+plain(s.h)).join(' ')).toLowerCase();
const all=()=>[...window.NOTES.filter(n=>!ST.del[n.id]).map(n=>({...(ST.ov[n.id]||n),id:n.id,cat:n.cat,orig:1,edited:!!ST.ov[n.id]})),...ST.my.map(m=>({...m,mine:1}))];
const getN=id=>all().find(n=>n.id===id);
const CATS=['All','Topics','People','Journeys','Guides','Mine'],catOf=n=>n.mine?'Mine':(n.cat||'Guides'),vis=(n,q)=>(!q||tx(n).includes(q))&&(!U.cat||catOf(n)===U.cat);
const lib=(list,mineTab)=>{const q=U.tq.toLowerCase();return `<input id="sxq" class="srch" placeholder="Search notes: prophet, king, Elijah, altar, Paul…" value="${esc(U.tq)}"><div class="catbar" role="toolbar" aria-label="Note categories">${CATS.map(c=>`<button class="g s ${(U.cat||'All')===c?'on':''}" data-sx="cat:${c}">${c}</button>`).join('')}</div><div class="ng"><button class="nc add" data-sx="newn"><span class="ni">＋</span><b>Create a note</b><span class="mute">Title, summary and as many sections as you like, just like the study notes.</span></button>${list.map(n=>`<button class="nc" data-nid="${n.id}" data-sx="open:${n.id}" ${vis(n,q)?'':'hidden'}><span class="ni">${n.ico||'📝'}</span>${n.mine?'<span class="tag">Mine</span>':n.edited?'<span class="tag">Edited</span>':''}<b>${esc(n.title)}</b><span class="mute">${esc(n.sum||'')}</span><small>${n.secs.length} section${n.secs.length===1?'':'s'} · tap to open</small></button>`).join('')}</div>${mineTab&&!list.length?'<p class="mute" style="text-align:center;margin-top:18px">Your own notes will appear here.</p>':''}${!mineTab&&Object.keys(ST.del).length?`<details class="deln" ${U.dopen?'open':''}><summary>Deleted notes (${Object.keys(ST.del).length})</summary>${window.NOTES.filter(n=>ST.del[n.id]).map(n=>`<div class="item"><span class="ni" style="font-size:22px">${n.ico||'📝'}</span><div class="t"><b>${esc(n.title)}</b></div><button class="s" data-sx="restore:${n.id}">Restore</button></div>`).join('')}${Object.keys(ST.del).length>1?'<div style="margin-top:10px"><button class="g s" data-sx="restoreall">Restore all</button></div>':''}</details>`:''}`};
const sec=(n,i)=>{const s=n.secs[i];let h=(s.hd?`<h1>${esc(s.t)}</h1>`:'')+link(s.h);const a=ST.an[n.id]&&ST.an[n.id][i];if(a&&a.r.length&&a.h===hash(secTxt(s)))h=wrap(h,a.r);return `<section id="sxs${i}">${h}</section>`};
const view=()=>{const n=getN(U.nid);return `<div class="row"><button class="g s" data-sx="back">‹ All notes</button><span class="acts"><button class="s" data-sx="edit">✎ Edit</button>${n.edited?'<button class="g s" data-sx="ereset">Reset to original</button>':''}<button class="g s" data-sx="edel">Delete</button></span></div><div class="card nb"><h2 class="ref">${n.ico||'📝'} ${esc(n.title)}</h2><p class="mute">${esc(n.sum||'')} Scripture references are tappable and open the chapter in the reader. To mark text, select it and tap Highlight, Underline or Important.</p><div class="chips">${tools()}${n.secs.map((s,i)=>`<button class="g s" data-sx="sec:${i}">${esc(s.t)}</button>`).join('')}</div>${n.secs.map((s,i)=>sec(n,i)).join('')}</div>`};
const ICOS=['📖','📝','🔥','👑','⏳','✨','🕊️','🙏','⛪','🌿','📜','💡'];
const secEd=(s,i,n)=>`<div class="ed-sec" data-oi="${s.oi==null?'':s.oi}"><div class="row"><span class="mute">Section ${i+1}</span><span><button class="s g" data-sx="up:${i}" ${i?'':'disabled'} aria-label="Move up">↑</button> <button class="s g" data-sx="dn:${i}" ${i<n-1?'':'disabled'} aria-label="Move down">↓</button> <button class="s g" data-sx="delsec:${i}">Remove</button></span></div><input class="sxst" placeholder="Section heading, e.g. Key events" value="${esc(s.t)}"><div class="rte" contenteditable="true" data-ph="Write here. Use the toolbar for headings, bullets and highlights.">${s.h}</div></div>`;
const editor=()=>{const e=U.edit;return `<div class="card ed"><h2>${e.id?'Edit note':'New note'}</h2><div class="icos">${ICOS.map(x=>`<button class="ic${x===e.ico?' on':''}" data-sx="ico:${x}" aria-label="Icon ${x}">${x}</button>`).join('')}</div><input id="sxet" class="edt" placeholder="Note title" value="${esc(e.title)}"><input id="sxes" placeholder="One-line summary shown on the card" value="${esc(e.sum)}"><div class="tb" role="toolbar" aria-label="Formatting"><button data-sx="fmt:bold"><b>B</b></button><button data-sx="fmt:italic"><i>I</i></button><button data-sx="fmt:h2">Heading</button><button data-sx="fmt:p">Text</button><button data-sx="fmt:list">• List</button><button data-sx="fmt:mark">Highlight</button><button data-sx="fmt:u"><u>Underline</u></button><button data-sx="fmt:imp">Important</button><button data-sx="fmt:clear">Clear</button></div>${e.secs.map((s,i)=>secEd(s,i,e.secs.length)).join('')}<button class="g addsec" data-sx="addsec">＋ Add section</button><div class="edbar"><button data-sx="esave">Save note</button><button class="g" data-sx="ecancel">Cancel</button></div></div>`};
const pull=()=>{const e=U.edit;if(!e||!$('#sxet'))return;e.title=$('#sxet').value;e.sum=$('#sxes').value;e.secs=[...document.querySelectorAll('.ed-sec')].map(x=>({t:x.querySelector('.sxst').value,h:x.querySelector('.rte').innerHTML,oi:x.dataset.oi===''?undefined:+x.dataset.oi}))};
const blank=(t)=>({title:t||'',sum:'',ico:'📝',secs:[{t:'Key points',h:'<p><br></p>'}]});
views.study=()=>{const mc=all().filter(x=>x.mine).sort((a,b)=>b.ts-a.ts),n=U.nid&&getN(U.nid);return `<div class="seg main">${[['read','Read Bible'],['notes','Study notes']].map(([k,l])=>`<button class="${U.sub===k?'on':''}" data-sx="sub:${k}">${l}</button>`).join('')}</div>${U.sub==='read'&&!U.edit?read():U.edit?editor():n?view():lib([...mc,...all().filter(x=>x.orig)],0)}`};
const go=()=>{render();flash()};
document.addEventListener('mousedown',e=>{if(e.target.closest('.tb button,.rtools button'))e.preventDefault()});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.rtools'))U.sel=null});
const selCtx=()=>{if(tab!=='study')return null;if(U.sub==='read'&&ST.ver==='NLT')return{id:`NLT:${ST.bk}:${ST.ch}`,els:[...document.querySelectorAll('.scr.nlt')]};if(U.nid&&!U.edit)return{id:U.nid,els:[...document.querySelectorAll('.nb section[id^="sxs"]')]};return null};
document.addEventListener('selectionchange',()=>{const cx=selCtx();if(!cx)return;const g=getSelection();if(!g||!g.rangeCount||g.isCollapsed)return;const r=g.getRangeAt(0),out=[];
 cx.els.forEach(sc=>{if(!r.intersectsNode(sc))return;const sr=document.createRange();sr.selectNodeContents(sc);const c=r.cloneRange();
  if(c.compareBoundaryPoints(Range.START_TO_START,sr)<0)c.setStart(sr.startContainer,sr.startOffset);if(c.compareBoundaryPoints(Range.END_TO_END,sr)>0)c.setEnd(sr.endContainer,sr.endOffset);
  const pre=document.createRange();pre.selectNodeContents(sc);pre.setEnd(c.startContainer,c.startOffset);const a=pre.toString().length,b=a+c.toString().length;if(b>a)out.push({i:sc.id&&sc.id.startsWith('sxs')?+sc.id.slice(3):0,s:a,e:b})});
 if(out.length){U.sel=out;U.selId=cx.id}});
document.addEventListener('paste',e=>{if(!e.target.closest||!e.target.closest('.rte'))return;e.preventDefault();document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain'))});
document.addEventListener('click',e=>{const t=e.target.closest('[data-sx]');if(!t)return;e.preventDefault();const[a,x,y]=t.dataset.sx.split(':');U.msg='';
 if(a==='fmt'){const c=document.execCommand.bind(document);if(x==='bold')c('bold');else if(x==='italic')c('italic');else if(x==='h2')c('formatBlock',false,'H2');else if(x==='p')c('formatBlock',false,'P');else if(x==='list')c('insertUnorderedList');else if(x==='clear')c('removeFormat');else if(x==='mark'){const s=String(getSelection());if(s)c('insertHTML',false,'<mark>'+esc(s)+'</mark>')}else if(x==='u')c('underline');else if(x==='imp'){const s=String(getSelection());if(s)c('insertHTML',false,'<b class="imp">'+esc(s)+'</b>')}return}
 if(a==='sec'){const el=document.getElementById('sxs'+x);el&&el.scrollIntoView({behavior:'smooth',block:'start'});return}
 pull();const E=U.edit;let top=0;
 if(a==='sub'){if(E&&!confirm('Discard this unsaved note?'))return;U.sub=x;U.edit=null;U.nid=null;top=1}
 else if(a==='cat')U.cat=x==='All'?'':x;else if(a==='nmtog')ST.nm=!ST.nm;else if(a==='ver')ST.ver=x;else if(a==='nav'){step(+x);top=1}else if(a==='fs')ST.fs=Math.max(15,Math.min(32,ST.fs+(+x)*2));
 else if(a==='vs'){const k=`${ST.bk}:${ST.ch}:${x}`;if(ST.tool==='x')delete ST.hl[k];else{const f=tog(ST.hl[k],ST.tool);if(f)ST.hl[k]=f;else delete ST.hl[k]}}
 else if(a==='tool'){ST.tool=x;const cx=selCtx();if(cx&&U.sel&&U.sel.length&&U.selId===cx.id){markSel(cx.id,x);U.sel=null;const g=getSelection();g&&g.removeAllRanges&&g.removeAllRanges()}}
 else if(a==='mark'){rcs(ST.bk,ST.ch-1,1);U.msg=`${esc(ref())} marked as read.`}
 else if(a==='note'){U.sub='notes';U.nid=null;U.edit={...blank('Notes on '+ref()),sum:'Reading notes',secs:[{t:ref(),h:'<p><br></p>'}]};top=1}
 else if(a==='open'){U.nid=x;top=1}else if(a==='back'){U.nid=null;top=1}
 else if(a==='ref'){ST.bk=+x;ST.ch=+y;U.sub='read';U.nid=null;U.edit=null;top=1}
 else if(a==='newn'){U.edit=blank();top=1}
 else if(a==='edit'){const n=getN(U.nid);U.edit={id:n.id,orig:!!n.orig,title:n.title,sum:n.sum||'',ico:n.ico||'📝',secs:n.secs.map((s,i)=>({oi:i,t:s.t,h:s.h.replace(/^\s*<h[12][^>]*>[\s\S]*?<\/h[12]>/,'')||'<p><br></p>'}))};top=1}
 else if(a==='ico')E.ico=x;
 else if(a==='addsec')E.secs.push({t:'',h:'<p><br></p>'});
 else if(a==='delsec'){if(E.secs.length>1||confirm('Remove the only section?'))E.secs.splice(+x,1)}
 else if(a==='up'||a==='dn'){const i=+x,j=a==='up'?i-1:i+1;[E.secs[i],E.secs[j]]=[E.secs[j],E.secs[i]]}
 else if(a==='ecancel'){U.edit=null;top=1}
 else if(a==='esave'){const secs=E.secs.map(s=>({t:s.t.trim(),h:clean(s.h),hd:1,oi:s.oi})).filter(s=>s.t||plain(s.h).trim());secs.forEach(s=>{if(!s.t)s.t='Notes'});if(!E.title.trim()&&!secs.length)return alert('Add a title or some text first.');
  const old=E.id&&getN(E.id);if(old)remap(E.id,old,secs);
  const n={title:E.title.trim()||'Untitled',sum:E.sum.trim(),ico:E.ico||'📝',secs:secs.map(({oi,...r})=>r)};if(E.orig)ST.ov[E.id]=n;else{n.id=E.id||uid();n.ts=Date.now();ST.my=ST.my.filter(m=>m.id!==n.id);ST.my.push(n);E.id=n.id}
  U.nid=E.id;U.edit=null;top=1}
 else if(a==='edel'){const n=getN(U.nid);if(!n)return;if(!confirm(n.mine?'Delete this note permanently?':'Delete this study note? You can restore it from the Study notes list.'))return;
  if(n.mine)ST.my=ST.my.filter(m=>m.id!==U.nid);else{ST.del[U.nid]=1;delete ST.ov[U.nid]}delete ST.an[U.nid];U.nid=null;top=1}
 else if(a==='restore'){delete ST.del[x];U.dopen=1}else if(a==='restoreall'){ST.del={}}
 else if(a==='ereset'){if(!confirm('Discard your edits and restore the original note?'))return;const cur=getN(U.nid),o0=window.NOTES.find(z=>z.id===U.nid);if(cur&&o0)remap(U.nid,cur,o0.secs.map((z,i)=>({...z,oi:i})));delete ST.ov[U.nid];top=1}
 else return;
 save();go();if(top)scrollTo({top:0})});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='sxb'){ST.bk=+t.value;ST.ch=1;save();go()}else if(t.id==='sxc'){ST.ch=+t.value;save();go()}});
document.addEventListener('input',e=>{if(e.target.id!=='sxq')return;U.tq=e.target.value;const q=U.tq.toLowerCase();document.querySelectorAll('.nc[data-nid]').forEach(b=>{const n=getN(b.dataset.nid);b.hidden=!!n&&!vis(n,q)})});
})();