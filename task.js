import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Single Responsibility: Handles priority color mapping only
const PRIORITY_COLORS = {
  high: 'error',
  medium: 'warning',
  low: 'info'
};

// Single Responsibility: Formats date strings
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Single Responsibility: Formats plural text
const pluralize = (count, singular, plural) => {
  return count > 1 ? plural : singular;
};

// Single Responsibility: Renders a single task item
const TaskItem = ({ alert, onClick }) => (
  <ListItemButton
    onClick={onClick}
    sx={{
      py: 2,
      px: 3,
      '&:hover': {
        bgcolor: 'action.hover',
        '& .open-icon': { opacity: 1 }
      }
    }}
  >
    <ListItemText
      primary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="body1" fontWeight={500} sx={{ flex: 1 }}>
            {alert.title}
          </Typography>
          <OpenInNewIcon
            className="open-icon"
            sx={{
              fontSize: 18,
              color: 'text.secondary',
              opacity: 0,
              transition: 'opacity 0.2s'
            }}
          />
        </Box>
      }
      secondary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Chip
            label={`${alert.daysRemaining} ${pluralize(alert.daysRemaining, 'jour', 'jours')}`}
            size="small"
            color={PRIORITY_COLORS[alert.priority] || 'default'}
            sx={{ height: 22, fontSize: '0.75rem', fontWeight: 500 }}
          />
          <Typography variant="caption" color="text.secondary">
            Échéance : {formatDate(alert.dueDate)}
          </Typography>
        </Box>
      }
    />
  </ListItemButton>
);

// Single Responsibility: Renders the dialog header
const DialogHeader = ({ alertCount, onClose }) => (
  <DialogTitle
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      pb: 2,
      pt: 3,
      px: 3
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <AccessTimeIcon color="primary" sx={{ fontSize: 28 }} />
      <Typography variant="h6" component="div" fontWeight={600}>
        Tâches à échéance proche
      </Typography>
    </Box>
    <IconButton
      onClick={onClose}
      size="small"
      sx={{
        color: 'text.secondary',
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
);

// Main component: Orchestrates dialog structure
const TaskAlertDialog = ({ open, onClose, alerts }) => {
  const handleTaskClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: 24 }
      }}
    >
      <DialogHeader alertCount={alerts.length} onClose={onClose} />
      <DialogContent sx={{ px: 0, pt: 0, pb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 2 }}>
          {alerts.length} {pluralize(alerts.length, 'tâche', 'tâches')}{' '}
          {pluralize(alerts.length, 'nécessite', 'nécessitent')} votre attention
        </Typography>
        <List sx={{ py: 0 }}>
          {alerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              {index > 0 && <Divider component="li" />}
              <TaskItem
                alert={alert}
                onClick={() => handleTaskClick(alert.url)}
              />
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default TaskAlertDialog;
