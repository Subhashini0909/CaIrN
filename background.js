/* Background pages (Study > Background): festivals and calendar, coins, weights and measures, and customs.
   Each chapter in the reader shows small links to the pages that matter for it (found by looking for words like "shekel", "cubit",
   "Passover", "sackcloth" in the chapter). The page opens with the matching entries highlighted, and a button back to the chapter.
   Sizes and values are approximate: they varied by place and period, and scholars differ. Needs app.js (S, BIB, esc, render, save, tab) and names.js (NM). */
(()=>{
const NM=window.NM;
const BK=n=>BIB.findIndex(b=>b[0]===n);
// "Genesis 23:16" -> [0,23,16]
const R=s=>{const m=/^(.+) (\d+):(\d+)$/.exec(s);return m?[BK(m[1]),+m[2],+m[3]]:null};
const P={festivals:{ico:'\u{1F4C5}',t:'Festivals and calendar'},coins:{ico:'\u{1FA99}',t:'Coins and money'},measures:{ico:'⚖️',t:'Weights and measures'},customs:{ico:'\u{1F3FA}',t:'Customs'}};

// ---------- data: festivals and calendar ----------
// months: [number in the sacred year, name in the Bible, about, what happens]
const MONTHS=[
 [1,'Abib, later Nisan','March–April','Passover and Unleavened Bread. The Lord made this the first month of the year (Exodus 12:2).',/abib|nisan|first month/,['Exodus 12:2','Exodus 13:4','Nehemiah 2:1']],
 [2,'Zif (Ziv), later Iyyar','April–May','Solomon began to build the temple in this month (1 Kings 6:1).',/zif|second month/,['1 Kings 6:1']],
 [3,'Sivan','May–June','Wheat harvest and the Feast of Weeks (Pentecost) fall around now.',/sivan|third month/,['Esther 8:9']],
 [4,'(Tammuz)','June–July','Called only “the fourth month” in most of the Bible.',/fourth month/,['Zechariah 8:19']],
 [5,'(Av)','July–August','The month the temple was burned (Jeremiah 52:12–13); called “the fifth month”.',/fifth month/,['Jeremiah 52:12']],
 [6,'Elul','August–September','The wall of Jerusalem was finished on the 25th of Elul (Nehemiah 6:15).',/elul|sixth month/,['Nehemiah 6:15']],
 [7,'Ethanim, later Tishri','September–October','The busiest month for festivals: Trumpets, the Day of Atonement and Tabernacles.',/ethanim|tishri|seventh month/,['1 Kings 8:2','Leviticus 23:24']],
 [8,'Bul','October–November','Solomon finished the temple in this month (1 Kings 6:38).',/\bbul\b|eighth month/,['1 Kings 6:38']],
 [9,'Chisleu (Kislev)','November–December','Winter. The Feast of Dedication is on the 25th (John 10:22).',/chisleu|kislev|ninth month/,['Nehemiah 1:1','Zechariah 7:1']],
 [10,'Tebeth (Tevet)','December–January','Esther was taken to the king in this month (Esther 2:16).',/tebeth|tevet|tenth month/,['Esther 2:16']],
 [11,'Sebat (Shebat)','January–February','Zechariah’s night visions (Zechariah 1:7).',/sebat|shebat|eleventh month/,['Zechariah 1:7']],
 [12,'Adar','February–March','Purim is kept on the 14th and 15th (Esther 9:20–22).',/adar|twelfth month/,['Esther 3:7','Esther 9:21']]
];
// feasts: [name, when, what it is, terms, refs]
const FEASTS=[
 ['Sabbath','Every seventh day, sunset to sunset','A day of rest that remembers creation and the rescue from Egypt.',/sabbath/,['Leviticus 23:3','Exodus 20:8','Deuteronomy 5:15']],
 ['New Moon','First day of each month','Trumpets and extra offerings marked each new month.',/new moon/,['Numbers 28:11','2 Kings 4:23']],
 ['Passover','Evening of the 14th day of month 1','A lamb is eaten to remember the night God passed over Israel’s houses in Egypt.',/passover/,['Leviticus 23:5','Exodus 12:11','Luke 22:7']],
 ['Unleavened Bread','15th–21st of month 1','Seven days with no leaven. Passover and Unleavened Bread are often spoken of together.',/unleavened/,['Leviticus 23:6','Exodus 12:15','Luke 22:1']],
 ['Firstfruits','The day after the sabbath in that week','The first sheaf of the barley harvest is waved before the Lord.',/firstfruits?|first ?fruits/,['Leviticus 23:10','1 Corinthians 15:20']],
 ['Weeks (Pentecost)','Fifty days after Firstfruits','The wheat harvest, marked by two loaves. “Pentecost” means “fiftieth”.',/pentecost|feast of weeks|weeks/,['Leviticus 23:15','Acts 2:1']],
 ['Trumpets','1st day of month 7','A day of rest and trumpet blasts at the start of the festival month.',/trumpets/,['Leviticus 23:24','Numbers 29:1']],
 ['Day of Atonement','10th day of month 7','A day of fasting. The high priest brings blood into the Most Holy Place for the sins of the people.',/atonement/,['Leviticus 16:29','Leviticus 23:27','Hebrews 9:7']],
 ['Tabernacles (Booths)','15th–21st of month 7, and an eighth day','Israel lives in shelters of branches for a week to remember the wilderness years.',/tabernacles|booths|ingathering/,['Leviticus 23:34','Leviticus 23:42','John 7:2']],
 ['Purim','14th–15th of Adar (month 12)','Remembers how God saved the Jews in Persia, in the book of Esther.',/purim/,['Esther 9:21','Esther 9:26']],
 ['Dedication','25th of Chisleu (month 9)','Not part of the law. It remembers the rededication of the temple after it was defiled, in the time between the Old and New Testaments.',/dedication/,['John 10:22']],
 ['Sabbath year','Every seventh year','The land rests and debts are released.',/sabbath year|seventh year|release/,['Leviticus 25:4','Deuteronomy 15:1']],
 ['Jubilee','After seven times seven years','The 50th year: land returns to its family and bonded servants go free.',/jubile/,['Leviticus 25:10']]
];
// the day: [name, about, refs]
const TIME=[
 ['The day','Begins at sunset. “The evening and the morning” is one day.',/evening/,['Genesis 1:5','Leviticus 23:32']],
 ['Third hour','About 9 a.m. The twelve hours of daylight are counted from sunrise.',/third hour/,['Mark 15:25','Acts 2:15']],
 ['Sixth hour','About noon.',/sixth hour/,['John 4:6','Matthew 27:45']],
 ['Ninth hour','About 3 p.m., the hour of the afternoon prayer and offering.',/ninth hour/,['Acts 3:1','Matthew 27:46']],
 ['Watches of the night','Three in older times (Judges 7:19, “the middle watch”). Four in New Testament times: evening, midnight, cockcrow and morning.',/watch/,['Judges 7:19','Mark 13:35','Matthew 14:25']]
];

// ---------- data: coins ----------
// [coin, KJV word, what it was, worth, terms, refs]
const COINS=[
 ['Shekel','shekel','Silver was first weighed out, not counted. A shekel is a weight of about 11.4 g (0.4 oz). Real coins reached this region only in the 500s BC.','Half a shekel was the temple tax (Exodus 30:13).',/shekel/,['Genesis 23:16','Exodus 30:13']],
 ['Talent','talent','The largest weight: 3,000 shekels, about 34 kg (75 lb).','In Jesus’ time about 6,000 denarii, nearly twenty years of a labourer’s wages.',/talent/,['1 Kings 10:14','Matthew 25:15']],
 ['Mina','pound (Luke 19) or maneh','50 shekels, about 0.57 kg. The KJV often says “pound”.','About 100 denarii, roughly three months’ wages.',/pound/,['1 Kings 10:17','Luke 19:13']],
 ['Gerah and bekah','gerah, bekah','Small weights of silver. A gerah is 1/20 of a shekel and a bekah is half a shekel.','Tiny and half-shekel amounts.',/gerah|bekah/,['Exodus 30:13','Exodus 38:26']],
 ['Daric','dram','A Persian gold coin of about 8.4 g. The KJV calls it a “dram”.','Used for gifts to the temple.',/dram/,['1 Chronicles 29:7','Ezra 2:69']],
 ['Drachma','piece of silver','A Greek silver coin.','About one day’s wage, close to a denarius.',/piece of silver|pieces of silver|piece\b/,['Luke 15:8']],
 ['Stater','piece of money','A silver coin worth four drachmas.','Exactly enough for the temple tax for two people.',/piece of money|tribute/,['Matthew 17:24','Matthew 17:27']],
 ['Denarius','penny, pence','The Roman silver coin, stamped with Caesar’s head.','A day’s wage for a labourer.',/penny|pence|tribute money/,['Matthew 20:2','Matthew 22:19','Revelation 6:6']],
 ['Assarion','farthing','A small copper coin.','1/16 of a denarius. Two sparrows cost one.',/farthing/,['Matthew 10:29','Luke 12:6']],
 ['Quadrans','farthing','The smallest Roman coin, a quarter of an assarion.','Matthew 5:26: pay “the uttermost farthing”.',/farthing/,['Matthew 5:26','Mark 12:42']],
 ['Lepton','mite','The smallest Jewish coin. Two make a quadrans.','The widow gave two, “all her living”.',/\bmites?\b/,['Mark 12:42','Luke 21:2']],
 ['Thirty pieces of silver','thirty pieces of silver','The price of a servant gored by an ox, and the price paid to betray Jesus.','Thirty shekels of silver.',/pieces of silver|silver/,['Exodus 21:32','Zechariah 11:12','Matthew 26:15']],
 ['Money changers','moneychangers','Pilgrims needed temple-approved coins for the tax, so changers sat in the temple courts.','Jesus overturned their tables.',/changers/,['Matthew 21:12','John 2:14']]
];

// ---------- data: weights and measures ----------
// [name, about (metric), about (older units), what it was, terms, refs]
const MEAS={
 length:{t:'Length',rows:[
  ['Finger','2 cm','¾ inch','Four fingers make a handbreadth.',/finger/,['Jeremiah 52:21']],
  ['Handbreadth','7.5 cm','3 inches','The width of the palm.',/handbreadth|hand breadth/,['Exodus 25:25']],
  ['Span','23 cm','9 inches','A hand stretched wide; half a cubit.',/\bspan\b/,['Exodus 28:16','1 Samuel 17:4']],
  ['Cubit','45 cm','18 inches','Elbow to fingertip. The “long cubit” (about 52 cm) is a cubit and a handbreadth.',/cubits?/,['Genesis 6:15','Ezekiel 40:5']],
  ['Fathom','1.8 m','6 feet','The reach of the arms; used for sounding water.',/fathoms?/,['Acts 27:28']],
  ['Reed','3 m','10 feet','Six long cubits; a measuring rod.',/\breed/,['Ezekiel 40:5']],
  ['Furlong','185 m','1/8 mile','A Greek “stadion”, the length of a running track.',/furlongs?/,['Luke 24:13','John 6:19']],
  ['Sabbath day’s journey','900 m','just over half a mile','Two thousand cubits, the distance allowed on the sabbath.',/sabbath day|day.s journey/,['Acts 1:12','Numbers 35:5']],
  ['Mile','1.5 km','1,000 paces','The Roman mile.',/\bmile\b/,['Matthew 5:41']],
  ['Day’s journey','20–30 km','12–18 miles','What a traveller on foot covered in one day.',/day.s journey/,['Luke 2:44','Numbers 11:31']]]},
 dry:{t:'Dry measures (grain and flour)',rows:[
  ['Cab (kab)','1.2 litres','about 2 pints','A small measure.',/\bcab\b/,['2 Kings 6:25']],
  ['Omer','2.2 litres','about 2 quarts','A tenth of an ephah. A day’s manna for one person.',/omer/,['Exodus 16:16','Exodus 16:36']],
  ['Seah (“measure”)','7 litres','about 7 quarts','A third of an ephah. The “three measures of meal” of Genesis 18:6 is a large baking.',/measures? of (meal|flour)|\bseah|measures of/,['Genesis 18:6','Matthew 13:33']],
  ['Ephah','22 litres','about 5 gallons','The standard grain measure.',/ephah/,['Leviticus 19:36','Ruth 2:17']],
  ['Homer (cor)','220 litres','about 50 gallons','Ten ephahs; a donkey load.',/homer|\bcor\b/,['Leviticus 27:16','Ezekiel 45:11']],
  ['Bushel','9 litres','about 2 gallons','Greek “modios”, a grain bowl.',/bushel/,['Matthew 5:15']]]},
 liquid:{t:'Liquid measures (oil and wine)',rows:[
  ['Log','0.3 litre','about ½ pint','The smallest liquid measure.',/\blog\b/,['Leviticus 14:10']],
  ['Hin','3.7 litres','about 1 gallon','Used for oil and wine in offerings.',/\bhin\b/,['Exodus 29:40','Numbers 15:4']],
  ['Bath','22 litres','about 5 gallons','The same size as an ephah.',/\bbath\b|\bbaths\b/,['1 Kings 7:26','Ezekiel 45:11']],
  ['Cor (liquid)','220 litres','about 50 gallons','Ten baths.',/\bcor\b/,['1 Kings 5:11']],
  ['Firkin','39 litres','about 9 gallons','A Greek “metretes”. The water jars at Cana held two or three.',/firkin/,['John 2:6']]]},
 weight:{t:'Weights',rows:[
  ['Gerah','0.6 g','—','1/20 of a shekel.',/gerah/,['Exodus 30:13']],
  ['Bekah','5.7 g','—','Half a shekel.',/bekah/,['Exodus 38:26']],
  ['Shekel','11.4 g','0.4 ounce','The basic weight. Goliath’s spearhead weighed 600 shekels of iron.',/shekel/,['2 Samuel 14:26','1 Samuel 17:7']],
  ['Mina (“pound”)','0.57 kg','about 1¼ lb','Fifty shekels.',/pound/,['1 Kings 10:17','Ezra 2:69']],
  ['Roman pound','330 g','12 ounces','The “pound” of ointment at Bethany, and the “hundred pound weight” of spices for Jesus’ burial.',/pound/,['John 12:3','John 19:39']],
  ['Talent','34 kg','75 pounds','The heaviest weight. Hailstones “about the weight of a talent” (Revelation 16:21).',/talent/,['Exodus 25:39','Revelation 16:21']]]}
};
const MEASNOTE='False scales are condemned again and again: “A false balance is abomination to the LORD” (Proverbs 11:1). See also Leviticus 19:35–36 and Amos 8:5.';

// ---------- data: customs ----------
// [id, title, text, regexp that finds it in a chapter, refs]
const CUSTOMS=[
 ['feet','Hospitality and washing feet','People walked dusty roads in sandals. A host gave a guest water for the feet, a meal and a place to sleep. Washing feet was a servant’s task, which is why Jesus washing the disciples’ feet was so striking.',/\b(wash(ed|eth|ing)?|water)\b[^.]{0,30}\bfeet\b/i,['Genesis 18:4','Genesis 19:2','Luke 7:44','John 13:5']],
 ['mourn','Mourning: sackcloth, ashes and torn clothes','Grief and repentance were shown on the body: tearing one’s clothes, wearing rough sackcloth, sitting in ashes, and fasting. Hired mourners and flute players came to a death.',/sackcloth|\bashes\b|rent (his|their|her|my|your) (clothes|garments|mantle)|rend your|mourners?|mourning/i,['Genesis 37:34','2 Samuel 13:19','Job 2:12','Jonah 3:5','Matthew 9:23']],
 ['anoint','Anointing with oil','Oil was poured on kings, priests and prophets to set them apart. It also honoured guests, refreshed the skin in a dry land, and was used for the sick and for burial. “Messiah” and “Christ” both mean “anointed”.',/anoint/i,['Exodus 29:7','1 Samuel 16:13','Psalms 23:5','Luke 7:46','James 5:14']],
 ['marry','Betrothal, dowry and the wedding','A betrothal was legally binding: Joseph meant to “put away” Mary privately. The groom’s family often gave a bride-price. A wedding feast could last a week, and the bridegroom came for his bride in a lamplit procession.',/betroth|espouse|dowry|bridegroom|wedding|\bbride\b/i,['Genesis 29:18','Genesis 29:27','Matthew 1:18','Matthew 25:1','John 2:1']],
 ['levirate','Marrying a brother’s widow','If a man died without a son, his brother was to marry the widow, and the first son would carry on the dead man’s name and inheritance.',/brother.s wife|raise up seed unto his brother|husband.s brother|raise up the name of the dead/i,['Deuteronomy 25:5','Genesis 38:8','Ruth 4:5','Matthew 22:24']],
 ['shoe','Sandals and the shoe','Taking off sandals showed respect on holy ground. Handing over a shoe sealed a transaction in early Israel. Untying another’s sandals was the lowest servant’s job.',/\b(shoes?|sandals?|latchet)\b/i,['Exodus 3:5','Ruth 4:7','Mark 1:7']],
 ['gate','The city gate','The gate was the town’s court, market and news centre. Elders sat there to judge cases and witness agreements.',/\b(sat|sitting|sit|stood|standing) (in|at) the (city )?gate|\bgate of (the|his|their) city|\bin the gates?\b|\bjudges? in the gates?/i,['Genesis 19:1','Deuteronomy 21:19','Ruth 4:1','Proverbs 31:23']],
 ['lots','Casting lots','Lots (small marked stones or sticks) were thrown to settle a question, divide land or choose someone, trusting God to decide.',/\b(cast|casting|drew)\b[^.]{0,15}\blots?\b|\bby lot\b|\bthe lot (fell|came)\b/i,['Leviticus 16:8','Proverbs 16:33','Jonah 1:7','Acts 1:26']],
 ['fast','Fasting','Going without food, often with prayer, to humble oneself, seek help or show sorrow. The Day of Atonement is the one fast the law commands.',/\b(fasted|fasting|fasts)\b|\ba fast\b|\bthe fast\b/i,['Leviticus 16:29','Ezra 8:23','Esther 4:16','Matthew 6:16']],
 ['tithe','Tithes and firstfruits','A tenth of the crops and flocks belonged to the Lord, supporting the priests and Levites. The first of the harvest was brought in thanks.',/\btithes?\b|\bfirstfruits?\b|\bfirst fruits\b/i,['Genesis 14:20','Leviticus 27:30','Deuteronomy 26:2','Malachi 3:10']],
 ['burial','Burial','The dead were buried quickly, in caves or rock tombs. Spices and linen wrappings were common, and Egypt embalmed its dead.',/\bburied\b|\bburial\b|\bsepulchre\b|\bembalm|\bgraveclothes\b|\bspices\b/i,['Genesis 23:19','Genesis 50:2','John 11:44','John 19:39']],
 ['birthright','Birthright and blessing','The firstborn son received a double share of the inheritance. A father’s spoken blessing, sometimes with hands laid on the head, was solemn and could not be taken back.',/\bbirthright\b|\bfirstborn\b|\bfirst-?born\b|double portion/i,['Deuteronomy 21:17','Genesis 25:33','Genesis 27:33','Genesis 48:14']],
 ['kiss','Greeting with a kiss','Family and friends greeted and parted with a kiss on the cheek or hand, and people bowed to those they honoured.',/\bkiss(ed|es)?\b/i,['Genesis 33:4','1 Samuel 20:41','Luke 7:45','Romans 16:16']],
 ['table','Reclining at meals','At a formal meal guests lay on couches around a low table, leaning on the left elbow. That is how John could lean on Jesus’ chest, and how a woman could reach his feet.',/\b(sat|sit|sitting|sitteth) (down )?(at|to) (meat|the table)|\breclin|\bat meat\b|\bleaning on (Jesus|his)\b/i,['Amos 6:4','Luke 7:36','John 13:23']],
 ['oath','Oaths and vows','A solemn promise was made in God’s name, sometimes with a hand raised or placed under the thigh. Vows had to be kept. Jesus told his followers to let their “Yes” be yes.',/\bswear|\bsware\b|\bsworn\b|\boath\b|\bvows?\b|under my thigh/i,['Genesis 24:2','Numbers 30:2','Matthew 5:37']]
];

// ---------- chapter detection ----------
const DET={
 festivals:/\b(passover|unleavened|pentecost|feast of (weeks|tabernacles|trumpets|dedication|firstfruits|harvest|ingathering|booths)|day of atonement|trumpets|purim|new moons?|sabbaths?|jubile[e]?|abib|zif|ethanim|\bbul\b|sivan|elul|chisleu|tebeth|sebat|adar|nisan|(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) month|solemn feasts?|set feasts?|appointed feasts?|(third|sixth|ninth) hour|night watch|morning watch|fourth watch|middle watch)\b/gi,
 coins:/\b(shekels?|talents?|pence|penny|farthings?|mites?|pieces? of (silver|money)|drams?|gerahs?|bekah|tribute money|money.?changers?|pound)\b/gi,
 measures:/\b(cubits?|spans?|handbreadths?|fathoms?|furlongs?|ephah|baths?|homers?|omers?|hin|cors?|seahs?|log|cabs?|firkins?|bushels?|sabbath day.s journey|day.s journey|miles?|measures? of (meal|flour|wheat|barley|corn|oil)|pound|shekels?|talents?|gerah|bekah)\b/gi
};
const cache=new Map();
let KJV=null,kjBusy=0;
const loadKJV=()=>{if(KJV||kjBusy)return;kjBusy=1;fetch('kjv.json').then(r=>r.json()).then(j=>{KJV=j;kjBusy=0;cache.clear();if(document.querySelector('.rd')&&typeof render==='function')render()}).catch(()=>{kjBusy=0})};
const chText=(b,c)=>{const ch=KJV&&KJV[b]&&KJV[b].chapters[c-1];if(ch)return ch.join(' ');
 const n=NM&&NM.cfg&&NM.cfg.vc?NM.cfg.vc(b,c):0;if(n){let s='';for(let v=1;v<=n;v++)s+=(NM.cfg.text(b,c,v)||'')+' ';return s}return null};
const uniq=a=>[...new Set(a)];
const found=(b,c)=>{const k=b+'.'+c;if(cache.has(k))return cache.get(k);const t=chText(b,c);if(t==null){loadKJV();return null}
 const o={};for(const p of ['festivals','coins','measures']){const m=t.match(DET[p])||[];const w=uniq(m.map(x=>x.toLowerCase())).slice(0,6);if(w.length)o[p]=w}
 const cu=CUSTOMS.filter(x=>x[3].test(t));if(cu.length)o.customs=cu.map(x=>x[0]);cache.set(k,o);return o};
const LBL={festivals:'Festivals and calendar',coins:'Coins',measures:'Weights and measures',customs:'Customs'};
function strip(b,c){const f=found(b,c);if(!f||!Object.keys(f).length)return '';
 const chips=Object.keys(f).map(p=>{const hl=f[p].join(',');const what=p==='customs'?f[p].map(id=>(CUSTOMS.find(x=>x[0]===id)||[])[1]).filter(Boolean).slice(0,2).join(' · '):f[p].slice(0,3).join(', ');
  return `<button class="bgchip" data-sx="sub:bg" data-bgp="${p}" data-bgh="${esc(hl)}" aria-label="${LBL[p]}: ${esc(what)}"><span aria-hidden="true">${P[p].ico}</span><span class="bgl">${LBL[p]}</span><span class="bgw">${esc(what)}</span></button>`}).join('');
 return `<div class="bgstrip" aria-label="Background for this chapter"><span class="bgh">Background</span>${chips}</div>`}

// ---------- state ----------
const B=()=>{const st=S.st||(S.st={});const t=st.bg&&typeof st.bg==='object'?st.bg:(st.bg={});if(!P[t.p])t.p='festivals';return t};
let HL=[],FROM=null,OPEN='';
const hit=re=>HL.length&&HL.some(w=>re.test(w));
const refBtns=a=>a.map(s=>{const r=R(s);return r&&r[0]>=0?`<button class="trref" data-bg="go:${r.join('.')}">${esc(s)}</button>`:''}).join('');
const row=(h,cols,re,refs,extra)=>`<div class="bgr${hit(re)?' hit':''}"><div class="bgn">${h}</div><div class="bgb">${cols}${refs?`<div class="trw2">${refBtns(refs)}</div>`:''}</div></div>`;

function pFest(){
 const mo=MONTHS.map(m=>row(`<span class="trg">${m[0]}</span> ${esc(m[1])}`,`<p class="bgm">${esc(m[2])}</p><p>${esc(m[3])}</p>`,m[4],m[5])).join('');
 const fe=FEASTS.map(f=>row(esc(f[0]),`<p class="bgm">${esc(f[1])}</p><p>${esc(f[2])}</p>`,f[3],f[4])).join('');
 const ti=TIME.map(t=>row(esc(t[0]),`<p>${esc(t[1])}</p>`,t[2],t[3])).join('');
 return `<p class="trintro">Israel’s year followed the moon. A month began with the new moon, and a leap month was added now and then to keep the seasons in step. The months below are counted from the spring, when the Lord set the year to begin with Passover (Exodus 12:2).</p><h3 class="bgh3">Feasts and holy days</h3>${fe}<h3 class="bgh3">The months</h3>${mo}<h3 class="bgh3">Day and night</h3>${ti}`}
function pCoins(){
 return `<p class="trintro">The Bible spans many centuries and several empires, so its money changes. Early on, silver was weighed. Coins came later, and in the Gospels you meet Greek and Roman ones. Values below are rough.</p>`+COINS.map(c=>row(esc(c[0]),`<p class="bgm">KJV: ${esc(c[1])}</p><p>${esc(c[2])}</p><p><b>Worth:</b> ${esc(c[3])}</p>`,c[4],c[5])).join('')}
function pMeas(){
 return `<p class="trintro">Measures were based on the body and on common vessels, and they differed by place and time. The sizes are approximate. A cubit, for example, was about the length of a forearm.</p>`+Object.values(MEAS).map(g=>`<h3 class="bgh3">${esc(g.t)}</h3>`+g.rows.map(r=>row(esc(r[0]),`<p class="bgm">About ${esc(r[1])}${r[2]&&r[2]!=='—'?' · '+esc(r[2]):''}</p><p>${esc(r[3])}</p>`,r[4],r[5])).join('')).join('')+`<p class="trhint">${esc(MEASNOTE)}</p>`}
function pCust(){
 return `<p class="trintro">Many scenes in the Bible make sense only if you know the everyday habits behind them.</p>`+CUSTOMS.map(c=>{const on=HL.includes(c[0])||OPEN===c[0];return `<details class="bgc${HL.includes(c[0])?' hit':''}" data-bgid="${c[0]}"${on?' open':''}><summary>${esc(c[1])}</summary><p>${esc(c[2])}</p><div class="trw2">${refBtns(c[4])}</div></details>`}).join('')}

function view(){
 const b=B(),tabs=Object.keys(P).map(k=>`<button class="${b.p===k?'on':''}" data-bg="page:${k}" role="tab" aria-selected="${b.p===k}">${P[k].ico} ${P[k].t}</button>`).join('');
 const back=FROM?`<button class="g s bgback" data-bg="back">‹ Back to ${esc(BIB[FROM[0]][0])} ${FROM[1]}</button>`:'';
 const body=b.p==='festivals'?pFest():b.p==='coins'?pCoins():b.p==='measures'?pMeas():pCust();
 return `<div class="card bgp">${back}<div class="seg bgs" role="tablist">${tabs}</div><h2>${esc(P[b.p].t)}</h2>${body}</div>`}

// ---------- events ----------
// Opening from a chapter link: remember the page, what to highlight and where to go back to. Runs before the Study tab's own handler.
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-sx="sub:bg"]');if(!t)return;
 const p=t.dataset.bgp;if(p&&P[p]){B().p=p;HL=(t.dataset.bgh||'').split(',').filter(Boolean);OPEN='';const w=NM&&NM.cfg&&NM.cfg.where?NM.cfg.where():null;FROM=w?[w[0],w[1]]:null;
  if(p==='customs'&&HL.length)OPEN=HL[0]}else{HL=[];FROM=null}},true);
document.addEventListener('click',e=>{
 const d=e.target.closest&&e.target.closest('details.bgc summary');if(d){OPEN=d.parentElement.open?'':d.parentElement.dataset.bgid;return}
 const b=e.target.closest&&e.target.closest('[data-bg]');if(!b||typeof tab==='undefined'||tab!=='study')return;
 const[a,x]=[b.dataset.bg.split(':')[0],b.dataset.bg.slice(b.dataset.bg.indexOf(':')+1)];
 if(a==='page'&&P[x]){e.preventDefault();B().p=x;HL=[];OPEN='';save();render();scrollTo({top:0})}
 else if(a==='go'){e.preventDefault();const r=x.split('.').map(Number);NM.cfg.go&&NM.cfg.go(r[0],r[1],r[2])}
 else if(a==='back'){e.preventDefault();if(FROM&&NM.cfg.go)NM.cfg.go(FROM[0],FROM[1],0)}});
window.BGP={view,strip};
})();