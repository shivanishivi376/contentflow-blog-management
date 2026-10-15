import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#155a37',       // Fernly Pine Green Primary
      light: '#296a46',
      dark: '#0d3a23',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#126c41',       // Forest Secondary
      light: '#a1f5bd',      // Mint Container
      dark: '#004124',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ba1a1a',
      light: '#ffdad6',
      dark: '#93000a',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706',
      light: '#fef3c7',
      dark: '#b45309',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0284c7',
      light: '#e0f2fe',
      dark: '#0369a1',
      contrastText: '#ffffff',
    },
    success: {
      main: '#155a37',
      light: '#a1f5bd',
      dark: '#0d3a23',
      contrastText: '#ffffff',
    },
    grey: {
      50: '#f8faf8',
      100: '#f2f4f2',
      200: '#e3e7e4',
      300: '#bfc9bf',
      400: '#94a095',
      500: '#707971',
      600: '#404942',
      700: '#2e3130',
      800: '#191c1b',
      900: '#111814',
    },
    background: {
      default: '#e9ebe9',
      paper: '#ffffff',
    },
    text: {
      primary: '#191c1b',
      secondary: '#404942',
      disabled: '#94a095',
    },
    divider: '#e3e7e4',
  },
  typography: {
    fontFamily: [
      'Plus Jakarta Sans',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800, letterSpacing: '-0.03em', color: '#191c1b' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em', color: '#191c1b' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', color: '#191c1b' },
    h4: { fontWeight: 600, letterSpacing: '-0.015em', color: '#191c1b' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em', color: '#191c1b' },
    h6: { fontWeight: 600, color: '#191c1b' },
    subtitle1: { fontWeight: 500, color: '#404942' },
    subtitle2: { fontWeight: 500, color: '#404942' },
    body1: { color: '#191c1b', fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { color: '#404942', fontSize: '0.875rem', lineHeight: 1.5 },
    button: { fontWeight: 600, letterSpacing: '-0.01em', textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(19, 26, 21, 0.04)',
    '0 2px 4px -1px rgba(19, 26, 21, 0.06), 0 1px 2px 0 rgba(19, 26, 21, 0.04)',
    '0 4px 6px -1px rgba(19, 26, 21, 0.06), 0 2px 4px -1px rgba(19, 26, 21, 0.04)',
    '0 10px 15px -3px rgba(19, 26, 21, 0.08), 0 4px 6px -2px rgba(19, 26, 21, 0.04)',
    '0 20px 25px -5px rgba(19, 26, 21, 0.08), 0 10px 10px -5px rgba(19, 26, 21, 0.03)',
    '0 25px 50px -12px rgba(19, 26, 21, 0.12)',
    ...Array(18).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999, // Pill style buttons
          fontWeight: 600,
          boxShadow: 'none',
          textTransform: 'none',
          '&:hover': {
            boxShadow: '0 2px 6px -1px rgba(21, 90, 55, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(180deg, #155a37 0%, #0d3a23 100%)',
          '&:hover': {
            background: 'linear-gradient(180deg, #1c7246 0%, #124b2e 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          borderColor: '#e3e7e4',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e3e7e4',
            },
            '&:hover fieldset': {
              borderColor: '#bfc9bf',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#155a37',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
  },
});

export default muiTheme;
