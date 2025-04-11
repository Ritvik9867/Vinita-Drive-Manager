import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { config, formatDate } from '../config/config'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch(config.API_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'checkAuth',
            sessionToken: localStorage.getItem('sessionToken')
          })
        })
        const data = await response.json()
        
        if (data.success) {
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('sessionToken')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    let retryCount = 0;
    const maxRetries = config.API.RETRY_COUNT;

    while (retryCount <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.API.TIMEOUT);

        const response = await fetch(config.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': window.location.origin
          },
          body: JSON.stringify({
            action: 'login',
            ...credentials
          }),
          signal: controller.signal,
          mode: 'cors',
          credentials: 'include'
        });

        clearTimeout(timeoutId);

      if (!response.ok) {
        const status = response.status;
        if (status >= 500) {
          throw new Error(`Server error (${status}). Please try again later.`);
        }
        if (status === 429) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        }
        if (status === 0 || status === 404) {
          throw new Error('Unable to connect to server. Please check your internet connection.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Login failed (${status}). Please try again later.`);
      }

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setIsAuthenticated(true)
        localStorage.setItem('sessionToken', data.sessionToken)
        navigate(data.user.role === 'admin' ? '/admin' : '/driver')
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Invalid credentials' }
      }
    } catch (error) {
      console.error('Login failed:', error)
      if (error.name === 'AbortError') {
        return { success: false, error: 'Login request timed out. Please try again.' }
      }
      return { success: false, error: error.message || 'Login failed. Please try again.' }
    }
  }

  const register = async (userData) => {
    const maxRetries = config.API.RETRY_COUNT;
    let retryCount = 0;

    const attemptRegister = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.API.TIMEOUT);

        // Check internet connectivity
        if (!navigator.onLine) {
          throw new Error('No internet connection. Please check your network and try again.');
        }

        const response = await fetch(config.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': window.location.origin,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            action: 'register',
            ...userData,
            timestamp: Date.now(), // Add timestamp to prevent caching
            client_id: Math.random().toString(36).substring(7) // Add unique client ID
          }),
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const status = response.status;
          if (status >= 500) {
            throw new Error(`Server error (${status}). Please try again later.`);
          }
          if (status === 429) {
            throw new Error('Too many requests. Please wait a moment before trying again.');
          }
          if (status === 0 || status === 404) {
            throw new Error('Unable to connect to server. Please check your internet connection.');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Registration failed (${status}). Please try again later.`);
        }

        const data = await response.json();

        if (data.success) {
          return { success: true };
        } else {
          const errorMessage = data.error || 'Registration failed. Please try again.';
          console.error('Registration error:', errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        console.error(`Registration attempt ${retryCount + 1} failed:`, error);
        
        if (error.message.includes('Failed to fetch') || error.message.includes('Server error')) {
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptRegister();
          }
          return { 
            success: false, 
            error: 'Unable to connect to server. Please check your internet connection and try again.'
          };
        }
        
        if (error.message.includes('Too many requests')) {
          return { success: false, error: error.message };
        }
        
        return { 
          success: false, 
          error: 'Registration failed. Please try again later.'
        };
      }
    };

    return attemptRegister();
  }

  const logout = async () => {
    try {
      await fetch(config.API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'logout',
          sessionToken: localStorage.getItem('sessionToken')
        })
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      localStorage.removeItem('sessionToken')
      setUser(null)
      setIsAuthenticated(false)
      navigate('/login')
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}