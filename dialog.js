// AccessibleDialogExample.jsx
import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Slide,
  Container,
  Divider,
  Paper,
  Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Composant d'exemple : Modal accessible avec indicateur de progression et boutons.
 * Les corrections RGAA sont commentées au niveau des lignes modifiées / ajoutées.
 */

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AccessibleDialogExample() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(45); // exemple valeur déterminée
  const triggerRef = useRef(null);
  const titleId = "accessible-dialog-title";
  const descriptionId = "accessible-dialog-description";

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    // preserve keyboard esc closing and backdrop click default behaviour
    setOpen(false);
    // return focus to the trigger button after dialog close
    if (triggerRef.current) triggerRef.current.focus();
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h2" component="h1">
          Exemple de dialogue accessible
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Bouton déclencheur */}
        <Button
          variant="contained"
          onClick={handleOpen}
          ref={triggerRef}
          // RGAA 11.9 : le texte visible sert de nom accessible (privilégier contenu textuel).
        >
          Ouvrir la modale
        </Button>

        {/* DIALOG */}
        <Dialog
          open={open}
          onClose={handleClose}
          TransitionComponent={Transition}
          // RGAA 4.13.1 : liaison du titre pour fournir un nom accessible au dialog.
          aria-labelledby={titleId}
          // RGAA 4.13.1 : liaison de la description pour donner le contexte au lecteur d'écran.
          aria-describedby={descriptionId}
          // MUI gère le trap du focus ; on s'assure que le focus revienne au trigger à la fermeture (handled in handleClose).
          // RGAA 9.2.4.7 / 2.4.7 (Focus visible) : garder le comportement natif de focus.
          fullWidth
          maxWidth="sm"
          // aria-modal implicite pour Dialog MUI (mais on peut l'ajouter explicitement).
          aria-modal="true"
        >
          {/* DIALOG TITLE */}
          <DialogTitle id={titleId} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Titre textuel (sert de nom accessible) */}
            <Typography variant="h6">Titre de la modale</Typography>

            {/* IconButton de fermeture */}
            <IconButton
              onClick={handleClose}
              // RGAA 11.9 : bouton icône doit avoir un nom accessible via aria-label
              aria-label="Fermer la modale"
              // RGAA 2.1.1 (clavier) : IconButton est naturellement focusable
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            {/* description */}
            <Typography id={descriptionId} component="p" tabIndex={-1}>
              Contenu descriptif de la modale : instructions et informations. Ce texte est lié via aria-describedby.
            </Typography>

            <Box sx={{ mt: 2 }}>
              {/* LinearProgress déterminé — expose les attributs ARIA */}
              <Box role="group" aria-label="Progression de l'opération">
                <Typography component="p" sx={{ mb: 1 }}>
                  Avancement : {progress} %
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  // RGAA 4.13.1 : exposer le rôle et les valeurs au lecteur d'écran
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                  // associer une description courte
                  aria-describedby={`${descriptionId} progressbar-desc`}
                  sx={{
                    height: 12,
                    borderRadius: 1,
                    // RGAA 3.2 / 1.4.3 : s'assurer d'un contraste suffisant;
                    // ici on évite couleurs problématiques en laissant MUI ou en choisissant couleurs avec contraste élevé.
                  }}
                />

                <Typography id="progressbar-desc" component="span" sx={{ display: "none" }}>
                  Progression de la tâche indiquant {progress} pour cent.
                </Typography>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions>
            {/* Boutons avec texte (nom accessible) : évite aria-label inutile */}
            <Button onClick={handleClose}>
              Annuler
            </Button>

            <Button
              onClick={() => {
                // action de validation
                // ne pas modifier focus here; fermer la modale et retourner focus au trigger
                setOpen(false);
                if (triggerRef.current) triggerRef.current.focus();
              }}
              variant="contained"
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Styles globaux pour visibilité du focus */}
        <style jsx global>{`
          /* RGAA 2.4.7 : s'assurer que l'indicateur de focus est toujours visible */
          :focus {
            outline: 3px solid #005fcc; /* couleur avec contraste élevé */
            outline-offset: 2px;
          }
          /* Respecter : ne pas supprimer outline sans fournir un remplacement */
        `}</style>
      </Paper>
    </Container>
  );
}
