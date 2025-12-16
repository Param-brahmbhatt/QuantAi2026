import React, { useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import Sidebar from './Navigation/Sidebar';
import Header from './Navigation/Header';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';

function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Routes where Sidebar and Header should be hidden
  const hideLayout =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/verify-email' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/welcome' ||
    location.pathname === '/welcome-details'

  if (hideLayout) {
    return (
      <Box
        sx={{
          height: '100vh',
          overflow: 'auto',
          backgroundColor: '#faf8f8',
        }}
      >
        <AppRoutes />
      </Box>
    );
  }

  // For all other pages → normal layout
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: isSidebarCollapsed ? 80 : 240,
          minWidth: isSidebarCollapsed ? 80 : 200,
          maxWidth: isSidebarCollapsed ? 80 : 240,
          backgroundColor: '#f5f5f5',
          transition: 'width 0.3s ease',
        }}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: isSidebarCollapsed ? '100%' : 'calc(100% - 240px)',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          backgroundColor: '#faf8f8',
        }}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <Box
          sx={{
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
            p: 2,
            backgroundColor: '#faf8f8',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: '6px', height: '6px' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#a8a8a8',
            },
          }}
        >
          <AppRoutes />
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}
