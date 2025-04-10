import { createTheme } from '@mui/material/styles';

// Custom color palette with futuristic colors
const colors = {
  primary: {
    main: '#2196f3',
    light: '#4dabf5',
    dark: '#1769aa',
    contrastText: '#fff',
  },
  secondary: {
    main: '#7c4dff',
    light: '#9c7cf5',
    dark: '#5c35b1',
    contrastText: '#fff',
  },
  background: {
    default: '#0a1929',
    paper: '#132f4c',
  },
  text: {
    primary: '#fff',
    secondary: 'rgba(255, 255, 255, 0.7)',
  },
};

// Create custom theme
const theme = createTheme({
  palette: colors,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(145deg, rgba(19, 47, 76, 0.4), rgba(19, 47, 76, 0.6))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'linear-gradient(145deg, rgba(19, 47, 76, 0.4), rgba(19, 47, 76, 0.6))',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, rgba(19, 47, 76, 0.8), rgba(19, 47, 76, 0.9))',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, rgba(19, 47, 76, 0.8), rgba(19, 47, 76, 0.9))',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

export default theme;