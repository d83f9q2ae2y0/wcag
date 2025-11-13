import { Box, Container, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

/**
 * Composant conforme RGAA 4.1.2 - Niveau AA
 * Utilise Material-UI avec corrections d'accessibilité
 */
function AccessibleComponent() {
  const mainRef = useRef(null);

  // RGAA 4.1.2 – Critère 12.7 : Gestion du focus sur le contenu principal
  useEffect(() => {
    // Optionnel : gérer le focus sur changement de page
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  return (
    <>
      {/* RGAA 4.1.2 – Critère 12.7 : Lien d'évitement pour navigation clavier */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: "-9999px",
          zIndex: 999,
          padding: "1rem",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          textDecoration: "none",
          "&:focus": {
            left: "0",
            top: "0",
          },
        }}
      >
        Aller au contenu principal
      </Box>

      <Container
        maxWidth="lg"
        // RGAA 4.1.2 – Critère 12.6 : Utilisation de balise sémantique
        component="div"
        role="region"
        aria-label="Contenu principal de la page"
      >
        {/* RGAA 4.1.2 – Critère 12.6 : Structure sémantique avec <main> */}
        <Box
          component="main"
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          sx={{
            // RGAA 4.1.2 – Critère 10.7 : Focus visible
            "&:focus": {
              outline: "none", // Le focus est géré par le contenu
            },
          }}
        >
          <Paper
            elevation={3}
            // RGAA 4.1.2 – Critère 12.6 : Rôle sémantique pour section
            component="article"
            role="article"
            aria-labelledby="article-title"
            sx={{
              padding: 3,
              marginTop: 4,
              marginBottom: 4,
              // RGAA 4.1.2 – Critère 3.2 : Contraste suffisant (>4.5:1 pour texte normal)
              backgroundColor: "#ffffff",
              color: "#1a1a1a",
            }}
          >
            <Box>
              {/* RGAA 4.1.2 – Critère 9.1 : Hiérarchie sémantique des titres */}
              <Typography
                variant="h1"
                component="h1"
                id="article-title"
                sx={{
                  fontSize: "2rem",
                  marginBottom: 2,
                  fontWeight: 700,
                  // RGAA 4.1.2 – Critère 3.2 : Contraste AA (>4.5:1)
                  color: "#1a1a1a",
                }}
              >
                Titre principal de la page
              </Typography>

              {/* RGAA 4.1.2 – Critère 9.1 : Respect de la hiérarchie h1 > h2 */}
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: "1.5rem",
                  marginTop: 3,
                  marginBottom: 1.5,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                Sous-titre descriptif
              </Typography>

              {/* RGAA 4.1.2 – Critère 10.4 : Texte lisible et contrasté */}
              <Typography
                variant="body1"
                component="p"
                sx={{
                  marginBottom: 2,
                  lineHeight: 1.6,
                  // RGAA 4.1.2 – Critère 3.2 : Contraste minimum AA
                  color: "#333333",
                }}
              >
                Contenu de la page avec un contraste suffisant pour une
                lisibilité optimale. Le ratio de contraste respecte les
                exigences WCAG 2.1 niveau AA (minimum 4.5:1 pour le texte
                normal).
              </Typography>

              {/* RGAA 4.1.2 – Critère 6.1 : Lien explicite avec contexte clair */}
              <Box
                component={Link}
                to="/contact"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.75rem 1.5rem",
                  marginTop: 2,
                  // RGAA 4.1.2 – Critère 3.2 : Contraste AA pour liens (>3:1)
                  backgroundColor: "#0066cc",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontWeight: 600,
                  // RGAA 4.1.2 – Critère 10.7 : Focus visible et distinct
                  "&:focus": {
                    outline: "3px solid #ffcc00",
                    outlineOffset: "2px",
                  },
                  // RGAA 4.1.2 – Critère 10.7 : État hover visible
                  "&:hover": {
                    backgroundColor: "#0052a3",
                    textDecoration: "underline",
                  },
                  transition: "all 0.2s ease",
                }}
                // RGAA 4.1.2 – Critère 6.1 : Titre explicite pour lecteur d'écran
                aria-label="Accéder à la page de contact"
              >
                Contactez-nous
              </Box>

              {/* RGAA 4.1.2 – Critère 13.3 : Information alternative pour navigation */}
              <Typography
                variant="caption"
                component="p"
                sx={{
                  marginTop: 3,
                  fontSize: "0.875rem",
                  color: "#666666",
                }}
                role="note"
                aria-label="Information complémentaire"
              >
                Pour toute question, utilisez le lien ci-dessus ou contactez
                notre service client par téléphone au 01 23 45 67 89.
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* RGAA 4.1.2 – Critère 12.6 : Footer sémantique */}
        <Box
          component="footer"
          role="contentinfo"
          sx={{
            padding: 2,
            textAlign: "center",
            borderTop: "1px solid #e0e0e0",
            marginTop: 4,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#666666",
              fontSize: "0.875rem",
            }}
          >
            © 2025 - Tous droits réservés
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default AccessibleComponent;
