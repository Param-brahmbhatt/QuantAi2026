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
      const token = localStorage.getItem("access_token");
      
      if (token) {
        try {
          const userData = await GetUserDetails();
          
          setUser({
            id: userData?.id || null,
            name: userData?.name || userData?.first_name || userData?.email || 'User',
            email: userData?.email || '',
            role: userData?.role || userData?.user_type || 'User',
            isAuthenticated: true,
            ...userData,
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
    if (token) {
      localStorage.setItem("access_token", token);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const userDetails = await GetUserDetails();
      setUser({
        id: userDetails?.id || userData?.id || null,
        name: userDetails?.name || userDetails?.first_name || userData?.name || userDetails?.email || 'User',
        email: userDetails?.email || userData?.email || '',
        role: userDetails?.role || userDetails?.user_type || userData?.role || 'User',
        isAuthenticated: true,
        ...userDetails,
      });
    } catch (error) {
      console.error("Error fetching user details after login:", error);
      // If fetching user details fails, use provided userData
      setUser({
        id: userData?.id || null,
        name: userData?.name || userData?.email || 'User',
        email: userData?.email || '',
        role: userData?.role || 'User',
        isAuthenticated: true,
        ...userData,
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
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
