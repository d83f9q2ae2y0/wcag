import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

/*
  RGAA corrections:
  - Ajout d'attribut name sur chaque input (critère 11.13 / identification finalité).
  - Ajout d'attribut autoComplete pour identifier la finalité (critère 11.13).
  - Assurance d'un indicateur de focus visible via sx (critère WCAG 2.4.7 / RGAA visibilité du focus).
  - Ajout d'un nom accessible pour le formulaire via aria-label (amélioration pour 4.1.2 Name/Role/Value).
*/

export default function StateTextFields() {
  const [name, setName] = React.useState('Cat in the Hat');

  return (
    <Box
      component="form"
      // RGAA 4.1.2 & bonnes pratiques : donner un nom/accessibilité au conteneur formulaire si nécessaire.
      // RGAA 4.1.2 – Critère Name, Role, Value : Ajout d'un nom accessible pour le formulaire.
      aria-label="Formulaire d'exemple : deux champs de saisie"
      sx={{
        '& > :not(style)': { m: 1, width: '25ch' },
        // RGAA 2.4.7 (visibilité du focus) : garantir un indicateur visible même si le thème modifie les outlines.
        // RGAA 2.4.7 : Ajout d'un style de focus-visible ciblant l'input natif rendu par MUI.
        // (on évite de forcer une couleur, on force la présence d'un contour visible)
        '& .MuiInputBase-input:focus-visible': {
          outlineStyle: 'solid',
          outlineWidth: '3px',
          outlineOffset: '2px',
        },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id="outlined-controlled"
        label="Controlled"
        // RGAA 11.1 / 11.13 : ajout de name pour identification du champ (surtout si formulaire soumis)
        name="controlledName"
        // RGAA 11.13 (AA) : indiquer la finalité pour l'autocomplétion (aide aux AT et gestionnaires de mot de passe)
        autoComplete="name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
        }}
        // RGAA 4.1.2 : s'assurer que le label visible correspond au nom accessible (pas d'aria-label différent ici).
        // Pas d'aria-label ajouté ici (on préfère l'association native <label for=id> gérée par MUI)
      />
      <TextField
        id="outlined-uncontrolled"
        label="Uncontrolled"
        name="uncontrolledField" // RGAA 11.1 / 11.13 : ajout de name
        // RGAA 11.13 : indiquer autoComplete si pertinent pour la finalité ; ici on le laisse sur off
        autoComplete="off"
        defaultValue="foo"
      />
    </Box>
  );
}
