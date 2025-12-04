createTheme({
  palette: {
    mode: 'light',
    
 
    primary: {
      main: '#2d6a4f',   
      light: '#52b788',   
      dark: '#1b4332',   
      contrastText: '#ffffff',
    },
    

    secondary: {
      main: '#7a9e7e',    
      light: '#a8c5a3',   
      dark: '#567259',     
      contrastText: '#ffffff',
    },
    

    success: {
      main: '#40916c',   
      light: '#74c69d',
      dark: '#2d6a4f',
      contrastText: '#ffffff',
    },
    

    info: {
      main: '#0077b6',    
      light: '#48cae4',
      dark: '#023e8a',     
      contrastText: '#ffffff',
    },
    
    warning: {
      main: '#d97706',    
      light: '#fbbf24',
      dark: '#b45309',      
      contrastText: '#ffffff',
    },
    
    error: {
      main: '#c1121f',      
      light: '#ef476f',
      dark: '#800f2f',      
      contrastText: '#ffffff',
    },
    
    background: {
      default: '#f8faf8',   
      paper: '#ffffff',
    },

       gradients: {

      primary: 'linear-gradient(135deg, #f8faf8 0%, #e8f4f0 50%, #d8f0e8 100%)',
      

      secondary: 'linear-gradient(180deg, #f1f8f4 0%, #e3f2ed 100%)',
      

      hero: 'linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 25%, #95d5b2 50%, #74c69d 75%, #52b788 100%)',
      

      skyToEarth: 'linear-gradient(180deg, #caf0f8 0%, #ade8f4 25%, #d8f3dc 75%, #b7e4c7 100%)',
      

      radial: 'radial-gradient(circle at top right, #f1f8f4 0%, #ffffff 60%)',
      

      darkForest: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
    },
    
    text: {
      primary: '#1b4332',   
      secondary: '#52796f', 
      disabled: '#95a99a',
    },
    
    divider: '#d8e2dc',
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      color: '#1b4332',
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#1b4332',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#1b4332',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#1b4332',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#1b4332',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#1b4332',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#1b4332',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#52796f',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  
  shape: {
    borderRadius: 8,
  },
  
  shadows: [
    'none',
    '0px 2px 4px rgba(27, 67, 50, 0.08)',
    '0px 4px 8px rgba(27, 67, 50, 0.12)',
    '0px 6px 12px rgba(27, 67, 50, 0.14)',
    '0px 8px 16px rgba(27, 67, 50, 0.16)',
    '0px 10px 20px rgba(27, 67, 50, 0.18)',
    '0px 12px 24px rgba(27, 67, 50, 0.20)',
    '0px 14px 28px rgba(27, 67, 50, 0.22)',
    '0px 16px 32px rgba(27, 67, 50, 0.24)',
    '0px 18px 36px rgba(27, 67, 50, 0.26)',
    '0px 20px 40px rgba(27, 67, 50, 0.28)',
    '0px 22px 44px rgba(27, 67, 50, 0.30)',
    '0px 24px 48px rgba(27, 67, 50, 0.32)',
  ],
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(27, 67, 50, 0.16)',
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(27, 67, 50, 0.08)',
        },
        elevation2: {
          boxShadow: '0px 4px 8px rgba(27, 67, 50, 0.12)',
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(27, 67, 50, 0.12)',
        },
      },
    },
    
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #2d6a4f',
            outlineOffset: '2px',
          },
        },
      },
    },
  },
});
