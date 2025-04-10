import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  DirectionsCar,
  LocalGasStation,
  Report,
  Payment,
  People,
  Assessment,
  MoneyOff,
  Logout,
} from '@mui/icons-material'

const drawerWidth = 240

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (loading) {
    return null
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const driverMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/driver' },
    { text: 'Trips', icon: <DirectionsCar />, path: '/driver/trips' },
    { text: 'CNG', icon: <LocalGasStation />, path: '/driver/cng' },
    { text: 'Complaints', icon: <Report />, path: '/driver/complaints' },
    { text: 'Payments', icon: <Payment />, path: '/driver/payments' },
  ]

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Drivers', icon: <People />, path: '/admin/drivers' },
    { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
    { text: 'Complaints', icon: <Report />, path: '/admin/complaints' },
    { text: 'Advance', icon: <MoneyOff />, path: '/admin/advance' },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : driverMenuItems

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {user?.role === 'admin' ? 'Admin Panel' : 'Driver Panel'}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path)
                setMobileOpen(false)
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider />
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Driver Management System
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout