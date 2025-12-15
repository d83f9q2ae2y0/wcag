import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { debounce } from '@mui/material/utils';

/**
 * CustomAutocomplete Component
 * 
 * A feature-rich wrapper around MUI Autocomplete with async data fetching,
 * loading states, error handling, and extensive customization options.
 * 
 * @example
 * <CustomAutocomplete
 *   label="Select User"
 *   fetchOptions={fetchUsers}
 *   getOptionLabel={(option) => option.name}
 *   renderOption={(props, option) => <li {...props}>{option.name}</li>}
 *   onChange={(event, value) => console.log(value)}
 * />
 */
const CustomAutocomplete = forwardRef((props, ref) => {
  const {
    // Data fetching
    fetchOptions,
    fetchOnMount = true,
    fetchParams = {},
    
    // Autocomplete props
    label,
    placeholder,
    value,
    onChange,
    onInputChange,
    multiple = false,
    freeSolo = false,
    disableClearable = false,
    disabled = false,
    
    // Option customization
    getOptionLabel = (option) => option?.label || option?.name || String(option),
    getOptionValue = (option) => option?.value || option?.id || option,
    isOptionEqualToValue = (option, value) => getOptionValue(option) === getOptionValue(value),
    renderOption,
    renderTags,
    
    // Search configuration
    enableSearch = true,
    searchDebounceMs = 300,
    minSearchLength = 0,
    
    // UI customization
    helperText,
    error = false,
    required = false,
    fullWidth = true,
    size = 'medium',
    variant = 'outlined',
    
    // Loading & Empty states
    loadingText = 'Loading...',
    noOptionsText = 'No options available',
    emptySearchText = 'Type to search...',
    
    // Additional features
    groupBy,
    filterOptions,
    limitTags = -1,
    
    // Callbacks
    onError,
    onLoadComplete,
    
    // Pass-through props
    ...autocompleteProps
  } = props;

  // State management
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [fetchError, setFetchError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Expose input ref to parent component
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    },
    getValue: () => value,
    getOptions: () => options,
    refetch: () => fetchOptionsData()
  }));

  // Fetch options function
  const fetchOptionsData = async (searchQuery = '') => {
    if (!fetchOptions) {
      console.warn('CustomAutocomplete: fetchOptions prop is required for data fetching');
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setFetchError(null);

    try {
      const params = {
        ...fetchParams,
        ...(searchQuery && enableSearch ? { search: searchQuery, q: searchQuery } : {})
      };

      const response = await fetchOptions(params, {
        signal: abortControllerRef.current.signal
      });

      // Handle different response structures
      const data = response?.data?.data || response?.data || response || [];
      
      setOptions(Array.isArray(data) ? data : []);
      setFetchError(null);
      
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
        onLoadComplete?.();
      }
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        // Request was cancelled, ignore
        return;
      }
      
      console.error('CustomAutocomplete fetch error:', error);
      setFetchError(error.message || 'Failed to load options');
      setOptions([]);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedFetch = useRef(
    debounce((searchQuery) => {
      if (!enableSearch) return;
      if (searchQuery.length < minSearchLength) return;
      fetchOptionsData(searchQuery);
    }, searchDebounceMs)
  ).current;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetch.clear();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedFetch]);

  // Initial fetch on mount
  useEffect(() => {
    if (fetchOnMount && fetchOptions) {
      fetchOptionsData();
    }
  }, [fetchOnMount]); // Only run once on mount

  // Handle input change
  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);
    onInputChange?.(event, newInputValue, reason);

    // Trigger search if enabled
    if (enableSearch && reason === 'input') {
      if (newInputValue.length >= minSearchLength) {
        debouncedFetch(newInputValue);
      } else if (newInputValue.length === 0) {
        fetchOptionsData('');
      }
    }
  };

  // Determine what text to show when no options
  const getNoOptionsText = () => {
    if (fetchError) {
      return `Error: ${fetchError}`;
    }
    if (enableSearch && inputValue.length < minSearchLength && minSearchLength > 0) {
      return emptySearchText;
    }
    return noOptionsText;
  };

  // Custom filter to disable client-side filtering when using server-side search
  const customFilterOptions = enableSearch ? (options) => options : filterOptions;

  return (
    <Autocomplete
      {...autocompleteProps}
      options={options}
      value={value}
      onChange={onChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      loading={loading}
      disabled={disabled}
      multiple={multiple}
      freeSolo={freeSolo}
      disableClearable={disableClearable}
      fullWidth={fullWidth}
      size={size}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      groupBy={groupBy}
      filterOptions={customFilterOptions}
      limitTags={limitTags}
      loadingText={loadingText}
      noOptionsText={getNoOptionsText()}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          label={label}
          placeholder={placeholder}
          helperText={fetchError || helperText}
          error={error || !!fetchError}
          required={required}
          variant={variant}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={renderOption || ((props, option) => (
        <Box component="li" {...props} key={getOptionValue(option)}>
          {getOptionLabel(option)}
        </Box>
      ))}
      renderTags={renderTags || (multiple ? (value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={getOptionLabel(option)}
            {...getTagProps({ index })}
            key={getOptionValue(option)}
          />
        )) : undefined
      )}
    />
  );
});

CustomAutocomplete.displayName = 'CustomAutocomplete';

export default CustomAutocomplete;






import React, { useState, useRef } from 'react';
import { Box, Button, Stack, Paper, Typography, Avatar } from '@mui/material';
import axios from 'axios';
import CustomAutocomplete from './CustomAutocomplete';

/**
 * Example Usage of CustomAutocomplete Component
 */
const CustomAutocompleteExample = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  
  const autocompleteRef = useRef(null);

  // Example API call functions
  const fetchUsers = async (params, config) => {
    // Replace with your actual API endpoint
    const response = await axios.get('/api/users', {
      params,
      ...config
    });
    return response;
  };

  const fetchCountries = async (params, config) => {
    // Example: Using a public API
    const response = await axios.get('https://restcountries.com/v3.1/all', config);
    return {
      data: response.data.map(country => ({
        id: country.cca3,
        name: country.name.common,
        flag: country.flags.png,
        population: country.population
      }))
    };
  };

  const fetchTags = async (params, config) => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            { id: 1, name: 'React', color: '#61dafb' },
            { id: 2, name: 'Vue', color: '#42b883' },
            { id: 3, name: 'Angular', color: '#dd0031' },
            { id: 4, name: 'Svelte', color: '#ff3e00' },
          ].filter(tag => 
            !params.search || tag.name.toLowerCase().includes(params.search.toLowerCase())
          )
        });
      }, 500);
    });
  };

  const handleFocusClick = () => {
    autocompleteRef.current?.focus();
  };

  const handleRefetchClick = () => {
    autocompleteRef.current?.refetch();
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        CustomAutocomplete Examples
      </Typography>

      <Stack spacing={4}>
        {/* Example 1: Basic Single Select */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            1. Basic Single Select with Search
          </Typography>
          <CustomAutocomplete
            ref={autocompleteRef}
            label="Select User"
            placeholder="Type to search users..."
            fetchOptions={fetchUsers}
            value={selectedUser}
            onChange={(event, newValue) => setSelectedUser(newValue)}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            enableSearch={true}
            searchDebounceMs={300}
            helperText="Start typing to search for users"
          />
          <Box sx={{ mt: 2 }}>
            <Button onClick={handleFocusClick} variant="outlined" sx={{ mr: 1 }}>
              Focus Input
            </Button>
            <Button onClick={handleRefetchClick} variant="outlined">
              Refetch Data
            </Button>
          </Box>
          {selectedUser && (
            <Typography sx={{ mt: 2 }}>
              Selected: {selectedUser.name}
            </Typography>
          )}
        </Paper>

        {/* Example 2: Multiple Select with Custom Rendering */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            2. Multiple Select with Custom Option Rendering
          </Typography>
          <CustomAutocomplete
            label="Select Countries"
            placeholder="Choose multiple countries..."
            fetchOptions={fetchCountries}
            value={selectedCountries}
            onChange={(event, newValue) => setSelectedCountries(newValue)}
            multiple={true}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            enableSearch={true}
            limitTags={2}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Avatar
                  src={option.flag}
                  alt={option.name}
                  sx={{ width: 24, height: 24 }}
                />
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Population: {option.population.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}
          />
        </Paper>

        {/* Example 3: With Grouping */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            3. Tags with Custom Styling and Grouping
          </Typography>
          <CustomAutocomplete
            label="Select Technology"
            fetchOptions={fetchTags}
            value={selectedTag}
            onChange={(event, newValue) => setSelectedTag(newValue)}
            getOptionLabel={(option) => option.name}
            groupBy={(option) => option.name[0].toUpperCase()}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: option.color
                  }}
                />
                <Typography>{option.name}</Typography>
              </Box>
            )}
            enableSearch={true}
            minSearchLength={0}
          />
        </Paper>

        {/* Example 4: FreeSolo Mode */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            4. FreeSolo Mode (Allow Custom Values)
          </Typography>
          <CustomAutocomplete
            label="Enter or Select Email"
            placeholder="Type an email address..."
            fetchOptions={async () => ({
              data: [
                'john@example.com',
                'jane@example.com',
                'bob@example.com'
              ]
            })}
            freeSolo={true}
            helperText="You can type a custom email or select from suggestions"
          />
        </Paper>

        {/* Example 5: With Error Handling */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            5. With Error Handling
          </Typography>
          <CustomAutocomplete
            label="API with Error"
            fetchOptions={async () => {
              throw new Error('Network error occurred');
            }}
            onError={(error) => {
              console.error('Autocomplete error:', error);
            }}
          />
        </Paper>

        {/* Example 6: Disabled State */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            6. Disabled State
          </Typography>
          <CustomAutocomplete
            label="Disabled Autocomplete"
            fetchOptions={fetchTags}
            disabled={true}
            helperText="This autocomplete is disabled"
          />
        </Paper>

        {/* Example 7: Required Field */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            7. Required Field with Validation
          </Typography>
          <CustomAutocomplete
            label="Required Selection"
            fetchOptions={fetchTags}
            required={true}
            error={selectedTag === null}
            helperText={selectedTag === null ? 'This field is required' : ''}
          />
        </Paper>
      </Stack>
    </Box>
  );
};

export default CustomAutocompleteExample;



# CustomAutocomplete Component

A feature-rich, production-ready wrapper around Material-UI's Autocomplete component with async data fetching, loading states, error handling, and extensive customization options.

## Features

✅ **Async Data Fetching** - Built-in support for API calls with axios  
✅ **Loading States** - Visual feedback during data fetching  
✅ **Search Functionality** - Debounced search with configurable delay  
✅ **Error Handling** - Graceful error states with user feedback  
✅ **Ref Support** - Focus management and imperative methods  
✅ **Custom Rendering** - Full control over option and tag rendering  
✅ **Multiple Selection** - Support for single and multiple values  
✅ **Grouping** - Group options by category  
✅ **FreeSolo Mode** - Allow custom user input  
✅ **Request Cancellation** - Automatic cleanup of pending requests  
✅ **TypeScript Ready** - Easy to add type definitions  
✅ **Accessibility** - Built on MUI's accessible foundation  

## Installation

```bash
npm install @mui/material @emotion/react @emotion/styled axios
```

## Basic Usage

```jsx
import CustomAutocomplete from './CustomAutocomplete';
import axios from 'axios';

const fetchUsers = async (params, config) => {
  const response = await axios.get('/api/users', { params, ...config });
  return response;
};

function MyComponent() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <CustomAutocomplete
      label="Select User"
      fetchOptions={fetchUsers}
      value={selectedUser}
      onChange={(event, newValue) => setSelectedUser(newValue)}
      getOptionLabel={(option) => option.name}
    />
  );
}
```

## Props API

### Data Fetching Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fetchOptions` | `(params, config) => Promise` | - | **Required**. Async function to fetch options. Receives search params and axios config. |
| `fetchOnMount` | `boolean` | `true` | Whether to fetch options when component mounts |
| `fetchParams` | `object` | `{}` | Additional parameters to pass to fetchOptions |

### Value & Change Handlers

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `any` | - | Selected value(s) |
| `onChange` | `(event, value) => void` | - | Callback fired when value changes |
| `onInputChange` | `(event, value, reason) => void` | - | Callback fired when input value changes |
| `multiple` | `boolean` | `false` | If true, allows multiple selections |
| `freeSolo` | `boolean` | `false` | If true, allows custom user input |

### Option Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `getOptionLabel` | `(option) => string` | `(option) => option?.label \|\| option?.name \|\| String(option)` | Returns the label for an option |
| `getOptionValue` | `(option) => any` | `(option) => option?.value \|\| option?.id \|\| option` | Returns the value for an option |
| `isOptionEqualToValue` | `(option, value) => boolean` | Uses `getOptionValue` | Determines if option matches value |
| `renderOption` | `(props, option) => ReactNode` | Default rendering | Custom render function for options |
| `renderTags` | `(value, getTagProps) => ReactNode` | MUI default | Custom render function for selected chips |
| `groupBy` | `(option) => string` | - | Groups options by the returned string |
| `filterOptions` | `(options, state) => options` | - | Custom client-side filtering |

### Search Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableSearch` | `boolean` | `true` | Enable server-side search |
| `searchDebounceMs` | `number` | `300` | Debounce delay for search in milliseconds |
| `minSearchLength` | `number` | `0` | Minimum characters required to trigger search |

### UI Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label text |
| `placeholder` | `string` | - | Input placeholder text |
| `helperText` | `string` | - | Helper text below input |
| `error` | `boolean` | `false` | If true, shows error state |
| `required` | `boolean` | `false` | If true, marks field as required |
| `disabled` | `boolean` | `false` | If true, disables the input |
| `fullWidth` | `boolean` | `true` | If true, takes full width of container |
| `size` | `'small' \| 'medium'` | `'medium'` | Size of the input |
| `variant` | `'outlined' \| 'filled' \| 'standard'` | `'outlined'` | Input variant style |
| `limitTags` | `number` | `-1` | Max tags to show before "+X" (multiple mode) |

### Loading & Empty States

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loadingText` | `string` | `'Loading...'` | Text shown during loading |
| `noOptionsText` | `string` | `'No options available'` | Text shown when no options |
| `emptySearchText` | `string` | `'Type to search...'` | Text shown before min search length |

### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onError` | `(error) => void` | Called when fetch fails |
| `onLoadComplete` | `() => void` | Called after initial load completes |

## Ref Methods

The component exposes several imperative methods via ref:

```jsx
const autocompleteRef = useRef(null);

// Focus the input
autocompleteRef.current.focus();

// Blur the input
autocompleteRef.current.blur();

// Get current value
const value = autocompleteRef.current.getValue();

// Get current options
const options = autocompleteRef.current.getOptions();

// Refetch data
autocompleteRef.current.refetch();
```

## Advanced Examples

### Multiple Selection with Custom Chips

```jsx
<CustomAutocomplete
  label="Select Technologies"
  fetchOptions={fetchTechnologies}
  value={selectedTechs}
  onChange={(e, value) => setSelectedTechs(value)}
  multiple={true}
  limitTags={3}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => (
      <Chip
        label={option.name}
        color="primary"
        size="small"
        {...getTagProps({ index })}
      />
    ))
  }
/>
```

### Custom Option Rendering with Avatar

```jsx
<CustomAutocomplete
  label="Select User"
  fetchOptions={fetchUsers}
  renderOption={(props, option) => (
    <Box component="li" {...props} sx={{ display: 'flex', gap: 2 }}>
      <Avatar src={option.avatar} />
      <Box>
        <Typography variant="body1">{option.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {option.email}
        </Typography>
      </Box>
    </Box>
  )}
/>
```

### With Grouping

```jsx
<CustomAutocomplete
  label="Select City"
  fetchOptions={fetchCities}
  groupBy={(option) => option.country}
  getOptionLabel={(option) => option.city}
/>
```

### Server-Side Search

```jsx
<CustomAutocomplete
  label="Search Products"
  fetchOptions={async (params) => {
    // params.search will contain the search query
    return axios.get('/api/products', { params });
  }}
  enableSearch={true}
  searchDebounceMs={500}
  minSearchLength={2}
  placeholder="Type at least 2 characters to search..."
/>
```

### With Error Handling

```jsx
<CustomAutocomplete
  label="Select Item"
  fetchOptions={fetchItems}
  onError={(error) => {
    console.error('Failed to load items:', error);
    toast.error('Failed to load items. Please try again.');
  }}
/>
```

### FreeSolo Mode (Custom Input)

```jsx
<CustomAutocomplete
  label="Email Address"
  fetchOptions={fetchSuggestedEmails}
  freeSolo={true}
  onChange={(e, value) => {
    // value can be a selected option or custom text
    setEmail(typeof value === 'string' ? value : value?.email);
  }}
/>
```

## Expected API Response Format

The component expects responses in one of these formats:

```javascript
// Format 1: Direct array
{ data: [...] }

// Format 2: Nested data
{ data: { data: [...] } }

// Format 3: Just array (will be wrapped)
[...]
```

## Fetch Function Structure

Your fetch function should follow this pattern:

```javascript
const fetchOptions = async (params, config) => {
  // params contains:
  // - Any custom fetchParams you passed
  // - search: the search query (if enableSearch is true)
  // - q: duplicate of search (for APIs that use 'q')
  
  // config contains:
  // - signal: AbortSignal for request cancellation
  
  const response = await axios.get('/api/endpoint', {
    params,
    ...config // Important: spread config to enable cancellation
  });
  
  return response;
};
```

## Styling

The component inherits all MUI Autocomplete styling capabilities:

```jsx
<CustomAutocomplete
  label="Styled Autocomplete"
  fetchOptions={fetchData}
  sx={{
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
    },
  }}
  // Or use MUI's size and variant props
  size="small"
  variant="filled"
/>
```

## TypeScript Support

To add TypeScript support, create a `.tsx` version:

```typescript
interface Option {
  id: string;
  name: string;
}

interface CustomAutocompleteProps<T> {
  fetchOptions: (params: any, config: any) => Promise<any>;
  value?: T | T[] | null;
  onChange?: (event: any, value: T | T[] | null) => void;
  getOptionLabel?: (option: T) => string;
  // ... other props
}

const CustomAutocomplete = <T,>({
  // implementation
}: CustomAutocompleteProps<T>) => {
  // ...
};
```

## Performance Tips

1. **Memoize fetch functions** to prevent unnecessary re-renders
2. **Use appropriate debounce delay** based on your API
3. **Set minSearchLength** to reduce API calls for short queries
4. **Disable client-side filtering** when using server-side search
5. **Limit initial options** if you have large datasets

## Troubleshooting

### Options not loading
- Check that `fetchOptions` prop is provided
- Verify your API endpoint is correct
- Check browser console for errors
- Ensure `fetchOnMount` is not set to false

### Search not working
- Verify `enableSearch={true}` is set
- Check that your API accepts search parameters
- Ensure `searchDebounceMs` is not too high

### Request cancellation errors
- These are normal and handled automatically
- Check that you're spreading the `config` object in your axios call

