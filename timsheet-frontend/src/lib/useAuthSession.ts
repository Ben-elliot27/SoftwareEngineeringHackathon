import { useCallback, useEffect, useState } from "react";
import {
  clearToken,
  getCurrentUser,
  getStoredToken,
  login,
  storeToken,
  type User,
} from "./api";

export function useAuthSession() {
  const initialToken = getStoredToken();
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(initialToken));
  const [error, setError] = useState("");

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    setLoading(false);
    setError("");
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    getCurrentUser(token)
      .then((nextUser) => {
        if (cancelled) return;
        setUser(nextUser);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Authentication failed");
        clearToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const signIn = useCallback(async (email: string, password: string) => {
    const nextToken = await login(email, password);
    storeToken(nextToken);
    setLoading(true);
    setToken(nextToken);
    setError("");
  }, []);

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated: Boolean(token && user),
    signIn,
    logout,
  };
}
