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

  const hideLayout = [
    '/login',
    '/register',
    '/verify-email',
    '/reset-password',
    '/forgot-password',
    '/welcome',
    '/welcome-details',
  ].includes(location.pathname);

  if (hideLayout) {
    return (
      <Box sx={{ height: '100vh', backgroundColor: '#faf8f8' }}>
        <AppRoutes />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: isSidebarCollapsed ? 120 : 240,
          minWidth: isSidebarCollapsed ? 120 : 240,
          transition: 'width 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#faf8f8',
        }}
      >
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
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
