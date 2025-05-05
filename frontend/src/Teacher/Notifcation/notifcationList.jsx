
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import useNotifications from '../../hooks/useNotifications';

const TeacherNotfication  = () => {
  const { notifications, loading, sendNotification, deleteNotification } = useNotifications();
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('Students');
  const [open, setOpen] = useState(false);
  const handleSendNotification = async () => {
    await sendNotification({ role : 'Teacher',recipientType, message });
    setMessage('');
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with title and add button in right corner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Teacher Notfication List
        </Typography>
        
        {/* Add button moved to right corner */}
        <Tooltip title="Send Notification">
          <IconButton 
            color="primary" 
            onClick={() => setOpen(true)} 
            sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Notification Popup Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            variant="outlined"
            sx={{ my: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ my: 2 }}>
            <InputLabel id="recipient-type-label">Recipient Type</InputLabel>
            <Select
              labelId="recipient-type-label"
              id="recipientType"
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              label="Recipient Type"
            >
              <MenuItem value="Students">Students</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSendNotification} variant="contained" color="primary">
            {loading ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification List Section */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Notifications Sent by TTeacher
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : notifications?.length === 0 ? (
          <Typography>No notifications sent by the Teacher.</Typography>
        ) : (
          notifications.map((notification) => (
            <Paper key={notification.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Stack spacing={1}>
                  <Typography variant="body1">
                    <strong>Message:</strong> {notification.message}
                  </Typography>
                  <Typography variant="body2">
                    <strong>For:</strong> {notification.recipient_type}
                  </Typography>
                </Stack>
                
                {/* Delete button moved to the right side */}
                <IconButton 
                  color="error" 
                  onClick={() => deleteNotification(notification.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default TeacherNotfication;
