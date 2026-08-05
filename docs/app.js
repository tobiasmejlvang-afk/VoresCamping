
(() => {
  const STORAGE_KEY = 'voresCampingState_v18';
  const LEGACY_STORAGE_KEYS = ['voresCampingState_v17','voresCampingState_v16','voresCampingState_v15', 'voresCampingState_v14', 'voresCampingState_v13', 'voresCampingState_v12', 'voresCampingState'];
  const CURRENT_VERSION = 18;
  const PRESET_IMAGES = {
    logo: 'assets/logo-main-v18.png',
    logoLarge: 'assets/logo-main-v18.png',
    cover: 'assets/cover-main.png',
    corner: 'assets/corner-mood.png',
    campHero: 'assets/camp-hero.png'
  };
  const DEFAULT_CATEGORIES = [
    { id: 'beliggenhed', name: 'Beliggenhed', icon: '📍' },
    { id: 'service', name: 'Service', icon: '🛎️' },
    { id: 'hundevenlig', name: 'Hundevenlig', icon: '🐾' },
    { id: 'cykelmuligheder', name: 'Cykelmuligheder', icon: '🚴' },
    { id: 'renlighed', name: 'Renlighed', icon: '✨' },
    { id: 'faciliteter', name: 'Faciliteter', icon: '⛺' },
  ];
  const NAV_ITEMS = [
    ['overview', 'Overblik', '🏕️'],
    ['visited', 'Besøgte', '📍'],
    ['map', 'Kort', '🗺️'],
    ['top', 'Bedst bedømte', '🏆'],
    ['wishlist', 'Vil besøge', '💛'],
    ['settings', 'Indstillinger', '⚙️'],
  ];
  const QUICK_ACTIONS = {
    search: 'search',
    addVisited: 'add?status=visited',
    addWish: 'add?status=wish',
    bigMap: 'map',
    settings: 'settings',
    addRoute: 'route-edit/new'
  };
  const QUICK_ACTION_META = {
    search: { label: 'Find campingplads', asset: 'assets/action-search-v18.svg' },
    addVisited: { label: 'Tilføj besøg', asset: 'assets/action-visited-v18.svg' },
    addWish: { label: 'Tilføj ønske', asset: 'assets/action-wish-v18.svg' },
    addRoute: { label: 'Ny cykelrute', asset: 'assets/action-route-v18.svg' },
    bigMap: { label: 'Åbn stort kort', asset: 'assets/action-map-v18.svg' },
    settings: { label: 'Indstillinger', asset: 'assets/action-settings-v18.svg' }
  };

  let state = loadState();
  let maps = {};
  let detailRouteGeoJSON = null;
  let activeRouteEditor = null;
  const secrets = loadSecrets();
  const weatherState = {
    status: 'Henter vejr…',
    summary: 'Finder aktuel placering…',
    locationLabel: 'Aktuel placering',
    fetchedAt: 0,
    coords: null,
    code: 0
  };
  const ors = window.VCORS.createClient({ getApiKey: () => secrets.orsKey || state?.settings?.api?.orsKey || '' });
  window.addEventListener('hashchange', renderRoute);
  document.addEventListener('click', handleGlobalClicks);
  init();

  function init(){
    cleanupServiceWorkers();
    migrateState();
    renderNav();
    renderBottomNav();
    try { renderQuickDock(); } catch (err) { console.error('Hurtighandlinger kunne ikke vises', err); }
    renderRoute();
    window.setInterval(updateLiveInfoDisplays, 1000);
    refreshWeather();
  }

  function loadState(){
    const keys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (err) {
        console.warn(`Kunne ikke læse ${key}`, err);
      }
    }
    return seedState();
  }

  function loadSecrets(){
    try {
      return JSON.parse(localStorage.getItem('voresCampingSecrets_v18') || localStorage.getItem('voresCampingSecrets_v17') || localStorage.getItem('voresCampingSecrets_v16') || localStorage.getItem('voresCampingSecrets_v15') || localStorage.getItem('voresCampingSecrets_v14') || '{}');
    } catch (_) {
      return {};
    }
  }

  function saveSecrets(){
    try {
      localStorage.setItem('voresCampingSecrets_v18', JSON.stringify(secrets));
    } catch (err) {
      console.warn('API-nøgler kunne ikke gemmes lokalt.', err);
    }
  }

  function seedState(){
    const catIds = Object.fromEntries(DEFAULT_CATEGORIES.map(c => [c.id, c]));
    const img1 = PRESET_IMAGES.campHero;
    const img2 = PRESET_IMAGES.cover;
    const nowYear = new Date().getFullYear();
    return {
      version: CURRENT_VERSION,
      settings: {
        appName: 'Vores Camping',
        tagline: 'Stener og Vibekes campingunivers',
        greeting: '',
        intro: 'Her er jeres personlige camping-overblik',
        themeMode: 'light',
        accent: '#1f5f3c',
        fontScale: 1,
        compact: true,
        mapStyle: 'liberty',
        mapScope: 'europe',
        showCountdown: true,
        nextTripName: 'Norge 2026',
        nextTripDate: `${nowYear+1}-07-15T08:00:00`,
        coverImage: PRESET_IMAGES.cover,
        cornerImage: PRESET_IMAGES.corner,
        logo: PRESET_IMAGES.logo,
        heroImage: PRESET_IMAGES.cover,
        family: {
          fatherName: 'Stener Sørensen',
          fatherBirth: '1952-11-11',
          motherName: 'Vibeke Mejlvang',
          motherNick: 'Vibse',
          motherBirth: '1960-03-20',
          dogName: 'Sisi',
          dogBirth: '2020-01-01',
          motto: 'Vores ture, vores frihed, vores minder',
          useNickname: true,
          showBirthdays: true
        },
        heroClock: {
          enabled: true,
          showDate: true,
          showWeather: true,
          useCurrentLocation: true,
          title: 'Lokal tid og vejr',
          subtitle: 'Lige nu hvor I er'
        },
        routeDefaults: {
          profile: 'cycling-regular',
          surface: 'Blandet',
          routeType: 'Rundtur',
          pauseMin: 20,
          avoidTraffic: false,
          preferScenic: true,
        },
        sections: [
          'map','stats','latest','top','wishlist','routes'
        ],
        api: {
          orsKey: '',
          googleMapsKey: '',
          fallbackMap: 'google'
        }
      },
      categories: DEFAULT_CATEGORIES,
      campsites: [
        makeSite({id:'site1',status:'visited',name:'Lystbækgård Camping',city:'Thyholm',region:'Midtjylland',country:'Danmark',coords:{lat:56.686,lng:8.519},tags:['Natur','Ved vandet','Hundevenlig'],images:[img2],visits:['2025-05-12'],ratings:{beliggenhed:5,service:4.8,hundevenlig:5,cykelmuligheder:4.7,renlighed:4.8,faciliteter:4.9},description:'Hyggelig plads tæt på natur og vand med rolig stemning.',notes:'Sisi elskede området. God plads til afslapning.',website:'https://example.com',phone:'+45 12121212',attractions:[{name:'Fjordstien',description:'Smuk tur langs vandet.'}],routeIds:['r1','r2'],favorite:true}),
        makeSite({id:'site2',status:'visited',name:'Moselcamping Cochem',city:'Cochem',region:'Rheinland-Pfalz',country:'Tyskland',coords:{lat:50.145,lng:7.167},tags:['Ved flod','Cykelruter','Tæt på by'],images:[img1],visits:['2025-05-03'],ratings:{beliggenhed:4.9,service:4.8,hundevenlig:4.5,cykelmuligheder:4.9,renlighed:4.8,faciliteter:4.6},description:'Skøn udsigt over Mosel og mange cykelmuligheder.',notes:'Fantastisk vinområde.',attractions:[{name:'Reichsburg Cochem',description:'Historisk borg med udsigt.'}],routeIds:['r3'],favorite:false}),
        makeSite({id:'site3',status:'visited',name:'Camping Bella Austria',city:'Steindorf',region:'Steiermark',country:'Østrig',coords:{lat:47.074,lng:14.102},tags:['Bjerge','Natur','Cykelruter'],images:[img2],visits:['2025-04-18'],ratings:{beliggenhed:4.8,service:4.7,hundevenlig:4.3,cykelmuligheder:4.8,renlighed:4.7,faciliteter:4.6},description:'Bjergluft og fantastiske vandreture.',routeIds:[],favorite:false}),
        makeSite({id:'site4',status:'visited',name:'Århus Camping',city:'Århus',region:'Midtjylland',country:'Danmark',coords:{lat:56.162,lng:10.203},tags:['By tæt på','Hundevenlig'],images:[img1],visits:['2025-04-20'],ratings:{beliggenhed:4.4,service:4.5,hundevenlig:4.8,cykelmuligheder:4.9,renlighed:4.5,faciliteter:4.3},description:'Fin bynær plads med adgang til cykeloplevelser.',routeIds:['r4'],favorite:true}),
        makeSite({id:'site5',status:'visited',name:'Camping de la Plage',city:'Bretagne',region:'Bretagne',country:'Frankrig',coords:{lat:48.624,lng:-2.024},tags:['Ved havet','Natur','Familievenlig'],images:[img2],visits:['2025-03-15'],ratings:{beliggenhed:4.6,service:4.4,hundevenlig:4.1,cykelmuligheder:4.2,renlighed:4.5,faciliteter:4.4},description:'Tæt på havet med skønne udsigter.',routeIds:[],favorite:false}),
        makeSite({id:'site6',status:'visited',name:'Camping Park Umag',city:'Umag',region:'Istrien',country:'Kroatien',coords:{lat:45.499,lng:13.549},tags:['Ved vandet','Cykelruter','Familievenlig'],images:[img1],visits:['2025-03-07'],ratings:{beliggenhed:4.7,service:4.8,hundevenlig:4.6,cykelmuligheder:4.5,renlighed:4.8,faciliteter:4.7},description:'Stor plads med mange faciliteter.',routeIds:[],favorite:false}),
        makeSite({id:'site7',status:'wish',name:'Camping Jungfrau',city:'Interlaken',region:'Bern',country:'Schweiz',coords:{lat:46.686,lng:7.863},tags:['Bjerge','Natur','Søudsigt'],images:[img2],plannedDate:'2026-08-14',description:'Fantastisk udsigt til bjergene ved søen.',notes:'Skal være en sommerdrøm.',favorite:true}),
        makeSite({id:'site8',status:'wish',name:'Campingplatz Seeblick',city:'Salzkammergut',region:'Oberösterreich',country:'Østrig',coords:{lat:47.841,lng:13.623},tags:['Ved sø','Natur','Hundevenlig'],images:[img1],plannedDate:'2026-09-10',description:'Ro ved søen – perfekt til efterårsture.'}),
        makeSite({id:'site9',status:'wish',name:'Camping Le Paradis',city:'Canet-en-Roussillon',region:'Occitanie',country:'Frankrig',coords:{lat:42.699,lng:3.016},tags:['Ved havet','Familievenlig','Cykelruter'],images:[img2],plannedDate:'2026-07-12',description:'Tæt på strand og markeder.'}),
        makeSite({id:'site10',status:'wish',name:'Nordkap Camping',city:'Nordkapp',region:'Finnmark',country:'Norge',coords:{lat:70.978,lng:25.974},tags:['Natur','Eventyr','Cykelruter'],images:[img1],plannedDate:'2026-07-15',description:'Drømmen om Nordkap.'}),
      ],
      routes: [
        { id:'r1', siteId:'site1', name:'Skamlingevejen', start:'Lystbækgård', end:'Skamling', waypoints:[], difficulty:'Naturskøn', description:'Rolig rute gennem natur.', distanceKm:48, durationMin:165, googleMapsUrl:'', geojson:null },
        { id:'r2', siteId:'site1', name:'Kystvejen Rute', start:'Thyholm', end:'Kyststien', waypoints:[], difficulty:'Familievenlig', description:'Let tur med kig til vandet.', distanceKm:62, durationMin:210, googleMapsUrl:'', geojson:null },
        { id:'r3', siteId:'site2', name:'Stien Åres rundt', start:'Cochem', end:'Mosel', waypoints:[], difficulty:'Let', description:'Rundtur i området.', distanceKm:44, durationMin:150, googleMapsUrl:'', geojson:null },
        { id:'r4', siteId:'site4', name:'Klitstien Rute', start:'Århus', end:'Skovkanten', waypoints:[], difficulty:'Udfordrende', description:'Mere kuperet rute.', distanceKm:52, durationMin:190, googleMapsUrl:'', geojson:null },
      ],
      ui: { lastRoute: 'overview', sortVisited:'latest', searchVisited:'', mapFilter:'all', wishFilter:'all' }
    };
  }

  function makeSite(p = {}){
    const rawStatus = String(p.status || p.type || p.kind || '').toLowerCase();
    const status = ['wish','wishlist','ønske','ønskebesøg','vil besøge'].some(value => rawStatus.includes(value)) ? 'wish' : 'visited';
    const sourceCoords = p.coords || p.coordinates || p.location || {};
    let lat = sourceCoords.lat ?? sourceCoords.latitude ?? p.lat ?? p.latitude ?? '';
    let lng = sourceCoords.lng ?? sourceCoords.lon ?? sourceCoords.longitude ?? p.lng ?? p.lon ?? p.longitude ?? '';
    if (Array.isArray(sourceCoords)) { lng = sourceCoords[0] ?? ''; lat = sourceCoords[1] ?? ''; }
    const images = Array.isArray(p.images) ? p.images : Array.isArray(p.photos) ? p.photos : [p.image || p.coverImage].filter(Boolean);
    const visits = Array.isArray(p.visits) ? p.visits : Array.isArray(p.visitDates) ? p.visitDates : Array.isArray(p.visitedDates) ? p.visitedDates : [p.visitDate || p.date].filter(Boolean);
    const tags = Array.isArray(p.tags) ? p.tags : typeof p.tags === 'string' ? splitCsv(p.tags) : Array.isArray(p.labels) ? p.labels : [];
    const attractions = Array.isArray(p.attractions) ? p.attractions : Array.isArray(p.sights) ? p.sights : [];
    return {
      id: p.id || uid(), status,
      name: p.name || p.title || '', address: p.address || p.street || '', postcode: p.postcode || p.postalCode || '',
      city: p.city || p.locality || '', region: p.region || p.area || '', country: p.country || '',
      website: p.website || p.url || '', phone: p.phone || p.telephone || '',
      coords: { lat: parseCoord(lat), lng: parseCoord(lng) },
      description: p.description || '', notes: p.notes || p.privateNotes || '',
      tags, images, visits, plannedDate: p.plannedDate || p.expectedDate || '',
      ratings: p.ratings || p.vurderinger || {}, attractions,
      routeIds: Array.isArray(p.routeIds) ? p.routeIds : [], favorite: Boolean(p.favorite || p.favourite),
    };
  }

  function migrateState(){
    const defaults = seedState();
    if (!state || typeof state !== 'object') state = defaults;
    state.settings = { ...defaults.settings, ...(state.settings || {}) };
    state.settings.api = { ...defaults.settings.api, ...(state.settings.api || {}) };
    state.settings.routeDefaults = { ...defaults.settings.routeDefaults, ...(state.settings.routeDefaults || {}) };
    state.settings.family = { ...defaults.settings.family, ...(state.settings.family || {}) };
    state.settings.heroClock = { ...defaults.settings.heroClock, ...(state.settings.heroClock || {}) };
    if (!window.VCMaps.styles[state.settings.mapStyle]) state.settings.mapStyle = 'liberty';
    if (!state.version || state.version < CURRENT_VERSION || /logo-badge-large|logo-main\.png/.test(String(state.settings.logo || ''))) state.settings.logo = PRESET_IMAGES.logo;
    if (state.version < 18) {
      if (['Hej Stener, Vibeke og Sisi','Godmorgen Sisi & Jan'].includes(state.settings.greeting)) state.settings.greeting = '';
      if (['Her er jeres personlige camping-overblik','Her er jeres camping-overblik'].includes(state.settings.intro)) state.settings.intro = defaults.settings.intro;
      if (!state.settings.family.motto) state.settings.family.motto = defaults.settings.family.motto;
    }
    if (!Array.isArray(state.settings.sections)) state.settings.sections = [...defaults.settings.sections];
    if (!Array.isArray(state.categories) || !state.categories.length) state.categories = structuredClone(DEFAULT_CATEGORIES);
    if (!Array.isArray(state.campsites)) state.campsites = Array.isArray(state.campgrounds) ? state.campgrounds : Array.isArray(state.places) ? state.places : [];
    if (!Array.isArray(state.routes)) state.routes = Array.isArray(state.cycleRoutes) ? state.cycleRoutes : [];
    state.campsites = state.campsites.map(site => makeSite(site));
    state.routes = state.routes.map(route => ({
      id: route.id || uid(), siteId: route.siteId || '', name: route.name || 'Ny cykelrute',
      start: route.start || '', end: route.end || '', waypoints: Array.isArray(route.waypoints) ? route.waypoints : [],
      points: Array.isArray(route.points) ? route.points : [], profile: route.profile || state.settings.routeDefaults?.profile || 'cycling-regular',
      difficulty: route.difficulty || 'Let', description: route.description || '', distanceKm: route.distanceKm || '',
      durationMin: route.durationMin || '', ascentM: route.ascentM || '', descentM: route.descentM || '',
      googleMapsUrl: route.googleMapsUrl || '', geojson: route.geojson || null, isochrone: route.isochrone || null,
      surface: route.surface || state.settings.routeDefaults?.surface || 'Blandet', routeType: route.routeType || state.settings.routeDefaults?.routeType || 'Rundtur',
      pauseMin: Number(route.pauseMin ?? state.settings.routeDefaults?.pauseMin ?? 20), roundTrip: route.roundTrip ?? true, preferScenic: route.preferScenic ?? state.settings.routeDefaults?.preferScenic ?? true,
      avoidTraffic: route.avoidTraffic ?? state.settings.routeDefaults?.avoidTraffic ?? false, notes: route.notes || '', highlights: Array.isArray(route.highlights) ? route.highlights : [],
    }));
    state.ui = { ...defaults.ui, ...(state.ui || {}) };
    if (state.settings.api?.orsKey && !secrets.orsKey) secrets.orsKey = state.settings.api.orsKey;
    if (state.settings.api?.googleMapsKey && !secrets.googleMapsKey) secrets.googleMapsKey = state.settings.api.googleMapsKey;
    state.settings.api.orsKey = '';
    state.settings.api.googleMapsKey = '';
    saveSecrets();
    state.version = CURRENT_VERSION;
    applyThemeVars();
    saveState(false);
  }

  function saveState(showMessage = true){
    try {
      const safeState = structuredClone(state);
      if (safeState.settings?.api) {
        safeState.settings.api.orsKey = '';
        safeState.settings.api.googleMapsKey = '';
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
      applyThemeVars();
      return true;
    } catch (err) {
      console.error(err);
      if (showMessage) {
        const quota = err?.name === 'QuotaExceededError';
        showError(quota ? 'Browserens lager er fyldt. Eksportér en backup og fjern nogle store billeder.' : 'Data kunne ikke gemmes lokalt.');
      }
      return false;
    }
  }

  function applyThemeVars(){
    document.documentElement.style.setProperty('--font-scale', String(state.settings.fontScale || 1));
    if (state.settings.accent) document.documentElement.style.setProperty('--green', state.settings.accent);
    document.title = state.settings.appName || 'Vores Camping';
  }

  function uid(){ return 'id_' + Math.random().toString(36).slice(2,10); }
  function esc(s=''){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function safeUrl(value=''){ try { const url=new URL(String(value),location.href); return ['http:','https:'].includes(url.protocol) ? url.href : ''; } catch(_) { return ''; } }
  function safePhone(value=''){ return String(value||'').replace(/[^+0-9 ()-]/g,''); }
  function toast(msg){ const el = qs('#toast'); el.textContent = msg; el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 2600); }
  function showError(msg){ const el = qs('#error-banner'); el.innerHTML = `<div>${esc(msg)}</div>`; el.classList.remove('hidden'); }
  function clearError(){ qs('#error-banner').classList.add('hidden'); qs('#error-banner').innerHTML=''; }
  function qs(sel, parent=document){ return parent.querySelector(sel); }
  function qsa(sel, parent=document){ return [...parent.querySelectorAll(sel)]; }
  function formatDate(date){ if(!date) return ''; const d=new Date(date); if(Number.isNaN(+d)) return date; return d.toLocaleDateString('da-DK',{day:'numeric',month:'short',year:'numeric'}); }
  function averageRating(site){
    const vals = Object.values(site.ratings || {}).map(Number).filter(v => Number.isFinite(v) && v > 0);
    return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
  }
  function siteWithComputed(site){ return { ...site, average: averageRating(site), latestVisit: latestVisit(site) }; }
  function latestVisit(site){ return (site.visits || []).slice().sort().reverse()[0] || ''; }
  function stats(){
    const visited = state.campsites.filter(s => s.status === 'visited');
    const wish = state.campsites.filter(s => s.status === 'wish');
    const countries = new Set(visited.map(s => s.country).filter(Boolean));
    return { visited: visited.length, wish: wish.length, countries: countries.size, routes: state.routes.length };
  }
  function getSortedVisited(mode='latest'){
    const items = state.campsites.filter(s => s.status === 'visited').map(siteWithComputed);
    if (mode === 'rating') items.sort((a,b) => b.average - a.average || a.name.localeCompare(b.name,'da'));
    else if (mode === 'name') items.sort((a,b) => a.name.localeCompare(b.name,'da'));
    else items.sort((a,b) => String(b.latestVisit).localeCompare(String(a.latestVisit)));
    return items;
  }
  function getWishlist(){ return state.campsites.filter(s => s.status === 'wish').map(siteWithComputed).sort((a,b)=> String(a.plannedDate||'9999').localeCompare(String(b.plannedDate||'9999'))); }
  function getSite(id){ return state.campsites.find(s => s.id === id); }
  function getRoute(id){ return state.routes.find(r => r.id === id); }
  function countryLine(site){ return [site.city, site.region, site.country].filter(Boolean).join(', '); }
  function googleMapsLink(siteOrCoords){
    const lng = siteOrCoords.coords ? siteOrCoords.coords.lng : siteOrCoords.lng;
    const lat = siteOrCoords.coords ? siteOrCoords.coords.lat : siteOrCoords.lat;
    if (lng && lat) return `https://www.google.com/maps?q=${lat},${lng}`;
    const q = encodeURIComponent([siteOrCoords.name, siteOrCoords.city, siteOrCoords.country].filter(Boolean).join(', '));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }
  function confirmAction(title, message){
    return new Promise(resolve => {
      const dialog = qs('#confirm-dialog');
      qs('#confirm-title').textContent = title;
      qs('#confirm-message').textContent = message;
      dialog.onclose = () => resolve(dialog.returnValue === 'confirm');
      dialog.showModal();
    });
  }
  async function cleanupServiceWorkers(){
    if ('serviceWorker' in navigator) {
      try { const regs = await navigator.serviceWorker.getRegistrations(); regs.forEach(r => r.unregister()); } catch (e) {}
    }
  }

  function firstName(name=''){ return String(name).trim().split(/\s+/)[0] || ''; }
  function familyMotherName(){
    const family = state.settings.family || {};
    return family.useNickname !== false && family.motherNick ? family.motherNick : firstName(family.motherName || 'Vibeke');
  }
  function personalGreeting(){
    const configured = String(state.settings.greeting || '').trim();
    if (configured) return configured;
    const hour = new Date().getHours();
    const salutation = hour < 10 ? 'Godmorgen' : hour < 17 ? 'God eftermiddag' : 'Godaften';
    const family = state.settings.family || {};
    return `${salutation} ${firstName(family.fatherName || 'Stener')} & ${familyMotherName()}`;
  }
  function ageFromBirth(value){
    if (!value) return '';
    const date = new Date(value.length === 4 ? `${value}-01-01` : value);
    if (Number.isNaN(+date)) return '';
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const beforeBirthday = now.getMonth() < date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
    if (beforeBirthday) age -= 1;
    return Math.max(0, age);
  }
  function birthdayText(value, yearOnly=false){
    if (!value) return '';
    if (yearOnly || /^\d{4}$/.test(value)) return String(value).slice(0,4);
    const date = new Date(value);
    if (Number.isNaN(+date)) return value;
    return date.toLocaleDateString('da-DK',{day:'numeric',month:'long',year:'numeric'});
  }
  function familyMemberCard(kind, name, birth, icon, yearOnly=false){
    const age = yearOnly ? '' : ageFromBirth(birth);
    const birthLabel = birth ? (yearOnly ? `Født ${String(birth).slice(0,4)}` : birthdayText(birth,false)) : '';
    return `<div class="family-member family-member--${kind}"><span class="family-member-icon">${icon}</span><div><small>${kind==='dog'?'Firbenet rejsemakker':kind==='father'?'Far og chauffør':'Mor og campingleder'}</small><strong>${esc(name)}</strong><span>${esc(birthLabel)}${age!=='' ? ` · ${age} år` : ''}</span></div></div>`;
  }



function renderNav(){
  const current = currentRoute().name;
  const next = countdownInfo();
  const s = stats();
  const family = state.settings.family || {};
  qs('#sidebar').innerHTML = `
    <div class="sidebar-card brand-card">
      <div class="brand-logo"><img src="${state.settings.logo || PRESET_IMAGES.logoLarge}" alt="Vores Camping-logo"></div>
      <div class="brand-copy">
        <span class="brand-kicker">${esc(state.settings.tagline)}</span>
        <h2>${esc(personalGreeting())}</h2>
        <p class="brand-sub">${esc(family.motto || state.settings.intro)}</p>
      </div>
      <div class="family-chip-row">
        <span class="family-chip family-chip--stener">S · ${esc(firstName(family.fatherName || 'Stener'))}</span>
        <span class="family-chip family-chip--vibse">V · ${esc(familyMotherName())}</span>
        <span class="family-chip family-chip--sisi">🐾 ${esc(family.dogName || 'Sisi')}</span>
      </div>
      <div class="nav-list">
        ${NAV_ITEMS.map(([key,label,icon]) => `<button class="nav-item ${current===key?'active':''}" data-nav="${key}"><span class="icon">${icon}</span><span>${label}</span></button>`).join('')}
      </div>
    </div>
    <div class="sidebar-card sidebar-mini countdown-sidebar-card">
      <div class="sidebar-section-title"><span>Næste campingtur</span><span>🏕️</span></div>
      ${miniCountdown(next)}
      <div class="soft-divider"></div>
      <div class="next-trip-copy"><strong>${esc(state.settings.nextTripName)}</strong><span>${formatDate(state.settings.nextTripDate)}</span></div>
    </div>
    <div class="sidebar-card sidebar-mini family-sidebar-card">
      <div class="sidebar-section-title"><span>Familien bag appen</span><span>♡</span></div>
      <div class="personal-lines">
        <div><span class="person-dot person-dot--father"></span><span>${esc(family.fatherName || 'Stener Sørensen')}</span><strong>${family.showBirthdays === false ? 'Far' : ageFromBirth(family.fatherBirth)+' år'}</strong></div>
        <div><span class="person-dot person-dot--mother"></span><span>${esc(family.motherName || 'Vibeke Mejlvang')}</span><strong>${family.showBirthdays === false ? 'Mor' : ageFromBirth(family.motherBirth)+' år'}</strong></div>
        <div><span class="person-dot person-dot--dog"></span><span>${esc(family.dogName || 'Sisi')}</span><strong>fra ${String(family.dogBirth || '2020').slice(0,4)}</strong></div>
      </div>
    </div>
    <div class="sidebar-card sidebar-mini">
      <div class="sidebar-section-title"><span>Hurtige tal</span><span>↗</span></div>
      <div class="mini-stat-grid">
        <div><strong>${s.visited}</strong><span>Besøgte</span></div>
        <div><strong>${s.wish}</strong><span>Ønsker</span></div>
        <div><strong>${s.countries}</strong><span>Lande</span></div>
        <div><strong>${s.routes}</strong><span>Ruter</span></div>
      </div>
    </div>`;
}

function renderBottomNav(){


    const current = currentRoute().name;
    qs('#bottom-nav').innerHTML = NAV_ITEMS.map(([key,label,icon]) => `<button class="${current===key?'active':''}" data-nav="${key}">${icon} ${label}</button>`).join('');
  }

  function renderQuickDock(){
    const dock = qs('#quick-dock');
    if (!dock) return;
    const actions = ['search','addVisited','addWish','addRoute','bigMap','settings'];
    dock.innerHTML = actions.map(action => quickDockButton(action)).join('');
  }

  function navigate(hash){ location.hash = '#' + hash; }
  function currentRoute(){
    const raw = (location.hash || '#overview').slice(1);
    const [path, query=''] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const params = Object.fromEntries(new URLSearchParams(query).entries());
    return { raw, name: parts[0] || 'overview', id: parts[1], params };
  }

  function setHeader(title, subtitle){
    qs('#page-title').textContent = title;
    qs('#page-subtitle').textContent = subtitle;
  }

  async function renderRoute(){
    clearError();
    cleanupActiveMaps();
    renderNav();
    renderBottomNav();
    const view = qs('#view');
    try {
      const route = currentRoute();
      document.body.dataset.route = route.name;
      state.ui.lastRoute = route.name;
      if (route.name === 'overview') renderOverview(view);
      else if (route.name === 'visited') renderVisited(view);
      else if (route.name === 'map') renderMapPage(view);
      else if (route.name === 'top') renderTop(view);
      else if (route.name === 'wishlist') renderWishlist(view);
      else if (route.name === 'settings') renderSettings(view);
      else if (route.name === 'add') renderSiteForm(view, null, route.params.status || 'visited', route.params.prefillId || null);
      else if (route.name === 'edit') renderSiteForm(view, route.id, null, null);
      else if (route.name === 'detail') renderDetail(view, route.id);
      else if (route.name === 'search') renderSearch(view);
      else if (route.name === 'route') renderRouteDetail(view, route.id);
      else if (route.name === 'route-edit') renderAdvancedRouteEditor(view, route.id, route.params.siteId || '');
      else renderOverview(view);
      try { renderQuickDock(); } catch (dockError) { console.error('Hurtighandlinger kunne ikke opdateres', dockError); }
      window.requestAnimationFrame(updateLiveInfoDisplays);
    } catch (err) {
      console.error(err);
      showError(`Der opstod en fejl: ${err?.message || 'ukendt fejl'}. Menuen virker stadig, så appen ender ikke som en tom hvid skærm.`);
    }
  }

  function cleanupActiveMaps(){
    if (activeRouteEditor) {
      try { activeRouteEditor.destroy(); } catch (_) {}
      activeRouteEditor = null;
    }
    ['overview-map','big-map','detail-map','route-map','route-editor-map','point-picker-map'].forEach(id => {
      try { window.VCMaps.destroyMap(id); } catch (_) {}
    });
    maps = {};
  }



function renderOverview(view){
  const family = state.settings.family || {};
  setHeader(state.settings.appName || 'Vores Camping', state.settings.intro);
  const s = stats();
  const latest = getSortedVisited('latest').slice(0,3);
  const best = getSortedVisited('rating').slice(0,3);
  const wishes = getWishlist().slice(0,3);
  const routes = state.routes.slice(0,4);
  const sections = new Set(state.settings.sections || []);
  const nextWish = getWishlist().slice().sort((a,b) => String(a.plannedDate||'9999').localeCompare(String(b.plannedDate||'9999')))[0];
  const bestPlace = best[0];
  const recentRoute = routes[0];
  view.innerHTML = `
    <div class="view-grid overview-page ${state.settings.compact ? 'is-compact' : 'is-airy'}">
      <section class="dashboard-hero card dashboard-hero-v18">
        <div class="dashboard-hero-image" style="background-image:linear-gradient(90deg,rgba(19,50,33,.93) 0%,rgba(19,50,33,.72) 38%,rgba(19,50,33,.16) 72%,rgba(19,50,33,.03) 100%),url('${state.settings.coverImage || PRESET_IMAGES.cover}')">
          <div class="dashboard-welcome dashboard-welcome-v18">
            <div class="hero-family-row">
              <span class="hero-family-avatar hero-family-avatar--father">S</span>
              <span class="hero-family-avatar hero-family-avatar--mother">V</span>
              <span class="hero-family-avatar hero-family-avatar--dog">🐾</span>
              <span>${esc(firstName(family.fatherName || 'Stener'))}, ${esc(familyMotherName())} & ${esc(family.dogName || 'Sisi')}</span>
            </div>
            <span class="eyebrow">${esc(state.settings.tagline)}</span>
            <h2>${esc(personalGreeting())}</h2>
            <p>${esc(family.motto || 'Vores ture, vores frihed, vores minder')}</p>
            <div class="hero-personal-meta">
              <span><b>Campingdagbog</b><small>Jeres minder samlet ét sted</small></span>
              <span><b>${esc(state.settings.nextTripName)}</b><small>Næste tur · ${formatDate(state.settings.nextTripDate)}</small></span>
              <span><b>${s.visited} steder</b><small>Besøgt og gemt</small></span>
            </div>
          </div>
          ${state.settings.heroClock?.enabled === false ? '' : `<div class="hero-clock-card hero-clock-card-v18" id="hero-live-card">
            <div class="weather-icon-orbit"><span data-live-weather-icon>☀️</span></div>
            <span class="eyebrow">${esc(state.settings.heroClock?.title || 'Lokal tid og vejr')}</span>
            <div class="hero-clock-time" data-live-clock-time>--:--</div>
            <div class="hero-clock-date" data-live-clock-date>Dato opdateres…</div>
            <div class="hero-weather-wrap">
              <strong data-live-location>${esc(state.settings.heroClock?.subtitle || 'Aktuel placering')}</strong>
              <span data-live-weather>Henter vejr…</span>
            </div>
            <button class="ghost-btn compact-ghost" data-refresh-weather>↻ Opdatér vejr</button>
          </div>`}
          <img class="hero-brand-watermark" src="${state.settings.logo || PRESET_IMAGES.logo}" alt="" aria-hidden="true">
        </div>
      </section>

      <section class="family-story-strip card">
        <div class="family-story-copy">
          <span class="eyebrow dark">Helt jeres egen app</span>
          <strong>Campinglivet med Stener, Vibse og Sisi</strong>
          <span>${esc(state.settings.intro)}</span>
        </div>
        ${familyMemberCard('father', family.fatherName || 'Stener Sørensen', family.showBirthdays === false ? '' : family.fatherBirth, '🚙')}
        ${familyMemberCard('mother', `${family.useNickname !== false && family.motherNick ? '('+family.motherNick+') ' : ''}${family.motherName || 'Vibeke Mejlvang'}`, family.showBirthdays === false ? '' : family.motherBirth, '☕')}
        ${familyMemberCard('dog', family.dogName || 'Sisi', family.showBirthdays === false ? '' : (family.dogBirth || '2020'), '🐾', true)}
      </section>

      <section class="overview-pulse card overview-pulse-v18">
        <div class="pulse-intro"><span class="eyebrow dark">Campingpulsen</span><strong>Det næste kapitel i jeres rejsebog</strong><span>Genvejene bor fast i bunden. Her får I kun det vigtigste overblik — uden knap-kaos og campingplads-Tetris.</span></div>
        <button class="pulse-item" data-nav="${nextWish ? 'detail/'+nextWish.id : 'wishlist'}"><span class="pulse-icon pulse-icon--wish">♥</span><div><small>Næste sted på ønskelisten</small><strong>${esc(nextWish?.name || 'Tilføj et nyt ønske')}</strong><span>${nextWish?.plannedDate ? formatDate(nextWish.plannedDate) : 'Ingen dato valgt endnu'}</span></div></button>
        <button class="pulse-item" data-nav="${bestPlace ? 'detail/'+bestPlace.id : 'top'}"><span class="pulse-icon pulse-icon--top">★</span><div><small>Stener & Vibses favorit</small><strong>${esc(bestPlace?.name || 'Bedøm jeres besøg')}</strong><span>${bestPlace?.average ? `${bestPlace.average.toFixed(1).replace('.',',')} stjerner` : 'Ingen vurdering endnu'}</span></div></button>
        <button class="pulse-item" data-nav="${recentRoute ? 'route/'+recentRoute.id : 'route-edit/new'}"><span class="pulse-icon pulse-icon--route">⌁</span><div><small>Seneste tur på to hjul</small><strong>${esc(recentRoute?.name || 'Opret første rute')}</strong><span>${recentRoute?.distanceKm ? `${recentRoute.distanceKm} km · ${esc(recentRoute.difficulty)}` : 'Klar til et nyt eventyr'}</span></div></button>
      </section>

      ${sections.has('stats') ? `<section class="stats-row refined-stats refined-stats-v18">
        ${statCard(s.visited,'Besøgte campingpladser','✓')}
        ${statCard(s.wish,'Steder på ønskelisten','♥','status-wish')}
        ${statCard(s.countries,'Besøgte lande','◎')}
        ${statCard(s.routes,'Gemte cykelruter','⌁')}
      </section>` : ''}

      ${sections.has('map') ? `<section class="map-card card overview-map-card overview-map-card-v18">
        <div class="map-card-heading"><div><span class="eyebrow dark">Stener & Vibses rejsekort</span><h2>Besøgte steder og kommende drømme</h2><p class="subtle">Grøn er minder. Gul er nye eventyr, der stadig står og banker på campingdøren.</p></div><div class="map-legend"><span><i class="legend-dot visited"></i> Besøgt</span><span><i class="legend-dot wish"></i> Vil besøge</span></div></div>
        <div id="overview-map" class="map-holder"></div>
        <div class="map-bottom-bar"><div class="seg-group">${mapStyleButtons()}</div><button class="primary-btn" data-nav="map">Åbn stort kort</button></div>
      </section>` : ''}

      ${(sections.has('latest') || sections.has('top') || sections.has('wishlist')) ? `<section class="dashboard-content-grid dashboard-content-grid-v18">
        ${sections.has('latest') ? `<div class="list-card card"><div class="section-head"><div><span class="eyebrow dark">Senest i dagbogen</span><h3>Campingbesøg</h3></div><button class="text-btn" data-nav="visited">Se alle →</button></div>${compactList(latest)}</div>` : ''}
        ${sections.has('top') ? `<div class="list-card card"><div class="section-head"><div><span class="eyebrow dark">Jeres favoritter</span><h3>Bedst bedømte</h3></div><button class="text-btn" data-nav="top">Se rangliste →</button></div>${compactList(best, true)}</div>` : ''}
        ${sections.has('wishlist') ? `<div class="list-card card"><div class="section-head"><div><span class="eyebrow dark">Næste eventyr</span><h3>Fra ønskelisten</h3></div><button class="text-btn" data-nav="wishlist">Se alle →</button></div>${compactList(wishes)}</div>` : ''}
      </section>` : ''}

      ${sections.has('routes') ? `<section class="grid-2 overview-bottom-grid overview-bottom-grid-v18">
        <div class="card-section card"><div class="section-head"><div><span class="eyebrow dark">På to hjul</span><h3>Udvalgte cykelruter</h3></div><button class="ghost-btn" data-nav="route-edit/new">Opret rute</button></div>${routesList(routes)}</div>
        <div class="mood-card card mood-card-v18" style="background-image:linear-gradient(90deg,rgba(20,45,29,.04),rgba(20,45,29,.52)),url('${state.settings.cornerImage || PRESET_IMAGES.corner}')"><div class="mood-card-copy"><span class="eyebrow">Jeres campingmotto</span><strong>${esc(family.motto || 'Vores ture, vores frihed, vores minder')}</strong><span>${esc(firstName(family.fatherName || 'Stener'))} · ${esc(familyMotherName())} · ${esc(family.dogName || 'Sisi')}</span></div></div>
      </section>` : ''}
    </div>`;
  if (sections.has('map')) initMapOnce('overview-map', state.campsites.map(siteWithComputed), { fitAll:true });
  updateLiveInfoDisplays();
  refreshWeather();
}

function countdownMood(days){
    if (days <= 0) return { title:'Sisi er klar til afgang!', text:'Nedtællingen er slut – nu skal campinglivet leves.' };
    if (days <= 3) return { title:'Sisi er helt oppe at køre', text:`Kun ${days} dage tilbage. Halen er allerede på overarbejde.` };
    if (days <= 14) return { title:'Eventyret nærmer sig', text:`${days} dage tilbage – god tid til den sidste pakkeliste.` };
    return { title:'Sisi holder skarpt øje', text:`${days} dage til næste campingtur. Ventetiden er officielt i gang.` };
  }

  function countdownCells(info, prefix='main'){
    return [['Dage','days'],['Timer','hours'],['Min','minutes'],['Sek','seconds']].map(([label,key]) => `<div class="count-cell"><strong data-countdown-${key}>${pad(info[key])}</strong><span>${label}</span></div>`).join('');
  }

  function quickActionIsActive(action){
    const route = currentRoute();
    if (action === 'search') return route.name === 'search';
    if (action === 'addVisited') return route.name === 'add' && (route.params.status || 'visited') === 'visited';
    if (action === 'addWish') return (route.name === 'add' && route.params.status === 'wish') || route.name === 'wishlist';
    if (action === 'addRoute') return route.name === 'route-edit';
    if (action === 'bigMap') return route.name === 'map';
    if (action === 'settings') return route.name === 'settings';
    return false;
  }

  function quickDockButton(action){
    const meta=QUICK_ACTION_META[action] || { label:action, asset:'assets/action-settings-v18.svg' };
    const active=quickActionIsActive(action);
    return `<button class="quick-dock-btn quick-dock-btn--${action}${active?' is-active':''}" data-quick="${action}" title="${esc(meta.label)}" ${active?'aria-current="page"':''}><span class="quick-dock-icon"><img src="${meta.asset}" alt=""></span><span class="quick-dock-label">${esc(meta.label)}</span></button>`;
  }
  function statCard(value, label, icon, cls=''){ return `<div class="stat-card card ${cls}"><div class="value">${value}</div><div>${label}</div><div class="big-icon">${icon}</div></div>`; }
  function stars(avg){ const r = Math.round(avg||0); return `<span class="rating">${'★'.repeat(r)}${'☆'.repeat(Math.max(0,5-r))}</span>`; }
  function compactList(items, showRank=false){
    if (!items.length) return `<div class="empty">Ingen data endnu.</div>`;
    return items.map((item, idx) => `<div class="list-item"><div class="list-thumb"><img src="${(item.images&&item.images[0])||PRESET_IMAGES.cover}" alt="${esc(item.name)}" style="width:100%;height:100%;object-fit:cover"></div><div class="list-meta"><h4>${showRank?`#${idx+1} `:''}${esc(item.name)}</h4><div class="subtle">${esc(countryLine(item))}</div><div class="subtle small">${item.status==='visited' ? `Seneste besøg: ${formatDate(item.latestVisit)}` : `Planlagt: ${formatDate(item.plannedDate)}`}</div><div>${stars(item.average)} ${item.average?Number(item.average).toFixed(1).replace('.',','):''}</div></div><div class="item-actions"><button class="mini-btn" data-nav="detail/${item.id}">Detaljer</button></div></div>`).join('');
  }
  function routesList(routes){
    if (!routes.length) return `<div class="empty">Ingen cykelruter gemt endnu.</div>`;
    return routes.map(r => `<div class="list-item"><div class="list-thumb" style="display:grid;place-items:center;font-size:2rem;">🚴</div><div class="list-meta"><h4>${esc(r.name)}</h4><div class="subtle">${esc(r.start)} → ${esc(r.end)}</div><div class="meta-pills"><span class="chip">${esc(r.distanceKm)} km</span><span class="chip">${esc(r.difficulty)}</span></div></div><div class="item-actions"><button class="mini-btn" data-nav="route/${r.id}">Åbn</button></div></div>`).join('');
  }

  function renderVisited(view){
    setHeader('Besøgte campingpladser', 'Samlet liste over alle besøgte campingpladser');
    const query = currentRoute().params.q || state.ui.searchVisited || '';
    const sort = currentRoute().params.sort || state.ui.sortVisited || 'latest';
    state.ui.searchVisited = query; state.ui.sortVisited = sort; saveState(false);
    const items = getSortedVisited(sort).filter(site => haystack(site).includes(query.toLowerCase()));
    view.innerHTML = `
      <div class="view-grid">
        <section class="card-section card">
          <div class="search-toolbar">
            <input class="search-box" id="visited-search" value="${esc(query)}" placeholder="Søg efter navn, by, land eller tags...">
            <label>Sortér efter <select id="visited-sort"><option value="latest" ${sort==='latest'?'selected':''}>Seneste besøg</option><option value="rating" ${sort==='rating'?'selected':''}>Bedste vurdering</option><option value="name" ${sort==='name'?'selected':''}>Navn</option></select></label>
            <button class="primary-btn" data-nav="add?status=visited">Tilføj besøg</button>
          </div>
          <div class="card-grid">${items.map(renderCampCard).join('') || `<div class="empty full-span">Ingen resultater fundet.</div>`}</div>
          <div class="subtle">Viser ${items.length} campingpladser</div>
        </section>
      </div>`;
    qs('#visited-search').addEventListener('input', e => navigate(`visited?q=${encodeURIComponent(e.target.value)}&sort=${qs('#visited-sort').value}`));
    qs('#visited-sort').addEventListener('change', e => navigate(`visited?q=${encodeURIComponent(qs('#visited-search').value)}&sort=${e.target.value}`));
  }

  function renderCampCard(item){
    return `<article class="camp-card"><img class="cover" src="${(item.images&&item.images[0])||PRESET_IMAGES.cover}" alt="${esc(item.name)}"><div class="body"><div class="section-head"><div><h3 style="margin:0 0 4px;">${esc(item.name)}</h3><div class="subtle">${esc(countryLine(item))}</div></div><button class="ghost-btn" data-nav="edit/${item.id}">Redigér</button></div><div class="subtle small">${item.status==='visited' ? `Seneste besøg: ${formatDate(item.latestVisit)}` : `Planlagt: ${formatDate(item.plannedDate)}`}</div><div>${stars(item.average)} <strong>${item.average?Number(item.average).toFixed(1).replace('.',','):''}</strong></div><div class="meta-pills">${(item.tags||[]).slice(0,3).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div><div class="action-row"><button class="primary-btn light" data-nav="detail/${item.id}">Detaljer</button><button class="ghost-btn" data-google="${item.id}">Google Maps</button></div></div></article>`;
  }

  function renderMapPage(view){
    setHeader('Oversigtskort', 'Europa- og verdenskort med besøgte steder og ønskesteder');
    const route = currentRoute();
    const filter = route.params.filter || state.ui.mapFilter || 'all';
    const scope = route.params.scope || state.settings.mapScope || 'europe';
    state.ui.mapFilter = filter;
    state.settings.mapScope = scope;
    saveState(false);
    let baseItems = filteredMapSites(filter);
    let markers = [];
    view.innerHTML = `
      <div class="view-grid map-page">
        <section class="card-section card map-workspace">
          <div class="section-head map-page-head">
            <div><span class="eyebrow dark">Interaktivt rejsekort</span><h2>Oversigtskort</h2><p class="subtle">Skift stil, søg lokalt eller online og planlæg næste stop direkte fra kortet.</p></div>
            <div class="action-row"><button class="ghost-btn" id="find-missing-btn">⌖ Find manglende koordinater</button><button class="ghost-btn" id="locate-me-btn">◎ Min placering</button></div>
          </div>
          <div class="map-control-deck">
            <div class="control-block"><span class="control-label">Vis steder</span><div class="seg-group">${['all','visited','wish'].map(k => `<button class="seg-btn ${filter===k?'active':''}" data-nav="map?filter=${k}&scope=${scope}">${k==='all'?'Alle':k==='visited'?'Besøgte':'Vil besøge'}</button>`).join('')}</div></div>
            <div class="control-block"><span class="control-label">Kortområde</span><div class="seg-group"><button class="seg-btn ${scope==='europe'?'active':''}" data-nav="map?filter=${filter}&scope=europe">Europa</button><button class="seg-btn ${scope==='world'?'active':''}" data-nav="map?filter=${filter}&scope=world">Verden</button><button class="seg-btn" id="fit-markers-btn">Tilpas til punkter</button></div></div>
            <label class="control-block"><span class="control-label">Kortets udseende</span><select id="map-style-select" class="field compact-field">${Object.entries(window.VCMaps.styles).map(([k,v]) => `<option value="${k}" ${state.settings.mapStyle===k?'selected':''}>${esc(v.label)}</option>`).join('')}</select></label>
          </div>
          <div class="map-search-deck">
            <label class="search-with-icon"><span>⌕</span><input class="search-box" id="stored-search" placeholder="Filtrér gemte campingpladser efter navn, by, land eller tag"></label>
            <div class="online-search-row"><label class="search-with-icon"><span>◎</span><input class="search-box" id="online-search" placeholder="Søg online efter campingplads eller adresse"></label><button class="primary-btn" id="search-online-btn">Søg online</button></div>
          </div>
          <div class="map-stage">
            <div id="big-map" class="map-holder"></div>
            <div class="map-floating-legend"><span><i class="legend-dot visited"></i> Besøgt</span><span><i class="legend-dot wish"></i> Vil besøge</span><span id="map-result-count">${baseItems.length} steder</span></div>
          </div>
          <div id="search-results" class="stack"></div>
          <div class="grid-3 map-tip-grid">
            <div class="panel"><strong>Små, præcise markører</strong><p class="subtle">Klik på en markør for detaljer, vurdering og Google Maps.</p></div>
            <div class="panel"><strong>Automatisk reservekort</strong><p class="subtle">Hvis en kortstil fejler, skifter appen til reservekortet i stedet for at gå i sort.</p></div>
            <div class="panel"><strong>Koordinat-redning</strong><p class="subtle">Manglende placeringer kan udfyldes med Openrouteservice.</p></div>
          </div>
        </section>
      </div>`;

    initMapOnce('big-map', baseItems, {
      styleKey: state.settings.mapStyle,
      fitAll: scope !== 'world',
      center: scope === 'world' ? [8,28] : [10.5,54.5],
      zoom: scope === 'world' ? 1.5 : 3.5,
      onReady: (map, initialMarkers) => { maps.big = map; markers = initialMarkers || []; }
    });

    const refreshMarkers = (items, fit=false) => {
      markers.forEach(marker => { try { marker.remove(); } catch (_) {} });
      markers = window.VCMaps.renderMarkers(maps.big, items, { onDetail: id => navigate('detail/'+id), onGoogle: openGoogle });
      qs('#map-result-count').textContent = `${items.length} steder`;
      if (fit && items.length) window.VCMaps.fitToSites(maps.big, items);
    };

    qs('#stored-search').addEventListener('input', e => {
      const query = e.target.value.trim().toLowerCase();
      const filtered = query ? baseItems.filter(site => haystack(site).includes(query)) : baseItems;
      refreshMarkers(filtered, filtered.length > 0 && filtered.length < 8);
    });
    qs('#map-style-select').addEventListener('change', e => {
      state.settings.mapStyle = e.target.value;
      saveState(false);
      window.VCMaps.setStyle(maps.big, e.target.value, () => refreshMarkers(baseItems, false));
    });
    qs('#search-online-btn').onclick = async () => {
      const q = qs('#online-search').value.trim();
      if(!q) return toast('Skriv noget at søge efter.');
      setBusy(qs('#search-online-btn'), true, 'Søger…');
      try { renderOnlineResults(await orsGeocodeSearch(q), '#search-results'); }
      finally { setBusy(qs('#search-online-btn'), false, 'Søg online'); }
    };
    qs('#online-search').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); qs('#search-online-btn').click(); } });
    qs('#find-missing-btn').onclick = async () => geocodeMissing();
    qs('#locate-me-btn').onclick = () => locateMe(maps.big);
    qs('#fit-markers-btn').onclick = () => window.VCMaps.fitToSites(maps.big, baseItems);
  }

  function filteredMapSites(filter){
    const items = state.campsites.map(siteWithComputed);
    if (filter==='visited') return items.filter(s=>s.status==='visited');
    if (filter==='wish') return items.filter(s=>s.status==='wish');
    return items;
  }

  function renderOnlineResults(results, targetSelector = '#search-results'){
    const wrap = qs(targetSelector);
    if (!wrap) return;
    if (!results.length) {
      wrap.innerHTML = `<div class="empty">Ingen online resultater fundet. Prøv evt. bynavn og land sammen.</div>`;
      return;
    }
    wrap.innerHTML = `<div class="list-card card online-results"><div class="section-head"><div><span class="eyebrow dark">Openrouteservice</span><h3>Online søgeresultater</h3></div><span class="subtle">${results.length} resultater</span></div>${results.map(r => {
      const payload = encodeURIComponent(JSON.stringify(r));
      return `<div class="list-item"><div class="result-icon">⌖</div><div class="list-meta"><h4>${esc(r.name || r.label)}</h4><div class="subtle">${esc(r.label || [r.city,r.country].filter(Boolean).join(', '))}</div><div class="subtle small">${Number.isFinite(Number(r.lat)) ? `${Number(r.lat).toFixed(5)}, ${Number(r.lng).toFixed(5)}` : 'Koordinater mangler'}</div></div><div class="item-actions"><button class="mini-btn" data-add-result="${payload}" data-status="visited">＋ Besøgt</button><button class="mini-btn wish-action" data-add-result="${payload}" data-status="wish">♥ Ønske</button></div></div>`;
    }).join('')}</div>`;
  }

  function renderTop(view){
    setHeader('Bedst bedømte campingpladser', 'Samlet rangliste over besøgte campingpladser');
    const list = getSortedVisited('rating');
    const avg = list.length ? (list.reduce((a,b)=>a+b.average,0)/list.length) : 0;
    const winners = categoryWinners();
    view.innerHTML = `
      <div class="view-grid">
        <section class="rank-grid">
          ${list.slice(0,3).map((site, idx) => rankCard(site, idx+1)).join('')}
          <div class="right-rail">
            <div class="panel"><div class="score-big">${avg.toFixed(1).replace('.',',')}</div><div>${stars(avg)}</div><div class="subtle">Gennemsnitlig vurdering baseret på ${list.length} campingpladser</div></div>
            <div class="panel"><h3>Top 5 samlet vurdering</h3>${list.slice(0,5).map((s,i)=>`<div class="table-row"><span>${i+1}. ${esc(s.name)}</span><span>${stars(s.average)}</span><strong>${s.average.toFixed(1).replace('.',',')}</strong><button class="mini-btn" data-nav="detail/${s.id}">Se</button></div>`).join('')}</div>
          </div>
        </section>
        <section class="grid-4">
          ${winners.map(w => `<div class="panel"><div class="subtle">${esc(w.category.name)}</div><h3>${w.category.icon} ${esc(w.category.name)}</h3>${w.site ? `<img src="${(w.site.images&&w.site.images[0])||PRESET_IMAGES.cover}" alt=""><h4>${esc(w.site.name)}</h4><div>${stars(w.score)} <strong>${w.score.toFixed(1).replace('.',',')}</strong></div><button class="mini-btn" data-nav="detail/${w.site.id}">Se campingplads</button>` : `<div class="empty">Ingen data endnu</div>`}</div>`).join('')}
        </section>
      </div>`;
  }

  function rankCard(site, rank){
    const cls = rank===1?'gold':rank===2?'silver':'bronze';
    return `<div class="rank-card card ${rank===1?'top1':''}"><div class="rank-badge ${cls}">${rank}</div><img src="${(site.images&&site.images[0])||PRESET_IMAGES.cover}" alt="" style="border-radius:18px; height:190px; object-fit:cover; width:100%;"><div style="padding-top:20px;"><h3 style="margin:0 0 4px;">${esc(site.name)}</h3><div class="subtle">${esc(countryLine(site))}</div><div>${stars(site.average)} <strong style="font-size:1.6rem;">${site.average.toFixed(1).replace('.',',')}</strong></div><button class="primary-btn" data-nav="detail/${site.id}">Se campingplads</button></div></div>`;
  }

  function categoryWinners(){
    const visited = state.campsites.filter(s => s.status === 'visited').map(siteWithComputed);
    return state.categories.map(cat => {
      let bestSite = null; let bestScore = 0;
      visited.forEach(site => {
        const score = Number(site.ratings?.[cat.id] || 0);
        if (score > bestScore) { bestScore = score; bestSite = site; }
      });
      return { category: cat, site: bestSite, score: bestScore };
    }).slice(0,4);
  }

  function renderWishlist(view){
    setHeader('Campingpladser vi vil besøge', 'Personlig ønskeliste og fremtidige eventyr');
    const list = getWishlist();
    view.innerHTML = `
      <div class="view-grid">
        <section class="card-section card">
          <div class="filter-bar"><input class="search-box" id="wish-search" placeholder="Søg i ønskelisten..."><div class="seg-group"><button class="seg-btn active">Alle ønskebesøg</button><button class="seg-btn">Planlagt i år</button><button class="seg-btn">Sommer</button><button class="seg-btn">Weekendture</button></div><div class="action-row"><button class="ghost-btn" data-nav="map?filter=wish">Vis på kort</button><button class="primary-btn" data-nav="add?status=wish">Tilføj ønskebesøg</button></div></div>
          <div id="wish-list-wrap" class="stack">${renderWishListMarkup(list)}</div>
        </section>
      </div>`;
    qs('#wish-search').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      const filtered = list.filter(site => haystack(site).includes(q));
      qs('#wish-list-wrap').innerHTML = renderWishListMarkup(filtered);
    });
  }

  function renderWishListMarkup(list){
    if (!list.length) return `<div class="empty">Ønskelisten er tom.</div>`;
    return list.map(item => `<div class="list-item"><div class="list-thumb"><img src="${(item.images&&item.images[0])||PRESET_IMAGES.cover}" alt=""></div><div class="list-meta"><h4>${esc(item.name)}</h4><div class="subtle">${esc(countryLine(item))} · Planlagt: ${formatDate(item.plannedDate)}</div><p style="margin:.4rem 0 0;">${esc(item.description || 'Ingen beskrivelse endnu.')}</p><div class="meta-pills">${(item.tags||[]).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></div><div class="item-actions"><button class="mini-btn" data-nav="detail/${item.id}">Detaljer</button><button class="mini-btn" data-nav="edit/${item.id}">Redigér</button><button class="primary-btn" data-convert="${item.id}">Markér som besøgt</button></div></div>`).join('');
  }


function renderSettings(view){
  setHeader('Indstillinger', 'Tilpas appen, så den passer perfekt til jeres campingoplevelser');
  const family = state.settings.family || {};
  const routeDefaults = state.settings.routeDefaults;
  const heroClock = state.settings.heroClock || {};
  view.innerHTML = `
    <div class="view-grid">
      <section class="settings-grid">
        <div class="form-section card">
          <h3>Appnavn og forsidetekster</h3>
          <label><span class="field-label">Appnavn</span><input class="field" id="set-app-name" value="${esc(state.settings.appName)}"></label>
          <label><span class="field-label">Undertitel</span><input class="field" id="set-tagline" value="${esc(state.settings.tagline)}"></label>
          <label><span class="field-label">Fast hilsen (tom = automatisk efter tidspunkt)</span><input class="field" id="set-greeting" value="${esc(state.settings.greeting)}" placeholder="Fx Velkommen tilbage, Stener & Vibse"></label>
          <label><span class="field-label">Forsidetekst</span><input class="field" id="set-intro" value="${esc(state.settings.intro)}"></label>
          <button class="primary-btn" id="save-text-settings">Gem tekster</button>
        </div>

        <div class="form-section card">
          <h3>Familie og personligt præg</h3>
          <div class="field-row two">
            <label><span class="field-label">Far</span><input class="field" id="set-father-name" value="${esc(family.fatherName || '')}"></label>
            <label><span class="field-label">Fødselsdag</span><input type="date" class="field" id="set-father-birth" value="${esc(family.fatherBirth || '')}"></label>
          </div>
          <div class="field-row two">
            <label><span class="field-label">Mor</span><input class="field" id="set-mother-name" value="${esc(family.motherName || '')}"></label>
            <label><span class="field-label">Kælenavn</span><input class="field" id="set-mother-nick" value="${esc(family.motherNick || '')}"></label>
          </div>
          <div class="field-row two">
            <label><span class="field-label">Mors fødselsdag</span><input type="date" class="field" id="set-mother-birth" value="${esc(family.motherBirth || '')}"></label>
            <label><span class="field-label">Hund</span><input class="field" id="set-dog-name" value="${esc(family.dogName || '')}"></label>
          </div>
          <label><span class="field-label">Sisis år / fødselsdato</span><input class="field" id="set-dog-birth" value="${esc(family.dogBirth || '')}" placeholder="fx 2020 eller 2020-01-01"></label>
          <label><span class="field-label">Jeres personlige campingmotto</span><input class="field" id="set-family-motto" value="${esc(family.motto || '')}" placeholder="Vores ture, vores frihed, vores minder"></label>
          <div class="stack">
            <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="set-use-nickname" ${family.useNickname !== false ? 'checked' : ''}> Brug kælenavnet Vibse i appens personlige tekster</label>
            <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="set-show-birthdays" ${family.showBirthdays !== false ? 'checked' : ''}> Vis fødselsdatoer og alder i de personlige familiekort</label>
          </div>
          <button class="primary-btn" id="save-family-settings">Gem familieoplysninger</button>
        </div>

        <div class="form-section card">
          <h3>Næste campingtur og nedtælling</h3>
          <label><span class="field-label">Næste tur</span><input class="field" id="set-trip-name" value="${esc(state.settings.nextTripName)}"></label>
          <label><span class="field-label">Måldato</span><input type="datetime-local" class="field" id="set-trip-date" value="${toLocalInputValue(state.settings.nextTripDate)}"></label>
          <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="set-show-countdown" ${state.settings.showCountdown?'checked':''}> Vis nedtælling i sidemenuen</label>
          <button class="primary-btn" id="save-countdown-settings">Gem nedtælling</button>
        </div>

        <div class="form-section card">
          <h3>Forsideur, dato og vejrudsigt</h3>
          <label><span class="field-label">Titel på urkort</span><input class="field" id="set-clock-title" value="${esc(heroClock.title || '')}"></label>
          <label><span class="field-label">Undertitel / placeringstekst</span><input class="field" id="set-clock-subtitle" value="${esc(heroClock.subtitle || '')}"></label>
          <div class="stack">
            <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="set-clock-enabled" ${heroClock.enabled !== false ? 'checked' : ''}> Vis informationskortet på forsiden</label>
            <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="set-clock-date-enabled" ${heroClock.showDate !== false ? 'checked' : ''}> Vis dato</label>
            <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="set-clock-weather-enabled" ${heroClock.showWeather !== false ? 'checked' : ''}> Vis vejrudsigt</label>
            <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="set-clock-location-enabled" ${heroClock.useCurrentLocation !== false ? 'checked' : ''}> Brug aktuel placering automatisk</label>
          </div>
          <div class="panel">Forsideuret viser almindeligt klokkeslæt, dagens dato og lokalt vejr på jeres aktuelle placering. Hvis placering ikke tillades, vises en rolig fallback-tekst.</div>
          <button class="primary-btn" id="save-hero-clock-settings">Gem forsideur</button>
        </div>

        <div class="form-section card">
          <h3>Billeder og cover</h3>
          <div class="stack"><label><span class="field-label">Coverbillede</span><div class="list-thumb" style="height:120px;"><img src="${state.settings.coverImage}" id="cover-preview"></div></label><button class="ghost-btn" id="upload-cover-btn">Skift coverbillede</button><input type="file" class="hidden-file" id="upload-cover" accept="image/*"></div>
          <div class="stack"><label><span class="field-label">Hjørnebillede / stemning</span><div class="list-thumb" style="height:120px;"><img src="${state.settings.cornerImage}" id="corner-preview"></div></label><button class="ghost-btn" id="upload-corner-btn">Skift hjørnebillede</button><input type="file" class="hidden-file" id="upload-corner" accept="image/*"></div>
          <div class="stack"><label><span class="field-label">Logo</span><div class="list-thumb" style="height:120px;"><img src="${state.settings.logo}" id="logo-preview" style="object-fit:contain;background:transparent;"></div></label><button class="ghost-btn" id="upload-logo-btn">Skift logo</button><input type="file" class="hidden-file" id="upload-logo" accept="image/*"></div>
        </div>

        <div class="form-section card">
          <h3>Layout, tema og størrelsesskalering</h3>
          <label><span class="field-label">Størrelsesskalering</span><input type="range" min="0.9" max="1.18" step="0.01" value="${state.settings.fontScale}" id="set-scale"></label>
          <label><span class="field-label">Farvepalette</span><select id="set-accent" class="field"><option value="#1f5f3c" ${state.settings.accent==='#1f5f3c'?'selected':''}>Skovgrøn</option><option value="#4e6b3a" ${state.settings.accent==='#4e6b3a'?'selected':''}>Olivengrøn</option><option value="#b6782d" ${state.settings.accent==='#b6782d'?'selected':''}>Dæmpet orange</option><option value="#7d6b3f" ${state.settings.accent==='#7d6b3f'?'selected':''}>Sandbrun</option></select></label>
          <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="set-compact" ${state.settings.compact?'checked':''}> Kompakt forside</label>
          <button class="primary-btn" id="save-style-settings">Gem layout og farver</button>
        </div>

        <div class="form-section card full-span">
          <h3>Forsidesektioner</h3>
          <div class="table-list">${['map','stats','latest','top','wishlist','routes'].map(id => `<label class="table-row"><span>${labelForSection(id)}</span><span></span><input type="checkbox" data-section-toggle="${id}" ${state.settings.sections.includes(id)?'checked':''}></label>`).join('')}</div>
        </div>

        <div class="form-section card">
          <h3>Vurderingskategorier</h3>
          <div id="category-list" class="table-list">${state.categories.map(cat => `<div class="table-row"><input class="field" value="${esc(cat.name)}" data-cat-name="${cat.id}"><input class="field" value="${esc(cat.icon)}" data-cat-icon="${cat.id}"><span></span><button class="mini-btn" data-remove-category="${cat.id}">Fjern</button></div>`).join('')}</div>
          <div class="field-row"><input id="new-cat-name" class="field" placeholder="Ny kategori"><input id="new-cat-icon" class="field" placeholder="Ikon, fx 🌲"></div>
          <button class="ghost-btn" id="add-category-btn">Tilføj kategori</button>
          <button class="primary-btn" id="save-categories-btn">Gem kategorier</button>
        </div>

        <div class="form-section card">
          <h3>Kort og markører</h3>
          <label><span class="field-label">Kortstil</span><select id="set-map-style" class="field">${Object.entries(window.VCMaps.styles).map(([k,v]) => `<option value="${k}" ${state.settings.mapStyle===k?'selected':''}>${esc(v.label)}</option>`).join('')}</select></label>
          <label><span class="field-label">Startkort</span><select id="set-map-scope" class="field"><option value="europe" ${state.settings.mapScope==='europe'?'selected':''}>Europakort</option><option value="world" ${state.settings.mapScope==='world'?'selected':''}>Verdenskort</option></select></label>
          <div class="panel">OpenFreeMap og MapLibre bruges som primært kort. Hvis noget fejler, falder appen tilbage til et gratis reservekort.</div>
          <button class="primary-btn" id="save-map-prefs">Gem kortvalg</button>
        </div>

        <div class="form-section card">
          <h3>Cykelruter – standarder og ekstra funktioner</h3>
          <div class="field-row two"><label><span class="field-label">Standardprofil</span><select id="set-route-profile" class="field"><option value="cycling-regular" ${routeDefaults.profile==='cycling-regular'?'selected':''}>Almindelig cykel</option><option value="cycling-road" ${routeDefaults.profile==='cycling-road'?'selected':''}>Landevejscykel</option><option value="cycling-mountain" ${routeDefaults.profile==='cycling-mountain'?'selected':''}>Mountainbike</option><option value="foot-walking" ${routeDefaults.profile==='foot-walking'?'selected':''}>Gang / gåtur</option></select></label><label><span class="field-label">Rutetype</span><select id="set-route-type" class="field"><option ${routeDefaults.routeType==='Rundtur'?'selected':''}>Rundtur</option><option ${routeDefaults.routeType==='Tur/retur'?'selected':''}>Tur/retur</option><option ${routeDefaults.routeType==='Fra A til B'?'selected':''}>Fra A til B</option></select></label></div>
          <div class="field-row two"><label><span class="field-label">Foretrukket underlag</span><select id="set-route-surface" class="field"><option ${routeDefaults.surface==='Asfalt'?'selected':''}>Asfalt</option><option ${routeDefaults.surface==='Grus'?'selected':''}>Grus</option><option ${routeDefaults.surface==='Blandet'?'selected':''}>Blandet</option><option ${routeDefaults.surface==='Skovsti'?'selected':''}>Skovsti</option></select></label><label><span class="field-label">Standard pausestop (min)</span><input type="number" min="0" max="180" class="field" id="set-route-pause" value="${routeDefaults.pauseMin}"></label></div>
          <div class="stack"><label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="set-route-scenic" ${routeDefaults.preferScenic?'checked':''}> Prioritér naturskønne ruter</label><label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="set-route-traffic" ${routeDefaults.avoidTraffic?'checked':''}> Undgå trafikerede strækninger når muligt</label></div>
          <div class="panel">Ekstra funktioner i ruteeditoren: GPX-eksport, duplikér rute, pausestop, højdepunkter, isokroner, POI-søgning, bedre stopfelter og tydeligere ruteopsætning.</div>
          <button class="primary-btn" id="save-route-defaults">Gem ruteindstillinger</button>
        </div>

        <div class="form-section card">
          <h3>Kort og API-nøgler</h3>
          <label><span class="field-label">Openrouteservice API-nøgle</span><input id="set-ors-key" class="field" value="${esc(secrets.orsKey||'')}" placeholder="Indsæt din nøgle"></label>
          <label><span class="field-label">Google Maps API-nøgle (valgfri)</span><input id="set-google-key" class="field" value="${esc(secrets.googleMapsKey||'')}" placeholder="Valgfri reserve"></label>
          <div class="action-row"><button class="primary-btn" id="save-api-settings">Gem kort og nøgler</button><button class="ghost-btn" id="test-ors-btn">Test Openrouteservice</button></div>
          <div class="panel" style="padding:12px;"><strong>Openrouteservice i appen:</strong> søgning, geokodning, ruteberegning, snap, isokroner, POI-søgning og elevation er klargjort i koden. Brug jeres egen API-nøgle for live data.</div>
        </div>

        <div class="form-section card">
          <h3>Sikkerhedskopi og data</h3>
          <div class="action-row"><button class="primary-btn" id="export-btn">Eksportér backupfil</button><button class="ghost-btn" id="import-btn">Importér backupfil</button><input type="file" class="hidden-file" id="import-file" accept="application/json"></div>
          <div class="action-row"><button class="danger-btn" id="reset-data-btn">Nulstil campingdata</button></div>
          <div class="subtle">API-nøgler udelades automatisk fra sikkerhedskopien.</div>
        </div>

        <div class="form-section card">
          <h3>Udgivelse på GitHub Pages</h3>
          <p class="subtle">Appen er færdig som statisk webapp og skal udgives fra <strong>main</strong>-branchens <strong>/docs</strong>-mappe.</p>
          <div class="panel">Der kræves hverken npm, build-trin eller en brugeroprettet GitHub Action.</div>
          <a class="primary-btn" href="github-guide.html" target="_blank" rel="noreferrer">Åbn trin-for-trin guide</a>
        </div>
      </section>
    </div>`;
  bindSettingsHandlers();
}

function sceneThumbs(){
  return '';
}


  function renderDetail(view, id){
    const site = getSite(id); if (!site) return navigate('overview');
    const full = siteWithComputed(site);
    const linkedRoutes = state.routes.filter(r => r.siteId === site.id);
    setHeader(site.name, countryLine(site));
    view.innerHTML = `
      <div class="detail-grid">
        <section class="detail-main">
          <div class="hero-cover card"><img src="${(site.images&&site.images[0])||state.settings.coverImage}" alt="${esc(site.name)}"><div class="cover-top-tags"><span class="badge ${site.status==='wish'?'wish':''}">${site.status==='wish'?'Vil besøge':'Besøgt'}</span>${site.favorite?'<span class="badge">Favorit</span>':''}</div></div>
          <div class="detail-body card">
            <div class="section-head"><div><h2 style="margin:0 0 4px;">${esc(site.name)}</h2><div class="subtle">${esc(countryLine(site))}</div></div><div class="action-row"><button class="primary-btn" data-nav="edit/${site.id}">Redigér</button><button class="ghost-btn" data-google="${site.id}">Google Maps</button></div></div>
            <div>${stars(full.average)} <strong>${full.average?full.average.toFixed(1).replace('.',','):'Ingen vurdering endnu'}</strong></div>
            <div class="kv"><strong>${site.status==='visited'?'Seneste besøgsdato':'Planlagt dato'}</strong><span>${site.status==='visited'?formatDate(full.latestVisit):formatDate(site.plannedDate)}</span></div>
            <div class="kv"><strong>Beskrivelse</strong><span>${esc(site.description || 'Ingen beskrivelse endnu.')}</span></div>
            <div class="kv"><strong>Private noter</strong><span>${esc(site.notes || 'Ingen noter endnu.')}</span></div>
            <div class="inline-list">${(site.tags||[]).map(t => `<span class="chip">${esc(t)}</span>`).join('') || '<span class="subtle">Ingen tags</span>'}</div>
            <div class="soft-divider"></div>
            <h3 style="margin:0;">Vurderingskategorier</h3>
            <div class="table-list">${state.categories.map(cat => `<div class="table-row"><span>${esc(cat.icon)} ${esc(cat.name)}</span><span>${stars(Number(site.ratings?.[cat.id]||0))}</span><strong>${site.ratings?.[cat.id] ? Number(site.ratings[cat.id]).toFixed(1).replace('.',',') : '-'}</strong><span></span></div>`).join('')}</div>
            <div class="soft-divider"></div>
            <h3 style="margin:0;">Billedgalleri</h3>
            <div class="gallery">${(site.images||[]).map(src => `<img src="${src}" alt="${esc(site.name)}">`).join('') || '<div class="empty">Ingen billeder endnu.</div>'}</div>
            <div class="soft-divider"></div>
            <h3 style="margin:0;">Seværdigheder i området</h3>
            <div class="table-list">${(site.attractions||[]).map(a => `<div class="table-row"><span>${esc(a.name)}</span><span>${esc(a.description||'')}</span><span></span>${a.link?`<a class="mini-btn" target="_blank" rel="noreferrer" href="${safeUrl(a.link)}">Åbn link</a>`:''}</div>`).join('') || '<div class="empty">Ingen seværdigheder gemt endnu.</div>'}</div>
            <div class="soft-divider"></div>
            <div class="section-head"><h3 style="margin:0;">Gemte cykelruter</h3><button class="ghost-btn" data-nav="route-edit/new?siteId=${site.id}">＋ Ny cykelrute</button></div>
            <div class="table-list">${linkedRoutes.map(r => `<div class="table-row"><span>${esc(r.name)}</span><span>${esc(r.distanceKm || '—')} km · ${esc(r.difficulty)}</span><span>${r.durationMin ? Math.round((r.durationMin||0)/60)+' t' : '—'}</span><div class="action-row"><button class="mini-btn" data-nav="route/${r.id}">Åbn</button><button class="mini-btn" data-nav="route-edit/${r.id}">Redigér</button></div></div>`).join('') || '<div class="empty">Ingen cykelruter gemt endnu.</div>'}</div>
          </div>
        </section>
        <aside class="summary-rail">
          <div class="card-section card"><h3>Placering på kort</h3><div id="detail-map" class="map-holder" style="min-height:260px;"></div></div>
          <div class="summary-card card"><h3>Kontakt og links</h3><div class="table-list"><div class="table-row"><span>Hjemmeside</span><span class="subtle">${site.website?esc(site.website):'—'}</span><span></span>${site.website?`<a class="mini-btn" target="_blank" rel="noreferrer" href="${safeUrl(site.website)}">Åbn</a>`:''}</div><div class="table-row"><span>Telefon</span><span class="subtle">${site.phone?esc(site.phone):'—'}</span><span></span>${site.phone?`<a class="mini-btn" href="tel:${safePhone(site.phone)}">Ring</a>`:''}</div><div class="table-row"><span>Koordinater</span><span class="subtle">${site.coords?.lat || '—'}, ${site.coords?.lng || '—'}</span><span></span></div></div></div>
        </aside>
      </div>`;
    initMapOnce('detail-map', [siteWithComputed(site)], { styleKey: state.settings.mapStyle, fitAll:true });
  }

  function renderRouteDetail(view, id){
    const route = getRoute(id);
    if(!route) return navigate('overview');
    const site = getSite(route.siteId);
    const hours = Math.floor(Number(route.durationMin || 0) / 60);
    const minutes = Math.round(Number(route.durationMin || 0) % 60);
    setHeader(route.name, 'Cykelrutens detaljevisning');
    view.innerHTML = `
      <div class="detail-grid route-detail-page">
        <section class="detail-main">
          <div class="route-banner card">
            <div><span class="eyebrow">Cykelrute</span><h2>${esc(route.name)}</h2><p>${esc(site?.name || 'Fritstående rute')} · ${esc(route.start || 'Start')} → ${esc(route.end || 'Mål')}</p></div>
            <div class="action-row"><button class="primary-btn warm" data-nav="route-edit/${route.id}">Redigér ruten</button><button class="glass-btn" id="share-route-btn">Del rute</button>${site ? `<button class="glass-btn" data-nav="detail/${site.id}">Campingplads</button>` : ''}</div>
          </div>
          <div class="route-metrics">
            <div class="metric-card"><span>Afstand</span><strong>${route.distanceKm || '—'} km</strong></div>
            <div class="metric-card"><span>Forventet tid</span><strong>${hours ? hours+' t ' : ''}${minutes} min</strong></div>
            <div class="metric-card"><span>Pausetid</span><strong>${route.pauseMin || 0} min</strong></div>
            <div class="metric-card"><span>Sværhedsgrad</span><strong>${esc(route.difficulty || 'Ikke valgt')}</strong></div>
            <div class="metric-card"><span>Underlag</span><strong>${esc(route.surface || '—')}</strong></div>
            <div class="metric-card"><span>Stigning</span><strong>${route.ascentM || '—'} m</strong></div>
          </div>
          <div class="card-section card">
            <div class="grid-2"><div class="panel"><strong>Rutebeskrivelse</strong><p>${esc(route.description || 'Ingen beskrivelse endnu.')}</p><p class="subtle">${esc(route.notes || '')}</p></div><div class="panel"><strong>Start, stop og mål</strong><p>${esc(route.start || 'Start')} ${route.waypoints?.length ? '→ ' + route.waypoints.map(esc).join(' → ') : ''} → ${esc(route.end || 'Mål')}</p><p class="subtle">Type: ${esc(route.routeType || '—')} · Profil: ${esc(route.profile || '—')}</p></div></div>
            <div class="panel"><strong>Højdepunkter og stop</strong><div class="inline-list">${(route.highlights||[]).map(item => `<span class="chip">${esc(item)}</span>`).join('') || '<span class="subtle">Ingen højdepunkter gemt endnu.</span>'}</div></div>
            <div class="action-row">${route.googleMapsUrl ? `<a class="ghost-btn" target="_blank" rel="noreferrer" href="${safeUrl(route.googleMapsUrl)}">Åbn delt Google Maps-rute</a>` : ''}<button class="ghost-btn" id="copy-route-link-btn">Kopiér rutelink</button><button class="ghost-btn" id="route-detail-export-btn">Eksportér GPX</button></div>
          </div>
        </section>
        <aside class="summary-rail"><div class="card-section card sticky-map-card"><div class="section-head"><h3>Rutens kort</h3><span class="badge">${route.points?.length || 0} punkter</span></div><div id="route-map" class="map-holder route-detail-map"></div></div></aside>
      </div>`;
    const sitePoints = site ? [siteWithComputed(site)] : [];
    const fallbackLine = route.points?.length >= 2 ? pointsToGeoJSON(route.points) : null;
    detailRouteGeoJSON = route.geojson || fallbackLine;
    initMapOnce('route-map', sitePoints, { styleKey: state.settings.mapStyle, fitAll:false, routeGeoJSON: detailRouteGeoJSON, routePoints: route.points || [] });
    qs('#share-route-btn').onclick = () => shareRoute(route);
    qs('#copy-route-link-btn').onclick = async () => { await navigator.clipboard.writeText(route.googleMapsUrl || location.href); toast('Rutelink kopieret.'); };
    qs('#route-detail-export-btn').onclick = () => downloadRouteGpx(route);
  }

  function renderAdvancedRouteEditor(view, id, siteIdParam=''){
    const isNew = id === 'new' || !getRoute(id);
    const original = isNew ? null : getRoute(id);
    const route = original ? structuredClone(original) : {
      id: uid(), siteId: siteIdParam || state.campsites[0]?.id || '', name: 'Ny cykelrute', start: '', end: '', waypoints: [], points: [],
      profile: state.settings.routeDefaults.profile || 'cycling-regular', difficulty: 'Let', description: '', distanceKm: '', durationMin: '', ascentM: '', descentM: '', googleMapsUrl: '', geojson: null, isochrone: null,
      surface: state.settings.routeDefaults.surface || 'Blandet', routeType: state.settings.routeDefaults.routeType || 'Rundtur', pauseMin: state.settings.routeDefaults.pauseMin || 20, roundTrip: true, preferScenic: state.settings.routeDefaults.preferScenic ?? true, avoidTraffic: state.settings.routeDefaults.avoidTraffic ?? false, notes: '', highlights: [],
    };
    const site = getSite(route.siteId);
    if (!route.points?.length && site?.coords?.lat && site?.coords?.lng) {
      const lat = Number(site.coords.lat), lng = Number(site.coords.lng);
      route.points = [{lng,lat,label:'Start'}, {lng:lng+0.06,lat:lat+0.025,label:'Mål'}];
    }
    setHeader(isNew ? 'Opret cykelrute' : `Redigér ${route.name}`, 'Avanceret ruteeditor med interaktivt kort');
    view.innerHTML = `
      <div class="route-editor-layout">
        <section class="route-editor-panel card">
          <div class="section-head"><div><span class="eyebrow dark">Ruteværksted</span><h2>${isNew ? 'Ny cykelrute' : esc(route.name)}</h2></div><span class="route-status" id="route-status">Klar</span></div>
          <div class="stack">
            <label><span class="field-label">Tilknyttet campingplads</span><select id="route-site" class="field"><option value="">Ingen fast campingplads</option>${state.campsites.map(s => `<option value="${s.id}" ${route.siteId===s.id?'selected':''}>${esc(s.name)} – ${esc(s.country)}</option>`).join('')}</select></label>
            <div class="field-row"><label><span class="field-label">Rutenavn</span><input id="route-name" class="field" value="${esc(route.name)}"></label><label><span class="field-label">Sværhedsgrad</span><select id="route-difficulty" class="field"><option ${route.difficulty==='Let'?'selected':''}>Let</option><option ${route.difficulty==='Familievenlig'?'selected':''}>Familievenlig</option><option ${route.difficulty==='Middel'?'selected':''}>Middel</option><option ${route.difficulty==='Udfordrende'?'selected':''}>Udfordrende</option><option ${route.difficulty==='Naturskøn'?'selected':''}>Naturskøn</option></select></label></div>
            <div class="field-row"><label><span class="field-label">Startnavn</span><input id="route-start" class="field" value="${esc(route.start)}" placeholder="Fx campingpladsen"></label><label><span class="field-label">Slutnavn</span><input id="route-end" class="field" value="${esc(route.end)}" placeholder="Fx udsigtspunktet"></label></div>
            <label><span class="field-label">Beskrivelse</span><textarea id="route-description">${esc(route.description)}</textarea></label>
            <label><span class="field-label">Delt Google Maps-link</span><input id="route-google" class="field" value="${esc(route.googleMapsUrl)}"></label>
            <div class="field-row two"><label><span class="field-label">Ruteprofil</span><select id="route-profile" class="field"><option value="cycling-regular" ${route.profile==='cycling-regular'?'selected':''}>Almindelig cykel</option><option value="cycling-road" ${route.profile==='cycling-road'?'selected':''}>Landevej</option><option value="cycling-mountain" ${route.profile==='cycling-mountain'?'selected':''}>Mountainbike</option><option value="foot-walking" ${route.profile==='foot-walking'?'selected':''}>Gang / gåtur</option></select></label><label><span class="field-label">Rutetype</span><select id="route-type" class="field"><option ${route.routeType==='Rundtur'?'selected':''}>Rundtur</option><option ${route.routeType==='Tur/retur'?'selected':''}>Tur/retur</option><option ${route.routeType==='Fra A til B'?'selected':''}>Fra A til B</option></select></label></div>
            <div class="field-row two"><label><span class="field-label">Underlag</span><select id="route-surface" class="field"><option ${route.surface==='Asfalt'?'selected':''}>Asfalt</option><option ${route.surface==='Grus'?'selected':''}>Grus</option><option ${route.surface==='Blandet'?'selected':''}>Blandet</option><option ${route.surface==='Skovsti'?'selected':''}>Skovsti</option></select></label><label><span class="field-label">Planlagt pause (min)</span><input type="number" min="0" max="180" id="route-pause" class="field" value="${esc(route.pauseMin || 0)}"></label></div>
            <div class="field-row two"><label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="route-roundtrip" ${route.roundTrip?'checked':''}> Markér som rundtur</label><label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="route-scenic" ${route.preferScenic?'checked':''}> Prioritér naturskøn oplevelse</label></div>
            <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" id="route-traffic" ${route.avoidTraffic?'checked':''}> Forsøg at undgå trafikerede veje</label>
            <label><span class="field-label">Højdepunkter / stop (kommasepareret)</span><input id="route-highlights" class="field" value="${esc((route.highlights||[]).join(', '))}" placeholder="Udsigtspunkt, café, badesø"></label>
            <label><span class="field-label">Ekstra noter til ruten</span><textarea id="route-notes">${esc(route.notes || '')}</textarea></label>
          </div>
          <div class="route-editor-help"><strong>Sådan tegner du:</strong> Klik på kortet for at tilføje punkter. Træk punkterne for at flytte dem. Dobbeltklik på et mellempunkt for at fjerne det.</div>
          <div class="route-editor-actions">
            <button class="primary-btn" id="calculate-route-btn">Beregn cykelrute</button>
            <button class="ghost-btn" id="snap-route-btn">Fastgør til vejnet</button>
            <button class="ghost-btn" id="route-start-site-btn">Start ved campingplads</button>
            <button class="ghost-btn" id="route-current-btn">Brug min placering</button>
            <button class="ghost-btn" id="route-undo-btn">Fjern sidste punkt</button>
            <button class="danger-btn subtle-danger" id="route-clear-btn">Ryd punkter</button>
          </div>
          <div class="route-tools-grid">
            <button class="tool-card" id="route-isochrone-btn"><span>◉</span><strong>15/30 min rækkevidde</strong><small>Vis hvor langt I kan cykle</small></button>
            <button class="tool-card" id="route-pois-btn"><span>⌖</span><strong>Find oplevelser</strong><small>Se seværdigheder nær ruten</small></button>
            <button class="tool-card" id="route-elevation-btn"><span>⌁</span><strong>Højdeprofil</strong><small>Hent højdedata for ruten</small></button>
            <button class="tool-card" id="route-export-gpx-btn"><span>⇩</span><strong>Eksportér GPX</strong><small>Gem ruten som GPX-fil</small></button>
          </div>
          <div id="route-tool-results" class="stack"></div>
          <div class="route-save-bar"><button class="primary-btn warm" id="save-route-btn">Gem rute</button><button class="ghost-btn" id="duplicate-route-btn">Duplikér</button><button class="ghost-btn" data-nav="${original ? 'route/'+original.id : route.siteId ? 'detail/'+route.siteId : 'overview'}">Annuller</button>${original ? `<button class="danger-btn" id="delete-route-btn">Slet rute</button>` : ''}</div>
        </section>
        <section class="route-map-panel card">
          <div class="route-map-toolbar"><div class="seg-group">${Object.entries(window.VCMaps.styles).slice(0,5).map(([key,def]) => `<button class="seg-btn ${state.settings.mapStyle===key?'active':''}" data-route-map-style="${key}">${esc(def.label.replace('Camping – ','').replace('Lyst – ','').replace('Roligt – ','').replace('Natur – ',''))}</button>`).join('')}</div><div class="route-live-metrics"><span><strong id="live-distance">${route.distanceKm || '—'}</strong> km</span><span><strong id="live-duration">${route.durationMin || '—'}</strong> min</span><span><strong id="live-points">${route.points.length}</strong> punkter</span></div></div>
          <div id="route-editor-map" class="map-holder route-editor-map"></div>
        </section>
      </div>`;

    const setStatus = (text, kind='') => { const el=qs('#route-status'); el.textContent=text; el.dataset.kind=kind; };
    const syncPoints = points => { route.points = points; qs('#live-points').textContent = points.length; route.geojson = null; setStatus('Ruten er ændret','changed'); };
    activeRouteEditor = window.VCMaps.createRouteEditor('route-editor-map', {
      points: route.points,
      routeGeoJSON: route.geojson,
      styleKey: state.settings.mapStyle,
      clickToAdd: true,
      onChange: syncPoints,
      onFallback: () => toast('Kortstilen fejlede – reservekortet er slået til.'),
    });
    if (route.isochrone) window.VCMaps.upsertGeoJSONFill(activeRouteEditor.map, 'route-isochrone', route.isochrone);

    qsa('[data-route-map-style]').forEach(btn => btn.onclick = () => {
      state.settings.mapStyle = btn.dataset.routeMapStyle;
      saveState(false);
      activeRouteEditor.setStyle(btn.dataset.routeMapStyle);
      qsa('[data-route-map-style]').forEach(b => b.classList.toggle('active', b===btn));
    });
    qs('#route-site').onchange = () => { route.siteId = qs('#route-site').value; };
    qs('#route-start-site-btn').onclick = () => {
      const selected = getSite(qs('#route-site').value);
      if (!selected?.coords?.lat || !selected?.coords?.lng) return toast('Den valgte campingplads mangler koordinater.');
      const point = {lng:Number(selected.coords.lng),lat:Number(selected.coords.lat),label:selected.name};
      const points = activeRouteEditor.getPoints();
      points.length ? points[0]=point : points.push(point);
      activeRouteEditor.setPoints(points);
      route.start = selected.name;
      qs('#route-start').value = selected.name;
    };
    qs('#route-current-btn').onclick = async () => { const loc=await getCurrentPosition(); if(loc) activeRouteEditor.addPoint({...loc,label:'Min placering'}); };
    qs('#route-undo-btn').onclick = () => activeRouteEditor.removeLast();
    qs('#route-clear-btn').onclick = () => activeRouteEditor.clear();
    qs('#calculate-route-btn').onclick = async () => {
      const points = activeRouteEditor.getPoints();
      if (points.length < 2) return toast('Ruten skal have mindst start og mål.');
      setBusy(qs('#calculate-route-btn'), true, 'Beregner…'); setStatus('Beregner rute…','busy');
      try {
        const result = await ors.directions(points.map(p=>[Number(p.lng),Number(p.lat)]), qs('#route-profile').value || route.profile || 'cycling-regular');
        const summary = result?.features?.[0]?.properties?.summary || {};
        route.geojson = result;
        route.distanceKm = (Number(summary.distance || 0) / 1000).toFixed(1);
        route.durationMin = Math.round(Number(summary.duration || 0)/60);
        route.ascentM = Math.round(Number(result?.features?.[0]?.properties?.ascent || 0));
        route.descentM = Math.round(Number(result?.features?.[0]?.properties?.descent || 0));
        activeRouteEditor.setRouteGeoJSON(result);
        qs('#live-distance').textContent = route.distanceKm;
        qs('#live-duration').textContent = route.durationMin;
        setStatus('Ruten er beregnet','ok');
      } catch(err) { handleOrsError(err); setStatus('Beregning fejlede','error'); }
      finally { setBusy(qs('#calculate-route-btn'), false, 'Beregn cykelrute'); }
    };
    qs('#snap-route-btn').onclick = async () => {
      const points=activeRouteEditor.getPoints(); if(!points.length) return toast('Tilføj først punkter.');
      setBusy(qs('#snap-route-btn'),true,'Fastgør…');
      try {
        const result=await ors.snap(points.map(p=>[Number(p.lng),Number(p.lat)]),qs('#route-profile').value || route.profile || 'cycling-regular',500);
        const snapped=(result?.features||[]).map((f,i)=>({lng:Number(f.geometry.coordinates[0]),lat:Number(f.geometry.coordinates[1]),label:points[i]?.label||`Punkt ${i+1}`}));
        if(snapped.length) activeRouteEditor.setPoints(snapped); else toast('Ingen punkter kunne fastgøres.');
      } catch(err){ handleOrsError(err); }
      finally { setBusy(qs('#snap-route-btn'),false,'Fastgør til vejnet'); }
    };
    qs('#route-isochrone-btn').onclick = async () => {
      const point=activeRouteEditor.getPoints()[0]; if(!point) return toast('Tilføj et startpunkt først.');
      try { route.isochrone=await ors.isochrones([[point.lng,point.lat]],qs('#route-profile').value || route.profile || 'cycling-regular',[900,1800]); window.VCMaps.upsertGeoJSONFill(activeRouteEditor.map,'route-isochrone',route.isochrone); toast('Rækkevidde for 15 og 30 minutter vises på kortet.'); } catch(err){ handleOrsError(err); }
    };
    qs('#route-pois-btn').onclick = async () => {
      const point=activeRouteEditor.getPoints()[0]; if(!point) return toast('Tilføj et startpunkt først.');
      const wrap=qs('#route-tool-results'); wrap.innerHTML='<div class="panel">Søger efter oplevelser…</div>';
      try {
        const result=await ors.poisAround(point.lng,point.lat,2000);
        const features=(result?.features||[]).filter(f=>f.properties?.osm_tags?.name).slice(0,8);
        wrap.innerHTML=`<div class="panel"><div class="section-head"><h3>Oplevelser tæt på ruten</h3><span>${features.length} fundet</span></div>${features.map(f=>`<div class="table-row"><span>${esc(f.properties.osm_tags.name)}</span><span class="subtle">${esc(Object.values(f.properties.category_ids||{})[0]?.category_name||'Seværdighed')}</span><span>${Math.round(f.properties.distance||0)} m</span><button class="mini-btn" data-add-poi="${f.geometry.coordinates[0]},${f.geometry.coordinates[1]}">Tilføj stop</button></div>`).join('')||'<div class="empty">Ingen navngivne oplevelser fundet.</div>'}</div>`;
        qsa('[data-add-poi]').forEach(btn=>btn.onclick=()=>{ const [lng,lat]=btn.dataset.addPoi.split(',').map(Number); activeRouteEditor.addPoint({lng,lat,label:'Oplevelse'},false); });
      } catch(err){ wrap.innerHTML=''; handleOrsError(err); }
    };
    qs('#route-elevation-btn').onclick = async () => {
      if(!route.geojson) return toast('Beregn først ruten.');
      try {
        const line=route.geojson.features?.[0]?.geometry;
        const result=await ors.elevationLine(line,'geojson');
        const coords=result?.geometry?.coordinates||result?.features?.[0]?.geometry?.coordinates||[];
        const heights=coords.map(c=>Number(c[2])).filter(Number.isFinite);
        if(heights.length) qs('#route-tool-results').innerHTML=`<div class="panel"><h3>Højdeprofil</h3><div class="route-metrics"><div class="metric-card"><span>Laveste punkt</span><strong>${Math.round(Math.min(...heights))} m</strong></div><div class="metric-card"><span>Højeste punkt</span><strong>${Math.round(Math.max(...heights))} m</strong></div><div class="metric-card"><span>Højdeforskel</span><strong>${Math.round(Math.max(...heights)-Math.min(...heights))} m</strong></div></div></div>`;
        else toast('Højdedata var ikke tilgængelige.');
      } catch(err){ handleOrsError(err); }
    };
    qs('#save-route-btn').onclick = () => {
      route.siteId=qs('#route-site').value;
      route.name=qs('#route-name').value.trim()||'Ny cykelrute';
      route.difficulty=qs('#route-difficulty').value;
      route.profile=qs('#route-profile').value;
      route.routeType=qs('#route-type').value;
      route.surface=qs('#route-surface').value;
      route.pauseMin=Number(qs('#route-pause').value || 0);
      route.roundTrip=qs('#route-roundtrip').checked;
      route.preferScenic=qs('#route-scenic').checked;
      route.avoidTraffic=qs('#route-traffic').checked;
      route.highlights=splitCsv(qs('#route-highlights').value);
      route.notes=qs('#route-notes').value.trim();
      route.start=qs('#route-start').value.trim(); route.end=qs('#route-end').value.trim();
      route.description=qs('#route-description').value.trim(); route.googleMapsUrl=qs('#route-google').value.trim();
      route.points=activeRouteEditor.getPoints();
      route.waypoints=route.points.slice(1,-1).map((p,i)=>p.label||`Stop ${i+1}`);
      state.campsites.forEach(camp => { camp.routeIds = (camp.routeIds || []).filter(routeId => routeId !== route.id); });
      if(original) Object.assign(original,route); else state.routes.push(route);
      if(route.siteId){ const linked=getSite(route.siteId); if(linked && !linked.routeIds.includes(route.id)) linked.routeIds.push(route.id); }
      saveState(); toast('Cykelruten er gemt.'); navigate('route/'+route.id);
    };

    qs('#route-export-gpx-btn').onclick = () => { route.points = activeRouteEditor.getPoints(); downloadRouteGpx(route); };
    qs('#duplicate-route-btn').onclick = () => {
      const clone = structuredClone(route);
      clone.id = uid();
      clone.name = `${route.name} (kopi)`;
      state.routes.push(clone);
      if (clone.siteId) {
        const linked = getSite(clone.siteId);
        if (linked && !linked.routeIds.includes(clone.id)) linked.routeIds.push(clone.id);
      }
      saveState(); toast('Ruten er duplikeret.'); navigate('route-edit/' + clone.id);
    };
    if(original) qs('#delete-route-btn').onclick=async()=>{ if(await confirmAction('Slet cykelrute','Ruten fjernes permanent.')){ state.routes=state.routes.filter(r=>r.id!==route.id); state.campsites.forEach(s=>s.routeIds=s.routeIds.filter(rid=>rid!==route.id)); saveState(); toast('Ruten er slettet.'); navigate(route.siteId?'detail/'+route.siteId:'overview'); } };
  }

  function pointsToGeoJSON(points){
    return {type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:(points||[]).map(p=>[Number(p.lng),Number(p.lat)])}}]};
  }

  function handleOrsError(err){
    console.error(err);
    if(err?.code==='ORS_KEY_MISSING') toast('Indsæt først din Openrouteservice API-nøgle under Indstillinger.');
    else toast(err?.message || 'Openrouteservice kunne ikke gennemføre handlingen.');
  }

  function renderSearch(view){
    setHeader('Campingpladssøgning', 'Find campingpladser og adresser med Openrouteservice');
    view.innerHTML = `
      <div class="view-grid search-page">
        <section class="search-hero card">
          <div><span class="eyebrow">Find næste stop</span><h2>Søg online eller opret manuelt</h2><p>Vælg et resultat, så navn, adresse og koordinater overføres direkte til formularen.</p></div>
          <div class="search-hero-bar"><label class="search-with-icon"><span>⌕</span><input id="standalone-search" class="search-box" placeholder="Fx Camping Cochem, Interlaken eller Nordkap"></label><button class="primary-btn warm" id="standalone-search-btn">Søg campingplads</button><button class="glass-btn" data-nav="add?status=visited">Manuel oprettelse</button></div>
        </section>
        <section id="standalone-results" class="stack"></section>
      </div>`;
    const run = async () => {
      const q = qs('#standalone-search').value.trim();
      if(!q) return toast('Skriv et navn eller område først.');
      setBusy(qs('#standalone-search-btn'), true, 'Søger…');
      try { renderOnlineResults(await orsGeocodeSearch(q), '#standalone-results'); }
      finally { setBusy(qs('#standalone-search-btn'), false, 'Søg campingplads'); }
    };
    qs('#standalone-search-btn').onclick = run;
    qs('#standalone-search').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
  }

  function setBusy(button, busy, label){
    if (!button) return;
    button.disabled = busy;
    button.textContent = label;
    button.classList.toggle('is-busy', busy);
  }

  function renderSiteForm(view, siteId, statusDefault, prefillId){
    const existing = siteId ? structuredClone(getSite(siteId)) : null;
    const prefill = prefillId ? JSON.parse(prefillId) : null;
    const site = existing || makeSite({status: statusDefault || 'visited'});
    if (prefill) applyPrefill(site, prefill);
    setHeader(siteId ? 'Rediger campingplads' : 'Tilføj campingplads', siteId ? 'Ændr alle tidligere gemte oplysninger' : 'Opret besøgt plads eller ønskebesøg');
    view.innerHTML = `
      <div class="view-grid">
        <form id="site-form" class="form-grid">
          <section class="form-section card">
            <div class="section-head"><h3>Status og grunddata</h3><div class="action-row"><button type="button" class="ghost-btn" id="lookup-name-btn">Søg efter navn</button><button type="button" class="ghost-btn" id="use-current-location-btn">Brug min placering</button></div></div>
            <div class="field-row"><label><span class="field-label">Status</span><select name="status" class="field"><option value="visited" ${site.status==='visited'?'selected':''}>Besøgt campingplads</option><option value="wish" ${site.status==='wish'?'selected':''}>Campingplads vi vil besøge</option></select></label><label><span class="field-label">Campingpladsens navn</span><input name="name" class="field" required value="${esc(site.name)}"></label></div>
            <div class="field-row"><label><span class="field-label">Adresse</span><input name="address" class="field" value="${esc(site.address)}"></label><label><span class="field-label">Postnummer</span><input name="postcode" class="field" value="${esc(site.postcode)}"></label></div>
            <div class="field-row three"><label><span class="field-label">By</span><input name="city" class="field" value="${esc(site.city)}"></label><label><span class="field-label">Område / region</span><input name="region" class="field" value="${esc(site.region)}"></label><label><span class="field-label">Land</span><input name="country" class="field" value="${esc(site.country)}"></label></div>
            <div class="field-row"><label><span class="field-label">Hjemmeside</span><input name="website" class="field" value="${esc(site.website)}"></label><label><span class="field-label">Telefonnummer</span><input name="phone" class="field" value="${esc(site.phone)}"></label></div>
            <div class="field-row"><label><span class="field-label">Breddegrad</span><input name="lat" class="field" value="${esc(site.coords?.lat || '')}"></label><label><span class="field-label">Længdegrad</span><input name="lng" class="field" value="${esc(site.coords?.lng || '')}"></label></div>
            <div class="point-picker-shell"><div class="section-head"><div><strong>Flyt markøren manuelt</strong><div class="subtle small">Klik på kortet eller træk markøren. Koordinaterne opdateres automatisk.</div></div><span class="badge">Præcis placering</span></div><div id="point-picker-map" class="map-holder point-picker-map"></div></div>
          </section>

          <section class="form-section card">
            <h3>Besøg, datoer og indhold</h3>
            <div class="field-row"><label><span class="field-label">Besøgsdatoer (kommasepareret)</span><input name="visits" class="field" value="${esc((site.visits||[]).join(', '))}" placeholder="2025-05-03, 2026-07-14"></label><label><span class="field-label">Forventet besøgsdato</span><input type="date" name="plannedDate" class="field" value="${site.plannedDate ? String(site.plannedDate).slice(0,10) : ''}"></label></div>
            <label><span class="field-label">Beskrivelse</span><textarea name="description">${esc(site.description)}</textarea></label>
            <label><span class="field-label">Private noter</span><textarea name="notes">${esc(site.notes)}</textarea></label>
            <label><span class="field-label">Tags (kommasepareret)</span><input name="tags" class="field" value="${esc((site.tags||[]).join(', '))}" placeholder="Natur, Ved vandet, Hundevenlig"></label>
            <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" name="favorite" ${site.favorite?'checked':''}> Marker som favorit</label>
          </section>

          <section class="form-section card">
            <div class="section-head"><h3>Vurderinger, billeder og seværdigheder</h3><button type="button" class="ghost-btn" id="upload-site-images-btn">Tilføj billeder</button><input type="file" multiple class="hidden-file" id="upload-site-images" accept="image/*"></div>
            <div class="rating-grid">${state.categories.map(cat => `<label><span class="field-label">${esc(cat.icon)} ${esc(cat.name)}</span>${starInput(cat.id, Number(site.ratings?.[cat.id] || 0))}</label>`).join('')}</div>
            <div class="gallery" id="site-image-gallery">${(site.images||[]).map((src, i) => `<div style="position:relative;"><img src="${src}" alt=""><button type="button" class="mini-btn" style="position:absolute;top:8px;right:8px;" data-remove-image="${i}">Fjern</button></div>`).join('')}</div>
            <label><span class="field-label">Seværdigheder (én pr. linje: navn | beskrivelse | link)</span><textarea name="attractions">${(site.attractions||[]).map(a => [a.name,a.description||'',a.link||''].join(' | ')).join('\n')}</textarea></label>
          </section>

          <section class="form-section card">
            <div class="section-head"><h3>Cykelruter</h3><button type="button" class="ghost-btn" id="add-route-btn">Tilføj cykelrute</button></div>
            <div id="route-editor-wrap" class="stack">${renderRouteEditors(site.routeIds.map(id => getRoute(id)).filter(Boolean))}</div>
          </section>

          <section class="form-section card">
            <div class="action-row"><button class="primary-btn" type="submit">Gem campingplads</button><button class="ghost-btn" type="button" data-nav="${siteId ? 'detail/'+siteId : 'overview'}">Annuller</button>${siteId ? `<button class="danger-btn" type="button" id="delete-site-btn">Slet campingpladsen</button>` : ''}</div>
          </section>
        </form>
      </div>`;
    bindSiteForm(siteId, site);
  }

  function renderRouteEditors(routes){
    if (!routes.length) return `<div class="empty">Ingen ruter endnu. Tilføj en rute, gem campingpladsen og åbn derefter den avancerede korteditor.</div>`;
    return routes.map(r => routeEditorCard(r)).join('');
  }

  function routeEditorCard(r){
    const persisted = Boolean(getRoute(r.id));
    return `<div class="panel route-card" data-route-id="${r.id}"><div class="section-head"><div><strong>${esc(r.name || 'Ny rute')}</strong><div class="subtle small">${r.distanceKm ? `${esc(r.distanceKm)} km · ${esc(r.durationMin)} min` : 'Ikke beregnet endnu'}</div></div><div class="action-row">${persisted ? `<button type="button" class="mini-btn" data-nav="route-edit/${r.id}">Åbn korteditor</button>` : ''}<button type="button" class="mini-btn" data-remove-route="${r.id}">Slet</button></div></div><div class="field-row"><input class="field" data-route-field="name" value="${esc(r.name || '')}" placeholder="Rutenavn"><input class="field" data-route-field="difficulty" value="${esc(r.difficulty || '')}" placeholder="Sværhedsgrad"></div><div class="field-row"><input class="field" data-route-field="start" value="${esc(r.start || '')}" placeholder="Startsted"><input class="field" data-route-field="end" value="${esc(r.end || '')}" placeholder="Slutsted"></div><label><span class="field-label">Mellempunkter (kommasepareret)</span><input class="field" data-route-field="waypoints" value="${esc((r.waypoints||[]).join(', '))}"></label><div class="field-row"><input class="field" data-route-field="distanceKm" value="${esc(r.distanceKm || '')}" placeholder="Afstand i km"><input class="field" data-route-field="durationMin" value="${esc(r.durationMin || '')}" placeholder="Varighed i min"></div><label><span class="field-label">Google Maps-link</span><input class="field" data-route-field="googleMapsUrl" value="${esc(r.googleMapsUrl || '')}" placeholder="Indsæt delt Google Maps-link"></label><label><span class="field-label">Rutebeskrivelse</span><textarea data-route-field="description">${esc(r.description || '')}</textarea></label><div class="action-row"><button type="button" class="ghost-btn" data-calc-route="${r.id}">Beregn enkel rute</button><button type="button" class="ghost-btn" data-share-route-local="${r.id}">Del</button></div></div>`;
  }

  function starInput(catId, value){
    return `<div class="stars" data-star-group="${catId}">${[1,2,3,4,5].map(v => `<button type="button" class="star-btn ${v<=Math.round(value)?'on':''}" data-star="${catId}" data-value="${v}">★</button>`).join('')}<input type="hidden" name="rating_${catId}" value="${value || 0}"></div>`;
  }

  function bindSiteForm(siteId, site){
    let images = [...(site.images||[])];
    let routes = site.routeIds.map(id => structuredClone(getRoute(id))).filter(Boolean);
    const form = qs('#site-form');
    const initialLat = Number(parseCoord(site.coords?.lat));
    const initialLng = Number(parseCoord(site.coords?.lng));
    const pointPicker = window.VCMaps.createPointPicker('point-picker-map', {
      styleKey: state.settings.mapStyle,
      status: site.status,
      point: Number.isFinite(initialLat) && Number.isFinite(initialLng) ? {lat:initialLat,lng:initialLng} : null,
      onChange: point => { form.lat.value=point.lat.toFixed(6); form.lng.value=point.lng.toFixed(6); },
      onFallback: () => toast('Kortet skiftede til reservekortet.'),
    });
    form.status.addEventListener('change', () => pointPicker.setStatus(form.status.value));
    const syncPickerFromFields = () => {
      const lat=Number(parseCoord(form.lat.value)), lng=Number(parseCoord(form.lng.value));
      if(Number.isFinite(lat)&&Number.isFinite(lng)) pointPicker.setPoint({lat,lng},false);
    };
    form.lat.addEventListener('change',syncPickerFromFields);
    form.lng.addEventListener('change',syncPickerFromFields);
    qsa('[data-star]', form).forEach(btn => btn.onclick = () => {
      const name = btn.dataset.star;
      const value = Number(btn.dataset.value);
      qs(`input[name="rating_${name}"]`, form).value = value;
      qsa(`[data-star="${name}"]`, form).forEach(b => b.classList.toggle('on', Number(b.dataset.value) <= value));
    });
    qs('#upload-site-images-btn').onclick = () => qs('#upload-site-images').click();
    qs('#upload-site-images').onchange = async e => {
      const files = [...e.target.files];
      for (const file of files) images.push(await compressImage(file));
      redrawImages();
    };
    function redrawImages(){ qs('#site-image-gallery').innerHTML = images.map((src, i) => `<div style="position:relative;"><img src="${src}" alt=""><button type="button" class="mini-btn" style="position:absolute;top:8px;right:8px;" data-remove-image="${i}">Fjern</button></div>`).join(''); qsa('[data-remove-image]').forEach(btn => btn.onclick = () => { images.splice(Number(btn.dataset.removeImage),1); redrawImages(); }); }
    redrawImages();
    qs('#lookup-name-btn').onclick = async () => {
      const q = form.name.value.trim(); if (!q) return toast('Skriv først et navn at søge efter.');
      const results = await orsGeocodeSearch(q);
      if (!results[0]) return toast('Ingen resultater fundet.');
      applyPrefill(site, results[0]); refillForm(); toast('Oplysninger udfyldt automatisk fra søgeresultat.');
    };
    qs('#use-current-location-btn').onclick = async () => {
      const loc = await getCurrentPosition(); if (!loc) return; form.lat.value = loc.lat.toFixed(6); form.lng.value = loc.lng.toFixed(6); pointPicker.setPoint(loc); toast('Aktuel placering indsat.');
    };
    function refillForm(){
      form.name.value = site.name || ''; form.address.value=site.address||''; form.postcode.value=site.postcode||''; form.city.value=site.city||''; form.region.value=site.region||''; form.country.value=site.country||''; form.website.value=site.website||''; form.phone.value=site.phone||''; form.lat.value=site.coords?.lat||''; form.lng.value=site.coords?.lng||''; syncPickerFromFields();
    }
    qs('#add-route-btn').onclick = () => { const r={ id: uid(), siteId: siteId || site.id, name:'Ny cykelrute', start:'', end:'', waypoints:[], points:[], profile:'cycling-regular', difficulty:'Let', description:'', distanceKm:'', durationMin:'', ascentM:'', descentM:'', googleMapsUrl:'', geojson:null, isochrone:null }; routes.push(r); redrawRoutes(); };
    function redrawRoutes(){ qs('#route-editor-wrap').innerHTML = renderRouteEditors(routes); bindRouteEditors(); }
    function bindRouteEditors(){
      qsa('.route-card').forEach(card => {
        const routeId = card.dataset.routeId; const r = routes.find(x => x.id === routeId); if(!r) return;
        qsa('[data-route-field]', card).forEach(inp => inp.oninput = () => {
          const k = inp.dataset.routeField;
          r[k] = k==='waypoints' ? inp.value.split(',').map(s=>s.trim()).filter(Boolean) : inp.value;
        });
      });
      qsa('[data-remove-route]').forEach(btn => btn.onclick = () => { routes = routes.filter(r => r.id !== btn.dataset.removeRoute); redrawRoutes(); });
      qsa('[data-share-route-local]').forEach(btn => btn.onclick = () => { const r = routes.find(x=>x.id===btn.dataset.shareRouteLocal); if(r) shareRoute(r); });
      qsa('[data-calc-route]').forEach(btn => btn.onclick = async () => {
        const r = routes.find(x => x.id===btn.dataset.calcRoute); if(!r) return;
        setBusy(btn, true, 'Beregner…');
        try {
          const points = await resolveRouteCoordinates(r, form);
          if (points.length < 2) return toast('Angiv start og mål, eller brug den avancerede korteditor.');
          const result = await ors.directions(points.map(p => [p.lng,p.lat]), r.profile || 'cycling-regular');
          const summary = result?.features?.[0]?.properties?.summary || {};
          r.points = points; r.geojson = result;
          r.distanceKm = (Number(summary.distance || 0) / 1000).toFixed(1);
          r.durationMin = Math.round(Number(summary.duration || 0)/60);
          toast('Ruten er beregnet. Gem campingpladsen for at åbne korteditoren.');
          redrawRoutes();
        } catch(err) { handleOrsError(err); }
        finally { setBusy(btn, false, 'Beregn enkel rute'); }
      });
    }
    bindRouteEditors();

    form.onsubmit = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const target = siteId ? getSite(siteId) : makeSite({id: uid()});
      target.status = data.status;
      target.name = data.name.trim(); target.address = data.address.trim(); target.postcode = data.postcode.trim(); target.city = data.city.trim(); target.region = data.region.trim(); target.country = data.country.trim(); target.website = data.website.trim(); target.phone = data.phone.trim();
      target.coords = { lat: parseCoord(data.lat), lng: parseCoord(data.lng) };
      target.visits = splitCsv(data.visits); target.plannedDate = data.plannedDate || '';
      target.description = data.description.trim(); target.notes = data.notes.trim(); target.tags = splitCsv(data.tags); target.favorite = !!data.favorite; target.images = images;
      target.ratings = {}; state.categories.forEach(cat => { target.ratings[cat.id] = Number(data['rating_'+cat.id] || 0); });
      target.attractions = parseAttractions(data.attractions);
      // persist routes
      target.routeIds = routes.map(r => r.id);
      routes.forEach(r => { r.siteId = target.id; });
      if (siteId) {
        Object.assign(getSite(siteId), target);
        state.routes = state.routes.filter(r => r.siteId !== target.id).concat(routes);
      } else {
        state.campsites.push(target);
        state.routes = state.routes.concat(routes);
      }
      saveState();
      toast(siteId ? 'Campingplads opdateret.' : 'Campingplads gemt.');
      navigate('detail/' + target.id);
    };
    if (siteId) qs('#delete-site-btn').onclick = async () => {
      if (await confirmAction('Slet campingplads', 'Denne handling kan ikke fortrydes.')) {
        state.campsites = state.campsites.filter(s => s.id !== siteId); state.routes = state.routes.filter(r => r.siteId !== siteId); saveState(); toast('Campingplads slettet.'); navigate('overview');
      }
    };
  }

  async function resolveRouteCoordinates(route, form){
    if (Array.isArray(route.points) && route.points.length >= 2) return route.points.map(p => ({lng:Number(p.lng),lat:Number(p.lat),label:p.label||''}));
    const lat = Number(parseCoord(form.lat.value));
    const lng = Number(parseCoord(form.lng.value));
    const points = [];
    if (Number.isFinite(lat) && Number.isFinite(lng)) points.push({lng,lat,label:route.start || form.name.value || 'Start'});
    const searches = [...(route.waypoints || []), route.end].filter(Boolean);
    for (const query of searches) {
      const results = await orsGeocodeSearch([query, form.city.value, form.country.value].filter(Boolean).join(', '));
      if (results[0] && Number.isFinite(Number(results[0].lng)) && Number.isFinite(Number(results[0].lat))) {
        points.push({lng:Number(results[0].lng),lat:Number(results[0].lat),label:query});
      }
    }
    return points;
  }

  function parseCoord(v){ return String(v || '').trim().replace(',', '.'); }
  function splitCsv(s=''){ return s.split(',').map(x => x.trim()).filter(Boolean); }
  function parseAttractions(text=''){ return text.split(/\n+/).map(line => line.trim()).filter(Boolean).map(line => { const [name='',description='',link=''] = line.split('|').map(s=>s.trim()); return { name, description, link }; }); }
  function applyPrefill(site, prefill){
    site.name = prefill.name || prefill.label || site.name;
    site.city = prefill.city || prefill.locality || site.city;
    site.region = prefill.region || site.region;
    site.country = prefill.country || site.country;
    site.address = prefill.address || site.address;
    site.postcode = prefill.postcode || site.postcode;
    if (prefill.lng && prefill.lat) site.coords = { lng: prefill.lng, lat: prefill.lat };
    if (prefill.website) site.website = prefill.website;
    if (prefill.phone) site.phone = prefill.phone;
  }


function bindSettingsHandlers(){
  qs('#save-text-settings').onclick = () => {
    state.settings.appName = qs('#set-app-name').value.trim() || 'Vores Camping';
    state.settings.tagline = qs('#set-tagline').value.trim();
    state.settings.greeting = qs('#set-greeting').value.trim();
    state.settings.intro = qs('#set-intro').value.trim();
    saveState(); toast('Tekster gemt.'); renderRoute();
  };
  qs('#save-family-settings').onclick = () => {
    state.settings.family = {
      fatherName: qs('#set-father-name').value.trim(),
      fatherBirth: qs('#set-father-birth').value,
      motherName: qs('#set-mother-name').value.trim(),
      motherNick: qs('#set-mother-nick').value.trim(),
      motherBirth: qs('#set-mother-birth').value,
      dogName: qs('#set-dog-name').value.trim(),
      dogBirth: qs('#set-dog-birth').value.trim(),
      motto: qs('#set-family-motto').value.trim() || 'Vores ture, vores frihed, vores minder',
      useNickname: qs('#set-use-nickname').checked,
      showBirthdays: qs('#set-show-birthdays').checked,
    };
    saveState(); toast('Familieoplysninger gemt.'); renderRoute();
  };
  qs('#save-countdown-settings').onclick = () => { state.settings.nextTripName = qs('#set-trip-name').value.trim(); state.settings.nextTripDate = fromLocalInputValue(qs('#set-trip-date').value); state.settings.showCountdown = qs('#set-show-countdown').checked; saveState(); toast('Nedtælling gemt.'); renderRoute(); };
  qs('#save-hero-clock-settings').onclick = () => {
    state.settings.heroClock = {
      enabled: qs('#set-clock-enabled').checked,
      showDate: qs('#set-clock-date-enabled').checked,
      showWeather: qs('#set-clock-weather-enabled').checked,
      useCurrentLocation: qs('#set-clock-location-enabled').checked,
      title: qs('#set-clock-title').value.trim() || 'Lokal tid og vejr',
      subtitle: qs('#set-clock-subtitle').value.trim() || 'Lige nu hvor I er'
    };
    saveState(); toast('Forsideuret er opdateret.'); refreshWeather(true); renderRoute();
  };
  qs('#save-style-settings').onclick = () => { state.settings.fontScale = Number(qs('#set-scale').value); state.settings.accent = qs('#set-accent').value; state.settings.compact = qs('#set-compact').checked; saveState(); toast('Layout og farver gemt.'); renderRoute(); };
  qs('#save-map-prefs').onclick = () => { state.settings.mapStyle = qs('#set-map-style').value; state.settings.mapScope = qs('#set-map-scope').value; saveState(); toast('Kortvalg gemt.'); renderRoute(); };
  qs('#save-route-defaults').onclick = () => {
    state.settings.routeDefaults.profile = qs('#set-route-profile').value;
    state.settings.routeDefaults.routeType = qs('#set-route-type').value;
    state.settings.routeDefaults.surface = qs('#set-route-surface').value;
    state.settings.routeDefaults.pauseMin = Number(qs('#set-route-pause').value || 0);
    state.settings.routeDefaults.preferScenic = qs('#set-route-scenic').checked;
    state.settings.routeDefaults.avoidTraffic = qs('#set-route-traffic').checked;
    saveState(); toast('Standardindstillinger for cykelruter er gemt.');
  };
  qs('#save-categories-btn').onclick = () => {
    state.categories = state.categories.map(cat => ({ ...cat, name: qs(`[data-cat-name="${cat.id}"]`)?.value.trim() || cat.name, icon: qs(`[data-cat-icon="${cat.id}"]`)?.value.trim() || cat.icon }));
    saveState(); toast('Kategorier gemt.'); renderRoute();
  };
  qs('#add-category-btn').onclick = () => { const name=qs('#new-cat-name').value.trim(); if(!name) return; const icon=qs('#new-cat-icon').value.trim() || '⭐'; state.categories.push({id: uid(), name, icon}); saveState(); renderRoute(); };
  qsa('[data-remove-category]').forEach(btn => btn.onclick = async () => { if(await confirmAction('Fjern kategori', 'Kategorien fjernes fra listen.')) { state.categories = state.categories.filter(c => c.id !== btn.dataset.removeCategory); saveState(); renderRoute(); } });
  qs('#save-api-settings').onclick = () => {
    secrets.orsKey = qs('#set-ors-key').value.trim();
    secrets.googleMapsKey = qs('#set-google-key').value.trim();
    saveSecrets(); saveState(false); toast('Kort og API-nøgler gemt lokalt på enheden.');
  };
  qs('#test-ors-btn').onclick = async () => {
    secrets.orsKey = qs('#set-ors-key').value.trim(); saveSecrets();
    setBusy(qs('#test-ors-btn'),true,'Tester…');
    try { const result=await ors.search('Holstebro, Danmark',{size:1}); toast(result?.features?.length ? 'Forbindelsen til Openrouteservice virker.' : 'Forbindelsen svarede, men uden resultater.'); }
    catch(err){ handleOrsError(err); }
    finally { setBusy(qs('#test-ors-btn'),false,'Test Openrouteservice'); }
  };
  qs('#export-btn').onclick = exportBackup;
  qs('#import-btn').onclick = () => qs('#import-file').click();
  qs('#import-file').onchange = importBackup;
  qs('#reset-data-btn').onclick = async () => { if(await confirmAction('Nulstil campingdata', 'Alle gemte campingdata slettes, men API-nøgler og appens faste billeder bevares.')) { state = seedState(); saveState(); toast('Campingdata nulstillet.'); navigate('overview'); } };
  wireImageUpload('#upload-cover-btn','#upload-cover', img => { state.settings.coverImage = img; saveState(); renderRoute(); });
  wireImageUpload('#upload-corner-btn','#upload-corner', img => { state.settings.cornerImage = img; saveState(); renderRoute(); });
  wireImageUpload('#upload-logo-btn','#upload-logo', img => { state.settings.logo = img; saveState(); renderRoute(); });
  qsa('[data-section-toggle]').forEach(box => box.onchange = () => { const id = box.dataset.sectionToggle; const set = new Set(state.settings.sections); box.checked ? set.add(id) : set.delete(id); state.settings.sections = [...set]; saveState(false); });
}

function labelForSection(id){ return ({map:'Oversigtskort',stats:'Statistik',latest:'Seneste besøg',top:'Bedst bedømte',wishlist:'Ønskeliste',routes:'Cykelruter'})[id] || id; }
  function wireImageUpload(buttonSel, inputSel, callback){ qs(buttonSel).onclick = ()=>qs(inputSel).click(); qs(inputSel).onchange = async e => { const f=e.target.files[0]; if(!f) return; callback(await compressImage(f)); toast('Billede gemt.'); }; }


async function refreshWeather(force = false){
  const prefs = state.settings.heroClock || {};
  if (prefs.enabled === false || prefs.showWeather === false) {
    weatherState.summary = 'Vejrvisning er slået fra';
    updateLiveInfoDisplays();
    return;
  }
  const maxAge = 1000 * 60 * 20;
  if (!force && weatherState.fetchedAt && (Date.now() - weatherState.fetchedAt) < maxAge) { updateLiveInfoDisplays(); return; }
  weatherState.summary = 'Henter vejrudsigten…';
  updateLiveInfoDisplays();
  let loc = weatherState.coords;
  let usedFallback = false;
  if (prefs.useCurrentLocation !== false) loc = await getCurrentPosition() || weatherState.coords;
  if (!loc) {
    const fallback = state.campsites.find(site => site.coords?.lat && site.coords?.lng);
    loc = fallback ? { lat: Number(fallback.coords.lat), lng: Number(fallback.coords.lng) } : null;
    if (loc) { usedFallback = true; weatherState.locationLabel = fallback.city ? `${fallback.city}, ${fallback.country}` : fallback.name; }
  }
  if (!loc) {
    weatherState.summary = 'Placering ikke tilgængelig';
    weatherState.locationLabel = prefs.subtitle || 'Aktuel placering';
    weatherState.fetchedAt = Date.now();
    updateLiveInfoDisplays();
    return;
  }
  weatherState.coords = loc;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Vejrtjenesten svarede med ${res.status}`);
    const json = await res.json();
    const current = json.current || {};
    const daily = json.daily || {};
    const desc = weatherCodeLabel(current.weather_code);
    const minVal = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min[0] : null;
    const maxVal = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max[0] : null;
    const pieces = [];
    if (Number.isFinite(current.temperature_2m)) pieces.push(`${Math.round(current.temperature_2m)}°C`);
    if (desc) pieces.push(desc);
    if (Number.isFinite(current.wind_speed_10m)) pieces.push(`vind ${Math.round(current.wind_speed_10m)} km/t`);
    if (Number.isFinite(minVal) && Number.isFinite(maxVal)) pieces.push(`i dag ${Math.round(minVal)}° / ${Math.round(maxVal)}°`);
    weatherState.summary = pieces.join(' · ') || 'Vejrdata utilgængelige';
    weatherState.code = Number(current.weather_code || 0);
    weatherState.locationLabel = usedFallback ? weatherState.locationLabel : (prefs.useCurrentLocation !== false ? 'Din aktuelle placering' : (prefs.subtitle || 'Valgt placering'));
  } catch (err) {
    console.error(err);
    weatherState.summary = 'Kunne ikke hente vejret lige nu';
    weatherState.locationLabel = prefs.subtitle || 'Aktuel placering';
  }
  weatherState.fetchedAt = Date.now();
  updateLiveInfoDisplays();
}

function weatherCodeLabel(code){
  const map = {0:'solrigt',1:'mest klart',2:'let skyet',3:'overskyet',45:'tåget',48:'rimtåge',51:'let støvregn',53:'støvregn',55:'kraftig støvregn',61:'let regn',63:'regn',65:'kraftig regn',71:'let sne',73:'sne',75:'kraftig sne',80:'byger',81:'regnbyger',82:'kraftige byger',95:'torden'};
  return map[Number(code)] || 'skiftende vejr';
}

function weatherIcon(code){
  const n = Number(code);
  if ([0].includes(n)) return '☀️';
  if ([1,2].includes(n)) return '🌤️';
  if ([3].includes(n)) return '☁️';
  if ([45,48].includes(n)) return '🌫️';
  if ([51,53,55,61,63,65,80,81,82].includes(n)) return '🌧️';
  if ([71,73,75].includes(n)) return '🌨️';
  if ([95].includes(n)) return '⛈️';
  return '🌦️';
}

function countdownInfo(){
  const target = new Date(state.settings.nextTripDate || Date.now());
  const diff = Math.max(0, target - new Date());
  const days = Math.floor(diff / 86400000); const hours = Math.floor(diff % 86400000 / 3600000); const minutes = Math.floor(diff % 3600000 / 60000); const seconds = Math.floor(diff % 60000 / 1000);
  return { days, hours, minutes, seconds };
}
function pad(v){ return String(v).padStart(2,'0'); }
function miniCountdown(info){ return `<div class="count-grid">${[['Dage','days'],['Timer','hours'],['Min','minutes'],['Sek','seconds']].map(([label,key])=>`<div class="count-chip"><div class="num" data-countdown-${key}>${pad(info[key])}</div><div class="lbl">${label}</div></div>`).join('')}</div>`; }
function updateLiveInfoDisplays(){
  const info = countdownInfo();
  const values = {days:info.days,hours:info.hours,minutes:info.minutes,seconds:info.seconds};
  Object.entries(values).forEach(([key,value]) => qsa(`[data-countdown-${key}]`).forEach(el => { el.textContent=pad(value); }));
  const now = new Date();
  qsa('[data-live-clock-time]').forEach(el => el.textContent = now.toLocaleTimeString('da-DK',{hour:'2-digit', minute:'2-digit'}));
  qsa('[data-live-clock-date]').forEach(el => {
    const showDate = state.settings.heroClock?.showDate !== false;
    el.textContent = showDate ? now.toLocaleDateString('da-DK',{weekday:'long', day:'numeric', month:'long', year:'numeric'}) : '';
    el.style.display = showDate ? '' : 'none';
  });
  qsa('[data-live-weather]').forEach(el => {
    const showWeather = state.settings.heroClock?.showWeather !== false;
    el.textContent = showWeather ? weatherState.summary : '';
    el.style.display = showWeather ? '' : 'none';
  });
  qsa('[data-live-location]').forEach(el => {
    el.textContent = weatherState.locationLabel || state.settings.heroClock?.subtitle || 'Aktuel placering';
  });
  qsa('[data-live-weather-icon]').forEach(el => { el.textContent = weatherIcon(weatherState.code); });
}

function mapStyleButtons(){ return Object.entries(window.VCMaps.styles).slice(0,4).map(([k,v]) => `<button class="seg-btn ${state.settings.mapStyle===k?'active':''}" data-map-style="${k}">${esc(v.label)}</button>`).join(''); }

  function initMapOnce(id, sites, opts={}){
    const el = qs('#'+id);
    if(!el) return null;
    let markerInstances = [];
    const map = window.VCMaps.createMap(id, {
      styleKey: opts.styleKey || state.settings.mapStyle,
      center: opts.center || [12,55], zoom: opts.zoom ?? 4,
      onFallback: () => { toast('Kortstilen kunne ikke indlæses. Reservekortet er aktiveret.'); drawContent(); },
    });
    const drawContent = () => {
      markerInstances.forEach(marker => { try { marker.remove(); } catch (_) {} });
      markerInstances = window.VCMaps.renderMarkers(map, sites || [], { onDetail: siteId => navigate('detail/' + siteId), onGoogle: openGoogle });
      if (opts.routeGeoJSON) window.VCMaps.upsertGeoJSONLine(map, 'route-detail-line', opts.routeGeoJSON, {color:'#1f5f3c',width:6,opacity:.94});
      else if (opts.routePoints?.length >= 2) window.VCMaps.upsertGeoJSONLine(map, 'route-detail-line', pointsToGeoJSON(opts.routePoints), {color:'#d58a31',width:5,opacity:.85});
    };
    map.on('load', () => {
      drawContent();
      if (opts.fitAll !== false && (sites||[]).length) window.VCMaps.fitToSites(map, sites);
      if (opts.routeGeoJSON) {
        const coords=opts.routeGeoJSON?.features?.[0]?.geometry?.coordinates||opts.routeGeoJSON?.geometry?.coordinates||[];
        if(coords.length) window.VCMaps.fitCoordinates(map,coords);
      } else if (opts.routePoints?.length >= 2) {
        window.VCMaps.fitCoordinates(map, opts.routePoints.map(point => [Number(point.lng),Number(point.lat)]));
      }
      opts.onReady?.(map, markerInstances);
    });
    if (id === 'overview-map') maps.overview = map;
    if (id === 'big-map') maps.big = map;
    if (id === 'detail-map') maps.detail = map;
    if (id === 'route-map') maps.route = map;
    qsa('[data-map-style]').forEach(btn => btn.onclick = () => {
      state.settings.mapStyle = btn.dataset.mapStyle;
      saveState(false);
      window.VCMaps.setStyle(map, btn.dataset.mapStyle, drawContent);
      qsa('[data-map-style]').forEach(b => b.classList.toggle('active', b.dataset.mapStyle===btn.dataset.mapStyle));
    });
    return map;
  }

  async function orsGeocodeSearch(text){
    if (!ors.hasKey()) {
      toast('Openrouteservice-nøglen mangler. Der søges i jeres allerede gemte steder.');
      return localSearchFallback(text);
    }
    try {
      const json = await ors.search(text,{size:8,lang:'da'});
      return (json.features || []).map(window.VCORS.normalizeGeocodeFeature).filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng));
    } catch(err){
      console.error(err);
      toast('Online søgning fejlede – lokale resultater vises i stedet.');
      return localSearchFallback(text);
    }
  }

  function localSearchFallback(text){
    const q = text.toLowerCase();
    return state.campsites.filter(s => haystack(s).includes(q)).slice(0,8).map(s => ({ name:s.name, label:[s.name,s.city,s.country].filter(Boolean).join(', '), city:s.city, region:s.region, country:s.country, postcode:s.postcode, lng:Number(s.coords?.lng), lat:Number(s.coords?.lat) }));
  }

  async function orsDirections(points, profile='cycling-regular'){
    try {
      const geojson = await ors.directions(points,profile);
      const summary=geojson?.features?.[0]?.properties?.summary||{};
      return {geojson,distance:Number(summary.distance||0)/1000,duration:Number(summary.duration||0)};
    } catch(err){ handleOrsError(err); return null; }
  }

  async function geocodeMissing(){
    const missing = state.campsites.filter(s => !s.coords?.lat || !s.coords?.lng);
    if (!missing.length) return toast('Der er ingen manglende koordinater.');
    for (const site of missing) {
      const [result] = await orsGeocodeSearch([site.name, site.city, site.country].filter(Boolean).join(', '));
      if (result?.lat && result?.lng) site.coords = { lat: result.lat, lng: result.lng };
    }
    saveState(); toast('Manglende koordinater er forsøgt udfyldt.'); renderRoute();
  }

  async function locateMe(map){
    const loc = await getCurrentPosition(); if(!loc) return;
    map?.flyTo({ center:[loc.lng, loc.lat], zoom: 8 });
    if (map) window.VCMaps.setUserLocation(map, loc.lng, loc.lat);
  }
  function getCurrentPosition(){ return new Promise(resolve => { if(!navigator.geolocation) return resolve(null); navigator.geolocation.getCurrentPosition(pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }), () => { toast('Placering kunne ikke hentes.'); resolve(null); }, { enableHighAccuracy:true, timeout:8000 }); }); }

  function exportBackup(){
    const clone = structuredClone(state); if (clone.settings?.api) { clone.settings.api.orsKey=''; clone.settings.api.googleMapsKey=''; }
    const blob = new Blob([JSON.stringify(clone, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `vores-camping-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href); toast('Sikkerhedskopi eksporteret.');
  }
  async function importBackup(e){
    const file = e.target.files[0]; if(!file) return;
    const text = await file.text();
    try { state = JSON.parse(text); migrateState(); saveState(); toast('Sikkerhedskopi importeret.'); renderRoute(); } catch(err){ toast('Importen mislykkedes.'); }
  }

  function routeCoordinates(route){
    const geoCoords = route?.geojson?.features?.[0]?.geometry?.coordinates || route?.geojson?.geometry?.coordinates;
    if (Array.isArray(geoCoords) && geoCoords.length) return geoCoords.map(([lng,lat]) => [Number(lng), Number(lat)]);
    return (route?.points || []).map(point => [Number(point.lng), Number(point.lat)]).filter(pair => pair.every(Number.isFinite));
  }

  function downloadRouteGpx(route){
    const coords = routeCoordinates(route);
    if (coords.length < 2) return toast('Ruten skal have mindst to punkter før GPX kan eksporteres.');
    const trkpts = coords.map(([lng,lat]) => `    <trkpt lat="${lat}" lon="${lng}"></trkpt>`).join('\n');
    const wpts = (route.highlights || []).map(name => `  <wpt lat="${coords[0][1]}" lon="${coords[0][0]}"><name>${xml(name)}</name></wpt>`).join('\n');
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Vores Camping" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${xml(route.name || 'Cykelrute')}</name><desc>${xml(route.description || '')}</desc></metadata>
${wpts}
  <trk>
    <name>${xml(route.name || 'Cykelrute')}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slugify(route.name || 'cykelrute')}.gpx`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('GPX-fil eksporteret.');
  }

  function xml(str=''){
    return String(str).replace(/[<>&"]/g, ch => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[ch] || ch));
  }

  function slugify(str=''){
    return String(str).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'rute';
  }

  async function compressImage(file, maxDim=1280, quality=0.78){
    const objectUrl=URL.createObjectURL(file); const img = await new Promise((resolve, reject) => { const i = new Image(); i.onload=()=>resolve(i); i.onerror=reject; i.src = objectUrl; }); URL.revokeObjectURL(objectUrl);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d'); ctx.drawImage(img,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  }

  function openGoogle(siteId){ const site = getSite(siteId); if(site) window.open(googleMapsLink(site), '_blank', 'noopener'); }
  async function shareRoute(route){
    const url = route.googleMapsUrl || (route.siteId ? googleMapsLink(getSite(route.siteId)) : location.href);
    const text = `${route.name} – ${route.description || ''}`;
    if (navigator.share) {
      try { await navigator.share({ title: route.name, text, url }); return; } catch (e) {}
    }
    await navigator.clipboard.writeText(url); toast('Rutelink kopieret til udklipsholderen.');
  }
  function haystack(site){ return [site.name, site.city, site.country, site.region, ...(site.tags||[])].join(' ').toLowerCase(); }

  function handleGlobalClicks(e){
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) { navigate(navBtn.dataset.nav); return; }
    const quick = e.target.closest('[data-quick]');
    if (quick) { navigate(QUICK_ACTIONS[quick.dataset.quick]); return; }
    const google = e.target.closest('[data-google]');
    if (google) { openGoogle(google.dataset.google); return; }
    const convert = e.target.closest('[data-convert]');
    if (convert) { const s = getSite(convert.dataset.convert); if(s){ s.status='visited'; if(!s.visits.length) s.visits=[new Date().toISOString().slice(0,10)]; saveState(); toast('Ønskebesøg ændret til besøgt.'); renderRoute(); } return; }
    const addResult = e.target.closest('[data-add-result]');
    if (addResult) { navigate('add?status=' + addResult.dataset.status + '&prefillId=' + addResult.dataset.addResult); return; }
    const refreshWeatherBtn = e.target.closest('[data-refresh-weather]');
    if (refreshWeatherBtn) { refreshWeather(true); toast('Vejret opdateres…'); return; }
  }

  function toLocalInputValue(iso){ if(!iso) return ''; const d=new Date(iso); if(Number.isNaN(+d)) return ''; const pad=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
  function fromLocalInputValue(v){ return v ? new Date(v).toISOString() : ''; }
})();
