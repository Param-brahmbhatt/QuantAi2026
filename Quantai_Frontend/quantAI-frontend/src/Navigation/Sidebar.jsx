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
  Assignment as AssignmentIcon,
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
import BackupTableIcon from '@mui/icons-material/BackupTable';

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', children: [] },
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
    setOpenMenus((prev) => ({ [text]: !prev[text] }));
  };

  const handleNavigation = (path, hasChildren) => {
    if (hasChildren) return;
    if (path) navigate(path); 
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 240,
        height: '100vh',          
        overflow: 'hidden',   
        backgroundColor: '#faf8f8',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <img
          src={Logo}
          alt="QuantAI Logo"
          style={{ width: "200px", height: "auto", objectFit: "contain" }}
        />
      </Box>

      <Divider sx={{ border: '1px solid #ddd', width: '180px', margin: '0 auto 8px' }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, px: 2, py: 2, overflowY: 'auto' }}>
        <List sx={{ padding: 0 }}>
          {menuItems.map((item) => (
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
                    px: 2,
                    '&:hover': { backgroundColor: 'transparent' },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.15)',
                      backgroundColor: '#fff',
                      color: 'rgb(103, 116, 142)',
                      mr: 2,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '14px', fontWeight: 500, color: 'rgb(103, 116, 142)' }}
                  />

                  {item.children.length > 0 &&
                    (openMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>

              {item.children.length > 0 && (
                <Collapse in={openMenus[item.text]} timeout={1000} unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.text}
                        sx={{
                          pl: 8,
                          py: 1,
                          transition: 'all 0.3s ease',
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
