import { useCallback, useEffect, useState } from "react";
import {
  clearToken,
  getCurrentUser,
  getStoredToken,
  login,
  storeToken,
  type User,
} from "./api";

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string;
};

export function useAuthSession() {
  const [state, setState] = useState<AuthState>({
    token: getStoredToken(),
    user: null,
    loading: true,
    error: "",
  });

  const logout = useCallback(() => {
    clearToken();
    setState({ token: null, user: null, loading: false, error: "" });
  }, []);

  useEffect(() => {
    if (!state.token) {
      setState((prev) => ({ ...prev, user: null, loading: false }));
      return;
    }

    let cancelled = false;

    getCurrentUser(state.token)
      .then((user) => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, user, loading: false, error: "" }));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Authentication failed";
        clearToken();
        setState({ token: null, user: null, loading: false, error: message });
      });

    return () => {
      cancelled = true;
    };
  }, [state.token]);

  const signIn = useCallback(async (email: string, password: string) => {
    const token = await login(email, password);
    storeToken(token);
    setState((prev) => ({ ...prev, token, loading: true, error: "" }));
  }, []);

  return {
    token: state.token,
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: Boolean(state.token && state.user),
    signIn,
    logout,
  };
}
