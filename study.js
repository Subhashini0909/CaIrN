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
const tools=nmb=>`<div class="rtools" role="toolbar" aria-label="Reading tools">${TL.map(([k,l])=>`<button class="${ST.tool===k?'on':''}" data-sx="tool:${k}" aria-pressed="${ST.tool===k}"><span class="sw ${k==='x'?'':'a-'+k}">${k==='x'?'✕':'Aa'}</span>${l}</button>`).join('')}${nmb?`<button class="nmtog ${ST.nm?'on':''}" data-sx="nmtog" aria-pressed="${!!ST.nm}" title="Show details when you hover over names and places"><span class="sw nmsw">Ab</span>Names</button>`:''}<span class="rhint">Select words or a sentence, then tap a tool. Tap a verse number to mark the whole verse.</span></div>`;
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
const anWrap=(id,html)=>{const a=ST.an[id]&&ST.an[id][0];return a&&a.r.length&&a.h===hash(htmlTxt(html))?wrap(html,a.r):html};
const hasSel=()=>{const g=getSelection();return !!g&&!g.isCollapsed&&String(g).trim().length>0};
// Names and places inside the live NLT text: find the verse each piece of text belongs to, then mark names the same way as in the KJV
const nmNLT=(h,b,c)=>{const d=document.createElement('div');d.innerHTML=h;let v=0;const T=[],w=document.createTreeWalker(d,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){if(n.nodeType===1){const a=n.getAttribute('vn');if(a&&/^\d+$/.test(a))v=+a;else if(n.classList.contains('vn')){const t=parseInt(n.textContent,10);if(t>0)v=t}}
  else if(v&&n.data.trim()&&n.parentElement&&!n.parentElement.closest('.vn,.tn,.footnote,.a-tn,sup,a,h1,h2,h3,h4,.bk_ch_vs_header,.subhead'))T.push([n,v])}
 T.forEach(([n,v])=>{const x=NM.mark(b,c,v,n.data);if(x===esc(n.data))return;const t=document.createElement('template');t.innerHTML=x;n.replaceWith(t.content)});return d.innerHTML};
const txtOf=(id,i)=>{if(id.startsWith('NLT:')){const h=NC[id.slice(4)];return typeof h==='string'?htmlTxt(h):null}const n=getN(id),x=n&&n.secs[i];return x?secTxt(x):null};
const markSel=(id,t)=>{const A=ST.an[id]||(ST.an[id]={});
 U.sel.forEach(({i,s:a,e:b,h:h0})=>{let h=h0;if(h===undefined){const tx=txtOf(id,i);if(tx==null)return;h=hash(tx)}const cur=A[i]&&A[i].h===h?A[i].r:[],r=paint(cur,a,b,t);if(r.length)A[i]={h,r};else delete A[i]});
 if(!Object.keys(A).length)delete ST.an[id]};
// keep marks in place when a note's text is edited: marks before the change stay, marks after it shift, marks inside it are dropped
const shift=(r,a,b)=>{if(a===b)return r;const m=Math.min(a.length,b.length);let p=0;while(p<m&&a[p]===b[p])p++;let q=0;while(q<m-p&&a[a.length-1-q]===b[b.length-1-q])q++;const d=b.length-a.length,cut=a.length-q;
 return r.filter(([x,y])=>y<=p||x>=cut).map(([x,y,f])=>y<=p?[x,y,f]:[x+d,y+d,f])};
const remap=(id,old,nw)=>{const A=ST.an[id];if(!A)return;const out={};
 nw.forEach((x,i)=>{if(x.oi==null)return;const o=A[x.oi],os=old.secs[x.oi];if(!o||!os)return;const a=secTxt(os);if(o.h!==hash(a))return;const b=secTxt(x),r=shift(o.r,a,b);if(r.length)out[i]={h:hash(b),r}});
 if(Object.keys(out).length)ST.an[id]=out;else delete ST.an[id]};
const nm=BIB.map(x=>x[0]).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),RE=new RegExp(`\\b(${nm}) (\\d{1,3})(?::\\d+(?:[–-]\\d+)?)?`,'g');
const link=h=>h.replace(/>([^<]+)</g,(m,t)=>'>'+t.replace(RE,(s,n,c)=>{const b=BIB.findIndex(x=>x[0]===n);return b<0||+c>BIB[b][1]?s:`<a class="xr" data-sx="ref:${b}:${c}" href="#">${s}</a>`})+'<');
window.NOTES=window.NOTES||[];if(window.__NLOCK===undefined)window.__NLOCK=window.NOTES.length?0:1;
const TXT=window.NOTES.map(n=>({id:n.id,t:(n.title+' '+n.sum+' '+n.secs.map(s=>s.h.replace(/<[^>]+>/g,' ')).join(' ')).toLowerCase()}));
const step=d=>{let b=ST.bk,c=ST.ch+d;if(c<1){if(b===0)return;b--;c=BIB[b][1]}else if(c>BIB[b][1]){if(b===65)return;b++;c=1}ST.bk=b;ST.ch=c};
const sel=()=>`<div class="pick"><select id="sxb" aria-label="Book"><optgroup label="Old Testament">${BIB.slice(0,39).map((x,i)=>`<option value="${i}" ${i===ST.bk?'selected':''}>${x[0]}</option>`).join('')}</optgroup><optgroup label="New Testament">${BIB.slice(39).map((x,i)=>`<option value="${i+39}" ${i+39===ST.bk?'selected':''}>${x[0]}</option>`).join('')}</optgroup></select><select id="sxc" aria-label="Chapter">${[...Array(BIB[ST.bk][1])].map((_,i)=>`<option ${i+1===ST.ch?'selected':''}>${i+1}</option>`).join('')}</select></div>`;
const nltLang=h=>{const t=htmlTxt(h),a=t.slice(0,160),b=t.slice(0,600);return /\b(NTV|NVI|RVR)\b/.test(a)||(/[áéíóúñ¿¡]/.test(b)&&/ (el|la|los|las|del|que|y) /.test(b))},
nltSafe=h=>{const d=new DOMParser().parseFromString(String(h),'text/html'),OK=new Set(['SECTION','DIV','P','SPAN','H1','H2','H3','H4','SUP','SUB','EM','I','B','STRONG','BR','A','UL','OL','LI','BLOCKQUOTE','SMALL','VERSE_EXPORT']),AT=new Set(['class','vn','bk','ch','orig']),walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3)return;if(c.nodeType!==1){c.remove();return}walk(c);if(!OK.has(c.tagName)){if(/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|FORM|SVG|MATH|LINK|META|BASE|NOSCRIPT|TEMPLATE|TITLE|HEAD|IMG|VIDEO|AUDIO|INPUT|BUTTON|TEXTAREA|SELECT)$/.test(c.tagName))c.remove();else c.replaceWith(...c.childNodes)}else[...c.attributes].forEach(a=>{if(!AT.has(a.name)||!/^[\w. -]*$/.test(a.value))c.removeAttribute(a.name)})})};walk(d.body);return d.body.innerHTML.trim()},
nltGet=(r,n)=>fetch(`https://api.nlt.to/api/passages?ref=${r}${n?'':'&version=NLT'}&key=TEST${n?'&_='+Date.now():''}`,{headers:{'Accept-Language':'en'}}).then(x=>{if(!x.ok)throw 0;return x.text()}).then(h=>{const o=nltSafe(h);if(!o||nltLang(o))throw 0;return o});
// ---- Compare: one verse in several versions ----
ST.cmp=ST.cmp||{b:ST.bk,c:ST.ch,v:1,e:1,off:{}};ST.cmp.off=ST.cmp.off||{};ST.cmp.on=ST.cmp.on||{KJV:1,TAM:1,NLT:1,ASV:1,WEB:1,YLT:1};
const CMV=[['KJV','King James Version (Authorized Version)','Built in · works offline'],['TAM','\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD (Tamil)','Built in · works offline'],['NLT','New Living Translation','Live · official NLT feed'],['ESV','English Standard Version','Live · official ESV API (free key)'],['ASV','American Standard Version (1901)','Live · public domain'],['WEB','World English Bible','Live · public domain'],['YLT',"Young\u2019s Literal Translation (1898)",'Live · public domain'],['DBY','Darby Bible (English)','Live · public domain'],['AKJV','American King James Version','Live · public domain'],['DRA','Douay-Rheims (Challoner)','Live · public domain'],['BBE','Bible in Basic English','Live · public domain']],
CMG=[['Built in (offline)',['KJV','TAM']],['Official live feeds',['NLT','ESV']],['More versions (free, need internet)',['ASV','WEB','YLT','DBY','AKJV','DRA','BBE']]],
GB={ASV:{s:['asv'],g:'ASV'},WEB:{s:['web','worldenglish'],g:'WEB'},YLT:{s:['ylt','youngs'],g:'YLT'},DBY:{s:['darbyenglish','darbyen','dby'],g:'DARBY'},AKJV:{s:['akjv']},DRA:{s:['douayrheims'],g:'DRA'},BBE:{s:['basicenglish']}},
CMX=[['NIV','NIV'],['NKJV','NKJV'],['NASB','NASB'],['CSB','CSB'],['AMP','Amplified'],['NRSV','NRSV'],['MSG','The Message'],['GNT','Good News']];
const CMDEF={KJV:1,TAM:1,NLT:1,ASV:1,WEB:1,YLT:1},GC={},EC={},ESVK='cairn.esvkey',esvKey=()=>{try{return localStorage.getItem(ESVK)||''}catch(e){return ''}};
const cvc=(b,c)=>{const k=KJV&&KJV[b]&&KJV[b].chapters[c-1],t=TAM&&TAM[b]&&TAM[b].chapters[c-1];return k?k.length:t?t.length:31};
const nltVerses=(h,a,b)=>{const d=document.createElement('div');d.innerHTML=h;
 // Read the passage in document order and give every piece of text to the verse marker most recently seen. This does not depend on how the feed nests its verse tags, which is what made one verse swallow the rest of the chapter.
 const BLK=new Set(['P','DIV','BR','LI','BLOCKQUOTE','H1','H2','H3','H4']),SKIP='.vn,.tn,.tn-ref,.footnote,.a-tn,.cw,.cw_ch,.chapter-number,sup,a,h1,h2,h3,h4,.bk_ch_vs_header,.subhead',B={};let v=1;
 const w=document.createTreeWalker(d,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){if(n.nodeType===1){const x=n.getAttribute('vn');if(x&&/^\d+$/.test(x))v=+x;else if(n.classList.contains('vn')){const t=parseInt(n.textContent,10);if(t>0)v=t}if(BLK.has(n.tagName))B[v]=(B[v]||'')+' '}
  else if(n.data&&n.parentElement&&!n.parentElement.closest(SKIP))B[v]=(B[v]||'')+n.data}
 const out=[];for(let i=a;i<=b;i++)out.push([i,(B[i]||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?\u201D\u2019])/g,'$1').trim()]);return out};
const gbGet=(k,C,done)=>{const key=`${k}:${C.b}:${C.c}`;if(GC[key]!==undefined)return GC[key];GC[key]=null;const L=GB[k].s,go=i=>fetch(`https://api.getbible.net/v2/${L[i]}/${C.b+1}/${C.c}.json`).then(r=>{if(!r.ok)throw 0;return r.json()}).then(j=>{if(!j||!Array.isArray(j.verses))throw 0;const m={};j.verses.forEach(x=>{m[+x.verse]=String(x.text||'').replace(/\s+/g,' ').trim()});return m}).catch(()=>i+1<L.length?go(i+1):Promise.reject(0));go(0).then(m=>{GC[key]=m;done()}).catch(()=>{GC[key]=0;done()});return null};
const esvGet=(C,q,done)=>{if(EC[q]!==undefined)return EC[q];EC[q]=null;fetch(`https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(q)}&include-headings=false&include-footnotes=false&include-short-copyright=false&include-passage-references=false&include-verse-numbers=true&include-first-verse-numbers=true&include-selahs=true&indent-poetry=false&indent-paragraphs=0&indent-declares=0&indent-psalm-doxology=0`,{headers:{Authorization:'Token '+esvKey()}}).then(r=>{if(r.status===401||r.status===403)throw 'key';if(!r.ok)throw 0;return r.json()}).then(j=>{const t=(j.passages||[])[0];if(!t)throw 0;const m={};let cur=null;t.split(/\[(\d+)\]/).forEach((p,i)=>{if(i%2)cur=+p;else if(cur!=null)m[cur]=((m[cur]||'')+' '+p).replace(/\s+/g,' ').trim()});EC[q]=m;done()}).catch(e=>{EC[q]=e==='key'?'key':0;done()});return null};
const compare=()=>{load();const C=ST.cmp;if(!BIB[C.b])C.b=0;const n=cvc(C.b,C.c);C.c=Math.min(Math.max(1,C.c),BIB[C.b][1]);C.v=Math.min(Math.max(1,C.v),n);C.e=Math.min(Math.max(C.e,C.v),n,C.v+14);
 const rf=`${BIB[C.b][0]} ${C.c}:${C.v}${C.e>C.v?'\u2013'+C.e:''}`,key=`${C.b}:${C.c}`;U.cmpTxt={};const done=()=>{if(tab==='study'&&U.sub==='cmp'&&!(document.activeElement&&document.activeElement.id==='esvk'))render()},gw=c=>`https://www.biblegateway.com/passage/?search=${encodeURIComponent(rf)}&version=${c}`;
 const opts=(len,cur,from)=>[...Array(len)].map((_,i)=>`<option ${i+from===cur?'selected':''}>${i+from}</option>`).join('');
 const sk='<div class="skel"></div><div class="skel"></div>',vhtml=ls=>ls.map(([v,t])=>`<p>${C.e>C.v?`<sup>${v}</sup> `:''}${t?esc(t):'<span class="mute">Not available in this version.</span>'}</p>`).join('');
 const card=(code,title,sub,inner,plain,tam)=>{if(plain)U.cmpTxt[code]=`${rf} (${code})\n${plain}`;return `<article class="card cmpc"><div class="cmph"><b>${title}</b><span class="mute small">${sub}</span></div><div class="scr cmpt${tam?' tam':''}">${inner}</div>${plain?`<div class="cmpf"><button class="g s" data-sx="cmcopy:${code}">Copy</button></div>`:''}</article>`};
 const rows=m=>{const ls=[];for(let v=C.v;v<=C.e;v++)ls.push([v,m[v]||'']);return ls},plainOf=ls=>ls.map(x=>x[1]).filter(Boolean).join(' ');
 const cards=CMV.filter(([k])=>C.on[k]).map(([k,t,s])=>{
  if(k==='KJV'){if(!KJV)return card(k,t,s,U.err?'<p class="mute">Could not load kjv.json.</p>':sk);const ls=[];for(let v=C.v;v<=C.e;v++)ls.push([v,(KJV[C.b].chapters[C.c-1]||[])[v-1]||'']);return card(k,t,s,vhtml(ls),plainOf(ls))}
  if(k==='TAM'){loadT();if(!TAM)return card(k,t,s,U.errT?'<p class="mute">Could not load tamil.json.</p>':sk);const ls=[];for(let v=C.v;v<=C.e;v++)ls.push([v,(TAM[C.b].chapters[C.c-1]||[])[v-1]||'']);return card(k,t,s,vhtml(ls),plainOf(ls),1)}
  if(k==='NLT'){if(NC[key]===undefined){NC[key]=null;const r=encodeURIComponent(`${BIB[C.b][0]} ${C.c}`);nltGet(r,0).catch(()=>nltGet(r,1)).then(o=>{NC[key]=o;done()}).catch(()=>{NC[key]=0;done()})}
   if(NC[key]===null||NC[key]===undefined)return card(k,t,s,sk);
   if(NC[key]===0)return card(k,t,s,`<p class="mute">The live NLT feed is unavailable right now (it needs internet).</p><a class="btn g s" href="${gw('NLT')}" target="_blank" rel="noopener">Open NLT \u2197</a>`);
   const ls=nltVerses(NC[key],C.v,C.e);return card(k,t,s,vhtml(ls),plainOf(ls))}
  if(k==='ESV'){const ek=esvKey(),lnk=`<a class="btn g s" href="${gw('ESV')}" target="_blank" rel="noopener">Open ESV \u2197</a>`;
   if(!ek)return card(k,t,s,`<p class="mute">The ESV can only be shown through Crossway\u2019s official feed, which needs a free personal key (api.esv.org, free for non-commercial use). Paste it once and it stays on this device.</p><input id="esvk" class="srch" type="password" autocomplete="off" placeholder="ESV API key"><div class="cmpf"><button class="s" data-sx="esvsave">Save key</button>${lnk}</div>`);
   const q=`${BIB[C.b][0]} ${C.c}:${C.v}${C.e>C.v?'-'+C.e:''}`,m=esvGet(C,q,done);if(m===null||m===undefined)return card(k,t,s,sk);
   if(m==='key')return card(k,t,s,`<p class="mute">The ESV feed did not accept this key. Check it and save again.</p><input id="esvk" class="srch" type="password" autocomplete="off" placeholder="ESV API key"><div class="cmpf"><button class="s" data-sx="esvsave">Save key</button><button class="g s" data-sx="esvclear">Remove key</button>${lnk}</div>`);
   if(m===0)return card(k,t,s,`<p class="mute">The ESV feed is unavailable right now (it needs internet).</p>${lnk}`);
   const ls=rows(m);return card(k,t,s+' · \u00A9 Crossway',vhtml(ls)+'<p class="mute small">ESV\u00AE Bible \u00A9 2001 by Crossway. Used by permission of the ESV API.</p>',plainOf(ls)+' (ESV)')}
  const g=GB[k];if(!g)return '';const m=gbGet(k,C,done);if(m===null||m===undefined)return card(k,t,s,sk);
  if(m===0)return card(k,t,s,`<p class="mute">This version could not be loaded right now (it needs internet).</p>${g.g?`<a class="btn g s" href="${gw(g.g)}" target="_blank" rel="noopener">Open on BibleGateway \u2197</a>`:''}`);
  const ls=rows(m);return card(k,t,s,vhtml(ls),plainOf(ls))}).join('');
 const chip=k=>`<button class="${C.on[k]?'on':''}" data-sx="cmver:${k}" aria-pressed="${!!C.on[k]}">${k==='TAM'?'\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD':k}</button>`;
 return `<div class="card cmpsel"><div class="pick cmpick"><select id="cmb" aria-label="Book"><optgroup label="Old Testament">${BIB.slice(0,39).map((x,i)=>`<option value="${i}" ${i===C.b?'selected':''}>${x[0]}</option>`).join('')}</optgroup><optgroup label="New Testament">${BIB.slice(39).map((x,i)=>`<option value="${i+39}" ${i+39===C.b?'selected':''}>${x[0]}</option>`).join('')}</optgroup></select><select id="cmc" aria-label="Chapter">${opts(BIB[C.b][1],C.c,1)}</select><select id="cmv" aria-label="From verse">${opts(n,C.v,1)}</select><span class="mute">to</span><select id="cme" aria-label="To verse">${opts(Math.min(15,n-C.v+1),C.e,C.v)}</select></div>
 <div class="cmpnav"><button class="g s" data-sx="cmstep:-1">\u2039 Previous verse</button><button class="g s" data-sx="cmstep:1">Next verse \u203A</button></div>
 ${CMG.map(([l,ks])=>`<div class="cmpgrp"><span class="mute small">${l}</span><div class="rtools cmpvers" role="group" aria-label="${l}">${ks.map(chip).join('')}</div></div>`).join('')}
 <div class="cmpnav"><button class="g s" data-sx="cmall:1">Show all</button><button class="g s" data-sx="cmall:0">Clear</button><button class="g s" data-sx="cmdef">Reset</button></div></div>
 <h2 class="ref cmpref">${esc(rf)}</h2><div class="cmpgrid">${cards||'<p class="mute">Turn on at least one version above.</p>'}</div>
 <div class="card cmpmore"><b>Licensed versions</b><span class="mute small">NIV, NKJV, NASB, CSB and others are copyrighted, so their text cannot be built into the app. These open the same verse on BibleGateway.</span><div class="cmpl">${CMX.map(([c,l])=>`<a class="btn g s" href="${gw(c)}" target="_blank" rel="noopener">${l} \u2197</a>`).join('')}</div></div>`};
function body(){const k=`${ST.bk}:${ST.ch}`,r=encodeURIComponent(ref()),v=ST.ver;
 if(v==='KJV'){load();if(!KJV)return U.err?'<div class="empty">Could not load the KJV text. Check that kjv.json is next to index.html.</div>':'<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  return anWrap('KJV:'+k,`<div class="scr" style="font-size:${ST.fs}px">${KJV[ST.bk].chapters[ST.ch-1].map((t,i)=>`<span class="vs${vcls(ST.hl[k+':'+(i+1)])}" data-sx="vs:${i+1}"><sup${NM.ev(ST.bk,ST.ch,i+1)}>${i+1}</sup>${ST.nm&&NM.ready()?NM.mark(ST.bk,ST.ch,i+1,t):esc(t)} </span>`).join('')}</div>`)}
 if(v==='TAM'){loadT();if(!TAM)return U.errT?'<div class="empty">Could not load the Tamil text. Check that tamil.json is next to index.html.</div>':'<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  return anWrap('TAM:'+k,`<div class="scr tam" style="font-size:${ST.fs}px">${TAM[ST.bk].chapters[ST.ch-1].map((t,i)=>`<span class="vs${vcls(ST.hl[k+':'+(i+1)])}" data-sx="vs:${i+1}"><sup>${i+1}</sup>${esc(t)} </span>`).join('')}</div>`)}
 if(v==='NLT'){if(NC[k]){let h=NC[k];if(ST.nm&&NM.ready())h=nmNLT(h,ST.bk,ST.ch);const a=ST.an['NLT:'+k]&&ST.an['NLT:'+k][0];if(a&&a.r.length&&a.h===hash(htmlTxt(h)))h=wrap(h,a.r);return `<div class="scr nlt" style="font-size:${ST.fs}px">${h}</div>`};
  if(NC[k]===0)return ext('NLT',`https://www.biblegateway.com/passage/?search=${r}&version=NLT`,'The live NLT feed is unavailable right now (it needs internet).');
  if(NC[k]===null)return '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  NC[k]=null;const get=n=>nltGet(r,n);
  get(0).catch(()=>get(1)).then(o=>{NC[k]=o;if(tab==='study'&&U.sub==='read')render()}).catch(()=>{NC[k]=0;if(tab==='study'&&U.sub==='read')render()});return '<div class="skel"></div><div class="skel"></div><div class="skel"></div>'}
 return ext('NIV',`https://www.biblegateway.com/passage/?search=${r}&version=NIV`,'Opens in BibleGateway.')}
const ext=(v,u,t)=>`<div class="extc"><div class="big2" style="font-family:var(--serif)">${VER[v]} · ${esc(ref())}</div><p class="mute">${t}</p><a class="btn" href="${u}" target="_blank" rel="noopener">Open ${VER[v]} · ${esc(ref())} ↗</a><p class="mute" style="margin-top:14px"></p></div>`;
const nmList=()=>{if(ST.ver==='NIV')return '';load();if(!NM.ready()){if(!U.nmReq){U.nmReq=1;NM.load(()=>{U.nmReq=0;rr()})}return NM.err?'':'<p class="mute" style="margin-top:14px">Loading names and places…</p>'}
 const ch=(KJV||TAM)&&(KJV||TAM)[ST.bk].chapters[ST.ch-1],G=ch&&NM.chapter(ST.bk,ST.ch,ch.length);if(!G)return '';const tot=G.p.length+G.l.length+G.o.length;
 return `<details class="nmlist" ${U.nmopen?'open':''}><summary>People and places in this chapter <span class="nmtag">${tot}</span></summary>${tot?[['p','People and groups'],['l','Places'],['o','Titles, festivals and other names']].filter(g=>G[g[0]].length).map(([k,l])=>`<div class="nmgrp"><b>${l}</b><div class="nmcs">${G[k].map(i=>NM.chip(i)).join('')}</div></div>`).join(''):'<p class="mute">No named people or places are recorded in this chapter.</p>'}</details>`};
const read=()=>`<div class="seg" role="tablist">${Object.entries(VER).map(([k,l])=>`<button class="${ST.ver===k?'on':''}" data-sx="ver:${k}">${l}</button>`).join('')}</div>
<div class="card rd"><div class="rdh">${sel()}<div class="tools"><button class="g s" data-sx="fs:-1" aria-label="Smaller text">A−</button><button class="g s" data-sx="fs:1" aria-label="Larger text">A+</button><button class="g s" data-sx="cmpgo">Compare</button></div></div>
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
const NK_KEY='cairn.nk',nkNorm=x=>String(x||'').replace(/[\s-]/g,'').toUpperCase();
async function nkOpen(pw){const j=await (await fetch('notes.enc',{cache:'no-cache'})).json(),bin=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));
const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(nkNorm(pw)),'PBKDF2',false,['deriveKey']);
const k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bin(j.s),iterations:j.n,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:bin(j.i)},k,bin(j.c));const url=URL.createObjectURL(new Blob([pt],{type:'text/javascript'}));
await new Promise((ok,no)=>{const e=document.createElement('script');e.src=url;e.onload=ok;e.onerror=no;document.head.appendChild(e)});URL.revokeObjectURL(url);window.__NLOCK=0}
let nkBusy=0;const nkUnlock=async()=>{if(nkBusy)return;const pw=(document.getElementById('nlpw')||{}).value,keep=(document.getElementById('nlkeep')||{}).checked;if(!nkNorm(pw)){U.nerr='Enter the passphrase.';return rr()}
nkBusy=1;U.nerr='Unlocking…';rr();try{await nkOpen(pw);if(keep)localStorage.setItem(NK_KEY,nkNorm(pw));else sessionStorage.setItem(NK_KEY,nkNorm(pw));U.nerr=''}catch(e){U.nerr=e&&e.name==='OperationError'?'That passphrase is not right.':'Could not open the notes. Check your connection and try again.'}nkBusy=0;rr()};
const nkLockCard=()=>`<div class="nlock"><b>🔒 Study notes are locked</b><span class="mute">Enter your passphrase to open the built-in study notes. Your own notes stay available.</span><input id="nlpw" type="password" autocomplete="off" placeholder="Passphrase"><label class="mute nlk"><input id="nlkeep" type="checkbox" checked> Keep unlocked on this device</label><button class="s" data-sx="nunlock">Unlock</button>${U.nerr?`<span class="nerr">${esc(U.nerr)}</span>`:''}</div>`;
const lib=(list,mineTab)=>{const q=U.tq.toLowerCase();return `<input id="sxq" class="srch" placeholder="Search notes: prophet, king, Elijah, altar, Paul…" value="${esc(U.tq)}"><div class="catbar" role="toolbar" aria-label="Note categories">${CATS.map(c=>`<button class="g s ${(U.cat||'All')===c?'on':''}" data-sx="cat:${c}">${c}</button>`).join('')}</div>${bkPanel()}${!mineTab&&window.__NLOCK?nkLockCard():''}<div class="ng"><button class="nc add" data-sx="newn"><span class="ni">＋</span><b>Create a note</b></button>${list.map(n=>`<button class="nc" data-nid="${n.id}" data-sx="open:${n.id}" ${vis(n,q)?'':'hidden'}><span class="ni">${n.ico||'📝'}</span>${n.mine?'<span class="tag">Mine</span>':n.edited?'<span class="tag">Edited</span>':''}<b>${esc(n.title)}</b><span class="mute">${esc(n.sum||'')}</span><small>${n.secs.length} section${n.secs.length===1?'':'s'} · tap to open</small></button>`).join('')}</div>${mineTab&&!list.length?'<p class="mute" style="text-align:center;margin-top:18px">Your own notes will appear here.</p>':''}${!mineTab&&Object.keys(ST.del).length?`<details class="deln" ${U.dopen?'open':''}><summary>Deleted notes (${Object.keys(ST.del).length})</summary>${window.NOTES.filter(n=>ST.del[n.id]).map(n=>`<div class="item"><span class="ni" style="font-size:22px">${n.ico||'📝'}</span><div class="t"><b>${esc(n.title)}</b></div><button class="s" data-sx="restore:${n.id}">Restore</button></div>`).join('')}${Object.keys(ST.del).length>1?'<div style="margin-top:10px"><button class="g s" data-sx="restoreall">Restore all</button></div>':''}</details>`:''}`};
const sec=(n,i)=>{const s=n.secs[i];let h=(s.hd?`<h1>${esc(s.t)}</h1>`:'')+link(s.h);const a=ST.an[n.id]&&ST.an[n.id][i];if(a&&a.r.length&&a.h===hash(secTxt(s)))h=wrap(h,a.r);return `<section id="sxs${i}">${h}</section>`};
const view=()=>{const n=getN(U.nid);return `<div class="row"><button class="g s" data-sx="back">‹ All notes</button><span class="acts"><button class="s" data-sx="edit">✎ Edit</button><button class="g s" data-sx="shr">Share</button><button class="g s" data-sx="sav">Save file</button><button class="g s" data-sx="ndocx">Word</button><button class="g s" data-sx="npdf">PDF</button>${n.edited?'<button class="g s" data-sx="ereset">Reset to original</button>':''}<button class="g s" data-sx="edel">Delete</button></span></div><div class="card nb"><h2 class="ref">${n.ico||'📝'} ${esc(n.title)}</h2><p class="mute">${esc(n.sum||'')}</p><div class="chips">${tools()}${n.secs.map((s,i)=>`<button class="g s" data-sx="sec:${i}">${esc(s.t)}</button>`).join('')}</div>${n.secs.map((s,i)=>sec(n,i)).join('')}</div>`};
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
const bkPanel=()=>`<details class="bkp" ${U.bk?'open':''}><summary>Backup and sharing</summary><div class="bkrow"><button class="s" data-sx="bkx">\u2B07 Export backup</button><button class="g s" data-sx="impick:merge">\u2B06 Import and merge</button><button class="g s" data-sx="impick:replace">Import and replace</button><button class="g s" data-sx="bkmd">Download my notes as text</button></div><div class="bkrow"><button class="g s" data-sx="bkdocx">\u2B07 My notes as Word</button><button class="g s" data-sx="bkpdf">\u2B07 My notes as PDF</button><button class="g s" data-sx="impick:doc">\u2B06 Import Word, PDF or text</button></div><p class="mute small">Backup files (.json) restore everything. Word, PDF and text files are added as new notes.</p><p class="mute small">${bkCounts()}. ${ST.bkat?'Last backup: '+new Date(ST.bkat).toLocaleDateString()+'.':'No backup made yet.'}</p></details>`;
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
// ---- Word and PDF: export and import ----
const U8=new TextEncoder(),CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRCT[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
const zipStore=(files,type)=>{const parts=[],cen=[],u16=n=>[n&255,(n>>8)&255],u32=n=>[n&255,(n>>8)&255,(n>>16)&255,(n>>>24)&255];let off=0;
 files.forEach(([name,data])=>{const nb=U8.encode(name),crc=crc32(data),lh=new Uint8Array([0x50,0x4b,3,4,...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(data.length),...u32(data.length),...u16(nb.length),...u16(0)]);
  parts.push(lh,nb,data);cen.push(new Uint8Array([0x50,0x4b,1,2,...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(data.length),...u32(data.length),...u16(nb.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]),nb);off+=lh.length+nb.length+data.length});
 const cl=cen.reduce((a,b)=>a+b.length,0);return new Blob([...parts,...cen,new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...u16(files.length),...u16(files.length),...u32(cl),...u32(off),0,0])],{type})};
const WNS='http://schemas.openxmlformats.org/wordprocessingml/2006/main',xe=s=>String(s).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const runX=(t,f)=>`<w:r><w:rPr>${f.b?'<w:b/>':''}${f.i?'<w:i/>':''}${f.u?'<w:u w:val="single"/>':''}${f.m?'<w:highlight w:val="yellow"/>':''}</w:rPr><w:t xml:space="preserve">${xe(t)}</w:t></w:r>`;
const paraX=(runs,st,ex)=>`<w:p><w:pPr>${st?`<w:pStyle w:val="${st}"/>`:''}${ex||''}</w:pPr>${runs}</w:p>`;
const htmlParas=h=>{const d=document.createElement('div');d.innerHTML=String(h||'').replace(/<figure[\s\S]*?<\/figure>/g,'').replace(/<svg[\s\S]*?<\/svg>/g,'');const out=[];let runs='';
 const flush=(st,ex)=>{if(runs.replace(/<w:r><w:rPr><\/w:rPr><w:t xml:space="preserve"> <\/w:t><\/w:r>/g,'')){out.push(paraX(runs,st,ex))}runs=''};
 const walk=(n,f)=>n.childNodes.forEach(c=>{if(c.nodeType===3){const t=c.data.replace(/\s+/g,' ');if(t.trim()||runs)runs+=runX(t,f)}
  else if(c.nodeType===1){const g=c.tagName.toLowerCase();
   if(g==='br')runs+='<w:r><w:br/></w:r>';
   else if(/^h[1-6]$/.test(g)){flush();walk(c,{...f,b:1});flush('Heading2')}
   else if(g==='li'){flush();runs=runX('\u2022 ',f);walk(c,f);flush('','<w:ind w:left="360" w:hanging="220"/>')}
   else if(/^(p|div|ul|ol|blockquote|table|tr|section|article)$/.test(g)){flush();walk(c,f);flush()}
   else if(g==='td'||g==='th'){walk(c,f);runs+=runX('   ',f)}
   else walk(c,{...f,b:f.b||/^(b|strong)$/.test(g),i:f.i||/^(i|em)$/.test(g),u:f.u||g==='u',m:f.m||g==='mark'})}});
 walk(d,{});flush();return out.join('')};
const noteBody=s=>String(s.h||'').replace(/^\s*<h[12][^>]*>[\s\S]*?<\/h[12]>/,'');
const noteX=n=>paraX(runX(((n.ico?n.ico+' ':'')+n.title).trim(),{}),'Title')+(n.sum?paraX(runX(n.sum,{i:1})):'')+n.secs.map(s=>paraX(runX(s.t||'Notes',{}),'Heading1')+htmlParas(noteBody(s))).join('');
const docxBlob=ns=>{const body=ns.map(noteX).join('<w:p><w:r><w:br w:type="page"/></w:r></w:p>'),H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
 st=(id,nm,pp,rp,ol)=>`<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${nm}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr>${pp}${ol==null?'':`<w:outlineLvl w:val="${ol}"/>`}</w:pPr><w:rPr>${rp}</w:rPr></w:style>`,
 styles=`${H}<w:styles xmlns:w="${WNS}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri" w:eastAsia="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>${st('Title','Title','<w:spacing w:after="160"/>','<w:b/><w:color w:val="0F1533"/><w:sz w:val="44"/>')}${st('Heading1','heading 1','<w:keepNext/><w:spacing w:before="280" w:after="100"/>','<w:b/><w:color w:val="8A6A28"/><w:sz w:val="32"/>',0)}${st('Heading2','heading 2','<w:keepNext/><w:spacing w:before="200" w:after="80"/>','<w:b/><w:sz w:val="26"/>',1)}</w:styles>`,
 files=[['[Content_Types].xml',`${H}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`],
  ['_rels/.rels',`${H}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],
  ['word/_rels/document.xml.rels',`${H}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
  ['word/styles.xml',styles],['word/document.xml',`${H}<w:document xmlns:w="${WNS}"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`]];
 return zipStore(files.map(([n,t])=>[n,U8.encode(t)]),'application/vnd.openxmlformats-officedocument.wordprocessingml.document')};
const dlBlob=(name,b)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800)};
const printNotes=ns=>{let r=document.getElementById('printroot');if(r)r.remove();r=document.createElement('div');r.id='printroot';
 r.innerHTML=ns.map(n=>`<article class="pn"><h1>${esc(((n.ico?n.ico+' ':'')+n.title).trim())}</h1>${n.sum?`<p class="ps">${esc(n.sum)}</p>`:''}${n.secs.map(s=>`<h2>${esc(s.t||'Notes')}</h2>${clean(noteBody(s),1)}`).join('')}</article>`).join('');
 document.body.appendChild(r);document.body.classList.add('pr');const done=()=>{document.body.classList.remove('pr');r.remove();removeEventListener('afterprint',done)};addEventListener('afterprint',done);setTimeout(()=>print(),60)};
const ownNotes=()=>all().filter(n=>n.mine||n.edited);
const inflateRaw=async u=>{const ds=new DecompressionStream('deflate-raw'),w=ds.writable.getWriter();w.write(u);w.close();return new Uint8Array(await new Response(ds.readable).arrayBuffer())};
const unzipEntry=async(buf,want)=>{const v=new DataView(buf),u=new Uint8Array(buf);let e=-1;for(let i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-66000);i--)if(v.getUint32(i,true)===0x06054b50){e=i;break}
 if(e<0)throw new Error('zip');let n=v.getUint16(e+10,true),p=v.getUint32(e+16,true);
 for(let k=0;k<n;k++){if(v.getUint32(p,true)!==0x02014b50)throw new Error('zip');const m=v.getUint16(p+10,true),cs=v.getUint32(p+20,true),nl=v.getUint16(p+28,true),xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),lo=v.getUint32(p+42,true),name=new TextDecoder().decode(u.subarray(p+46,p+46+nl));
  if(name===want){const s=lo+30+v.getUint16(lo+26,true)+v.getUint16(lo+28,true),d=u.subarray(s,s+cs);if(m===0)return d;if(m===8)return inflateRaw(d);throw new Error('zip')}p+=46+nl+xl+cl}return null};
const baseName=f=>f.name.replace(/\.[^.]+$/,'');
const docxNote=async f=>{const x=await unzipEntry(await f.arrayBuffer(),'word/document.xml');if(!x)throw new Error('docx');
 const xml=new DOMParser().parseFromString(new TextDecoder().decode(x),'application/xml'),g=(el,t)=>el.getElementsByTagNameNS(WNS,t),on=(rp,t)=>{const e=rp&&g(rp,t)[0];return!!e&&!/^(0|false|off)$/.test(e.getAttributeNS(WNS,'val')||'')};
 let title='',secs=[],cur={t:'',h:''};const push=()=>{if(cur.h||cur.t)secs.push({t:cur.t||'Notes',h:cur.h});cur={t:'',h:''}};
 for(const p of g(xml,'p')){const ps=g(p,'pStyle')[0],st=ps?ps.getAttributeNS(WNS,'val')||'':'';let html='',txt='';
  for(const r of g(p,'r')){const rp=g(r,'rPr')[0];let s='';for(const c of r.childNodes){if(c.localName==='t')s+=esc(c.textContent);else if(c.localName==='tab')s+=' ';else if(c.localName==='br')s+='<br>'}
   txt+=r.textContent;if(!s)continue;if(on(rp,'b'))s=`<b>${s}</b>`;if(on(rp,'i'))s=`<i>${s}</i>`;html+=s}
  if(!txt.trim())continue;txt=txt.trim();
  if(/^title$/i.test(st)&&!title)title=txt;
  else if(/^heading\s*\d|^title$|^subtitle$/i.test(st)){push();cur.t=txt}
  else cur.h+=`<p>${g(p,'numPr').length||/list/i.test(st)?'\u2022 ':''}${html}</p>`}
 push();return[{title:title||baseName(f),secs}]};
const mdNotes=(txt,f)=>{const ns=[];let n=null,s=null;const endS=()=>{if(s&&n){if(s.l.join('').trim()||s.t)n.secs.push({t:s.t||'Notes',h:s.l.filter(x=>!/^-{3,}\s*$/.test(x)).join('\n').split(/\n{2,}/).map(x=>x.trim()).filter(Boolean).map(x=>'<p>'+esc(x).replace(/\n/g,'<br>')+'</p>').join('')})}s=null};
 const endN=()=>{endS();if(n&&(n.secs.length||n.title))ns.push(n);n=null};
 txt.replace(/\r/g,'').split('\n').forEach(l=>{let m;if((m=l.match(/^#\s+(.*)$/))){endN();n={title:m[1].trim(),secs:[]};s=null}else if((m=l.match(/^#{2,6}\s+(.*)$/))){if(!n)n={title:baseName(f),secs:[]};endS();s={t:m[1].trim(),l:[]}}else if(/^-{3,}\s*$/.test(l)&&n&&!s){}else{if(!n)n={title:baseName(f),secs:[]};if(!s)s={t:'',l:[]};s.l.push(l)}});endN();return ns};
const pdfNote=async f=>{const lib=await import('./pdf.min.js');lib.GlobalWorkerOptions.workerSrc=new URL('pdf.worker.min.js',location.href).href;
 const doc=await lib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise,pages=[];
 for(let i=1;i<=doc.numPages;i++){const pg=await doc.getPage(i),tc=await pg.getTextContent();let s='';tc.items.forEach(it=>{if(it.str!==undefined){s+=it.str;if(it.hasEOL)s+='\n'}});pages.push(s.replace(/[ \t]+\n/g,'\n').trim());pg.cleanup()}
 doc.destroy();if(!pages.some(Boolean))throw new Error('empty');
 const k=Math.max(1,Math.ceil(pages.length/60)),secs=[];for(let i=0;i<pages.length;i+=k){const part=pages.slice(i,i+k).filter(Boolean).join('\n\n'),a=i+1,b=Math.min(pages.length,i+k);if(!part)continue;
  secs.push({t:pages.length===1?'Imported text':k===1?'Page '+a:'Pages '+a+'\u2013'+b,h:part.split(/\n{2,}/).map(x=>'<p>'+esc(x.trim()).replace(/\n/g,'<br>')+'</p>').join('')})}
 return[{title:baseName(f),secs}]};
const importDocs=async files=>{let added=[],bad=[];toast('Importing\u2026');
 for(const f of files){try{if(f.size>25e6)throw new Error('big');const ext=(f.name.split('.').pop()||'').toLowerCase();let ns;
   if(ext==='docx')ns=await docxNote(f);else if(ext==='pdf')ns=await pdfNote(f);else if(ext==='txt'||ext==='md'||ext==='markdown')ns=mdNotes(await f.text(),f);else throw new Error('type');
   ns.forEach(x=>{const n=cleanNote({title:x.title,sum:'Imported from '+f.name,ico:ext==='pdf'?'\uD83D\uDCC4':'\uD83D\uDCDD',secs:x.secs});if(n){n.id=uid();n.ts=Date.now();ST.my.push(n);added.push(n)}})}
  catch(e){bad.push(f.name+(e&&e.message==='empty'?' (this PDF has no selectable text, it may be a scan)':e&&e.message==='type'?' (use .docx, .pdf, .txt, .md or a .json backup)':''))}}
 if(added.length){save();U.sub='notes';U.edit=null;U.nid=added.length===1?added[0].id:null;U.cat='';U.from=0;U.bk=1;go();toast(`Added ${added.length} note${added.length===1?'':'s'} to your own notes.`)}
 if(bad.length)alert('Could not import: '+bad.join('; '))};
const fileIn=()=>{let f=document.getElementById('sxi');if(!f){f=document.createElement('input');f.type='file';f.id='sxi';f.accept='.json,application/json,.docx,.pdf,.txt,.md,application/pdf,text/plain';f.hidden=true;document.body.appendChild(f)}return f};
views.study=()=>{const mc=all().filter(x=>x.mine).sort((a,b)=>b.ts-a.ts),n=U.nid&&getN(U.nid);return `<div class="seg main">${[['read','Read Bible'],['cmp','Compare'],['notes','Study notes'],['search','Search']].map(([k,l])=>`<button class="${U.sub===k?'on':''}" data-sx="sub:${k}">${l}</button>`).join('')}</div>${U.sub==='read'&&!U.edit?read():U.sub==='cmp'&&!U.edit&&!n?compare():U.edit?editor():n?view():U.sub==='search'?srch():lib([...mc,...all().filter(x=>x.orig)],0)}`};
const go=()=>{render();flash()};
document.addEventListener('mousedown',e=>{if(e.target.closest('.tb button,.rtools button'))e.preventDefault()});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.rtools'))U.sel=null});
const selCtx=()=>{if(tab!=='study')return null;if(U.sub==='read'&&(ST.ver==='KJV'||ST.ver==='TAM'))return{id:`${ST.ver}:${ST.bk}:${ST.ch}`,els:[...document.querySelectorAll('.scr')]};if(U.sub==='read'&&ST.ver==='NLT')return{id:`NLT:${ST.bk}:${ST.ch}`,els:[...document.querySelectorAll('.scr.nlt')]};if(U.nid&&!U.edit)return{id:U.nid,els:[...document.querySelectorAll('.nb section[id^="sxs"]')]};return null};
document.addEventListener('click',e=>{const v=e.target.closest&&e.target.closest('.scr.nlt .vn');if(!v||tab!=='study'||U.sub!=='read'||ST.ver!=='NLT'||hasSel())return;const sc=v.closest('.scr.nlt'),ve=v.closest('verse_export'),r=document.createRange();
 if(ve)r.selectNodeContents(ve);else{r.setStartBefore(v);const all=[...sc.querySelectorAll('.vn')],nx=all[all.indexOf(v)+1];nx?r.setEndBefore(nx):r.setEnd(sc,sc.childNodes.length)}
 const pre=document.createRange();pre.selectNodeContents(sc);pre.setEnd(r.startContainer,r.startOffset);const a=pre.toString().length,b=a+r.toString().length;if(b<=a)return;
 const id=`NLT:${ST.bk}:${ST.ch}`;U.sel=[{i:0,s:a,e:b,h:hash(sc.textContent)}];U.selId=id;markSel(id,ST.tool);U.sel=null;save();go()});
document.addEventListener('selectionchange',()=>{const cx=selCtx();if(!cx)return;const g=getSelection();if(!g||!g.rangeCount||g.isCollapsed)return;const r=g.getRangeAt(0),out=[];
 cx.els.forEach(sc=>{if(!r.intersectsNode(sc))return;const sr=document.createRange();sr.selectNodeContents(sc);const c=r.cloneRange();
  if(c.compareBoundaryPoints(Range.START_TO_START,sr)<0)c.setStart(sr.startContainer,sr.startOffset);if(c.compareBoundaryPoints(Range.END_TO_END,sr)>0)c.setEnd(sr.endContainer,sr.endOffset);
  const pre=document.createRange();pre.selectNodeContents(sc);pre.setEnd(c.startContainer,c.startOffset);const a=pre.toString().length,b=a+c.toString().length;if(b>a)out.push({i:sc.id&&sc.id.startsWith('sxs')?+sc.id.slice(3):0,s:a,e:b,h:/^(KJV|TAM|NLT):/.test(cx.id)?hash(sc.textContent):undefined})});
 if(out.length){U.sel=out;U.selId=cx.id}});
document.addEventListener('paste',e=>{if(!e.target.closest||!e.target.closest('.rte'))return;e.preventDefault();document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain'))});
document.addEventListener('click',e=>{const t=e.target.closest('[data-sx]');if(!t)return;e.preventDefault();const[a,x,y]=t.dataset.sx.split(':');U.msg='';
 if(a==='fmt'){const c=document.execCommand.bind(document);if(x==='bold')c('bold');else if(x==='italic')c('italic');else if(x==='h2')c('formatBlock',false,'H2');else if(x==='p')c('formatBlock',false,'P');else if(x==='list')c('insertUnorderedList');else if(x==='clear')c('removeFormat');else if(x==='mark'){const s=String(getSelection());if(s)c('insertHTML',false,'<mark>'+esc(s)+'</mark>')}else if(x==='u')c('underline');else if(x==='imp'){const s=String(getSelection());if(s)c('insertHTML',false,'<b class="imp">'+esc(s)+'</b>')}return}
 if(a==='nunlock'){nkUnlock();return}
 if(a==='sec'){const el=document.getElementById('sxs'+x);el&&el.scrollIntoView({behavior:'smooth',block:'start'});return}
 pull();const E=U.edit;let top=0;
 if(a==='sub'){if(E&&!confirm('Discard this unsaved note?'))return;U.sub=x;U.edit=null;U.nid=null;U.from=0;top=1}
 else if(a==='cat')U.cat=x==='All'?'':x;else if(a==='nmtog')ST.nm=!ST.nm;else if(a==='ver')ST.ver=x;else if(a==='nav'){step(+x);top=1}else if(a==='fs')ST.fs=Math.max(15,Math.min(32,ST.fs+(+x)*2));
 else if(a==='vs'){if(hasSel()||!e.target.closest('sup'))return;const k=`${ST.bk}:${ST.ch}:${x}`;if(ST.tool==='x')delete ST.hl[k];else{const f=tog(ST.hl[k],ST.tool);if(f)ST.hl[k]=f;else delete ST.hl[k]}}
 else if(a==='tool'){ST.tool=x;const cx=selCtx();if(cx&&U.sel&&U.sel.length&&U.selId===cx.id){markSel(cx.id,x);U.sel=null;const g=getSelection();g&&g.removeAllRanges&&g.removeAllRanges()}}
 else if(a==='mark'){rcs(ST.bk,ST.ch-1,1);U.msg=`${esc(ref())} marked as read.`}
 else if(a==='note'){U.sub='notes';U.nid=null;U.edit={...blank('Notes on '+ref()),sum:'Reading notes',secs:[{t:ref(),h:'<p><br></p>'}]};top=1}
 else if(a==='open'){U.nid=x;top=1}else if(a==='back'){U.nid=null;if(U.from){U.sub='search';U.from=0}top=1}
 else if(a==='bkx'){ST.bkat=Date.now();save();dl(`cairn-study-backup-${dayStr()}.json`,JSON.stringify(bkData(),null,1));go();return toast('Backup saved to your downloads.')}
 else if(a==='bkmd'){const ns=all().filter(n=>n.mine||n.edited);if(!ns.length)return toast('You have no own or edited notes yet.');return dl(`cairn-my-notes-${dayStr()}.md`,ns.map(noteMd).join('\n\n---\n\n'),'text/markdown')}
 else if(a==='bkdocx'){const ns=ownNotes();if(!ns.length)return toast('You have no own or edited notes yet.');dlBlob(`cairn-my-notes-${dayStr()}.docx`,docxBlob(ns));return toast('Word file saved to your downloads.')}
 else if(a==='bkpdf'){const ns=ownNotes();if(!ns.length)return toast('You have no own or edited notes yet.');printNotes(ns);return toast('Choose Save as PDF in the print window.')}
 else if(a==='ndocx'){const n=getN(U.nid);if(!n)return;dlBlob(`${slug(n.title)}.docx`,docxBlob([n]));return toast('Word file saved to your downloads.')}
 else if(a==='npdf'){const n=getN(U.nid);if(!n)return;printNotes([n]);return toast('Choose Save as PDF in the print window.')}
 else if(a==='impick'){U.imode=x;U.bk=1;const f=fileIn();f.value='';f.multiple=x==='doc';f.click();return}
 else if(a==='shr'){const n=getN(U.nid);if(!n)return;const text=noteMd(n);if(navigator.share)navigator.share({title:n.title,text}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>toast('Note copied. Paste it into a message or email.'),()=>dl(slug(n.title)+'.md',text,'text/markdown'));else dl(slug(n.title)+'.md',text,'text/markdown');return}
 else if(a==='sav'){const n=getN(U.nid);if(!n)return;dl(`${slug(n.title)}.daylog-note.json`,noteJson(n));return toast('Note file saved. Import it on another device from Study notes, Backup and sharing.')}
 else if(a==='gsc'){U.gsc=x;SQ.n=80}else if(a==='gl'){U.gl=x;SQ.n=80}else if(a==='gt'){U.gt=x;SQ.n=80}else if(a==='gmore')SQ.n+=80
 else if(a==='cmver'){const f=ST.cmp.on;if(f[x])delete f[x];else f[x]=1}
 else if(a==='cmall'){ST.cmp.on={};if(x==='1')CMV.forEach(([k])=>{ST.cmp.on[k]=1})}
 else if(a==='cmdef'){ST.cmp.on={...CMDEF}}
 else if(a==='esvsave'){const k=(($('#esvk')||{}).value||'').trim();if(!k)return toast('Paste your ESV API key first.');try{localStorage.setItem(ESVK,k)}catch(e){return toast('Could not store the key on this device.')}Object.keys(EC).forEach(q=>delete EC[q]);ST.cmp.on.ESV=1}
 else if(a==='esvclear'){try{localStorage.removeItem(ESVK)}catch(e){}Object.keys(EC).forEach(q=>delete EC[q])}
 else if(a==='cmstep'){const C=ST.cmp,d=+x;let v=(d>0?C.e:C.v)+d,b=C.b,c=C.c;if(v<1){if(c>1){c--;v=cvc(b,c)}else if(b>0){b--;c=BIB[b][1];v=cvc(b,c)}else v=1}else if(v>cvc(b,c)){if(c<BIB[b][1]){c++;v=1}else if(b<BIB.length-1){b++;c=1;v=1}else v=cvc(b,c)}C.b=b;C.c=c;C.v=C.e=v}
 else if(a==='cmcopy'){const t=U.cmpTxt&&U.cmpTxt[x];if(t&&navigator.clipboard)navigator.clipboard.writeText(t).then(()=>toast('Copied.'),()=>toast('Could not copy.'));return}
 else if(a==='cmpgo'){ST.cmp.b=ST.bk;ST.cmp.c=ST.ch;ST.cmp.v=ST.cmp.e=1;U.sub='cmp';U.nid=null;U.edit=null;top=1}
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
document.addEventListener('change',e=>{const t=e.target;if(t.id==='sxi'){const fl=[...(t.files||[])],f=fl[0];if(!f)return;if(U.imode==='doc'||fl.some(z=>!/\.json$/i.test(z.name))){importDocs(fl);return}if(f.size>25e6)return alert('That file is too large to be a study backup.');if(U.imode==='replace'&&!confirm('Replace your current marks, notes and reading progress with this backup? This cannot be undone. Export a backup of your current data first if you are unsure.'))return;const r=new FileReader();r.onload=()=>doImport(String(r.result),U.imode||'merge');r.readAsText(f);return}if(/^cm[bcve]$/.test(t.id)){const C=ST.cmp;if(t.id==='cmb'){C.b=+t.value;C.c=1;C.v=C.e=1}else if(t.id==='cmc'){C.c=+t.value;C.v=C.e=1}else if(t.id==='cmv'){C.v=+t.value;if(C.e<C.v)C.e=C.v}else C.e=Math.max(+t.value,C.v);save();go();return}if(t.id==='sxb'){ST.bk=+t.value;ST.ch=1;save();go()}else if(t.id==='sxc'){ST.ch=+t.value;save();go()}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='nlpw'){e.preventDefault();nkUnlock()}});
document.addEventListener('input',e=>{if(e.target.id==='sxg'){U.gq=e.target.value;SQ.n=80;clearTimeout(SQ.t);SQ.t=setTimeout(()=>{const r=document.getElementById('sxr');if(r)r.innerHTML=srRes()},220);return}if(e.target.id!=='sxq')return;U.tq=e.target.value;const q=U.tq.toLowerCase();document.querySelectorAll('.nc[data-nid]').forEach(b=>{const n=getN(b.dataset.nid);b.hidden=!!n&&!vis(n,q)})});
{const k=localStorage.getItem(NK_KEY)||sessionStorage.getItem(NK_KEY);if(k)nkOpen(k).then(()=>rr()).catch(()=>{localStorage.removeItem(NK_KEY);sessionStorage.removeItem(NK_KEY)})}
})();