/* Unit converter (Study > Background > Unit converter): cubits, shekels, ephahs and the rest, to metric and everyday units.
   Sizes are the usual scholarly estimates; they varied by place and period, so results are shown as approximate.
   The cubit is the biggest source of doubt, so there is a switch between the common cubit (45 cm) and the long cubit (52.5 cm).
   Also exposes UNITS.say(n,'cubit') for other pages (the Plans use it to show sizes). Needs app.js (S, esc, render, save) and background.js. */
(()=>{
const CUB={common:.45,long:.525},CUBN={common:'Common cubit \u00B7 45 cm',long:'Long cubit \u00B7 52.5 cm'};
// id, name, plural, size in the base unit (a function of the cubit length), what it was, [book, chapter, verse, why]
const B=(id,n,pl,f,d,r)=>({id,n,pl,f,d,r:r||[],bib:1}),M=(id,n,f)=>({id,n,pl:n,f:()=>f});
const CATS={
 length:{t:'Length',base:'m',u:[
  B('finger','Finger','fingers',c=>c/24,'A finger\u2019s width. Four fingers make a handbreadth.',[['Jeremiah',52,21,'Thickness of the temple pillars']]),
  B('handbreadth','Handbreadth','handbreadths',c=>c/6,'The width of the palm. Six handbreadths make a cubit.',[['Exodus',25,25,'The border of the table']]),
  B('span','Span','spans',c=>c/2,'A hand stretched wide. Half a cubit.',[['Exodus',28,16,'The breastplate'],['1 Samuel',17,4,'Goliath']]),
  B('cubit','Cubit','cubits',c=>c,'Elbow to fingertip. A common cubit is about 45 cm; the \u201Clong\u201D cubit, a cubit and a handbreadth, about 52 cm.',[['Genesis',6,15,'The ark'],['Ezekiel',40,5,'The measuring rod']]),
  B('fathom','Fathom','fathoms',()=>1.83,'The reach of both arms, used to sound the depth of water.',[['Acts',27,28,'Sounding the sea']]),
  B('reed','Reed','reeds',()=>3.15,'A measuring rod of six long cubits.',[['Ezekiel',40,5,'The measuring rod'],['Revelation',21,15,'The angel\u2019s reed']]),
  B('stadion','Furlong (stadion)','furlongs',()=>185,'A Greek stadion, the length of a running track.',[['Luke',24,13,'The Emmaus road'],['John',6,19,'Rowing on the lake']]),
  B('sabbath','Sabbath day\u2019s journey','sabbath day\u2019s journeys',c=>2000*c,'Two thousand cubits, the distance allowed on the sabbath.',[['Acts',1,12,'From the Mount of Olives'],['Numbers',35,5,'The 2,000 cubits']]),
  B('mile','Mile (Roman)','miles',()=>1480,'The Roman mile of a thousand paces.',[['Matthew',5,41,'Going the second mile']]),
  B('dayjourney','Day\u2019s journey','day\u2019s journeys',()=>25000,'What a traveller on foot covered in a day; roughly 20 to 30 km.',[['Luke',2,44,'Looking for Jesus'],['Numbers',11,31,'The quail']])],
  m:[M('mm','mm',.001),M('cm','cm',.01),M('m','m',1),M('km','km',1000),M('in','in',.0254),M('ft','ft',.3048),M('yd','yd',.9144),M('mi','mi',1609.344)],to:'m'},
 dry:{t:'Dry measures',base:'L',u:[
  B('cab','Cab (kab)','cabs',()=>1.2,'A small measure of grain.',[['2 Kings',6,25,'Dove\u2019s dung in the siege']]),
  B('omer','Omer','omers',()=>2.2,'A tenth of an ephah. The daily portion of manna for one person.',[['Exodus',16,16,'Manna'],['Exodus',16,36,'An omer is a tenth of an ephah']]),
  B('seah','Seah (\u201Cmeasure\u201D)','seahs',()=>7.3,'A third of an ephah.',[['Genesis',18,6,'Three seahs of meal'],['2 Kings',7,1,'A seah of flour for a shekel']]),
  B('ephah','Ephah','ephahs',()=>22,'The standard grain measure.',[['Ruth',2,17,'Ruth gleans an ephah'],['Leviticus',19,36,'An honest ephah']]),
  B('homer','Homer (cor)','homers',()=>220,'Ten ephahs, roughly a donkey load.',[['Leviticus',27,16,'Seed barley'],['Ezekiel',45,11,'Ephah and bath']]),
  B('bushel','Bushel (modios)','bushels',()=>8.75,'A Roman grain measure, about the size of a bowl or basket.',[['Matthew',5,15,'Under a bushel']])],
  m:[M('ml','mL',.001),M('l','L',1),M('cup','US cup',.2365882),M('pt','US pint',.4731765),M('qt','US quart',.9463529),M('gal','US gallon',3.785412),M('usbu','US bushel',35.23907)],to:'l'},
 liquid:{t:'Liquid measures',base:'L',u:[
  B('log','Log','logs',()=>.3,'The smallest liquid measure.',[['Leviticus',14,10,'Oil for cleansing']]),
  B('hin','Hin','hins',()=>3.7,'Used for oil and wine in offerings.',[['Exodus',29,40,'Wine for the drink offering'],['Numbers',15,4,'Oil for the grain offering']]),
  B('bath','Bath','baths',()=>22,'The liquid equal of the ephah.',[['1 Kings',7,26,'The bronze Sea'],['Ezekiel',45,11,'Ephah and bath']]),
  B('firkin','Firkin (metretes)','firkins',()=>39,'A Greek liquid measure. The water jars at Cana held two or three each.',[['John',2,6,'The jars at Cana']]),
  B('corl','Cor (liquid)','cors',()=>220,'Ten baths.',[['1 Kings',5,11,'Oil for Hiram']])],
  m:[M('ml','mL',.001),M('l','L',1),M('floz','US fl oz',.02957353),M('cup','US cup',.2365882),M('pt','US pint',.4731765),M('qt','US quart',.9463529),M('gal','US gallon',3.785412)],to:'l'},
 weight:{t:'Weight',base:'g',u:[
  B('gerah','Gerah','gerahs',()=>.57,'A twentieth of a shekel.',[['Exodus',30,13,'The half shekel']]),
  B('bekah','Bekah','bekahs',()=>5.7,'Half a shekel.',[['Exodus',38,26,'The census silver']]),
  B('shekel','Shekel','shekels',()=>11.4,'The basic weight, mostly of silver.',[['1 Samuel',17,7,'Goliath\u2019s spearhead'],['2 Samuel',14,26,'Absalom\u2019s hair']]),
  B('mina','Mina (\u201Cpound\u201D)','minas',()=>570,'Fifty shekels. Translated \u201Cpound\u201D in some versions.',[['1 Kings',10,17,'Gold shields'],['Ezra',2,69,'Temple gifts']]),
  B('rpound','Roman pound','Roman pounds',()=>327,'About 12 ounces.',[['John',12,3,'The ointment at Bethany'],['John',19,39,'Spices for the burial']]),
  B('talent','Talent','talents',()=>34200,'The heaviest weight: three thousand shekels.',[['Exodus',25,39,'The golden lampstand'],['Revelation',16,21,'Hailstones']])],
  m:[M('g','g',1),M('kg','kg',1000),M('oz','oz',28.34952),M('lb','lb',453.5924),M('t','tonne',1e6)],to:'kg'}};
const ORDER=['length','dry','liquid','weight'];
// things people ask: a setting for category, amount, from, to, and where it is in the Bible
const PRE=[
 ['Noah\u2019s ark: 300 cubits','length',300,'cubit','m',['Genesis',6,15]],
 ['Sabbath day\u2019s journey','length',1,'sabbath','km',['Acts',1,12]],
 ['The manna of one day: 1 omer','dry',1,'omer','l',['Exodus',16,16]],
 ['Cana: 3 firkins a jar','liquid',3,'firkin','l',['John',2,6]],
 ['The bronze Sea: 2,000 baths','liquid',2000,'bath','l',['1 Kings',7,26]],
 ['Goliath\u2019s spearhead: 600 shekels','weight',600,'shekel','kg',['1 Samuel',17,7]],
 ['Solomon\u2019s yearly gold: 666 talents','weight',666,'talent','kg',['1 Kings',10,14]]];
// words found in a chapter (from background.js) -> converter unit
const WORD=[[/sabbath/,'length','sabbath'],[/day.s journey/,'length','dayjourney'],[/cubit/,'length','cubit'],[/handbreadth|hand breadth/,'length','handbreadth'],[/\bspan/,'length','span'],[/fathom/,'length','fathom'],[/furlong/,'length','stadion'],[/\bmile/,'length','mile'],
 [/\bcab\b/,'dry','cab'],[/omer/,'dry','omer'],[/seah|measures? of/,'dry','seah'],[/ephah/,'dry','ephah'],[/homer|\bcor\b/,'dry','homer'],[/bushel/,'dry','bushel'],
 [/\blog\b/,'liquid','log'],[/\bhin\b/,'liquid','hin'],[/\bbath/,'liquid','bath'],[/firkin/,'liquid','firkin'],
 [/gerah/,'weight','gerah'],[/bekah/,'weight','bekah'],[/shekel/,'weight','shekel'],[/pound/,'weight','mina'],[/talent/,'weight','talent']];

/* ---------- maths and wording ---------- */
const find=(c,id)=>[...CATS[c].u,...CATS[c].m].find(x=>x.id===id);
const cubit=()=>CUB[(S.st&&S.st.un&&CUB[S.st.un.cub])?S.st.un.cub:'common'];
const val=(c,id,n)=>n*find(c,id).f(cubit());
const sig=(x,s)=>{if(!isFinite(x))return '\u2014';if(x===0)return '0';const a=Math.abs(x),d=Math.min(6,Math.max(0,s-1-Math.floor(Math.log10(a))));return(+x.toFixed(d)).toLocaleString('en-US',{maximumFractionDigits:6})};
const metric=m=>m<1?sig(m*100,2)+' cm':m<1000?sig(m,3)+' m':sig(m/1000,3)+' km';
const imper=m=>{const f=m/.3048;return f<3?sig(f*12,2)+' in':m<1609?sig(f,3)+' ft':sig(m/1609.344,3)+' mi'};
// "300 cubits (about 135 m, 443 ft)" for the Plans and other pages
function say(n,u){const c=u==='stadion'?185:cubit(),m=n*c,nm=u==='stadion'?(n===1?'stadion':'stadia'):(n===1?'cubit':'cubits');return `${sig(n,6)} ${nm} (about ${metric(m)}, ${imper(m)})`}

/* ---------- state ---------- */
const st=()=>{const s=S.st||(S.st={});const u=s.un&&typeof s.un==='object'?s.un:(s.un={});
 if(!CATS[u.c])u.c='length';const C=CATS[u.c];
 if(!(+u.a>=0)||!isFinite(+u.a))u.a=1;u.a=+u.a;
 if(!find(u.c,u.from))u.from=C.u[3]?C.u[3].id:C.u[0].id;
 if(!find(u.c,u.to))u.to=C.to;
 if(u.cub!=='long')u.cub='common';return u};
const setCat=(c,keep)=>{const u=st();u.c=c;if(!keep){u.from=CATS[c].u[c==='length'?3:c==='dry'?3:c==='liquid'?2:2].id;u.to=CATS[c].to}};
const pre=i=>{const p=PRE[i];if(!p)return;const u=st();u.c=p[1];u.a=p[2];u.from=p[3];u.to=p[4]};
const unitOpts=(c,sel)=>`<optgroup label="Bible units">${CATS[c].u.map(x=>`<option value="${x.id}" ${x.id===sel?'selected':''}>${esc(x.n)}</option>`).join('')}</optgroup><optgroup label="Everyday units">${CATS[c].m.map(x=>`<option value="${x.id}" ${x.id===sel?'selected':''}>${esc(x.n)}</option>`).join('')}</optgroup>`;
const num=(a,x)=>a===1?x.n:x.pl;

/* ---------- the result block (redrawn while typing) ---------- */
function result(){const u=st(),C=CATS[u.c],F=find(u.c,u.from),T=find(u.c,u.to);if(!F||!T)return '';
 const base=u.a*F.f(cubit()),out=base/T.f(cubit()),approx=F.bib||T.bib;
 const rows=(list,bibl)=>list.filter(x=>x.id!==u.from&&x.id!==u.to).map(x=>`<div class="un-r"><span>${esc(sig(base/x.f(cubit()),4))}</span><b>${esc(x.id===u.from?x.n:(bibl&&x.n)||x.n)}</b></div>`).join('');
 const refs=(F.bib?F.r:[]).concat(T.bib&&T.id!==F.id?T.r:[]);const bk=n=>BIB.findIndex(b=>b[0]===n);
 const rb=refs.map(r=>{const b=bk(r[0]);return b<0?'':`<button class="trref" data-bg="go:${b}.${r[1]}.${r[2]}">${esc(r[0]+' '+r[1]+':'+r[2])}<small>${esc(r[3]||'')}</small></button>`}).join('');
 return `<div class="un-big" aria-live="polite"><span class="un-eq">${esc(sig(u.a,6))} ${esc(num(u.a,F))} =</span>${approx?'<span class="un-ab">about</span>':''}<b>${esc(sig(out,4))}</b><span class="un-u">${esc(num(out,T))}</span></div>
${F.bib?`<p class="un-d"><b>${esc(F.n)}.</b> ${esc(F.d)}${u.from==='cubit'||u.from==='sabbath'||u.from==='span'||u.from==='handbreadth'||u.from==='finger'?' Using the <b>'+(u.cub==='long'?'long':'common')+' cubit</b> ('+(cubit()*100).toFixed(1).replace('.0','')+' cm).':''}</p>`:''}
${rb?`<div class="trw2 un-refs">${rb}</div>`:''}
<details class="un-all" ${u.all?'open':''}><summary>The same amount in every unit</summary><div class="un-grid"><div><h4>Everyday</h4>${rows(C.m)}</div><div><h4>Bible</h4>${rows(C.u,1)}</div></div></details>`}

/* ---------- units found in the chapter being read ---------- */
function chapterChips(){const w=window.NM&&NM.cfg&&NM.cfg.where?NM.cfg.where():null;if(!w||!window.BGP||!BGP.found)return '';const f=BGP.found(w[0],w[1]);if(!f||!f.measures)return '';
 const seen=new Set(),L=[];f.measures.forEach(word=>{for(const[re,c,id] of WORD)if(re.test(word)){if(!seen.has(c+id)){seen.add(c+id);L.push([c,id])}break}});
 return L.length?`<div class="un-ch"><span class="un-h">In ${esc(BIB[w[0]][0])} ${w[1]}</span>${L.map(([c,id])=>`<button class="g s" data-un="unit:${c}:${id}">${esc(find(c,id).n)}</button>`).join('')}</div>`:''}

/* ---------- the page body ---------- */
function body(){const u=st(),C=CATS[u.c];
 return `<div class="unc"><p class="trintro">Turn Bible measures into metric and everyday units. These are the usual scholarly estimates; sizes varied by place and period, so treat every answer as approximate.</p>
${chapterChips()}
<div class="un-cats seg" role="tablist" aria-label="Kind of measure">${ORDER.map(k=>`<button class="${k===u.c?'on':''}" role="tab" aria-selected="${k===u.c}" data-un="cat:${k}">${CATS[k].t}</button>`).join('')}</div>
<div class="un-form"><label class="un-f"><span>Amount</span><input id="unA" type="number" inputmode="decimal" min="0" step="any" value="${esc(String(u.a))}" aria-label="Amount"></label>
<label class="un-f"><span>From</span><select id="unF" aria-label="From unit">${unitOpts(u.c,u.from)}</select></label>
<button class="g un-sw" data-un="swap" aria-label="Swap the two units" title="Swap">\u21C4</button>
<label class="un-f"><span>To</span><select id="unT" aria-label="To unit">${unitOpts(u.c,u.to)}</select></label></div>
<div class="un-cub" role="group" aria-label="Which cubit"><span class="un-h">Cubit</span>${Object.keys(CUB).map(k=>`<button class="g s ${u.cub===k?'on':''}" aria-pressed="${u.cub===k}" data-un="cub:${k}">${CUBN[k]}</button>`).join('')}</div>
<div class="un-res" id="unR">${result()}</div>
<h3 class="bgh3">Famous amounts</h3><div class="un-pre">${PRE.map((p,i)=>`<button class="un-p" data-un="pre:${i}"><b>${esc(p[0])}</b><small>${esc(p[5][0]+' '+p[5][1]+':'+p[5][2])}</small></button>`).join('')}</div>
<p class="trhint">Prices and coins change too much to convert, so they are not here. See the Coins page for what a denarius or a talent of silver meant.</p></div>`}

/* ---------- events ---------- */
const again=()=>{save();render()};
document.addEventListener('click',e=>{if(typeof tab==='undefined'||tab!=='study')return;const el=e.target.closest&&e.target.closest('[data-un]');if(!el)return;
 const[a,x,y]=el.dataset.un.split(':');e.preventDefault();const u=st();
 if(a==='cat')setCat(x);else if(a==='swap'){const t=u.from;u.from=u.to;u.to=t}
 else if(a==='cub')u.cub=x==='long'?'long':'common';else if(a==='pre')pre(+x);
 else if(a==='unit'){u.c=x;u.from=y;u.to=CATS[x].to;u.a=1}
 else return;again()});
document.addEventListener('input',e=>{if(e.target.id!=='unA')return;const u=st(),v=parseFloat(e.target.value);u.a=isFinite(v)&&v>=0?v:0;const r=document.getElementById('unR');if(r)r.innerHTML=result();save()});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='unF'){st().from=t.value;again()}else if(t.id==='unT'){st().to=t.value;again()}});
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('un-all'))st().all=e.target.open?1:0},true);

window.UNITS={view:body,say,chapterChips};
})();
