import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Typography
} from '@mui/material';

// Sample data for different tables
const usersData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
];

const productsData = [
  { id: 1, name: 'Laptop', price: '$999', stock: 15 },
  { id: 2, name: 'Mouse', price: '$29', stock: 150 },
  { id: 3, name: 'Keyboard', price: '$79', stock: 85 },
];

const ordersData = [
  { id: 1, customer: 'Alice Brown', total: '$1,299', status: 'Delivered' },
  { id: 2, customer: 'Charlie Davis', total: '$549', status: 'Pending' },
  { id: 3, customer: 'Diana Wilson', total: '$2,100', status: 'Shipped' },
];

// Users Table Component
const UsersTable = () => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {usersData.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Products Table Component
const ProductsTable = () => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Product Name</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Stock</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {productsData.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.price}</TableCell>
            <TableCell>{row.stock}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Orders Table Component
const OrdersTable = () => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Order ID</TableCell>
          <TableCell>Customer</TableCell>
          <TableCell>Total</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ordersData.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.customer}</TableCell>
            <TableCell>{row.total}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Skeleton Loader Component
const TableSkeleton = () => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          {[1, 2, 3, 4].map((i) => (
            <TableCell key={i}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {[1, 2, 3].map((row) => (
          <TableRow key={row}>
            {[1, 2, 3, 4].map((cell) => (
              <TableCell key={cell}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Main Tabbed Component
const TabbedTables = () => {
  const [currentPath, setCurrentPath] = useState('/users');
  const [loading, setLoading] = useState(false);

  // Simulate loading when tab changes
  const handleTabChange = (event, newPath) => {
    setLoading(true);
    setCurrentPath(newPath);
    
    // Update URL without page reload
    window.history.pushState({}, '', newPath);
    
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  // Initialize from current URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/products' || path === '/orders') {
      setCurrentPath(path);
    }
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentPath} onChange={handleTabChange}>
          <Tab label="Users" value="/users" />
          <Tab label="Products" value="/products" />
          <Tab label="Orders" value="/orders" />
        </Tabs>
      </Box>

      <Box>
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            {currentPath === '/users' && <UsersTable />}
            {currentPath === '/products' && <ProductsTable />}
            {currentPath === '/orders' && <OrdersTable />}
          </>
        )}
      </Box>
    </Box>
  );
};

export default TabbedTables;
