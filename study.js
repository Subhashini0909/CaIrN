// Study: Bible reader (KJV and Tamil offline, NLT live, NIV via link) + notes library (your own notes live here too)
(()=>{
const ST=S.st=Object.assign({ver:'KJV',bk:10,ch:1,fs:21,hl:{},my:[],ov:{},nm:true},S.st),U={sub:'read',nid:null,edit:null,q:'',tq:'',msg:'',sel:null,selId:null};
ST.ov=ST.ov||{};ST.an=ST.an||{};ST.del=ST.del||{};ST.tool=ST.tool||'h';ST.tv=Array.isArray(ST.tv)?ST.tv.map(tvClean).filter(Boolean):[];ST.tvth=ST.tvth|0;ST.vn=vnClean(ST.vn);Object.keys(ST.hl).forEach(k=>{if(ST.hl[k]===1||ST.hl[k]===true)ST.hl[k]='h'});ST.my=ST.my.map(m=>m.secs?m:{id:m.id,title:m.title||'Untitled',sum:[m.passage,m.tag].filter(Boolean).join(' · '),ico:'📝',secs:[{t:'Notes',h:'<p>'+esc(m.body||'').replace(/\n/g,'<br>')+'</p>',hd:1}],ts:m.ts});
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
// Highlight colours: h yellow, g green, p pink, v purple, i red, b grey, o orange (to do), c teal (caution). Only one colour per piece of text; underline (u) can be added on top.
const TL=[['h','Holy Spirit'],['g','Blessing'],['p','Promise'],['v','God and Christ'],['i','Warning'],['b','Bad'],['o','To do'],['c','Caution'],['u','Underline'],['t','Treasure'],['n','Note'],['r','Related'],['x','Clear']];
const COL='hgpvibco',VC={h:' hl',u:' ul',i:' imp',g:' hg',p:' hp',v:' hv',b:' hb',o:' ho',c:' hc'};
const canon=f=>[...new Set(f)].sort().join('');
const ad=(f,t)=>canon((COL.includes(t)?[...f].filter(c=>!COL.includes(c)).join(''):f)+t);
const tog=(f,t)=>{f=f||'';return f.includes(t)?f.replace(t,''):ad(f,t)};
const vcls=f=>f?[...f].map(k=>VC[k]||'').join(''):'';
const hash=t=>{let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return h};
const secTxt=x=>{const d=document.createElement('div');d.innerHTML=(x.hd?`<h1>${esc(x.t)}</h1>`:'')+x.h;return d.textContent};
const tools=(nmb,tv)=>`<div class="rtools" role="toolbar" aria-label="Reading tools">${TL.filter(([k])=>!'tnr'.includes(k)||tv).map(([k,l])=>`<button class="${ST.tool===k?'on':''}" data-sx="tool:${k}" aria-pressed="${ST.tool===k}"><span class="sw ${k==='x'?'':k==='t'?'tvsw':k==='n'?'tvsw vnsw':k==='r'?'tvsw':'a-'+k}">${k==='x'?'✕':k==='t'?'♥':k==='n'?'✎':k==='r'?'⇄':'Aa'}</span>${l}</button>`).join('')}${nmb?`<button class="nmtog ${ST.nm?'on':''}" data-sx="nmtog" aria-pressed="${!!ST.nm}" title="Show details when you hover over names and places"><span class="sw nmsw">Ab</span>Names</button>`:''}<span class="rhint"></span></div>`;
// segments are [start,end,flags] over a section's text; toggling a flag already on every character removes it
const paint=(list,s0,e0,t)=>{const out=[],mid=[];
 list.forEach(([a,b,f])=>{if(b<=s0||a>=e0){out.push([a,b,f]);return}if(a<s0)out.push([a,s0,f]);if(b>e0)out.push([e0,b,f]);mid.push([Math.max(a,s0),Math.min(b,e0),f])});
 mid.sort((x,y)=>x[0]-y[0]);const full=[];let c=s0;mid.forEach(([a,b,f])=>{if(a>c)full.push([c,a,'']);full.push([a,b,f]);c=b});if(c<e0)full.push([c,e0,'']);
 const on=t!=='x'&&full.every(x=>x[2].includes(t));
 full.forEach(x=>{x[2]=t==='x'?'':on?x[2].replace(t,''):ad(x[2],t)});
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
const markSel=(id,t)=>{if(t==='t'||t==='n'||t==='r')return;const A=ST.an[id]||(ST.an[id]={});
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
window.NOTES=window.NOTES||[];window.__NLOCK=0;
const TXT=window.NOTES.map(n=>({id:n.id,t:(n.title+' '+n.sum+' '+n.secs.map(s=>s.h.replace(/<[^>]+>/g,' ')).join(' ')).toLowerCase()}));
const step=d=>{let b=ST.bk,c=ST.ch+d;if(c<1){if(b===0)return;b--;c=BIB[b][1]}else if(c>BIB[b][1]){if(b===65)return;b++;c=1}ST.bk=b;ST.ch=c};
const sel=()=>`<div class="pick"><select id="sxb" aria-label="Book"><optgroup label="Old Testament">${BIB.slice(0,39).map((x,i)=>`<option value="${i}" ${i===ST.bk?'selected':''}>${x[0]}</option>`).join('')}</optgroup><optgroup label="New Testament">${BIB.slice(39).map((x,i)=>`<option value="${i+39}" ${i+39===ST.bk?'selected':''}>${x[0]}</option>`).join('')}</optgroup></select><select id="sxc" aria-label="Chapter">${[...Array(BIB[ST.bk][1])].map((_,i)=>`<option ${i+1===ST.ch?'selected':''}>${i+1}</option>`).join('')}</select></div>`;
const nltLang=h=>{const t=htmlTxt(h),a=t.slice(0,160),b=t.slice(0,600);return /\b(NTV|NVI|RVR)\b/.test(a)||(/[áéíóúñ¿¡]/.test(b)&&/ (el|la|los|las|del|que|y) /.test(b))},
nltSafe=h=>{const d=new DOMParser().parseFromString(String(h),'text/html'),OK=new Set(['SECTION','DIV','P','SPAN','H1','H2','H3','H4','SUP','SUB','EM','I','B','STRONG','BR','A','UL','OL','LI','BLOCKQUOTE','SMALL','VERSE_EXPORT']),AT=new Set(['class','vn','bk','ch','orig']),walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3)return;if(c.nodeType!==1){c.remove();return}walk(c);if(!OK.has(c.tagName)){if(/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|FORM|SVG|MATH|LINK|META|BASE|NOSCRIPT|TEMPLATE|TITLE|HEAD|IMG|VIDEO|AUDIO|INPUT|BUTTON|TEXTAREA|SELECT)$/.test(c.tagName))c.remove();else c.replaceWith(...c.childNodes)}else[...c.attributes].forEach(a=>{if(!AT.has(a.name)||!/^[\w. -]*$/.test(a.value))c.removeAttribute(a.name)})})};walk(d.body);return d.body.innerHTML.trim()},
nltGet=(r,n)=>fetch(`https://api.nlt.to/api/passages?ref=${r}${n?'':'&version=NLT'}&key=TEST${n?'&_='+Date.now():''}`,{headers:{'Accept-Language':'en'}}).then(x=>{if(!x.ok)throw 0;return x.text()}).then(h=>{const o=nltSafe(h);if(!o||nltLang(o))throw 0;return o});
// ---- Compare: one verse in several versions ----
ST.cmp=ST.cmp||{b:ST.bk,c:ST.ch,v:1,e:1,off:{}};ST.cmp.off=ST.cmp.off||{};ST.cmp.on=ST.cmp.on||{KJV:1,TAM:1,NLT:1,ASV:1,WEB:1,YLT:1};
const CMV=[['KJV','King James Version (Authorized Version)','Built in · works offline'],['TAM','\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD (Tamil)','Built in · works offline'],['NLT','New Living Translation','Live · official NLT feed'],['ESV','English Standard Version','Live · official ESV API (free key)'],['ASV','American Standard Version (1901)','Live · public domain'],['WEB','World English Bible','Live · public domain'],['YLT',"Young\u2019s Literal Translation (1898)",'Live · public domain'],['AKJV','American King James Version','Live · public domain'],['DRA','Douay-Rheims (Challoner)','Live · public domain'],['BBE','Bible in Basic English','Live · public domain'],['NIV','New International Version','Live · API.Bible key'],['NKJV','New King James Version','Live · API.Bible key'],['NASB','New American Standard Bible','Live · API.Bible key'],['CSB','Christian Standard Bible','Live · API.Bible key'],['AMP','Amplified Bible','Live · API.Bible key'],['MSG','The Message','Live · API.Bible key'],['GNT','Good News Translation','Live · API.Bible key'],['CEV','Contemporary English Version','Live · API.Bible key']],
CMG=[['Built in (offline)',['KJV','TAM']],['Official live feeds',['NLT','ESV']],['More versions (free, need internet)',['ASV','WEB','YLT','AKJV','DRA','BBE']],['Licensed versions (need a free or paid API.Bible key)',['NIV','NKJV','NASB','CSB','AMP','MSG','GNT','CEV']]],
GB={ASV:{s:['asv'],g:'ASV'},WEB:{s:['web','worldenglish'],g:'WEB'},YLT:{s:['ylt','youngs'],g:'YLT'},AKJV:{s:['akjv']},DRA:{s:['douayrheims'],g:'DRA'},BBE:{s:['basicenglish']}},
CMX=[['NIV','NIV'],['NKJV','NKJV'],['NASB','NASB'],['CSB','CSB'],['AMP','Amplified'],['NRSV','NRSV'],['MSG','The Message'],['GNT','Good News']],
ABV=new Set(['NIV','NKJV','NASB','CSB','AMP','MSG','GNT','CEV']),USFM='GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' '),ABK='cairn.abkey',AB_={list:undefined},AC={},FSID=Math.random().toString(36).slice(2),abKey=()=>{try{return localStorage.getItem(ABK)||''}catch(e){return ''}};
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
const fums=t=>{if(!t)return;try{let d=localStorage.getItem('cairn.fumsd');if(!d){d=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2));localStorage.setItem('cairn.fumsd',d)}fetch(`https://fums.api.bible/f3?t=${encodeURIComponent(t)}&dId=${d}&sId=${FSID}`,{mode:'no-cors'}).catch(()=>{})}catch(e){}};
const abList=done=>{if(AB_.list!==undefined)return AB_.list;AB_.list=null;fetch('https://rest.api.bible/v1/bibles?language=eng',{headers:{'api-key':abKey()}}).then(r=>{if(r.status===401||r.status===403)throw 'key';if(!r.ok)throw 0;return r.json()}).then(j=>{AB_.list=Array.isArray(j.data)?j.data:[];done()}).catch(e=>{AB_.list=e==='key'?'key':0;done()});return null};
const abGet=(k,C,done)=>{const l=abList(done);if(l===null)return null;if(l==='key'||l===0)return l;
 const nm=x=>String(x||'').toUpperCase().replace(/[^A-Z0-9]/g,''),ex=l.find(b=>nm(b.abbreviationLocal)===k||nm(b.abbreviation)===k)||l.find(b=>nm(b.abbreviationLocal||b.abbreviation).startsWith(k));if(!ex)return 'na';
 const BK=USFM[C.b],path=C.v===C.e?`verses/${BK}.${C.c}.${C.v}`:`passages/${BK}.${C.c}.${C.v}-${BK}.${C.c}.${C.e}`,key=ex.id+'/'+path;if(AC[key]!==undefined)return AC[key];AC[key]=null;
 fetch(`https://rest.api.bible/v1/bibles/${ex.id}/${path}?content-type=text&include-titles=false&include-verse-numbers=true&include-notes=false`,{headers:{'api-key':abKey()}}).then(r=>{if(r.status===401)throw 'key';if(r.status===403||r.status===404)throw 'na';if(!r.ok)throw 0;return r.json()}).then(j=>{const d=j.data||{},t=String(d.content||''),m={};let cur=null;t.split(/\[(\d+)\]/).forEach((p,i)=>{if(i%2)cur=+p;else if(cur!=null)m[cur]=((m[cur]||'')+' '+p).replace(/\s+/g,' ').trim()});
  if(!Object.keys(m).length&&t.trim())m[C.v]=t.replace(/\s+/g,' ').trim();AC[key]={m,cp:d.copyright||''};const mt=j.meta||{};fums(mt.fumsToken||mt.fumsId);done()}).catch(e=>{AC[key]=e==='key'?'key':e==='na'?'na':0;done()});return null};
const compare=()=>{load();const C=ST.cmp;if(!BIB[C.b])C.b=0;const n=cvc(C.b,C.c);C.c=Math.min(Math.max(1,C.c),BIB[C.b][1]);C.v=Math.min(Math.max(1,C.v),n);C.e=Math.min(Math.max(C.e,C.v),n,C.v+14);
 const rf=`${BIB[C.b][0]} ${C.c}:${C.v}${C.e>C.v?'\u2013'+C.e:''}`,key=`${C.b}:${C.c}`;U.cmpTxt={};const done=()=>{if(tab==='study'&&U.sub==='cmp'&&!(document.activeElement&&/^(esvk|abk)$/.test(document.activeElement.id)))render()},gw=c=>`https://www.biblegateway.com/passage/?search=${encodeURIComponent(rf)}&version=${c}`;
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
  if(ABV.has(k)){const lnk=`<a class="btn g s" href="${gw(k)}" target="_blank" rel="noopener">Open ${k} on BibleGateway \u2197</a>`;
   if(!abKey())return card(k,t,s,`<p class="mute">Add your API.Bible key in the box above to show this version here.</p>${lnk}`);
   const r=abGet(k,C,done);if(r===null||r===undefined)return card(k,t,s,sk);
   if(r==='key')return card(k,t,s,'<p class="mute">API.Bible did not accept this key. Check it in the box above.</p>'+lnk);
   if(r==='na')return card(k,t,s,`<p class="mute">${k} is not available on your API.Bible account. The free plan only includes public-domain and Creative Commons Bibles; licensed ones need to be added to your account.</p>${lnk}`);
   if(r===0)return card(k,t,s,`<p class="mute">This version could not be loaded right now (it needs internet).</p>${lnk}`);
   const ls=rows(r.m);return card(k,t,s,vhtml(ls)+(r.cp?`<p class="mute small">${esc(r.cp)}</p>`:''),plainOf(ls))}
  const g=GB[k];if(!g)return '';const m=gbGet(k,C,done);if(m===null||m===undefined)return card(k,t,s,sk);
  if(m===0)return card(k,t,s,`<p class="mute">This version could not be loaded right now (it needs internet).</p>${g.g?`<a class="btn g s" href="${gw(g.g)}" target="_blank" rel="noopener">Open on BibleGateway \u2197</a>`:''}`);
  const ls=rows(m);return card(k,t,s,vhtml(ls),plainOf(ls))}).join('');
 const chip=k=>`<button class="${C.on[k]?'on':''}" data-sx="cmver:${k}" aria-pressed="${!!C.on[k]}">${k==='TAM'?'\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD':k}</button>`;
 return `<div class="card cmpsel"><div class="pick cmpick"><select id="cmb" aria-label="Book"><optgroup label="Old Testament">${BIB.slice(0,39).map((x,i)=>`<option value="${i}" ${i===C.b?'selected':''}>${x[0]}</option>`).join('')}</optgroup><optgroup label="New Testament">${BIB.slice(39).map((x,i)=>`<option value="${i+39}" ${i+39===C.b?'selected':''}>${x[0]}</option>`).join('')}</optgroup></select><select id="cmc" aria-label="Chapter">${opts(BIB[C.b][1],C.c,1)}</select><select id="cmv" aria-label="From verse">${opts(n,C.v,1)}</select><span class="mute">to</span><select id="cme" aria-label="To verse">${opts(Math.min(15,n-C.v+1),C.e,C.v)}</select></div>
 <div class="cmpnav"><button class="g s" data-sx="cmstep:-1">\u2039 Previous verse</button><button class="g s" data-sx="cmstep:1">Next verse \u203A</button></div>
 ${CMG.map(([l,ks])=>`<div class="cmpgrp"><span class="mute small">${l}</span><div class="rtools cmpvers" role="group" aria-label="${l}">${ks.map(chip).join('')}</div></div>`).join('')}
 <div class="cmpnav"><button class="g s" data-sx="cmall:1">Show all</button><button class="g s" data-sx="cmall:0">Clear</button><button class="g s" data-sx="cmdef">Reset</button></div></div>
 ${CMV.some(([k])=>ABV.has(k)&&C.on[k])?(abKey()?`<div class="card cmpkey"><span class="mute small">API.Bible key saved on this device.</span><button class="g s" data-sx="abclear">Remove key</button></div>`:`<div class="card cmpkey"><b>API.Bible key</b><span class="mute small">NIV, NKJV, NASB, CSB, Amplified, The Message and others come from API.Bible. Get a key at api.bible (the free plan covers public-domain Bibles only; licensed versions need the paid plan and must be added to your account). Paste it once; it stays on this device.</span><input id="abk" class="srch" type="password" autocomplete="off" placeholder="API.Bible key"><div class="cmpf"><button class="s" data-sx="absave">Save key</button><a class="btn g s" href="https://api.bible/sign-up" target="_blank" rel="noopener">Get a key \u2197</a></div></div>`):''}
 <h2 class="ref cmpref">${esc(rf)}</h2><div class="cmpgrid">${cards||'<p class="mute">Turn on at least one version above.</p>'}</div>
 <div class="card cmpmore"><b>Also on BibleGateway</b><span class="mute small">Licensed versions are copyrighted. These open the same verse on BibleGateway.</span><div class="cmpl">${CMX.map(([c,l])=>`<a class="btn g s" href="${gw(c)}" target="_blank" rel="noopener">${l} \u2197</a>`).join('')}</div></div>`};
function body(){const k=`${ST.bk}:${ST.ch}`,r=encodeURIComponent(ref()),v=ST.ver;
 if(v==='KJV'){load();if(!KJV)return U.err?'<div class="empty">Could not load the KJV text. Check that kjv.json is next to index.html.</div>':'<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  return anWrap('KJV:'+k,`<div class="scr vl" style="font-size:${ST.fs}px">${KJV[ST.bk].chapters[ST.ch-1].map((t,i)=>`<span class="vs${vcls(ST.hl[k+':'+(i+1)])}${tvc(i+1)}" data-sx="vs:${i+1}"><sup${NM.ev(ST.bk,ST.ch,i+1)}>${i+1}</sup>${vnm(i+1)}${ST.nm&&NM.ready()?NM.mark(ST.bk,ST.ch,i+1,t):esc(t)} </span>`).join('')}</div>`)}
 if(v==='TAM'){loadT();if(!TAM)return U.errT?'<div class="empty">Could not load the Tamil text. Check that tamil.json is next to index.html.</div>':'<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  return anWrap('TAM:'+k,`<div class="scr tam vl" style="font-size:${ST.fs}px">${TAM[ST.bk].chapters[ST.ch-1].map((t,i)=>`<span class="vs${vcls(ST.hl[k+':'+(i+1)])}${tvc(i+1)}" data-sx="vs:${i+1}"><sup>${i+1}</sup>${vnm(i+1)}${esc(t)} </span>`).join('')}</div>`)}
 if(v==='NLT'){if(NC[k]){let h=NC[k];if(ST.nm&&NM.ready())h=nmNLT(h,ST.bk,ST.ch);h=tvNLT(h,ST.bk,ST.ch);h=vnNLT(h,ST.bk,ST.ch);h=vlNLT(h);const a=ST.an['NLT:'+k]&&ST.an['NLT:'+k][0];if(a&&a.r.length&&a.h===hash(htmlTxt(h)))h=wrap(h,a.r);return `<div class="scr nlt vl" style="font-size:${ST.fs}px">${h}</div>`};
  if(NC[k]===0)return ext('NLT',`https://www.biblegateway.com/passage/?search=${r}&version=NLT`,'The live NLT feed is unavailable right now (it needs internet).');
  if(NC[k]===null)return '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  NC[k]=null;const get=n=>nltGet(r,n);
  get(0).catch(()=>get(1)).then(o=>{NC[k]=o;if(tab==='study'&&U.sub==='read')render()}).catch(()=>{NC[k]=0;if(tab==='study'&&U.sub==='read')render()});return '<div class="skel"></div><div class="skel"></div><div class="skel"></div>'}
 return ext('NIV',`https://www.biblegateway.com/passage/?search=${r}&version=NIV`,'Opens in BibleGateway.')}
const ext=(v,u,t)=>`<div class="extc"><div class="big2" style="font-family:var(--serif)">${VER[v]} · ${esc(ref())}</div><p class="mute">${t}</p><a class="btn" href="${u}" target="_blank" rel="noopener">Open ${VER[v]} · ${esc(ref())} ↗</a><p class="mute" style="margin-top:14px"></p></div>`;
const nmList=()=>{if(ST.ver==='NIV')return '';load();if(!NM.ready()){if(!U.nmReq){U.nmReq=1;NM.load(()=>{U.nmReq=0;rr()})}return NM.err?'':'<p class="mute" style="margin-top:14px">Loading names and places…</p>'}
 const ch=(KJV||TAM)&&(KJV||TAM)[ST.bk].chapters[ST.ch-1],G=ch&&NM.chapter(ST.bk,ST.ch,ch.length);if(!G)return '';const tot=G.p.length+G.l.length+G.o.length;
 return `<details class="nmlist" ${U.nmopen?'open':''}><summary>People and places in this chapter <span class="nmtag">${tot}</span></summary>${tot?[['p','People and groups'],['l','Places'],['o','Titles, festivals and other names']].filter(g=>G[g[0]].length).map(([k,l])=>`<div class="nmgrp"><b>${l}</b><div class="nmcs">${G[k].map(i=>NM.chip(i)).join('')}</div></div>`).join(''):'<p class="mute">No named people or places are recorded in this chapter.</p>'}</details>`};
const chapLoad={},exEv={d:null,p:0};
// "Explain this passage" helpers: first whole sentences up to ~m characters, a readable name list, and timeline events that cover a chapter.
const exSent=(t,m)=>{t=String(t);const s=t.match(/[^.!?]+[.!?]+["”')]*(?=\s|$)/g)||[t];let o='';for(const x of s){if(o&&(o+x).length>m)break;o+=x}return o.trim()};
const exList=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
const exEvents=(bk,ch)=>{if(exEv.d===null){if(!exEv.p){exEv.p=1;fetch('events.json').then(r=>r.json()).then(j=>{exEv.d=j.e||[]}).catch(()=>{exEv.d=[]}).then(()=>{if(U.sub==='read'&&typeof rr==='function')rr()})}return null}
 const k=(x,y)=>x*1000+y,p=k(bk,ch);return exEv.d.map(e=>{const r=e.r;if(!r||!r.length)return null;const a=r[0],z=r[1]&&r[1][0]===a[0]?r[1]:a,lo=k(a[0],a[1]),hi=k(z[0],z[1]);return p>=lo&&p<=hi?{e,s:hi-lo}:null}).filter(Boolean).sort((x,y)=>x.s-y.s).slice(0,2).map(x=>x.e)};
const chapIntro=()=>{const bk=ST.bk,d=(window.CHAPINFO||{})[bk],again=()=>{if(U.sub==='read'&&ST.bk===bk&&typeof rr==='function')rr()};
 if(!d&&chapLoad[bk]!==2){if(!chapLoad[bk]){chapLoad[bk]=1;const e=document.createElement('script');e.src='ch-'+String(bk).padStart(2,'0')+'.js';e.onload=()=>{if(!(window.CHAPINFO||{})[bk])chapLoad[bk]=2;again()};e.onerror=()=>{chapLoad[bk]=2;again()};document.head.appendChild(e)}return ''}
 const c=d&&d[ST.ch-1];let a='',w='';
 if(c){a=exSent(c[0],190);w=exList((c[1]||[]).map(x=>String(x[0]).replace(/\s*\([^)]*\)/g,'')).slice(0,3))}
 else{const ev=exEvents(bk,ST.ch);if(ev===null)return '';if(ev.length){a='In this chapter: '+ev.map(e=>e.t).join('; ')+'.';w=exList([...new Set(ev.flatMap(e=>e.who||[]))].slice(0,4))}}
 if(!a)return '';
 const bi=(window.BOOKINFO||[])[bk],y=c&&typeof c[2]==='string'&&c[2]?c[2]:bi&&bi[4]?`It builds the book’s main theme — ${bi[4]}.`:'',row=(l,v)=>v?`<div><dt>${l}</dt><dd>${esc(v)}</dd></div>`:'';
 const card=`<section class="exp" aria-label="Explain this passage"><h3>Explain this passage</h3><dl>${row('What is happening',a)}${row('Who is speaking',w)}${row('Why it matters',y)}</dl></section>`;
 return card+(c?`<details class="chintro" ${U.chopen?'open':''}><summary>Chapter summary and character study</summary><p class="chs">${esc(c[0])}</p><h3>Character study</h3>${c[1].map(x=>`<div class="chc"><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div>`).join('')}</details>`:'')};
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('chintro'))U.chopen=e.target.open},true);
const bkExtras=()=>{const X=window.BKX;if(!X)return{h:'',on:0};X.warm(()=>{typeof rr==='function'&&rr()});
 const mp=X.maps(ST.bk),tc=X.tlCount(ST.bk),k=U.bkx&&U.bkx.bk===ST.bk?U.bkx.k:null,btn=(a,ic,l)=>`<button class="g s ${k===a?'on':''}" data-sx="bkx:${a}" aria-pressed="${k===a}">${ic} ${l}</button>`;
 if(!mp.length&&tc<2)return{h:'',on:0};let p='';
 if(k==='map'&&mp.length){const i=Math.min(U.bkm||0,mp.length-1);p=`<div class="bkpanel">${mp.length>1?`<div class="bkmt">${mp.map((m,j)=>`<button class="g s ${j===i?'on':''}" data-sx="bkm:${j}">${esc(X.mapTitle(ST.bk,j))}</button>`).join('')}</div>`:''}${X.mapHTML(ST.bk,i)}</div>`}
 else if(k==='tl'&&tc>=2)p=`<div class="bkpanel">${X.tlHTML(ST.bk,U.bkall)}</div>`;
 return{h:`<div class="bkx">${mp.length?btn('map','\u{1F5FA}','Map'):''}${tc>=2?btn('tl','\u23F3','Timeline'):''}</div>${p}`,on:p?1:0}};
const aboutBook=()=>{const b=(window.BOOKINFO||[])[ST.bk];if(!b)return '';const nm=BIB[ST.bk][0],m=b[5].match(/^(.+?) (\d+)/),bi=m?BIB.findIndex(x=>x[0]===m[1]):-1,kv=bi<0?esc(b[5]):`<a class="xr" data-sx="ref:${bi}:${m[2]}" href="#">${esc(b[5])}</a>`,row=(l,v)=>`<div><dt>${l}</dt><dd>${v}</dd></div>`;
 const bx=bkExtras();return `<details class="bkabout" ${ST.ch===1||bx.on?'open':''}><summary>About ${esc(nm)}</summary><p class="bksum">${esc(b[6])}</p><dl>${row('Author',esc(b[0]))}${row('Written',esc(b[1]))}${row('Type',esc(b[2]))}${row('Written for',esc(b[3]))}${row('Main theme',esc(b[4]))}${row('Key verse',kv)}${row('Chapters',BIB[ST.bk][1])}${row('Testament',ST.bk<39?'Old Testament':'New Testament')}</dl>${bx.h}</details>`};
const read=()=>`<div class="seg" role="tablist">${Object.entries(VER).map(([k,l])=>`<button class="${ST.ver===k?'on':''}" data-sx="ver:${k}">${l}</button>`).join('')}</div>
<div class="card rd"><div class="rdh">${sel()}<div class="tools"><button class="g s" data-sx="fs:-1" aria-label="Smaller text">A−</button><button class="g s" data-sx="fs:1" aria-label="Larger text">A+</button><button class="g s" data-sx="cmpgo">Compare</button></div></div>
${ST.ver==='KJV'||ST.ver==='TAM'||ST.ver==='NLT'?tools(ST.ver==='KJV'||ST.ver==='NLT',1):''}${aboutBook()}<h2 class="ref">${esc(ref())}</h2>${chapIntro()}${body()}${nmList()}
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
const lib=(list,mineTab)=>{const q=U.tq.toLowerCase();return `<input id="sxq" class="srch" placeholder="Search your notes" value="${esc(U.tq)}">${window.NOTES.length?`<div class="catbar" role="toolbar" aria-label="Note categories">${CATS.map(c=>`<button class="g s ${(U.cat||'All')===c?'on':''}" data-sx="cat:${c}">${c}</button>`).join('')}</div>`:''}${bkPanel()}${!mineTab&&window.__NLOCK?nkLockCard():''}<div class="ng"><button class="nc add" data-sx="newn"><span class="ni">＋</span><b>Create a note</b></button>${list.map(n=>`<button class="nc" data-nid="${n.id}" data-sx="open:${n.id}" ${vis(n,q)?'':'hidden'}><span class="ni">${n.ico||'📝'}</span>${n.mine?'<span class="tag">Mine</span>':n.edited?'<span class="tag">Edited</span>':''}<b>${esc(n.title)}</b><span class="mute">${esc(n.sum||'')}</span><small>${n.secs.length} section${n.secs.length===1?'':'s'} · tap to open</small></button>`).join('')}</div>${mineTab&&!list.length?'<p class="mute" style="text-align:center;margin-top:18px">Your own notes will appear here.</p>':''}${!mineTab&&window.NOTES.some(n=>ST.del[n.id])?`<details class="deln" ${U.dopen?'open':''}><summary>Deleted notes (${Object.keys(ST.del).length})</summary>${window.NOTES.filter(n=>ST.del[n.id]).map(n=>`<div class="item"><span class="ni" style="font-size:22px">${n.ico||'📝'}</span><div class="t"><b>${esc(n.title)}</b></div><button class="s" data-sx="restore:${n.id}">Restore</button></div>`).join('')}${Object.keys(ST.del).length>1?'<div style="margin-top:10px"><button class="g s" data-sx="restoreall">Restore all</button></div>':''}</details>`:''}`};
const sec=(n,i)=>{const s=n.secs[i];let h=(s.hd?`<h1>${esc(s.t)}</h1>`:'')+link(s.h);const a=ST.an[n.id]&&ST.an[n.id][i];if(a&&a.r.length&&a.h===hash(secTxt(s)))h=wrap(h,a.r);return `<section id="sxs${i}">${h}${s.img?`<img class="nimg" src="${s.img}" alt="">`:''}</section>`};
// ---- Cross-references: related verses for a tapped verse (data: OpenBible.info, CC-BY), with links that jump to them ----
let XRP=null,XRS=null;
const xrData=()=>XRP||(XRP=fetch('xref.json').then(r=>{if(!r.ok)throw 0;return r.json()}).catch(e=>{XRP=null;throw e}));
const xrEnsure=ver=>new Promise(ok=>{if(ver==='TAM')loadT();else load();let n=0;const t=()=>{if((ver==='TAM'?TAM:KJV)||++n>80)ok();else setTimeout(t,150)};t()});
const xrTok=t=>{const[a,r]=t.split('-'),[b,c,v]=a.split('.').map(Number);let c2=c,e=v;if(r){if(r.includes('.'))[c2,e]=r.split('.').map(Number);else e=+r}return{b,c,v,c2,e}};
const xrName=x=>`${BIB[x.b][0]} ${x.c}:${x.v}${x.c2!==x.c?'\u2013'+x.c2+':'+x.e:x.e>x.v?'\u2013'+x.e:''}`;
const xrText=(x,ver)=>{const d=ver==='TAM'?TAM:KJV,bk=d&&d[x.b],ch=bk&&bk.chapters[x.c-1];if(!ch)return '';if(x.c2!==x.c)return String(ch[x.v-1]||'')+' \u2026';const o=[],m=Math.min(x.e,x.v+3);for(let i=x.v;i<=m;i++)if(ch[i-1])o.push(String(ch[i-1]).trim());return o.join(' ')+(x.e>m?' \u2026':'')};
const xrClose=()=>{const el=document.getElementById('xrsheet');if(!el)return;el.remove();const o=XRS&&XRS.o;document.body.style.overflow=XRS?XRS.ov:'';XRS=null;o&&o.isConnected&&o.focus&&o.focus()};
const xrDraw=()=>{const S0=XRS;if(!S0)return;const el=S0.el,t=S0.stack[S0.stack.length-1],ver=ST.ver==='TAM'?'TAM':'KJV',me={b:t.b,c:t.c,v:t.v,c2:t.c,e:t.v},body=el.querySelector('.xrbody');
 let h=`<div class="tvph">${S0.stack.length>1?'<button class="g s" data-xr="back" aria-label="Back">\u2039 Back</button>':'<span></span>'}<button class="g s" data-xr="close" aria-label="Close">\u2715</button></div><h3 class="xrh">Related to ${esc(xrName(me))}</h3>`;
 const mt=xrText(me,ver);if(mt)h+=`<p class="vnq${ver==='TAM'?' tam':''}">${esc(mt)}</p>`;
 if(S0.err)h+='<p class="empty">Could not load the cross-references. Check that xref.json is next to index.html.</p>';
 else if(!S0.data)h+='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
 else{const L=(S0.data[`${t.b}.${t.c}.${t.v}`]||'').split(' ').filter(Boolean);
  h+=L.length?L.map(k=>{const x=xrTok(k);return `<div class="xrr"><button class="xrgo" data-xr="go:${k}"><b>${esc(xrName(x))}</b><span class="xrt${ver==='TAM'?' tam':''}">${esc(xrText(x,ver))}</span></button><button class="g s xrmore" data-xr="more:${k}" aria-label="Related verses of ${esc(xrName(x))}">Related \u203A</button></div>`}).join(''):'<p class="empty">No cross-references are recorded for this verse.</p>';
  h+='<p class="mute small xrcr">Cross-references from OpenBible.info (CC-BY).</p>'}
 body.innerHTML=h;body.scrollTop=0};
const xrOpen=(v,b,c)=>{if(!v)return;xrClose();b=b==null?ST.bk:b;c=c==null?ST.ch:c;const el=document.createElement('div');el.id='xrsheet';el.className='tvsheet';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Related verses');
 el.innerHTML='<div class="tvpanel xrbody"></div>';const S0=XRS={stack:[{b,c,v}],el,data:null,err:0,ov:document.body.style.overflow,o:document.activeElement};document.body.style.overflow='hidden';document.body.appendChild(el);xrDraw();
 Promise.all([xrData(),xrEnsure(ST.ver==='TAM'?'TAM':'KJV')]).then(([d])=>{if(XRS!==S0)return;S0.data=d;xrDraw();const g=el.querySelector('.xrgo');g&&g.focus()}).catch(()=>{if(XRS!==S0)return;S0.err=1;xrDraw()})};
document.addEventListener('click',ev=>{const sh=document.getElementById('xrsheet');if(!sh||!XRS)return;if(ev.target===sh){xrClose();return}const t=ev.target.closest&&ev.target.closest('[data-xr]');if(!t||!sh.contains(t))return;const i=t.dataset.xr.indexOf(':'),a=i<0?t.dataset.xr:t.dataset.xr.slice(0,i),x=i<0?'':t.dataset.xr.slice(i+1);
 if(a==='close')xrClose();
 else if(a==='back'){XRS.stack.pop();xrDraw()}
 else if(a==='more'){const k=xrTok(x);XRS.stack.push({b:k.b,c:k.c,v:k.v});xrDraw()}
 else if(a==='go'){const k=xrTok(x);xrClose();ST.bk=k.b;ST.ch=k.c;if(ST.ver!=='KJV'&&ST.ver!=='TAM'&&ST.ver!=='NLT')ST.ver='KJV';U.sub='read';U.nid=null;U.edit=null;U.flash=ST.ver==='NLT'?0:k.v;if(tab!=='study'){const b=document.querySelector('[data-tab=study]');b&&b.click()}save();go();if(!U.flash)scrollTo({top:0})}});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&document.getElementById('xrsheet'))xrClose()});
// ---- Verse notes: a short note on one verse, shown as a small marker beside the verse number ----
function vnClean(o){const r={};if(!o||typeof o!=='object'||Array.isArray(o))return r;Object.keys(o).forEach(k=>{const e=o[k];if(!/^\d+:\d+:\d+$/.test(k)||!e||typeof e!=='object')return;const t=String(e.t||'').trim().slice(0,1000);if(t)r[k]={t,ts:+e.ts||Date.now()}});return r}
const vnm=v=>{const n=ST.vn[`${ST.bk}:${ST.ch}:${v}`];return n?`<span class="vnm" data-sx="vnote:${v}" role="button" tabindex="0" title="${esc(n.t.slice(0,200))}" aria-label="Verse note: ${esc(n.t.slice(0,120))}"></span>`:''};
const vnNLT=(h,b,c)=>{if(!Object.keys(ST.vn).some(k=>k.startsWith(b+':'+c+':')))return h;const d=document.createElement('div');d.innerHTML=h;d.querySelectorAll('.vn').forEach(n=>{const v=nltNum(n),t=v&&ST.vn[`${b}:${c}:${v}`];if(!t)return;const m=document.createElement('span');m.className='vnm';m.dataset.sx='vnote:'+v;m.setAttribute('role','button');m.tabIndex=0;m.title=t.t.slice(0,200);n.after(m)});return d.innerHTML};
const vnFor=e=>{const o=[];for(let i=e.v;i<=e.e;i++){const n=ST.vn[`${e.b}:${e.c}:${i}`];if(n)o.push((e.e>e.v?i+': ':'')+n.t)}return o.length?`<p class="tvnote">\u270E ${esc(o.join(' \u00B7 '))}</p>`:''};
let VNS=null;
const vnClose=()=>{const el=document.getElementById('vnsheet');if(!el)return;el.remove();const o=VNS&&VNS.o;document.body.style.overflow=VNS?VNS.ov:'';VNS=null;o&&o.isConnected&&o.focus&&o.focus()};
const vnOpen=v=>{if(!v)return;vnClose();const b=ST.bk,c=ST.ch,k=`${b}:${c}:${v}`,cur=ST.vn[k],ref=`${BIB[b][0]} ${c}:${v}`,vt=tvTxt('KJV',b,c,v,v),el=document.createElement('div');
 el.id='vnsheet';el.className='tvsheet';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Note on '+ref);
 el.innerHTML=`<div class="tvpanel"><div class="tvph"><b>${esc(ref)}</b><button class="g s" data-vn="close" aria-label="Close">\u2715</button></div>${vt?`<p class="vnq">${esc(vt)}</p>`:''}<label class="vnl" for="vnta">Your note on this verse</label><textarea id="vnta" class="vnta" maxlength="1000" rows="5" placeholder="Write a short note\u2026"></textarea><div class="tvpa"><button data-vn="save">Save note</button>${cur?'<button class="g" data-vn="del">Delete note</button>':''}<button class="g" data-vn="close">Cancel</button></div></div>`;
 VNS={k,ref,ov:document.body.style.overflow,o:document.activeElement};document.body.style.overflow='hidden';document.body.appendChild(el);const ta=el.querySelector('#vnta');ta.value=cur?cur.t:'';ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)};
const vnDone=msg=>{vnClose();save();go();toast(msg)};
document.addEventListener('click',ev=>{const sh=document.getElementById('vnsheet');if(!sh||!VNS)return;if(ev.target===sh){vnClose();return}const t=ev.target.closest&&ev.target.closest('[data-vn]');if(!t||!sh.contains(t))return;const a=t.dataset.vn;
 if(a==='close')vnClose();
 else if(a==='save'){const x=sh.querySelector('#vnta').value.trim();if(!x){if(ST.vn[VNS.k]){delete ST.vn[VNS.k];return vnDone('Note removed.')}return vnClose()}ST.vn[VNS.k]={t:x.slice(0,1000),ts:Date.now()};vnDone('Note saved on '+VNS.ref+'.')}
 else if(a==='del'){if(!confirm('Delete the note on '+VNS.ref+'?'))return;delete ST.vn[VNS.k];vnDone('Note deleted.')}});
document.addEventListener('keydown',ev=>{const sh=document.getElementById('vnsheet');if(sh&&VNS){if(ev.key==='Escape')vnClose();else if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){const b=sh.querySelector('[data-vn=save]');b&&b.click()}return}
 const m=ev.target.closest&&ev.target.closest('.vnm');if(m&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();m.click()}});
// ---- Treasured verses: save verses to a list, then copy them or share one as a styled image ----
function tvClean(e){if(!e||typeof e!=='object'||Array.isArray(e))return null;const ver=String(e.ver),b=+e.b,c=+e.c,v=+e.v,en=+(e.e||e.v);
 if(!/^(KJV|TAM|NLT)$/.test(ver)||!Number.isInteger(b)||!BIB[b]||!Number.isInteger(c)||c<1||c>BIB[b][1]||!Number.isInteger(v)||v<1||v>200||!Number.isInteger(en)||en<v||en>v+60)return null;
 const t=String(e.t||'').replace(/\s+/g,' ').trim().slice(0,4000);if(!t)return null;return{k:`${ver}.${b}.${c}.${v}`,ver,b,c,v,e:en,t,ts:+e.ts||Date.now()}}
const tvRef=e=>`${BIB[e.b][0]} ${e.c}:${e.v}${e.e>e.v?'\u2013'+e.e:''}`;
const tvLine=e=>`\u201C${e.t}\u201D\n${tvRef(e)} (${VER[e.ver]||e.ver})`;
const tvBy=k=>ST.tv.find(e=>e.k===k);
const tvHit=(ver,b,c,v)=>ST.tv.find(e=>e.ver===ver&&e.b===b&&e.c===c&&v>=e.v&&v<=e.e);
const tvc=v=>tvHit(ST.ver,ST.bk,ST.ch,v)?' tv':'';
const tvDrop=e=>{ST.tv=ST.tv.filter(x=>x!==e)};
const tvPut=(ver,b,c,v,en,t)=>{t=String(t||'').replace(/\s+/g,' ').trim();if(!t)return false;ST.tv=ST.tv.filter(e=>!(e.ver===ver&&e.b===b&&e.c===c&&e.v<=en&&e.e>=v));ST.tv.push({k:`${ver}.${b}.${c}.${v}`,ver,b,c,v,e:en,t:t.slice(0,4000),ts:Date.now()});return true};
const tvTxt=(ver,b,c,v,en)=>{const d=ver==='KJV'?KJV:ver==='TAM'?TAM:null,ch=d&&d[b]&&d[b].chapters[c-1];if(!ch)return '';const o=[];for(let i=v;i<=en;i++)if(ch[i-1])o.push(String(ch[i-1]).trim());return o.join(' ')};
const copyTxt=t=>{const ok=()=>toast('Copied.'),fb=()=>{const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(a);a.select();let g=false;try{g=document.execCommand('copy')}catch(x){}a.remove();g?ok():toast('Could not copy.')};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,fb);else fb()};
// NLT is live HTML: find a verse number, the text range of a verse, and the plain text inside that range
const nltNum=vn=>{const ve=vn.closest('verse_export'),a=vn.getAttribute('vn')||(ve&&ve.getAttribute('vn'));return a&&/^\d+$/.test(a)?+a:(parseInt(vn.textContent,10)||0)};
const nltSpan=(sc,vn)=>{const r=document.createRange(),ve=vn.closest('verse_export');if(ve)r.selectNodeContents(ve);else{r.setStartBefore(vn);const l=[...sc.querySelectorAll('.vn')],nx=l[l.indexOf(vn)+1];nx?r.setEndBefore(nx):r.setEnd(sc,sc.childNodes.length)}
 const pre=document.createRange();pre.selectNodeContents(sc);pre.setEnd(r.startContainer,r.startOffset);const a=pre.toString().length;return{r,a,b:a+r.toString().length}};
const nltText=r=>{const d=document.createElement('div');d.appendChild(r.cloneContents());d.querySelectorAll('.vn,.tn,.tn-ref,.footnote,.a-tn,.cw,.cw_ch,.chapter-number,sup,h1,h2,h3,h4,.bk_ch_vs_header,.subhead').forEach(x=>x.remove());return d.textContent.replace(/\s+/g,' ').trim()};
// one verse per line: the NLT feed wraps each verse in <verse_export>; if it ever does not, break before each verse number
const vlNLT=h=>{if(/<verse_export/i.test(h))return h;const d=document.createElement('div');d.innerHTML=h;[...d.querySelectorAll('.vn')].slice(1).forEach(n=>n.before(Object.assign(document.createElement('span'),{className:'vbr'})));return d.innerHTML};
const tvNLT=(h,b,c)=>{if(!ST.tv.some(e=>e.ver==='NLT'&&e.b===b&&e.c===c))return h;const d=document.createElement('div');d.innerHTML=h;d.querySelectorAll('.vn').forEach(n=>{const v=nltNum(n);if(v&&tvHit('NLT',b,c,v))n.classList.add('tvn')});return d.innerHTML};
const tvTap=v=>{const h=tvHit(ST.ver,ST.bk,ST.ch,v);if(h){tvDrop(h);return toast('Removed '+tvRef(h)+' from Treasured verses.')}const t=tvTxt(ST.ver,ST.bk,ST.ch,v,v);if(!t)return toast('That verse has not loaded yet.');tvPut(ST.ver,ST.bk,ST.ch,v,v,t);toast('Treasured '+BIB[ST.bk][0]+' '+ST.ch+':'+v+'.')};
const tvTapNlt=(vn,sc)=>{const v=nltNum(vn);if(!v)return;const h=tvHit('NLT',ST.bk,ST.ch,v);if(h){tvDrop(h);toast('Removed '+tvRef(h)+' from Treasured verses.')}else{const t=nltText(nltSpan(sc,vn).r);if(!t)return toast('Could not read that verse.');tvPut('NLT',ST.bk,ST.ch,v,v,t);toast('Treasured '+BIB[ST.bk][0]+' '+ST.ch+':'+v+'.')}save();go()};
const nltAt=(e,sc)=>{let n=null;if(document.caretRangeFromPoint){const r=document.caretRangeFromPoint(e.clientX,e.clientY);if(r)n=r.startContainer}else if(document.caretPositionFromPoint){const q=document.caretPositionFromPoint(e.clientX,e.clientY);if(q)n=q.offsetNode}
 if(!n||!sc.contains(n))return null;let best=null;sc.querySelectorAll('.vn').forEach(vn=>{if(vn.compareDocumentPosition(n)&4)best=vn});return best};
document.addEventListener('click',e=>{if(!'tnr'.includes(ST.tool)||tab!=='study'||U.sub!=='read'||ST.ver!=='NLT'||hasSel())return;const sc=e.target.closest&&e.target.closest('.scr.nlt');
 if(!sc||e.target.closest('.vn,h1,h2,h3,h4,.subhead,.bk_ch_vs_header,.footnote,.tn,.tn-ref,a,button,[data-sx]'))return;const vn=nltAt(e,sc);if(vn){if(ST.tool==='r')xrOpen(nltNum(vn));else if(ST.tool==='n')vnOpen(nltNum(vn));else tvTapNlt(vn,sc)}});
const tvRuns=a=>{const o=[];a.forEach(n=>{const l=o[o.length-1];if(l&&n===l[1]+1)l[1]=n;else o.push([n,n])});return o};
// verses touched by the text selected in the reader: {verse number: 1 (KJV/Tamil) or its text (NLT)}
const tvSelVerses=()=>{const g=getSelection(),out={};if(!g||!g.rangeCount||g.isCollapsed)return out;const r=g.getRangeAt(0);
 if(ST.ver==='KJV'||ST.ver==='TAM'){document.querySelectorAll('.scr .vs').forEach(el=>{const m=/^vs:(\d+)$/.exec(el.dataset.sx||'');if(!m)return;const sr=document.createRange();sr.selectNodeContents(el);const c=r.cloneRange();
  if(c.compareBoundaryPoints(Range.START_TO_START,sr)<0)c.setStart(sr.startContainer,sr.startOffset);if(c.compareBoundaryPoints(Range.END_TO_END,sr)>0)c.setEnd(sr.endContainer,sr.endOffset);
  if(/\S/.test(c.toString().replace(/^\s*\d+\s*$/,'')))out[+m[1]]=1})}
 else if(ST.ver==='NLT'&&U.sel&&U.sel[0]&&U.selId===`NLT:${ST.bk}:${ST.ch}`){const sc=document.querySelector('.scr.nlt');if(!sc)return out;const s=U.sel[0];
  sc.querySelectorAll('.vn').forEach(vn=>{const v=nltNum(vn),o=nltSpan(sc,vn);if(v&&o.b>s.s&&o.a<s.e){const t=nltText(o.r);if(t)out[v]=out[v]?out[v]+' '+t:t}})}
 return out};
const tvSelSave=()=>{const m=tvSelVerses(),vs=Object.keys(m).map(Number).sort((a,b)=>a-b);if(!vs.length)return false;let n=0,last='';
 tvRuns(vs).forEach(([a,b])=>{let t='';if(ST.ver==='NLT'){const p=[];for(let i=a;i<=b;i++)if(typeof m[i]==='string')p.push(m[i]);t=p.join(' ')}else t=tvTxt(ST.ver,ST.bk,ST.ch,a,b);
  if(tvPut(ST.ver,ST.bk,ST.ch,a,b,t)){n++;last=`${BIB[ST.bk][0]} ${ST.ch}:${a}${b>a?'\u2013'+b:''}`}});
 if(!n)return false;toast(n===1?'Treasured '+last+'.':n+' passages added to Treasured verses.');return true};
// the Treasured verses tab
const tvSorted=()=>[...ST.tv].sort(U.tvs==='bible'?(a,b)=>a.b-b.b||a.c-b.c||a.v-b.v||(a.ver<b.ver?-1:1):(a,b)=>b.ts-a.ts);
const tvHay=e=>(tvRef(e)+' '+e.t+' '+(VER[e.ver]||e.ver)).toLowerCase();
const tvList=()=>{const n=ST.tv.length,q=(U.tvq||'').trim().toLowerCase(),L=tvSorted();
 return `<div class="card tvh"><div class="tvht"><h2 class="ref">Treasured verses</h2><span class="nmtag">${n}</span></div>${n?`<input id="tvq" class="srch" type="search" autocomplete="off" placeholder="Search your treasured verses" aria-label="Search treasured verses" value="${esc(U.tvq||'')}"><div class="tvbar"><div class="rtools tvsort" role="group" aria-label="Sort order">${[['new','Newest first'],['bible','Bible order']].map(([k,l])=>`<button class="${(U.tvs||'new')===k?'on':''}" data-sx="tvsort:${k}">${l}</button>`).join('')}</div><button class="g s" data-sx="tvcpall">Copy all</button></div>`:`<div class="empty">No treasured verses yet.<br>In <b>Read Bible</b>, choose <b>\u2665 Treasure</b>, then tap a verse. To save several verses together, select the text first, then tap Treasure.</div>`}</div>
${L.map(e=>`<article class="card tvc" data-tq="${esc(tvHay(e))}"${!q||tvHay(e).includes(q)?'':' hidden'}><div class="tvm"><b>${esc(tvRef(e))}</b><span class="tvv">${esc(VER[e.ver]||e.ver)}</span></div><p class="tvt${e.ver==='TAM'?' tam':''}">${esc(e.t)}</p>${vnFor(e)}<div class="tvf"><button class="s" data-sx="tvimg:${e.k}">Share as image</button><button class="g s" data-sx="tvcp:${e.k}">Copy</button><button class="g s" data-sx="xrrel:${e.k}">Related</button><button class="g s" data-sx="tvgo:${e.k}">Open</button><button class="g s" data-sx="tvdel:${e.k}">Remove</button></div></article>`).join('')}${n?`<p class="empty tvnone"${L.some(e=>!q||tvHay(e).includes(q))?' hidden':''}>No treasured verse matches that search.</p>`:''}`};
// share sheet: a preview of the styled image, three looks, then share, save or copy
const TVTH=[['Midnight',['#0F1533','#27346F'],'#F6F0E0','#E3C77A','#A3AAD6'],['Parchment',['#FCF8EE','#EEE2C4'],'#1B1D2E','#A67E2C','#7C7358'],['Forest',['#0F281D','#25593F'],'#F3F0E2','#E3C77A','#A2C6B3']];
const tvDraw=async(cv,e,th,live)=>{const [,bg,ink,acc,mut]=th,W=1080,tam=e.ver==='TAM',
  CG='"Cormorant Garamond",Georgia,"Times New Roman",serif',SAN='Inter,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  SER=tam?'"Noto Serif Tamil","Noto Sans Tamil","Nirmala UI",Latha,serif':CG,fT=z=>`600 ${z}px ${SER}`;
 try{await Promise.all([document.fonts.load(fT(40),tam?'\u0B85':'Ab'),document.fonts.load(`700 40px ${CG}`,'Ab'),document.fonts.load(`600 40px ${CG}`,'Ab'),document.fonts.load(`600 24px ${SAN}`,'Ab')])}catch(x){}
 if(live&&!live())return false;
 const mc=document.createElement('canvas').getContext('2d'),PAD=130,MW=W-PAD*2,LH=tam?1.8:1.4,HEAD=250,REF=200,FOOT=170;
 const lay=z=>{mc.font=fT(z);const L=[];let cur='';e.t.split(' ').forEach(w=>{const t=cur?cur+' '+w:w;if(cur&&mc.measureText(t).width>MW){L.push(cur);cur=w}else cur=t});if(cur)L.push(cur);return L};
 let sz=tam?54:66,lines=lay(sz);const MIN=tam?28:32,AV=1350-HEAD-REF-FOOT;while(sz>MIN&&lines.length*sz*LH>AV){sz-=2;lines=lay(sz)}
 const need=lines.length*sz*LH,H=Math.max(1350,Math.ceil(HEAD+need+REF+FOOT));cv.width=W;cv.height=H;const cx=cv.getContext('2d');cx.textBaseline='alphabetic';
 const track=(s,y,font,col,ls)=>{cx.font=font;cx.fillStyle=col;cx.textAlign='left';const a=[...s],w=a.map(c=>cx.measureText(c).width+ls),tot=w.reduce((p,q)=>p+q,0)-ls;let x=(W-tot)/2;a.forEach((c,i)=>{cx.fillText(c,x,y);x+=w[i]})};
 const g=cx.createLinearGradient(0,0,W*.6,H);g.addColorStop(0,bg[0]);g.addColorStop(1,bg[1]);cx.fillStyle=g;cx.fillRect(0,0,W,H);
 const rg=cx.createRadialGradient(W*.85,H*.08,0,W*.85,H*.08,W*.7);rg.addColorStop(0,acc+'2E');rg.addColorStop(1,acc+'00');cx.fillStyle=rg;cx.fillRect(0,0,W,H);
 cx.strokeStyle=acc;cx.globalAlpha=.55;cx.lineWidth=2;cx.strokeRect(44,44,W-88,H-88);cx.globalAlpha=.25;cx.lineWidth=1;cx.strokeRect(58,58,W-116,H-116);
 cx.globalAlpha=.12;cx.fillStyle=acc;cx.font=`700 460px ${CG}`;cx.textAlign='left';cx.fillText('\u201C',72,HEAD+330);cx.globalAlpha=1;
 track('TREASURED VERSE',150,`600 25px ${SAN}`,acc,6);
 cx.strokeStyle=acc;cx.globalAlpha=.8;cx.lineWidth=2;cx.beginPath();cx.moveTo(W/2-120,196);cx.lineTo(W/2-18,196);cx.moveTo(W/2+18,196);cx.lineTo(W/2+120,196);cx.stroke();cx.globalAlpha=1;
 cx.fillStyle=acc;cx.beginPath();cx.moveTo(W/2,186);cx.lineTo(W/2+9,196);cx.lineTo(W/2,206);cx.lineTo(W/2-9,196);cx.closePath();cx.fill();
 const top=HEAD+Math.max(0,(H-HEAD-REF-FOOT-need)/2);cx.fillStyle=ink;cx.font=fT(sz);cx.textAlign='center';lines.forEach((l,i)=>cx.fillText(l,W/2,top+i*sz*LH+sz*(LH*.5+.3)));
 const y0=H-FOOT-REF;cx.strokeStyle=acc;cx.globalAlpha=.7;cx.lineWidth=2;cx.beginPath();cx.moveTo(W/2-44,y0+24);cx.lineTo(W/2+44,y0+24);cx.stroke();cx.globalAlpha=1;
 let rs=58,rf=`700 ${rs}px ${CG}`;const rt=tvRef(e);cx.font=rf;while(rs>34&&cx.measureText(rt).width>MW){rs-=2;rf=`700 ${rs}px ${CG}`;cx.font=rf}
 cx.fillStyle=acc;cx.textAlign='center';cx.fillText(rt,W/2,y0+100);track(tam?'TAMIL':e.ver,y0+150,`600 24px ${SAN}`,mut,5);
 track('CaIrN',H-122,`600 38px ${CG}`,ink,8);track('MARK YOUR PATH',H-92,`500 16px ${SAN}`,mut,5);
 if(e.ver==='NLT'){cx.font=`400 15px ${SAN}`;cx.fillStyle=mut;cx.textAlign='center';cx.fillText('NLT \u00A9 Tyndale House Foundation',W/2,H-72)}
 return true};
let TVS=null;
const tvClose=()=>{const el=document.getElementById('tvsheet');if(!el)return;el.remove();const o=TVS&&TVS.opener;document.body.style.overflow=TVS?TVS.ov:'';TVS=null;o&&o.isConnected&&o.focus&&o.focus()};
const tvRender=()=>{const T=TVS;if(!T)return;const my=++T.seq,cv=T.el.querySelector('canvas'),bs=T.el.querySelectorAll('[data-tv=share],[data-tv=save]');T.blob=null;bs.forEach(b=>b.disabled=true);
 tvDraw(cv,T.e,TVTH[T.th],()=>TVS===T&&my===T.seq).then(ok=>ok?new Promise(r=>cv.toBlob(r,'image/png')):null).then(b=>{if(TVS!==T||my!==T.seq||!b)return;T.blob=b;bs.forEach(x=>{x.disabled=false})}).catch(()=>{if(TVS===T)toast('Could not make the image.')})};
const tvSheet=e=>{tvClose();const th=Math.min(TVTH.length-1,Math.max(0,ST.tvth|0)),el=document.createElement('div');el.id='tvsheet';el.className='tvsheet';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Share '+tvRef(e));
 el.innerHTML=`<div class="tvpanel"><div class="tvph"><b>${esc(tvRef(e))}</b><button class="g s" data-tv="close" aria-label="Close">\u2715</button></div><div class="tvprev"><canvas role="img" aria-label="Preview of the verse image"></canvas></div><div class="rtools tvth" role="group" aria-label="Image style">${TVTH.map((t,i)=>`<button class="${i===th?'on':''}" data-tv="th:${i}"><span class="tvdot" style="background:linear-gradient(135deg,${t[1][0]},${t[1][1]})"></span>${t[0]}</button>`).join('')}</div><div class="tvpa"><button data-tv="share" disabled>Share image</button><button class="g" data-tv="save" disabled>Save image</button><button class="g" data-tv="copy">Copy text</button></div></div>`;
 TVS={e,th,blob:null,seq:0,ov:document.body.style.overflow,opener:document.activeElement,el};document.body.style.overflow='hidden';document.body.appendChild(el);tvRender();const b=el.querySelector('[data-tv=share]');b&&b.focus()};
document.addEventListener('click',ev=>{const sh=document.getElementById('tvsheet');if(!sh||!TVS)return;if(ev.target===sh){tvClose();return}const t=ev.target.closest&&ev.target.closest('[data-tv]');if(!t||!sh.contains(t))return;const[a,x]=t.dataset.tv.split(':');
 if(a==='close')tvClose();
 else if(a==='th'){TVS.th=+x;ST.tvth=+x;save();sh.querySelectorAll('.tvth button').forEach((b,i)=>b.classList.toggle('on',i===+x));tvRender()}
 else if(a==='copy')copyTxt(tvLine(TVS.e));
 else if(a==='save'||a==='share'){const b=TVS.blob;if(!b)return toast('Still preparing the image\u2026');const nm=slug(tvRef(TVS.e))+'.png';
  if(a==='save'){dlBlob(nm,b);toast('Image saved to your downloads.');return}
  let f=null;try{f=new File([b],nm,{type:'image/png'})}catch(z){}
  if(f&&navigator.share&&navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:tvRef(TVS.e)}).catch(z=>{if(!z||z.name!=='AbortError'){dlBlob(nm,b);toast('Image saved to your downloads.')}});
  else{dlBlob(nm,b);toast('Sharing is not available here, so the image was saved to your downloads.')}}});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&document.getElementById('tvsheet'))tvClose()});
const view=()=>{const n=getN(U.nid);return `<div class="row"><button class="g s" data-sx="back">‹ All notes</button><span class="acts"><button class="s" data-sx="edit">✎ Edit</button><button class="g s" data-sx="shr">Share</button><button class="g s" data-sx="ndocx">Word</button><button class="g s" data-sx="npdf">PDF</button>${n.edited?'<button class="g s" data-sx="ereset">Reset to original</button>':''}<button class="g s" data-sx="edel">Delete</button></span></div><div class="card nb"><h2 class="ref">${n.ico||'📝'} ${esc(n.title)}</h2><p class="mute">${esc(n.sum||'')}</p><div class="chips">${tools()}${n.secs.map((s,i)=>`<button class="g s" data-sx="sec:${i}">${esc(s.t)}</button>`).join('')}</div>${n.secs.map((s,i)=>sec(n,i)).join('')}</div>`};
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
const bkData=()=>({app:'daylog-study',v:1,exported:new Date().toISOString(),st:{hl:ST.hl,my:ST.my,ov:ST.ov,an:ST.an,del:ST.del,tv:ST.tv,vn:ST.vn},rc:S.rc||{}});
const bkCounts=()=>{const m=Object.keys(ST.hl).length,a=Object.keys(ST.an).length,my=ST.my.length,ed=Object.keys(ST.ov).length,pl=(n,w)=>n+' '+w+(n===1?'':'s');return `${pl(my,'own note')}, ${pl(ed,'edited note')}, ${pl(m,'marked verse')}, ${pl(a,'note')} with highlights, ${pl(ST.tv.length,'treasured verse')}`};
const bkPanel=()=>`<details class="bkp" ${U.bk?'open':''}><summary>Import and export</summary><div class="bkrow"><button class="s" data-sx="impick:doc" title="PDF, Word, Excel or image files">\u2B06 Import</button><button class="g s" data-sx="expzip:docx" title="All notes, one Word file each, in a zip">\u2B07 Export all as Word (.zip)</button><button class="g s" data-sx="expzip:pdf" title="All notes, one PDF each, in a zip">\u2B07 Export all as PDF (.zip)</button></div></details>`;
const cleanNote=n=>{if(!isO(n)||!Array.isArray(n.secs))return null;const secs=n.secs.filter(isO).slice(0,80).map(x=>({t:String(x.t||'Notes').slice(0,200),h:clean(String(x.h||''),1),hd:1,...(typeof x.img==='string'&&x.img.length<3e6&&/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(x.img)?{img:x.img}:{})}));if(!secs.length)return null;return{title:String(n.title||'Untitled').slice(0,200),sum:String(n.sum||'').slice(0,500),ico:String(n.ico||'\uD83D\uDCDD').slice(0,8),secs}};
const flagOK=v=>typeof v==='string'&&/^[huigpvboc]+$/.test(v);
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
 const tvIn=Array.isArray(s.tv)?s.tv.map(tvClean).filter(Boolean).slice(0,2000):null;const vnIn=isO(s.vn)?vnClean(s.vn):null;let nH=0,nM=0,nO=0,nA=0,nT=0,nN=0;
 if(mode==='replace'){ST.hl=hl;ST.my=my;ST.ov=ov;ST.an=an;ST.del=del;S.rc=rc;if(tvIn)ST.tv=tvIn;if(vnIn)ST.vn=vnIn}
 else{Object.keys(hl).forEach(k=>{const m=canon((ST.hl[k]||'')+hl[k]);if(m!==ST.hl[k]){ST.hl[k]=m;nH++}});
  my.forEach(m=>{const i=ST.my.findIndex(x=>x.id===m.id);if(i<0){ST.my.push(m);nM++}else if((m.ts||0)>(ST.my[i].ts||0)){ST.my[i]=m;nM++}});
  Object.keys(ov).forEach(k=>{if(!ST.ov[k]){ST.ov[k]=ov[k];nO++}});
  Object.keys(an).forEach(k=>{const X=ST.an[k]||(ST.an[k]={});Object.keys(an[k]).forEach(i=>{if(!X[i]){X[i]=an[k][i];nA++}})});
  Object.keys(del).forEach(k=>{if(!ST.del[k]&&!ST.ov[k])ST.del[k]=1});
  if(vnIn)Object.keys(vnIn).forEach(k=>{if(!ST.vn[k]){ST.vn[k]=vnIn[k];nN++}});
  if(tvIn)tvIn.forEach(t=>{if(!ST.tv.some(x=>x.k===t.k)){ST.tv.push(t);nT++}});
  Object.keys(rc).forEach(b=>{const a=S.rc[b]||(S.rc[b]=[]);rc[b].forEach((v,i)=>{if((a[i]||0)<v)a[i]=v})})}
 U.nid=null;U.edit=null;U.bk=1;save();go();
 toast(mode==='replace'?'Backup restored.':`Merged: ${nM} note${nM===1?'':'s'}, ${nO} edited note${nO===1?'':'s'}, ${nH} marked verse${nH===1?'':'s'}, ${nA} highlight${nA===1?'':'s'}, ${nT} treasured verse${nT===1?'':'s'}, ${nN} verse note${nN===1?'':'s'} added.`)};
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
const imgX=(d,im)=>{const u=dataBytes(d),[w,h]=jpegSize(u),cw=Math.min(6000000,Math.round(w*9525)),ch=Math.round(cw*h/w);im.push(u);const i=im.length;return `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cw}" cy="${ch}"/><wp:docPr id="${i}" name="Image ${i}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${i}" name="image${i}.jpg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdI${i}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cw}" cy="${ch}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`};
const noteX=(n,im)=>paraX(runX(((n.ico?n.ico+' ':'')+n.title).trim(),{}),'Title')+(n.sum?paraX(runX(n.sum,{i:1})):'')+n.secs.map(s=>paraX(runX(s.t||'Notes',{}),'Heading1')+htmlParas(noteBody(s))+(s.img&&im?imgX(s.img,im):'')).join('');
const docxBlob=ns=>{const im=[],body=ns.map(n=>noteX(n,im)).join('<w:p><w:r><w:br w:type="page"/></w:r></w:p>'),H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
 st=(id,nm,pp,rp,ol)=>`<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${nm}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr>${pp}${ol==null?'':`<w:outlineLvl w:val="${ol}"/>`}</w:pPr><w:rPr>${rp}</w:rPr></w:style>`,
 styles=`${H}<w:styles xmlns:w="${WNS}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri" w:eastAsia="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>${st('Title','Title','<w:spacing w:after="160"/>','<w:b/><w:color w:val="0F1533"/><w:sz w:val="44"/>')}${st('Heading1','heading 1','<w:keepNext/><w:spacing w:before="280" w:after="100"/>','<w:b/><w:color w:val="8A6A28"/><w:sz w:val="32"/>',0)}${st('Heading2','heading 2','<w:keepNext/><w:spacing w:before="200" w:after="80"/>','<w:b/><w:sz w:val="26"/>',1)}</w:styles>`,
 files=[['[Content_Types].xml',`${H}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`],
  ['_rels/.rels',`${H}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],
  ['word/_rels/document.xml.rels',`${H}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>${im.map((_,i)=>`<Relationship Id="rIdI${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${i+1}.jpg"/>`).join('')}</Relationships>`],
  ['word/styles.xml',styles],['word/document.xml',`${H}<w:document xmlns:w="${WNS}" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`]];
 return zipStore(files.concat(im.map((u,i)=>['word/media/image'+(i+1)+'.jpg',u])).map(([n,t])=>[n,typeof t==='string'?U8.encode(t):t]),'application/vnd.openxmlformats-officedocument.wordprocessingml.document')};
const dlBlob=(name,b)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800)};
const printNotes=ns=>{let r=document.getElementById('printroot');if(r)r.remove();r=document.createElement('div');r.id='printroot';
 r.innerHTML=ns.map(n=>`<article class="pn"><h1>${esc(((n.ico?n.ico+' ':'')+n.title).trim())}</h1>${n.sum?`<p class="ps">${esc(n.sum)}</p>`:''}${n.secs.map(s=>`<h2>${esc(s.t||'Notes')}</h2>${clean(noteBody(s),1)}`).join('')}</article>`).join('');
 document.body.appendChild(r);document.body.classList.add('pr');const done=()=>{document.body.classList.remove('pr');r.remove();removeEventListener('afterprint',done)};addEventListener('afterprint',done);setTimeout(()=>print(),60)};
const ownNotes=()=>all().filter(n=>n.mine||n.edited);
const inflateRaw=async u=>{const ds=new DecompressionStream('deflate-raw'),w=ds.writable.getWriter();w.write(u);w.close();return new Uint8Array(await new Response(ds.readable).arrayBuffer())};
const unzipEntry=async(buf,want)=>{const v=new DataView(buf),u=new Uint8Array(buf);let e=-1;for(let i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-66000);i--)if(v.getUint32(i,true)===0x06054b50){e=i;break}
 if(e<0)throw new Error('zip');let n=v.getUint16(e+10,true),p=v.getUint32(e+16,true);
 for(let k=0;k<n;k++){if(v.getUint32(p,true)!==0x02014b50)throw new Error('zip');const m=v.getUint16(p+10,true),cs=v.getUint32(p+20,true),nl=v.getUint16(p+28,true),xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),lo=v.getUint32(p+42,true),name=new TextDecoder().decode(u.subarray(p+46,p+46+nl));
  if(want instanceof RegExp?want.test(name):name===want){const s=lo+30+v.getUint16(lo+26,true)+v.getUint16(lo+28,true),d=u.subarray(s,s+cs);if(m===0)return d;if(m===8)return inflateRaw(d);throw new Error('zip')}p+=46+nl+xl+cl}return null};
const baseName=f=>f.name.replace(/\.[^.]+$/,'');
const unzipAll=async buf=>{const v=new DataView(buf),u=new Uint8Array(buf);let e=-1;for(let i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-66000);i--)if(v.getUint32(i,true)===0x06054b50){e=i;break}
 if(e<0)throw new Error('zip');const n=Math.min(v.getUint16(e+10,true),200),out=[];let p=v.getUint32(e+16,true);
 for(let k=0;k<n;k++){if(v.getUint32(p,true)!==0x02014b50)throw new Error('zip');const m=v.getUint16(p+10,true),cs=v.getUint32(p+20,true),nl=v.getUint16(p+28,true),xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),lo=v.getUint32(p+42,true),name=new TextDecoder().decode(u.subarray(p+46,p+46+nl));
  if(!/\/$/.test(name)&&(m===0||m===8)){const s=lo+30+v.getUint16(lo+26,true)+v.getUint16(lo+28,true),d=u.subarray(s,s+cs);out.push([name,m===0?d:await inflateRaw(d)])}p+=46+nl+xl+cl}return out};
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
const xlsxNote=async f=>{const buf=await f.arrayBuffer(),rd=async p=>{const x=await unzipEntry(buf,p);return x?new TextDecoder().decode(x):null},P=s=>new DOMParser().parseFromString(s,'application/xml');
 const wb=await rd('xl/workbook.xml');if(!wb)throw new Error('xlsx');
 const rels=P(await rd('xl/_rels/workbook.xml.rels')||'<r/>'),map={};[...rels.getElementsByTagName('Relationship')].forEach(r=>{map[r.getAttribute('Id')]=r.getAttribute('Target')||''});
 const ss=await rd('xl/sharedStrings.xml'),strs=ss?[...P(ss).getElementsByTagName('si')].map(si=>[...si.getElementsByTagName('t')].filter(t=>t.parentNode.localName!=='rPh').map(t=>t.textContent).join('')):[];
 const secs=[];
 for(const sh of [...P(wb).getElementsByTagName('sheet')]){const tg=(map[sh.getAttribute('r:id')]||'').replace(/^\//,''),sx=await rd(tg.startsWith('xl/')?tg:'xl/'+tg);if(!sx)continue;
  const rows=[];let mc=0;[...P(sx).getElementsByTagName('row')].slice(0,2000).forEach(r=>{const cells=[];[...r.getElementsByTagName('c')].forEach(c=>{const m=(c.getAttribute('r')||'').match(/^([A-Z]+)/);let ci=0;if(m)for(const ch of m[1])ci=ci*26+ch.charCodeAt(0)-64;ci=ci?ci-1:cells.length;if(ci>=60)return;
    const t=c.getAttribute('t'),ve=c.getElementsByTagName('v')[0];let v=ve?ve.textContent:'';if(t==='s')v=strs[+v]||'';else if(t==='inlineStr')v=[...c.getElementsByTagName('t')].map(x=>x.textContent).join('');else if(t==='b')v=v==='1'?'TRUE':'FALSE';cells[ci]=v;mc=Math.max(mc,ci+1)});rows.push(cells)});
  while(rows.length&&!rows[rows.length-1].some(Boolean))rows.pop();if(!rows.length)continue;
  secs.push({t:sh.getAttribute('name')||'Sheet',h:tblHtml(rows,mc)})}
 if(!secs.length)throw new Error('empty');return[{title:baseName(f),secs}]};
const tblHtml=(rows,mc)=>'<div class="tw sm"><table>'+rows.map((r,ri)=>'<tr>'+Array.from({length:mc},(_,i)=>`<${ri?'td':'th'}>${esc(r[i]==null?'':r[i])}</${ri?'td':'th'}>`).join('')+'</tr>').join('')+'</table></div>';
const csvNote=async f=>{const t=(await f.text()).replace(/^\uFEFF/,''),rows=[];let r=[],c='',q=0;const end=()=>{r.push(c);c='';if(r.some(x=>x!==''))rows.push(r);r=[]};
 for(let i=0;i<t.length&&rows.length<2000;i++){const ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=0}else c+=ch}else if(ch==='"')q=1;else if(ch===','||ch===';'||ch==='\t'){r.push(c);c=''}else if(ch==='\n'){end()}else if(ch!=='\r')c+=ch}
 if(c!==''||r.length)end();if(!rows.length)throw new Error('empty');return[{title:baseName(f),secs:[{t:'Sheet',h:tblHtml(rows,Math.min(60,Math.max(...rows.map(x=>x.length))))}]}]};
const imgNote=async f=>{const url=URL.createObjectURL(f);try{const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('img'));i.src=url}),M=1400,k=Math.min(1,M/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.max(1,Math.round(im.naturalWidth*k)),h=Math.max(1,Math.round(im.naturalHeight*k)),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);return[{title:baseName(f),secs:[{t:'Image',h:'',img:c.toDataURL('image/jpeg',.78)}]}]}finally{URL.revokeObjectURL(url)}};
const IMGX=/^(png|jpe?g|gif|webp|bmp|svg|avif)$/;
const importDocs=async files=>{let added=[],bad=[];toast('Importing\u2026');
 for(const f of files){try{if(f.size>25e6)throw new Error('big');const ext=(f.name.split('.').pop()||'').toLowerCase();let ns;
   if(ext==='docx')ns=await docxNote(f);else if(ext==='pdf')ns=await pdfNote(f);else if(ext==='xlsx'||ext==='xlsm')ns=await xlsxNote(f);else if(ext==='csv')ns=await csvNote(f);else if(IMGX.test(ext)||/^image\//.test(f.type))ns=await imgNote(f);else throw new Error('type');
   ns.forEach(x=>{const n=cleanNote({title:x.title,sum:'Imported from '+f.name,ico:ext==='pdf'?'\uD83D\uDCC4':/^(xlsx|xlsm|csv)$/.test(ext)?'\uD83D\uDCCA':IMGX.test(ext)?'\uD83D\uDDBC\uFE0F':'\uD83D\uDCDD',secs:x.secs});if(n){n.id=uid();n.ts=Date.now();ST.my.push(n);added.push(n)}})}
  catch(e){bad.push(f.name+(e&&e.message==='empty'?(/\.pdf$/i.test(f.name)?' (this PDF has no selectable text, it may be a scan)':' (nothing to import)'):e&&e.message==='type'?' (use a PDF, Word, Excel or image file)':e&&e.message==='img'?' (this image could not be read)':''))}}
 if(added.length){try{save()}catch(e){ST.my=ST.my.filter(m=>!added.includes(m));bad.push('Not enough storage space on this device for '+added.length+' item'+(added.length===1?'':'s')+'. Try smaller files.');added=[]}}
 if(added.length){U.sub='notes';U.edit=null;U.nid=added.length===1?added[0].id:null;U.cat='';U.from=0;U.bk=1;go();toast(`Added ${added.length} note${added.length===1?'':'s'} to your own notes.`)}
 if(bad.length)alert('Could not import: '+bad.join('; '))};
/* ---- PDF export: one layout, drawn as real text (Latin) or as page images (Tamil and other scripts) ---- */
const HWR=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const HWB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
const WINM={0x2013:[0x96,556],0x2014:[0x97,1000],0x2018:[0x91,222],0x2019:[0x92,222],0x201A:[0x82,222],0x201C:[0x93,333],0x201D:[0x94,333],0x201E:[0x84,333],0x2022:[0x95,350],0x2026:[0x85,1000],0x20AC:[0x80,556],0x2122:[0x99,1000],0x2020:[0x86,556],0x2021:[0x87,556],0x2030:[0x89,1000],0x2039:[0x8B,333],0x203A:[0x9B,333],0x0152:[0x8C,1000],0x0153:[0x9C,944],0x0160:[0x8A,667],0x0161:[0x9A,500],0x017D:[0x8E,611],0x017E:[0x9E,500],0x0178:[0x9F,667],0x0192:[0x83,556],0x02C6:[0x88,333],0x02DC:[0x98,333]};
const EMO=/[\p{Extended_Pictographic}\uFE0F\u200D\u20E3]/gu;
const pdfCode=c=>{if(c===0xA0)return[32,278];if(c>=32&&c<=126)return[c,-1];if(c>=0xA1&&c<=0xFF)return[c,556];return WINM[c]||null};
const pdfWidth=(s,sz,b)=>{let w=0;for(const ch of s){const c=ch.codePointAt(0),m=pdfCode(c);w+=(m?(m[1]<0?(b?HWB:HWR)[c-32]:m[1]):556)}return w*sz/1000};
const pdfNeedsImg=t=>{for(const ch of t.replace(EMO,'')){const c=ch.codePointAt(0);if(c===10||c===9)continue;if(!pdfCode(c))return true}return false};
const htmlBlocks=h=>{const d=document.createElement('div');d.innerHTML=String(h||'').replace(/<figure[\s\S]*?<\/figure>/g,'').replace(/<svg[\s\S]*?<\/svg>/g,'');const out=[];let t='';
 const flush=k=>{const s=t.replace(/[^\S\n]+/g,' ').replace(/ ?\n ?/g,'\n').replace(/^\s+|\s+$/g,'').replace(/ \|$/,'');if(s)out.push({k:k||'p',t:s});t=''};
 const walk=n=>n.childNodes.forEach(c=>{if(c.nodeType===3)t+=c.data;else if(c.nodeType===1){const g=c.tagName.toLowerCase();
  if(g==='br')t+='\n';else if(/^h[1-6]$/.test(g)){flush();walk(c);flush('h')}else if(g==='li'){flush();walk(c);flush('li')}
  else if(g==='td'||g==='th'){walk(c);t+=' | '}else if(/^(p|div|ul|ol|blockquote|table|tr|section|article|thead|tbody)$/.test(g)){flush();walk(c);flush()}else walk(c)}});
 walk(d);flush();return out};
const noteBlocks=n=>{const b=[{k:'title',t:((n.ico?n.ico+' ':'')+n.title).trim()}];if(n.sum)b.push({k:'sum',t:n.sum});n.secs.forEach(s=>{b.push({k:'sec',t:s.t||'Notes'});htmlBlocks(noteBody(s)).forEach(x=>b.push(x));if(s.img)b.push({k:'img',d:s.img})});return b};
const PW=595.28,PH=841.89,PM=56,STY={title:[22,1,[.06,.08,.2]],sum:[11,0,[.4,.4,.4]],sec:[16,1,[.54,.42,.16]],h:[12.5,1,[0,0,0]],p:[10.5,0,[0,0,0]],li:[10.5,0,[0,0,0]]};
const dataBytes=d=>{const b=atob(d.split(',')[1]||''),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
const jpegSize=u=>{let i=2;while(i<u.length-9){if(u[i]!==255){i++;continue}const m=u[i+1];if(m>=0xC0&&m<=0xCF&&m!==0xC4&&m!==0xC8&&m!==0xCC)return[(u[i+7]<<8)|u[i+8],(u[i+5]<<8)|u[i+6]];i+=2+((u[i+2]<<8)|u[i+3])}return[1,1]};
const layoutNote=(blocks,meas,strip)=>{const pages=[[]],imgs=[];let y=PM,pg=pages[0];const bot=PH-PM,tw=PW-2*PM;
 const np=()=>{pg=[];pages.push(pg);y=PM};
 blocks.forEach((b,bi)=>{if(b.k==='img'){const u=dataBytes(b.d),[iw,ih]=jpegSize(u);let w=Math.min(tw,iw*.75),h=w*ih/iw;if(h>bot-PM){h=bot-PM;w=h*iw/ih}if(y+h>bot)np();imgs.push({u,w:iw,h:ih});pg.push({img:imgs.length-1,x:PM,y,w,h});y+=h+10;return}
  const [sz,bd,col]=STY[b.k]||STY.p,lh=sz*1.4,ind=b.k==='li'?14:0,avail=tw-ind,txt=strip?b.t.replace(EMO,'').replace(/\s+$/,''):b.t,lines=[];
  txt.split('\n').forEach(par=>{const words=par.split(' ');let cur='';const fit=s=>meas(s,sz,bd)<=avail;words.forEach(w=>{if(!w)return;const t=cur?cur+' '+w:w;if(fit(t))cur=t;else{if(cur)lines.push(cur);cur=w;while(!fit(cur)&&cur.length>1){let k=cur.length-1;while(k>1&&!fit(cur.slice(0,k)))k--;lines.push(cur.slice(0,k));cur=cur.slice(k)}}});lines.push(cur)});
  const before=b.k==='sec'?14:b.k==='h'?8:b.k==='title'?0:b.k==='sum'?0:3,after=b.k==='title'?6:b.k==='sec'?4:4,need=before+lh*((b.k==='sec'||b.k==='h')?3:Math.min(2,lines.length));
  if(y>PM&&y+need>bot)np();else if(y>PM)y+=before;
  lines.forEach((ln,li)=>{if(y+lh>bot)np();pg.push({s:ln,bul:b.k==='li'&&li===0,x:PM+ind,y:y+sz*.9,sz,bd,col});y+=lh});y+=after});
 return{pages,imgs}};
const pdfAssemble=(pages,imgs)=>{const chunks=[],xr=[];let off=0;const push=b=>{if(typeof b==='string'){const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i)&255;b=u}chunks.push(b);off+=b.length};
 const nI=imgs.length,pb=5+nI,fmt=n=>(+n).toFixed(2),esc2=s=>{let o='';for(const ch of s){const m=pdfCode(ch.codePointAt(0));if(!m)continue;const c=m[0];o+=c===40||c===41||c===92?'\\'+String.fromCharCode(c):String.fromCharCode(c)}return o};
 push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
 const obj=(n,s)=>{xr[n]=off;push(n+' 0 obj\n'+s+'\nendobj\n')};
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_,i)=>(pb+2*i)+' 0 R').join(' ')}] >>`);
 obj(3,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');obj(4,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 imgs.forEach((im,i)=>{xr[5+i]=off;push(`${5+i} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.u.length} >>\nstream\n`);push(im.u);push('\nendstream\nendobj\n')});
 const res=`<< /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ${imgs.map((_,i)=>`/Im${i} ${5+i} 0 R`).join(' ')} >> >>`;
 pages.forEach((p,i)=>{let c='';p.forEach(it=>{if(it.img!=null)c+=`q ${fmt(it.w)} 0 0 ${fmt(it.h)} ${fmt(it.x)} ${fmt(PH-it.y-it.h)} cm /Im${it.img} Do Q\n`;else{c+=`BT /F${it.bd?2:1} ${it.sz} Tf ${it.col.join(' ')} rg ${fmt(it.x)} ${fmt(PH-it.y)} Td (${esc2(it.s)}) Tj ET\n`;if(it.bul)c+=`BT /F1 ${it.sz} Tf 0 0 0 rg ${fmt(it.x-12)} ${fmt(PH-it.y)} Td (\\225) Tj ET\n`}});
  obj(pb+2*i,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(PW)} ${fmt(PH)}] /Resources ${res} /Contents ${pb+2*i+1} 0 R >>`);obj(pb+2*i+1,`<< /Length ${c.length} >>\nstream\n${c}endstream`)});
 const n=pb+2*pages.length,xo=off;push(`xref\n0 ${n}\n0000000000 65535 f \n`);for(let i=1;i<n;i++)push(String(xr[i]).padStart(10,'0')+' 00000 n \n');push(`trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xo}\n%%EOF`);
 return new Blob(chunks,{type:'application/pdf'})};
const pdfCanvas=async n=>{const blocks=noteBlocks(n),cv=document.createElement('canvas'),S2=2;cv.width=Math.round(PW*S2);cv.height=Math.round(PH*S2);const cx=cv.getContext('2d'),FF='"Noto Serif Tamil","Noto Sans Tamil","Nirmala UI",Latha,Arial,Helvetica,sans-serif',fnt=(sz,b)=>`${b?'bold ':''}${sz}px ${FF}`;
 try{await Promise.all([document.fonts.load(fnt(12,0),'\u0B85'),document.fonts.load(fnt(12,1),'\u0B85')])}catch(e){}
 const {pages,imgs}=layoutNote(blocks,(s,sz,b)=>{cx.font=fnt(sz,b);return cx.measureText(s).width},0);
 const pics=await Promise.all(imgs.map(im=>new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src=URL.createObjectURL(new Blob([im.u],{type:'image/jpeg'}))})));
 const out=[],oi=[];
 for(const p of pages){cx.setTransform(S2,0,0,S2,0,0);cx.fillStyle='#fff';cx.fillRect(0,0,PW,PH);cx.textBaseline='alphabetic';
  p.forEach(it=>{if(it.img!=null){if(pics[it.img])cx.drawImage(pics[it.img],it.x,it.y,it.w,it.h)}else{cx.font=fnt(it.sz,it.bd);cx.fillStyle=`rgb(${it.col.map(v=>Math.round(v*255)).join(',')})`;if(it.bul){cx.fillStyle='#000';cx.fillText('\u2022',it.x-12,it.y)}cx.fillStyle=`rgb(${it.col.map(v=>Math.round(v*255)).join(',')})`;cx.fillText(it.s,it.x,it.y)}});
  const u=dataBytes(cv.toDataURL('image/jpeg',.85));oi.push({u,w:cv.width,h:cv.height});out.push([{img:oi.length-1,x:0,y:0,w:PW,h:PH}])}
 pics.forEach(i=>i&&URL.revokeObjectURL(i.src));return pdfAssemble(out,oi)};
const notePdf=async n=>{const blocks=noteBlocks(n);if(blocks.some(b=>b.t&&pdfNeedsImg(b.t)))return pdfCanvas(n);const {pages,imgs}=layoutNote(blocks,pdfWidth,1);return pdfAssemble(pages,imgs)};
const fsName=t=>String(t||'Untitled').replace(EMO,'').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,80)||'Untitled';
const exportZip=async fmt=>{const ns=all();if(!ns.length)return toast('There are no notes to export yet.');toast('Preparing '+ns.length+' notes\u2026');const used={},files=[];
 try{for(const n of ns){const dir=n.mine?'My notes':fsName(n.cat||'Study notes'),base=fsName(n.title),key=(dir+'/'+base).toLowerCase(),k=used[key]=(used[key]||0)+1,nm=`${dir}/${k>1?base+' ('+k+')':base}.${fmt==='pdf'?'pdf':'docx'}`;
   const blob=fmt==='pdf'?await notePdf(n):docxBlob([n]);files.push([nm,new Uint8Array(await blob.arrayBuffer())]);if(files.length%25===0)await new Promise(r=>setTimeout(r))}
  dlBlob(`daylog-notes-${dayStr()}-${fmt==='pdf'?'pdf':'word'}.zip`,zipStore(files,'application/zip'));toast(`${files.length} notes exported as ${fmt==='pdf'?'PDF':'Word'} files in one zip.`)}
 catch(e){toast('Could not create the export.')}};
const fileIn=()=>{let f=document.getElementById('sxi');if(!f){f=document.createElement('input');f.type='file';f.id='sxi';f.accept='.pdf,.docx,.xlsx,.xlsm,.csv,image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv';f.multiple=true;f.hidden=true;document.body.appendChild(f)}return f};
views.study=()=>{const mc=all().filter(x=>x.mine).sort((a,b)=>b.ts-a.ts),n=U.nid&&getN(U.nid);return `<div class="seg main">${[['read','Read Bible'],['tv','Treasured'+(ST.tv.length?' ('+ST.tv.length+')':'')],['cmp','Compare'],['notes','Study notes'],['search','Search']].map(([k,l])=>`<button class="${U.sub===k?'on':''}" data-sx="sub:${k}">${l}</button>`).join('')}</div>${U.sub==='read'&&!U.edit?read():U.sub==='tv'&&!U.edit&&!n?tvList():U.sub==='cmp'&&!U.edit&&!n?compare():U.edit?editor():n?view():U.sub==='search'?srch():lib([...mc,...all().filter(x=>x.orig)],0)}`};
const go=()=>{render();flash()};
document.addEventListener('mousedown',e=>{if(e.target.closest('.tb button,.rtools button'))e.preventDefault()});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.rtools'))U.sel=null});
const selCtx=()=>{if(tab!=='study')return null;if(U.sub==='read'&&(ST.ver==='KJV'||ST.ver==='TAM'))return{id:`${ST.ver}:${ST.bk}:${ST.ch}`,els:[...document.querySelectorAll('.scr')]};if(U.sub==='read'&&ST.ver==='NLT')return{id:`NLT:${ST.bk}:${ST.ch}`,els:[...document.querySelectorAll('.scr.nlt')]};if(U.nid&&!U.edit)return{id:U.nid,els:[...document.querySelectorAll('.nb section[id^="sxs"]')]};return null};
document.addEventListener('click',e=>{const v=e.target.closest&&e.target.closest('.scr.nlt .vn');if(!v||tab!=='study'||U.sub!=='read'||ST.ver!=='NLT'||hasSel())return;const sc=v.closest('.scr.nlt'),ve=v.closest('verse_export'),r=document.createRange();
 if(ve)r.selectNodeContents(ve);else{r.setStartBefore(v);const all=[...sc.querySelectorAll('.vn')],nx=all[all.indexOf(v)+1];nx?r.setEndBefore(nx):r.setEnd(sc,sc.childNodes.length)}
 const pre=document.createRange();pre.selectNodeContents(sc);pre.setEnd(r.startContainer,r.startOffset);const a=pre.toString().length,b=a+r.toString().length;if(b<=a)return;
 if(ST.tool==='r'){xrOpen(nltNum(v));return}
 if(ST.tool==='n'){vnOpen(nltNum(v));return}
 if(ST.tool==='t'){tvTapNlt(v,sc);return}
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
 else if(a==='vs'){if(hasSel()||(!e.target.closest('sup')&&ST.tool!=='t'&&ST.tool!=='n'&&ST.tool!=='r'))return;const k=`${ST.bk}:${ST.ch}:${x}`;if(ST.tool==='r'){xrOpen(+x);return}if(ST.tool==='n'){vnOpen(+x);return}if(ST.tool==='t')tvTap(+x);else if(ST.tool==='x')delete ST.hl[k];else{const f=tog(ST.hl[k],ST.tool);if(f)ST.hl[k]=f;else delete ST.hl[k]}}
 else if(a==='tool'){ST.tool=x;if(x==='t'){if(tvSelSave()){U.sel=null;const g=getSelection();g&&g.removeAllRanges&&g.removeAllRanges()}else toast('Tap a verse to treasure it, or select text across verses first.')}if(x==='n')toast('Tap a verse to add or edit its note. Verses with a note show a \u270E marker.');if(x==='r')toast('Tap a verse to see related verses.');const cx=x==='t'||x==='n'||x==='r'?null:selCtx();if(cx&&U.sel&&U.sel.length&&U.selId===cx.id){markSel(cx.id,x);U.sel=null;const g=getSelection();g&&g.removeAllRanges&&g.removeAllRanges()}}
 else if(a==='mark'){rcs(ST.bk,ST.ch-1,1);U.msg=`${esc(ref())} marked as read.`}
 else if(a==='note'){U.sub='notes';U.nid=null;U.edit={...blank('Notes on '+ref()),sum:'Reading notes',secs:[{t:ref(),h:'<p><br></p>'}]};top=1}
 else if(a==='open'){U.nid=x;top=1}else if(a==='back'){U.nid=null;if(U.from){U.sub='search';U.from=0}top=1}
 else if(a==='ndocx'){const n=getN(U.nid);if(!n)return;dlBlob(`${slug(n.title)}.docx`,docxBlob([n]));return toast('Word file saved to your downloads.')}
 else if(a==='npdf'){const n=getN(U.nid);if(!n)return;printNotes([n]);return toast('Choose Save as PDF in the print window.')}
 else if(a==='expzip'){exportZip(x);return}
 else if(a==='impick'){U.imode=x;U.bk=1;const f=fileIn();f.value='';f.multiple=true;f.click();return}
 else if(a==='shr'){const n=getN(U.nid);if(!n)return;const text=noteMd(n);if(navigator.share)navigator.share({title:n.title,text}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>toast('Note copied. Paste it into a message or email.'),()=>dl(slug(n.title)+'.md',text,'text/markdown'));else dl(slug(n.title)+'.md',text,'text/markdown');return}
 else if(a==='gsc'){U.gsc=x;SQ.n=80}else if(a==='gl'){U.gl=x;SQ.n=80}else if(a==='gt'){U.gt=x;SQ.n=80}else if(a==='gmore')SQ.n+=80
 else if(a==='cmver'){const f=ST.cmp.on;if(f[x])delete f[x];else f[x]=1}
 else if(a==='cmall'){ST.cmp.on={};if(x==='1')CMV.forEach(([k])=>{ST.cmp.on[k]=1})}
 else if(a==='cmdef'){ST.cmp.on={...CMDEF}}
 else if(a==='esvsave'){const k=(($('#esvk')||{}).value||'').trim();if(!k)return toast('Paste your ESV API key first.');try{localStorage.setItem(ESVK,k)}catch(e){return toast('Could not store the key on this device.')}Object.keys(EC).forEach(q=>delete EC[q]);ST.cmp.on.ESV=1}
 else if(a==='absave'){const k=(($('#abk')||{}).value||'').trim();if(!k)return toast('Paste your API.Bible key first.');try{localStorage.setItem(ABK,k)}catch(e){return toast('Could not store the key on this device.')}AB_.list=undefined;Object.keys(AC).forEach(q=>delete AC[q])}
 else if(a==='abclear'){try{localStorage.removeItem(ABK)}catch(e){}AB_.list=undefined;Object.keys(AC).forEach(q=>delete AC[q])}
 else if(a==='esvclear'){try{localStorage.removeItem(ESVK)}catch(e){}Object.keys(EC).forEach(q=>delete EC[q])}
 else if(a==='cmstep'){const C=ST.cmp,d=+x;let v=(d>0?C.e:C.v)+d,b=C.b,c=C.c;if(v<1){if(c>1){c--;v=cvc(b,c)}else if(b>0){b--;c=BIB[b][1];v=cvc(b,c)}else v=1}else if(v>cvc(b,c)){if(c<BIB[b][1]){c++;v=1}else if(b<BIB.length-1){b++;c=1;v=1}else v=cvc(b,c)}C.b=b;C.c=c;C.v=C.e=v}
 else if(a==='cmcopy'){const t=U.cmpTxt&&U.cmpTxt[x];if(t&&navigator.clipboard)navigator.clipboard.writeText(t).then(()=>toast('Copied.'),()=>toast('Could not copy.'));return}
 else if(a==='cmpgo'){ST.cmp.b=ST.bk;ST.cmp.c=ST.ch;ST.cmp.v=ST.cmp.e=1;U.sub='cmp';U.nid=null;U.edit=null;top=1}
 else if(a==='bkx'){U.bkx=U.bkx&&U.bkx.bk===ST.bk&&U.bkx.k===x?null:{bk:ST.bk,k:x};U.bkm=0;U.bkall=0}
 else if(a==='bkm'){U.bkm=+x}
 else if(a==='bkall'){U.bkall=!U.bkall}
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
  const old=E.id&&getN(E.id);if(old){remap(E.id,old,secs);secs.forEach(s=>{const q=s.oi!=null&&old.secs[s.oi];if(q&&q.img)s.img=q.img})}
  const n={title:E.title.trim()||'Untitled',sum:E.sum.trim(),ico:E.ico||'📝',secs:secs.map(({oi,...r})=>r)};if(E.orig)ST.ov[E.id]=n;else{n.id=E.id||uid();n.ts=Date.now();ST.my=ST.my.filter(m=>m.id!==n.id);ST.my.push(n);E.id=n.id}
  U.nid=E.id;U.edit=null;top=1}
 else if(a==='edel'){const n=getN(U.nid);if(!n)return;if(!confirm(n.mine?'Delete this note permanently?':'Delete this study note? You can restore it from the Study notes list.'))return;
  if(n.mine)ST.my=ST.my.filter(m=>m.id!==U.nid);else{ST.del[U.nid]=1;delete ST.ov[U.nid]}delete ST.an[U.nid];U.nid=null;top=1}
 else if(a==='restore'){delete ST.del[x];U.dopen=1}else if(a==='restoreall'){ST.del={}}
 else if(a==='ereset'){if(!confirm('Discard your edits and restore the original note?'))return;const cur=getN(U.nid),o0=window.NOTES.find(z=>z.id===U.nid);if(cur&&o0)remap(U.nid,cur,o0.secs.map((z,i)=>({...z,oi:i})));delete ST.ov[U.nid];top=1}
 else if(a==='xrrel'){const e=tvBy(x);if(e)xrOpen(e.v,e.b,e.c);return}
 else if(a==='vnote'){vnOpen(+x);return}
 else if(a==='tvsort'){U.tvs=x}
 else if(a==='tvgo'){const e=tvBy(x);if(!e)return;ST.bk=e.b;ST.ch=e.c;ST.ver=e.ver;U.sub='read';U.nid=null;U.edit=null;U.flash=e.ver==='NLT'?0:e.v;top=1}
 else if(a==='tvcp'){const e=tvBy(x);if(e)copyTxt(tvLine(e));return}
 else if(a==='tvcpall'){if(ST.tv.length)copyTxt(tvSorted().map(tvLine).join('\n\n'));return}
 else if(a==='tvimg'){const e=tvBy(x);if(e)tvSheet(e);return}
 else if(a==='tvdel'){const e=tvBy(x);if(!e)return;if(!confirm('Remove '+tvRef(e)+' from Treasured verses?'))return;tvDrop(e);toast('Removed from Treasured verses.')}
 else return;
 save();go();if(top)scrollTo({top:0})});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='sxi'){const fl=[...(t.files||[])];if(fl.length)importDocs(fl);t.value='';return}if(/^cm[bcve]$/.test(t.id)){const C=ST.cmp;if(t.id==='cmb'){C.b=+t.value;C.c=1;C.v=C.e=1}else if(t.id==='cmc'){C.c=+t.value;C.v=C.e=1}else if(t.id==='cmv'){C.v=+t.value;if(C.e<C.v)C.e=C.v}else C.e=Math.max(+t.value,C.v);save();go();return}if(t.id==='sxb'){ST.bk=+t.value;ST.ch=1;save();go()}else if(t.id==='sxc'){ST.ch=+t.value;save();go()}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='nlpw'){e.preventDefault();nkUnlock()}});
document.addEventListener('input',e=>{if(e.target.id==='tvq'){U.tvq=e.target.value;const q=U.tvq.trim().toLowerCase();let n=0;document.querySelectorAll('.tvc').forEach(c=>{const m=!q||c.dataset.tq.includes(q);c.hidden=!m;if(m)n++});const z=document.querySelector('.tvnone');if(z)z.hidden=n>0;return}if(e.target.id==='sxg'){U.gq=e.target.value;SQ.n=80;clearTimeout(SQ.t);SQ.t=setTimeout(()=>{const r=document.getElementById('sxr');if(r)r.innerHTML=srRes()},220);return}if(e.target.id!=='sxq')return;U.tq=e.target.value;const q=U.tq.toLowerCase();document.querySelectorAll('.nc[data-nid]').forEach(b=>{const n=getN(b.dataset.nid);b.hidden=!!n&&!vis(n,q)})});
})();