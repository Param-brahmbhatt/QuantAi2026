import React from 'react';
import { Box, Typography, Avatar, Breadcrumbs, Stack } from '@mui/material';
import { NavigateNext, Home as HomeIcon } from '@mui/icons-material';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ isSidebarCollapsed }) => {
  const location = useLocation();
  const { user } = useAuth();
  const params = useParams();

  // Function to get breadcrumb items based on current path
  const getBreadcrumbs = (pathname) => {
    const pathParts = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Always start with Home
    breadcrumbs.push({ label: 'Home', path: '/' });

    if (pathname === '/') {
      return breadcrumbs;
    }

    // Handle project detail page
    if (pathname.includes('/projects/') && pathname.includes('/edit')) {
      const projectId = params.projectId || '1100';
      breadcrumbs.push({ label: 'Projects', path: '/projects' });
      breadcrumbs.push({ label: projectId, path: pathname });
      breadcrumbs.push({ label: 'Edit', path: pathname });
      return breadcrumbs;
    }

    // Handle other routes
    switch (pathname) {
      case '/projects':
        breadcrumbs.push({ label: 'Projects', path: '/projects' });
        break;
      case '/projects/add-project':
        breadcrumbs.push({ label: 'Projects', path: '/projects' });
        breadcrumbs.push({ label: 'Add Project', path: '/projects/add-project' });
        break;
      case '/users':
        breadcrumbs.push({ label: 'Users', path: '/users' });
        break;
      case '/users/new-add':
        breadcrumbs.push({ label: 'Users', path: '/users' });
        breadcrumbs.push({ label: 'Add User', path: '/users/new-add' });
        break;
      case '/master-data':
        breadcrumbs.push({ label: 'Master Data', path: '/master-data' });
        break;
      case '/rewards':
        breadcrumbs.push({ label: 'Rewards', path: '/rewards' });
        break;
      case '/settings/transactions':
        breadcrumbs.push({ label: 'Transactions', path: '/settings/transactions' });
        break;
      case '/profile':
        breadcrumbs.push({ label: 'Profile', path: '/profile' });
        break;
      default:
        break;
    }

    return breadcrumbs;
  };

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
              to="/"
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

            {/* <Typography color="text.primary">
              {getPageTitle(location.pathname)}
            </Typography> */}
          </Breadcrumbs>
        )}
      </Box>

      {/* Profile Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginRight: '80px' }}>
        <Avatar
          alt="Profile"
          src="/assets/profile.png"
          sx={{ height: '24px', width: '24px', fontSize: '12px' }}
        />

        {!isSidebarCollapsed && (
          <Link
            to="/profile"
            style={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            <Typography variant="body1" color="text.secondary">
              {user?.name || 'User'}
            </Typography>
          </Link>
        )}
      </Box>
    </Box>
  );
};

export default Header;
