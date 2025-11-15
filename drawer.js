// Composant corrigé : TemporaryDrawer.accessible.jsx
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

export default function TemporaryDrawer() {
  const [open, setOpen] = React.useState(false);

  // Réfs pour gestion du focus (restauration et déplacement)
  const triggerRef = React.useRef(null); // bouton qui ouvre le drawer
  const firstItemRef = React.useRef(null); // premier élément focusable dans le drawer
  const drawerId = 'primary-navigation-drawer'; // id utilisé par aria-controls

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // Déplacement du focus à l'ouverture et restauration à la fermeture
  React.useEffect(() => {
    if (open) {
      // Une fois ouvert, déplacer le focus sur le premier élément focusable du drawer
      // RGAA 7.3.2 / 10.13 : gestion du focus pour contenus additionnels/modaux
      // RGAA 4.13.1 : rendre l'état accessible via API (aria-* géré ailleurs)
      const timer = window.setTimeout(() => {
        if (firstItemRef.current) {
          firstItemRef.current.focus();
        }
      }, 0);
      return () => window.clearTimeout(timer);
    } else {
      // À la fermeture, restaurer le focus sur le bouton déclencheur
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    }
  }, [open]);

  // Handler clavier supplémentaire : s'assurer que Escape ferme et restaure focus
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      // la restauration du focus est faite dans l'effet useEffect qui suit la mise à jour d'état
    }
  };

  const DrawerList = (
    // RGAA 9.2 / 4.13.1 : utilisation d'une region de navigation (nav role/navigation)
    // Ajout d'aria-label pour nom accessible du landmark
    <Box
      sx={{ width: 250 }}
      // Remarques :
      // - On n'utilise plus role="presentation" pour la racine du drawer afin que la région soit repérable.
      // - La gestion de hide/show pour AT est assurée par le Drawer (MUI le masque) ; on complète avec aria-modal si nécessaire.
      component="nav"
      role="navigation" // RGAA 9.2 : landmark de navigation
      aria-label="Navigation principale" // nom accessible pour la zone nav
      id={drawerId}
      onKeyDown={handleKeyDown}
    >
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              // RGAA 10.7 : assurer visibilité du focus par une règle sx plus bas
              // Le premier élément obtient la ref pour focus programmatique (restauration)
              ref={index === 0 ? firstItemRef : null}
              // role et keyboard handling sont fournis par MUI ListItemButton (activable au clavier)
            >
              <ListItemIcon>
                {/* RGAA 1.1 / 4.13.1 : icônes décoratives marquées aria-hidden */}
                <span aria-hidden="true">
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </span>
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {/* icône décorative */}
                <span aria-hidden="true">
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </span>
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      {/* RGAA 4.13.1 : bouton possède un nom visible ("Open drawer") donc lect. d'écran le liront.
          - Ajout d'aria-expanded pour indiquer l'état ouvert/fermé.
          - Ajout d'aria-controls relié à l'id du drawer (drawerId).
          - On conserve la réf du bouton pour restaurer le focus à la fermeture.
          // RGAA 4.1.2 – Critère 4.13.1 : exposition des états via API d'accessibilité */}
      <Button
        onClick={toggleDrawer(true)}
        aria-expanded={open} // RGAA 4.13.1 : état exposé
        aria-controls={drawerId} // RGAA recommandation : associer bouton au panneau contrôlé
        ref={triggerRef}
        // S'assurer que le focus du bouton reste visible (n'altère pas le style natif)
        sx={{
          // RGAA 10.7 : si on personnalise le focus, il doit être visible — on s'assure d'un outline net
          '&:focus-visible': {
            outline: '3px solid rgba(25,118,210,0.6)',
            outlineOffset: '2px',
          },
        }}
      >
        Open drawer
      </Button>

      {/* Drawer : on force variant="temporary" (modal) et on expose aria-modal si l'overlay masque le reste */}
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        variant="temporary" // comportement modal/temporare
        ModalProps={{
          // RGAA 10.13 / modal guidance : déclarer aria-modal via PaperProps/ModalProps pour indiquer modalité
          keepMounted: true,
          // Note : MUI gère l'overlay et la gestion du focus par défaut, mais on complète avec aria-hidden géré automatiquement.
        }}
        PaperProps={{
          // RGAA 9.2 : donner un rôle adapté au conteneur principal. Ici on affiche un landmark <nav> dans DrawerList,
          // Paper contient le panneau visuel ; on s'assure simplement qu'il n'écrase pas la sémantique.
          // On ajoute un style pour visibilité du focus sur éléments enfants si nécessaire
          sx: {
            '& :focus-visible': {
              outline: '3px solid rgba(25,118,210,0.6)',
              outlineOffset: '2px',
            },
          },
        }}
        // Avertissement : on laisse MUI gérer l'accessibilité de l'overlay (tab trap). Si besoin, on peut ajouter aria-modal.
        // Si le drawer doit impérativement être traité comme une dialog/modale (empêcher vocalisation du fond),
        // on peut aussi ajouter role="dialog" et aria-modal="true" sur PaperProps. Ici c'est une nav sliding panel,
        // on préfère role navigation (DrawerList) et laisser Drawer gérer le trap.
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}
