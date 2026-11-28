/* Plans artwork: painted SVG scenes (stone, wood, gold, fabric, light) for each plan in plans.js.
   Loaded before plans.js. Each draw(p) gets the plan (its points and any extras) and returns SVG markup.
   The scenes are illustrations, not surveys: positions follow plans.js so the tappable points always line up. */
(()=>{
const rng=s=>()=>(s=s*16807%2147483647)/2147483647;
const inPoly=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
const segD=(px,py,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(px-a[0]-t*dx,py-a[1]-t*dy)};
const minEdge=(x,y,P)=>Math.min(...P.map((a,i)=>segD(x,y,a,P[(i+1)%P.length])));
const f1=n=>(+n).toFixed(1);
const speck=(id,seed,cols,n,sz)=>{const r=rng(seed);let d='';for(let i=0;i<n;i++)d+=`<circle cx="${f1(r()*sz)}" cy="${f1(r()*sz)}" r="${(.4+r()*.9).toFixed(2)}" fill="${cols[i%cols.length]}"/>`;return `<pattern id="${id}" width="${sz}" height="${sz}" patternUnits="userSpaceOnUse">${d}</pattern>`};
const compass=(x,y)=>`<g class="pl-comp" transform="translate(${x} ${y})"><text y="-6" text-anchor="middle">N</text><path d="M0 2v28M-5 9 0 2 5 9"/></g>`;
const person=(x,y,h)=>{const k=h/22;return `<g transform="translate(${x} ${y}) scale(${k})" opacity=".92"><ellipse cx="0" cy="1" rx="5" ry="1.4" fill="#000" opacity=".3"/><circle cx="0" cy="-19.5" r="2.5" fill="#F3E3B0"/><path d="M-3 -16.5h6l1.6 8.5h-1.7l-.5 8h-2.3l-.4-6-.4 6h-2.3l-.5-8h-1.7z" fill="#F3E3B0"/></g>`};
const scaleBar=(x,y,ppc,c,label)=>`<g class="pl-sb" transform="translate(${x} ${y})"><path d="M0 0h${f1(ppc*c)}M0 -3v6M${f1(ppc*c)} -3v6" stroke="#fff" stroke-opacity=".85" stroke-width="1.4" fill="none"/><text x="${f1(ppc*c+7)}" y="3.5">${label}</text></g>`;
const cm=()=>window.UNITS&&UNITS.cub?UNITS.cub():.45;
const m1=c=>{const v=c*cm();return (v<10?v.toFixed(1):Math.round(v))+' m'};

/* ---------- shared materials ---------- */
const stop=(o,c)=>`<stop offset="${o}" stop-color="${c}"/>`;
const lg=(id,a,x1=0,y1=0,x2=1,y2=1)=>`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${a.map(([o,c])=>stop(o,c)).join('')}</linearGradient>`;
const rg=(id,a,cx='50%',cy='50%',r='50%')=>`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${a.map(([o,c])=>stop(o,c)).join('')}</radialGradient>`;
const DEFS=`<defs>
${rg('gSand',[[0,'#EBDDB6'],[.65,'#CFB98B'],[1,'#A58B5C']],'50%','45%','80%')}
${rg('gSand2',[[0,'#F1E6C6'],[1,'#D9C79B']],'50%','50%','75%')}
${rg('gHill',[[0,'#7B6A48'],[.7,'#4A3F2B'],[1,'#2C261A']],'50%','45%','75%')}
${rg('gTree',[[0,'#8DAE62'],[1,'#3B5A2B']],'40%','35%','70%')}
${lg('gStone',[[0,'#EADFC6'],[1,'#9B8D70']])}
${lg('gGold',[[0,'#FFF3B8'],[.45,'#E3B94F'],[1,'#8F6A1E']])}
${lg('gBronze',[[0,'#F4BC90'],[.5,'#B8602F'],[1,'#6B3316']])}
${lg('gWood',[[0,'#C99C66'],[1,'#8A5C33']])}
${lg('gLinen',[[0,'#FFFDF6'],[1,'#E3D9BF']],0,0,0,1)}
${lg('gWater',[[0,'#A6D8F2'],[1,'#3A7CAF']],0,0,0,1)}
${lg('gSky',[[0,'#0B1235'],[.55,'#26407F'],[1,'#8E7BA6']],0,0,0,1)}
${lg('gSpace',[[0,'#070B22'],[1,'#1A2255']],0,0,0,1)}
${rg('gGlow',[[0,'#FFF4C2'],[.4,'#F3D67A88'],[1,'#F3D67A00']])}
${rg('gFire',[[0,'#FFF3A0'],[.35,'#FFB52E'],[.7,'#E2571E99'],[1,'#E2571E00']])}
${rg('gPearl',[[0,'#FFFFFF'],[.7,'#F3E4EA'],[1,'#D9B5C6']],'38%','32%','75%')}
${lg('gShine',[[0,'#FFFFFF66'],[.45,'#FFFFFF00'],[1,'#FFFFFF33']])}
<pattern id="pStoneW" width="16" height="9" patternUnits="userSpaceOnUse"><rect width="16" height="9" fill="#D2C4A4"/><path d="M0 4.5H16M4 0V4.5M12 4.5V9" stroke="#8D805F" stroke-width=".9" fill="none"/></pattern>
<pattern id="pPave" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#D9CDB0"/><path d="M0 11H22M11 0V11M0 0V22" stroke="#A89A7A" stroke-width=".8" fill="none"/></pattern>
<pattern id="pPlank" width="60" height="9" patternUnits="userSpaceOnUse"><rect width="60" height="9" fill="#B98A55"/><path d="M0 .5H60" stroke="#6B4524" stroke-width="1.2"/><path d="M14 0V9M43 0V9" stroke="#8A5C33" stroke-width=".6"/><path d="M0 4.5q15 -1.5 30 0t30 0" stroke="#D2A672" stroke-width=".6" fill="none"/></pattern>
<pattern id="pCurtain" width="8" height="18" patternUnits="userSpaceOnUse"><rect width="8" height="6" fill="#2F5C9E"/><rect y="6" width="8" height="6" fill="#6B3FA0"/><rect y="12" width="8" height="6" fill="#C23B2E"/></pattern>
${speck('pSand',3,['#8A6F3A55','#FFF3D066','#6B5430'+'44'],70,60)}
${speck('pDark',9,['#00000055','#ffffff22','#00000033'],90,60)}
<filter id="fSh" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.4" flood-color="#000" flood-opacity=".5"/></filter>
<filter id="fBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
</defs>`;

const wing=(x,y,sx,rot)=>`<path transform="translate(${x} ${y}) rotate(${rot}) scale(${sx} .9)" d="M0 0C6 -8 18 -11 30 -6C22 -4 12 -1 0 0Z" fill="url(#gGold)" stroke="#8F6A1E" stroke-width=".6"/>`;
const flame=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><circle r="7" fill="url(#gGlow)" opacity=".8"/><ellipse cy="-3" rx="1.8" ry="3.4" fill="#FFD25E"/><ellipse cy="-2.4" rx=".8" ry="1.8" fill="#FFF6C8"/></g>`;
const horn=(x,y)=>`<circle cx="${x}" cy="${y}" r="4.2" fill="url(#gBronze)" stroke="#5A2A10" stroke-width=".8"/>`;
const post=(x,y)=>`<circle cx="${x}" cy="${y}" r="3.2" fill="#EDEFF5" stroke="#7C8396" stroke-width=".8"/>`;
const goldPillar=(x,y,r=3.6)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#gGold)" stroke="#6B4C12" stroke-width=".8"/>`;
const tentIcon=(x,y,c)=>`<path d="M${x} ${y}l6 -9 6 9z" fill="${c}" stroke="#3A2A1A" stroke-width=".7"/><path d="M${x+4.5} ${y}l1.5 -5 1.5 5z" fill="#2B1D14"/>`;
const smoke=(x,y,h)=>`<path d="M${x} ${y}c-5 -${h*.3} 5 -${h*.5} 0 -${h*.7}s4 -${h*.2} 1 -${h}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round" filter="url(#fBlur)"/>`;

const draw={};

/* ---------- Jerusalem's wall ---------- */
draw.neh=p=>{const W=[[288,38],[422,39],[426,125],[434,190],[415,250],[381,330],[325,379],[307,376],[233,280],[175,222],[153,182],[150,140],[156,130],[177,90],[211,60],[237,47]],pl=W.map(a=>a.join(',')).join(' ');
 const r=rng(11);let tr='',hs='';
 for(let i=0;i<90;i++){const x=12+r()*556,y=8+r()*394;if(inPoly(x,y,W)||minEdge(x,y,W)<24||(y>330&&x>470))continue;const rr=4.5+r()*5;tr+=`<circle cx="${f1(x+2)}" cy="${f1(y+3)}" r="${f1(rr+1.5)}" fill="#000" opacity=".3"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr)}" fill="url(#gTree)"/>`}
 for(let y=52;y<372;y+=14)for(let x=162;x<432;x+=14){const px=x+(r()-.5)*7,py=y+(r()-.5)*7;if(!inPoly(px,py,W)||(px>336&&px<424&&py>58&&py<132)||minEdge(px,py,W)<15||r()<.25)continue;
  const w=7+r()*6,h=6+r()*5,c=['#C9774B','#D8946A','#E8CBA0','#B8653F','#EBD9B5','#D2A06E'][r()*6|0];hs+=`<rect x="${f1(px-w/2+1.6)}" y="${f1(py-h/2+1.8)}" width="${f1(w)}" height="${f1(h)}" fill="#000" opacity=".22"/><rect x="${f1(px-w/2)}" y="${f1(py-h/2)}" width="${f1(w)}" height="${f1(h)}" rx="1" fill="${c}" stroke="#5A3A22" stroke-opacity=".5" stroke-width=".6"/><path d="M${f1(px-w/2)} ${f1(py)}H${f1(px+w/2)}" stroke="#fff" stroke-opacity=".25" stroke-width=".5"/>`}
 const tower=q=>q.n==='Broad Wall'?`<g filter="url(#fSh)"><rect x="${q.x-17}" y="${q.y-8}" width="34" height="16" rx="3" transform="rotate(-48 ${q.x} ${q.y})" fill="url(#pStoneW)" stroke="#4A3D2A" stroke-width="1.6"/></g>`:`<g transform="translate(${q.x} ${q.y})" filter="url(#fSh)"><rect x="-12.5" y="-12.5" width="25" height="25" rx="3" fill="url(#gStone)" stroke="#4F4430" stroke-width="1.6"/><rect x="-8.5" y="-8.5" width="17" height="17" fill="url(#pStoneW)"/><path d="M-4.2 12.5v-8a4.2 4.2 0 0 1 8.4 0v8z" fill="#2E1C0E"/></g>`;
 return `<rect width="580" height="410" fill="url(#gHill)"/><rect width="580" height="410" fill="url(#pDark)" opacity=".5"/>
<path d="M0 360Q120 340 210 410H0Z" fill="#000" opacity=".14"/>${tr}
<g opacity=".85" font-style="italic" font-size="11" fill="#F1E8CF"><text x="552" y="372" text-anchor="end">Kidron Valley</text><text x="40" y="372">Hinnom Valley</text><text x="552" y="392" text-anchor="end">\u2192 Mount of Olives</text></g>
<polygon points="${pl}" fill="url(#gSand)"/><polygon points="${pl}" fill="url(#pSand)"/>
${hs}
<g filter="url(#fSh)"><rect x="343" y="64" width="74" height="62" rx="3" fill="url(#gStone)" stroke="#6E6044" stroke-width="1.3"/></g><rect x="349" y="70" width="62" height="50" fill="url(#pPave)" stroke="#8D7D5C" stroke-width=".8"/><rect x="361" y="78" width="22" height="34" rx="1.5" fill="url(#gGold)" stroke="#7A5A18" stroke-width=".9"/><path d="M361 95h22" stroke="#7A5A18" stroke-width=".7"/><rect x="391" y="90" width="12" height="12" rx="1" fill="url(#gBronze)" stroke="#5A2A10" stroke-width=".8"/>${flame(397,92,.9)}
<text class="pl-t" x="380" y="138" text-anchor="middle" fill="#3E3322">Temple</text>
<polygon points="${pl}" fill="none" stroke="#1C160D" stroke-width="17" stroke-linejoin="round" opacity=".45" transform="translate(2 4)"/>
<polygon points="${pl}" fill="none" stroke="#4A3D2A" stroke-width="15" stroke-linejoin="round"/>
<polygon points="${pl}" fill="none" stroke="url(#pStoneW)" stroke-width="12" stroke-linejoin="round"/>
<polygon points="${pl}" fill="none" stroke="#F4EBD3" stroke-width="12" stroke-linejoin="round" stroke-dasharray="6 5" opacity=".42"/>
<polygon points="${pl}" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="round" opacity=".4" transform="translate(0 -4.5)"/>
${p.pts.map(tower).join('')}
<text x="296" y="262" text-anchor="middle" font-size="13" letter-spacing=".14em" fill="#3E2F14" opacity=".9" stroke="#F6EBCB" stroke-width="3" paint-order="stroke">CITY OF DAVID</text>${compass(540,34)}`};

/* ---------- The Tabernacle ---------- */
draw.tab=p=>{let ps='';for(let i=0;i<=20;i++){const x=30+i*26.5;ps+=post(x,40)+post(x,320)}for(let j=1;j<10;j++){const y=40+j*28;ps+=post(30,y);if(y<124||y>236)ps+=post(560,y)}
 const rows=(y)=>[0,1,2,3,4,5].map(i=>`<rect x="${203+i*8}" y="${y}" width="6.5" height="5" rx="2" fill="#E7B873" stroke="#9B6A2A" stroke-width=".4"/>`).join('');
 return `<rect x="10" y="20" width="650" height="320" fill="url(#gSand)"/><rect x="10" y="20" width="650" height="320" fill="url(#pSand)"/>
<rect x="30" y="40" width="530" height="280" fill="url(#gSand2)" opacity=".75"/><rect x="30" y="40" width="530" height="280" fill="url(#pSand)" opacity=".6"/>
<path d="M560 128V40H30v280h530V232" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="7" transform="translate(1.5 3.5)"/><path d="M560 128V40H30v280h530V232" fill="none" stroke="url(#gLinen)" stroke-width="5" stroke-linejoin="round"/>${ps}
<g filter="url(#fSh)"><rect x="557" y="128" width="7" height="104" fill="url(#pCurtain)" stroke="#1A1A33" stroke-width=".8"/></g>${[128,163,198,232].map(y=>goldPillar(560,y,3.4)).join('')}
<circle cx="105" cy="180" r="62" fill="url(#gGlow)" opacity=".55"/>
<g filter="url(#fSh)"><rect x="70" y="135" width="220" height="90" rx="2" fill="url(#gWood)" stroke="#4D3216" stroke-width="2.5"/></g>
<rect x="76" y="141" width="208" height="78" fill="#EADBB8"/><rect x="76" y="141" width="208" height="78" fill="url(#pSand)" opacity=".7"/>
<rect x="76" y="141" width="64" height="78" fill="url(#gGlow)" opacity=".7"/><rect x="72" y="137" width="216" height="86" fill="none" stroke="url(#gGold)" stroke-width="2"/>
<g filter="url(#fSh)"><rect x="137" y="135" width="7" height="90" fill="url(#pCurtain)" stroke="#2B1A3A" stroke-width=".8"/></g>${[140,167,194,221].map(y=>goldPillar(140.5,y,2.6)).join('')}
<g filter="url(#fSh)"><rect x="287" y="143" width="7" height="74" fill="url(#pCurtain)" stroke="#1A1A33" stroke-width=".8"/></g>${[145,163,181,199,217].map(y=>goldPillar(290.5,y,2.8)).join('')}
<g filter="url(#fSh)"><rect x="86" y="172" width="28" height="16" rx="2" fill="url(#gGold)" stroke="#7A5A18" stroke-width="1"/><rect x="89" y="175" width="22" height="10" rx="1" fill="#F7DE8A" opacity=".85"/></g>
${wing(88,177,.85,-22)}${wing(88,183,.85,22)}<g transform="translate(200 0) scale(-1 1)">${wing(88,177,.85,-22)}${wing(88,183,.85,22)}</g>
<circle cx="89" cy="180" r="2.6" fill="#E3B94F" stroke="#6B4C12" stroke-width=".6"/><circle cx="111" cy="180" r="2.6" fill="#E3B94F" stroke="#6B4C12" stroke-width=".6"/>
<g filter="url(#fSh)"><rect x="150" y="171" width="20" height="18" rx="2" fill="url(#gGold)" stroke="#6B4C12" stroke-width="1"/></g>${horn(151,172).replace('url(#gBronze)','url(#gGold)')}${horn(169,172).replace('url(#gBronze)','url(#gGold)')}${horn(151,188).replace('url(#gBronze)','url(#gGold)')}${horn(169,188).replace('url(#gBronze)','url(#gGold)')}<circle cx="160" cy="180" r="4" fill="url(#gFire)"/>${smoke(160,170,26)}
<g filter="url(#fSh)"><rect x="200" y="143" width="52" height="18" rx="2" fill="#B07A3E" stroke="url(#gGold)" stroke-width="2"/></g>${rows(146)}${rows(153)}
<path d="M226 192v22M226 206C214 206 212 200 212 194M226 210C208 210 205 202 205 194M226 214C202 214 198 204 198 194M226 206C238 206 240 200 240 194M226 210C244 210 247 202 247 194M226 214C250 214 254 204 254 194" fill="none" stroke="url(#gGold)" stroke-width="2.4" stroke-linecap="round"/>
${[198,205,212,226,240,247,254].map(x=>flame(x,192,.8)).join('')}
<g filter="url(#fSh)"><circle cx="350" cy="180" r="14.5" fill="url(#gBronze)" stroke="#5A2A10" stroke-width="1.2"/><circle cx="350" cy="180" r="10.5" fill="url(#gWater)"/><path d="M344 178q3 -3 6 0t6 0M345 183q3 -2.5 5 0t5 0" stroke="#fff" stroke-opacity=".65" fill="none"/></g>
<g filter="url(#fSh)"><rect x="413" y="153" width="54" height="54" rx="2" fill="url(#gBronze)" stroke="#5A2A10" stroke-width="1.5"/></g>${horn(415,155)}${horn(465,155)}${horn(415,205)}${horn(465,205)}
<rect x="421" y="161" width="38" height="38" fill="#2A1A14"/><circle cx="440" cy="180" r="21" fill="url(#gFire)"/><path d="M421 170H459M421 180H459M421 190H459M430 161V199M440 161V199M450 161V199" stroke="#7A4A2A" stroke-opacity=".7" stroke-width="1.2"/>${flame(434,184,1.3)}${flame(446,182,1.1)}${flame(440,176,1.5)}${smoke(440,160,40)}
${person(500,300,20)}${scaleBar(40,332,5.3,10,'10 cubits \u2248 '+m1(10))}${compass(632,50)}`};

/* ---------- The camp of Israel ---------- */
const TCOL={Judah:'#C0392B',Issachar:'#3F6FB0',Zebulun:'#D8D4C4',Reuben:'#B5543A',Simeon:'#D9A441',Gad:'#6E7F8C',Ephraim:'#2F8F7A',Manasseh:'#8A5FA8',Benjamin:'#3E6BC4',Dan:'#C77B2A',Asher:'#6FA05A',Naphtali:'#9B3F6E'};
draw.camp=p=>{const{T,lev,W,H}=p;let g='';
 T.forEach(([n,cx,cy])=>{const c=TCOL[n]||'#888',x=cx-W/2,y=cy-H/2;g+=`<g filter="url(#fSh)"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="8" fill="${c}" fill-opacity=".28" stroke="${c}" stroke-width="1.6"/></g><path d="M${x+W-10} ${y+14}V${y-4}" stroke="#4A3A24" stroke-width="1.4"/><path d="M${x+W-10} ${y-4}l13 4.5 -13 4.5z" fill="${c}" stroke="#2B1D14" stroke-width=".6"/>`;
  for(let i=0;i<5;i++)g+=tentIcon(x+30+i*13,y+H-5,c)});
 lev.forEach(([n,cx,cy,w])=>{g+=`<g filter="url(#fSh)"><rect x="${cx-w/2}" y="${cy-17}" width="${w}" height="34" rx="17" fill="#6B3FA0" fill-opacity=".28" stroke="#8A64BE" stroke-width="1.4"/></g>`;for(let i=0;i<2;i++)g+=tentIcon(cx+w/2-44+i*15,cy+13,'#6B3FA0')});
 const r=rng(5);let st='';for(let i=0;i<40;i++){st+=`<circle cx="${f1(r()*640)}" cy="${f1(r()*560)}" r="${f1(.6+r()*1.4)}" fill="#8A6F3A" opacity=".3"/>`}
 return `<rect width="640" height="560" fill="url(#gSand)"/><rect width="640" height="560" fill="url(#pSand)"/>${st}
<rect x="12" y="12" width="616" height="536" rx="14" fill="none" stroke="#5A3A1A" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="5 6"/>
<circle cx="320" cy="280" r="58" fill="url(#gGlow)" opacity=".8"/>
<g filter="url(#fSh)"><rect x="289" y="257" width="62" height="46" rx="2" fill="#F6EFD8" fill-opacity=".6" stroke="url(#gLinen)" stroke-width="3"/><rect x="298" y="266" width="30" height="28" rx="1.5" fill="#4B3626" stroke="#2B1D14"/><rect x="328" y="272" width="16" height="16" rx="1" fill="url(#gBronze)" stroke="#5A2A10" stroke-width=".8"/></g>${flame(336,274,.8)}
<g font-size="12" letter-spacing=".2em" fill="#5A3A1A" opacity=".6" text-anchor="middle"><text x="320" y="150">NORTH</text><text x="320" y="440">SOUTH</text><text x="560" y="190">EAST</text><text x="82" y="190">WEST</text></g>${g}${compass(596,40)}`};

/* ---------- Solomon's temple ---------- */
draw.tem=p=>{let stands='';for(let i=0;i<5;i++)for(const y of[70,308]){const x=206+i*42;stands+=`<g filter="url(#fSh)"><rect x="${x}" y="${y}" width="26" height="22" rx="2" fill="url(#gBronze)" stroke="#5A2A10" stroke-width="1"/><circle cx="${x+13}" cy="${y+11}" r="6.5" fill="url(#gWater)" stroke="#6B3316" stroke-width="1.4"/>${[[3,3],[23,3],[3,19],[23,19]].map(([a,b])=>`<circle cx="${x+a}" cy="${y+b}" r="2.2" fill="#2A1A14"/>`).join('')}</g>`}
 let ox='';for(let i=0;i<12;i++){const a=i*Math.PI/6,x=500+Math.cos(a)*26,y=312+Math.sin(a)*26;ox+=`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5.2" ry="3.4" transform="rotate(${i*30+90} ${f1(x)} ${f1(y)})" fill="url(#gBronze)" stroke="#4A2008" stroke-width=".7"/>`}
 const lamps=[0,1,2,3,4].map(i=>flame(236+i*27,164,.8)+flame(236+i*27,236,.8)).join('');
 const cells=[0,1,2,3,4,5,6,7].map(i=>`<path d="M${100+i*41} 120V150M${100+i*41} 250V280" stroke="#7B6C4C" stroke-width="1.4"/>`).join('');
 return `<rect x="0" y="0" width="680" height="400" fill="url(#gHill)"/><rect x="0" y="0" width="680" height="400" fill="url(#pDark)" opacity=".5"/>
<rect x="40" y="48" width="610" height="304" fill="url(#pPave)"/><rect x="40" y="48" width="610" height="304" fill="url(#pSand)" opacity=".4"/>
<rect x="40" y="48" width="610" height="304" fill="none" stroke="#2A2118" stroke-opacity=".5" stroke-width="12"/><rect x="40" y="48" width="610" height="304" fill="none" stroke="url(#pStoneW)" stroke-width="9"/>
<g filter="url(#fSh)"><rect x="88" y="120" width="332" height="160" rx="2" fill="url(#pStoneW)" stroke="#5B4E36" stroke-width="2"/></g><rect x="88" y="120" width="332" height="160" fill="#B9A885" opacity=".35"/>${cells}
<g filter="url(#fSh)"><rect x="100" y="150" width="350" height="100" rx="2" fill="url(#gWood)" stroke="#4D3216" stroke-width="3"/></g>
<rect x="106" y="156" width="338" height="88" fill="#EBD6A0"/><rect x="106" y="156" width="338" height="88" fill="url(#pSand)" opacity=".6"/>
<rect x="106" y="156" width="94" height="88" fill="#F2D77A"/><circle cx="152" cy="200" r="52" fill="url(#gGlow)"/><rect x="200" y="156" width="200" height="88" fill="url(#gGold)" opacity=".22"/>
<g filter="url(#fSh)"><rect x="198" y="150" width="6" height="100" fill="url(#pCurtain)"/><rect x="398" y="150" width="6" height="100" fill="url(#gGold)" stroke="#6B4C12" stroke-width=".8"/></g>
<g filter="url(#fSh)"><rect x="132" y="192" width="40" height="16" rx="2" fill="url(#gGold)" stroke="#7A5A18" stroke-width="1"/></g>${wing(112,196,1.35,-18)}${wing(112,204,1.35,18)}<g transform="translate(300 0) scale(-1 1)">${wing(112,196,1.35,-18)}${wing(112,204,1.35,18)}</g>
<g filter="url(#fSh)"><rect x="218" y="192" width="18" height="16" rx="2" fill="url(#gGold)" stroke="#6B4C12" stroke-width=".9"/><rect x="352" y="194" width="34" height="12" rx="2" fill="#B07A3E" stroke="url(#gGold)" stroke-width="1.6"/></g>${lamps}
<g filter="url(#fSh)"><circle cx="452" cy="170" r="9.5" fill="url(#gBronze)" stroke="#4A2008" stroke-width="1.2"/><circle cx="452" cy="170" r="5" fill="none" stroke="#F4BC90" stroke-width="1"/><circle cx="452" cy="230" r="9.5" fill="url(#gBronze)" stroke="#4A2008" stroke-width="1.2"/><circle cx="452" cy="230" r="5" fill="none" stroke="#F4BC90" stroke-width="1"/></g>
<g filter="url(#fSh)"><rect x="516" y="158" width="84" height="84" rx="3" fill="url(#pStoneW)" stroke="#4A3D2A" stroke-width="1.6"/><rect x="524" y="166" width="68" height="68" fill="url(#gBronze)" stroke="#5A2A10" stroke-width="1.2"/></g>${horn(526,168)}${horn(590,168)}${horn(526,232)}${horn(590,232)}<rect x="532" y="174" width="52" height="52" fill="#2A1A14"/><circle cx="558" cy="200" r="28" fill="url(#gFire)"/>${flame(550,206,1.6)}${flame(566,204,1.4)}${flame(558,196,1.8)}${smoke(558,170,46)}
<g filter="url(#fSh)"><circle cx="500" cy="312" r="30" fill="url(#gBronze)" stroke="#4A2008" stroke-width="1.5"/><circle cx="500" cy="312" r="22" fill="url(#gWater)" stroke="#6B3316" stroke-width="2"/><path d="M488 310q6 -4 12 0t12 0M490 318q5 -3 10 0t10 0" stroke="#fff" stroke-opacity=".6" fill="none"/></g>${ox}
${stands}${person(470,372,22)}${scaleBar(52,372,5,10,'10 cubits \u2248 '+m1(10))}${compass(630,34)}<g font-size="11" fill="#E9DFC4" opacity=".7"><text x="52" y="342">West</text><text x="638" y="342" text-anchor="end">East \u203A</text></g>`};

/* ---------- Noah's ark ---------- */
draw.ark=p=>{const r=rng(21);let rain='',stars='';for(let i=0;i<46;i++){const x=r()*640,y=r()*330;rain+=`<path d="M${f1(x)} ${f1(y)}l-5 14" stroke="#CFE0FF" stroke-opacity=".22" stroke-width="1"/>`}
 for(let i=0;i<30;i++)stars+=`<circle cx="${f1(r()*640)}" cy="${f1(r()*110)}" r="${f1(.5+r()*.9)}" fill="#fff" opacity=".6"/>`;
 const parts=[[0,136,192,['\u{1F981}','\u{1F985}','\u{1F407}','\u{1F54A}\uFE0F','\u{1F989}','\u{1F99C}']],[1,198,256,['\u{1F404}','\u{1F40E}','\u{1F411}','\u{1F992}','\u{1F42A}','\u{1F416}']],[2,262,312,['\u{1F418}','\u{1F98F}','\u{1F43B}','\u{1F42F}','\u{1F993}','\u{1F434}']]];
 let rooms='';parts.forEach(([,y0,y1,em])=>{rooms+=`<rect x="182" y="${y1-8}" width="276" height="8" fill="#D9B35E" opacity=".75"/>`;for(let i=0;i<6;i++){const x=182+i*46;rooms+=`<path d="M${x} ${y0}V${y1}" stroke="#5A3D20" stroke-width="3"/><text x="${x+23}" y="${y1-12}" text-anchor="middle" font-size="${y0>250?20:17}">${em[i]}</text>`}});
 return `<rect width="640" height="340" fill="url(#gSky)"/>${stars}${rain}
<g transform="translate(0 8)"><g filter="url(#fSh)"><path d="M62 40H578L560 74Q552 84 534 84H106Q88 84 80 74Z" fill="url(#pPlank)" stroke="#3A2412" stroke-width="2"/><path d="M96 40V30L116 24H524L544 30V40Z" fill="url(#pPlank)" stroke="#3A2412" stroke-width="1.6"/></g><path d="M80 74Q88 84 106 84H534Q552 84 560 74" fill="none" stroke="#1D130A" stroke-width="4.5"/><rect x="300" y="29" width="40" height="5" rx="1" fill="#FFE9A6"/><path d="M62 40H578" stroke="#E5C791" stroke-opacity=".5" stroke-width="1.2"/>
<path d="M70 94h500M70 88v12M570 88v12M590 34v44M584 34h12M584 78h12" fill="none" stroke="#C9CDE6" stroke-width="1.2" stroke-opacity=".8"/></g>
<circle cx="320" cy="170" r="110" fill="url(#gGlow)" opacity=".18"/>
<g filter="url(#fSh)"><path d="M170 130V282Q170 320 210 320H430Q470 320 470 282V130Z" fill="url(#pPlank)" stroke="#3A2412" stroke-width="3"/></g>
<rect x="182" y="136" width="276" height="176" fill="#3B2713"/><rect x="182" y="136" width="276" height="176" fill="url(#pDark)" opacity=".5"/>
<rect x="182" y="192" width="276" height="6" fill="url(#gWood)"/><rect x="182" y="256" width="276" height="6" fill="url(#gWood)"/>${rooms}
<circle cx="320" cy="160" r="46" fill="url(#gGlow)" opacity=".5"/>
<path d="M160 132L320 112L480 132Z" fill="url(#pPlank)" stroke="#3A2412" stroke-width="2.4"/><rect x="300" y="123" width="40" height="5" rx="1" fill="#FFE9A6"/><circle cx="320" cy="125" r="18" fill="url(#gGlow)" opacity=".7"/>
<rect x="466" y="262" width="10" height="44" rx="2" fill="#2A170B"/><path d="M476 306L526 324H468Z" fill="url(#gWood)" stroke="#3A2412" stroke-width="1.4"/><path d="M482 309l26 10M490 311l18 9" stroke="#3A2412" stroke-width=".8"/>
<text x="480" y="124" font-size="11" fill="#C9CDE6" opacity=".8">cross-section</text>
${person(158,320,23)}${scaleBar(24,332,6,10,'10 cubits \u2248 '+m1(10))}`};

/* ---------- The New Jerusalem ---------- */
const GEM=['#7FB069','#2F4FA8','#6FB7C9','#1F9A5B','#B4543A','#C0392B','#D6C24A','#5FC1A4','#E8B93A','#7CC96B','#E07A2E','#8A4FC2'];
draw.new=p=>{const X0=170,Y0=150,S=300,r=rng(31);let st='';for(let i=0;i<90;i++)st+=`<circle cx="${f1(r()*640)}" cy="${f1(r()*560)}" r="${f1(.5+r()*1.1)}" fill="#fff" opacity="${f1(.25+r()*.5)}"/>`;
 let wall='',streets='';const seg=(k)=>{const side=k/3|0,o=k%3,t0=o*100,x1=[X0+t0,X0+S,X0+S-t0,X0][side],y1=[Y0,Y0+t0,Y0+S,Y0+S-t0][side],x2=[X0+t0+100,X0+S,X0+S-t0-100,X0][side],y2=[Y0,Y0+t0+100,Y0+S,Y0+S-t0-100][side];return[x1,y1,x2,y2]};
 for(let k=0;k<12;k++){const[a,b,c,d]=seg(k);wall+=`<path d="M${a} ${b}L${c} ${d}" stroke="${GEM[k]}" stroke-width="15" stroke-linecap="butt"/><path d="M${a} ${b}L${c} ${d}" stroke="#fff" stroke-opacity=".38" stroke-width="3.5"/>`}
 for(let i=1;i<6;i++){streets+=`<path d="M${X0+i*50} ${Y0}V${Y0+S}M${X0} ${Y0+i*50}H${X0+S}" stroke="#FFF6CC" stroke-opacity=".28" stroke-width="2.2"/>`}
 let rays='';for(let i=0;i<16;i++){const a=i*Math.PI/8;rays+=`<path d="M320 300L${f1(320+Math.cos(a)*130)} ${f1(300+Math.sin(a)*130)}" stroke="#FFF4C2" stroke-opacity=".22" stroke-width="3"/>`}
 let trees='';[372,392,412].forEach((y,i)=>{[-16,16].forEach(dx=>{trees+=`<rect x="${320+dx-1}" y="${y+1}" width="2" height="6" fill="#5A3A1A"/><circle cx="${320+dx}" cy="${y-2}" r="7.5" fill="url(#gTree)" stroke="#2E4A22" stroke-width=".8"/>`})});
 const pearls=p.pts.slice(0,12).map(q=>`<circle cx="${q.x}" cy="${q.y}" r="17.5" fill="#FFF4C2" opacity=".6" filter="url(#fBlur)"/><circle cx="${q.x}" cy="${q.y}" r="16" fill="url(#gPearl)" stroke="#E7C6D4" stroke-width="1.2"/>`).join('');
 return `<rect width="640" height="560" fill="url(#gSpace)"/>${st}<circle cx="320" cy="300" r="280" fill="url(#gGlow)" opacity=".28"/>
<g filter="url(#fSh)"><rect x="${X0}" y="${Y0}" width="${S}" height="${S}" fill="url(#gGold)"/></g><rect x="${X0}" y="${Y0}" width="${S}" height="${S}" fill="url(#gShine)"/>${streets}
<rect x="${X0+10}" y="${Y0+10}" width="${S-20}" height="${S-20}" fill="none" stroke="#FFF6CC" stroke-opacity=".4" stroke-width="1.2" stroke-dasharray="4 5"/>
<circle cx="320" cy="300" r="120" fill="url(#gGlow)"/>${rays}${wall}
<rect x="${X0-7.5}" y="${Y0-7.5}" width="${S+15}" height="${S+15}" fill="none" stroke="#FFF2B0" stroke-width="1.2" stroke-opacity=".8"/>
<path d="M320 352C304 376 336 396 320 428" fill="none" stroke="#7FC4F0" stroke-width="9" stroke-linecap="round" opacity=".85"/><path d="M320 352C304 376 336 396 320 428" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>${trees}
${pearls}<text x="${X0+S/2}" y="${Y0+S/2-40}" text-anchor="middle" font-size="12" letter-spacing=".14em" fill="#5A3E0A" opacity=".8">THE LORD IS THERE</text>${compass(560,60)}`};

/* ---------- key facts (chips under the intro) and token helpers ---------- */
const facts={
 neh:['Work starts and ends at the Sheep Gate','Valley Gate to Dung Gate: {{c:1000}}','Finished in 52 days (Nehemiah 6:15)'],
 tab:['Court: {{c:100}} \u00D7 {{c:50}}','Gate: {{c:20}} wide','The Most Holy Place is a {{c:10}} cube'],
 camp:['603,550 men counted (Numbers 2:32)','Four divisions of three tribes','Judah marches first (Numbers 2:9)'],
 tem:['House: {{c:60}} \u00D7 {{c:20}} \u00D7 {{c:30}}','Most Holy Place: a {{c:20}} cube','Pillars: {{c:18}} high each','Built over seven years (1 Kings 6:38)'],
 ark:['Length: {{c:300}}','Width {{c:50}} \u00B7 height {{c:30}}','Three decks and one door','Rain for forty days (Genesis 7:12)'],
 new:['Each side: {{k:12000}}','Wall: {{c:144}}','Twelve gates, twelve foundations','No temple, no night']};
window.PLNART={defs:DEFS,draw,facts};
})();
