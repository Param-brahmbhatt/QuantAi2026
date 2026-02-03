import React, { createContext, useContext, useState, useEffect } from 'react';
import { GetUserDetails } from '../API/Services/services';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const extractToken = (rawToken) => {
  if (!rawToken) return null;
  try {
    const parsed = typeof rawToken === 'string' ? JSON.parse(rawToken) : rawToken;
    if (parsed?.access_token) return parsed.access_token;
    if (parsed?.token) return parsed.token;
  } catch (e) {
  }
  return rawToken;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    name: '',
    email: '',
    role: '',
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const rawToken = localStorage.getItem("access_token");
      const token = extractToken(rawToken);
      if (token && token !== rawToken) {
        localStorage.setItem("access_token", token);
      }
      
      if (token) {
        try {
          const userData = await GetUserDetails();
          const userRole = userData?.role || userData?.user_type || 'User';
          const roleDisplay = userData?.role_display || userRole;
          
          // Save role to localStorage for Sidebar component
          if (userRole) {
            localStorage.setItem("role", userRole);
            localStorage.setItem("role_display", roleDisplay);
          }
          
          setUser({
            ...userData,
            id: userData?.id || null,
            email: userData?.email || '',
            role: userRole,
            isAuthenticated: true,
            first_name: userData?.first_name ?? '',
            last_name: userData?.last_name ?? '',
            name: userData?.name || (userData?.first_name && userData?.last_name 
              ? `${userData.first_name} ${userData.last_name}` 
              : userData?.first_name || userData?.email || 'User'),
          });
        } catch (error) {
          console.error("Error fetching user details:", error);
          localStorage.removeItem("access_token");
          setUser({
            id: null,
            name: '',
            email: '',
            role: '',
            isAuthenticated: false,
          });
        }
      } else {
        setUser({
          id: null,
          name: '',
          email: '',
          role: '',
          isAuthenticated: false,
        });
      }
      
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (userData, token) => {
    const normalizedToken = extractToken(token);
    if (normalizedToken) {
      localStorage.setItem("access_token", normalizedToken);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const userDetails = await GetUserDetails();
      const userRole = userDetails?.role || userDetails?.user_type || userData?.role || 'User';
      const roleDisplay = userDetails?.role_display || userRole;
      
      // Save role to localStorage for Sidebar component
      if (userRole) {
        localStorage.setItem("role", userRole);
        localStorage.setItem("role_display", roleDisplay);
      }
      
      setUser({
        ...userDetails,
        id: userDetails?.id || userData?.id || null,
        email: userDetails?.email || userData?.email || '',
        role: userRole,
        isAuthenticated: true,
        first_name: userDetails?.first_name ?? '',
        last_name: userDetails?.last_name ?? '',
        name: userDetails?.name || (userDetails?.first_name && userDetails?.last_name 
          ? `${userDetails.first_name} ${userDetails.last_name}` 
          : userDetails?.first_name || userDetails?.email || 'User'),
      });
    } catch (error) {
      console.error("Error fetching user details after login:", error);
      setUser({
        ...userData,
        id: userData?.id || null,
        name: userData?.name || userData?.first_name || userData?.email || 'User',
        email: userData?.email || '',
        role: userData?.role || 'User',
        isAuthenticated: true,
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("role_display");
    setUser({
      id: null,
      name: '',
      email: '',
      role: '',
      isAuthenticated: false,
    });
  };

  const isAdmin = () => user.role === 'Admin' || user.user_type === 'Admin';
  const isUser = () => user.role === 'User' || user.user_type === 'User';

  const value = {
    user,
    login,
    logout,
    isAdmin,
    isUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
