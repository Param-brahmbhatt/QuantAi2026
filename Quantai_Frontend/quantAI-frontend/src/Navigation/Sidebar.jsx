import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Collapse,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  Group as GroupIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Logo from "/assets/QuantAI.png";

const Sidebar = ({ isCollapsed }) => {
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', children: [] },
    { text: 'Projects', icon: <BarChartIcon />, path: '/projects', children: [] },
    { text: 'Transactions', icon: <AttachMoneyIcon />, path: '/settings/transactions', children: [] },
    { text: 'Master Data', icon: <StorageIcon />, path: '/master-data', children: [] },
    { text: 'Users', icon: <GroupIcon />, path: '/users', children: [] },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile', children: [] },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      children: [
        { text: 'Redemption Settings', path: '/settings/redeemptions' },
      ],
    },
    { text: 'Sign Out', icon: <ExitToAppIcon />, path: '/logout', children: [] },
  ];

  const toggleMenu = (text) => {
    setOpenMenus(prev => ({ ...prev, [text]: !prev[text] }));
  };

  const handleNavigation = (path, hasChildren) => {
    if (hasChildren) return;

    if (path === '/logout') {
      localStorage.removeItem('access_token');
      navigate('/login');
      return;
    }

    if (path) navigate(path);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: isCollapsed ? '120px' : '240px',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#faf8f8',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          transition: 'all 0.4s ease'
        }}
      >
        <img
          src={Logo}
          alt="QuantAI Logo"
          style={{
            width: isCollapsed ? "40px" : "180px",
            height: "auto",
            objectFit: "contain",
            transition: 'width 0.4s ease'
          }}
        />
      </Box>

      <Divider sx={{ border: '1px solid #ddd', width: isCollapsed ? '60%' : '80%', margin: '0 auto 8px' }} />

      {/* Menu */}
      <Box sx={{ flex: 1, px: 1, py: 1, overflowY: 'auto' }}>
        <List sx={{ padding: 0 }}>
          {menuItems.map(item => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() =>
                    item.children.length > 0
                      ? toggleMenu(item.text)
                      : handleNavigation(item.path, false)
                  }
                  sx={{
                    borderRadius: '12px',
                    py: 1.2,
                    px: isCollapsed ? 0 : 2,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    width: '100%',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': { backgroundColor: 'transparent' },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.12)',
                      backgroundColor: '#fff',
                      color: 'rgb(103, 116, 142)',
                      mr: isCollapsed ? 0 : 2,
                      fontSize: 20,
                      transition: 'margin 0.3s ease',
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box
                    sx={{
                      display: isCollapsed ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      transition: 'opacity 0.3s ease',
                      opacity: isCollapsed ? 0 : 1
                    }}
                  >
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'rgb(103, 116, 142)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    />
                    {item.children.length > 0 &&
                      (openMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                  </Box>
                </ListItemButton>
              </ListItem>

              {/* Submenu */}
              {item.children.length > 0 && (
                <Collapse in={openMenus[item.text] && !isCollapsed} timeout={300} unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map(child => (
                      <ListItemButton
                        key={child.text}
                        sx={{
                          pl: 8,
                          py: 1,
                          '&:hover': { backgroundColor: '#f0f0f0' },
                        }}
                        onClick={() => handleNavigation(child.path, false)}
                      >
                        <ListItemText
                          primary={child.text}
                          primaryTypographyProps={{ fontSize: '13px', color: '#555' }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default Sidebar;
