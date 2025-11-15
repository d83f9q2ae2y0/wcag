import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';

// --- Visually hidden style (pour labels masqués) ---
const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  width: '1px',
  whiteSpace: 'nowrap',
};

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  // RGAA 10.x : garantir contraste lisible — ici on pose une couleur de fond
  // qui fonctionne avec appbar sombre. Vérifier thème si on en change.
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  // RGAA 6.x - icône décorative : pointerEvents none pour ne pas gêner focus clavier
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function PrimarySearchAppBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  // refs pour restaurer le focus après fermeture de menu (RGAA : gestion du focus)
  const profileButtonRef = React.useRef(null);
  const mobileMenuButtonRef = React.useRef(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    // restore focus to mobile menu button if present
    setMobileMoreAnchorEl(null);
    if (mobileMenuButtonRef.current) {
      // RGAA 4.13.1 — restauration du focus après fermeture
      mobileMenuButtonRef.current.focus();
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // restore focus to profile button for keyboard users
    if (profileButtonRef.current) {
      // RGAA 4.13.1 — restauration du focus après fermeture
      profileButtonRef.current.focus();
    }
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      // RGAA 4.13.1: le menu doit exposer un rôle/état via l'API d'accessibilité (MUI Menu le fait),
      // on garde l'ID et aria-controls/aria-expanded côté déclencheur pour clarté.
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        {/* RGAA 11.9 : fournir un nom accessible pertinent et associé au bouton */}
        <IconButton
          size="large"
          aria-label="Voir les messages — 4 nouveaux messages" // RGAA 11.9 : nom accessible pertinent
          color="inherit"
        >
          <Badge badgeContent={4} color="error" aria-hidden="true">
            {/* aria-hidden parce que le badge visuel est décrit par le aria-label du bouton */}
            <MailIcon />
          </Badge>
        </IconButton>
        {/* RGAA 11.9 : garder un texte visible lisible (Typography) au lieu de <p> */}
        <Typography component="span" variant="inherit">
          Messages
        </Typography>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="Voir les notifications — 17 nouvelles notifications" // RGAA 11.9
          color="inherit"
        >
          <Badge badgeContent={17} color="error" aria-hidden="true">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Typography component="span" variant="inherit">
          Notifications
        </Typography>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          // RGAA 11.9 : nom accessible pertinent
          size="large"
          aria-label="Compte utilisateur — ouvrir le menu du profil"
          aria-controls={menuId}
          aria-haspopup="true"
          aria-expanded={isMenuOpen ? 'true' : 'false'} // RGAA 4.13.1 : état explicite
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <Typography component="span" variant="inherit">
          Profile
        </Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Menu principal (ex : drawer) */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="Ouvrir le menu principal" // RGAA 11.9 : nom accessible
            sx={{
              mr: 2,
              // RGAA 10.7 : assurer visibilité du focus
              '&:focus-visible': {
                outline: '3px solid #FFD54F', // couleur à vérifier selon thème pour contraste
                outlineOffset: '2px',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            MUI
          </Typography>

          {/* Search : on ajoute un label (visible masqué) et un id pour l'input */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon aria-hidden="true" />
            </SearchIconWrapper>

            {/* RGAA 11.1 : ajout d'un label associé pour garantir l'étiquetage */}
            <label htmlFor="primary-search-input" style={visuallyHidden}>
              Rechercher
            </label>

            <StyledInputBase
              id="primary-search-input"
              placeholder="Search…"
              inputProps={{
                'aria-label': 'Rechercher', // RGAA 11.1 : nom accessible cohérent avec le label
              }}
              // RGAA 10.7 : focus visible pour le champ de saisie
              sx={{
                '& .MuiInputBase-input:focus-visible': {
                  outline: '3px solid #FFD54F',
                  outlineOffset: '2px',
                },
              }}
            />
          </Search>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop icons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {/* Mail */}
            <IconButton
              size="large"
              aria-label="Voir les messages — 4 nouveaux messages" // RGAA 11.9 : nom accessible
              color="inherit"
              // focus-visible style
              sx={{
                '&:focus-visible': {
                  outline: '3px solid #FFD54F',
                  outlineOffset: '2px',
                },
              }}
            >
              <Badge badgeContent={4} color="error" aria-hidden="true">
                <MailIcon />
              </Badge>
            </IconButton>

            {/* Notifications */}
            <IconButton
              size="large"
              aria-label="Voir les notifications — 17 nouvelles notifications"
              color="inherit"
              sx={{
                '&:focus-visible': {
                  outline: '3px solid #FFD54F',
                  outlineOffset: '2px',
                },
              }}
            >
              <Badge badgeContent={17} color="error" aria-hidden="true">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profile */}
            <IconButton
              size="large"
              edge="end"
              aria-label="Compte utilisateur — ouvrir le menu du profil" // RGAA 11.9
              aria-controls={menuId}
              aria-haspopup="menu" // RGAA 4.13.1: préciser le type d'ouvreur
              aria-expanded={isMenuOpen ? 'true' : 'false'} // RGAA 4.13.1 : état explicite
              onClick={handleProfileMenuOpen}
              color="inherit"
              ref={profileButtonRef} // RGAA: pour restauration du focus
              sx={{
                '&:focus-visible': {
                  outline: '3px solid #FFD54F',
                  outlineOffset: '2px',
                },
              }}
            >
              <AccountCircle />
            </IconButton>
          </Box>

          {/* Mobile more button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="Afficher plus d’options" // RGAA 11.9 : nom accessible
              aria-controls={mobileMenuId}
              aria-haspopup="menu"
              aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
              onClick={handleMobileMenuOpen}
              color="inherit"
              ref={mobileMenuButtonRef}
              sx={{
                '&:focus-visible': {
                  outline: '3px solid #FFD54F',
                  outlineOffset: '2px',
                },
              }}
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Render mobile and profile menus */}
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}
