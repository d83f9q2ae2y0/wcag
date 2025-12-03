import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip
} from '@mui/material';
import {
  Folder,
  InsertDriveFile,
  NavigateNext,
  Storage,
  ArrowBack,
  FolderOpen
} from '@mui/icons-material';

export default function FileExplorer() {
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [pathHistory, setPathHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (path) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'directory') {
      setPathHistory([...pathHistory, currentPath]);
      setCurrentPath(item.path);
    }
  };

  const handleBack = () => {
    if (pathHistory.length > 0) {
      const newHistory = [...pathHistory];
      const previousPath = newHistory.pop();
      setPathHistory(newHistory);
      setCurrentPath(previousPath);
    }
  };

  const handleRootClick = () => {
    setCurrentPath('');
    setPathHistory([]);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Storage color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight="bold">
              File Explorer
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
              <Link
                component="button"
                underline="hover"
                color="inherit"
                onClick={handleRootClick}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <Storage fontSize="small" />
                Root
              </Link>
              {currentPath && (
                <Typography color="text.primary">{currentPath}</Typography>
              )}
            </Breadcrumbs>
            
            {pathHistory.length > 0 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<ArrowBack />}
                onClick={handleBack}
              >
                Back
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          )}

          {error && (
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {!loading && !error && items.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <FolderOpen sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">
                This directory is empty
              </Typography>
            </Box>
          )}

          {!loading && !error && items.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Modified</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow
                      key={index}
                      hover
                      onClick={() => handleItemClick(item)}
                      sx={{
                        cursor: item.type === 'directory' ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: item.type === 'directory' ? 'action.hover' : 'inherit'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.type === 'directory' ? (
                            <Folder color="primary" />
                          ) : (
                            <InsertDriveFile color="action" />
                          )}
                          <Typography fontWeight="medium">{item.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.type}
                          size="small"
                          color={item.type === 'directory' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(item.size)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(item.modified)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

// src/Controller/FileExplorerController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Finder\Finder;

class FileExplorerController extends AbstractController
{
    #[Route('/api/files', name: 'api_files', methods: ['GET'])]
    public function getFiles(Request $request): JsonResponse
    {
        // Define your base path - adjust this to your Windows server path
        $basePath = 'C:\\your\\server\\path';
        
        // Get the requested path from query parameter (optional, for subdirectories)
        $requestedPath = $request->query->get('path', '');
        
        // Construct the full path
        $fullPath = $basePath . DIRECTORY_SEPARATOR . $requestedPath;
        
        // Security: Prevent directory traversal
        $realBasePath = realpath($basePath);
        $realFullPath = realpath($fullPath);
        
        if (!$realFullPath || strpos($realFullPath, $realBasePath) !== 0) {
            return $this->json(['error' => 'Invalid path'], 403);
        }
        
        if (!is_dir($realFullPath)) {
            return $this->json(['error' => 'Directory not found'], 404);
        }
        
        $finder = new Finder();
        $finder->in($realFullPath)->depth('== 0');
        
        $items = [];
        
        foreach ($finder as $file) {
            $items[] = [
                'name' => $file->getFilename(),
                'type' => $file->isDir() ? 'directory' : 'file',
                'size' => $file->isFile() ? $file->getSize() : null,
                'path' => str_replace($basePath . DIRECTORY_SEPARATOR, '', $file->getRealPath()),
                'modified' => $file->getMTime(),
            ];
        }
        
        // Sort: directories first, then files
        usort($items, function($a, $b) {
            if ($a['type'] === $b['type']) {
                return strcasecmp($a['name'], $b['name']);
            }
            return $a['type'] === 'directory' ? -1 : 1;
        });
        
        return $this->json([
            'path' => $requestedPath,
            'items' => $items
        ]);
    }
}
