// basketSlice.js
import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'shopping_basket';
const EXPIRY_HOURS = 1;

// Helper functions for localStorage
const loadState = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    
    const { data, timestamp } = JSON.parse(serialized);
    const now = new Date().getTime();
    const expiryTime = EXPIRY_HOURS * 60 * 60 * 1000;
    
    // Check if data has expired
    if (now - timestamp > expiryTime) {
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    
    return data;
  } catch (err) {
    console.error('Error loading basket state:', err);
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serialized = JSON.stringify({
      data: state,
      timestamp: new Date().getTime()
    });
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Error saving basket state:', err);
  }
};

const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing basket state:', err);
  }
};

// Initial state with persistence
const initialState = loadState() || {
  items: [],
  total: 0
};

const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    editItem: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        Object.assign(item, action.payload.updates);
      }
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    clearBasket: (state) => {
      state.items = [];
      state.total = 0;
      clearState(); // Clear localStorage when manually clearing
    }
  }
});

export const { addItem, removeItem, editItem, clearBasket } = basketSlice.actions;
export default basketSlice.reducer;

// Middleware to save state on every change (except clearBasket)
export const basketPersistenceMiddleware = store => next => action => {
  const result = next(action);
  
  // Don't save if clearing basket (already handled in reducer)
  if (action.type !== 'basket/clearBasket') {
    const state = store.getState();
    saveState(state.basket);
  }
  
  return result;
};

// ============================================
// store.js
// ============================================

import { configureStore } from '@reduxjs/toolkit';
import basketReducer, { basketPersistenceMiddleware } from './basketSlice';

export const store = configureStore({
  reducer: {
    basket: basketReducer,
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(basketPersistenceMiddleware)
});

// ============================================
// Usage Example in Component
// ============================================

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, removeItem, editItem, clearBasket } from './basketSlice';

function ShoppingBasket() {
  const { items, total } = useSelector(state => state.basket);
  const dispatch = useDispatch();

  const handleAddItem = () => {
    dispatch(addItem({
      id: Date.now(),
      name: 'Sample Product',
      price: 29.99,
      quantity: 1
    }));
  };

  const handleRemoveItem = (id) => {
    dispatch(removeItem(id));
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    dispatch(editItem({
      id,
      updates: { quantity: newQuantity }
    }));
  };

  const handleClearBasket = () => {
    dispatch(clearBasket());
  };

  return (
    <div>
      <h2>Shopping Basket</h2>
      <button onClick={handleAddItem}>Add Sample Item</button>
      <button onClick={handleClearBasket}>Clear Basket</button>
      
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name} - ${item.price} x {item.quantity}
            <button onClick={() => handleRemoveItem(item.id)}>Remove</button>
            <input 
              type="number" 
              value={item.quantity}
              onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
            />
          </li>
        ))}
      </ul>
      
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
}
