// Hover / tap details for names and places in the KJV reader. Data: names.json (built from Easton's Bible Dictionary,
// Strong's lexicon and Theographic; see the Sources line on each card). Matching is per verse, so James, John, Mary etc. open the right person.
(()=>{
let D=null,V=null,BY={};
fetch('names.json').then(r=>r.json()).then(j=>{D=j.e;V=j.v;D.forEach((e,i)=>{if(!BY[e.n]||D[BY[e.n]].k<e.k)BY[e.n]=i});if(typeof tab!=='undefined'&&tab==='study')render()}).catch(()=>{});
window.NM={mark:(h,b,c,v)=>{const it=V&&V[b+'.'+c+'.'+v];if(!it)return h;let o='',p=0;for(const[s,i]of it){const j=h.indexOf(s,p);if(j<0)continue;o+=h.slice(p,j)+`<span class="nm" data-nm="${i}" tabindex="0">${s}</span>`;p=j+s.length}return o+h.slice(p)}};
const row=(l,v)=>v?`<div class="nr"><b>${l}</b><div>${v}</div></div>`:'';
const L=(a,l)=>(a||[]).map(x=>`<div class="lx"><span class="wd" lang="${l}"${l==='he'||l==='ar'?' dir="rtl"':''}>${x.w}</span> <i>${x.x}</i>${x.d?`<div class="ld">${x.d}</div>`:''}</div>`).join('');
const roots=e=>{const r=[];if(e.rt)r.push(e.rt);[...(e.he||[]),...(e.ar||[]),...(e.gr||[])].forEach(x=>(x.r||[]).forEach(y=>r.some(z=>z[0]===y[0])||r.push(y)));
 return r.slice(0,4).map(y=>`<div class="lx"><span class="wd" lang="he" dir="rtl">${y[0]}</span> <i>${y[1]}</i>${y[2]?' · '+y[2]:''}</div>`).join('')};
const vl=r=>`<a class="xr" data-sx="ref:${r[0]}:${r[1]}" href="#">${BIB[r[0]][0]} ${r[1]}:${r[2]}</a>`;
const html=e=>{const rel=(e.rel||[]).map(([l,n])=>`<span class="rl">${l}: ${BY[n]!=null?`<button class="g s chip" data-nm="${BY[n]}">${n}</button>`:n}</span>`).join(' ');
 const map=e.ll?`<a class="xr" target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${e.ll[0]}&mlon=${e.ll[1]}#map=9/${e.ll[0]}/${e.ll[1]}">${e.ll[0]}, ${e.ll[1]} ↗</a>`:'';
 return `<div class="nh"><div><h3>${e.n}${e.al?` <small>(also ${e.al})</small>`:''}</h3><span class="tg">${e.t==='l'?'📍 Place'+(e.ft?' · '+e.ft:''):'👤 Person'}${e.yr?' · '+e.yr:''}</span></div><button class="g s" data-nx="1" aria-label="Close">✕</button></div>`
 +row('Meaning',e.m)+row('Root word',roots(e))+row('Hebrew',L(e.he,'he'))+row('Aramaic',L(e.ar,'ar'))+row('Greek',L(e.gr,'el'))
 +(e.nt?`<p class="nn">${e.nt}</p>`:'')+row('Overview',e.sum)+row('Background',e.bg)+row('Location',(e.md?e.md+' · ':'')+map)+row('Related',rel)
 +row('Linked verses',(e.vs||[]).map(vl).join(' · '))+`<p class="src">Sources: Easton’s Bible Dictionary and Strong’s lexicon (public domain); verse tagging and relations from Theographic (CC BY-SA 4.0); coordinates from OpenBible.info.</p>`};
let c=null,anchor=null,tm=0,pin=0;
const card=()=>c||(c=Object.assign(document.createElement('div'),{id:'nmcard'}),c.setAttribute('role','dialog'),document.body.append(c),c.onmouseenter=()=>clearTimeout(tm),c.onmouseleave=()=>{if(!pin)lat()},c);
const hide=()=>{clearTimeout(tm);pin=0;anchor=null;if(c)c.style.display='none'};
const lat=()=>{clearTimeout(tm);tm=setTimeout(hide,260)};
const place=()=>{if(!anchor||matchMedia('(hover:none)').matches){c.style.left=c.style.top='';return}const r=anchor.getBoundingClientRect(),w=Math.min(380,innerWidth-24);
 c.style.left=Math.max(12,Math.min(r.left,innerWidth-w-12))+'px';const h=c.offsetHeight;c.style.top=(r.bottom+h+12>innerHeight&&r.top>h+12?r.top-h-8:r.bottom+8)+'px'};
const show=(i,el,p)=>{const e=D&&D[i];if(!e)return;clearTimeout(tm);if(el)anchor=el;if(p)pin=1;const k=card();k.innerHTML=html(e);k.style.display='block';k.scrollTop=0;place()};
document.addEventListener('mouseover',e=>{const n=e.target.closest&&e.target.closest('.nm');if(n&&matchMedia('(hover:hover)').matches&&!pin)show(n.dataset.nm,n)});
document.addEventListener('mouseout',e=>{if(e.target.closest&&e.target.closest('.nm')&&!pin)lat()});
document.addEventListener('focusin',e=>{const n=e.target.closest&&e.target.closest('.nm');if(n)show(n.dataset.nm,n,1)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
document.addEventListener('click',e=>{const t=e.target,n=t.closest&&t.closest('.nm');
 if(n){e.preventDefault();e.stopPropagation();show(n.dataset.nm,n,1);return}
 if(c&&c.contains(t)){if(t.closest('[data-nx]')){e.preventDefault();hide()}else if(t.closest('[data-nm]')){e.preventDefault();show(t.closest('[data-nm]').dataset.nm,null,1)}else if(t.closest('[data-sx]'))setTimeout(hide);return}
 hide()},true);
})();
