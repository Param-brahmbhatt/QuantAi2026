import React from 'react';
import { Box, Typography, Avatar, Breadcrumbs } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";

const Header = ({ isSidebarCollapsed }) => {
  const { user } = useAuth(); // Get user from AuthContext

  return (
    <Box
      sx={{
        width: '100%',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        backgroundColor: '#faf8f8',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {!isSidebarCollapsed && (
          <Breadcrumbs aria-label="breadcrumb" sx={{ ml: 3 }}>
            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'black'
              }}
            >
              <HomeIcon fontSize="small" />
            </Link>
          </Breadcrumbs>
        )}
      </Box>

      {/* Profile Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginRight: '80px' }}>
        <Link
          to="/profile"
          style={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          <Avatar
            alt="Profile"
            src="/assets/profile.png"
            sx={{ height: '24px', width: '24px', fontSize: '12px' }}
          />
        </Link>

        {!isSidebarCollapsed && (
          <Link
            to="/profile"
            style={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            <Typography variant="body1" color="text.secondary">
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user.name || user.email || 'User'}
            </Typography>
          </Link>
        )}
      </Box>
    </Box>
  );
};

export default Header;