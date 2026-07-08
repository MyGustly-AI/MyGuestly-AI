const API_BASE_URL = process.env.REACT_APP_API_URL || "https://myguestly-ai.onrender.com/api/v1";

let accessToken = localStorage.getItem("token") || null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("refresh_failed");
        const json = await res.json();
        const newToken = json?.data?.accessToken;
        if (!newToken) throw new Error("refresh_failed");
        setAccessToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, { method = "GET", body, headers = {}, skipAuthRetry = false, isFormData = false } = {}) {
  const doFetch = async () => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
    return res;
  };

  let res = await doFetch();

  if (res.status === 401 && !skipAuthRetry && path !== "/auth/refresh") {
    try {
      await refreshAccessToken();
      res = await doFetch();
    } catch {
      if (onUnauthorized) onUnauthorized();
      throw new ApiError("Session expired. Please sign in again.", 401, null);
    }
  }

  let json = null;
  try {
    json = await res.json();
  } catch {}

  if (!res.ok) {
    const message = json?.message || json?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json);
  }

  return json?.data !== undefined ? json.data : json;
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

export { API_BASE_URL };