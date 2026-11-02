// src/context/UserContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import { api, setGlobalAccessToken } from "../service/axiosInstance.js";

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token with both dynamic JS variable and React state
  const setAccessToken = useCallback((token) => {
    setGlobalAccessToken(token);
    setAccessTokenState(token);
  }, []);

  const setUser = useCallback((data) => {
    setUserState(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, [setAccessToken, setUser]);

  // Restore access token and user info from HTTP-Only cookie on refresh
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await api.post("/auth/refresh-access-token");
        const { accessToken, user: userData } = res.data;

        setAccessToken(accessToken);
        if (userData) setUser(userData);
      } catch (error) {
        //check if the backend id down or unreachable
        if(!error.reponse || error.code === "ERR_NETWORK" || error.code === 'ECONNABORTED'){
          console.warn("backend server unreachable .keeping existing session state.")

//stop excute without clearing user or access token
return
        }
        
        //only clear token
        // Refresh token is missing or expired -> clear in-memory state
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Event listener for interceptor-triggered refreshes
    window.__onTokenRefreshed = (newToken) => {
      setAccessToken(newToken);
    };

    return () => {
      window.__onTokenRefreshed = null;
    };
  }, [setAccessToken, setUser]);

  const value = {
    user,
    accessToken,
    loading,
    setUser,
    setAccessToken,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;