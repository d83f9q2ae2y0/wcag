 #[Route('/api/aaa/duplicate', name: 'api_aaa_duplicate', methods: ['POST'])]
    public function duplicateAAA(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        
        $referenceBBBId = $data['reference'] ?? null;
        $destinationBBBId = $data['destination'] ?? null;
        
        if (!$referenceBBBId || !$destinationBBBId) {
            return $this->json([
                'error' => 'Both reference and destination BBB IDs are required'
            ], 400);
        }
        
        // Verify both BBB entities exist
        $referenceBBB = $em->getRepository(BBB::class)->find($referenceBBBId);
        $destinationBBB = $em->getRepository(BBB::class)->find($destinationBBBId);
        
        if (!$referenceBBB) {
            return $this->json([
                'error' => 'Reference BBB not found'
            ], 404);
        }
        
        if (!$destinationBBB) {
            return $this->json([
                'error' => 'Destination BBB not found'
            ], 404);
        }
        
        // Find all AAA entities that reference the source BBB
        $aaaRepository = $em->getRepository(AAA::class);
        $sourceAAAEntities = $aaaRepository->findBy(['bbb' => $referenceBBB]);
        
        // Remove existing AAA entities for the destination BBB
        $existingDestinationAAA = $aaaRepository->findBy(['bbb' => $destinationBBB]);
        $removedCount = count($existingDestinationAAA);
        
        foreach ($existingDestinationAAA as $existingAAA) {
            $em->remove($existingAAA);
        }
        
        // Flush the removals before creating new entities
        $em->flush();
        
        $createdEntities = [];
        
        foreach ($sourceAAAEntities as $sourceAAA) {
            // Create a new AAA entity
            $newAAA = new AAA();
            
            // Set the destination BBB reference
            $newAAA->setBbb($destinationBBB);
            
            // Copy the CCC reference (assuming it has a getCcc/setCcc method)
            $newAAA->setCcc($sourceAAA->getCcc());
            
            // Copy any other properties you need
            // $newAAA->setSomeProperty($sourceAAA->getSomeProperty());
            
            $em->persist($newAAA);
            $createdEntities[] = $newAAA->getId();
        }
        
        $em->flush();
        
        return $this->json([
            'success' => true,
            'message' => sprintf('Removed %d existing AAA entities and created %d new ones', $removedCount, count($createdEntities)),
            'removed_count' => $removedCount,
            'created_count' => count($createdEntities),
            'created_ids' => $createdEntities
        ]);
    }

import React, { useState, useEffect } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function AAAReplicationComponent() {
  const [bbbEntities, setBbbEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState(null);
  const [destination, setDestination] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBBBEntities();
  }, []);

  const fetchBBBEntities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bbb');
      const data = await response.json();
      setBbbEntities(data);
    } catch (err) {
      setError('Failed to load BBB entities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!reference || !destination) {
      setError('Please select both reference and destination');
      return;
    }

    if (reference.id === destination.id) {
      setError('Reference and destination must be different');
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/aaa/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: reference.id,
          destination: destination.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to duplicate AAA entities');
      }
    } catch (err) {
      setError('An error occurred while duplicating entities');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ContentCopyIcon sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h5" component="h1">
          AAA Entity Replication
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a reference BBB entity to copy from and a destination BBB entity to replicate to.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Autocomplete
            options={bbbEntities}
            getOptionLabel={(option) => option.name || `BBB #${option.id}`}
            value={reference}
            onChange={(event, newValue) => {
              setReference(newValue);
              setError(null);
              setResult(null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Reference (Source)"
                placeholder="Select source BBB entity"
                required
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          <Autocomplete
            options={bbbEntities}
            getOptionLabel={(option) => option.name || `BBB #${option.id}`}
            value={destination}
            onChange={(event, newValue) => {
              setDestination(newValue);
              setError(null);
              setResult(null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Destination (Target)"
                placeholder="Select destination BBB entity"
                required
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!reference || !destination || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <ContentCopyIcon />}
            fullWidth
          >
            {submitting ? 'Replicating...' : 'Replicate AAA Entities'}
          </Button>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {result && (
            <Alert severity="success" onClose={() => setResult(null)}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {result.message}
              </Typography>
              <Typography variant="body2">
                Removed: {result.removed_count} | Created: {result.created_count}
              </Typography>
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
}
