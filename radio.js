import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function ControlledRadioButtonsGroup() {
  const [value, setValue] = React.useState('female');

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    // RGAA 3.3 : use native fieldset for proper grouping semantics
    <FormControl component="fieldset">
      {/* RGAA 3.3 : render FormLabel as a legend for semantic correctness */}
      <FormLabel component="legend" id="gender-group-legend">
        Genre {/* RGAA 8.3 : respecter la langue du document */}
      </FormLabel>

      <RadioGroup
        aria-labelledby="gender-group-legend" // RGAA 3.1 : association explicite du label
        name="controlled-radio-buttons-group"
        value={value}
        onChange={handleChange}
        // RGAA 10.7 : garantir un focus visible (ajout d’une classe dédiée si besoin thème)
        sx={{
          '& .Mui-checked + .MuiFormControlLabel-label': {
            fontWeight: 'bold', // amélioration perceptible
          },
          '& .MuiRadio-root:focus-visible': {
            outline: '2px solid #000', // focus visible AA
            outlineOffset: '2px',
          },
        }}
      >
        <FormControlLabel
          value="female"
          // RGAA 3.2 : libellé en français
          control={<Radio />}
          label="Femme"
        />
        <FormControlLabel
          value="male"
          // RGAA 3.2 : libellé en français
          control={<Radio />}
          label="Homme"
        />
      </RadioGroup>
    </FormControl>
  );
}
