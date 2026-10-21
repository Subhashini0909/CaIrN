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
document.addEventListener('toggle',e=>{const c=e.target.classList;if(c&&c.contains('nmlist'))U.nmopen=e.target.open;if(c&&c.contains('bkp'))U.bk=e.target.open},true);
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
  return `<div class="scr" style="font-size:${ST.fs}px">${KJV[ST.bk].chapters[ST.ch-1].map((t,i)=>`<span class="vs${vcls(ST.hl[k+':'+(i+1)])}" data-sx="vs:${i+1}"><sup${NM.ev(ST.bk,ST.ch,i+1)}>${i+1}</sup>${ST.nm&&NM.ready()?NM.mark(ST.bk,ST.ch,i+1,t):esc(t)} </span>`).join('')}</div>`}
 if(v==='TAM'){loadT();if(!TAM)return U.errT?'<div class="empty">Could not load the Tamil text. Check that tamil.json is next to index.html.</div>':'<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  return `<div class="scr tam" style="font-size:${ST.fs}px">${TAM[ST.bk].chapters[ST.ch-1].map((t,i)=>`<span class="vs${vcls(ST.hl[k+':'+(i+1)])}" data-sx="vs:${i+1}"><sup>${i+1}</sup>${esc(t)} </span>`).join('')}</div>`}
 if(v==='NLT'){if(NC[k]){let h=NC[k];if(ST.nm&&NM.ready())h=nmNLT(h,ST.bk,ST.ch);const a=ST.an['NLT:'+k]&&ST.an['NLT:'+k][0];if(a&&a.r.length&&a.h===hash(htmlTxt(h)))h=wrap(h,a.r);return `<div class="scr nlt" style="font-size:${ST.fs}px">${h}</div>`};
  if(NC[k]===0)return ext('NLT',`https://www.biblegateway.com/passage/?search=${r}&version=NLT`,'The live NLT feed is unavailable right now (it needs internet).');
  if(NC[k]===null)return '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  NC[k]=null;const lang=h=>{const t=htmlTxt(h),a=t.slice(0,160),b=t.slice(0,600);return /\b(NTV|NVI|RVR)\b/.test(a)||(/[áéíóúñ¿¡]/.test(b)&&/ (el|la|los|las|del|que|y) /.test(b))},
   safeNlt=h=>{const d=new DOMParser().parseFromString(String(h),'text/html'),OK=new Set(['SECTION','DIV','P','SPAN','H1','H2','H3','H4','SUP','SUB','EM','I','B','STRONG','BR','A','UL','OL','LI','BLOCKQUOTE','SMALL','VERSE_EXPORT']),AT=new Set(['class','vn','bk','ch','orig']),walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3)return;if(c.nodeType!==1){c.remove();return}walk(c);if(!OK.has(c.tagName)){if(/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|FORM|SVG|MATH|LINK|META|BASE|NOSCRIPT|TEMPLATE|TITLE|HEAD|IMG|VIDEO|AUDIO|INPUT|BUTTON|TEXTAREA|SELECT)$/.test(c.tagName))c.remove();else c.replaceWith(...c.childNodes)}else[...c.attributes].forEach(a=>{if(!AT.has(a.name)||!/^[\w. -]*$/.test(a.value))c.removeAttribute(a.name)})})};walk(d.body);return d.body.innerHTML.trim()},
   get=n=>fetch(`https://api.nlt.to/api/passages?ref=${r}${n?'':'&version=NLT'}&key=TEST${n?'&_='+Date.now():''}`,{headers:{'Accept-Language':'en'}}).then(x=>x.text()).then(h=>{const o=safeNlt(h);if(!o||lang(o))throw 0;return o});
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
const SVG_TAGS=new Set(['figure','figcaption','svg','g','path','rect','circle','line','text','tspan','b','i','span']),SVG_ATTRS=new Set(['class','viewBox','viewbox','role','aria-label','width','height','d','fill','stroke','stroke-width','stroke-dasharray','stroke-linecap','stroke-linejoin','opacity','transform','x','y','cx','cy','r','rx','ry','x1','y1','x2','y2','text-anchor','fill-rule','xmlns','font-size']);
const clean=(h,strict)=>{const d=new DOMParser().parseFromString('<body>'+h+'</body>','text/html');d.querySelectorAll('script,style,iframe,object,embed,link,meta,form'+(strict?',svg,figure,img,video,audio,base':'')).forEach(e=>e.remove());d.body.querySelectorAll('*').forEach(e=>{if(!strict&&e.closest('.jm')){const t=e.tagName.toLowerCase();if(!SVG_TAGS.has(t)){e.remove();return}[...e.attributes].forEach(a=>{if(!SVG_ATTRS.has(a.name)||(a.name==='class'&&!/^[a-z0-9 ]*$/i.test(a.value)))e.removeAttribute(a.name)});return}const c=/^(tw|b|imp|sm|hint|jr|rf|jm|dg|tw sm)$/.test(e.className)?e.className:'';[...e.attributes].forEach(a=>e.removeAttribute(a.name));if(c)e.className=c});return d.body.innerHTML};
ST.my.forEach(n=>{if(n&&Array.isArray(n.secs))n.secs.forEach(x=>{x.h=clean(String(x&&x.h||''),1)})});Object.keys(ST.ov).forEach(k=>{const n=ST.ov[k];if(n&&Array.isArray(n.secs))n.secs.forEach(x=>{x.h=clean(String(x&&x.h||''))})});
const plain=h=>h.replace(/<[^>]+>/g,' ');
const tx=n=>(n.title+' '+(n.sum||'')+' '+n.secs.map(s=>s.t+' '+plain(s.h)).join(' ')).toLowerCase();
const all=()=>[...window.NOTES.filter(n=>!ST.del[n.id]).map(n=>({...(ST.ov[n.id]||n),id:n.id,cat:n.cat,orig:1,edited:!!ST.ov[n.id]})),...ST.my.map(m=>({...m,mine:1}))];
const getN=id=>all().find(n=>n.id===id);
const CATS=['All','Topics','People','Journeys','Guides','Mine'],catOf=n=>n.mine?'Mine':(n.cat||'Guides'),vis=(n,q)=>(!q||tx(n).includes(q))&&(!U.cat||catOf(n)===U.cat);
const lib=(list,mineTab)=>{const q=U.tq.toLowerCase();return `<input id="sxq" class="srch" placeholder="Search notes: prophet, king, Elijah, altar, Paul…" value="${esc(U.tq)}"><div class="catbar" role="toolbar" aria-label="Note categories">${CATS.map(c=>`<button class="g s ${(U.cat||'All')===c?'on':''}" data-sx="cat:${c}">${c}</button>`).join('')}</div>${bkPanel()}<div class="ng"><button class="nc add" data-sx="newn"><span class="ni">＋</span><b>Create a note</b></button>${list.map(n=>`<button class="nc" data-nid="${n.id}" data-sx="open:${n.id}" ${vis(n,q)?'':'hidden'}><span class="ni">${n.ico||'📝'}</span>${n.mine?'<span class="tag">Mine</span>':n.edited?'<span class="tag">Edited</span>':''}<b>${esc(n.title)}</b><span class="mute">${esc(n.sum||'')}</span><small>${n.secs.length} section${n.secs.length===1?'':'s'} · tap to open</small></button>`).join('')}</div>${mineTab&&!list.length?'<p class="mute" style="text-align:center;margin-top:18px">Your own notes will appear here.</p>':''}${!mineTab&&Object.keys(ST.del).length?`<details class="deln" ${U.dopen?'open':''}><summary>Deleted notes (${Object.keys(ST.del).length})</summary>${window.NOTES.filter(n=>ST.del[n.id]).map(n=>`<div class="item"><span class="ni" style="font-size:22px">${n.ico||'📝'}</span><div class="t"><b>${esc(n.title)}</b></div><button class="s" data-sx="restore:${n.id}">Restore</button></div>`).join('')}${Object.keys(ST.del).length>1?'<div style="margin-top:10px"><button class="g s" data-sx="restoreall">Restore all</button></div>':''}</details>`:''}`};
const sec=(n,i)=>{const s=n.secs[i];let h=(s.hd?`<h1>${esc(s.t)}</h1>`:'')+link(s.h);const a=ST.an[n.id]&&ST.an[n.id][i];if(a&&a.r.length&&a.h===hash(secTxt(s)))h=wrap(h,a.r);return `<section id="sxs${i}">${h}</section>`};
const view=()=>{const n=getN(U.nid);return `<div class="row"><button class="g s" data-sx="back">‹ All notes</button><span class="acts"><button class="s" data-sx="edit">✎ Edit</button><button class="g s" data-sx="shr">Share</button><button class="g s" data-sx="sav">Save file</button>${n.edited?'<button class="g s" data-sx="ereset">Reset to original</button>':''}<button class="g s" data-sx="edel">Delete</button></span></div><div class="card nb"><h2 class="ref">${n.ico||'📝'} ${esc(n.title)}</h2><p class="mute">${esc(n.sum||'')}</p><div class="chips">${tools()}${n.secs.map((s,i)=>`<button class="g s" data-sx="sec:${i}">${esc(s.t)}</button>`).join('')}</div>${n.secs.map((s,i)=>sec(n,i)).join('')}</div>`};
const ICOS=['📖','📝','🔥','👑','⏳','✨','🕊️','🙏','⛪','🌿','📜','💡'];
const secEd=(s,i,n)=>`<div class="ed-sec" data-oi="${s.oi==null?'':s.oi}"><div class="row"><span class="mute">Section ${i+1}</span><span><button class="s g" data-sx="up:${i}" ${i?'':'disabled'} aria-label="Move up">↑</button> <button class="s g" data-sx="dn:${i}" ${i<n-1?'':'disabled'} aria-label="Move down">↓</button> <button class="s g" data-sx="delsec:${i}">Remove</button></span></div><input class="sxst" placeholder="Section heading, e.g. Key events" value="${esc(s.t)}"><div class="rte" contenteditable="true" data-ph="Write here. Use the toolbar for headings, bullets and highlights.">${s.h}</div></div>`;
const editor=()=>{const e=U.edit;return `<div class="card ed"><h2>${e.id?'Edit note':'New note'}</h2><div class="icos">${ICOS.map(x=>`<button class="ic${x===e.ico?' on':''}" data-sx="ico:${x}" aria-label="Icon ${x}">${x}</button>`).join('')}</div><input id="sxet" class="edt" placeholder="Note title" value="${esc(e.title)}"><input id="sxes" placeholder="One-line summary shown on the card" value="${esc(e.sum)}"><div class="tb" role="toolbar" aria-label="Formatting"><button data-sx="fmt:bold"><b>B</b></button><button data-sx="fmt:italic"><i>I</i></button><button data-sx="fmt:h2">Heading</button><button data-sx="fmt:p">Text</button><button data-sx="fmt:list">• List</button><button data-sx="fmt:mark">Highlight</button><button data-sx="fmt:u"><u>Underline</u></button><button data-sx="fmt:imp">Important</button><button data-sx="fmt:clear">Clear</button></div>${e.secs.map((s,i)=>secEd(s,i,e.secs.length)).join('')}<button class="g addsec" data-sx="addsec">＋ Add section</button><div class="edbar"><button data-sx="esave">Save note</button><button class="g" data-sx="ecancel">Cancel</button></div></div>`};
const pull=()=>{const e=U.edit;if(!e||!$('#sxet'))return;e.title=$('#sxet').value;e.sum=$('#sxes').value;e.secs=[...document.querySelectorAll('.ed-sec')].map(x=>({t:x.querySelector('.sxst').value,h:x.querySelector('.rte').innerHTML,oi:x.dataset.oi===''?undefined:+x.dataset.oi}))};
const blank=(t)=>({title:t||'',sum:'',ico:'📝',secs:[{t:'Key points',h:'<p><br></p>'}]});
// ---- Search: whole Bible (King James or Tamil, works offline) and all notes ----
const SQ={n:80,t:0},TRE={};
const nrm=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const ALIAS={jn:'John',mt:'Matthew',mk:'Mark',lk:'Luke',ps:'Psalms',pss:'Psalms',prov:'Proverbs',song:'Song of Solomon',sos:'Song of Solomon',rev:'Revelation',phil:'Philippians',phm:'Philemon',heb:'Hebrews',jas:'James',gen:'Genesis',ex:'Exodus',deut:'Deuteronomy',isa:'Isaiah',jer:'Jeremiah',eze:'Ezekiel',dan:'Daniel',rom:'Romans',gal:'Galatians',eph:'Ephesians',col:'Colossians'};
const bookOf=t=>{const k=nrm(t);if(k.length<2)return -1;const nm=ALIAS[k]?nrm(ALIAS[k]):k;let i=BIB.findIndex(b=>nrm(b[0])===nm);if(i<0)i=BIB.findIndex(b=>nrm(b[0]).startsWith(nm));return i};
const parseRef=q=>{const m=q.trim().match(/^((?:[1-3]\s*)?[A-Za-z][A-Za-z .]*?)\s*(\d+)(?:\s*[:.]\s*(\d+))?(?:\s*[-\u2013]\s*\d+)?$/);if(!m)return null;const b=bookOf(m[1]);if(b<0)return null;const c=+m[2];if(c<1||c>BIB[b][1])return null;return{b,c,v:m[3]?+m[3]:0}};
const terms=q=>{const t=[];q.replace(/"([^"]+)"|(\S+)/g,(m,a,b)=>{const w=(a||b).trim().toLowerCase();if(w)t.push(w)});return t};
const reEsc=w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// a word matches at the start of a word (love finds loved and loveth, but not beloved); Tamil matches anywhere inside a word
const tre=(w,b)=>{const k=(b?'1':'0')+w;return TRE[k]||(TRE[k]=new RegExp((b?'(^|[^\\p{L}\\p{N}])':'')+reEsc(w),'iu'))};
const mk=(T,b)=>new RegExp((b?'(^|[^\\p{L}\\p{N}])':'()')+'('+T.map(reEsc).join('|')+')','giu');
const hl=(text,re)=>{let o='',p=0,m;re.lastIndex=0;while((m=re.exec(text))){if(!m[2]){re.lastIndex++;continue}const st=m.index+m[1].length;o+=esc(text.slice(p,st))+'<mark class="sm">'+esc(m[2])+'</mark>';p=st+m[2].length}return o+esc(text.slice(p))};
const bibSearch=(T,lang)=>{const D=lang==='TAM'?TAM:KJV,b=lang!=='TAM',R=T.map(w=>tre(w,b)),out=[];D.forEach((bk,bi)=>{if(U.gt==='OT'&&bi>=39||U.gt==='NT'&&bi<39)return;bk.chapters.forEach((ch,ci)=>ch.forEach((t,vi)=>{if(R.every(r=>r.test(t)))out.push([bi,ci+1,vi+1,t])}))});return out};
const noteSearch=T=>{const R=T.map(w=>tre(w,1)),out=[];all().forEach(n=>{n.secs.forEach((s,i)=>{const body=plain(String(s.h||'').replace(/<figure[\s\S]*?<\/figure>/g,' ')).replace(/\s+/g,' ').trim(),full=n.title+' '+(n.sum||'')+' '+s.t+' '+body;if(R.every(r=>r.test(full))){const sc=T.reduce((a,w)=>a+(full.match(new RegExp(reEsc(w),'gi'))||[]).length,0)+T.reduce((a,w)=>a+(tre(w,1).test(n.title+' '+s.t)?8:0),0);out.push([n,i,body,sc])}})});return out.sort((a,b)=>b[3]-a[3])};
const snip=(body,T)=>{let at=-1;for(const w of T){const m=tre(w,1).exec(body);if(m){at=m.index+m[1].length;break}}if(at<0)return body.slice(0,150);const a=Math.max(0,at-60);return(a?'\u2026':'')+body.slice(a,at+140)+(at+140<body.length?'\u2026':'')};
const srRes=()=>{const q=(U.gq||'').trim(),sc=U.gsc||'all';
 if(q.length<2)return '';
 const T=terms(q),R=parseRef(q);let h='';
 if(R&&sc!=='notes')h+=`<button class="sr go" data-sx="gv:${R.b}.${R.c}.${R.v||1}"><b>Open ${esc(BIB[R.b][0])} ${R.c}${R.v?':'+R.v:''}</b><span>Go straight to this passage</span></button>`;
 if(sc!=='notes'){const lang=U.gl||'KJV';if(lang==='TAM')loadT();else load();const D=lang==='TAM'?TAM:KJV;
  if(!D)h+=(lang==='TAM'?U.errT:U.err)?'<p class="mute">The Bible text could not be loaded. Check that kjv.json and tamil.json are next to index.html.</p>':'<p class="mute" style="margin-top:12px">Loading the Bible text\u2026</p>';
  else{const res=bibSearch(T,lang),re=mk(T,lang!=='TAM'),shown=res.slice(0,SQ.n),bks=new Set(res.map(x=>x[0])).size;
   h+=`<h3 class="sh">${lang==='TAM'?'Tamil Bible':'King James Version'} <span class="nmtag">${res.length}</span>${res.length?`<small>${bks} book${bks===1?'':'s'}</small>`:''}</h3>`;
   h+=res.length?shown.map(([b,c,v,t])=>`<button class="sr" data-sx="gv:${b}.${c}.${v}"><b>${esc(BIB[b][0])} ${c}:${v}</b><span>${hl(t,re)}</span></button>`).join('')+(res.length>shown.length?`<button class="g s sr-more" data-sx="gmore">Show ${Math.min(80,res.length-shown.length)} more of ${res.length-shown.length} remaining</button>`:''):'<p class="mute">No verses found. Try fewer or different words.</p>'}}
 if(sc!=='bible'){const res=noteSearch(T),re=mk(T,1),shown=res.slice(0,40);
  h+=`<h3 class="sh">Study notes <span class="nmtag">${res.length}</span></h3>`;
  h+=res.length?shown.map(([n,i,body])=>`<button class="sr nr" data-sx="gn:${n.id}~${i}"><b>${esc(n.ico||'')} ${esc(n.title)} <i>\u203A ${esc(n.secs[i].t)}</i></b><span>${hl(snip(body,T),re)}</span></button>`).join('')+(res.length>shown.length?`<p class="mute">Showing the first ${shown.length} of ${res.length} sections.</p>`:''):'<p class="mute">No notes found.</p>'}
 return h};
const srch=()=>{const sc=U.gsc||'all',ch=(a,k,v,l)=>`<button class="g s ${(a||'')===v?'on':''}" data-sx="${k}:${v}">${l}</button>`;
 return `<input id="sxg" class="srch" type="search" placeholder="Search the Bible and your notes: love, \u201Cliving water\u201D, John 3:16" value="${esc(U.gq||'')}" autocomplete="off" enterkeyhint="search"><div class="catbar" role="toolbar" aria-label="Search options">${ch(sc,'gsc','all','Everything')}${ch(sc,'gsc','bible','Bible')}${ch(sc,'gsc','notes','Notes')}</div>${sc!=='notes'?`<div class="catbar">${ch(U.gl||'KJV','gl','KJV','King James')}${ch(U.gl||'KJV','gl','TAM','\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD')}<span class="sep"></span>${ch(U.gt||'','gt','','All books')}${ch(U.gt||'','gt','OT','Old Testament')}${ch(U.gt||'','gt','NT','New Testament')}</div>`:''}<div id="sxr">${srRes()}</div>`};
// ---- Backup, import and sharing ----
const dayStr=()=>new Date().toISOString().slice(0,10);
const dl=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800)};
const toast=m=>{let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{t.hidden=true},3600)};
const slug=t=>String(t||'note').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'note';
const isO=o=>o&&typeof o==='object'&&!Array.isArray(o),badKey=k=>k==='__proto__'||k==='constructor'||k==='prototype';
const noteMd=n=>{const out=['# '+((n.ico?n.ico+' ':'')+n.title).trim()];if(n.sum)out.push('',n.sum);n.secs.forEach(x=>{const d=document.createElement('div');d.innerHTML=String(x.h||'').replace(/<figure[\s\S]*?<\/figure>/g,'').replace(/<li[^>]*>/gi,'<br>- ').replace(/<\/(p|h[1-6]|tr|ul|ol|div)>/gi,'</$1><br>').replace(/<\/t[dh]>/gi,' | ');d.querySelectorAll('br').forEach(b=>b.replaceWith('\n'));out.push('','## '+(x.t||'Notes'),d.textContent.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim())});return out.join('\n')};
const noteJson=n=>JSON.stringify({app:'daylog-note',v:1,exported:new Date().toISOString(),note:{title:n.title,sum:n.sum||'',ico:n.ico||'\uD83D\uDCDD',secs:n.secs.map(x=>({t:x.t,h:x.h}))}},null,1);
const bkData=()=>({app:'daylog-study',v:1,exported:new Date().toISOString(),st:{hl:ST.hl,my:ST.my,ov:ST.ov,an:ST.an,del:ST.del},rc:S.rc||{}});
const bkCounts=()=>{const m=Object.keys(ST.hl).length,a=Object.keys(ST.an).length,my=ST.my.length,ed=Object.keys(ST.ov).length,pl=(n,w)=>n+' '+w+(n===1?'':'s');return `${pl(my,'own note')}, ${pl(ed,'edited note')}, ${pl(m,'marked verse')}, ${pl(a,'note')} with highlights`};
const bkPanel=()=>`<details class="bkp" ${U.bk?'open':''}><summary>Backup and sharing</summary><div class="bkrow"><button class="s" data-sx="bkx">\u2B07 Export backup</button><button class="g s" data-sx="impick:merge">\u2B06 Import and merge</button><button class="g s" data-sx="impick:replace">Import and replace</button><button class="g s" data-sx="bkmd">Download my notes as text</button></div><p class="mute small">${bkCounts()}. ${ST.bkat?'Last backup: '+new Date(ST.bkat).toLocaleDateString()+'.':'No backup made yet.'}</p></details>`;
const cleanNote=n=>{if(!isO(n)||!Array.isArray(n.secs))return null;const secs=n.secs.filter(isO).slice(0,80).map(x=>({t:String(x.t||'Notes').slice(0,200),h:clean(String(x.h||''),1),hd:1}));if(!secs.length)return null;return{title:String(n.title||'Untitled').slice(0,200),sum:String(n.sum||'').slice(0,500),ico:String(n.ico||'\uD83D\uDCDD').slice(0,8),secs}};
const flagOK=v=>typeof v==='string'&&/^[hui]+$/.test(v);
const cleanAn=o=>{const r={};Object.keys(o).forEach(i=>{const v=o[i];if(badKey(i)||!/^\d+$/.test(i)||!isO(v)||typeof v.h!=='number'||!Array.isArray(v.r))return;const q=v.r.filter(e=>Array.isArray(e)&&e.length>=3&&Number.isFinite(+e[0])&&Number.isFinite(+e[1])&&flagOK(String(e[2]))).slice(0,500).map(e=>[+e[0],+e[1],String(e[2])]);if(q.length)r[i]={h:v.h,r:q}});return r};
const doImport=(txt,mode)=>{let d;try{d=JSON.parse(txt)}catch{return alert('That file is not a valid backup.')}
 if(isO(d)&&d.app==='daylog-note'){const n=cleanNote(d.note);if(!n)return alert('That note file is damaged.');n.id=uid();n.ts=Date.now();ST.my.push(n);save();U.nid=n.id;U.sub='notes';U.from=0;U.edit=null;go();return toast('Note added to your own notes.')}
 const s=isO(d)&&(d.app==='daylog-study'||d.days)?d.st:null;if(!isO(s))return alert('That file is not a CaIrN study backup.');
 const hl={},ov={},an={},del={},rc={},my=(Array.isArray(s.my)?s.my:[]).map(m=>{const n=cleanNote(m);return n&&{...n,id:String(m.id||uid()).slice(0,60),ts:+m.ts||Date.now()}}).filter(Boolean);
 const H=isO(s.hl)?s.hl:{},O=isO(s.ov)?s.ov:{},A=isO(s.an)?s.an:{},D=isO(s.del)?s.del:{},R=isO(d.rc)?d.rc:{};
 Object.keys(H).forEach(k=>{if(!badKey(k)&&flagOK(H[k]))hl[k]=H[k]});
 Object.keys(O).forEach(k=>{if(badKey(k))return;const n=cleanNote(O[k]);if(n)ov[k]=n});
 Object.keys(A).forEach(k=>{if(badKey(k)||!isO(A[k]))return;const c=cleanAn(A[k]);if(Object.keys(c).length)an[k]=c});
 Object.keys(D).forEach(k=>{if(!badKey(k)&&D[k])del[k]=1});
 Object.keys(R).forEach(k=>{if(!badKey(k)&&Array.isArray(R[k])&&R[k].length<=200)rc[k]=R[k].map(x=>Math.max(0,Math.min(99,+x||0)))});
 let nH=0,nM=0,nO=0,nA=0;
 if(mode==='replace'){ST.hl=hl;ST.my=my;ST.ov=ov;ST.an=an;ST.del=del;S.rc=rc}
 else{Object.keys(hl).forEach(k=>{const m=canon((ST.hl[k]||'')+hl[k]);if(m!==ST.hl[k]){ST.hl[k]=m;nH++}});
  my.forEach(m=>{const i=ST.my.findIndex(x=>x.id===m.id);if(i<0){ST.my.push(m);nM++}else if((m.ts||0)>(ST.my[i].ts||0)){ST.my[i]=m;nM++}});
  Object.keys(ov).forEach(k=>{if(!ST.ov[k]){ST.ov[k]=ov[k];nO++}});
  Object.keys(an).forEach(k=>{const X=ST.an[k]||(ST.an[k]={});Object.keys(an[k]).forEach(i=>{if(!X[i]){X[i]=an[k][i];nA++}})});
  Object.keys(del).forEach(k=>{if(!ST.del[k]&&!ST.ov[k])ST.del[k]=1});
  Object.keys(rc).forEach(b=>{const a=S.rc[b]||(S.rc[b]=[]);rc[b].forEach((v,i)=>{if((a[i]||0)<v)a[i]=v})})}
 U.nid=null;U.edit=null;U.bk=1;save();go();
 toast(mode==='replace'?'Backup restored.':`Merged: ${nM} note${nM===1?'':'s'}, ${nO} edited note${nO===1?'':'s'}, ${nH} marked verse${nH===1?'':'s'}, ${nA} highlight${nA===1?'':'s'} added.`)};
const fileIn=()=>{let f=document.getElementById('sxi');if(!f){f=document.createElement('input');f.type='file';f.id='sxi';f.accept='.json,application/json';f.hidden=true;document.body.appendChild(f)}return f};
views.study=()=>{const mc=all().filter(x=>x.mine).sort((a,b)=>b.ts-a.ts),n=U.nid&&getN(U.nid);return `<div class="seg main">${[['read','Read Bible'],['notes','Study notes'],['search','Search']].map(([k,l])=>`<button class="${U.sub===k?'on':''}" data-sx="sub:${k}">${l}</button>`).join('')}</div>${U.sub==='read'&&!U.edit?read():U.edit?editor():n?view():U.sub==='search'?srch():lib([...mc,...all().filter(x=>x.orig)],0)}`};
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
 if(a==='sub'){if(E&&!confirm('Discard this unsaved note?'))return;U.sub=x;U.edit=null;U.nid=null;U.from=0;top=1}
 else if(a==='cat')U.cat=x==='All'?'':x;else if(a==='nmtog')ST.nm=!ST.nm;else if(a==='ver')ST.ver=x;else if(a==='nav'){step(+x);top=1}else if(a==='fs')ST.fs=Math.max(15,Math.min(32,ST.fs+(+x)*2));
 else if(a==='vs'){const k=`${ST.bk}:${ST.ch}:${x}`;if(ST.tool==='x')delete ST.hl[k];else{const f=tog(ST.hl[k],ST.tool);if(f)ST.hl[k]=f;else delete ST.hl[k]}}
 else if(a==='tool'){ST.tool=x;const cx=selCtx();if(cx&&U.sel&&U.sel.length&&U.selId===cx.id){markSel(cx.id,x);U.sel=null;const g=getSelection();g&&g.removeAllRanges&&g.removeAllRanges()}}
 else if(a==='mark'){rcs(ST.bk,ST.ch-1,1);U.msg=`${esc(ref())} marked as read.`}
 else if(a==='note'){U.sub='notes';U.nid=null;U.edit={...blank('Notes on '+ref()),sum:'Reading notes',secs:[{t:ref(),h:'<p><br></p>'}]};top=1}
 else if(a==='open'){U.nid=x;top=1}else if(a==='back'){U.nid=null;if(U.from){U.sub='search';U.from=0}top=1}
 else if(a==='bkx'){ST.bkat=Date.now();save();dl(`daylog-study-backup-${dayStr()}.json`,JSON.stringify(bkData(),null,1));go();return toast('Backup saved to your downloads.')}
 else if(a==='bkmd'){const ns=all().filter(n=>n.mine||n.edited);if(!ns.length)return toast('You have no own or edited notes yet.');return dl(`daylog-my-notes-${dayStr()}.md`,ns.map(noteMd).join('\n\n---\n\n'),'text/markdown')}
 else if(a==='impick'){U.imode=x;U.bk=1;const f=fileIn();f.value='';f.click();return}
 else if(a==='shr'){const n=getN(U.nid);if(!n)return;const text=noteMd(n);if(navigator.share)navigator.share({title:n.title,text}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>toast('Note copied. Paste it into a message or email.'),()=>dl(slug(n.title)+'.md',text,'text/markdown'));else dl(slug(n.title)+'.md',text,'text/markdown');return}
 else if(a==='sav'){const n=getN(U.nid);if(!n)return;dl(`${slug(n.title)}.daylog-note.json`,noteJson(n));return toast('Note file saved. Import it on another device from Study notes, Backup and sharing.')}
 else if(a==='gsc'){U.gsc=x;SQ.n=80}else if(a==='gl'){U.gl=x;SQ.n=80}else if(a==='gt'){U.gt=x;SQ.n=80}else if(a==='gmore')SQ.n+=80
 else if(a==='gv'){const[b,c,v]=x.split('.').map(Number);ST.bk=b;ST.ch=c;ST.ver=U.gl==='TAM'?'TAM':'KJV';U.sub='read';U.nid=null;U.edit=null;U.flash=v;U.from=0}
 else if(a==='gn'){const[id,si]=x.split('~');U.nid=id;U.sub='notes';U.from='search';U.edit=null;save();go();setTimeout(()=>{const el=document.getElementById('sxs'+si);el&&el.scrollIntoView({block:'start'})},60);return}
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
document.addEventListener('change',e=>{const t=e.target;if(t.id==='sxi'){const f=t.files&&t.files[0];if(!f)return;if(f.size>25e6)return alert('That file is too large to be a study backup.');if(U.imode==='replace'&&!confirm('Replace your current marks, notes and reading progress with this backup? This cannot be undone. Export a backup of your current data first if you are unsure.'))return;const r=new FileReader();r.onload=()=>doImport(String(r.result),U.imode||'merge');r.readAsText(f);return}if(t.id==='sxb'){ST.bk=+t.value;ST.ch=1;save();go()}else if(t.id==='sxc'){ST.ch=+t.value;save();go()}});
document.addEventListener('input',e=>{if(e.target.id==='sxg'){U.gq=e.target.value;SQ.n=80;clearTimeout(SQ.t);SQ.t=setTimeout(()=>{const r=document.getElementById('sxr');if(r)r.innerHTML=srRes()},220);return}if(e.target.id!=='sxq')return;U.tq=e.target.value;const q=U.tq.toLowerCase();document.querySelectorAll('.nc[data-nid]').forEach(b=>{const n=getN(b.dataset.nid);b.hidden=!!n&&!vis(n,q)})});
})();