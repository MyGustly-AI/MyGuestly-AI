import { api, setAccessToken } from "./client";

export async function registerRequest({ fullName, email, password, role }) {
  const data = await api.post("/auth/register", { fullName, email, password, role });
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function loginRequest({ email, password }) {
  const data = await api.post("/auth/login", { email, password });
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function googleLoginRequest({ idToken }) {
  const data = await api.post("/auth/google", { idToken });
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function refreshRequest() {
  const data = await api.post("/auth/refresh", undefined, { skipAuthRetry: true });
  if (data?.accessToken) setAccessToken(data.accessToken);
  return data;
}

export async function logoutRequest() {
  try {
    await api.post("/auth/logout");
  } finally {
    setAccessToken(null);
  }
}

export async function getMeRequest() {
  return api.get("/auth/me");
}

export async function updateProfileRequest(payload) {
  return api.patch("/auth/profile", payload);
}

export async function changePasswordRequest({ currentPassword, newPassword }) {
  return api.patch("/auth/password", { currentPassword, newPassword });
}

export async function forgotPasswordRequest({ email }) {
  return api.post("/auth/forgot-password", { email });
}

export async function resetPasswordRequest({ token, newPassword }) {
  return api.post("/auth/reset-password", { token, newPassword });
}

export async function deleteAccountRequest() {
  return api.delete("/auth/account");
}