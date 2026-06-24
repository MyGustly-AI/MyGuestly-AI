import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  loginRequest,
  registerRequest,
  googleLoginRequest,
  logoutRequest,
  getMeRequest,
  refreshRequest,
} from "../api/auth";
import { setUnauthorizedHandler, setAccessToken, ApiError } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());

    (async () => {
      try {
        await refreshRequest();
        const me = await getMeRequest();
        setUser(me?.user ?? me);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, [clearSession]);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const data = await loginRequest({ email, password });
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to sign in. Please try again.";
      setError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    try {
      const data = await registerRequest(payload);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to create account. Please try again.";
      setError(msg);
      throw err;
    }
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    setError(null);
    try {
      const data = await googleLoginRequest({ idToken });
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Google sign-in failed. Please try again.";
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    setError,
    login,
    register,
    googleLogin,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}