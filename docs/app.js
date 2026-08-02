(() => {
'use strict';

const STORAGE_KEY = 'vores-camping-static-v3';
const APP_VERSION = 4;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const attr = (value = '') => esc(value).replace(/`/g, '&#96;');
const fmtDate = (value) => value ? new Intl.DateTimeFormat('da-DK',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00`)) : 'Ikke angivet';
const fmtShort = (value) => value ? new Intl.DateTimeFormat('da-DK',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${value}T12:00:00`)) : '–';
const normalizeUrl = (url) => !url ? '' : (/^https?:\/\//i.test(url) ? url : `https://${url}`);
const safeJson = (text, fallback = null) => { try { return JSON.parse(text); } catch { return fallback; } };

const DEFAULT_CATEGORIES = [
  {id:'beliggenhed',name:'Beliggenhed',icon:'📍'},
  {id:'pris-kvalitet',name:'Pris & kvalitet',icon:'💰'},
  {id:'renlighed',name:'Renlighed',icon:'✨'},
  {id:'service',name:'Service',icon:'🤝'},
  {id:'faciliteter',name:'Faciliteter',icon:'🚿'},
  {id:'hundevenlig',name:'Hundevenlig',icon:'🐕'},
  {id:'cykelmuligheder',name:'Cykelmuligheder',icon:'🚲'}
];

const DEFAULT_SETTINGS = {
  appName:'Vores Camping',
  theme:'solskin',
  primary:'#0f5c4c',
  accent:'#f47b20',
  background:'#f5f4ed',
  coverImage:'assets/cover.jpg',
  welcomeTitle:'Velkommen til vores campingeventyr',
  welcomeText:'Gem minderne, vurder pladserne og find næste stop på turen.',
  dashboardStyle:'cards',
  sections:[
    {id:'stats',label:'Nøgletal',visible:true},
    {id:'recent',label:'Seneste besøg',visible:true},
    {id:'top',label:'Bedst bedømte',visible:true},
    {id:'wishlist',label:'Vil besøge',visible:true},
    {id:'routes',label:'Cykelruter',visible:true}
  ]
};

const DEMO_CAMPSITES = [
  {
    id:'demo-vestkyst',status:'visited',name:'Vestkyst Camping',country:'Danmark',region:'Vestjylland',city:'Hvide Sande',address:'Fjordvej 18, 6960 Hvide Sande',website:'',phone:'',
    description:'En rolig campingplads tæt på både fjord og Vesterhav. Perfekt til solnedgange, gåture og cykling langs vandet.',
    notes:'Plads 42 havde læ og aftensol. Husk det lange elkabel næste gang.',
    visitDates:['2026-06-12','2025-08-03'],plannedDate:'',tags:['Ved vandet','Natur','Hundevenlig'],
    ratings:{beliggenhed:5,'pris-kvalitet':4,renlighed:5,service:4,faciliteter:4,hundevenlig:5,cykelmuligheder:5},
    photos:['assets/camping-landscape.jpg'],
    routes:[{id:'rute-fjord',name:'Fjorden rundt',origin:'Vestkyst Camping, Hvide Sande',destination:'Vestkyst Camping, Hvide Sande',waypoints:'Ringkøbing Fjord; Hvide Sande Havn',distance:'24,6 km',difficulty:'Let',description:'Flad tur på asfalt og fast grus med gode pauser ved vandet.',mapsUrl:''}],
    createdAt:'2026-06-14T10:00:00.000Z',updatedAt:'2026-06-14T10:00:00.000Z'
  },
  {
    id:'demo-mosel',status:'visited',name:'Camping Moselblick',country:'Tyskland',region:'Rheinland-Pfalz',city:'Cochem',address:'Moselpromenade 7, Cochem',website:'',phone:'',
    description:'Hyggelig plads ved Mosel med udsigt til vinmarker. God base til små byer, vinslotte og cykling langs floden.',
    notes:'Book en plads direkte ved vandet. Meget populær i juli.',visitDates:['2025-07-18'],plannedDate:'',tags:['Ved vandet','Cykelruter','Udsigt'],
    ratings:{beliggenhed:5,'pris-kvalitet':4,renlighed:4,service:5,faciliteter:4,hundevenlig:4,cykelmuligheder:5},photos:[],
    routes:[{id:'rute-mosel',name:'Moselstien til Beilstein',origin:'Camping Moselblick, Cochem',destination:'Beilstein, Tyskland',waypoints:'Ernst, Tyskland',distance:'31,2 km',difficulty:'Middel',description:'Smuk tur langs floden med caféstop i Beilstein.',mapsUrl:''}],
    createdAt:'2025-07-20T10:00:00.000Z',updatedAt:'2025-07-20T10:00:00.000Z'
  },
  {
    id:'demo-siljan',status:'visited',name:'Siljansbadet Camping',country:'Sverige',region:'Dalarna',city:'Rättvik',address:'Långbryggevägen 20, Rättvik',website:'',phone:'',
    description:'Grøn og afslappet plads tæt på Siljan-søen. Flot natur og gode muligheder for badning og cykling.',notes:'',visitDates:['2024-08-09'],plannedDate:'',tags:['Sø','Natur','Sommer'],
    ratings:{beliggenhed:5,'pris-kvalitet':5,renlighed:4,service:4,faciliteter:4,hundevenlig:5,cykelmuligheder:4},photos:[],routes:[],createdAt:'2024-08-10T10:00:00.000Z',updatedAt:'2024-08-10T10:00:00.000Z'
  },
  {
    id:'demo-garda',status:'wishlist',name:'Camping Bella Italia',country:'Italien',region:'Gardasøen',city:'Peschiera del Garda',address:'Via Bell’Italia 2, Peschiera del Garda',website:'',phone:'',
    description:'Stor plads ved Gardasøen med pool, restauranter og mulighed for cykelture langs søen.',notes:'Se efter en rolig plads lidt væk fra poolområdet.',visitDates:[],plannedDate:'2027-06-15',tags:['Gardasøen','Sommer','Cykling'],ratings:{},photos:[],routes:[],createdAt:'2026-07-02T10:00:00.000Z',updatedAt:'2026-07-02T10:00:00.000Z'
  },
  {
    id:'demo-normandiet',status:'wishlist',name:'Camping i Normandiet',country:'Frankrig',region:'Normandiet',city:'Étretat',address:'Étretat, Frankrig',website:'',phone:'',
    description:'Kystnatur, klipper og små franske byer. Skal helst være en plads med gode cykelmuligheder.',notes:'',visitDates:[],plannedDate:'',tags:['Kyst','Natur','Cykelruter'],ratings:{},photos:[],routes:[],createdAt:'2026-07-02T10:00:00.000Z',updatedAt:'2026-07-02T10:00:00.000Z'
  }
];

const createDefaultState = () => ({version:APP_VERSION,campsites:deepClone(DEMO_CAMPSITES),categories:deepClone(DEFAULT_CATEGORIES),settings:deepClone(DEFAULT_SETTINGS)});

let state = loadState();
let ui = {search:'',sort:'latest',mapScope:'europa',mapFilter:'all',mapQuery:'Europa',modal:null,toast:null};
let activeDraft = null;
let activeDraftKey = '';
let routeDraft = blankRoute();
let routeEditIndex = -1;

function normalizeState(raw,{useDemoFallback=true}={}){
  if(!raw || !Array.isArray(raw.campsites)) return useDemoFallback ? createDefaultState() : null;
  const settings={
    ...deepClone(DEFAULT_SETTINGS),
    ...(raw.settings||{}),
    dashboardStyle:['cards','compact'].includes(raw.settings?.dashboardStyle)?raw.settings.dashboardStyle:DEFAULT_SETTINGS.dashboardStyle,
    sections:Array.isArray(raw.settings?.sections)&&raw.settings.sections.length?raw.settings.sections:deepClone(DEFAULT_SETTINGS.sections)
  };
  const campsites=raw.campsites.map(camp=>({
    ...blankCampsite(camp?.status==='wishlist'?'wishlist':'visited'),
    ...(camp||{}),
    visitDates:Array.isArray(camp?.visitDates)?camp.visitDates:[],
    tags:Array.isArray(camp?.tags)?camp.tags:[],
    photos:Array.isArray(camp?.photos)?camp.photos:[],
    ratings:camp?.ratings&&typeof camp.ratings==='object'?camp.ratings:{},
    routes:Array.isArray(camp?.routes)?camp.routes.map(route=>({
      ...blankRoute(),
      ...(route||{}),
      id:route?.id||uid('route'),
      mapsUrl:route?.mapsUrl||route?.googleMapsUrl||route?.url||''
    })):[]
  }));
  return {
    version:APP_VERSION,
    campsites,
    categories:Array.isArray(raw.categories)&&raw.categories.length?raw.categories:deepClone(DEFAULT_CATEGORIES),
    settings
  };
}
function loadState(){
  return normalizeState(safeJson(localStorage.getItem(STORAGE_KEY))) || createDefaultState();
}
function saveState(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  catch(error){showToast('Browseren kunne ikke gemme flere billeder. Hent en sikkerhedskopi og fjern nogle store fotos.','danger');console.error(error);}
}
function setState(mutator){
  const next = typeof mutator === 'function' ? mutator(deepClone(state)) : mutator;
  state = next; saveState(); applyTheme(); render();
}
function applyTheme(){
  const s=state.settings;
  document.documentElement.style.setProperty('--primary',s.primary||DEFAULT_SETTINGS.primary);
  document.documentElement.style.setProperty('--primary-dark',shadeColor(s.primary||DEFAULT_SETTINGS.primary,-28));
  document.documentElement.style.setProperty('--accent',s.accent||DEFAULT_SETTINGS.accent);
  document.documentElement.style.setProperty('--accent-soft',hexToRgba(s.accent||DEFAULT_SETTINGS.accent,.12));
  document.documentElement.style.setProperty('--page-bg',s.background||DEFAULT_SETTINGS.background);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',s.primary||DEFAULT_SETTINGS.primary);
  document.title=s.appName||'Vores Camping';
}
function shadeColor(hex,amount){
  const clean=(hex||'#0f5c4c').replace('#','');
  const num=parseInt(clean.length===3?clean.split('').map(x=>x+x).join(''):clean,16);
  const r=Math.max(0,Math.min(255,(num>>16)+amount)),g=Math.max(0,Math.min(255,((num>>8)&255)+amount)),b=Math.max(0,Math.min(255,(num&255)+amount));
  return `#${(b|(g<<8)|(r<<16)).toString(16).padStart(6,'0')}`;
}
function hexToRgba(hex,a){
  const clean=(hex||'#000000').replace('#',''); const v=parseInt(clean.length===3?clean.split('').map(x=>x+x).join(''):clean,16);
  return `rgba(${v>>16},${(v>>8)&255},${v&255},${a})`;
}
function showToast(message,type='success'){
  ui.toast={message,type}; renderToast(); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>{ui.toast=null;renderToast();},2600);
}
function renderToast(){
  let node=$('#toast-root'); if(!node){node=document.createElement('div');node.id='toast-root';document.body.appendChild(node);}
  node.innerHTML=ui.toast?`<div class="toast ${ui.toast.type==='danger'?'danger':''}">${esc(ui.toast.message)}</div>`:'';
}
function average(camp){
  const vals=state.categories.map(c=>Number(camp.ratings?.[c.id]||0)).filter(v=>v>0);
  return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
}
function latestVisit(camp){return [...(camp.visitDates||[])].sort().reverse()[0]||'';}
function routeCount(){return state.campsites.reduce((sum,c)=>sum+(c.routes?.length||0),0);}
function countriesCount(){return new Set(state.campsites.filter(c=>c.status==='visited').map(c=>c.country).filter(Boolean)).size;}
function placeQuery(camp){return [camp.address,camp.city,camp.region,camp.country].filter(Boolean).join(', ')||camp.name;}
function googleSearchUrl(query){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;}
function googleEmbedUrl(query){return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;}
function googleDirectionsUrl(route){
  const base='https://www.google.com/maps/dir/?api=1';
  const parts=['travelmode=bicycling'];
  if((route.origin||'').trim())parts.push(`origin=${encodeURIComponent(route.origin.trim())}`);
  if((route.destination||'').trim())parts.push(`destination=${encodeURIComponent(route.destination.trim())}`);
  const waypoints=(route.waypoints||'').split(/[;\n]/).map(x=>x.trim()).filter(Boolean);
  if(waypoints.length)parts.push(`waypoints=${encodeURIComponent(waypoints.join('|'))}`);
  return `${base}&${parts.join('&')}`;
}
function routeOpenUrl(route){
  const shared=(route?.mapsUrl||'').trim();
  return shared?normalizeUrl(shared):googleDirectionsUrl(route||{});
}
function routeHasPoints(route){return Boolean((route?.origin||'').trim()&&(route?.destination||'').trim());}
async function copyText(text){
  if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return;}
  const input=document.createElement('textarea');input.value=text;input.setAttribute('readonly','');input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);input.select();document.execCommand('copy');input.remove();
}
async function shareRoute(route,campName=''){
  const url=routeOpenUrl(route);const title=route?.name?`Cykelrute: ${route.name}`:'Cykelrute';const text=campName?`${title} ved ${campName}`:title;
  try{
    if(navigator.share){await navigator.share({title,text,url});showToast('Ruten er delt');return;}
    await copyText(url);showToast('Rutelinket er kopieret');
  }catch(error){if(error?.name!=='AbortError'){console.error(error);showToast('Ruten kunne ikke deles.','danger');}}
}
function googleRouteEmbedUrl(route){
  const via=(route.waypoints||'').split(/[;\n]/).map(x=>x.trim()).filter(Boolean).map(x=>`+to:${x}`).join('');
  return `https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(route.origin||'')}&daddr=${encodeURIComponent((route.destination||'')+via)}&dirflg=b`;
}
function blankCampsite(status='visited'){
  return {id:'',status,name:'',country:'Danmark',region:'',city:'',address:'',website:'',phone:'',description:'',notes:'',visitDates:status==='visited'?['']:[],plannedDate:'',tags:[],ratings:{},photos:[],routes:[],createdAt:'',updatedAt:''};
}
function blankRoute(){return {id:'',name:'',origin:'',destination:'',waypoints:'',distance:'',difficulty:'Let',description:'',mapsUrl:''};}
function currentRoute(){
  const raw=location.hash.slice(1)||'/overblik'; const [path,query='']=raw.split('?'); return {path:path.startsWith('/')?path:`/${path}`,params:new URLSearchParams(query)};
}
function nav(path){location.hash=path.startsWith('/')?path:`/${path}`;}
function activeNav(path){const current=currentRoute().path;return current===path||(path!='/overblik'&&current.startsWith(path));}
function iconForPage(path){if(path.startsWith('/besogte'))return'🏕️';if(path.startsWith('/kort'))return'🗺️';if(path.startsWith('/bedst'))return'⭐';if(path.startsWith('/onskeliste'))return'💛';if(path.startsWith('/indstillinger'))return'⚙️';return'🏠';}

function shell(content,title='Overblik'){
  const s=state.settings;
  const navs=[['/overblik','🏠','Overblik'],['/besogte','🏕️','Besøgte'],['/kort','🗺️','Oversigtskort'],['/bedst','⭐','Bedst bedømte'],['/onskeliste','💛','Vil besøge'],['/indstillinger','⚙️','Indstillinger']];
  return `<div class="app-shell">
    <aside class="sidebar">
      <a class="brand" data-nav="/overblik"><img src="assets/logo.jpg" alt=""><div><strong>${esc(s.appName)}</strong><span>Campingdagbog & scrapbog</span></div></a>
      <nav class="nav-list">${navs.map(([p,i,l])=>`<a class="nav-link ${activeNav(p)?'active':''}" data-nav="${p}"><span class="nav-icon">${i}</span>${l}</a>`).join('')}</nav>
      <div class="sidebar-spacer"></div>
      <a class="btn primary" data-nav="/ny?status=visited">＋ Tilføj campingplads</a>
      <div class="sidebar-note"><strong>Gemmer automatisk</strong>Data ligger lokalt på denne enhed. Brug sikkerhedskopi under Indstillinger.</div>
    </aside>
    <div class="main">
      <header class="topbar"><div><div class="topbar-title">${iconForPage(currentRoute().path)} ${esc(title)}</div><div class="topbar-sub">${esc(s.appName)} · Dansk campingoverblik</div></div><div class="top-actions"><button class="btn secondary small hide-mobile" data-nav="/kort">🗺️ Google Maps</button><button class="btn primary small" data-nav="/ny?status=visited">＋ Tilføj</button></div></header>
      <main class="content">${content}</main>
      <nav class="mobile-nav">${navs.slice(0,5).map(([p,i,l])=>`<a class="${activeNav(p)?'active':''}" data-nav="${p}"><span>${i}</span>${l.replace('Besøgte','Besøgte').replace('Oversigtskort','Kort').replace('Bedst bedømte','Bedst').replace('Vil besøge','Ønsker')}</a>`).join('')}</nav>
    </div>
  </div><div id="modal-root"></div><div id="toast-root"></div>`;
}

function pageHeader(eyebrow,title,text,actions=''){
  return `<div class="page-header"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p>${esc(text)}</p></div><div class="page-actions">${actions}</div></div>`;
}
function emptyState(icon,title,text,actionLabel='',actionPath=''){
  return `<div class="empty card"><div class="big">${icon}</div><h2>${esc(title)}</h2><p>${esc(text)}</p>${actionLabel?`<button class="btn primary" data-nav="${actionPath}">${esc(actionLabel)}</button>`:''}</div>`;
}
function campImage(camp){const src=camp.photos?.[0];return src?`<img src="${attr(src)}" alt="${attr(camp.name)}">`:`<div class="fallback">${camp.status==='wishlist'?'💛':'🏕️'}</div>`;}
function campCard(camp){
  const score=average(camp); const tags=(camp.tags||[]).slice(0,3);
  return `<article class="camp-card card">
    <div class="camp-image">${campImage(camp)}<span class="status-badge ${camp.status==='wishlist'?'wishlist':''}">${camp.status==='wishlist'?'Vil besøge':'Besøgt'}</span>${score?`<span class="rating-badge">★ ${score.toFixed(1).replace('.',',')}</span>`:''}</div>
    <div class="camp-body"><div><h3>${esc(camp.name)}</h3><div class="camp-location">📍 ${esc([camp.city,camp.country].filter(Boolean).join(', ')||'Placering ikke angivet')}</div></div><div class="camp-description">${esc(camp.description||'Ingen beskrivelse endnu.')}</div><div class="tag-row">${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div><div class="camp-footer"><button class="btn secondary small" data-nav="/campingplads/${encodeURIComponent(camp.id)}">Se mere</button><button class="btn ghost small" data-nav="/rediger/${encodeURIComponent(camp.id)}">✎ Rediger</button></div></div>
  </article>`;
}

function renderDashboard(){
  const visited=state.campsites.filter(c=>c.status==='visited');
  const wishlist=state.campsites.filter(c=>c.status==='wishlist');
  const recent=[...visited].sort((a,b)=>latestVisit(b).localeCompare(latestVisit(a))).slice(0,3);
  const top=[...visited].filter(c=>average(c)>0).sort((a,b)=>average(b)-average(a)).slice(0,3);
  const routes=visited.flatMap(c=>(c.routes||[]).map(r=>({...r,campId:c.id,campName:c.name}))).slice(0,4);
  const sections={
    stats:`<section class="stats-grid">
      <div class="stat-card card"><span class="stat-icon">🏕️</span><div><strong>${visited.length}</strong><span>besøgte pladser</span></div></div>
      <div class="stat-card card"><span class="stat-icon">💛</span><div><strong>${wishlist.length}</strong><span>på ønskelisten</span></div></div>
      <div class="stat-card card"><span class="stat-icon">🌍</span><div><strong>${countriesCount()}</strong><span>lande besøgt</span></div></div>
      <div class="stat-card card"><span class="stat-icon">🚲</span><div><strong>${routeCount()}</strong><span>gemte cykelruter</span></div></div>
    </section>`,
    recent:`<section class="section"><div class="section-head"><div><h2>Seneste besøg</h2><p>De nyeste kapitler i campingdagbogen.</p></div><button class="btn secondary small" data-nav="/besogte">Se alle</button></div>${recent.length?`<div class="grid">${recent.map(campCard).join('')}</div>`:emptyState('🏕️','Ingen besøg endnu','Tilføj den første campingplads og start dagbogen.','Tilføj campingplads','/ny?status=visited')}</section>`,
    top:`<section class="section"><div class="section-head"><div><h2>Bedst bedømte</h2><p>Favoritterne målt på jeres egne kategorier.</p></div><button class="btn secondary small" data-nav="/bedst">Se rangliste</button></div>${top.length?`<div class="grid">${top.map(campCard).join('')}</div>`:emptyState('⭐','Ingen vurderinger endnu','Giv stjerner til en besøgt campingplads.')}</section>`,
    wishlist:`<section class="section"><div class="section-head"><div><h2>Næste campingdrømme</h2><p>Steder campingvognen stadig mangler at opleve.</p></div><button class="btn secondary small" data-nav="/onskeliste">Se ønskeliste</button></div>${wishlist.length?`<div class="grid">${wishlist.slice(0,3).map(campCard).join('')}</div>`:emptyState('💛','Ønskelisten er tom','Gem et sted, I drømmer om at besøge.','Tilføj ønske','/ny?status=wishlist')}</section>`,
    routes:`<section class="section"><div class="section-head"><div><h2>Cykelruter</h2><p>Gemte ture omkring campingpladserne.</p></div></div>${routes.length?`<div class="grid two">${routes.map(r=>`<article class="route-card card"><div class="route-head"><div><strong>🚲 ${esc(r.name)}</strong><div class="camp-location">${esc(r.campName)}</div></div><div class="route-actions"><a class="btn primary small" target="_blank" rel="noopener" href="${attr(routeOpenUrl(r))}">Åbn ↗</a><button class="btn secondary small" data-action="share-route" data-camp="${attr(r.campId)}" data-route="${attr(r.id)}">Del</button></div></div><div class="route-meta">${r.distance?`<span class="pill">${esc(r.distance)}</span>`:''}<span class="pill">${esc(r.difficulty||'Ikke angivet')}</span>${r.mapsUrl?'<span class="pill">Google Maps-link</span>':''}</div><p>${esc(r.description||'Ingen beskrivelse.')}</p><button class="btn ghost small" data-nav="/campingplads/${encodeURIComponent(r.campId)}">Se campingplads</button></article>`).join('')}</div>`:emptyState('🚲','Ingen cykelruter endnu','Tilføj en rute under en campingplads.')}</section>`
  };
  const ordered=(state.settings.sections||DEFAULT_SETTINGS.sections).filter(s=>s.visible).map(s=>sections[s.id]||'').join('');
  const cover=state.settings.coverImage||'assets/cover.jpg';
  const style=['cards','compact'].includes(state.settings.dashboardStyle)?state.settings.dashboardStyle:'cards';
  return shell(`<div class="dashboard dashboard-${style}"><section class="hero" style="background-image:url('${attr(cover)}')"><div class="hero-content"><span class="hero-kicker">☀️ Vores personlige campingdagbog</span><h1>${esc(state.settings.welcomeTitle)}</h1><p>${esc(state.settings.welcomeText)}</p><div class="hero-buttons"><button class="btn primary" data-nav="/ny?status=visited">＋ Tilføj campingplads</button><button class="btn secondary" data-nav="/kort">🗺️ Åbn oversigtskort</button></div></div></section>${ordered}</div>`,'Overblik');
}

function renderList(status){
  const isVisited=status==='visited';
  let items=state.campsites.filter(c=>c.status===status);
  const q=ui.search.trim().toLowerCase();
  if(q)items=items.filter(c=>[c.name,c.country,c.region,c.city,c.address,c.description,(c.tags||[]).join(' ')].join(' ').toLowerCase().includes(q));
  if(ui.sort==='rating')items.sort((a,b)=>average(b)-average(a));
  else if(ui.sort==='name')items.sort((a,b)=>a.name.localeCompare(b.name,'da'));
  else if(isVisited)items.sort((a,b)=>latestVisit(b).localeCompare(latestVisit(a)));
  else items.sort((a,b)=>(a.plannedDate||'9999').localeCompare(b.plannedDate||'9999'));
  const title=isVisited?'Besøgte campingpladser':'Campingpladser vi vil besøge';
  const text=isVisited?'Alle steder I har boet, vurderet og gemt minder fra.':'Gem campingdrømmene, planlæg datoer og flyt dem til besøgt efter turen.';
  const actions=`<button class="btn primary" data-nav="/ny?status=${status}">＋ ${isVisited?'Ny campingplads':'Nyt ønske'}</button>`;
  return shell(`${pageHeader(isVisited?'Campingdagbog':'Ønskeliste',title,text,actions)}
    <div class="toolbar card"><div class="search"><span>⌕</span><input id="list-search" value="${attr(ui.search)}" placeholder="Søg efter navn, land, by eller tag…"></div><select id="list-sort" style="max-width:210px"><option value="latest" ${ui.sort==='latest'?'selected':''}>${isVisited?'Seneste besøg':'Planlagt dato'}</option><option value="rating" ${ui.sort==='rating'?'selected':''}>Bedste vurdering</option><option value="name" ${ui.sort==='name'?'selected':''}>Navn A–Å</option></select></div>
    ${items.length?`<div class="grid">${items.map(campCard).join('')}</div>`:emptyState(isVisited?'🏕️':'💛',isVisited?'Ingen campingpladser fundet':'Ingen ønsker fundet',q?'Prøv en anden søgning.':isVisited?'Tilføj jeres første besøg.':'Tilføj et sted I drømmer om at besøge.',q?'':'Tilføj',q?'':`/ny?status=${status}`)}`,
    isVisited?'Besøgte campingpladser':'Vil besøge');
}

function renderTopRated(){
  const ranked=state.campsites.filter(c=>c.status==='visited'&&average(c)>0).sort((a,b)=>average(b)-average(a));
  const winners=state.categories.map(cat=>{
    const list=state.campsites.filter(c=>c.status==='visited'&&Number(c.ratings?.[cat.id])>0).sort((a,b)=>Number(b.ratings[cat.id])-Number(a.ratings[cat.id]));
    return list[0]?{cat,camp:list[0],score:list[0].ratings[cat.id]}:null;
  }).filter(Boolean);
  return shell(`${pageHeader('Rangliste','Bedst bedømte campingpladser','Se de samlede favoritter og vinderen i hver vurderingskategori.')}
    ${ranked.length?`<div class="rank-list">${ranked.map((c,i)=>`<article class="rank-item card"><div class="rank-no">${i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div><div>${c.photos?.[0]?`<img src="${attr(c.photos[0])}" alt="">`:`<div style="width:80px;height:62px;border-radius:13px;background:#eef4f1;display:grid;place-items:center;font-size:30px">🏕️</div>`}</div><div><h3>${esc(c.name)}</h3><p>📍 ${esc([c.city,c.country].filter(Boolean).join(', '))}</p><button class="btn ghost small" data-nav="/campingplads/${encodeURIComponent(c.id)}">Se fuld visning</button></div><div class="rank-score">★ ${average(c).toFixed(1).replace('.',',')}</div></article>`).join('')}</div>`:emptyState('⭐','Ingen vurderinger endnu','Tilføj stjerner til en besøgt campingplads.')}
    ${winners.length?`<section class="section"><div class="section-head"><div><h2>Kategorivindere</h2><p>Bedste plads i hver af jeres kategorier.</p></div></div><div class="grid">${winners.map(w=>`<article class="settings-card card"><div style="font-size:30px">${esc(w.cat.icon||'⭐')}</div><h3>${esc(w.cat.name)}</h3><p><strong>${esc(w.camp.name)}</strong><br><span class="camp-location">${esc([w.camp.city,w.camp.country].filter(Boolean).join(', '))}</span></p><div class="rank-score">${w.score} / 5 ★</div></article>`).join('')}</div></section>`:''}`,'Bedst bedømte');
}

function renderMap(){
  let camps=state.campsites;
  if(ui.mapFilter==='visited')camps=camps.filter(c=>c.status==='visited');
  if(ui.mapFilter==='wishlist')camps=camps.filter(c=>c.status==='wishlist');
  const selected=ui.mapQuery|| (ui.mapScope==='world'?'Verden':'Europa');
  return shell(`${pageHeader('Google Maps','Oversigtskort','Skift mellem Europa og verden. Vælg en campingplads i listen for at se den direkte på Google Maps.',`<a class="btn secondary" target="_blank" rel="noopener" href="${attr(googleSearchUrl(selected))}">Åbn i Google Maps ↗</a>`)}
    <div class="toolbar card"><div class="segmented"><button class="${ui.mapScope==='europa'?'active':''}" data-action="map-scope" data-value="europa">🗺️ Europakort</button><button class="${ui.mapScope==='world'?'active':''}" data-action="map-scope" data-value="world">🌍 Verdenskort</button></div><div class="segmented"><button class="${ui.mapFilter==='all'?'active':''}" data-action="map-filter" data-value="all">Alle</button><button class="${ui.mapFilter==='visited'?'active':''}" data-action="map-filter" data-value="visited">Besøgte</button><button class="${ui.mapFilter==='wishlist'?'active':''}" data-action="map-filter" data-value="wishlist">Vil besøge</button></div></div>
    <div class="map-layout"><div class="map-card card"><iframe class="map-frame" title="Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="${attr(googleEmbedUrl(selected))}"></iframe></div><div class="map-list card">${camps.length?camps.map(c=>{const query=placeQuery(c);return `<button class="map-place ${selected===query?'selected':''}" data-action="map-select" data-query="${attr(query)}" style="width:100%;text-align:left;background-color:transparent"><span class="pin">${c.status==='wishlist'?'💛':'📍'}</span><div><strong>${esc(c.name)}</strong><small>${esc([c.city,c.country].filter(Boolean).join(', '))}</small></div>${average(c)?`<span>★ ${average(c).toFixed(1).replace('.',',')}</span>`:''}</button>`}).join(''):`<div class="empty"><div class="big">🗺️</div><p>Ingen steder i dette filter.</p></div>`}</div></div>
    <div class="help-box" style="margin-top:14px"><strong>Google Maps uden API-nøgle:</strong> Kortet viser det valgte sted, og knappen åbner den fulde Google Maps-app. Det gør løsningen gratis og langt mindre skrøbelig på GitHub Pages.</div>`,'Oversigtskort');
}

function ratingRows(camp){
  return state.categories.map(cat=>{const v=Number(camp.ratings?.[cat.id]||0);return `<div class="rating-line"><div><strong>${esc(cat.icon||'⭐')} ${esc(cat.name)}</strong><div class="bar"><div class="fill" style="width:${v*20}%"></div></div></div><span>${v?`${v} / 5 ★`:'Ikke vurderet'}</span></div>`}).join('');
}
function renderDetail(id){
  const camp=state.campsites.find(c=>c.id===id);
  if(!camp)return shell(emptyState('🧭','Campingpladsen findes ikke','Den kan være blevet slettet.','Tilbage til overblik','/overblik'),'Ikke fundet');
  const score=average(camp),query=placeQuery(camp),photo=camp.photos?.[0]||'assets/camping-landscape.jpg';
  const photos=camp.photos||[],routes=camp.routes||[];
  return shell(`${pageHeader(camp.status==='wishlist'?'Ønskebesøg':'Campingdagbog',camp.name,[camp.city,camp.country].filter(Boolean).join(', '),`<button class="btn secondary" data-nav="/rediger/${encodeURIComponent(camp.id)}">✎ Rediger</button><button class="btn danger" data-action="delete-camp" data-id="${attr(camp.id)}">🗑 Slet</button>`)}
    <section class="detail-hero"><div class="detail-cover card"><img src="${attr(photo)}" alt="${attr(camp.name)}"><div class="overlay"></div><div class="detail-title"><span class="status-badge ${camp.status==='wishlist'?'wishlist':''}" style="position:static;display:inline-block;margin-bottom:10px">${camp.status==='wishlist'?'Vil besøge':'Besøgt'}</span><h1>${esc(camp.name)}</h1><p>📍 ${esc(query)}</p></div></div><aside class="detail-side card"><div class="detail-score"><strong>${score?score.toFixed(1).replace('.',','):'–'}</strong><span>samlet vurdering ud af 5</span></div><div class="detail-meta"><div><span>📅</span><div><strong>${camp.status==='wishlist'?'Planlagt besøg':'Seneste besøg'}</strong><small>${camp.status==='wishlist'?fmtDate(camp.plannedDate):fmtDate(latestVisit(camp))}</small></div></div><div><span>🚲</span><div><strong>${routes.length} cykelruter</strong><small>Gemte omkring pladsen</small></div></div><div><span>📷</span><div><strong>${photos.length} billeder</strong><small>Campingminder i scrapbogen</small></div></div></div><a class="btn primary" style="width:100%;margin-top:14px" target="_blank" rel="noopener" href="${attr(googleSearchUrl(query))}">🗺️ Vis i Google Maps</a></aside></section>
    <div class="detail-grid"><div>
      <section class="detail-section card"><h2>Beskrivelse</h2><div class="prose">${esc(camp.description||'Der er endnu ikke tilføjet en beskrivelse.')}</div>${(camp.tags||[]).length?`<div class="tag-row" style="margin-top:15px">${camp.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`:''}</section>
      ${camp.notes?`<section class="detail-section card"><h2>Private noter</h2><div class="prose">${esc(camp.notes)}</div></section>`:''}
      <section class="detail-section card"><h2>Vurderinger</h2><div class="ratings-list">${ratingRows(camp)}</div></section>
      ${photos.length?`<section class="detail-section card"><h2>Billeder</h2><div class="gallery">${photos.map((p,i)=>`<button data-action="photo-open" data-id="${attr(camp.id)}" data-index="${i}"><img src="${attr(p)}" alt="Billede ${i+1}"></button>`).join('')}</div></section>`:''}
      <section class="detail-section card"><div class="section-head"><div><h2>Cykelruter</h2><p>Åbn eller del ruter, der er lavet i appen eller gemt i Google Maps.</p></div><button class="btn secondary small" data-nav="/rediger/${encodeURIComponent(camp.id)}">＋ Tilføj rute</button></div>${routes.length?routes.map(r=>`<article class="route-card card"><div class="route-head"><div><h3 style="margin:0">🚲 ${esc(r.name)}</h3><div class="route-meta">${r.distance?`<span class="pill">${esc(r.distance)}</span>`:''}<span class="pill">${esc(r.difficulty||'Ikke angivet')}</span>${r.mapsUrl?'<span class="pill">Delt Google Maps-rute</span>':''}</div></div><div class="route-actions"><a class="btn primary small" target="_blank" rel="noopener" href="${attr(routeOpenUrl(r))}">Åbn i Google Maps ↗</a><button class="btn secondary small" data-action="share-route" data-camp="${attr(camp.id)}" data-route="${attr(r.id)}">Del rute</button></div></div>${r.description?`<p>${esc(r.description)}</p>`:''}${routeHasPoints(r)?`<iframe class="route-map" title="Cykelrute i Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${attr(googleRouteEmbedUrl(r))}"></iframe>`:r.mapsUrl?'<div class="help-box" style="margin-top:12px">Ruten er gemt som et delt Google Maps-link. Tryk <strong>Åbn i Google Maps</strong> for at se den komplette rute.</div>':''}</article>`).join(''):`<div class="empty"><div class="big">🚲</div><p>Ingen cykelruter endnu.</p></div>`}</section>
    </div><aside>
      <section class="detail-section card"><h2>Besøg</h2>${camp.status==='visited'?(camp.visitDates||[]).filter(Boolean).length?`<div class="date-list">${camp.visitDates.filter(Boolean).sort().reverse().map(d=>`<div class="date-row">📅 <strong>${fmtDate(d)}</strong></div>`).join('')}</div>`:'<p class="camp-location">Ingen datoer angivet.</p>':`<p>${camp.plannedDate?fmtDate(camp.plannedDate):'Ingen planlagt dato.'}</p>`}</section>
      <section class="detail-section card"><h2>Kontakt og sted</h2><div class="detail-meta"><div><span>📍</span><div><strong>Adresse</strong><small>${esc(query)}</small></div></div>${camp.phone?`<div><span>☎️</span><div><strong>Telefon</strong><small>${esc(camp.phone)}</small></div></div>`:''}${camp.website?`<div><span>🌐</span><div><strong>Hjemmeside</strong><small><a target="_blank" rel="noopener" href="${attr(normalizeUrl(camp.website))}">${esc(camp.website)}</a></small></div></div>`:''}</div></section>
    </aside></div>`,'Campingplads');
}

function ensureDraft(id,status){
  const key=id?`edit:${id}`:`new:${status}`;
  if(activeDraftKey!==key){
    activeDraftKey=key;
    const existing=id?state.campsites.find(c=>c.id===id):null;
    activeDraft=existing?deepClone(existing):blankCampsite(status);
    if(!Array.isArray(activeDraft.visitDates))activeDraft.visitDates=[];
    if(!Array.isArray(activeDraft.photos))activeDraft.photos=[];
    if(!Array.isArray(activeDraft.routes))activeDraft.routes=[];
    if(!activeDraft.ratings)activeDraft.ratings={};
    routeDraft=blankRoute();routeEditIndex=-1;
  }
}
function draftPhotoGrid(){
  return `${activeDraft.photos.map((p,i)=>`<div class="photo-item"><img src="${attr(p)}" alt="Billede ${i+1}"><button type="button" class="photo-remove" data-action="draft-photo-remove" data-index="${i}" aria-label="Fjern billede">×</button></div>`).join('')}<label class="upload-tile">📷<br>Tilføj billeder<input id="draft-photo-input" type="file" accept="image/*" multiple></label>`;
}
function draftDateRows(){
  if(!activeDraft.visitDates.length)return '<div class="camp-location">Ingen besøgsdatoer endnu.</div>';
  return activeDraft.visitDates.map((d,i)=>`<div class="date-row"><input type="date" value="${attr(d)}" data-draft-date="${i}"><button type="button" class="btn danger small" data-action="draft-date-remove" data-index="${i}">Fjern</button></div>`).join('');
}
function draftRoutes(){
  if(!activeDraft.routes.length)return '<div class="camp-location">Ingen cykelruter endnu.</div>';
  return activeDraft.routes.map((r,i)=>`<div class="route-row"><span style="font-size:25px">🚲</span><div><strong>${esc(r.name||'Rute uden navn')}</strong><small>${esc([r.distance,r.difficulty].filter(Boolean).join(' · '))}${r.mapsUrl?' · Google Maps-link':''}<br>${routeHasPoints(r)?`${esc(r.origin||'')} → ${esc(r.destination||'')}`:'Ruten åbnes via det gemte Google Maps-link'}</small></div><a class="btn ghost small" target="_blank" rel="noopener" href="${attr(routeOpenUrl(r))}">Åbn</a><button type="button" class="btn secondary small" data-action="route-edit" data-index="${i}">Rediger</button><button type="button" class="btn danger small" data-action="route-delete" data-index="${i}">Slet</button></div>`).join('');
}
function formRatingRows(){
  return state.categories.map(cat=>{const v=Number(activeDraft.ratings?.[cat.id]||0);return `<div class="rating-row"><div><strong>${esc(cat.icon||'⭐')} ${esc(cat.name)}</strong><div class="camp-location">${v?`${v} ud af 5 stjerner`:'Ikke vurderet'}</div></div><div class="stars" role="group" aria-label="${attr(cat.name)}">${[1,2,3,4,5].map(n=>`<button type="button" class="star-btn ${n<=v?'on':''}" data-action="draft-rating" data-category="${attr(cat.id)}" data-value="${n}" aria-label="${n} stjerner">★</button>`).join('')}<button type="button" class="btn ghost small" data-action="draft-rating" data-category="${attr(cat.id)}" data-value="0">Nulstil</button></div></div>`}).join('');
}
function routeEditorHtml(){
  const canOpen=Boolean((routeDraft.mapsUrl||'').trim()||routeHasPoints(routeDraft));
  return `<div class="field-grid">
    <div class="field"><label>Rutenavn *</label><input data-route-field="name" value="${attr(routeDraft.name)}" placeholder="F.eks. Fjorden rundt"></div>
    <div class="field"><label>Sværhedsgrad</label><select data-route-field="difficulty"><option ${routeDraft.difficulty==='Let'?'selected':''}>Let</option><option ${routeDraft.difficulty==='Middel'?'selected':''}>Middel</option><option ${routeDraft.difficulty==='Svær'?'selected':''}>Svær</option></select></div>
    <div class="field full route-link-field"><label>Delt Google Maps-link</label><input data-route-field="mapsUrl" value="${attr(routeDraft.mapsUrl)}" placeholder="Indsæt linket fra Del → Kopiér link i Google Maps"><small>Brug dette felt, når ruten allerede er lavet og gemt i Google Maps. Linket kan bagefter deles direkte fra appen.</small></div>
    <div class="route-divider full"><span>eller byg ruten med steder</span></div>
    <div class="field"><label>Startsted</label><input data-route-field="origin" value="${attr(routeDraft.origin)}" placeholder="Campingpladsens adresse eller navn"></div>
    <div class="field"><label>Slutsted</label><input data-route-field="destination" value="${attr(routeDraft.destination)}" placeholder="By, adresse eller seværdighed"></div>
    <div class="field full"><label>Stop undervejs</label><input data-route-field="waypoints" value="${attr(routeDraft.waypoints)}" placeholder="Adskil flere stop med semikolon"></div>
    <div class="field"><label>Afstand</label><input data-route-field="distance" value="${attr(routeDraft.distance)}" placeholder="F.eks. 24,6 km"></div>
    <div class="field full"><label>Beskrivelse</label><textarea data-route-field="description" placeholder="Underlag, seværdigheder, pauser og gode råd…">${esc(routeDraft.description)}</textarea></div>
  </div>
  ${routeHasPoints(routeDraft)?`<iframe class="route-map" title="Forhåndsvisning af cykelrute" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${attr(googleRouteEmbedUrl(routeDraft))}"></iframe>`:''}
  <div class="page-actions route-editor-actions" style="margin-top:12px"><a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&travelmode=bicycling">Lav rute i Google Maps ↗</a>${canOpen?`<a class="btn secondary" target="_blank" rel="noopener" href="${attr(routeOpenUrl(routeDraft))}">Forhåndsvis rute ↗</a>`:''}<button type="button" class="btn secondary" data-action="route-clear">Ryd felter</button><button type="button" class="btn primary" data-action="route-save">${routeEditIndex>=0?'Gem ændringer':'Tilføj cykelrute'}</button></div>`;
}
function renderForm(id,status='visited'){
  ensureDraft(id,status);
  const editing=Boolean(id),isVisited=activeDraft.status==='visited';
  return shell(`${pageHeader(editing?'Rediger campingplads':'Ny campingplads',editing?activeDraft.name:(status==='wishlist'?'Tilføj ønskebesøg':'Tilføj campingplads'),'Alle oplysninger kan ændres senere. Appen gemmer først, når du trykker Gem.',`<button class="btn secondary" data-action="form-cancel">← Annuller</button>`)}
    <form id="camp-form">
      <section class="form-card card"><h2>Status</h2><p class="sub">Er pladsen allerede besøgt, eller står den på ønskelisten?</p><div class="segmented"><button type="button" class="${isVisited?'active':''}" data-action="draft-status" data-value="visited">🏕️ Besøgt</button><button type="button" class="${!isVisited?'active':''}" data-action="draft-status" data-value="wishlist">💛 Vil besøge</button></div></section>
      <section class="form-card card"><h2>Campingpladsen</h2><p class="sub">Navn, placering og kontaktoplysninger.</p><div class="field-grid">
        <div class="field full"><label>Navn *</label><input data-draft-field="name" value="${attr(activeDraft.name)}" required placeholder="Campingpladsens navn"></div>
        <div class="field"><label>Land</label><input data-draft-field="country" value="${attr(activeDraft.country)}"></div>
        <div class="field"><label>Region / område</label><input data-draft-field="region" value="${attr(activeDraft.region)}"></div>
        <div class="field"><label>By</label><input data-draft-field="city" value="${attr(activeDraft.city)}"></div>
        <div class="field"><label>Adresse</label><input data-draft-field="address" value="${attr(activeDraft.address)}"></div>
        <div class="field"><label>Hjemmeside</label><input data-draft-field="website" value="${attr(activeDraft.website)}" placeholder="www…"></div>
        <div class="field"><label>Telefon</label><input data-draft-field="phone" value="${attr(activeDraft.phone)}"></div>
      </div>${placeQuery(activeDraft)?`<div class="page-actions" style="justify-content:flex-start;margin-top:12px"><a class="btn secondary small" target="_blank" rel="noopener" href="${attr(googleSearchUrl(placeQuery(activeDraft)))}">🗺️ Find stedet i Google Maps ↗</a></div>`:''}</section>
      <section class="form-card card"><h2>${isVisited?'Besøgsdatoer':'Planlagt besøg'}</h2><p class="sub">${isVisited?'Tilføj alle de gange I har besøgt pladsen.':'Datoen kan ændres eller fjernes senere.'}</p>${isVisited?`<div class="date-list" id="draft-date-list">${draftDateRows()}</div><button type="button" class="btn secondary small" style="margin-top:10px" data-action="draft-date-add">＋ Tilføj dato</button>`:`<div class="field" style="max-width:310px"><label>Planlagt dato</label><input type="date" data-draft-field="plannedDate" value="${attr(activeDraft.plannedDate)}"></div>`}</section>
      <section class="form-card card"><h2>Dagbog og beskrivelse</h2><p class="sub">Skriv om pladsen, omgivelserne og de små ting, I gerne vil huske.</p><div class="field-grid">
        <div class="field full"><label>Beskrivelse</label><textarea data-draft-field="description" rows="5" placeholder="Fortæl om campingpladsen…">${esc(activeDraft.description)}</textarea></div>
        <div class="field full"><label>Private noter</label><textarea data-draft-field="notes" rows="4" placeholder="Pladsnummer, gode råd, huskeliste…">${esc(activeDraft.notes)}</textarea></div>
        <div class="field full"><label>Tags</label><input id="draft-tags" value="${attr((activeDraft.tags||[]).join(', '))}" placeholder="Ved vandet, natur, sommer, hundevenlig"><small>Adskil tags med komma.</small></div>
      </div></section>
      ${isVisited?`<section class="form-card card"><h2>Stjernevurdering</h2><p class="sub">Vurder pladsen fra 1 til 5 stjerner i hver kategori.</p>${formRatingRows()}</section>`:''}
      <section class="form-card card"><h2>Billeder</h2><p class="sub">Billeder komprimeres automatisk, så appen ikke fylder hele campingvognen.</p><div class="photo-grid" id="draft-photo-grid">${draftPhotoGrid()}</div></section>
      <section class="form-card card"><h2>Cykelruter med Google Maps</h2><p class="sub">Byg en rute med start, slut og stop – eller indsæt delingslinket til en rute, der allerede er lavet og gemt i Google Maps.</p><div class="route-list" id="draft-route-list">${draftRoutes()}</div><div class="card" style="padding:15px;margin-top:13px"><h3 style="margin-top:0">${routeEditIndex>=0?'Rediger cykelrute':'Ny cykelrute'}</h3><div id="route-editor">${routeEditorHtml()}</div></div></section>
      <div class="form-actions card"><button type="button" class="btn secondary" data-action="form-cancel">Annuller</button><button type="submit" class="btn primary">💾 Gem campingplads</button></div>
    </form>`,'Rediger');
}

const THEME_PRESETS={
  solskin:{label:'Solskin',primary:'#0f5c4c',accent:'#f47b20',background:'#f5f4ed',swatch:'linear-gradient(135deg,#0f5c4c 0 58%,#f47b20 58%)'},
  fjord:{label:'Fjord',primary:'#155b78',accent:'#f0a21a',background:'#eff6f8',swatch:'linear-gradient(135deg,#155b78 0 58%,#f0a21a 58%)'},
  skov:{label:'Skov',primary:'#315b35',accent:'#d8892a',background:'#f2f4ec',swatch:'linear-gradient(135deg,#315b35 0 58%,#d8892a 58%)'},
  nordisk:{label:'Nordisk',primary:'#3f5563',accent:'#d66b45',background:'#f2f4f5',swatch:'linear-gradient(135deg,#3f5563 0 58%,#d66b45 58%)'},
  aften:{label:'Aften',primary:'#332d55',accent:'#d87534',background:'#f0eef4',swatch:'linear-gradient(135deg,#332d55 0 58%,#d87534 58%)'}
};
function renderSettings(){
  const s=state.settings;
  return shell(`${pageHeader('Tilpas appen','Indstillinger','Skift farver, forside, vurderingskategorier og sikkerhedskopi.')}
    <div class="settings-grid">
      <section class="settings-card card"><h2>App og forside</h2><p class="sub">Navn, overskrift og tekst på overblikket.</p><div class="field-grid">
        <div class="field full"><label>Appens navn</label><input data-setting="appName" value="${attr(s.appName)}"></div>
        <div class="field full"><label>Forsidens overskrift</label><input data-setting="welcomeTitle" value="${attr(s.welcomeTitle)}"></div>
        <div class="field full"><label>Forsidens tekst</label><textarea data-setting="welcomeText">${esc(s.welcomeText)}</textarea></div>
      </div><button class="btn primary" style="margin-top:12px" data-action="settings-save-text">Gem tekster</button></section>

      <section class="settings-card card"><h2>Coverbillede</h2><p class="sub">Vælg et nyt hovedbillede til forsiden.</p><div class="cover-preview" style="background-image:url('${attr(s.coverImage||'assets/cover.jpg')}')"><span>${esc(s.appName)}</span></div><div class="page-actions" style="justify-content:flex-start;margin-top:12px"><label class="btn secondary">📷 Vælg billede<input id="cover-input" type="file" accept="image/*" hidden></label><button class="btn ghost" data-action="cover-reset">Brug standard</button></div></section>

      <section class="settings-card card"><h2>Forsidens layout</h2><p class="sub">Vælg mellem en luftig scrapbogsvisning og et mere kompakt overblik.</p><div class="layout-choices"><button class="layout-choice ${s.dashboardStyle!=='compact'?'active':''}" data-action="dashboard-style" data-value="cards"><span class="layout-icon">▦</span><strong>Luftig</strong><small>Store billeder og god plads</small></button><button class="layout-choice ${s.dashboardStyle==='compact'?'active':''}" data-action="dashboard-style" data-value="compact"><span class="layout-icon">☷</span><strong>Kompakt</strong><small>Mere indhold på skærmen</small></button></div></section>

      <section class="settings-card card"><h2>Tema og farver</h2><p class="sub">Vælg et færdigt tema eller bland jeres egne farver.</p><div class="theme-presets">${Object.entries(THEME_PRESETS).map(([id,t])=>`<button class="theme-preset ${s.theme===id?'active':''}" data-action="theme-preset" data-value="${id}"><div class="theme-swatch" style="background:${t.swatch}"></div><strong>${esc(t.label)}</strong></button>`).join('')}</div><div class="color-grid" style="margin-top:15px"><div class="field"><label>Primær</label><input type="color" data-color-setting="primary" value="${attr(s.primary)}"></div><div class="field"><label>Accent</label><input type="color" data-color-setting="accent" value="${attr(s.accent)}"></div><div class="field"><label>Baggrund</label><input type="color" data-color-setting="background" value="${attr(s.background)}"></div></div></section>

      <section class="settings-card card"><h2>Forsidens indhold</h2><p class="sub">Vis, skjul og flyt sektioner på overblikket.</p><div class="section-list">${s.sections.map((sec,i)=>`<div class="section-row"><input style="width:auto" type="checkbox" data-section-visible="${attr(sec.id)}" ${sec.visible?'checked':''}><div><strong>${esc(sec.label)}</strong></div><button class="btn ghost small" data-action="section-up" data-index="${i}" ${i===0?'disabled':''}>↑</button><button class="btn ghost small" data-action="section-down" data-index="${i}" ${i===s.sections.length-1?'disabled':''}>↓</button></div>`).join('')}</div></section>

      <section class="settings-card card" style="grid-column:1/-1"><h2>Vurderingskategorier</h2><p class="sub">Tilføj, omdøb eller fjern de kategorier, I bruger til stjerner.</p><div class="category-list">${state.categories.map((cat,i)=>`<div class="category-row"><input style="max-width:70px" data-category-icon="${attr(cat.id)}" value="${attr(cat.icon||'⭐')}" aria-label="Ikon"><div><input data-category-name="${attr(cat.id)}" value="${attr(cat.name)}"></div><button class="btn danger small" data-action="category-delete" data-id="${attr(cat.id)}">Slet</button></div>`).join('')}</div><div class="field-grid" style="margin-top:14px"><div class="field"><label>Nyt ikon</label><input id="new-category-icon" value="⭐" maxlength="4"></div><div class="field"><label>Ny kategori</label><input id="new-category-name" placeholder="F.eks. Ro og fred"></div></div><button class="btn primary" style="margin-top:12px" data-action="category-add">＋ Tilføj kategori</button></section>

      <section class="settings-card card"><h2>Sikkerhedskopi</h2><p class="sub">Flyt data mellem computer og tablet, eller gem en kopi.</p><div class="page-actions" style="justify-content:flex-start"><button class="btn primary" data-action="backup-export">⇩ Hent sikkerhedskopi</button><label class="btn secondary">⇧ Indlæs sikkerhedskopi<input id="backup-input" type="file" accept="application/json,.json" hidden></label></div><div class="help-box" style="margin-top:14px">Data gemmes automatisk i browseren på den enhed, du bruger. En JSON-sikkerhedskopi kan flyttes mellem Windows og Samsung-tablet.</div></section>

      <section class="settings-card card danger-zone"><h2>Ryd eller nulstil appen</h2><p class="sub">Start helt tomt, eller gendan de indbyggede eksempler.</p><div class="page-actions" style="justify-content:flex-start"><button class="btn danger" data-action="clear-campsites">Fjern alle campingdata</button><button class="btn secondary" data-action="reset-app">Gendan demodata</button></div></section>
    </div>`,'Indstillinger');
}

function render(){
  const root=$('#app'); if(!root)return;
  const {path,params}=currentRoute();
  let html='';
  if(path==='/'||path==='/overblik')html=renderDashboard();
  else if(path==='/besogte')html=renderList('visited');
  else if(path==='/onskeliste')html=renderList('wishlist');
  else if(path==='/kort')html=renderMap();
  else if(path==='/bedst')html=renderTopRated();
  else if(path==='/indstillinger')html=renderSettings();
  else if(path==='/ny')html=renderForm('',params.get('status')==='wishlist'?'wishlist':'visited');
  else if(path.startsWith('/rediger/'))html=renderForm(decodeURIComponent(path.split('/')[2]||''),'visited');
  else if(path.startsWith('/campingplads/'))html=renderDetail(decodeURIComponent(path.split('/')[2]||''));
  else html=shell(emptyState('🧭','Siden findes ikke','Campingvognen er kørt forkert.','Tilbage til overblik','/overblik'),'Ikke fundet');
  root.innerHTML=html;
  renderModal();renderToast();
}

function renderModal(){
  const root=$('#modal-root');if(!root)return;
  if(!ui.modal){root.innerHTML='';return;}
  if(ui.modal.type==='confirm'){
    root.innerHTML=`<div class="modal-backdrop"><div class="modal"><div class="modal-head"><h2>${esc(ui.modal.title)}</h2><button class="modal-close" data-action="modal-close">×</button></div><p>${esc(ui.modal.text)}</p><div class="page-actions"><button class="btn secondary" data-action="modal-close">Annuller</button><button class="btn danger" data-action="confirm-run">${esc(ui.modal.confirmLabel||'Bekræft')}</button></div></div></div>`;
  } else if(ui.modal.type==='photo'){
    root.innerHTML=`<div class="modal-backdrop" data-action="modal-backdrop"><div class="modal lightbox"><button class="modal-close" data-action="modal-close">×</button><img src="${attr(ui.modal.src)}" alt="Campingbillede"></div></div>`;
  }
}
function confirmAction(title,text,callback,confirmLabel='Bekræft'){
  ui.modal={type:'confirm',title,text,callback,confirmLabel};renderModal();
}

async function compressImage(file,maxSide=1600,quality=.78){
  if(!file.type.startsWith('image/'))throw new Error('Filen er ikke et billede');
  const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
  const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=dataUrl;});
  const scale=Math.min(1,maxSide/Math.max(img.width,img.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
  const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg',quality);
}
function download(filename,text,type='application/json'){
  const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
}
function saveActiveDraft(){
  activeDraft.tags=$('#draft-tags')?.value.split(',').map(x=>x.trim()).filter(Boolean)||[];
  activeDraft.visitDates=(activeDraft.visitDates||[]).filter(Boolean).sort().reverse();
  activeDraft.name=(activeDraft.name||'').trim();
  if(!activeDraft.name){showToast('Skriv campingpladsens navn.','danger');$('#camp-form [data-draft-field="name"]')?.focus();return;}
  const now=new Date().toISOString();
  if(activeDraft.id){
    activeDraft.updatedAt=now;
    state.campsites=state.campsites.map(c=>c.id===activeDraft.id?deepClone(activeDraft):c);
  }else{
    activeDraft.id=uid('camp');activeDraft.createdAt=now;activeDraft.updatedAt=now;
    state.campsites.unshift(deepClone(activeDraft));
  }
  saveState();const id=activeDraft.id;activeDraftKey='';activeDraft=null;showToast('Campingpladsen er gemt');nav(`/campingplads/${encodeURIComponent(id)}`);
}

function updateDraftField(el){
  if(!activeDraft)return;
  const key=el.dataset.draftField;if(!key)return;
  activeDraft[key]=el.type==='checkbox'?el.checked:el.value;
}
function updateRouteField(el){const key=el.dataset.routeField;if(key)routeDraft[key]=el.value;}
function refreshForm(){render();}

document.addEventListener('click',async(event)=>{
  const navEl=event.target.closest('[data-nav]');
  if(navEl){event.preventDefault();nav(navEl.dataset.nav);return;}
  const el=event.target.closest('[data-action]');if(!el)return;
  const action=el.dataset.action;

  if(action==='map-scope'){
    ui.mapScope=el.dataset.value;ui.mapQuery=ui.mapScope==='world'?'Verden':'Europa';render();
  }else if(action==='map-filter'){
    ui.mapFilter=el.dataset.value;render();
  }else if(action==='map-select'){
    ui.mapQuery=el.dataset.query;render();
  }else if(action==='delete-camp'){
    const id=el.dataset.id;const camp=state.campsites.find(c=>c.id===id);if(!camp)return;
    confirmAction('Slet campingplads?',`${camp.name} og alle tilhørende billeder, vurderinger og ruter bliver slettet på denne enhed.`,()=>{state.campsites=state.campsites.filter(c=>c.id!==id);saveState();showToast('Campingpladsen er slettet','danger');nav('/overblik');},'Ja, slet');
  }else if(action==='photo-open'){
    const camp=state.campsites.find(c=>c.id===el.dataset.id);const src=camp?.photos?.[Number(el.dataset.index)];if(src){ui.modal={type:'photo',src};renderModal();}
  }else if(action==='share-route'){
    const camp=state.campsites.find(c=>c.id===el.dataset.camp);const route=camp?.routes?.find(r=>r.id===el.dataset.route);if(route)await shareRoute(route,camp.name);
  }else if(action==='modal-close'||action==='modal-backdrop'){
    ui.modal=null;renderModal();
  }else if(action==='confirm-run'){
    const callback=ui.modal?.callback;ui.modal=null;renderModal();if(typeof callback==='function')callback();
  }else if(action==='draft-status'){
    activeDraft.status=el.dataset.value;
    if(activeDraft.status==='visited'&&!activeDraft.visitDates.length)activeDraft.visitDates=[''];
    refreshForm();
  }else if(action==='draft-rating'){
    const cat=el.dataset.category;const value=Number(el.dataset.value);activeDraft.ratings[cat]=value;refreshForm();
  }else if(action==='draft-date-add'){
    activeDraft.visitDates.push('');refreshForm();
  }else if(action==='draft-date-remove'){
    activeDraft.visitDates.splice(Number(el.dataset.index),1);refreshForm();
  }else if(action==='draft-photo-remove'){
    activeDraft.photos.splice(Number(el.dataset.index),1);refreshForm();
  }else if(action==='route-edit'){
    routeEditIndex=Number(el.dataset.index);routeDraft=deepClone(activeDraft.routes[routeEditIndex]);refreshForm();setTimeout(()=>$('#route-editor')?.scrollIntoView({behavior:'smooth',block:'center'}),50);
  }else if(action==='route-delete'){
    const index=Number(el.dataset.index);activeDraft.routes.splice(index,1);if(routeEditIndex===index){routeEditIndex=-1;routeDraft=blankRoute();}refreshForm();
  }else if(action==='route-clear'){
    routeEditIndex=-1;routeDraft=blankRoute();refreshForm();
  }else if(action==='route-save'){
    const hasSharedLink=Boolean((routeDraft.mapsUrl||'').trim());const hasPoints=routeHasPoints(routeDraft);
    if(!routeDraft.name.trim()||(!hasSharedLink&&!hasPoints)){showToast('Skriv et rutenavn og indsæt enten et Google Maps-link eller både start- og slutsted.','danger');return;}
    const saved={...deepClone(routeDraft),name:routeDraft.name.trim(),mapsUrl:hasSharedLink?normalizeUrl(routeDraft.mapsUrl.trim()):'',id:routeDraft.id||uid('route')};
    if(routeEditIndex>=0)activeDraft.routes[routeEditIndex]=saved;else activeDraft.routes.push(saved);
    routeEditIndex=-1;routeDraft=blankRoute();showToast('Cykelruten er tilføjet');refreshForm();
  }else if(action==='form-cancel'){
    const fallback=activeDraft?.id?`/campingplads/${encodeURIComponent(activeDraft.id)}`:(activeDraft?.status==='wishlist'?'/onskeliste':'/besogte');activeDraftKey='';activeDraft=null;nav(fallback);
  }else if(action==='theme-preset'){
    const id=el.dataset.value,t=THEME_PRESETS[id];if(!t)return;state.settings={...state.settings,theme:id,primary:t.primary,accent:t.accent,background:t.background};saveState();applyTheme();showToast(`Temaet ${t.label} er valgt`);render();
  }else if(action==='dashboard-style'){
    state.settings.dashboardStyle=el.dataset.value==='compact'?'compact':'cards';saveState();showToast('Forsidens layout er ændret');render();
  }else if(action==='settings-save-text'){
    $$('[data-setting]').forEach(input=>state.settings[input.dataset.setting]=input.value.trim());saveState();applyTheme();showToast('Forsidens tekster er gemt');render();
  }else if(action==='cover-reset'){
    state.settings.coverImage='assets/cover.jpg';saveState();showToast('Standardcoveret er gendannet');render();
  }else if(action==='section-up'||action==='section-down'){
    const i=Number(el.dataset.index),j=action==='section-up'?i-1:i+1;const arr=state.settings.sections;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];saveState();render();
  }else if(action==='category-delete'){
    const id=el.dataset.id,cat=state.categories.find(c=>c.id===id);if(!cat)return;
    confirmAction('Slet vurderingskategori?',`Kategorien “${cat.name}” fjernes fra visningen. Eksisterende campingpladser påvirkes ellers ikke.`,()=>{state.categories=state.categories.filter(c=>c.id!==id);saveState();showToast('Kategorien er slettet','danger');render();},'Slet kategori');
  }else if(action==='category-add'){
    const name=$('#new-category-name')?.value.trim(),icon=$('#new-category-icon')?.value.trim()||'⭐';if(!name){showToast('Skriv navnet på den nye kategori.','danger');return;}
    const id=`kategori-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${Date.now().toString(36).slice(-4)}`;
    state.categories.push({id,name,icon});saveState();showToast('Kategorien er tilføjet');render();
  }else if(action==='backup-export'){
    const date=new Date().toISOString().slice(0,10);download(`vores-camping-backup-${date}.json`,JSON.stringify(state,null,2));showToast('Sikkerhedskopien er hentet');
  }else if(action==='clear-campsites'){
    confirmAction('Fjern alle campingdata?','Alle campingpladser, billeder, vurderinger og ruter på denne enhed bliver slettet. Tema, forside og kategorier bevares.',()=>{state.campsites=[];saveState();showToast('Alle campingdata er fjernet','danger');nav('/overblik');},'Ja, fjern alt');
  }else if(action==='reset-app'){
    confirmAction('Gendan demodata?','Alle egne campingpladser, billeder, ruter og indstillinger på denne enhed bliver erstattet af de indbyggede eksempler.',()=>{state=createDefaultState();saveState();applyTheme();showToast('Demodata er gendannet','danger');render();},'Gendan demodata');
  }
});

document.addEventListener('submit',(event)=>{
  if(event.target.id==='camp-form'){event.preventDefault();saveActiveDraft();}
});

document.addEventListener('input',(event)=>{
  const el=event.target;
  if(el.matches('[data-draft-field]'))updateDraftField(el);
  if(el.matches('[data-route-field]'))updateRouteField(el);
  if(el.id==='draft-tags'&&activeDraft)activeDraft.tags=el.value.split(',').map(x=>x.trim()).filter(Boolean);
  if(el.matches('[data-draft-date]')&&activeDraft)activeDraft.visitDates[Number(el.dataset.draftDate)]=el.value;
  if(el.id==='list-search'){
    ui.search=el.value;clearTimeout(ui.searchTimer);const pos=el.selectionStart;ui.searchTimer=setTimeout(()=>{render();const next=$('#list-search');if(next){next.focus();next.setSelectionRange(pos,pos);}},140);
  }
  if(el.matches('[data-color-setting]')){
    const key=el.dataset.colorSetting;state.settings[key]=el.value;state.settings.theme='custom';saveState();applyTheme();
  }
  if(el.matches('[data-category-name]')){
    const cat=state.categories.find(c=>c.id===el.dataset.categoryName);if(cat){cat.name=el.value;saveState();}
  }
  if(el.matches('[data-category-icon]')){
    const cat=state.categories.find(c=>c.id===el.dataset.categoryIcon);if(cat){cat.icon=el.value;saveState();}
  }
});

document.addEventListener('change',async(event)=>{
  const el=event.target;
  if(el.id==='list-sort'){ui.sort=el.value;render();}
  if(el.matches('[data-section-visible]')){
    const sec=state.settings.sections.find(s=>s.id===el.dataset.sectionVisible);if(sec){sec.visible=el.checked;saveState();showToast('Forsidens indhold er opdateret');}
  }
  if(el.id==='draft-photo-input'&&el.files?.length){
    const files=[...el.files];showToast(`Behandler ${files.length} billede${files.length===1?'':'r'}…`);
    try{for(const file of files)activeDraft.photos.push(await compressImage(file));showToast('Billederne er tilføjet');refreshForm();}catch(error){console.error(error);showToast('Et billede kunne ikke læses.','danger');}
  }
  if(el.id==='cover-input'&&el.files?.[0]){
    try{state.settings.coverImage=await compressImage(el.files[0],1900,.82);saveState();showToast('Coverbilledet er ændret');render();}catch(error){console.error(error);showToast('Billedet kunne ikke læses.','danger');}
  }
  if(el.id==='backup-input'&&el.files?.[0]){
    try{
      const text=await el.files[0].text();const imported=JSON.parse(text);
      const normalized=normalizeState(imported,{useDemoFallback:false});if(!normalized)throw new Error('Ugyldig backup');
      confirmAction('Indlæs sikkerhedskopi?','Nuværende data på denne enhed bliver erstattet af indholdet i filen.',()=>{state=normalized;saveState();applyTheme();showToast('Sikkerhedskopien er indlæst');render();},'Indlæs');
    }catch(error){console.error(error);showToast('Filen er ikke en gyldig Vores Camping-sikkerhedskopi.','danger');}
  }
});

window.addEventListener('hashchange',()=>{window.scrollTo(0,0);render();});

async function cleanupOldCaches(){
  try{
    if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.filter(r=>r.scope.includes('/Vores-Camping/')||r.scope.includes('/vores-camping/')).map(r=>r.unregister()));}
    if('caches' in window){const keys=await caches.keys();await Promise.all(keys.filter(k=>/vores.?camping|vc-/i.test(k)).map(k=>caches.delete(k)));}
  }catch(error){console.warn('Kunne ikke rydde gammel cache:',error);}
}

if(!location.hash)history.replaceState(null,'','#/overblik');
applyTheme();render();cleanupOldCaches();
window.__VC_STARTED__=true;
})();
