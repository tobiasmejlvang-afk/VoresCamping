(function () {
  'use strict';

  const DEFAULT_TIMEOUT = 20000;
  const ENDPOINTS = {
    core: [
      'https://api.heigit.org/openrouteservice',
      'https://api.openrouteservice.org',
    ],
    geocode: [
      'https://api.heigit.org/pelias/v1',
      'https://api.openrouteservice.org/geocode',
    ],
    elevation: [
      'https://api.heigit.org/openelevationservice/v0',
      'https://api.openrouteservice.org/elevation',
    ],
    pois: [
      'https://api.heigit.org/openpoiservice/v0/pois',
      'https://api.openrouteservice.org/pois',
    ],
    optimization: [
      'https://api.heigit.org/vroom/v0',
      'https://api.openrouteservice.org/optimization',
    ],
  };

  function createClient(options = {}) {
    const getKey = typeof options.getApiKey === 'function' ? options.getApiKey : () => options.apiKey || '';

    async function request(service, path = '', requestOptions = {}) {
      const apiKey = String(getKey() || '').trim();
      if (!apiKey) {
        const error = new Error('Openrouteservice API-nøgle mangler.');
        error.code = 'ORS_KEY_MISSING';
        throw error;
      }

      const roots = ENDPOINTS[service];
      if (!Array.isArray(roots) || !roots.length) throw new Error(`Ukendt Openrouteservice-tjeneste: ${service}`);

      let lastError = null;
      for (let index = 0; index < roots.length; index += 1) {
        const root = roots[index];
        try {
          return await fetchAttempt(`${root}${path}`, apiKey, requestOptions);
        } catch (error) {
          lastError = error;
          const hasFallback = index < roots.length - 1;
          if (!hasFallback || !shouldTryFallback(error)) throw error;
          console.warn(`Primær HeiGIT-tjeneste kunne ikke bruges. Prøver midlertidig reserve: ${service}.`, error);
        }
      }
      throw lastError || new Error('Openrouteservice-kaldet mislykkedes.');
    }

    async function fetchAttempt(baseUrl, apiKey, requestOptions) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), requestOptions.timeout || DEFAULT_TIMEOUT);
      const headers = new Headers(requestOptions.headers || {});
      headers.set('Accept', requestOptions.accept || 'application/json, application/geo+json');
      if (requestOptions.authInQuery !== true) headers.set('Authorization', apiKey);
      if (requestOptions.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

      let url = baseUrl;
      if (requestOptions.authInQuery === true) {
        url += `${url.includes('?') ? '&' : '?'}api_key=${encodeURIComponent(apiKey)}`;
      }

      try {
        const response = await fetch(url, {
          method: requestOptions.method || 'GET',
          headers,
          body: requestOptions.body !== undefined ? JSON.stringify(requestOptions.body) : undefined,
          signal: controller.signal,
        });
        const text = await response.text();
        let payload = null;
        if (text) {
          try { payload = JSON.parse(text); }
          catch { payload = text; }
        }
        if (!response.ok) {
          const message = payload?.error?.message || payload?.message || `Openrouteservice svarede med fejl ${response.status}.`;
          const error = new Error(message);
          error.status = response.status;
          error.payload = payload;
          error.url = url;
          throw error;
        }
        return payload;
      } catch (error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error('Openrouteservice-kaldet tog for lang tid og blev afbrudt.');
          timeoutError.code = 'ORS_TIMEOUT';
          timeoutError.url = url;
          throw timeoutError;
        }
        if (error instanceof TypeError && !error.code) error.code = 'ORS_NETWORK';
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }

    function shouldTryFallback(error) {
      if (!error) return false;
      if (error.code === 'ORS_TIMEOUT' || error.code === 'ORS_NETWORK') return true;
      return [404, 405, 500, 502, 503, 504].includes(Number(error.status));
    }

    function queryString(params = {}) {
      const url = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) value.forEach((item) => url.append(key, item));
        else url.set(key, String(value));
      });
      return url.toString();
    }

    return {
      hasKey: () => Boolean(String(getKey() || '').trim()),

      async testConnection() {
        const query = queryString({ text: 'Danmark', size: 1, lang: 'da' });
        return request('geocode', `/search?${query}`, { authInQuery: true });
      },

      async search(text, options = {}) {
        const query = queryString({
          text,
          size: options.size || 10,
          lang: options.lang || 'da',
          'focus.point.lon': options.focus?.lng,
          'focus.point.lat': options.focus?.lat,
          'boundary.country': options.country,
          layers: options.layers,
        });
        return request('geocode', `/search?${query}`, { authInQuery: true });
      },

      async autocomplete(text, options = {}) {
        const query = queryString({
          text,
          size: options.size || 8,
          lang: options.lang || 'da',
          'focus.point.lon': options.focus?.lng,
          'focus.point.lat': options.focus?.lat,
        });
        return request('geocode', `/autocomplete?${query}`, { authInQuery: true });
      },

      async reverse(lng, lat, options = {}) {
        const query = queryString({
          'point.lon': lng,
          'point.lat': lat,
          size: options.size || 1,
          lang: options.lang || 'da',
        });
        return request('geocode', `/reverse?${query}`, { authInQuery: true });
      },

      async directions(coordinates, profile = 'cycling-regular', options = {}) {
        if (!Array.isArray(coordinates) || coordinates.length < 2) {
          throw new Error('En rute kræver mindst et start- og slutpunkt.');
        }
        return request('core', `/v2/directions/${encodeURIComponent(profile)}/geojson`, {
          method: 'POST',
          body: {
            coordinates,
            elevation: options.elevation !== false,
            instructions: options.instructions !== false,
            language: options.language || 'da',
            preference: options.preference || 'recommended',
            ...(options.extraBody || {}),
          },
        });
      },

      async snap(locations, profile = 'cycling-regular', radius = 350) {
        return request('core', `/v2/snap/${encodeURIComponent(profile)}/geojson`, {
          method: 'POST',
          body: { locations, radius },
        });
      },

      async isochrones(locations, profile = 'cycling-regular', ranges = [900, 1800], options = {}) {
        return request('core', `/v2/isochrones/${encodeURIComponent(profile)}`, {
          method: 'POST',
          body: {
            locations,
            range: ranges,
            range_type: options.rangeType || 'time',
            units: options.units || 'km',
            location_type: options.locationType || 'start',
          },
        });
      },

      async matrix(locations, profile = 'cycling-regular', options = {}) {
        return request('core', `/v2/matrix/${encodeURIComponent(profile)}`, {
          method: 'POST',
          body: {
            locations,
            metrics: options.metrics || ['distance', 'duration'],
            units: options.units || 'km',
            resolve_locations: true,
          },
        });
      },

      async elevationPoint(lng, lat) {
        const query = queryString({ geometry: `${lng},${lat}` });
        return request('elevation', `/point?${query}`, { authInQuery: true });
      },

      async elevationLine(geometry, formatIn = 'geojson') {
        return request('elevation', '/line', {
          method: 'POST',
          body: { format_in: formatIn, format_out: 'geojson', geometry },
        });
      },

      async poisAround(lng, lat, buffer = 2000, filters = {}) {
        const safeBuffer = Math.max(1, Math.min(2000, Number(buffer) || 2000));
        return request('pois', '', {
          method: 'POST',
          body: {
            request: 'pois',
            geometry: { geojson: { type: 'Point', coordinates: [lng, lat] }, buffer: safeBuffer },
            ...(Object.keys(filters).length ? { filters } : {}),
          },
        });
      },

      async optimize(jobs, vehicles) {
        return request('optimization', '', { method: 'POST', body: { jobs, vehicles } });
      },
    };
  }

  function normalizeGeocodeFeature(feature) {
    const properties = feature?.properties || {};
    const coordinates = feature?.geometry?.coordinates || [];
    return {
      id: properties.gid || properties.id || '',
      name: properties.name || properties.label || '',
      label: properties.label || properties.name || '',
      address: [properties.housenumber, properties.street].filter(Boolean).join(' '),
      postcode: properties.postalcode || '',
      city: properties.locality || properties.localadmin || properties.county || '',
      region: properties.region || '',
      country: properties.country || '',
      lng: Number(coordinates[0]),
      lat: Number(coordinates[1]),
      raw: feature,
    };
  }

  window.VCORS = { createClient, normalizeGeocodeFeature, endpoints: ENDPOINTS };
})();
