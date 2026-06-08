import { createContext, useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '@/api/client';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(async () => {
    try {
      await apiPost('/auth/logout', {});
    } catch (error) {
      // best effort only
    }
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await apiGet('/auth/profile');
      if (response.success) {
        setUser(response.data);
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      await logout();
    }
  }, [logout]);

  // On mount, check if there's a stored token
  useEffect(() => {
    let mounted = true;

    const storedToken = localStorage.getItem('authToken');
    const boot = async () => {
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        await fetchUserProfile();
      }

      if (mounted) {
        setLoading(false);
      }
    };

    boot();

    return () => {
      mounted = false;
    };
  }, [fetchUserProfile]);

  // Keep auth state synchronized across multiple browser tabs.
  useEffect(() => {
    const onStorage = async (event) => {
      if (event.key !== 'authToken') return;
      const latestToken = localStorage.getItem('authToken');
      if (!latestToken) {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      setToken(latestToken);
      setIsAuthenticated(true);
      await fetchUserProfile();
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [fetchUserProfile]);

  const login = async (googleToken) => {
    return authenticateWithGoogle(googleToken, 'login');
  };

  const signup = async (googleToken) => {
    return authenticateWithGoogle(googleToken, 'signup');
  };

  const authenticateWithGoogle = async (googleToken, mode) => {
    try {
      const response = await apiPost('/auth/google', {
        token: googleToken,
        mode,
      });

      if (response.success) {
        return finalizeAuth(response.data);
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: error.message };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const response = await apiPost('/auth/login', { email, password });
      if (response.success) {
        return finalizeAuth(response.data);
      }
      return { success: false, error: response.message };
    } catch (error) {
      console.error('Email login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signupWithEmail = async ({ name, email, password }) => {
    try {
      const response = await apiPost('/auth/register', {
        name,
        email,
        password,
      });
      if (response.success) {
        return finalizeAuth(response.data);
      }
      return { success: false, error: response.message };
    } catch (error) {
      console.error('Email signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const finalizeAuth = (authData) => {
    const jwtToken = authData.token;
    const userData = authData.user;

    localStorage.setItem('authToken', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setIsAuthenticated(true);

    return { success: true, user: userData };
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    signup,
    loginWithEmail,
    signupWithEmail,
    logout,
    updateProfileState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
