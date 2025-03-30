import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotify } from 'react-admin';
import { API_URL } from '../config/config';

const useNotifications = (adminId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/notifications/admin`);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error(error);
      notify('Failed to fetch notifications.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const sendNotification = async ({ recipientType, message }) => {
    if (!message || !recipientType) {
      notify('Message and recipient type are required.', { type: 'error' });
      return;
    }
    setLoading(true);
    try {
     await axios.post(`${API_URL}/notifications/send`, {
        sender_id: adminId,
        sender_role: 'Teacher',
        recipient_type: recipientType,
        message,
      });
      notify('Notification sent successfully.', { type: 'success' });
      fetchNotifications();
    } catch (error) {
      console.error(error);
      notify(error.response.data.message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/notifications/delete/${id}`);
      notify('Notification deleted successfully.', { type: 'success' });
      fetchNotifications();
    } catch (error) {
      console.error(error);
      notify('Failed to delete notification.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, loading, sendNotification, deleteNotification, fetchNotifications };
};

export default useNotifications;
