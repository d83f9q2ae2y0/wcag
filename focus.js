import React, { useState, useRef, forwardRef } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Button,
  FormHelperText,
  Paper,
  Typography
} from '@mui/material';
import axios from 'axios';

const CustomTextField = forwardRef(({ 
  label, 
  error, 
  helperText, 
  required,
  ...props 
}, ref) => {
  return (
    <TextField
      {...props}
      label={label}
      error={error}
      helperText={helperText}
      margin="normal"
      inputRef={ref}
      required={required}
    />
  );
});

CustomTextField.displayName = 'CustomTextField';

const CustomAutocomplete = forwardRef(({ 
  options, 
  value, 
  onChange, 
  label, 
  error, 
  helperText, 
  required,
  ...props 
}, ref) => {
  return (
    <Autocomplete
      fullWidth
      options={options}
      getOptionLabel={(option) => option.label || ''}
      value={value}
      onChange={onChange}
      isOptionEqualToValue={(option, value) => option.value === value?.value}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          required={required}
          ref={ref}
        />
      )}
      {...props}
    />
  );
});

CustomAutocomplete.displayName = 'CustomAutocomplete';

const FormComponent = () => {
  const [formData, setFormData] = useState({
    textField: '',
    autocomplete: null,
    customAutocomplete: null,
    checkbox: false,
    radio: ''
  });

  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});

  const autocompleteOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ];

  const customAutocompleteOptions = [
    { label: 'Custom A', value: 'customA' },
    { label: 'Custom B', value: 'customB' },
    { label: 'Custom C', value: 'customC' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.textField.trim()) {
      newErrors.textField = 'This field is required';
    }

    if (!formData.autocomplete) {
      newErrors.autocomplete = 'Please select an option';
    }

    if (!formData.customAutocomplete) {
      newErrors.customAutocomplete = 'Please select an option';
    }

    if (!formData.radio) {
      newErrors.radio = 'Please select an option';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];
      if (inputRefs.current[firstErrorField]) {
        inputRefs.current[firstErrorField].focus();
      }
      return;
    }

    try {
      const response = await axios.post('/api/submit-form', formData);
      console.log('Success:', response.data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleTextFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAutocompleteChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, autocomplete: newValue }));
    if (errors.autocomplete) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.autocomplete;
        return newErrors;
      });
    }
  };

  const handleCustomAutocompleteChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, customAutocomplete: newValue }));
    if (errors.customAutocomplete) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customAutocomplete;
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({ ...prev, checkbox: e.target.checked }));
  };

  const handleRadioChange = (e) => {
    setFormData(prev => ({ ...prev, radio: e.target.value }));
    if (errors.radio) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.radio;
        return newErrors;
      });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Form Validation Example
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label="Text Field (Required)"
          name="textField"
          value={formData.textField}
          onChange={handleTextFieldChange}
          error={!!errors.textField}
          helperText={errors.textField}
          margin="normal"
          inputRef={(el) => (inputRefs.current.textField = el)}
          required
        />

        <Autocomplete
          fullWidth
          options={autocompleteOptions}
          getOptionLabel={(option) => option.label}
          value={formData.autocomplete}
          onChange={handleAutocompleteChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Autocomplete (Required)"
              error={!!errors.autocomplete}
              helperText={errors.autocomplete}
              margin="normal"
              inputRef={(el) => (inputRefs.current.autocomplete = el)}
              required
            />
          )}
        />

        <CustomAutocomplete
          options={customAutocompleteOptions}
          value={formData.customAutocomplete}
          onChange={handleCustomAutocompleteChange}
          label="Custom Autocomplete (Required)"
          error={!!errors.customAutocomplete}
          helperText={errors.customAutocomplete}
          ref={(el) => (inputRefs.current.customAutocomplete = el)}
          required
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.checkbox}
              onChange={handleCheckboxChange}
              name="checkbox"
            />
          }
          label="Checkbox (Optional)"
          sx={{ mt: 2, display: 'block' }}
        />

        <FormControl error={!!errors.radio} sx={{ mt: 2 }} required>
          <FormLabel>Radio Button (Required)</FormLabel>
          <RadioGroup
            name="radio"
            value={formData.radio}
            onChange={handleRadioChange}
            ref={(el) => (inputRefs.current.radio = el)}
          >
            <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
            <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
            <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
          </RadioGroup>
          {errors.radio && <FormHelperText>{errors.radio}</FormHelperText>}
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Submit
        </Button>
      </Box>
    </Paper>
  );
};

export default FormComponent;
