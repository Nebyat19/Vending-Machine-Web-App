import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
}

const AUTH_STORAGE_KEY = 'admin-auth';

// Demo credentials - in production, this would be handled by a backend
const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        if (parsedAuth.isAuthenticated && parsedAuth.user) {
          setAuthState(parsedAuth);
        }
      } catch (error) {
        console.error('Error parsing saved auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Save auth state to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    }
  }, [authState, loading]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      const newAuthState = {
        isAuthenticated: true,
        user: { username }
      };
      setAuthState(newAuthState);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid username or password' };
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return {
    ...authState,
    loading,
    login,
    logout
  };
};