import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Divider,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { createSlice, configureStore } from '@reduxjs/toolkit';

const basketSlice = createSlice({
  name: 'basket',
  initialState: {
    items: [],
    priceChanges: []
  },
  reducers: {
    setBasket: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('basket', JSON.stringify(action.payload));
    },
    addItem: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      localStorage.setItem('basket', JSON.stringify(state.items));
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('basket', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.id !== action.payload.id);
        }
      }
      localStorage.setItem('basket', JSON.stringify(state.items));
    },
    updatePrices: (state, action) => {
      const changes = [];
      state.items = state.items.map(item => {
        const updatedItem = action.payload.find(p => p.id === item.id);
        if (updatedItem && updatedItem.price !== item.price) {
          changes.push({
            id: item.id,
            name: item.name,
            oldPrice: item.price,
            newPrice: updatedItem.price
          });
          return { ...item, price: updatedItem.price };
        }
        return item;
      });
      state.priceChanges = changes;
      localStorage.setItem('basket', JSON.stringify(state.items));
    },
    clearPriceChanges: (state) => {
      state.priceChanges = [];
    }
  }
});

const { setBasket, addItem, removeItem, updateQuantity, updatePrices, clearPriceChanges } = basketSlice.actions;

const store = configureStore({
  reducer: {
    basket: basketSlice.reducer
  }
});

const mockFetchPrices = async (itemIds) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return itemIds.map(id => ({
    id,
    price: Math.random() > 0.5 ? 29.99 + Math.floor(Math.random() * 50) : 29.99
  }));
};

function PriceChangeAlert() {
  const dispatch = useDispatch();
  const priceChanges = useSelector(state => state.basket.priceChanges);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (priceChanges.length > 0) {
      setOpen(true);
    }
  }, [priceChanges]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      dispatch(clearPriceChanges());
    }, 300);
  };

  if (priceChanges.length === 0) return null;

  const totalDifference = priceChanges.reduce((sum, change) => 
    sum + (change.newPrice - change.oldPrice), 0
  );

  return (
    <Collapse in={open}>
      <Alert 
        severity={totalDifference > 0 ? "warning" : "success"}
        sx={{ mb: 3 }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Price Updates Detected
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Some items in your basket have changed in price:
        </Typography>
        <List dense disablePadding>
          {priceChanges.map((change) => (
            <ListItem key={change.id} disablePadding sx={{ py: 0.5 }}>
              <ListItemText
                primary={change.name}
                secondary={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                    >
                      ${change.oldPrice.toFixed(2)}
                    </Typography>
                    <Typography component="span" variant="body2">
                      →
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      fontWeight="bold"
                      color={change.newPrice > change.oldPrice ? 'error.main' : 'success.main'}
                    >
                      ${change.newPrice.toFixed(2)}
                    </Typography>
                    <Chip
                      label={`${change.newPrice > change.oldPrice ? '+' : ''}$${(change.newPrice - change.oldPrice).toFixed(2)}`}
                      size="small"
                      color={change.newPrice > change.oldPrice ? 'error' : 'success'}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        {totalDifference !== 0 && (
          <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
            Total difference: {totalDifference > 0 ? '+' : ''}${totalDifference.toFixed(2)}
          </Typography>
        )}
      </Alert>
    </Collapse>
  );
}

function BasketItem({ item }) {
  const dispatch = useDispatch();

  const handleIncrease = () => {
    dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
  };

  const handleDecrease = () => {
    dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
  };

  const handleRemove = () => {
    dispatch(removeItem(item.id));
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{item.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {item.id}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
              ${item.price.toFixed(2)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={handleDecrease} color="primary">
                <RemoveIcon />
              </IconButton>
              <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                {item.quantity}
              </Typography>
              <IconButton size="small" onClick={handleIncrease} color="primary">
                <AddIcon />
              </IconButton>
            </Box>
            
            <IconButton onClick={handleRemove} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Subtotal:
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            ${(item.price * item.quantity).toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Basket() {
  const dispatch = useDispatch();
  const items = useSelector(state => state.basket.items);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedBasket = localStorage.getItem('basket');
    if (storedBasket) {
      const parsed = JSON.parse(storedBasket);
      dispatch(setBasket(parsed));
      
      if (parsed.length > 0) {
        const itemIds = parsed.map(item => item.id);
        mockFetchPrices(itemIds).then(updatedPrices => {
          dispatch(updatePrices(updatedPrices));
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddSampleItem = () => {
    const sampleItem = {
      id: `item-${Date.now()}`,
      name: `Product ${Math.floor(Math.random() * 100)}`,
      price: 29.99 + Math.floor(Math.random() * 50)
    };
    dispatch(addItem(sampleItem));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading basket...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ShoppingCartIcon fontSize="large" color="primary" />
        <Typography variant="h4" component="h1">
          Shopping Basket
        </Typography>
        <Chip label={`${totalItems} items`} color="primary" />
      </Box>

      <PriceChangeAlert />

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your basket is empty
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleAddSampleItem}
            sx={{ mt: 2 }}
          >
            Add Sample Item
          </Button>
        </Paper>
      ) : (
        <>
          {items.map(item => (
            <BasketItem key={item.id} item={item} />
          ))}

          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                ${total.toFixed(2)}
              </Typography>
            </Box>
            <Button variant="contained" fullWidth size="large">
              Proceed to Checkout
            </Button>
          </Paper>

          <Button 
            variant="outlined" 
            onClick={handleAddSampleItem}
            sx={{ mt: 2 }}
            fullWidth
          >
            Add Another Sample Item
          </Button>
        </>
      )}
    </Box>
  );
}
