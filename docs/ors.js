(() => {
  'use strict';
  const DEFAULT_BASE = 'https://api.openrouteservice.org';
  const ALT_BASE = 'https://api.heigit.org/openrouteservice';

  async function request(path, options = {}, config = {}) {
    const key = config.apiKey || '';
    if (!key) throw new Error('Openrouteservice API-nøglen mangler. Indsæt den under Indstillinger → Ruteplanlægning.');
    const bases = [config.baseUrl || DEFAULT_BASE, ALT_BASE].filter((v,i,a)=>v && a.indexOf(v)===i);
    let lastError;
    for (const base of bases) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), config.timeout || 18000);
        const headers = {Accept:'application/json', Authorization:key, ...(options.headers||{})};
        if (options.body && !headers['Content-Type']) headers['Content-Type']='application/json';
        const response = await fetch(base.replace(/\/$/,'') + path, {...options, headers, signal:controller.signal});
        clearTimeout(timer);
        const raw = await response.text();
        let data = raw;
        try { data = raw ? JSON.parse(raw) : null; } catch (_) {}
        if (!response.ok) throw new Error(data?.error?.message || data?.message || `Openrouteservice svarede med ${response.status}.`);
        return data;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('Openrouteservice kunne ikke kontaktes.');
  }

  function createClient(getConfig) {
    const cfg = () => typeof getConfig === 'function' ? getConfig() : (getConfig || {});
    return {
      async geocode(text, options={}) {
        const c = cfg();
        const url = new URL((c.baseUrl||DEFAULT_BASE).replace(/\/$/,'') + '/geocode/search');
        url.searchParams.set('api_key', c.apiKey||'');
        url.searchParams.set('text', text);
        url.searchParams.set('size', String(options.size||8));
        if (options.focus) url.searchParams.set('focus.point.lon', options.focus.lng), url.searchParams.set('focus.point.lat', options.focus.lat);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Søgningen kunne ikke gennemføres.');
        return response.json();
      },
      directions(points, profile='cycling-regular', options={}) {
        return request(`/v2/directions/${profile}/geojson`, {method:'POST', body:JSON.stringify({coordinates:points, elevation:true, instructions:false, ...(options.body||{})})}, cfg());
      },
      snap(points, profile='cycling-regular', radius=400) {
        return request(`/v2/snap/${profile}`, {method:'POST', body:JSON.stringify({locations:points, radius})}, cfg());
      },
      isochrones(points, profile='cycling-regular', ranges=[900,1800]) {
        return request(`/v2/isochrones/${profile}`, {method:'POST', body:JSON.stringify({locations:points, range:ranges})}, cfg());
      },
      matrix(points, profile='cycling-regular') {
        return request(`/v2/matrix/${profile}`, {method:'POST', body:JSON.stringify({locations:points, metrics:['distance','duration']})}, cfg());
      },
      async test() {
        const result = await this.geocode('Holstebro, Danmark',{size:1});
        return Array.isArray(result?.features) && result.features.length>0;
      }
    };
  }

  window.VCORS = { createClient, DEFAULT_BASE, ALT_BASE };
})();
