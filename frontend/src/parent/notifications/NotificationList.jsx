
import React, { useEffect, useState } from 'react';
import {
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  useGetIdentity,
  useNotify
} from 'react-admin';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Badge,
  Paper
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// Import API configuration
import { API_ENDPOINT_FUNCTION, GET_HEADER } from '../../config/config';


const Empty = () => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
        <NotificationsIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
        <Typography variant="h6" align="center">
          No notifications
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary">
          You don't have any notifications at the moment.
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Notification priority/type icon
const NotificationIcon = ({ record }) => {
  if (!record) return null;
  
  const { priority, type } = record;
  
  // Choose icon based on priority or type
  let icon;
  let color;
  
  if (priority === 'high' || type === 'alert') {
    icon = <ErrorIcon />;
    color = '#f44336'; // red
  } else if (priority === 'medium' || type === 'warning') {
    icon = <WarningIcon />;
    color = '#ff9800'; // orange
  } else if (type === 'success') {
    icon = <CheckCircleIcon />;
    color = '#4caf50'; // green
  } else {
    icon = <InfoIcon />;
    color = '#2196f3'; // blue
  }
  
  return (
    <Box sx={{ color }}>
      {icon}
    </Box>
  );
};

// Notification status chip
const NotificationStatus = ({ record }) => {
  if (!record) return null;
  
  const isRead = record.is_read === true;
  
  return isRead ? (
    <Chip 
      label="Read" 
      size="small" 
      sx={{ 
        backgroundColor: '#e0e0e0',
        color: '#757575'
      }}
    />
  ) : (
    <Chip 
      label="Unread" 
      size="small" 
      sx={{ 
        backgroundColor: '#bbdefb',
        color: '#1976d2',
        fontWeight: 'bold'
      }}
    />
  );
};

// Main notification list component
export const ParentNotificationList = () => {
  const { identity } = useGetIdentity();
  const notify = useNotify();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchNotifications = async () => {
    if (!identity) return;
    
    try {
      setLoading(true);
      
      // Determine recipient type based on user role
      const recipientType = "Parents"
      
      // Use API_ENDPOINT_FUNCTION from config.js to construct the endpoint
      const endpoint = API_ENDPOINT_FUNCTION(`/notifications/recipient/${recipientType}/${identity.id}`);
      
      // Use the custom endpoint to fetch notifications with proper headers
      const options = await GET_HEADER({ isJson: true });
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: options.headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      notify('Error loading notifications', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Load notifications when identity is available
  useEffect(() => {
      fetchNotifications();
  }, []);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => n && n.is_read === false).length;
  
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Badge badgeContent={unreadCount} color="primary" sx={{ mr: 2 }}>
          <NotificationsIcon fontSize="large" />
        </Badge>
        <Typography variant="h5">
          Notifications
          {unreadCount > 0 && (
            <Typography component="span" variant="subtitle1" sx={{ ml: 1, color: 'primary.main' }}>
              ({unreadCount} unread)
            </Typography>
          )}
        </Typography>
      </Box>
      
      {notifications.length === 0 && !loading ? (
        <Empty />
      ) : (
        <Paper elevation={1}>
          <Datagrid
            bulkActionButtons={false}
            data={notifications}
            isLoading={loading}
            resource="notifications"
            sx={{
              '& .RaDatagrid-row': {
                backgroundColor: (record) => record && record.is_read === false ? '#f5f5f5' : 'inherit',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                },
              },
            }}
          >
            
            <TextField source="sender_role" label="sender" />
            <TextField source="message" label="Message" />
            <DateField source="createdAt" label="Received" showTime />
          </Datagrid>
        </Paper>
      )}
    </>
  );
};

export default ParentNotificationList;
