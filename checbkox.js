import * as React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

// RGAA 4.1.2 – Corrections d’accessibilité appliquées
export default function IndeterminateCheckbox() {
  const [checked, setChecked] = React.useState([true, false]);

  const handleChange1 = (event) => {
    setChecked([event.target.checked, event.target.checked]);
  };

  const handleChange2 = (event) => {
    setChecked([event.target.checked, checked[1]]);
  };

  const handleChange3 = (event) => {
    setChecked([checked[0], event.target.checked]);
  };

  // Description pour lecteurs d’écran sur l’état parent
  const parentDescription = "Cette case contrôle Child 1 et Child 2.";

  return (
    // RGAA – Critère 9.1 : Ajout d’un fieldset pour regrouper les champs
    <fieldset>
      {/* RGAA – Critère 9.1 : legend obligatoire pour nommer le groupe */}
      <legend>Groupe de cases à cocher</legend>

      <FormControlLabel
        label="Parent"
        control={
          <Checkbox
            checked={checked[0] && checked[1]}
            indeterminate={checked[0] !== checked[1]}
            onChange={handleChange1}

            // RGAA 7.1 : Annonce correcte de l’état indéterminé
            aria-checked={
              checked[0] !== checked[1] ? "mixed" : (checked[0] && checked[1] ? "true" : "false")
            }

            // RGAA 7.5 : Décrire la relation parent → enfants
            aria-describedby="parent-desc"

            // RGAA 10.7 : Focus visible explicitement ajouté
            sx={{
              '&:focus-visible': {
                outline: '2px solid black',
                outlineOffset: '2px',
              }
            }}
          />
        }
      />

      {/* RGAA 7.3 / 7.5 : Description supplémentaire pour lecteurs d’écran */}
      <span id="parent-desc" style={{ display: 'none' }}>
        {parentDescription}
      </span>

      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
        <FormControlLabel
          label="Child 1"
          control={
            <Checkbox
              checked={checked[0]}
              onChange={handleChange2}

              // RGAA 10.7 : Focus visible renforcé
              sx={{
                '&:focus-visible': {
                  outline: '2px solid black',
                  outlineOffset: '2px',
                }
              }}
            />
          }
        />
        <FormControlLabel
          label="Child 2"
          control={
            <Checkbox
              checked={checked[1]}
              onChange={handleChange3}

              // RGAA 10.7 : Focus visible renforcé
              sx={{
                '&:focus-visible': {
                  outline: '2px solid black',
                  outlineOffset: '2px',
                }
              }}
            />
          }
        />
      </Box>
    </fieldset>
  );
}
