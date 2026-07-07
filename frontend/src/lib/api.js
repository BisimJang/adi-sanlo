const API_BASE = 'https://adi-sanlo-production.up.railway.app';

export async function api(path, options = {}) {
  const apiKey = localStorage.getItem("adi_sanlo_api_key");
  
  const headers = { 
    'Content-Type': 'application/json',
    ...options.headers 
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  
  if (res.status === 401) {
    localStorage.removeItem("adi_sanlo_api_key");
    localStorage.removeItem("adi_sanlo_tenant_id");
    window.location.href = '/login';
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
