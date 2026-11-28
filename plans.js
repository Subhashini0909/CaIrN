/* Plans (Study > Plans): interactive schematics for places the Bible describes in detail.
   Jerusalem's wall in Nehemiah 3, the Tabernacle, the camp of Israel, Solomon's temple, Noah's ark and the New Jerusalem.
   Tap a numbered point (or use the arrow keys) to read what the passage says there and jump to the verse.
   Everything is drawn from the data below, so a new plan is one more entry in PLANS. Layouts are schematic, not to scale;
   where the text gives a size, it is shown in cubits with a modern equivalent (needs units.js; works without it).
   Needs app.js (S, BIB, esc, render, save, tab) and names.js (NM). */
(()=>{
const NM=window.NM;
const BK=n=>BIB.findIndex(b=>b[0]===n);
const refTxt=r=>`${r[0]} ${r[1]}${r[2]?':'+r[2]+(r[3]&&r[3]!==r[2]?'\u2013'+r[3]:''):''}`;
const say=(n,u)=>window.UNITS?window.UNITS.say(n,u):`${n} ${u}${n==1?'':'s'}`;
const short=(n,u)=>window.UNITS?window.UNITS.short(n,u):`${n} ${u}s`;
const fill=t=>String(t).replace(/\{\{(s:|c:|k:)?([\d.,]+)\}\}/g,(m,s,n)=>{n=+String(n).replace(/,/g,'');return s==='c:'?short(n,'cubit'):s==='k:'?short(n,'stadion'):say(n,s?'stadion':'cubit')});
const ART=window.PLNART||{defs:'',draw:{},facts:{}},DEFS=ART.defs;
const compass=(x,y)=>`<g class="pl-comp" transform="translate(${x} ${y})"><text y="-6" text-anchor="middle">N</text><path d="M0 2v28M-5 9 0 2 5 9"/></g>`;

/* ---------- 1. Jerusalem's wall (Nehemiah 3) ---------- */
const NEH={id:'neh',ico:'\u{1F9F1}',t:'Jerusalem\u2019s wall',sub:'Nehemiah 3',k:'Side of the city',vb:[580,410],
 refs:[['Nehemiah',2,3],['Nehemiah',12,12]],
 intro:'Forty-odd work groups rebuilt the wall in one chapter. Work moves counterclockwise from the Sheep Gate, the order the chapter follows.',
 foot:'Schematic, not to scale. Scholars still debate where some gates stood, so treat the positions as a guide to the order of the chapter.',
 draw:`<polygon class="pl-wall" points="288,38 422,39 426,125 434,190 415,250 381,330 325,379 307,376 233,280 175,222 153,182 150,140 156,130 177,90 211,60 237,47"/>
<rect class="pl-temple" x="345" y="66" width="70" height="58" rx="3"/><text class="pl-t" x="380" y="99" text-anchor="middle">Temple</text>
<text class="pl-area" x="296" y="254" text-anchor="middle">City of David</text>${compass(530,34)}`,
 pts:[
 {n:'Sheep Gate',x:382,y:39,l:[396,20,'middle'],r:['Nehemiah',3,1],s:'north-east',d:'Eliashib the high priest and his fellow priests began the whole work here. They rebuilt the gate, set it apart for God, hung its doors, and carried on to the Tower of the Hundred and the Tower of Hananel.'},
 {n:'Fish Gate',x:306,y:39,l:[296,20,'middle'],r:['Nehemiah',3,3],s:'north',d:'The sons of Hassenaah rebuilt it, laying its beams and fitting the doors, bolts and bars.'},
 {n:'Old Gate',x:229,y:53,l:[211,57,'end'],r:['Nehemiah',3,6],s:'north-west',d:'Joiada son of Paseah and Meshullam son of Besodeiah repaired this gate and set up its doors, bolts and bars.'},
 {n:'Broad Wall',x:181,y:87,l:[163,91,'end'],r:['Nehemiah',3,8],s:'north-west',d:'Uzziel, a goldsmith, and Hananiah, one of the perfumers, repaired their section, restoring Jerusalem as far as the Broad Wall.'},
 {n:'Valley Gate',x:152,y:158,l:[134,162,'end'],r:['Nehemiah',3,13],s:'west',d:'Hanun and the people of Zanoah repaired the gate, then added {{1000}} of wall, all the way to the Dung Gate.'},
 {n:'Dung Gate',x:184,y:226,l:[166,230,'end'],r:['Nehemiah',3,14],s:'south-west',d:'Malchijah son of Rechab, ruler of the district of Beth-haccherem, repaired it and set up its doors, bolts and bars.'},
 {n:'Fountain Gate',x:303,y:376,l:[285,381,'end'],r:['Nehemiah',3,15],s:'south',d:'Shallun son of Col-hozeh, ruler of the district of Mizpah, rebuilt it, roofed it and hung its doors. He also repaired the wall by the Pool of Shelah and the king\u2019s garden, as far as the stairs going down from the City of David.'},
 {n:'Water Gate',x:393,y:299,l:[411,303,'start'],r:['Nehemiah',3,26],s:'south-east',d:'The temple servants who lived on Ophel repaired the wall up to the point opposite the Water Gate on the east, and the tower that juts out.'},
 {n:'Horse Gate',x:432,y:190,l:[450,194,'start'],r:['Nehemiah',3,28],s:'east',d:'Above the Horse Gate the priests made repairs, each one opposite his own house.'},
 {n:'East Gate',x:427,y:125,l:[445,129,'start'],r:['Nehemiah',3,29],s:'east',d:'Zadok son of Immer repaired the stretch opposite his own house, and after him Shemaiah son of Shecaniah, keeper of the East Gate.'},
 {n:'Inspection Gate',x:423,y:72,l:[441,76,'start'],r:['Nehemiah',3,31,32],s:'north-east',d:'Malchijah, one of the goldsmiths, repaired as far as the house of the temple servants and the merchants, opposite the Inspection Gate, up to the upper room at the corner. Goldsmiths and merchants finished the stretch back to the Sheep Gate, closing the circle where it began.'}
 ]};

/* ---------- 2. The Tabernacle (Exodus 25\u201340) ---------- */
const TAB={id:'tab',ico:'\u26FA',t:'The Tabernacle',sub:'Exodus 25\u201340',k:'Where',vb:[10,20,650,320],dense:1,
 refs:[['Exodus',25,31],['Exodus',35,40]],
 intro:'A worshipper walked in from the east gate toward the ark. Each point is in the order he would meet it.',
 foot:'Schematic, not to scale. The text gives sizes for the court, the tent and most furniture; where it is silent (for example the exact place of the basin), the position is the usual reading.',
 draw:`<rect class="pl-fillrect" x="30" y="40" width="530" height="280"/><path class="pl-court" d="M560 128V40H30v280h530V232"/>
<line class="pl-gate" x1="560" y1="128" x2="560" y2="232"/>
<rect class="pl-tent" x="70" y="135" width="220" height="90" rx="2"/><line class="pl-veil" x1="140" y1="135" x2="140" y2="225"/>
<rect class="pl-ark" x="88" y="168" width="24" height="24" rx="2"/>
<rect class="pl-gold" x="150" y="171" width="20" height="18" rx="2"/>
<rect class="pl-tbl" x="200" y="143" width="52" height="18" rx="2"/>
<path class="pl-lamp" d="M226 190v24M212 196v7a14 14 0 0 0 28 0v-7"/>
<circle class="pl-basin" cx="350" cy="180" r="14"/>
<rect class="pl-altar" x="415" y="155" width="50" height="50" rx="2"/>
<text class="pl-t" x="548" y="338" text-anchor="end">East \u203A</text><text class="pl-t" x="42" y="338">West</text>${compass(630,40)}`,
 pts:[
 {n:'Gate of the court',x:560,y:180,l:[584,176,'start','Gate of\nthe court'],r:['Exodus',27,16],s:'east side of the court',d:'The entrance to the court was a {{20}} wide screen of blue, purple and scarlet yarn and fine twisted linen. The whole court was {{100}} long and {{50}} wide, enclosed by linen hangings.',m:[['Exodus',27,9,'Court hangings']]},
 {n:'Altar of burnt offering',x:440,y:180,l:[440,232,'middle','Altar of burnt\noffering'],r:['Exodus',27,1,8],s:'in the court, in front of the tent',d:'A hollow box of acacia wood overlaid with bronze, {{5}} square and {{3}} high, with a horn on each corner and poles to carry it. The first thing a worshipper met on the way in.',m:[['Exodus',40,6,'Where it was set'],['Exodus',38,1,'Built']]},
 {n:'Bronze basin',x:350,y:180,l:[350,214,'middle'],r:['Exodus',30,17,21],s:'between the altar and the tent',d:'Made of bronze, with a bronze stand, and filled with water. Aaron and his sons washed their hands and feet there before they entered the tent or came to the altar.',m:[['Exodus',38,8,'Made from mirrors']]},
 {n:'Entrance to the tent',x:290,y:180,l:[310,252,'middle','Entrance\nto the tent'],lead:[290,200,310,238],r:['Exodus',26,36,37],s:'east end of the tent',d:'A screen of blue, purple and scarlet yarn and fine twisted linen hung on five acacia pillars overlaid with gold, set in bronze bases.'},
 {n:'Table of the bread of the Presence',x:226,y:152,l:[300,104,'middle','Table of the\nbread of the Presence'],lead:[232,142,280,116],r:['Exodus',25,23,30],s:'Holy Place, north side',d:'An acacia table overlaid with gold, {{2}} long, {{1}} wide and {{1.5}} high. Bread was set on it before the Lord all the time.',m:[['Exodus',26,35,'Its place'],['Leviticus',24,5,'The bread']]},
 {n:'Golden lampstand',x:226,y:208,l:[200,266,'middle','Golden\nlampstand'],lead:[222,221,205,254],r:['Exodus',25,31,40],s:'Holy Place, south side',d:'Beaten out of one piece of pure gold: a central shaft with three branches on each side, seven lamps in all. It stood opposite the table.',m:[['Exodus',26,35,'Its place']]},
 {n:'Altar of incense',x:160,y:180,l:[156,104,'middle','Altar of\nincense'],lead:[160,168,157,120],r:['Exodus',30,1,10],s:'Holy Place, before the veil',d:'A small altar of acacia overlaid with gold, {{1}} square and {{2}} high, with horns on its corners. Aaron burned fragrant incense on it every morning and evening.',m:[['Exodus',40,26,'Set before the veil']]},
 {n:'The veil',x:140,y:180,l:[132,266,'middle','The\nveil'],lead:[140,197,134,254],r:['Exodus',26,31,33],s:'between the Holy Place and the Most Holy Place',d:'A curtain of blue, purple and scarlet yarn and fine twisted linen, with cherubim worked into it, hung on four gold-covered pillars on silver bases. It divided the Holy Place from the Most Holy Place.'},
 {n:'Ark of the covenant',x:100,y:180,l:[62,104,'middle','Ark of the\ncovenant'],lead:[100,169,70,120],r:['Exodus',25,10,22],s:'Most Holy Place',d:'An acacia chest overlaid with gold, {{2.5}} long, {{1.5}} wide and {{1.5}} high, holding the tablets of the testimony. Its gold cover, the mercy seat, had a cherub at each end with wings spread above it. God said he would speak with Moses from there.',m:[['Exodus',40,20,'Placed in the tabernacle']]}
 ]};

/* ---------- 3. The camp of Israel (Numbers 2\u20133) ---------- */
const CAMP=(()=>{
 const W=104,H=44;
 const T=[ // name, cx, cy, side, leader, count, division
  ['Judah',540,280,'East','Nahshon son of Amminadab',74600],['Issachar',540,224,'East','Nethanel son of Zuar',54400],['Zebulun',540,336,'East','Eliab son of Helon',57400],
  ['Reuben',320,500,'South','Elizur son of Shedeur',46500],['Simeon',212,500,'South','Shelumiel son of Zurishaddai',59300],['Gad',428,500,'South','Eliasaph',45650],
  ['Ephraim',100,280,'West','Elishama son of Ammihud',40500],['Manasseh',100,224,'West','Gamaliel son of Pedahzur',32200],['Benjamin',100,336,'West','Abidan son of Gideoni',35400],
  ['Dan',320,60,'North','Ahiezer son of Ammishaddai',62700],['Asher',212,60,'North','Pagiel son of Ochran',41500],['Naphtali',428,60,'North','Ahira son of Enan',53400]];
 const ref={Judah:[3,9],Issachar:[5,6],Zebulun:[7,8],Reuben:[10,11],Simeon:[12,13],Gad:[14,15],Ephraim:[18,19],Manasseh:[20,21],Benjamin:[22,23],Dan:[25,26],Asher:[27,28],Naphtali:[29,30]};
 const tot={East:'Judah\u2019s division numbered 186,400 in all and set out first.',South:'Reuben\u2019s division numbered 151,450 in all and set out second.',West:'Ephraim\u2019s division numbered 108,100 in all and set out third.',North:'Dan\u2019s division numbered 157,600 in all and set out last.'};
 const fmt=n=>n.toLocaleString('en-US');
 const lev=[ // name, cx, cy, w, side, ref, text
  ['Moses, Aaron and his sons',421,280,130,'East',[3,38],'Camped on the east, in front of the tent toward the sunrise, and took charge of the duties of the sanctuary for Israel.'],
  ['Kohathites',320,340,96,'South',[3,29,32],'Camped on the south side of the tabernacle under Elizaphan son of Uzziel. They cared for the ark, the table, the lampstand, the altars and the other sacred things.'],
  ['Gershonites',232,280,96,'West',[3,23,26],'Camped behind the tabernacle, on the west, under Eliasaph son of Lael. They cared for the tabernacle itself, its tent and coverings, and the hangings of the court.'],
  ['Merarites',320,220,96,'North',[3,33,37],'Camped on the north side under Zuriel son of Abihail. They cared for the frames, crossbars, pillars and bases of the tabernacle.']];
 let draw='<rect class="pl-camp" x="12" y="12" width="616" height="536" rx="14"/><rect class="pl-tent" x="292" y="262" width="56" height="36" rx="3"/>',pts=[];
 pts.push({n:'The tabernacle',x:320,y:280,l:[320,284,'middle','Tent of\nmeeting'],r:['Numbers',2,2,17],s:'Centre',d:'The tent of meeting stood in the middle, with the Levites around it and the twelve tribes outside them, each under its own standard, facing the tent. On the march the tent set out between the divisions, in the same order as the camp.',nolab:1});
 // order: tabernacle, then East (Moses, Judah, Issachar, Zebulun), South, West, North
 const L=n=>lev.find(x=>x[0]===n||x[0].startsWith(n)),tr=n=>T.find(x=>x[0]===n);
 const seq=[['E',['Moses','Judah','Issachar','Zebulun']],['S',['Kohathites','Reuben','Simeon','Gad']],['W',['Gershonites','Ephraim','Manasseh','Benjamin']],['N',['Merarites','Dan','Asher','Naphtali']]];
 seq.forEach(([,names])=>names.forEach(nm=>{
  const lv=L(nm);
  if(lv){const[n,cx,cy,w,side,r,t]=lv;const two=n.length>16;draw+=`<rect class="pl-lev" x="${cx-w/2}" y="${cy-17}" width="${w}" height="34" rx="17"/>`;
   pts.push({n,x:cx-w/2+18,y:cy,l:[cx-w/2+36,cy+(two?-2:4),'start',two?'Moses, Aaron\nand sons':n],r:['Numbers',...r],s:side+' of the tabernacle',d:t,lev:1})}
  else{const[n,cx,cy,side,who,ct]=tr(nm);draw+=`<rect class="pl-tribe" x="${cx-W/2}" y="${cy-H/2}" width="${W}" height="${H}" rx="8"/>`;
   pts.push({n,x:cx-W/2+17,y:cy,l:[cx-W/2+36,cy+4,'start'],r:['Numbers',2,...ref[n]],s:side+' side of the camp',d:`${n} camped on the ${side.toLowerCase()} side with ${who} as leader. The tribe numbered ${fmt(ct)}. ${tot[side]}`})}
 }));
 draw+=`<text class="pl-area" x="320" y="150" text-anchor="middle">North</text><text class="pl-area" x="320" y="440" text-anchor="middle">South</text>${compass(596,40)}`;
 return{T,lev,W,H,id:'camp',ico:'\u26FA',t:'The camp of Israel',sub:'Numbers 2\u20133',k:'Position',vb:[640,560],dense:1,refs:[['Numbers',1,4],['Numbers',10,10]],
  intro:'Four divisions of three tribes camped on the four sides of the tent, with the Levites between them and the tabernacle. Points run east, south, west, north.',
  foot:'Schematic, not to scale. Numbers 2 names each side\u2019s lead tribe and the two that camped beside it; the arrangement inside each block is simplified here.',draw,pts};
})();

/* ---------- 4. Solomon's temple (1 Kings 6\u20137) ---------- */
const TEM={id:'tem',ico:'\u{1F3DB}\uFE0F',t:'Solomon\u2019s temple',sub:'1 Kings 6\u20137',k:'Where',vb:[680,400],dense:1,
 refs:[['1 Kings',5,8],['2 Chronicles',2,4]],
 intro:'The house itself was {{60}} long, {{20}} wide and {{30}} high. Points run from the court inward to the Most Holy Place.',
 foot:'Schematic, not to scale. The sizes and furnishings come from 1 Kings 6\u20137 and 2 Chronicles 3\u20134; the court layout is simplified, and the text puts the sea and the ten stands on the south (right) and north (left) sides.',
 draw:`<rect class="pl-fillrect" x="40" y="48" width="610" height="304"/><rect class="pl-court" x="40" y="48" width="610" height="304" fill="none"/>
<rect class="pl-cham" x="88" y="120" width="332" height="160" rx="2"/><rect class="pl-tent" x="100" y="150" width="350" height="100" rx="2"/>
<line class="pl-veil" x1="200" y1="150" x2="200" y2="250"/><line class="pl-veil" x1="400" y1="150" x2="400" y2="250"/>
<rect class="pl-gold" x="124" y="190" width="52" height="28" rx="2"/><path class="pl-lamp" d="M236 164h110M236 236h110"/>
<circle class="pl-basin" cx="452" cy="170" r="9"/><circle class="pl-basin" cx="452" cy="230" r="9"/>
<rect class="pl-altar" x="520" y="162" width="76" height="76" rx="3"/><circle class="pl-sea" cx="500" cy="312" r="26"/>
<g class="pl-stand">${[0,1,2,3,4].map(i=>`<rect x="${206+i*42}" y="70" width="26" height="22" rx="2"/><rect x="${206+i*42}" y="308" width="26" height="22" rx="2"/>`).join('')}</g>
<text class="pl-t" x="52" y="344">West</text><text class="pl-t" x="638" y="344" text-anchor="end">East \u203A</text>${compass(630,34)}`,
 pts:[
 {n:'Altar of bronze',x:558,y:200,l:[558,254,'middle','Altar of\nbronze'],r:['2 Chronicles',4,1],s:'the court, east of the house',d:'A bronze altar {{20}} long, {{20}} wide and {{10}} high stood in front of the house for the burnt offerings.'},
 {n:'The bronze Sea',x:500,y:312,l:[536,314,'start','Bronze\nSea'],r:['1 Kings',7,23,26],s:'south-east corner of the house',d:'A huge round basin of cast bronze, {{10}} across and {{5}} high, resting on twelve bronze oxen in four groups of three. It held about two thousand baths of water. The text sets it on the south side, toward the east.',m:[['1 Kings',7,39,'Its place']]},
 {n:'The ten stands',x:303,y:81,l:[303,36,'middle','Ten bronze stands and basins'],lead:[303,70,303,42],r:['1 Kings',7,27,39],s:'five on each side of the house',d:'Ten wheeled bronze stands, each carrying a basin that held forty baths. Five stood on the south side of the house and five on the north.',m:[['1 Kings',7,38,'The basins']]},
 {n:'Jachin and Boaz',x:452,y:200,l:[468,197,'start','Jachin\nand Boaz'],r:['1 Kings',7,15,22],s:'the porch',d:'Two bronze pillars, each {{18}} high, stood at the porch. The one on the right (south) was named Jachin and the one on the left (north) Boaz. Each was topped with a decorated capital.'},
 {n:'The porch',x:425,y:200,l:[425,300,'middle'],lead:[425,212,425,288],r:['1 Kings',6,3],s:'east end of the house',d:'The porch in front of the main hall was {{20}} long, matching the width of the house, and {{10}} deep.'},
 {n:'The main hall',x:300,y:196,l:[300,224,'middle','Main hall'],r:['1 Kings',6,17,18],s:'the middle of the house',d:'The main room was {{40}} long, lined with cedar carved with gourds and open flowers, with no stone showing. It was overlaid with gold, and held the golden altar, the table for the bread of the Presence and ten golden lampstands, five on each side.',m:[['1 Kings',7,48,'Its furnishings']]},
 {n:'The inner sanctuary',x:150,y:164,l:[150,96,'middle','Inner\nsanctuary'],lead:[150,152,150,114],r:['1 Kings',6,19,20],s:'west end of the house',d:'The Most Holy Place was a cube, {{20}} long, wide and high, overlaid with pure gold. It was prepared to hold the ark of the covenant of the Lord.'},
 {n:'Cherubim and ark',x:150,y:204,l:[150,300,'middle','Cherubim\nand ark'],lead:[150,216,150,288],r:['1 Kings',6,23,28],s:'inside the inner sanctuary',d:'Two cherubim of olive wood overlaid with gold, each {{10}} high, with wings spread so that they touched in the middle and reached the walls. The priests later brought the ark in beneath their wings.',m:[['1 Kings',8,6,'The ark brought in']]},
 {n:'Side chambers',x:300,y:135,l:[300,111,'middle','Side chambers'],r:['1 Kings',6,5,10],s:'around the house, three storeys',d:'Rooms in three storeys were built against the outer wall of the house, getting wider as they rose (the lowest {{5}} wide, the next {{6}}, the top {{7}}), so that no beams were set into the temple wall itself. The way up was by a stair on the south side.',m:[['1 Kings',6,8,'The stair']]}
 ]};

/* ---------- 5. Noah's ark (Genesis 6\u20138) ---------- */
const ARK={id:'ark',ico:'\u{1F6A2}',t:'Noah\u2019s ark',sub:'Genesis 6\u20138',k:'Part',vb:[640,340],
 refs:[['Genesis',6,8]],
 intro:'God gave Noah the size and the plan. The long strip shows the length; the cross-section shows the decks.',
 foot:'Schematic, not to scale. Genesis gives the three measurements, the three decks, the door and the pitch; it does not describe the shape of the hull.',
 draw:`<rect class="pl-hull" x="70" y="34" width="500" height="44" rx="14"/>
<path class="pl-dim" d="M70 94h500M70 88v12M570 88v12M590 34v44M584 34h12M584 78h12"/>
<rect class="pl-fillrect" x="170" y="130" width="300" height="190"/>
<path class="pl-hull2" d="M170 130v150q0 40 40 40h220q40 0 40-40V130z"/>
<line class="pl-deck" x1="170" y1="192" x2="470" y2="192"/><line class="pl-deck" x1="170" y1="256" x2="470" y2="256"/>
<path class="pl-roof" d="M164 130h312"/><rect class="pl-door" x="466" y="262" width="10" height="44" rx="2"/>
<text class="pl-t" x="320" y="112" text-anchor="middle">cross-section</text>`,
 pts:[
 {n:'Gopher wood, rooms and pitch',x:170,y:290,l:[148,294,'end','Gopher wood,\nrooms, pitch'],r:['Genesis',6,14],s:'the whole hull',d:'Noah was to build the ark of gopher wood, make rooms in it, and cover it with pitch inside and out. \u201CGopher\u201D appears only here, so the exact wood is unknown.'},
 {n:'The size',x:320,y:56,l:[320,24,'middle','300 \u00D7 50 \u00D7 30 cubits'],r:['Genesis',6,15],s:'length, width and height',d:'The ark was to be {{300}} long, {{50}} wide and {{30}} high.'},
 {n:'Roof or window',x:320,y:130,l:[342,134,'start','Roof or window'],r:['Genesis',6,16],s:'a cubit below the top',d:'The command is to make a window or roof (the Hebrew word is rare, so translations differ) and finish it within one cubit of the top, about {{1}}.'},
 {n:'The door',x:471,y:284,l:[490,288,'start','Door'],r:['Genesis',6,16],s:'in the side',d:'The door was to be set in the side of the ark. Once Noah and the animals were inside, the Lord shut him in.',m:[['Genesis',7,16,'The Lord shut him in']]},
 {n:'Third deck',x:260,y:161,l:[285,165,'start','Third deck'],r:['Genesis',6,16],s:'top level',d:'The ark was to have lower, second and third decks. Three floors of {{300}} by {{50}} give about 45,000 square cubits of floor in all, roughly 9,100 square metres at the common cubit.'},
 {n:'Second deck',x:260,y:224,l:[285,228,'start','Second deck'],r:['Genesis',6,16],s:'middle level',d:'The text does not say what each deck was used for. It does say that pairs of every kind of living creature were to come in with Noah, and that food was to be stored for them all.',m:[['Genesis',6,19,'The animals'],['Genesis',6,21,'The food']]},
 {n:'Lower deck',x:260,y:288,l:[285,292,'start','Lower deck'],r:['Genesis',6,16],s:'bottom level',d:'The first of the three decks. After the flood the ark came to rest on the mountains of Ararat.',m:[['Genesis',8,4,'Where it rested']]}
 ]};

/* ---------- 6. The New Jerusalem (Revelation 21; Ezekiel 48) ---------- */
const NEW=(()=>{
 const X0=170,Y0=150,S=300,G=[ // tribe, side, ordinal, born-ref
  ['Reuben','N',0,['Genesis',29,32],'Jacob\u2019s firstborn, a son of Leah.'],['Judah','N',1,['Genesis',29,35],'A son of Leah, and the tribe David and Jesus came from.'],['Levi','N',2,['Genesis',29,34],'A son of Leah; the priestly tribe.'],
  ['Joseph','E',0,['Genesis',30,22,24],'Rachel\u2019s firstborn, whose sons Ephraim and Manasseh became tribes in their own right.'],['Benjamin','E',1,['Genesis',35,16,18],'Rachel\u2019s youngest, born on the road to Ephrath.'],['Dan','E',2,['Genesis',30,5,6],'A son of Bilhah, Rachel\u2019s servant.'],
  ['Simeon','S',0,['Genesis',29,33],'Leah\u2019s second son.'],['Issachar','S',1,['Genesis',30,17,18],'Leah\u2019s fifth son.'],['Zebulun','S',2,['Genesis',30,19,20],'Leah\u2019s sixth son.'],
  ['Gad','W',0,['Genesis',30,10,11],'A son of Zilpah, Leah\u2019s servant.'],['Asher','W',1,['Genesis',30,12,13],'A son of Zilpah, Leah\u2019s servant.'],['Naphtali','W',2,['Genesis',30,7,8],'A son of Bilhah, Rachel\u2019s servant.']];
 const v={N:31,E:32,S:33,W:34},nm={N:'north',E:'east',S:'south',W:'west'};
 const pos=(s,o)=>{const t=S*(o+1)/4;return s==='N'?[X0+t,Y0]:s==='E'?[X0+S,Y0+t]:s==='S'?[X0+S-t,Y0+S]:[X0,Y0+S-t]};
 const lab=(s,x,y,t)=>s==='N'?[x,y-24,'middle']:s==='S'?[x,y+34,'middle']:s==='E'?[x+22,y+4,'start']:[x-22,y+4,'end'];
 const pts=G.map(([t,s,o,born,note])=>{const[x,y]=pos(s,o);return{n:t,x,y,l:lab(s,x,y,t),r:['Ezekiel',48,v[s]],s:'gate on the '+nm[s]+' side',d:`In Ezekiel\u2019s list the ${nm[s]} gate is named for ${t}. ${note} Revelation says the names of the twelve tribes of Israel are written on the gates, three facing each direction.`,m:[['Revelation',21,12,'Names on the gates'],['Genesis',born[1],born[2],'Birth of '+t]]}});
 pts.push({n:'Walls and foundations',x:X0+S,y:Y0+S,l:[X0+S+24,Y0+S+6,'start','Walls and\nfoundations'],r:['Revelation',21,14,20],s:'the wall and its twelve foundations',d:'The wall rests on twelve foundations that bear the names of the twelve apostles of the Lamb, each adorned with a different jewel. The angel measured the wall at {{144}}, and the city is a square {{s:12000}} on each side.',m:[['Revelation',21,16,'The measuring'],['Revelation',21,17,'The wall']]});
 pts.push({n:'God and the Lamb',x:X0+S/2,y:Y0+S/2,l:[X0+S/2,Y0+S/2+34,'middle','God and\nthe Lamb'],r:['Revelation',22,1,3],s:'the centre of the city',d:'There is no temple, because the Lord God and the Lamb are its temple, and no need of sun or moon, because the glory of God gives it light. The river of the water of life flows from the throne, and the gates are never shut.',m:[['Revelation',21,22,'No temple'],['Ezekiel',48,35,'The Lord is there']]});
 const draw=`<rect class="pl-city" x="${X0}" y="${Y0}" width="${S}" height="${S}"/><rect class="pl-city2" x="${X0+14}" y="${Y0+14}" width="${S-28}" height="${S-28}"/>
 <path class="pl-river" d="M${X0+S/2} ${Y0+S/2+56}v${S/2-80}"/>${compass(560,60)}<text class="pl-area" x="${X0+S/2}" y="${Y0+S/2-34}" text-anchor="middle">The Lord is there</text>`;
 return{id:'new',ico:'\u2728',t:'The New Jerusalem',sub:'Revelation 21 \u00B7 Ezekiel 48',k:'Gate',vb:[640,560],dense:1,refs:[['Revelation',21,22],['Ezekiel',48,48]],
  intro:'A square city with twelve gates, three on each side, each named for a tribe of Israel. Points run clockwise from the north-west.',
  foot:'Schematic, not to scale. Revelation 21 says the gates carry the tribes\u2019 names and face all four directions; the order shown follows Ezekiel 48:31\u201334, which is the passage that assigns each name to a side.',draw,pts};
})();

TAB.mr=8.5;TEM.mr=8.5;
const PLANS=[NEH,TAB,CAMP,TEM,ARK,NEW];
PLANS.forEach(p=>{if(ART.draw[p.id])p.draw=ART.draw[p.id](p);p.facts=ART.facts[p.id]||[];p.pts.forEach(q=>{q.b=BK(q.r[0]);(q.m||[]).forEach(m=>{m.b=BK(m[0])})})});

/* ---------- state ---------- */
const st=()=>{const s=S.st||(S.st={});const t=s.pl&&typeof s.pl==='object'?s.pl:(s.pl={});if(!PLANS.some(p=>p.id===t.id))t.id=PLANS[0].id;const p=PLANS.find(x=>x.id===t.id);t.i=Math.max(0,Math.min(Math.floor(+t.i)||0,p.pts.length-1));return t};
const cur=()=>PLANS.find(p=>p.id===st().id);
let FROM=null;
const here=()=>{const w=NM&&NM.cfg&&NM.cfg.where?NM.cfg.where():null;return w?[w[0],w[1]]:null};
const inch=(q,w)=>w&&q.b===w[0]&&q.r[1]===w[1];
const goBtn=(r,b,lbl)=>`<button class="pl-go${lbl?' pl-go2':''}" data-pl="go:${b}.${r[1]}.${r[2]||0}">${lbl?esc(lbl)+' \u00B7 '+esc(refTxt(r.slice(0,3))):'Open '+esc(refTxt(r))+' \u203A'}</button>`;

/* ---------- reader chip ---------- */
const forChapter=(b,c)=>PLANS.filter(p=>p.refs.some(([n,a,z])=>BK(n)===b&&c>=a&&c<=z));
function strip(b,c){const L=forChapter(b,c);if(!L.length)return '';
 return `<div class="bgstrip plstrip" aria-label="Plans for this chapter"><span class="bgh">Plan</span>${L.map(p=>`<button class="bgchip" data-sx="sub:plans" data-plp="${p.id}" aria-label="Open the plan: ${esc(p.t)}"><span aria-hidden="true">${p.ico}</span><span class="bgl">${esc(p.t)}</span><span class="bgw">${esc(p.sub)}</span></button>`).join('')}</div>`}

/* ---------- drawing ---------- */
const lines=t=>String(t).split('\n');
function marker(q,i,on,w,R){R=R||11.5;const c=inch(q,w);
 return `<g class="plm${on?' on':''}${c?' inch':''}" data-pl="pt:${i}" data-pt="${i}" tabindex="0" role="button" aria-pressed="${on}" aria-label="${i+1}. ${esc(q.n)}, ${esc(refTxt(q.r))}" transform="translate(${q.x} ${q.y})"><circle class="plm-h" r="${R+7.5}"/><circle class="plm-c" r="${R}"/><text class="plm-n" y="${(R*.36).toFixed(1)}" font-size="${R<10?10:12}" text-anchor="middle">${i+1}</text></g>`}
function label(q,i,on){if(!q.l||q.nolab)return '';const[x,y,a,t]=q.l,L=lines(fill(t||q.n));
 return `<text class="pll${on?' on':''}" data-pl="pt:${i}" data-pt="${i}" x="${x}" y="${y}" text-anchor="${a}">${L.map((s,j)=>`<tspan x="${x}" dy="${j?13.5:0}">${esc(s)}</tspan>`).join('')}</text>`}
function stage(p){const t=st(),w=here();
 return `<svg viewBox="${p.vb.length===4?p.vb.join(' '):'0 0 '+p.vb[0]+' '+p.vb[1]}" class="pl-svg" role="group" aria-label="${esc(p.t)}: ${p.pts.length} points. Tap a number to read about it.">${DEFS}${p.draw}${p.pts.map(q=>q.lead?`<line class="pl-lead" x1="${q.lead[0]}" y1="${q.lead[1]}" x2="${q.lead[2]}" y2="${q.lead[3]}"/>`:'').join('')}${p.pts.map((q,i)=>label(q,i,i===t.i)).join('')}${p.pts.map((q,i)=>marker(q,i,i===t.i,w,p.mr)).join('')}</svg>`}
function side(){const p=cur(),t=st(),q=p.pts[t.i];
 return `<span class="pl-pill">${esc(refTxt(q.r))}</span><h3 class="pl-name">${esc(fill(q.n))}</h3><p class="pl-d">${esc(fill(q.d))}</p>${q.s?`<p class="pl-m"><span>${esc(p.k)}</span>${esc(q.s)}</p>`:''}<div class="pl-a">${goBtn(q.r,q.b)}${(q.m||[]).map(m=>goBtn(m,m.b,m[3])).join('')}</div>`}
function nav(){const p=cur(),t=st();return `<button class="g" data-pl="prev" aria-label="Previous point">\u2039 Previous</button><span class="pl-cnt">${t.i+1} / ${p.pts.length}</span><button class="g" data-pl="next" aria-label="Next point">Next \u203A</button>`}
function index(){const p=cur(),t=st(),w=here();
 return p.pts.map((q,i)=>`<button class="pl-ix${i===t.i?' on':''}${inch(q,w)?' inch':''}" data-pl="pt:${i}" data-pt="${i}"><b>${i+1}</b><span class="pl-ixn">${esc(fill(q.n))}</span><span class="pl-ixr">${esc(refTxt(q.r))}</span>${inch(q,w)?'<i class="pl-here">this chapter</i>':''}</button>`).join('')}

function view(){const p=cur(),t=st(),pb=FROM?`<button class="g s bgback" data-pl="back">\u2039 Back to ${esc(BIB[FROM[0]][0])} ${FROM[1]}</button>`:'';
 return `<div class="card plp${p.dense?' pl-dense':''}">${pb}<div class="plsw" role="tablist" aria-label="Plans">${PLANS.map(x=>`<button class="${x.id===p.id?'on':''}" role="tab" aria-selected="${x.id===p.id}" data-pl="plan:${x.id}"><span aria-hidden="true">${x.ico}</span><b>${esc(x.t)}</b><small>${esc(x.sub)}</small></button>`).join('')}</div>
<div class="pl-head"><h2>${esc(p.t)}</h2><p class="pl-intro">${esc(fill(p.intro))}</p>${p.facts.length?`<ul class="pl-facts">${p.facts.map(f=>`<li>${esc(fill(f))}</li>`).join('')}</ul>`:''}</div>
<div class="pl-grid"><div class="pl-stage">${stage(p)}</div><div class="pl-side"><div class="pld" aria-live="polite">${side()}</div><div class="pl-nav">${nav()}</div><p class="pl-foot">${esc(p.foot)}</p></div></div>
<div class="pl-index" role="list" aria-label="All points">${index()}</div><p class="pl-tip">Tap a number or its name. Arrow keys move between points.</p></div>`}

/* ---------- updates without redrawing (keeps keyboard focus) ---------- */
function paint(){const r=document.querySelector('.plp');if(!r){render();return}const t=st();
 r.querySelectorAll('[data-pt]').forEach(el=>{const on=+el.dataset.pt===t.i;el.classList.toggle('on',on);if(el.classList.contains('plm'))el.setAttribute('aria-pressed',on)});
 const d=r.querySelector('.pld');if(d){d.innerHTML=side();d.classList.remove('pl-in');void d.offsetWidth;d.classList.add('pl-in')}
 const n=r.querySelector('.pl-nav');if(n)n.innerHTML=nav()}
function pick(i){const p=cur(),t=st();t.i=(i+p.pts.length)%p.pts.length;save();paint()}

/* ---------- events ---------- */
document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('[data-sx="sub:plans"]');if(!c)return;
 const id=c.dataset.plp;if(id&&PLANS.some(p=>p.id===id)){const t=st();t.id=id;t.i=0;FROM=here();
  const w=FROM,p=cur(),k=w?p.pts.findIndex(q=>inch(q,w)):-1;if(k>=0)t.i=k}else FROM=null},true);
document.addEventListener('click',e=>{if(typeof tab==='undefined'||tab!=='study')return;const el=e.target.closest&&e.target.closest('[data-pl]');if(!el)return;
 const s=el.dataset.pl,a=s.split(':')[0],x=s.slice(s.indexOf(':')+1);e.preventDefault();
 if(a==='pt')pick(+x);else if(a==='prev')pick(st().i-1);else if(a==='next')pick(st().i+1);
 else if(a==='plan'){const t=st();if(t.id!==x){t.id=x;t.i=0;save();render()}}
 else if(a==='go'){const r=x.split('.').map(Number);NM.cfg.go&&NM.cfg.go(r[0],r[1],r[2]||0)}
 else if(a==='back'){if(FROM&&NM.cfg.go)NM.cfg.go(FROM[0],FROM[1],0)}});
document.addEventListener('keydown',e=>{if(typeof tab==='undefined'||tab!=='study')return;const r=e.target.closest&&e.target.closest('.plp');if(!r)return;
 const m=e.target.closest('.plm,.pl-ix');
 if(m&&(e.key==='Enter'||e.key===' ')){e.preventDefault();pick(+m.dataset.pt);return}
 if(!e.target.closest('.plm,.pl-ix,.pl-stage,.pl-side'))return;
 const k=e.key;if(k==='ArrowRight'||k==='ArrowDown'){e.preventDefault();pick(st().i+1);const n=r.querySelector(`.plm[data-pt="${st().i}"]`);n&&e.target.closest('.plm')&&n.focus()}
 else if(k==='ArrowLeft'||k==='ArrowUp'){e.preventDefault();pick(st().i-1);const n=r.querySelector(`.plm[data-pt="${st().i}"]`);n&&e.target.closest('.plm')&&n.focus()}});

window.PLN={view,strip,plans:PLANS,forChapter};
})();