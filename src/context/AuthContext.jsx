import { createContext, useContext, useEffect, useState } from "react";
import { login, logout, subscribeAuth } from "../firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    authLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
