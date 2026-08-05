(function(){
  'use strict';

  const instances = new Map();
  const OPENFREE_STYLES = {
    liberty: 'https://tiles.openfreemap.org/styles/liberty',
    positron: 'https://tiles.openfreemap.org/styles/positron',
    bright: 'https://tiles.openfreemap.org/styles/bright',
    fiord: 'https://tiles.openfreemap.org/styles/fiord',
    dark: 'https://tiles.openfreemap.org/styles/dark'
  };

  function esc(value=''){
    return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function validCoords(place){
    const lat=Number(place?.coords?.lat), lng=Number(place?.coords?.lng);
    return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
  }

  function spreadDuplicates(places){
    const used=new Map();
    return places.map(place=>{
      if(!validCoords(place)) return place;
      const key=`${Number(place.coords.lat).toFixed(5)},${Number(place.coords.lng).toFixed(5)}`;
      const count=used.get(key)||0; used.set(key,count+1);
      if(!count) return {...place,_displayCoords:{...place.coords}};
      const angle=count*2.399963;
      const radius=.006*Math.ceil(count/6);
      return {...place,_displayCoords:{lat:Number(place.coords.lat)+Math.sin(angle)*radius,lng:Number(place.coords.lng)+Math.cos(angle)*radius}};
    });
  }

  function popupHtml(place){
    const image=place.images?.[0]||'assets/hero-camping.jpg';
    const status=place.status==='visited'?'Besøgt':'Vil besøge';
    const rating=Number(place.averageRating||0).toFixed(1).replace('.',',');
    return `<article class="map-popup">
      <img src="${esc(image)}" alt="${esc(place.name)}" onerror="this.src='assets/hero-camping.jpg'">
      <div class="map-popup-body">
        <span class="chip ${place.status==='wishlist'?'wish':''}">${status}</span>
        <h3>${esc(place.name)}</h3>
        <p>${esc([place.city,place.country].filter(Boolean).join(', '))}</p>
        ${place.status==='visited'?`<div class="stars">★★★★★ <span class="rating-number">${rating}</span></div>`:''}
        <div class="map-popup-actions">
          <a class="btn small primary" href="#/campingplads/${encodeURIComponent(place.id)}">Se detaljer</a>
          <a class="btn small" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.coords.lat},${place.coords.lng}`)}">Google Maps</a>
        </div>
      </div>
    </article>`;
  }

  function mapFallback(container,message='Kortet kunne ikke indlæses.'){
    const el=typeof container==='string'?document.getElementById(container):container;
    if(el) el.innerHTML=`<div class="map-fallback"><div><strong>${esc(message)}</strong><p class="small-muted">Dine gemte campingdata er stadig i orden. Tjek internetforbindelsen eller prøv igen.</p></div></div>`;
  }

  function destroy(id){
    const existing=instances.get(id);
    if(existing){ try{ existing.remove(); }catch(_e){} instances.delete(id); }
  }

  function destroyAll(){
    [...instances.keys()].forEach(destroy);
  }

  async function createMap(containerId,options={}){
    destroy(containerId);
    const container=document.getElementById(containerId);
    if(!container) return null;
    const provider=options.provider||'maplibre';
    if(provider==='google'&&options.googleKey){
      try{return await createGoogleMap(containerId,options);}catch(err){console.warn('Google Maps fejlede, skifter til MapLibre',err);}
    }
    return createMapLibre(containerId,options);
  }

  function createMapLibre(containerId,options={}){
    if(!window.maplibregl){mapFallback(containerId,'MapLibre kunne ikke indlæses.');return null;}
    const places=spreadDuplicates((options.places||[]).filter(validCoords));
    try{
      const map=new maplibregl.Map({
        container:containerId,
        style:OPENFREE_STYLES[options.style]||OPENFREE_STYLES.liberty,
        center:options.center||[10.2,52.2],
        zoom:options.zoom||3.6,
        attributionControl:true
      });
      instances.set(containerId,map);
      map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
      if(options.fullscreen!==false&&maplibregl.FullscreenControl) map.addControl(new maplibregl.FullscreenControl(),'top-right');
      if(options.geolocate&&maplibregl.GeolocateControl){
        map.addControl(new maplibregl.GeolocateControl({positionOptions:{enableHighAccuracy:true},trackUserLocation:false,showUserHeading:true}),'top-right');
      }
      const bounds=new maplibregl.LngLatBounds();
      const markers=[];
      places.forEach(place=>{
        const el=document.createElement('div');
        el.className=`camping-marker ${place.status==='wishlist'?'wish':'visited'}`;
        el.title=place.name;
        el.innerHTML=`<span>${place.status==='wishlist'?'♥':'✓'}</span>`;
        const popup=new maplibregl.Popup({offset:24,maxWidth:'300px'}).setHTML(popupHtml(place));
        const c=place._displayCoords||place.coords;
        const marker=new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat([Number(c.lng),Number(c.lat)]).setPopup(popup).addTo(map);
        markers.push(marker); bounds.extend([Number(c.lng),Number(c.lat)]);
      });
      if(options.userLocation&&Number.isFinite(Number(options.userLocation.lat))&&Number.isFinite(Number(options.userLocation.lng))){
        const userEl=document.createElement('div');userEl.className='camping-marker user-location';userEl.title='Min aktuelle placering';
        new maplibregl.Marker({element:userEl,anchor:'center'}).setLngLat([Number(options.userLocation.lng),Number(options.userLocation.lat)]).setPopup(new maplibregl.Popup({offset:16}).setHTML('<div class="map-popup-body"><strong>Min aktuelle placering</strong></div>')).addTo(map);
        bounds.extend([Number(options.userLocation.lng),Number(options.userLocation.lat)]);
      }
      map.__campingMarkers=markers;
      if(options.route?.coordinates?.length){
        map.on('load',()=>addRouteToMap(map,options.route));
        options.route.coordinates.forEach(c=>bounds.extend(c));
      }
      map.on('load',()=>{
        if(places.length||options.route?.coordinates?.length){
          try{map.fitBounds(bounds,{padding:options.padding||55,maxZoom:options.maxZoom||12,duration:500});}catch(_e){}
        }
      });
      map.on('error',e=>console.warn('Kortfejl',e?.error||e));
      setTimeout(()=>{try{map.resize();}catch(_e){}},120);
      return map;
    }catch(err){
      console.error(err);mapFallback(containerId);return null;
    }
  }

  function addRouteToMap(map,route){
    if(!map||!route?.coordinates?.length) return;
    const sourceId='camping-route';
    if(map.getLayer(sourceId)) map.removeLayer(sourceId);
    if(map.getSource(sourceId)) map.removeSource(sourceId);
    map.addSource(sourceId,{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:route.coordinates}}});
    map.addLayer({id:sourceId,type:'line',source:sourceId,layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#d7862e','line-width':6,'line-opacity':.88}});
    const ends=[route.coordinates[0],route.coordinates.at(-1)];
    ends.forEach((c,i)=>{
      const el=document.createElement('div');el.className='camping-marker '+(i?'wish':'visited');el.innerHTML=`<span>${i?'B':'A'}</span>`;
      new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat(c).addTo(map);
    });
  }

  let googlePromise;
  function loadGoogle(key){
    if(window.google?.maps) return Promise.resolve(window.google.maps);
    if(googlePromise) return googlePromise;
    googlePromise=new Promise((resolve,reject)=>{
      const cb='__voresCampingGoogleReady';
      window[cb]=()=>{delete window[cb];resolve(window.google.maps);};
      const script=document.createElement('script');
      script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=${cb}&loading=async`;
      script.async=true;script.onerror=()=>reject(new Error('Google Maps kunne ikke indlæses'));document.head.appendChild(script);
      setTimeout(()=>reject(new Error('Google Maps timeout')),15000);
    });
    return googlePromise;
  }

  async function createGoogleMap(containerId,options={}){
    await loadGoogle(options.googleKey);
    const container=document.getElementById(containerId);
    const places=(options.places||[]).filter(validCoords);
    const map=new google.maps.Map(container,{center:{lat:52.2,lng:10.2},zoom:4,mapTypeControl:false,streetViewControl:false,fullscreenControl:true});
    const bounds=new google.maps.LatLngBounds();
    places.forEach(place=>{
      const position={lat:Number(place.coords.lat),lng:Number(place.coords.lng)};
      const marker=new google.maps.Marker({position,map,title:place.name,label:{text:place.status==='wishlist'?'♥':'✓',color:'white'},icon:{path:google.maps.SymbolPath.CIRCLE,fillColor:place.status==='wishlist'?'#f0b43c':'#4e6b3a',fillOpacity:1,strokeColor:'#fff',strokeWeight:3,scale:13}});
      const info=new google.maps.InfoWindow({content:popupHtml(place)});marker.addListener('click',()=>info.open({anchor:marker,map}));bounds.extend(position);
    });
    if(places.length) map.fitBounds(bounds,55);
    instances.set(containerId,{remove(){container.innerHTML='';}});
    return map;
  }

  async function geocode(query,apiKey,{limit=8}={}){
    const text=String(query||'').trim();if(!text) return [];
    if(apiKey){
      try{
        const url=`https://api.openrouteservice.org/geocode/search?api_key=${encodeURIComponent(apiKey)}&text=${encodeURIComponent(text)}&size=${limit}`;
        const res=await fetch(url);if(!res.ok) throw new Error(`ORS ${res.status}`);
        const data=await res.json();
        return (data.features||[]).map(f=>({
          name:f.properties?.name||f.properties?.label||text,
          label:f.properties?.label||'',
          address:f.properties?.street||'',
          postalCode:f.properties?.postalcode||'',
          city:f.properties?.locality||f.properties?.county||'',
          region:f.properties?.region||'',
          country:f.properties?.country||'',
          coords:{lng:Number(f.geometry.coordinates[0]),lat:Number(f.geometry.coordinates[1])},
          source:'openrouteservice'
        }));
      }catch(err){console.warn('ORS geokodning fejlede, bruger gratis reserve',err);}
    }
    const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=${limit}&q=${encodeURIComponent(text)}`;
    const res=await fetch(url,{headers:{'Accept-Language':'da,en'}});if(!res.ok) throw new Error('Den gratis reservesøgning svarede ikke.');
    const data=await res.json();
    return data.map(item=>({
      name:item.name||item.display_name?.split(',')[0]||text,label:item.display_name||'',address:[item.address?.road,item.address?.house_number].filter(Boolean).join(' '),postalCode:item.address?.postcode||'',city:item.address?.city||item.address?.town||item.address?.village||'',region:item.address?.state||'',country:item.address?.country||'',coords:{lat:Number(item.lat),lng:Number(item.lon)},source:'OpenStreetMap'
    }));
  }

  async function reverseGeocode(lat,lng,apiKey){
    if(apiKey){
      try{
        const url=`https://api.openrouteservice.org/geocode/reverse?api_key=${encodeURIComponent(apiKey)}&point.lon=${encodeURIComponent(lng)}&point.lat=${encodeURIComponent(lat)}&size=1`;
        const res=await fetch(url);if(res.ok){const d=await res.json();const f=d.features?.[0];if(f) return {label:f.properties?.label||'',city:f.properties?.locality||'',country:f.properties?.country||''};}
      }catch(_e){}
    }
    const res=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`,{headers:{'Accept-Language':'da,en'}});
    if(!res.ok) throw new Error('Kunne ikke slå placeringen op.');const d=await res.json();return {label:d.display_name||'',city:d.address?.city||d.address?.town||d.address?.village||'',country:d.address?.country||''};
  }

  async function calculateRoute(coordinates,apiKey,profile='cycling-regular'){
    if(!apiKey) throw new Error('Indtast din Openrouteservice API-nøgle under Indstillinger.');
    if(!Array.isArray(coordinates)||coordinates.length<2) throw new Error('Ruten skal mindst have et start- og slutpunkt.');
    const response=await fetch(`https://api.openrouteservice.org/v2/directions/${encodeURIComponent(profile)}/geojson`,{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':apiKey},body:JSON.stringify({coordinates})
    });
    if(!response.ok){let detail='';try{detail=(await response.json())?.error?.message||'';}catch(_e){}throw new Error(detail||`Ruten kunne ikke beregnes (${response.status}).`);}
    const data=await response.json();const feature=data.features?.[0];if(!feature) throw new Error('Rutetjenesten returnerede ingen rute.');
    const summary=feature.properties?.summary||{};
    return {coordinates:feature.geometry.coordinates,distance:Number(summary.distance||0),duration:Number(summary.duration||0),raw:data};
  }

  function currentPosition(){
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation) return reject(new Error('Enheden understøtter ikke placering.'));
      navigator.geolocation.getCurrentPosition(pos=>resolve({lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy}),err=>reject(new Error(err.message||'Placeringen kunne ikke hentes.')),{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
    });
  }

  window.CampingMaps={createMap,destroy,destroyAll,geocode,reverseGeocode,calculateRoute,currentPosition,validCoords,styles:OPENFREE_STYLES};
})();
