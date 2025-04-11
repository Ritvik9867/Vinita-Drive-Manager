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
      if (retryCount < maxRetries) {
        retryCount++;
        continue;
      }
      return { success: false, error: error.message || 'Login failed. Please try again.' }
    }
  }
  }

  const register = async (userData) => {
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
            action: 'register',
            ...userData
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
          throw new Error(errorData.error || `Registration failed (${status}). Please try again later.`);
        }

        const data = await response.json();
        if (data.success) {
          return { success: true };
        } else {
          throw new Error(data.error || 'Registration failed');
        }

      } catch (error) {
        console.error(`Registration attempt ${retryCount + 1} failed:`, error);
        if (retryCount < maxRetries && 
            (error.message.includes('connect to server') || 
             error.message.includes('network') || 
             error.message.includes('Server error'))) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, config.API.RETRY_DELAY));
          continue;
        }
        return {
          success: false,
          error: error.message || 'Failed to register'
        };
      }
    }
    return {
      success: false,
      error: 'Maximum retry attempts reached'
    };
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
      return { success: true }
    } catch (error) {
      console.error('Logout failed:', error)
      return { success: false, error: 'Logout failed' }
    } finally {
      localStorage.removeItem('sessionToken')
      setUser(null)
      setIsAuthenticated(false)
      navigate('/login')
    }
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