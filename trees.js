/* Family trees (Study tab > Family trees): interactive genealogies.
   First tree: Ezra back to Aaron (Ezra 7:1-5), with the names Ezra 7 leaves out (1 Chronicles 6) and Aaron's wider family as options.
   Every link is a verse you can open. Name meanings and "more about" sheets come from names.js (Tyndale TIPNR data, CC BY 4.0).
   To add a tree: add an entry to TREES below (nodes run from oldest to newest). Needs app.js (S, BIB, render, save, tab, esc) and names.js (NM). */
(()=>{
const NM=window.NM;
const V=(b,c,v)=>[b,c,v];
const Ex=1,Lv=2,Nu=3,K1=10,K2=11,Ch1=12,Ezr=14,S2=9;
// node: id, n (name), i (index in names.json, checked at run time), at (verse that names him in this tree), src (verses to open),
// t: m = main line (Ezra 7), s = named in 1 Chronicles 6 but left out of Ezra 7, w = wider family (option), sub, note, side = other children shown beside him (wider family option)
const TREES=[{
 id:'ezra',title:'Ezra’s line back to Aaron',ref:'Ezra 7:1–5',
 intro:'Ezra 7 gives Ezra’s pedigree to show he was a true priest of Aaron’s house. Each name is “the son of” the next one up the list.',
 first:'aaron',last:'ezra',
 nodes:[
 {id:'levi',n:'Levi',i:1795,t:'w',at:V(Ex,6,16),src:[V(Ch1,6,1),V(Ex,6,16)],sub:'Ancestor of the priests and Levites',note:'Son of Jacob. His sons were Gershon, Kohath and Merari (1 Chronicles 6:1). Ezra 7 does not go back this far.'},
 {id:'kohath',n:'Kohath',i:1766,t:'w',at:V(Ex,6,18),src:[V(Ch1,6,2),V(Ex,6,18)],sub:'Son of Levi',note:'His sons were Amram, Izhar, Hebron and Uzziel (1 Chronicles 6:2).'},
 {id:'amram',n:'Amram',i:234,t:'w',at:V(Ex,6,20),src:[V(Ex,6,20),V(Ch1,6,3)],sub:'Father of Aaron, Moses and Miriam',note:'He married Jochebed, his father’s sister (Exodus 6:20). Their children were Aaron, Moses and Miriam (1 Chronicles 6:3).'},
 {id:'aaron',n:'Aaron',i:0,t:'m',at:V(Ezr,7,5),src:[V(Ezr,7,5),V(Ex,28,1)],sub:'The first high priest',note:'God set Aaron and his sons apart for the priest’s office (Exodus 28:1). Ezra 7:5 calls him “the chief priest”. When Aaron died on the mountain, his garments were put on Eleazar (Numbers 20:28).',
  side:{label:'Aaron’s brother and sister (1 Chronicles 6:3)',items:[{n:'Moses',i:2089,at:V(Ch1,6,3),note:'Led Israel out of Egypt.'},{n:'Miriam',i:2069,at:V(Ch1,6,3),note:'Sister of Moses and Aaron.'}]}},
 {id:'eleazar',n:'Eleazar',i:720,t:'m',at:V(Ezr,7,5),src:[V(Ezr,7,5),V(Nu,20,28)],sub:'High priest after Aaron',note:'His older brothers Nadab and Abihu died without children, so Eleazar and Ithamar served as priests (Numbers 3:4). Eleazar received Aaron’s garments when Aaron died (Numbers 20:28).',
  side:{label:'Eleazar’s brothers (Exodus 6:23)',items:[{n:'Nadab',i:2110,at:V(Ex,6,23),note:'Firstborn son of Aaron. He and Abihu died before the LORD for offering strange fire, and had no children (Leviticus 10:1–2; Numbers 3:4).',gone:1},{n:'Abihu',i:29,at:V(Ex,6,23),note:'Died with Nadab for offering strange fire (Leviticus 10:1–2). He had no children (Numbers 3:4).',gone:1},{n:'Ithamar',i:1309,at:V(Ex,6,23),note:'Served as a priest with Eleazar (Numbers 3:4).'}]}},
 {id:'phinehas',n:'Phinehas',i:2343,t:'m',at:V(Ezr,7,5),src:[V(Ezr,7,5),V(Nu,25,11)],sub:'Zealous for God',note:'God said of him, “I give unto him my covenant of peace”, and promised him and his seed “an everlasting priesthood” (Numbers 25:12–13).'},
 {id:'abishua',n:'Abishua',i:49,t:'m',at:V(Ezr,7,5),src:[V(Ezr,7,5),V(Ch1,6,4)],sub:'Son of Phinehas',note:'Little is recorded about him beyond the list (1 Chronicles 6:4).'},
 {id:'bukki',n:'Bukki',i:569,t:'m',at:V(Ezr,7,4),src:[V(Ezr,7,4),V(Ch1,6,5)],sub:'Son of Abishua',note:'Little is recorded about him beyond the list (1 Chronicles 6:5).'},
 {id:'uzzi',n:'Uzzi',i:2877,t:'m',at:V(Ezr,7,4),src:[V(Ezr,7,4),V(Ch1,6,5)],sub:'Son of Bukki',note:'Little is recorded about him beyond the list (1 Chronicles 6:5).'},
 {id:'zerahiah',n:'Zerahiah',i:3007,t:'m',at:V(Ezr,7,4),src:[V(Ezr,7,4),V(Ch1,6,6)],sub:'Son of Uzzi',note:'Little is recorded about him beyond the list (1 Chronicles 6:6).'},
 {id:'meraioth',n:'Meraioth',i:1981,t:'m',at:V(Ezr,7,3),src:[V(Ezr,7,3),V(Ch1,6,6)],sub:'Son of Zerahiah',note:'Ezra 7:3 and 1 Chronicles 6:6–7 both name him. This is where the two lists begin to differ.'},
 // names that 1 Chronicles 6:7-10 puts between Meraioth and the Azariah of Ezra 7:3
 {id:'amariah1',n:'Amariah',i:191,t:'s',at:V(Ch1,6,7),src:[V(Ch1,6,7)],sub:'In 1 Chronicles 6, not in Ezra 7',note:'1 Chronicles 6:7 says “Meraioth begat Amariah”.'},
 {id:'ahitub1',n:'Ahitub',i:162,t:'s',at:V(Ch1,6,7),src:[V(Ch1,6,7),V(Ch1,6,8)],sub:'In 1 Chronicles 6, not in Ezra 7',note:'Named in 1 Chronicles 6:7–8. The name Ahitub comes round again two generations later.'},
 {id:'zadok1',n:'Zadok',i:2927,t:'s',at:V(Ch1,6,8),src:[V(Ch1,6,8),V(K1,2,35)],sub:'In 1 Chronicles 6, not in Ezra 7',note:'In the Tyndale name data this is the Zadok who served David and Solomon (1 Kings 2:35). Zadok comes round again two generations later, which is one reason the two lists are easy to line up differently.'},
 {id:'ahimaaz',n:'Ahimaaz',i:141,t:'s',at:V(Ch1,6,8),src:[V(Ch1,6,8),V(S2,18,19)],sub:'In 1 Chronicles 6, not in Ezra 7',note:'Zadok’s son, who ran with news for David (2 Samuel 18:19).'},
 {id:'azariah2',n:'Azariah',i:366,t:'s',at:V(Ch1,6,9),src:[V(Ch1,6,9)],sub:'In 1 Chronicles 6, not in Ezra 7',note:'1 Chronicles 6:9 says “Ahimaaz begat Azariah”.'},
 {id:'johanan',n:'Johanan',i:1637,t:'s',at:V(Ch1,6,9),src:[V(Ch1,6,9),V(Ch1,6,10)],sub:'In 1 Chronicles 6, not in Ezra 7',note:'1 Chronicles 6:9–10 names him between two men called Azariah.'},
 {id:'azariah1',n:'Azariah',i:365,t:'m',at:V(Ezr,7,3),src:[V(Ezr,7,3),V(Ch1,6,10)],sub:'Son of Meraioth in Ezra 7:3',note:'1 Chronicles 6:10 adds a note beside an Azariah in this part of the list: he “executed the priest’s office in the temple that Solomon built in Jerusalem”.'},
 {id:'amariah2',n:'Amariah',i:190,t:'m',at:V(Ezr,7,3),src:[V(Ezr,7,3),V(Ch1,6,11)],sub:'Son of Azariah',note:'Named in Ezra 7:3 and 1 Chronicles 6:11.'},
 {id:'ahitub2',n:'Ahitub',i:160,t:'m',at:V(Ezr,7,2),src:[V(Ezr,7,2),V(Ch1,6,11)],sub:'Son of Amariah',note:'Named in Ezra 7:2 and 1 Chronicles 6:11.'},
 {id:'zadok2',n:'Zadok',i:2925,t:'m',at:V(Ezr,7,2),src:[V(Ezr,7,2),V(Ch1,6,12)],sub:'Son of Ahitub',note:'A later Zadok. He is not the Zadok of David’s and Solomon’s time in the Tyndale name data.'},
 {id:'shallum',n:'Shallum',i:2502,t:'m',at:V(Ezr,7,2),src:[V(Ezr,7,2),V(Ch1,6,12)],sub:'Son of Zadok',note:'Father of Hilkiah (1 Chronicles 6:12–13).'},
 {id:'hilkiah',n:'Hilkiah',i:1174,t:'m',at:V(Ezr,7,1),src:[V(Ezr,7,1),V(K2,22,8)],sub:'Probably the high priest who found the law',note:'The Hilkiah in this line is usually taken to be the high priest who said, “I have found the book of the law in the house of the LORD” (2 Kings 22:8).'},
 {id:'azariah3',n:'Azariah',i:364,t:'m',at:V(Ezr,7,1),src:[V(Ezr,7,1),V(Ch1,6,13)],sub:'Son of Hilkiah',note:'Named in Ezra 7:1 and 1 Chronicles 6:13–14.'},
 {id:'seraiah',n:'Seraiah',i:2481,t:'m',at:V(Ezr,7,1),src:[V(Ezr,7,1),V(K2,25,18)],sub:'The last high priest before the exile',note:'The Babylonians took Seraiah “the chief priest” to Riblah and killed him (2 Kings 25:18–21). That was well over a century before Ezra went up, so “son of” in Ezra 7:1 has to mean “descendant of”.',
  side:{label:'Also Seraiah’s son (1 Chronicles 6:14–15)',items:[{n:'Jehozadak',i:1474,at:V(Ch1,6,14),note:'Went into captivity when the LORD carried away Judah and Jerusalem (1 Chronicles 6:15). His son Jeshua, spelled “Jozadak” in Ezra 3:2, was the high priest who returned with Zerubbabel.'}]}},
 {id:'ezra',n:'Ezra',i:899,t:'m',at:V(Ezr,7,1),src:[V(Ezr,7,1),V(Ezr,7,6),V(Ezr,7,10)],sub:'Priest and scribe',note:'“Ezra had prepared his heart to seek the law of the LORD, and to do it, and to teach in Israel statutes and judgments” (Ezra 7:10).'}
 ],
 gapAfter:'meraioth'
}];

// ---------- state ----------
const T=()=>{const st=S.st||(S.st={});const t=st.tr&&typeof st.tr==='object'?st.tr:(st.tr={});if(typeof t.skip!=='number')t.skip=0;if(typeof t.wide!=='number')t.wide=0;if(typeof t.flip!=='number')t.flip=0;if(typeof t.sel!=='string')t.sel='';return t};
const tree=()=>TREES[0];
const ref=(r)=>`${BIB[r[0]][0]} ${r[1]}:${r[2]}`;
const vkey=r=>r[0]*1e6+r[1]*1e3+r[2];
let KJV=null,kjLoading=0,copied=0;
const loadKJV=()=>{if(KJV||kjLoading)return;kjLoading=1;fetch('kjv.json').then(r=>r.json()).then(j=>{KJV=j;kjLoading=0;redraw()}).catch(()=>{kjLoading=0})};
const verse=r=>{if(NM.cfg&&NM.cfg.text){const t=NM.cfg.text(r[0],r[1],r[2]);if(t!=null)return t}return KJV&&KJV[r[0]]&&KJV[r[0]].chapters[r[1]-1]?KJV[r[0]].chapters[r[1]-1][r[2]-1]:null};
const redraw=()=>{if(document.querySelector('.tr')&&typeof render==='function')render()};
// the names.json entry for a person: the stored index when it still names him, otherwise the best match by name
const entry=n=>{if(!NM||!NM.ready||!NM.ready())return null;let e=NM.names(n.i);if(e&&e.n===n.n)return{i:n.i,e};const j=NM.idx(n.n);return j==null?null:{i:j,e:NM.names(j)}};

// ---------- which rows are shown ----------
const rows=()=>{const t=T(),tr=tree();let a=tr.nodes.filter(n=>n.t==='m'||(n.t==='s'&&t.skip)||(n.t==='w'&&t.wide));if(t.flip)a=a.slice().reverse();return a};
const skipCount=()=>tree().nodes.filter(n=>n.t==='s').length;

// ---------- drawing ----------
const gapPill=(t,up)=>{const k=skipCount();return `<li class="trgap" aria-hidden="false"><button class="trgb${t.skip?' on':''}" data-tr="skip" aria-pressed="${t.skip?'true':'false'}">${t.skip?`Hide the ${k} names Ezra 7 leaves out`:`${k} names in 1 Chronicles 6 are not in Ezra 7 — show`}</button></li>`};
const link=(a,b,t)=>{const dash=(a.t==='s'||b.t==='s')?' sk':'';const who=t.flip?`${esc(b.n)} is the father of ${esc(a.n)}`:`${esc(a.n)} is the father of ${esc(b.n)}`;return `<li class="trk${dash}" role="presentation"><span class="trkl" title="${who}"></span></li>`};
const sideHtml=(n,t)=>{if(!n.side||!t.wide)return '';return `<div class="trs"><p class="trsl">${esc(n.side.label)}</p><div class="trsc">${n.side.items.map(s=>`<button class="trsb${s.gone?' gone':''}${t.sel===n.id+'~'+s.n?' on':''}" data-tr="sel:${n.id}~${esc(s.n)}" aria-expanded="${t.sel===n.id+'~'+s.n?'true':'false'}">${esc(s.n)}${s.gone?' †':''}</button>`).join('')}</div>${side(n,t)}</div>`};
const side=(n,t)=>{if(!t.sel.startsWith(n.id+'~'))return '';const nm=t.sel.slice(n.id.length+1),s=n.side.items.find(x=>x.n===nm);if(!s)return '';const en=entry(s);return `<div class="trd side">${detailInner(s,en,[s.at])}</div>`};
const detailInner=(n,en,srcs)=>{
 const e=en&&en.e;const meaning=e&&e.m?`<p class="trm"><b>Name meaning</b> ${esc(e.m)}</p>`:'';
 const brief=e&&(e.br||e.bf)?`<p class="trm"><b>In the name data</b> ${esc(e.br||e.bf)}</p>`:'';
 const first=srcs[0],vt=verse(first);if(vt==null)loadKJV();
 const q=vt!=null?`<blockquote class="trq">${esc(vt.replace(/\s+([,.;:!?])/g,'$1'))}<cite>${esc(ref(first))} (KJV)</cite></blockquote>`:'<div class="skel"></div>';
 return `${n.note?`<p class="trnote">${esc(n.note)}</p>`:''}${q}${meaning}${brief}<div class="trw2"><span class="trlbl">Open in the Bible</span>${srcs.map(r=>`<button class="trref" data-tr="go:${r.join('.')}">${esc(ref(r))}</button>`).join('')}${en?`<button class="trref more" data-tr="nm:${en.i}">More about ${esc(n.n)}</button>`:''}</div>`};
const rowHtml=(n,k,t,total)=>{
 const open=t.sel===n.id,en=open?entry(n):null,tr=tree();
 const cls=['trn',n.t==='s'?'sk':'',n.id===tr.first?'first':'',n.id===tr.last?'last':'',open?'open':''].filter(Boolean).join(' ');
 const ord=t.flip?total-k:k+1;
 const tag=`<span class="trtag${n.t==='s'?' sk':n.t==='w'?' wd':' ez'}">${esc(ref(n.at))}</span>`;
 return `<li class="${cls}"><button class="trb" data-tr="sel:${n.id}" aria-expanded="${open?'true':'false'}"><span class="trg" aria-hidden="true">${ord}</span><span class="trx"><span class="trname">${esc(n.n)}</span><span class="trsub">${esc(n.sub||'')}</span></span>${tag}</button>${open?`<div class="trd">${detailInner(n,en,n.src)}</div>`:''}${sideHtml(n,t)}</li>`};
const pathText=()=>{const a=rows().slice();if(T().flip)a.reverse();return a.map(n=>n.n).join(' → ')};
function view(){
 if(NM&&NM.ready&&!NM.ready()&&!NM.err&&NM.load&&!view.busy){view.busy=1;NM.load(()=>{view.busy=0;redraw()})}
 const t=T(),tr=tree(),a=rows(),m=tr.nodes.filter(n=>n.t==='m').length;
 const shown=a.filter(n=>n.t!=='w').length;
 const body=a.map((n,k)=>{
  let h=rowHtml(n,k,t,a.length);
  const nx=a[k+1];
  if(nx){
   const gap=!t.flip?(n.id===tr.gapAfter):(nx.id===tr.gapAfter);
   if(gap&&!t.skip)h+=`<li class="trk" role="presentation"><span class="trkl"></span></li>`+gapPill(t);
   h+=link(n,nx,t)}
  return h}).join('');
 const flipTxt=t.flip?'Show oldest first':'Show Ezra first';
 return `<div class="tr"><section class="card trh"><div class="row trtop"><div><h2>${esc(tr.title)}</h2><p class="sub">${esc(tr.ref)} · <button class="trlink" data-tr="go:${tr.nodes.find(n=>n.id==='ezra').at.join('.')}">Read it</button></p></div></div>
  <p class="trintro">${esc(tr.intro)}</p>
  <div class="trstat"><span class="chip">${m} names in Ezra 7</span><span class="chip">${m-1} generations</span>${t.skip?`<span class="chip warn">+${skipCount()} from 1 Chronicles 6</span>`:''}${t.wide?'<span class="chip">wider family on</span>':''}</div>
  <div class="trctl" role="group" aria-label="Tree options"><button class="trt${t.skip?' on':''}" data-tr="skip" aria-pressed="${t.skip?'true':'false'}">Names Ezra 7 skips</button><button class="trt${t.wide?' on':''}" data-tr="wide" aria-pressed="${t.wide?'true':'false'}">Aaron’s family</button><button class="trt" data-tr="flip">${flipTxt}</button><button class="trt" data-tr="copy">${copied?'Copied':'Copy the line'}</button></div>
  ${t.skip?`<p class="trhint">Dashed names are in 1 Chronicles 6:7–10 but not in Ezra 7. The two lists can be lined up more than one way. This follows the order Ezra gives and matches it to 1 Chronicles 6, as the Tyndale name data does.</p>`:''}
  <p class="trhint">Tap a name to see its verse. A † marks a son who died without children.</p></section>
  <section class="card trc"><ol class="trl${t.flip?' flip':''}">${body}</ol></section></div>`}

// ---------- events ----------
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-tr]');if(!b||typeof tab==='undefined'||tab!=='study'||!document.querySelector('.tr'))return;
 e.preventDefault();const[a,x]=[b.dataset.tr.split(':')[0],b.dataset.tr.slice(b.dataset.tr.indexOf(':')+1)];const t=T();
 if(a==='sel'){t.sel=t.sel===x?'':x;if(t.sel)loadKJV()}
 else if(a==='skip')t.skip=t.skip?0:1;
 else if(a==='wide'){t.wide=t.wide?0:1;if(!t.wide&&t.sel.includes('~'))t.sel=''}
 else if(a==='flip')t.flip=t.flip?0:1;
 else if(a==='copy'){const s=pathText();const done=()=>{copied=1;redraw();setTimeout(()=>{copied=0;redraw()},1600)};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(s).then(done,()=>{});else done();return}
 else if(a==='go'){const r=x.split('.').map(Number);if(r.length===3&&NM.cfg&&NM.cfg.go){NM.cfg.go(r[0],r[1],r[2])}return}
 else if(a==='nm'){NM.open&&NM.open(+x);return}
 else return;
 save();redraw()});
window.TREES={view};
})();
