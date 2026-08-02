(() => {
'use strict';

const TILE_SIZE = 256;
const MAX_LAT = 85.05112878;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const numberValue = (value) => { const normalized = typeof value === 'string' ? value.trim().replace(',', '.') : value; const number = Number(normalized); return Number.isFinite(number) ? number : null; };
const finite = (value) => numberValue(value) !== null;
const asPoint = (value) => { if(!value)return null; const lat=numberValue(value.lat ?? value.latitude),lng=numberValue(value.lng ?? value.lon ?? value.longitude); return lat!==null&&lng!==null&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180?{lat,lng}:null; };
const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let googleLoader = null;
let googleLoaderKey = '';
let googleAuthFailed = false;
let nominatimLastRequest = 0;
const geocodeCache = new Map();

function normalizeProvider(settings={}) {
  const selected = ['auto','google','openstreetmap'].includes(settings.mapProvider) ? settings.mapProvider : 'auto';
  const key = String(settings.googleMapsApiKey || '').trim();
  if (selected === 'google') return key ? 'google' : 'openstreetmap';
  if (selected === 'auto') return key ? 'google' : 'openstreetmap';
  return 'openstreetmap';
}

function loadGoogleMaps(settings={}) {
  const key = String(settings.googleMapsApiKey || '').trim();
  if (!key) return Promise.reject(new Error('Google Maps API-nøglen mangler.'));
  if (window.google?.maps?.importLibrary && googleLoaderKey === key && !googleAuthFailed) return Promise.resolve(window.google.maps);
  if (googleLoader && googleLoaderKey === key && !googleAuthFailed) return googleLoader;

  googleLoaderKey = key;
  googleAuthFailed = false;
  googleLoader = new Promise((resolve, reject) => {
    const callback = `__vcGoogleMapsReady_${Date.now().toString(36)}`;
    let settled = false;
    const finish = (ok, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { delete window[callback]; } catch {}
      ok ? resolve(value) : reject(value instanceof Error ? value : new Error(String(value || 'Google Maps kunne ikke indlæses.')));
    };
    window.gm_authFailure = () => {
      googleAuthFailed = true;
      finish(false, new Error('Google Maps afviste API-nøglen eller faktureringen.'));
    };
    window[callback] = () => {
      if (googleAuthFailed || !window.google?.maps) finish(false, new Error('Google Maps blev ikke godkendt.'));
      else finish(true, window.google.maps);
    };
    const script = document.createElement('script');
    const params = new URLSearchParams({
      key,
      loading:'async',
      callback,
      v:'weekly',
      language:'da',
      region:'DK',
      auth_referrer_policy:'origin'
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = () => finish(false, new Error('Google Maps-programfilen kunne ikke hentes.'));
    document.head.appendChild(script);
    const timer = setTimeout(() => finish(false, new Error('Google Maps svarede ikke i tide.')), 15000);
  }).catch(error => {
    googleLoader = null;
    throw error;
  });
  return googleLoader;
}

function worldSize(zoom) { return TILE_SIZE * Math.pow(2, zoom); }
function project(point, zoom) {
  const lat = clamp(Number(point.lat), -MAX_LAT, MAX_LAT);
  const lng = Number(point.lng);
  const size = worldSize(zoom);
  const sin = Math.sin(lat * Math.PI / 180);
  return {
    x: (lng + 180) / 360 * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size
  };
}
function unproject(pixel, zoom) {
  const size = worldSize(zoom);
  const lng = pixel.x / size * 360 - 180;
  const n = Math.PI - 2 * Math.PI * pixel.y / size;
  const lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return {lat:clamp(lat,-MAX_LAT,MAX_LAT), lng:((lng + 540) % 360) - 180};
}
function markerHtml(marker) {
  const status = marker.status === 'wishlist' ? 'Vil besøge' : 'Besøgt';
  const rating = Number(marker.rating) > 0 ? `<span class="vc-map-rating">★ ${Number(marker.rating).toFixed(1).replace('.',',')}</span>` : '';
  const detail = marker.detailHash ? `<a class="vc-map-popup-button" href="${esc(marker.detailHash)}">Se campingplads</a>` : '';
  const google = marker.googleUrl ? `<a class="vc-map-popup-link" target="_blank" rel="noopener" href="${esc(marker.googleUrl)}">Åbn i Google Maps ↗</a>` : '';
  return `<div class="vc-map-popup-content"><strong>${esc(marker.title || 'Campingplads')}</strong><small>${esc(marker.subtitle || status)}</small>${rating}<div class="vc-map-popup-actions">${detail}${google}</div></div>`;
}

class NativeMap {
  constructor(container, options={}) {
    this.container = container;
    this.options = options;
    this.center = asPoint(options.center) || {lat:54.5,lng:12};
    this.zoom = clamp(Number(options.zoom ?? 4), 2, 19);
    this.markers = (options.markers || []).filter(m => asPoint(m));
    this.route = options.route || null;
    this.selectedId = options.selectedId || '';
    this.dragging = false;
    this.destroyed = false;
    this.pointerStart = null;
    this.centerStart = null;
    this.moved = false;
    this.build();
    this.bind();
    this.resizeObserver = new ResizeObserver(() => this.render());
    this.resizeObserver.observe(container);
    requestAnimationFrame(() => {
      if (options.fit !== false && (this.markers.length || this.routePoints().length)) this.fitAll();
      else this.render();
      if (this.selectedId) this.selectMarker(this.selectedId, false);
    });
  }
  build() {
    this.container.innerHTML = `<div class="vc-native-map" role="application" aria-label="Interaktivt kort">
      <div class="vc-map-tiles"></div>
      <svg class="vc-map-vectors" aria-hidden="true"></svg>
      <div class="vc-map-markers"></div>
      <div class="vc-map-popups"></div>
      <div class="vc-map-controls"><button type="button" data-map-control="zoom-in" aria-label="Zoom ind">＋</button><button type="button" data-map-control="zoom-out" aria-label="Zoom ud">−</button><button type="button" data-map-control="fit" aria-label="Vis alle punkter">⌂</button></div>
      <div class="vc-map-provider">OpenStreetMap</div>
      <div class="vc-map-attribution">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap-bidragsydere</a></div>
    </div>`;
    this.root = this.container.firstElementChild;
    this.tiles = this.root.querySelector('.vc-map-tiles');
    this.vectors = this.root.querySelector('.vc-map-vectors');
    this.markersPane = this.root.querySelector('.vc-map-markers');
    this.popups = this.root.querySelector('.vc-map-popups');
  }
  bind() {
    this.onPointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest('button,a')) return;
      this.dragging = true; this.moved = false;
      this.pointerStart = {x:event.clientX,y:event.clientY};
      this.centerStart = project(this.center,this.zoom);
      this.root.setPointerCapture?.(event.pointerId);
      this.root.classList.add('dragging');
    };
    this.onPointerMove = (event) => {
      if (!this.dragging) return;
      const dx = event.clientX - this.pointerStart.x;
      const dy = event.clientY - this.pointerStart.y;
      if (Math.abs(dx)+Math.abs(dy)>4) this.moved = true;
      this.center = unproject({x:this.centerStart.x-dx,y:this.centerStart.y-dy},this.zoom);
      this.render();
    };
    this.onPointerUp = (event) => {
      if (!this.dragging) return;
      this.dragging = false;
      this.root.classList.remove('dragging');
      if (!this.moved && typeof this.options.onMapClick === 'function') {
        const rect = this.root.getBoundingClientRect();
        const centerPx = project(this.center,this.zoom);
        const point = unproject({x:centerPx.x+(event.clientX-rect.left-rect.width/2),y:centerPx.y+(event.clientY-rect.top-rect.height/2)},this.zoom);
        this.options.onMapClick(point);
      }
    };
    this.onWheel = (event) => {
      event.preventDefault();
      this.zoomBy(event.deltaY < 0 ? 1 : -1);
    };
    this.onClick = (event) => {
      const control = event.target.closest('[data-map-control]');
      if (control) {
        const action = control.dataset.mapControl;
        if (action==='zoom-in') this.zoomBy(1);
        if (action==='zoom-out') this.zoomBy(-1);
        if (action==='fit') this.fitAll();
        return;
      }
      const marker = event.target.closest('[data-map-marker]');
      if (marker) {
        event.stopPropagation();
        this.selectMarker(marker.dataset.mapMarker, true);
      }
    };
    this.root.addEventListener('pointerdown',this.onPointerDown);
    this.root.addEventListener('pointermove',this.onPointerMove);
    this.root.addEventListener('pointerup',this.onPointerUp);
    this.root.addEventListener('pointercancel',this.onPointerUp);
    this.root.addEventListener('wheel',this.onWheel,{passive:false});
    this.root.addEventListener('click',this.onClick);
  }
  viewport() {
    const rect = this.root.getBoundingClientRect();
    return {width:Math.max(1,rect.width),height:Math.max(1,rect.height)};
  }
  topLeft() {
    const {width,height}=this.viewport();
    const center = project(this.center,this.zoom);
    return {x:center.x-width/2,y:center.y-height/2};
  }
  screen(point) {
    const p=project(point,this.zoom),tl=this.topLeft();
    return {x:p.x-tl.x,y:p.y-tl.y};
  }
  routePoints() {
    const path = Array.isArray(this.route?.path) && this.route.path.length ? this.route.path : (Array.isArray(this.route?.points) ? this.route.points : []);
    return path.map(asPoint).filter(Boolean);
  }
  render() {
    if (this.destroyed || !this.root) return;
    this.renderTiles(); this.renderVectors(); this.renderMarkers();
  }
  renderTiles() {
    const {width,height}=this.viewport(), tl=this.topLeft(), n=Math.pow(2,this.zoom);
    const minX=Math.floor(tl.x/TILE_SIZE),maxX=Math.floor((tl.x+width)/TILE_SIZE);
    const minY=Math.max(0,Math.floor(tl.y/TILE_SIZE)),maxY=Math.min(n-1,Math.floor((tl.y+height)/TILE_SIZE));
    const fragments=[];
    for(let y=minY;y<=maxY;y++) for(let x=minX;x<=maxX;x++) {
      const wrapped=((x%n)+n)%n;
      fragments.push(`<img alt="" draggable="false" src="https://tile.openstreetmap.org/${this.zoom}/${wrapped}/${y}.png" style="transform:translate3d(${Math.round(x*TILE_SIZE-tl.x)}px,${Math.round(y*TILE_SIZE-tl.y)}px,0)">`);
    }
    this.tiles.innerHTML=fragments.join('');
  }
  renderVectors() {
    const points=this.routePoints();
    const {width,height}=this.viewport();
    this.vectors.setAttribute('viewBox',`0 0 ${width} ${height}`);
    if(points.length<2){this.vectors.innerHTML='';return;}
    const d=points.map((p,i)=>{const s=this.screen(p);return `${i?'L':'M'} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`;}).join(' ');
    this.vectors.innerHTML=`<path class="vc-map-route-shadow" d="${d}"></path><path class="vc-map-route-line" d="${d}"></path>`;
  }
  layoutMarkers(markers) {
    const rows=markers.map(marker=>({marker,base:this.screen(marker)}));
    const buckets=new Map();
    rows.forEach(row=>{const key=`${Math.round(row.base.x/34)}:${Math.round(row.base.y/34)}`;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(row);});
    const placed=new Map();
    buckets.forEach(group=>{
      if(group.length===1){placed.set(String(group[0].marker.id),group[0].base);return;}
      const radius=Math.min(38,20+group.length*2);
      group.forEach((row,index)=>{const angle=(-Math.PI/2)+(Math.PI*2*index/group.length);placed.set(String(row.marker.id),{x:row.base.x+Math.cos(angle)*radius,y:row.base.y+Math.sin(angle)*radius});});
    });
    return placed;
  }
  renderMarkers() {
    const markers=[...this.markers];
    const routePts=Array.isArray(this.route?.points)?this.route.points.map(asPoint).filter(Boolean):[];
    routePts.forEach((p,i)=>markers.push({id:`__route_${i}`,lat:p.lat,lng:p.lng,title:i===0?'Start':i===routePts.length-1?'Mål':`Stop ${i}`,status:'route',routeMarker:true}));
    const positions=this.layoutMarkers(markers);
    this.markersPane.innerHTML=markers.map(marker=>{
      const s=positions.get(String(marker.id))||this.screen(marker); const wishlist=marker.status==='wishlist'; const selected=String(marker.id)===String(this.selectedId);
      const user=marker.status==='user';
      const label=marker.routeMarker?(marker.title==='Start'?'A':marker.title==='Mål'?'B':String(marker.title).replace(/\D/g,'')):(user?'●':wishlist?'💛':'🏕️');
      const status=wishlist?'Vil besøge':marker.routeMarker?'Rutepunkt':user?'Din placering':'Besøgt';
      return `<button type="button" class="vc-map-marker ${wishlist?'wishlist':''} ${user?'user-location':''} ${marker.routeMarker?'route-point':''} ${selected?'selected':''}" data-map-marker="${esc(marker.id)}" aria-label="${esc(`${marker.title||'Punkt'} – ${status}`)}" title="${esc(`${marker.title||'Punkt'} – ${status}`)}" style="left:${Math.round(s.x)}px;top:${Math.round(s.y)}px"><span>${esc(label)}</span></button>`;
    }).join('');
    if(this.selectedId){
      const marker=this.markers.find(m=>String(m.id)===String(this.selectedId));
      if(marker){const s=positions.get(String(marker.id))||this.screen(marker);this.popups.innerHTML=`<div class="vc-map-popup" style="left:${Math.round(s.x)}px;top:${Math.round(s.y)}px">${markerHtml(marker)}</div>`;}
      else this.popups.innerHTML='';
    } else this.popups.innerHTML='';
  }
  zoomBy(delta) { this.zoom=clamp(Math.round(this.zoom+delta),2,19); this.render(); }
  setView(point,zoom=this.zoom) { const p=asPoint(point);if(!p)return;this.center=p;this.zoom=clamp(Math.round(zoom),2,19);this.render(); }
  setMarkers(markers=[]) { this.markers=markers.filter(m=>asPoint(m));this.render(); }
  fitPoints(points,padding=60) {
    const pts=points.map(asPoint).filter(Boolean);if(!pts.length)return;
    if(pts.length===1){this.setView(pts[0],Math.max(this.zoom,13));return;}
    const {width,height}=this.viewport();
    for(let z=18;z>=2;z--){
      const px=pts.map(p=>project(p,z));const xs=px.map(p=>p.x),ys=px.map(p=>p.y);
      if(Math.max(...xs)-Math.min(...xs)<=Math.max(1,width-padding*2)&&Math.max(...ys)-Math.min(...ys)<=Math.max(1,height-padding*2)){
        this.zoom=z;
        this.center=unproject({x:(Math.min(...xs)+Math.max(...xs))/2,y:(Math.min(...ys)+Math.max(...ys))/2},z);
        this.render();return;
      }
    }
  }
  fitAll() { this.fitPoints([...this.markers,...this.routePoints()],70); }
  selectMarker(id,pan=true) {
    const marker=this.markers.find(m=>String(m.id)===String(id));if(!marker)return;
    this.selectedId=String(id);
    if(pan)this.setView(marker,Math.max(this.zoom,12));else this.render();
    if(typeof this.options.onMarkerClick==='function')this.options.onMarkerClick(marker);
  }
  addUserLocation(point) {
    const p=asPoint(point);if(!p)return;
    this.markers=this.markers.filter(m=>m.id!=='__user').concat([{id:'__user',...p,title:'Din placering',subtitle:'Aktuel position',status:'user'}]);
    this.setView(p,14);
  }
  destroy() {
    this.destroyed=true;
    this.resizeObserver?.disconnect();
    this.root?.removeEventListener('pointerdown',this.onPointerDown);
    this.root?.removeEventListener('pointermove',this.onPointerMove);
    this.root?.removeEventListener('pointerup',this.onPointerUp);
    this.root?.removeEventListener('pointercancel',this.onPointerUp);
    this.root?.removeEventListener('wheel',this.onWheel);
    this.root?.removeEventListener('click',this.onClick);
    this.container.innerHTML='';
  }
}

async function createGoogleMap(container, options={}) {
  await loadGoogleMaps(options.settings || {});
  const [{Map:GoogleMap,InfoWindow,Polyline},{LatLngBounds},{AdvancedMarkerElement,PinElement}] = await Promise.all([
    google.maps.importLibrary('maps'),
    google.maps.importLibrary('core'),
    google.maps.importLibrary('marker')
  ]);
  const center=asPoint(options.center)||{lat:54.5,lng:12};
  const map=new GoogleMap(container,{center,zoom:Number(options.zoom||4),mapId:options.settings?.googleMapId||'DEMO_MAP_ID',language:'da',region:'DK',streetViewControl:false,fullscreenControl:true,mapTypeControl:true,gestureHandling:'greedy'});
  const markers=[];const byId=new globalThis.Map();const info=new InfoWindow();
  const inputMarkers=(options.markers||[]).filter(m=>asPoint(m));
  const coordinateGroups=new Map();
  inputMarkers.forEach(item=>{const p=asPoint(item);const key=`${p.lat.toFixed(6)}:${p.lng.toFixed(6)}`;if(!coordinateGroups.has(key))coordinateGroups.set(key,[]);coordinateGroups.get(key).push(item);});
  for(const item of inputMarkers){
    const point=asPoint(item);const key=`${point.lat.toFixed(6)}:${point.lng.toFixed(6)}`;const group=coordinateGroups.get(key)||[item];const index=group.indexOf(item);
    const angle=group.length>1?Math.PI*2*index/group.length:0;const radius=group.length>1?0.00022:0;const position={lat:point.lat+Math.sin(angle)*radius,lng:point.lng+Math.cos(angle)*radius};
    const pin=new PinElement({background:item.status==='wishlist'?'#f5a623':'#0f5c4c',borderColor:'#ffffff',glyphColor:'#ffffff',glyph:item.status==='wishlist'?'♥':'●',scale:1.12});
    const marker=new AdvancedMarkerElement({map,position,title:item.title||'',content:pin.element,gmpClickable:true,zIndex:item.status==='wishlist'?20:10});
    marker.addListener('click',()=>{info.setContent(markerHtml(item));info.open({anchor:marker,map});if(typeof options.onMarkerClick==='function')options.onMarkerClick(item);});
    markers.push(marker);byId.set(String(item.id),{marker,item});
  }
  let routePolyline=null;
  const routePath=(Array.isArray(options.route?.path)&&options.route.path.length?options.route.path:options.route?.points||[]).map(asPoint).filter(Boolean);
  if(routePath.length>1){routePolyline=new Polyline({map,path:routePath,strokeColor:'#1976d2',strokeOpacity:.95,strokeWeight:6});}
  if(Array.isArray(options.route?.points)) options.route.points.map(asPoint).filter(Boolean).forEach((p,i)=>{
    const pin=new PinElement({background:i===0?'#16833b':i===options.route.points.length-1?'#d9483b':'#f5a623',borderColor:'#fff',glyphColor:'#fff',glyph:i===0?'A':i===options.route.points.length-1?'B':String(i),scale:.9});
    markers.push(new AdvancedMarkerElement({map,position:p,content:pin.element,title:i===0?'Start':i===options.route.points.length-1?'Mål':`Stop ${i}`}));
  });
  const all=[...inputMarkers,...routePath];
  if(options.fit!==false&&all.length){const bounds=new LatLngBounds();all.forEach(p=>bounds.extend({lat:Number(p.lat),lng:Number(p.lng)}));map.fitBounds(bounds,60);if(all.length===1)google.maps.event.addListenerOnce(map,'idle',()=>map.setZoom(14));}
  if(typeof options.onMapClick==='function')map.addListener('click',event=>options.onMapClick({lat:event.latLng.lat(),lng:event.latLng.lng()}));
  const controller={
    provider:'google',map,
    selectMarker(id,pan=true){const found=byId.get(String(id));if(!found)return;if(pan){map.panTo(found.marker.position);map.setZoom(Math.max(map.getZoom()||4,12));}info.setContent(markerHtml(found.item));info.open({anchor:found.marker,map});if(typeof options.onMarkerClick==='function')options.onMarkerClick(found.item);},
    fitAll(){if(!all.length)return;const bounds=new LatLngBounds();all.forEach(p=>bounds.extend({lat:Number(p.lat),lng:Number(p.lng)}));map.fitBounds(bounds,60);},
    setView(point,zoom){const p=asPoint(point);if(!p)return;map.panTo(p);if(zoom)map.setZoom(zoom);},
    addUserLocation(point){const p=asPoint(point);if(!p)return;const pin=new PinElement({background:'#1976d2',borderColor:'#fff',glyphColor:'#fff',glyph:'●'});markers.push(new AdvancedMarkerElement({map,position:p,content:pin.element,title:'Din placering'}));map.panTo(p);map.setZoom(14);},
    destroy(){info.close();routePolyline?.setMap(null);markers.forEach(marker=>marker.map=null);container.innerHTML='';}
  };
  if(options.selectedId)controller.selectMarker(options.selectedId,false);
  return controller;
}

async function create(container, options={}) {
  if(!container)throw new Error('Kortets beholder mangler.');
  const provider=normalizeProvider(options.settings||{});
  container.classList.add('vc-map-host');
  if(provider==='google'){
    try{return await createGoogleMap(container,options);}catch(error){console.warn('Google Maps fejlede, bruger OpenStreetMap i stedet:',error);container.innerHTML='';const native=new NativeMap(container,options);native.provider='openstreetmap';native.fallbackError=error;return native;}
  }
  const native=new NativeMap(container,options);native.provider='openstreetmap';return native;
}

async function geocodeGoogle(query,settings) {
  await loadGoogleMaps(settings);
  const {Geocoder}=await google.maps.importLibrary('geocoding');
  const geocoder=new Geocoder();
  const response=await geocoder.geocode({address:query,region:'DK',language:'da'});
  const result=response.results?.[0];
  if(!result)throw new Error('Google Maps fandt ikke stedet.');
  const location=result.geometry.location;
  return {lat:location.lat(),lng:location.lng(),label:result.formatted_address||query,placeId:result.place_id||'',provider:'google'};
}
async function geocodeNominatim(query) {
  const wait=Math.max(0,1000-(Date.now()-nominatimLastRequest));if(wait)await delay(wait);
  nominatimLastRequest=Date.now();
  const url=new URL('https://nominatim.openstreetmap.org/search');
  url.search=new URLSearchParams({q:query,format:'jsonv2',limit:'1','accept-language':'da',addressdetails:'1'});
  const response=await fetch(url,{headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('Korttjenesten kunne ikke finde stedet lige nu.');
  const rows=await response.json();const row=rows?.[0];if(!row)throw new Error('Stedet blev ikke fundet. Prøv en mere præcis adresse.');
  return {lat:Number(row.lat),lng:Number(row.lon),label:row.display_name||query,placeId:String(row.place_id||''),provider:'openstreetmap'};
}
async function geocode(query,settings={}) {
  const clean=String(query||'').trim();if(!clean)throw new Error('Skriv et sted eller en adresse først.');
  const cacheKey=`${normalizeProvider(settings)}:${clean.toLowerCase()}`;if(geocodeCache.has(cacheKey))return {...geocodeCache.get(cacheKey)};
  let result;
  if(normalizeProvider(settings)==='google'){
    try{result=await geocodeGoogle(clean,settings);}catch(error){console.warn(error);result=await geocodeNominatim(clean);result.fallbackFromGoogle=true;}
  }else result=await geocodeNominatim(clean);
  geocodeCache.set(cacheKey,result);return {...result};
}

function locate() {
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(new Error('Enheden understøtter ikke positionsdeling.'));return;}
    navigator.geolocation.getCurrentPosition(pos=>resolve({lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy}),error=>reject(new Error(error.code===1?'Adgang til placering blev afvist.':'Placeringen kunne ikke hentes.')),{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
  });
}

async function calculateBicycleRoute(route,settings={}) {
  const origin=String(route?.origin||'').trim();const destination=String(route?.destination||'').trim();
  const waypoints=String(route?.waypoints||'').split(/[;\n]/).map(s=>s.trim()).filter(Boolean).slice(0,25);
  if(!origin||!destination)throw new Error('Skriv både startsted og slutsted.');
  if(normalizeProvider(settings)==='google'){
    try{
      await loadGoogleMaps(settings);
      const {Route}=await google.maps.importLibrary('routes');
      const request={origin,destination,travelMode:'BICYCLING',fields:['path','legs','distanceMeters','durationMillis'],language:'da',region:'dk'};
      if(waypoints.length)request.intermediates=waypoints.map(location=>({location}));
      const response=await Route.computeRoutes(request);const best=response.routes?.[0];
      if(!best?.path?.length)throw new Error('Google Maps fandt ingen cykelrute.');
      const path=best.path.map(p=>({lat:Number(p.lat),lng:Number(p.lng)}));
      const points=[path[0],...waypoints.map((_,i)=>best.legs?.[i]?.endLocation?{lat:Number(best.legs[i].endLocation.lat),lng:Number(best.legs[i].endLocation.lng)}:null).filter(Boolean),path[path.length-1]];
      return {path,points,distanceMeters:Number(best.distanceMeters||0),durationSeconds:Math.round(Number(best.durationMillis||0)/1000),provider:'google',precise:true};
    }catch(error){console.warn('Præcis Google-cykelrute fejlede:',error);}
  }
  const labels=[origin,...waypoints,destination];const points=[];
  for(const label of labels)points.push(await geocode(label,{...settings,mapProvider:'openstreetmap'}));
  return {points:points.map(p=>({lat:p.lat,lng:p.lng,label:p.label})),path:points.map(p=>({lat:p.lat,lng:p.lng})),distanceMeters:0,durationSeconds:0,provider:'points',precise:false};
}

window.VCMaps={create,geocode,locate,calculateBicycleRoute,loadGoogleMaps,normalizeProvider};
})();
