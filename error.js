import React, { useState, useRef, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Typography,
  Alert
} from '@mui/material';

export default function FormWithAutofocus() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Create refs for each input
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  
  // Map field names to refs
  const fieldRefs = {
    username: usernameRef,
    email: emailRef,
    password: passwordRef,
    confirmPassword: confirmPasswordRef
  };
  
  // Autofocus first input on mount
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);
  
  // Autofocus first error field when errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      fieldRefs[firstErrorField]?.current?.focus();
    }
  }, [errors]);
  
  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const simulateServerSubmit = async (data) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate server-side validation errors
    const serverErrors = {};
    
    if (data.username.length < 3) {
      serverErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!data.email.includes('@')) {
      serverErrors.email = 'Please enter a valid email address';
    }
    
    if (data.password.length < 6) {
      serverErrors.password = 'Password must be at least 6 characters';
    }
    
    if (data.password !== data.confirmPassword) {
      serverErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(serverErrors).length > 0) {
      throw { errors: serverErrors };
    }
    
    return { success: true };
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setSubmitSuccess(false);
    
    try {
      await simulateServerSubmit(formData);
      setSubmitSuccess(true);
      // Reset form on success
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      // Server returns errors as { errors: { fieldName: errorMessage } }
      if (error.errors) {
        setErrors(error.errors);
      }
    }
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: '#f5f5f5',
      p: 2
    }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Registration Form
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This form demonstrates autofocus on first render and on first error field
        </Typography>
        
        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Form submitted successfully!
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange('username')}
            error={!!errors.username}
            helperText={errors.username}
            margin="normal"
            inputRef={usernameRef}
            required
          />
          
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            inputRef={emailRef}
            required
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            inputRef={passwordRef}
            required
          />
          
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            margin="normal"
            inputRef={confirmPasswordRef}
            required
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            size="large"
          >
            Submit
          </Button>
        </form>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Try submitting with invalid data to see error autofocus in action
        </Typography>
      </Paper>
    </Box>
  );
}
