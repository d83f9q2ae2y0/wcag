// AccessiblePanel.jsx
import React from "react";
import { Box, Container, Paper, Typography, Link as MUILink, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

/**
 * Composant : AccessiblePanel
 * Objectif : démonstration d'un composant MUI conforme RGAA 4.1.2 niveau AA
 *
 * Remarques :
 * - Inclut lien d'évitement (skip link)
 * - Utilise titres sémantiques (<h2>) et associations aria
 * - Gère visibilité du focus
 * - Fournit noms accessibles pour les liens/icônes
 * - Assure que les icônes décoratives sont aria-hidden
 */

export default function AccessiblePanel() {
  return (
    <>
      {/* RGAA 10.1 / 2.4.1 : Ajout d'un lien d'évitement (skip link) visible au focus */}
      <a
        href="#main-content"
        className="sr-only-focusable"
        style={{
          // style minimal pour rendre visible au focus (voir RGAA : lien d'évitement visible au focus)
          position: "absolute",
          left: -9999,
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
        onFocus={(e) => {
          // quand le lien reçoit le focus, on le rend visible (utile pour clavier)
          const el = e.currentTarget;
          el.style.left = "1rem";
          el.style.top = "1rem";
          el.style.width = "auto";
          el.style.height = "auto";
          el.style.padding = "0.5rem 1rem";
          el.style.background = "#fff";
          el.style.zIndex = 1000;
        }}
        onBlur={(e) => {
          const el = e.currentTarget;
          el.style.left = "-9999px";
        }}
      >
        Accéder au contenu
      </a>

      <Container maxWidth="md" component="main" id="main-content" aria-labelledby="panel-title">
        {/* RGAA 9.1 : Titre sémantique et balisage <h2> pour la hiérarchie (adapter le niveau selon la page) */}
        {/* RGAA 9.1 – Critère 9.1 : Ajout d'un titre avec id pour association aria-labelledby */}
        <Typography id="panel-title" component="h2" variant="h4" sx={{ mt: 4, mb: 2 }}>
          Titre du panneau accessible
        </Typography>

        {/* Paper utilisé comme région ; on ajoute role et aria-labelledby pour rendre explicite la région */}
        {/* RGAA 4.13.1 & 9.1 : region accessible via role="region" et aria-labelledby */}
        <Paper
          elevation={2}
          role="region"
          aria-labelledby="panel-title"
          sx={{
            p: 3,
            // RGAA 9.2.4.7 - Visibilité du focus : ne pas enlever outline natif, et ajouter style visible pour le focus
            // RGAA 9.2.4.7 : On s'assure que les éléments focusables à l'intérieur ont un style visible
            "& a, & button": {
              // forcer visibilité du focus si l'outline est modifié globalement
              "&:focus": {
                outline: "3px solid",
                outlineColor: (theme) => theme.palette.primary.main,
                outlineOffset: "2px",
                // outline must be clearly visible (contraste) -> vérifier avec ton thème
              },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography component="p" variant="body1">
              Contenu du composant. Ce texte est lisible et utilise une balise p.
            </Typography>

            {/* Exemple d'icône bouton utilisé comme action : nom accessible requis */}
            {/* RGAA 7.1 / 6.1 : Ajout d'un aria-label descriptif */}
            <IconButton
              aria-label="Ouvrir le menu du panneau"
              title="Ouvrir le menu du panneau"
              // Le rôle button est implicite sur IconButton ; aria-label explicite pour lecteur d'écran
              size="large"
            >
              <MenuIcon aria-hidden="true" />
            </IconButton>
          </Box>

          <Box sx={{ mt: 2 }}>
            {/* Lien de navigation principal : utilise MUI Link avec component RouterLink */}
            {/* RGAA 7.1 : le lien doit avoir un nom explicite (ici texte visible), et MUI Link est associé à RouterLink */}
            <MUILink
              component={RouterLink}
              to="/detail"
              underline="hover"
              // RGAA 9.2.4.7 : S'assurer que le lien est keyboard-focusable (par défaut il l'est)
              sx={{
                // Ne pas supprimer l'indicateur de focus natif : on ajoute un style visible si l'on customise
                "&:focus": {
                  outline: "3px solid",
                  outlineColor: (theme) => theme.palette.primary.main,
                  outlineOffset: "2px",
                },
              }}
            >
              Voir le détail
            </MUILink>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
