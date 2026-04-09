import { createTheme, alpha } from '@mui/material/styles';

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4E6AE6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5BBE9B',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#42A77D',
    },
    warning: {
      main: '#D79A2B',
    },
    error: {
      main: '#D45A6A',
    },
    background: {
      default: '#EEF3FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#16365F',
      secondary: '#6880A2',
    },
    divider: 'rgba(105, 132, 171, 0.18)',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '"Poppins", "Segoe UI", sans-serif',
    h1: {
      fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
      fontWeight: 800,
      lineHeight: 0.96,
      letterSpacing: '-0.05em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.03em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.7,
    },
    body2: {
      fontWeight: 400,
      lineHeight: 1.65,
    },
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
    },
    overline: {
      fontSize: '0.72rem',
      letterSpacing: '0.14em',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
});

const theme = createTheme(baseTheme, {
  palette: {
    primary: {
      ...baseTheme.palette.primary,
      soft: alpha(baseTheme.palette.primary.main, 0.16),
    },
    success: {
      ...baseTheme.palette.success,
      soft: alpha(baseTheme.palette.success.main, 0.16),
    },
    warning: {
      ...baseTheme.palette.warning,
      soft: alpha(baseTheme.palette.warning.main, 0.16),
    },
    error: {
      ...baseTheme.palette.error,
      soft: alpha(baseTheme.palette.error.main, 0.16),
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 18,
          boxShadow: 'none',
          minHeight: 44,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          height: 28,
          backgroundColor: '#E8EEFB',
          color: '#355B9B',
          borderColor: 'rgba(78, 106, 230, 0.16)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#F7F9FE',
          transition: 'border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease',
          '&:hover': {
            backgroundColor: '#F1F5FC',
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(baseTheme.palette.primary.main, 0.12)}`,
          },
        },
        notchedOutline: {
          borderColor: 'rgba(116, 140, 176, 0.28)',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: baseTheme.palette.text.secondary,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginInline: 6,
          marginBlock: 4,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(147, 167, 205, 0.18)',
        },
      },
    },
  },
});

export default theme;
