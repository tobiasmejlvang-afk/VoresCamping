(function () {
  'use strict';

  const defaultCenter = [10.5, 55.4];
  const liveMaps = new Map();

  function rasterStyle(tileUrl, attribution, name) {
    return {
      version: 8,
      name,
      sources: { base: { type: 'raster', tiles: [tileUrl], tileSize: 256, attribution } },
      layers: [{ id: 'base', type: 'raster', source: 'base' }],
    };
  }

  const styles = {
    liberty: { label: 'Camping – Liberty', value: 'https://tiles.openfreemap.org/styles/liberty' },
    bright: { label: 'Lyst – Bright', value: 'https://tiles.openfreemap.org/styles/bright' },
    positron: { label: 'Roligt – Positron', value: 'https://tiles.openfreemap.org/styles/positron' },
    fiord: { label: 'Natur – Fiord', value: 'https://tiles.openfreemap.org/styles/fiord' },
    dark: { label: 'Mørkt kort', value: 'https://tiles.openfreemap.org/styles/dark' },
    satellite: {
      label: 'Satellit',
      value: rasterStyle(
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        'Tiles © Esri',
        'Satellit',
      ),
    },
    osm: {
      label: 'Reservekort',
      value: rasterStyle('https://tile.openstreetmap.org/{z}/{x}/{y}.png', '© OpenStreetMap-bidragsydere', 'OSM'),
    },
  };

  const getStyle = (styleKey) => (styles[styleKey] || styles.liberty).value;

  function destroyMap(containerId) {
    const map = liveMaps.get(containerId);
    if (!map) return;
    try { map.remove(); } catch (_) {}
    liveMaps.delete(containerId);
  }

  function createMap(containerId, options = {}) {
    if (!window.maplibregl) throw new Error('MapLibre kunne ikke indlæses.');
    destroyMap(containerId);
    const map = new maplibregl.Map({
      container: containerId,
      style: getStyle(options.styleKey),
      center: options.center || defaultCenter,
      zoom: options.zoom ?? 4.2,
      cooperativeGestures: options.cooperativeGestures !== false,
      attributionControl: true,
      maxPitch: 60,
    });
    liveMaps.set(containerId, map);
    if (options.navigation !== false) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
    }
    if (options.fullscreen !== false && maplibregl.FullscreenControl) {
      map.addControl(new maplibregl.FullscreenControl(), 'top-right');
    }
    let fallbackUsed = false;
    map.on('error', (event) => {
      const message = String(event?.error?.message || '');
      if (fallbackUsed || options.disableFallback) return;
      if (/style|source|tile|fetch|network|Failed/i.test(message)) {
        fallbackUsed = true;
        try {
          map.setStyle(styles.osm.value);
          map.once('style.load', () => options.onFallback?.(message));
        } catch (_) { options.onFallback?.(message); }
      }
    });
    return map;
  }

  function setStyle(map, styleKey, afterStyle) {
    if (!map) return;
    map.setStyle(getStyle(styleKey));
    if (typeof afterStyle === 'function') map.once('style.load', afterStyle);
  }

  function validSiteCoordinates(site) {
    return site?.coords && Number.isFinite(Number(site.coords.lng)) && Number.isFinite(Number(site.coords.lat));
  }

  function spreadPoints(items) {
    const seen = new Map();
    return items.map((item) => {
      const lng = Number(item.coords.lng);
      const lat = Number(item.coords.lat);
      const key = `${lng.toFixed(5)}|${lat.toFixed(5)}`;
      const count = seen.get(key) || 0;
      seen.set(key, count + 1);
      if (!count) return { ...item, renderLng: lng, renderLat: lat };
      const angle = count * 0.92;
      const delta = 0.008 + Math.floor(count / 8) * 0.005;
      return { ...item, renderLng: lng + Math.cos(angle) * delta, renderLat: lat + Math.sin(angle) * delta };
    });
  }

  function markerElement(status = 'visited', title = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `map-pin ${status === 'wish' ? 'wish' : 'visited'}`;
    button.title = title;
    button.setAttribute('aria-label', title || 'Kortmarkør');
    button.innerHTML = status === 'wish' ? '<span>♥</span>' : '<span>✓</span>';
    return button;
  }

  function popupContent(site, handlers = {}) {
    const root = document.createElement('article');
    root.className = 'map-popup-card';
    if (site.images?.[0]) {
      const img = document.createElement('img');
      img.src = site.images[0];
      img.alt = site.name || 'Campingplads';
      root.appendChild(img);
    }
    const title = document.createElement('strong');
    title.textContent = site.name || 'Campingplads';
    root.appendChild(title);
    const place = document.createElement('div');
    place.className = 'subtle';
    place.textContent = [site.city, site.country].filter(Boolean).join(', ');
    root.appendChild(place);
    const meta = document.createElement('div');
    meta.className = 'map-popup-meta';
    meta.textContent = site.status === 'wish'
      ? 'Vil besøge · ønskested'
      : `Besøgt · ${Number(site.average || 0).toFixed(1).replace('.', ',')} stjerner`;
    root.appendChild(meta);
    const actions = document.createElement('div');
    actions.className = 'action-row';
    const detail = document.createElement('button');
    detail.type = 'button';
    detail.className = 'mini-btn';
    detail.textContent = 'Se detaljer';
    detail.addEventListener('click', () => handlers.onDetail?.(site.id));
    const google = document.createElement('button');
    google.type = 'button';
    google.className = 'mini-btn';
    google.textContent = 'Google Maps';
    google.addEventListener('click', () => handlers.onGoogle?.(site.id));
    actions.append(detail, google);
    root.appendChild(actions);
    return root;
  }

  function renderMarkers(map, sites, handlers = {}) {
    const markers = [];
    spreadPoints((sites || []).filter(validSiteCoordinates)).forEach((site) => {
      const popup = new maplibregl.Popup({ offset: 18, closeButton: true, maxWidth: '310px' })
        .setDOMContent(popupContent(site, handlers));
      const marker = new maplibregl.Marker({ element: markerElement(site.status, site.name), anchor: 'bottom' })
        .setLngLat([site.renderLng, site.renderLat])
        .setPopup(popup)
        .addTo(map);
      markers.push(marker);
    });
    return markers;
  }

  function fitToSites(map, sites, options = {}) {
    const points = (sites || []).filter(validSiteCoordinates);
    if (!points.length || !map) return;
    if (points.length === 1) {
      map.easeTo({ center: [Number(points[0].coords.lng), Number(points[0].coords.lat)], zoom: options.singleZoom || 8 });
      return;
    }
    const bounds = new maplibregl.LngLatBounds();
    points.forEach((site) => bounds.extend([Number(site.coords.lng), Number(site.coords.lat)]));
    map.fitBounds(bounds, { padding: options.padding || 65, maxZoom: options.maxZoom || 8, duration: 700 });
  }

  function fitCoordinates(map, coordinates, options = {}) {
    const points = (coordinates || []).filter((point) => Array.isArray(point) && point.length >= 2 && point.every(Number.isFinite));
    if (!points.length) return;
    if (points.length === 1) {
      map.easeTo({ center: points[0], zoom: options.singleZoom || 12 });
      return;
    }
    const bounds = new maplibregl.LngLatBounds();
    points.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, { padding: options.padding || 70, maxZoom: options.maxZoom || 14 });
  }

  function setUserLocation(map, lng, lat) {
    const element = document.createElement('div');
    element.className = 'user-location-dot';
    return new maplibregl.Marker({ element }).setLngLat([lng, lat]).addTo(map);
  }

  function upsertGeoJSONLine(map, sourceId, geoJSON, paint = {}) {
    if (!map || !geoJSON) return;
    const add = () => {
      if (map.getSource(sourceId)) {
        map.getSource(sourceId).setData(geoJSON);
        return;
      }
      map.addSource(sourceId, { type: 'geojson', data: geoJSON });
      map.addLayer({
        id: sourceId,
        type: 'line',
        source: sourceId,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': paint.color || '#1f5f3c',
          'line-width': paint.width || 5,
          'line-opacity': paint.opacity || 0.9,
        },
      });
    };
    if (map.isStyleLoaded?.()) add();
    else map.once('style.load', add);
  }


  function upsertGeoJSONFill(map, sourceId, geoJSON, paint = {}) {
    if (!map || !geoJSON) return;
    const add = () => {
      if (map.getSource(sourceId)) {
        map.getSource(sourceId).setData(geoJSON);
        return;
      }
      map.addSource(sourceId, { type: 'geojson', data: geoJSON });
      map.addLayer({
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': paint.color || '#f0b43c',
          'fill-opacity': paint.opacity || 0.18,
        },
      });
      map.addLayer({
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': paint.outline || '#d58a31',
          'line-width': paint.width || 2,
          'line-opacity': 0.8,
        },
      });
    };
    if (map.isStyleLoaded?.()) add();
    else map.once('style.load', add);
  }

  function createPointPicker(containerId, options = {}) {
    let point = options.point && Number.isFinite(Number(options.point.lng)) && Number.isFinite(Number(options.point.lat))
      ? { lng: Number(options.point.lng), lat: Number(options.point.lat) }
      : null;
    const map = createMap(containerId, {
      styleKey: options.styleKey || 'liberty',
      center: point ? [point.lng, point.lat] : defaultCenter,
      zoom: point ? 13 : 5,
      onFallback: options.onFallback,
    });
    let marker = null;

    function drawMarker() {
      if (!point) return;
      if (!marker) {
        const element = markerElement(options.status || 'visited', 'Flyt campingpladsens placering');
        element.classList.add('point-picker-pin');
        marker = new maplibregl.Marker({ element, draggable: true })
          .setLngLat([point.lng, point.lat])
          .addTo(map);
        marker.on('dragend', () => {
          const pos = marker.getLngLat();
          point = { lng: pos.lng, lat: pos.lat };
          options.onChange?.({ ...point });
        });
      } else {
        marker.setLngLat([point.lng, point.lat]);
      }
    }

    map.on('load', drawMarker);
    map.on('click', (event) => {
      point = { lng: event.lngLat.lng, lat: event.lngLat.lat };
      drawMarker();
      options.onChange?.({ ...point });
    });

    return {
      map,
      getPoint: () => point ? { ...point } : null,
      setPoint(nextPoint, fit = true) {
        if (!nextPoint || !Number.isFinite(Number(nextPoint.lng)) || !Number.isFinite(Number(nextPoint.lat))) return;
        point = { lng: Number(nextPoint.lng), lat: Number(nextPoint.lat) };
        drawMarker();
        if (fit) map.easeTo({ center: [point.lng, point.lat], zoom: 13 });
      },
      setStatus(status) {
        options.status = status;
        if (marker) {
          marker.remove();
          marker = null;
          drawMarker();
        }
      },
      setStyle(styleKey) { setStyle(map, styleKey, drawMarker); },
      destroy() { destroyMap(containerId); },
    };
  }

  function provisionalLine(points) {
    return {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: points.map((point) => [point.lng, point.lat]) },
    };
  }

  function createRouteEditor(containerId, options = {}) {
    let points = (options.points || []).map((point) => ({ ...point }));
    let routeGeoJSON = options.routeGeoJSON || null;
    let editorMarkers = [];
    const map = createMap(containerId, {
      styleKey: options.styleKey || 'liberty',
      center: options.center || (points[0] ? [points[0].lng, points[0].lat] : defaultCenter),
      zoom: options.zoom || (points.length ? 12 : 5),
      onFallback: (message) => { options.onFallback?.(message); redraw(); },
    });

    function redrawMarkers() {
      editorMarkers.forEach((marker) => marker.remove());
      editorMarkers = points.map((point, index) => {
        const element = document.createElement('button');
        element.type = 'button';
        element.className = `route-point ${index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'via'}`;
        element.textContent = index === 0 ? 'S' : index === points.length - 1 ? 'M' : String(index);
        element.title = index === 0 ? 'Startpunkt' : index === points.length - 1 ? 'Slutpunkt' : `Mellempunkt ${index}`;
        element.addEventListener('click', (event) => event.stopPropagation());
        const marker = new maplibregl.Marker({ element, draggable: true })
          .setLngLat([point.lng, point.lat])
          .addTo(map);
        marker.on('dragend', () => {
          const pos = marker.getLngLat();
          points[index] = { ...points[index], lng: pos.lng, lat: pos.lat };
          routeGeoJSON = null;
          redrawLine();
          options.onChange?.(points.map((point) => ({ ...point })));
        });
        element.addEventListener('dblclick', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (points.length <= 2) return;
          points.splice(index, 1);
          routeGeoJSON = null;
          redraw();
          options.onChange?.(points.map((point) => ({ ...point })));
        });
        return marker;
      });
    }

    function redrawLine() {
      const geometry = routeGeoJSON || (points.length >= 2 ? provisionalLine(points) : null);
      if (!geometry) {
        if (map.getSource('route-editor-line')) map.getSource('route-editor-line').setData(provisionalLine([]));
        return;
      }
      upsertGeoJSONLine(map, 'route-editor-line', geometry, {
        color: routeGeoJSON ? '#1f5f3c' : '#d58a31',
        width: routeGeoJSON ? 6 : 4,
        opacity: routeGeoJSON ? 0.94 : 0.72,
      });
    }

    function redraw() {
      redrawMarkers();
      redrawLine();
    }

    map.on('load', () => {
      redraw();
      if (points.length) fitCoordinates(map, points.map((point) => [point.lng, point.lat]));
    });

    map.on('click', (event) => {
      if (options.clickToAdd === false) return;
      points.push({ lng: event.lngLat.lng, lat: event.lngLat.lat, label: `Punkt ${points.length + 1}` });
      routeGeoJSON = null;
      redraw();
      options.onChange?.(points.map((point) => ({ ...point })));
    });

    return {
      map,
      getPoints: () => points.map((point) => ({ ...point })),
      setPoints(nextPoints, fit = true) {
        points = (nextPoints || []).map((point) => ({ ...point }));
        routeGeoJSON = null;
        redraw();
        if (fit && points.length) fitCoordinates(map, points.map((point) => [point.lng, point.lat]));
      },
      addPoint(point, fit = true) {
        points.push({ ...point });
        routeGeoJSON = null;
        redraw();
        if (fit) fitCoordinates(map, points.map((item) => [item.lng, item.lat]));
        options.onChange?.(points.map((point) => ({ ...point })));
      },
      removeLast() {
        points.pop();
        routeGeoJSON = null;
        redraw();
        options.onChange?.(points.map((point) => ({ ...point })));
      },
      clear() {
        points = [];
        routeGeoJSON = null;
        redrawMarkers();
        if (map.getSource('route-editor-line')) map.getSource('route-editor-line').setData(provisionalLine([]));
        options.onChange?.([]);
      },
      setRouteGeoJSON(geoJSON, fit = true) {
        routeGeoJSON = geoJSON;
        redrawLine();
        const coordinates = geoJSON?.features?.[0]?.geometry?.coordinates || geoJSON?.geometry?.coordinates || [];
        if (fit && coordinates.length) fitCoordinates(map, coordinates);
      },
      setStyle(styleKey) { setStyle(map, styleKey, redraw); },
      destroy() { destroyMap(containerId); },
    };
  }

  window.VCMaps = {
    styles,
    createMap,
    destroyMap,
    setStyle,
    renderMarkers,
    fitToSites,
    fitCoordinates,
    setUserLocation,
    upsertGeoJSONLine,
    upsertGeoJSONFill,
    createPointPicker,
    createRouteEditor,
  };
})();
