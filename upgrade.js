// CaIrN upgrade: reader tools (Aa panel, selection menu, listen, progress, swipe), mobile More menu, search palette.
// Everything here sits on top of app.js and study.js and only uses their existing data (S, S.st, BIB, NM, toast, render).
(()=>{
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const lsGet=k=>{try{return localStorage.getItem(k)}catch{return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
const ST=()=>S.st||{};
const go=(b,c,v)=>{if(window.NM&&NM.cfg&&NM.cfg.go)NM.cfg.go(b,c,v||0)};
const inReader=()=>typeof tab!=='undefined'&&tab==='study'&&!!document.querySelector('.rd .scr');
const clickTab=t=>{const b=document.querySelector(`nav [data-tab="${t}"]`);b&&b.click()};
const clickSx=k=>{const b=document.querySelector(`[data-sx="${k}"]`);b&&b.click();return !!b};

// ---------- Dashboard buttons ----------
document.addEventListener('click',e=>{
 const c=e.target.closest&&e.target.closest('[data-bcont]');if(c){const[b,ch]=c.dataset.bcont.split(':').map(Number);go(b,ch,0);return}
 const v=e.target.closest&&e.target.closest('[data-vopen]');if(v){const[b,ch,vs]=v.dataset.vopen.split(':').map(Number);go(b,ch,vs);return}
});

// ---------- Reading progress bar (top of the screen) ----------
const bar=Object.assign(document.createElement('div'),{id:'rdprog'});document.body.appendChild(bar);
const prog=()=>{const s=document.querySelector('.rd .scr');if(!s){bar.style.width='0';return}const r=s.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight*.55-r.top)/Math.max(1,r.height)));bar.style.width=(p*100)+'%'};
let raf=0;addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;prog();placePop()})},{passive:true});addEventListener('resize',()=>{setRdh();prog()});
const setRdh=()=>{const c=document.querySelector('.rd'),h=c&&c.querySelector('.rdh');if(c&&h)c.style.setProperty('--rdh',h.offsetHeight+'px')};

// ---------- Swipe left/right to change chapter ----------
let sw=null;
document.addEventListener('touchstart',e=>{const t=e.target.closest&&e.target.closest('.rd .scr');if(!t||e.touches.length!==1||e.target.closest('.tw,table,a,button,input,select'))return sw=null;sw={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}},{passive:true});
document.addEventListener('touchend',e=>{if(!sw)return;const t=e.changedTouches[0],dx=t.clientX-sw.x,dy=t.clientY-sw.y,dt=Date.now()-sw.t;sw=null;const g=getSelection();if(g&&!g.isCollapsed)return;
 if(Math.abs(dx)>90&&Math.abs(dy)<50&&dt<600)clickSx('nav:'+(dx<0?1:-1))},{passive:true});

// ---------- Aa reading panel ----------
let aa=null;
const closeAa=()=>{if(aa){aa.remove();aa=null}const b=document.querySelector('[data-up=aa]');b&&b.setAttribute('aria-expanded','false')};
const applyRead=()=>{const st=ST(),c=document.querySelector('.rd');if(!c)return;$$('.rd .scr').forEach(e=>e.style.fontSize=st.fs+'px');c.style.setProperty('--rlh',st.lh||1.85);c.dataset.ff=st.ff||'serif';c.className=c.className.replace(/rt-\w+/,'rt-'+(st.th||'paper'));setRdh()};
const persist=()=>{try{save()}catch{}};
function openAa(btn){
 if(aa)return closeAa();const st=ST(),th=st.th||'paper',lh=st.lh||1.85,ff=st.ff||'serif';
 aa=document.createElement('div');aa.className='aap';aa.setAttribute('role','dialog');aa.setAttribute('aria-label','Reading settings');
 const seg=(k,arr,cur)=>`<div class="sg">${arr.map(([v,l])=>`<button data-aa="${k}:${v}" class="${String(cur)===String(v)?'on':''}">${l}</button>`).join('')}</div>`;
 aa.innerHTML=`<h3>READING COMFORT</h3><div class="ar"><span style="font-size:13px">A</span><input type="range" min="15" max="32" step="1" value="${st.fs||21}" data-aa="fs" aria-label="Text size" style="flex:1"><span style="font-size:22px">A</span></div>
 <div><div class="l">Line spacing</div>${seg('lh',[[1.55,'Tight'],[1.85,'Relaxed'],[2.2,'Airy']],lh)}</div>
 <div><div class="l">Typeface</div>${seg('ff',[['serif','Serif'],['sans','Sans']],ff)}</div>
 <div><div class="l">Theme</div><div class="th">${[['paper','Paper','#FAF8F2'],['sepia','Sepia','#EAD9B6'],['night','Night','#0E1334']].map(([k,l,c])=>`<button data-aa="th:${k}" class="${th===k?'on':''}"><i style="background:${c};border-color:${th===k?'':'#D9D2BF'}"></i>${l}</button>`).join('')}</div></div>`;
 document.body.appendChild(aa);btn.setAttribute('aria-expanded','true');
 const r=btn.getBoundingClientRect(),w=Math.min(300,innerWidth-24);aa.style.top=Math.min(r.bottom+8,innerHeight-aa.offsetHeight-12)+'px';aa.style.left=Math.max(12,Math.min(innerWidth-w-12,r.right-w))+'px';
}
document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.aa==='fs'){ST().fs=+t.value;applyRead()}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.aa==='fs')persist()});
document.addEventListener('click',e=>{
 const u=e.target.closest&&e.target.closest('[data-up]');
 if(u){e.preventDefault();if(u.dataset.up==='aa')openAa(u);else if(u.dataset.up==='listen')L&&L.on?lsStop():lsStart();return}
 const a=e.target.closest&&e.target.closest('[data-aa]');
 if(a&&a.tagName==='BUTTON'){const[k,v]=a.dataset.aa.split(':'),st=ST();if(k==='lh')st.lh=+v;else if(k==='ff')st.ff=v;else if(k==='th')st.th=v;persist();applyRead();$$('[data-aa^="'+k+':"]',aa).forEach(b=>b.classList.toggle('on',b===a));return}
 if(aa&&!e.target.closest('.aap'))closeAa();
 if(pop&&!e.target.closest('.vpop'))hidePop();
});

// ---------- Selection menu: highlight, treasure, note, related, copy, share ----------
let pop=null;
const hidePop=()=>{if(pop){pop.remove();pop=null}};
const selInfo=()=>{const g=getSelection();if(!g||!g.rangeCount||g.isCollapsed)return null;const r=g.getRangeAt(0),n=r.commonAncestorContainer,el=n.nodeType===1?n:n.parentElement,scr=el&&el.closest('.rd .scr');if(!scr)return null;const text=String(g).trim();if(!text)return null;
 const vs=$$('.vs',scr).filter(x=>r.intersectsNode(x)).map(x=>+(/vs:(\d+)/.exec(x.dataset.sx||'')||[])[1]).filter(Boolean);return{r,scr,text,vs}};
const refOf=vs=>{const st=ST(),b=BIB[st.bk][0];if(!vs.length)return`${b} ${st.ch}`;const a=vs[0],z=vs[vs.length-1];return`${b} ${st.ch}:${a}${z>a?'–'+z:''}`};
const clean=t=>t.replace(/(^|\s)\d{1,3}(?=\p{L})/gu,'$1').replace(/\s+/g,' ').trim();
const quote=i=>`“${clean(i.text)}” — ${refOf(i.vs)} (${({KJV:'KJV',NLT:'NLT',TAM:'Tamil'})[ST().ver]||ST().ver})`;
const placePop=()=>{if(!pop)return;const i=selInfo();if(!i)return hidePop();const rc=i.r.getBoundingClientRect();if(rc.bottom<0||rc.top>innerHeight)return hidePop();const coarse=matchMedia('(pointer:coarse)').matches,w=pop.offsetWidth,h=pop.offsetHeight;
 let top=coarse?rc.bottom+16:rc.top-h-10;if(top<8)top=rc.bottom+12;top=Math.min(top,innerHeight-h-8);pop.style.top=top+'px';pop.style.left=Math.max(8,Math.min(innerWidth-w-8,rc.left+rc.width/2-w/2))+'px'};
const ic={t:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',n:'<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',r:'<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',c:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',s:'<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>'};
const COLS=[['h','Holy Spirit','#F6E3A4'],['g','Blessing','#BFE3C8'],['p','Promise','#F6C5D6'],['v','God and Christ','#D5C8F4'],['o','To do','#F7CDA6']];
function showPop(){
 const i=selInfo();if(!i||!inReader()){return hidePop()}hidePop();
 const nlt=ST().ver==='NLT';
 pop=document.createElement('div');pop.className='vpop';pop.setAttribute('role','toolbar');pop.setAttribute('aria-label','Selected text');
 pop.innerHTML=`<div class="cd">${COLS.map(([k,l,c])=>`<button data-vp="c:${k}" aria-label="Highlight: ${l}" title="${l}" style="background:${c}"></button>`).join('')}</div><span class="sp"></span>
 <button data-vp="t" aria-label="Treasure" title="Treasure"><svg viewBox="0 0 24 24">${ic.t}</svg></button>${nlt?'':`<button data-vp="n" aria-label="Add note" title="Add note"><svg viewBox="0 0 24 24">${ic.n}</svg></button><button data-vp="r" aria-label="Related verses" title="Related verses"><svg viewBox="0 0 24 24">${ic.r}</svg></button>`}
 <button data-vp="c" aria-label="Copy" title="Copy"><svg viewBox="0 0 24 24">${ic.c}</svg></button><button data-vp="s" aria-label="Share" title="Share"><svg viewBox="0 0 24 24">${ic.s}</svg></button>`;
 pop._i={text:quote(i),v:i.vs[0]||0};
 pop.addEventListener('mousedown',e=>e.preventDefault());pop.addEventListener('pointerdown',e=>e.stopPropagation()); // study.js clears its remembered selection on any outside pointerdown
 pop.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();const k=b.dataset.vp,d=pop&&pop._i;if(!d)return;
  if(k.startsWith('c:')){hidePop();setTimeout(()=>clickSx('tool:'+k.slice(2)),0);return}
  if(k==='t'){hidePop();setTimeout(()=>clickSx('tool:t'),0);return}
  if(k==='n'||k==='r'){const el=d.v&&document.querySelector(`.scr .vs[data-sx="vs:${d.v}"]`);hidePop();if(!el)return;const g=getSelection();g&&g.removeAllRanges();const prev=ST().tool;ST().tool=k;el.click();ST().tool=prev;return}
  if(k==='c'){hidePop();(navigator.clipboard?navigator.clipboard.writeText(d.text):Promise.reject()).then(()=>toast('Copied to clipboard.')).catch(()=>toast('Could not copy. Select the text and copy it yourself.'));return}
  if(k==='s'){hidePop();if(navigator.share)navigator.share({text:d.text}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(d.text).then(()=>toast('Copied. Paste it where you want to share.')).catch(()=>{});return}});
 document.body.appendChild(pop);placePop();
 if(!lsGet('cairn-seltip')){lsSet('cairn-seltip','1')}
}
let selT=0;document.addEventListener('selectionchange',()=>{clearTimeout(selT);selT=setTimeout(()=>{const i=selInfo();i?showPop():hidePop()},330)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hidePop();closeAa();closeMore()}});

// ---------- Listen to the chapter ----------
let L=null;
const lsKey=()=>`${ST().ver}:${ST().bk}:${ST().ch}`;
const lsEls=()=>$$('.rd .scr .vs');
const lsText=el=>{const c=el.cloneNode(true);$$('sup,.vnm',c).forEach(x=>x.remove());return c.textContent.replace(/\s+/g,' ').trim()};
const lsMark=()=>{$$('.scr .vs.speaking').forEach(x=>x.classList.remove('speaking'));const el=L&&lsEls()[L.i];if(el){el.classList.add('speaking');const r=el.getBoundingClientRect();if(r.top<80||r.bottom>innerHeight-120)el.scrollIntoView({block:'center',behavior:'smooth'})}};
const PL='<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',PA='<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',XX='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>';
function lsUI(){let p=document.getElementById('lsn');if(!L){p&&p.remove();return}
 if(!p){p=document.createElement('div');p.id='lsn';p.className='lsn';p.setAttribute('role','region');p.setAttribute('aria-label','Chapter audio');document.body.appendChild(p);
  p.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!L)return;const k=b.dataset.ls;if(k==='pp'){L.paused?lsPlay():lsPause()}else if(k==='x')lsStop();else if(k==='sp'){const R=[.8,1,1.2,1.5];L.rate=R[(R.indexOf(L.rate)+1)%R.length];if(!L.paused){speechSynthesis.cancel();lsSpeak()}lsUI()}})}
 p.innerHTML=`<button class="pp" data-ls="pp" aria-label="${L.paused?'Play':'Pause'}">${L.paused?PL:PA}</button><div><b style="font-size:13px">${L.paused?'Paused':'Listening'} · verse ${L.i+1}</b><small>${BIB[ST().bk][0]} ${ST().ch}</small></div><button class="sp" data-ls="sp" aria-label="Speed">${L.rate.toFixed(1)}x</button><button data-ls="x" aria-label="Stop listening">${XX}</button>`}
function lsSpeak(){if(!L||!L.on||L.paused)return;const els=lsEls();if(L.i>=els.length)return lsStop();const t=lsText(els[L.i]);if(!t){L.i++;return lsSpeak()}
 const tok=++L.tok,u=new SpeechSynthesisUtterance(t);u.lang=ST().ver==='TAM'?'ta-IN':'en-GB';u.rate=L.rate;
 u.onend=()=>{if(L&&L.tok===tok&&L.on&&!L.paused){L.i++;lsSpeak()}};u.onerror=e=>{if(L&&L.tok===tok&&e.error!=='canceled'&&e.error!=='interrupted'){toast('Audio stopped. This device could not speak that text.');lsStop()}};
 lsMark();lsUI();speechSynthesis.speak(u)}
function lsPlay(){L.paused=false;lsSpeak()}
function lsPause(){L.paused=true;L.tok++;speechSynthesis.cancel();lsUI()}
function lsStop(){if(L){L.on=false;L.tok++}L=null;try{speechSynthesis.cancel()}catch{}lsMark();lsUI();const b=document.querySelector('[data-up=listen]');b&&(b.textContent='Listen')}
function lsStart(){if(!('speechSynthesis' in window))return toast('Listening is not supported in this browser.');
 const els=lsEls();if(!els.length)return toast('Listening works with the KJV and Tamil text. Choose one of them first.');
 if(ST().ver==='TAM'){const v=speechSynthesis.getVoices();if(v.length&&!v.some(x=>/^ta/i.test(x.lang)))toast('No Tamil voice was found on this device, so it may read in another voice.')}
 let i=0;const sel=selInfo();if(sel&&sel.vs.length)i=Math.max(0,sel.vs[0]-1);
 L={on:true,paused:false,i,rate:1,tok:0,key:lsKey()};const b=document.querySelector('[data-up=listen]');b&&(b.textContent='Stop');lsSpeak()}

// ---------- Mobile More menu ----------
let more=null;
const closeMore=()=>{if(more){more.remove();more=null}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-more]');
 if(b){e.preventDefault();if(more)return closeMore();more=document.createElement('div');more.className='moresheet';more.setAttribute('role','dialog');more.setAttribute('aria-label','More');
  more.innerHTML='<div>'+$$('nav button.sec').map(x=>`<button data-go="${x.dataset.tab}">${x.querySelector('svg').outerHTML}<span>${x.textContent.trim()}</span></button>`).join('')+'</div>';
  more.addEventListener('click',ev=>{const g=ev.target.closest('[data-go]');if(g){closeMore();clickTab(g.dataset.go)}else if(ev.target===more)closeMore()});document.body.appendChild(more);return}
});

// ---------- Search and jump palette (Ctrl or Cmd + K) ----------
const ALIAS={jn:42,mt:39,mk:40,lk:41,ps:18,pss:18};
const TABS=[['Dashboard','today'],['Bible reading plan','bible'],['Study','study'],['Wallet','wallet'],['Bills','subs'],['Monthly review','review'],['Calendar','calendar'],['Settings','settings']];
const SUBS=[['Read the Bible','read'],['Treasured verses','tv'],['Compare versions','cmp'],['Background pages','bg'],['Study notes','notes'],['Search the Bible','search'],['Timeline','tl']];
const toStudy=sub=>{if(typeof tab==='undefined'||tab!=='study')clickTab('study');if(sub)clickSx('sub:'+sub)};
function passages(q){const m=/^\s*((?:[1-3]\s*)?[a-z][a-z .]*?)\s*(?:(\d{1,3})(?:\s*[:.]\s*(\d{1,3}))?)?\s*$/i.exec(q);if(!m)return[];const nm=m[1].toLowerCase().replace(/[\s.]/g,'');if(nm.length<2)return[];const ch=m[2]?+m[2]:1,v=m[3]?+m[3]:0,out=[];
 BIB.forEach(([n,c],i)=>{const k=n.toLowerCase().replace(/\s/g,'');if((k.startsWith(nm)||ALIAS[nm]===i)&&ch>=1&&ch<=c)out.push({l:`${n} ${ch}${v?':'+v:''}`,s:'Bible',f:()=>go(i,ch,v)})});return out.slice(0,5)}
function notesFor(q){if(q.length<2)return[];const lq=q.toLowerCase(),all=[...(window.NOTES||[]).filter(n=>!(ST().del||{})[n.id]),...(ST().my||[])];return all.filter(n=>`${n.title} ${n.sum||''}`.toLowerCase().includes(lq)).slice(0,6).map(n=>({l:n.title,s:'Study note',f:()=>{toStudy('notes');const b=document.querySelector(`[data-nid="${n.id}"]`);b&&b.click()}}))}
function palItems(q){q=q.trim();const out=[];
 if(!q){TABS.forEach(([l,t])=>out.push({l,s:'Go to',f:()=>clickTab(t)}));SUBS.forEach(([l,s])=>out.push({l,s:'Study',f:()=>toStudy(s)}));return out}
 out.push(...passages(q));const lq=q.toLowerCase();
 TABS.filter(([l])=>l.toLowerCase().includes(lq)).forEach(([l,t])=>out.push({l,s:'Go to',f:()=>clickTab(t)}));
 SUBS.filter(([l])=>l.toLowerCase().includes(lq)).forEach(([l,s])=>out.push({l,s:'Study',f:()=>toStudy(s)}));
 out.push(...notesFor(q));
 out.push({l:`Search the Bible for “${q}”`,s:'Search',f:()=>{toStudy('search');const i=document.getElementById('sxg');if(i){i.value=q;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))}}});
 return out}
let pal=null,palSel=0,palList=[];
const closePal=()=>{if(pal){pal.remove();pal=null}};
function palDraw(){const ul=pal.querySelector('ul');palList=palItems(pal.querySelector('input').value);palSel=Math.min(palSel,Math.max(0,palList.length-1));
 ul.innerHTML=palList.map((x,i)=>`<li><button data-i="${i}" class="${i===palSel?'on':''}"><span></span><small>${x.s}</small></button></li>`).join('');$$('button span',ul).forEach((s,i)=>s.textContent=palList[i].l)}
function palRun(i){const x=palList[i];if(!x)return;closePal();x.f()}
function openPal(){if(pal)return closePal();hidePop();closeAa();pal=document.createElement('div');pal.className='cpal';pal.setAttribute('role','dialog');pal.setAttribute('aria-modal','true');pal.setAttribute('aria-label','Search and jump');
 pal.innerHTML='<div><input type="search" placeholder="Jump to John 3:16, a note, or a page" aria-label="Search" autocomplete="off"><ul></ul><div class="ft">Enter to open · Esc to close · try “psalm 23” or “1 kings 1:3”</div></div>';
 document.body.appendChild(pal);const inp=pal.querySelector('input');palSel=0;palDraw();inp.focus();
 inp.addEventListener('input',()=>{palSel=0;palDraw()});
 inp.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();palSel=Math.min(palList.length-1,palSel+1);palDraw()}else if(e.key==='ArrowUp'){e.preventDefault();palSel=Math.max(0,palSel-1);palDraw()}else if(e.key==='Enter'){e.preventDefault();palRun(palSel)}else if(e.key==='Escape'){closePal()}});
 pal.addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(b)palRun(+b.dataset.i);else if(e.target===pal)closePal()})}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPal()}});
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#cpopen'))openPal()});

// ---------- After every render ----------
function post(){
 hidePop();
 const sec=typeof tab!=='undefined'&&['subs','review','calendar','settings'].includes(tab),mb=document.querySelector('.morebtn');mb&&mb.classList.toggle('on',sec);
 setRdh();setTimeout(setRdh,350);prog();
 if(L){if(!inReader()||L.key!==lsKey())lsStop();else{lsMark();const b=document.querySelector('[data-up=listen]');b&&(b.textContent='Stop')}}
}
const _render=window.render;
if(typeof _render==='function'){window.render=function(){const r=_render.apply(this,arguments);try{post()}catch(e){console.error(e)}return r};try{post()}catch{}}
})();
