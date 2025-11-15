import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, SvgIcon } from '@mui/material';

export default function SizeTable() {
  const data = [
    { id: 1, name: 'John Doe', shirtSize: 'M', socksSize: '10-12' },
    { id: 2, name: 'Jane Smith', shirtSize: 'L', socksSize: null },
    { id: 3, name: 'Bob Johnson', shirtSize: null, socksSize: '8-10' },
    { id: 4, name: 'Alice Brown', shirtSize: null, socksSize: null },
    { id: 5, name: 'Charlie Davis', shirtSize: 'S', socksSize: '9-11' },
  ];

  const ShirtIcon = (props) => (
    <SvgIcon {...props}>
      <path d="M20.38 8.53 17.47 6.4 15.95 3l-1.29.67c-.81.42-1.76.42-2.57 0L10.8 3 9.28 6.4 6.37 8.53a1 1 0 0 0-.46.83v11.07a1.54 1.54 0 0 0 1.53 1.54h11.12a1.54 1.54 0 0 0 1.53-1.54V9.36a1 1 0 0 0-.71-.83ZM8.91 19.97V9.12l2.44-1.78.65-2.01c.63.26 1.3.39 1.98.39.68 0 1.35-.13 1.98-.39l.65 2.01 2.44 1.78v10.85H8.91Z"/>
    </SvgIcon>
  );

  const SocksIcon = (props) => (
    <SvgIcon {...props}>
      <path d="M8 2h8v10.24l-2.88 2.88c-.39.39-.39 1.02 0 1.41l4.16 4.16a3 3 0 0 1-4.24 4.24L6.87 18.76a3 3 0 0 1 0-4.24l4.16-4.16c.39-.39.39-1.02 0-1.41L8 6V2Z"/>
      <path d="M7 10h1"/>
      <path d="M7 14h1"/>
      <path d="M12 10h1"/>
      <path d="M12 14h1"/>
    </SvgIcon>
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Sizes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {row.shirtSize && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ShirtIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2">{row.shirtSize}</Typography>
                    </Box>
                  )}
                  {row.socksSize && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SocksIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2">{row.socksSize}</Typography>
                    </Box>
                  )}
                  {!row.shirtSize && !row.socksSize && (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
