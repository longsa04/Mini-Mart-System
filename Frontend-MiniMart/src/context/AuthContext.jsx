import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { login as loginRequest } from "../api/auth";
import { loadAuthState, saveAuthState, clearAuthState } from "../utils/authStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => loadAuthState());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async ({ username, password }) => {
    setLoading(true);
    try {
      const result = await loginRequest({ username, password });
      const nextState = {
        token: result?.token ?? null,
        user: result?.user ?? null,
        expiresIn: result?.expiresIn ?? null,
      };
      setAuthState(nextState);
      saveAuthState(nextState);
      return nextState;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState(null);
    clearAuthState();
  }, []);

  const value = useMemo(
    () => ({
      user: authState?.user ?? null,
      token: authState?.token ?? null,
      expiresIn: authState?.expiresIn ?? null,
      login,
      logout,
      loading,
      isAuthenticated: Boolean(authState?.token),
    }),
    [authState, login, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
