export const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export async function api(path, { method = "GET", body, form } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(API + path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}
