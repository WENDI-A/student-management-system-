"use client";
import { useState } from 'react';
import { useIdentity } from '@/hooks/auth/useIdentity';
import dataProvider from '@/hooks/dataProvider';

export interface Notification {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'ALERT' | 'OTHER';
  fileUrl?: string;
  createdAt: string;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
  adminId?: string;
  directorId?: string;
  guestId?: string;
  student?: any;
  teacher?: any;
  parent?: any;
  admin?: any;
  director?: any;
  guest?: any;
}

// Hook to get user notifications
export function useUserNotifications() {
  const { data: identity } = useIdentity();
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  // Get user ID and type from identity
  const userId = identity && typeof identity === 'object' && 'id' in identity ? (identity as any).id : '';
  const userType = identity && typeof identity === 'object' && 'userType' in identity ? (identity as any).userType : '';

  // Build filter based on user type
  const getFilter = () => {
    if (!userId) return {};

    switch (userType) {
      case 'STUDENT':
        return { studentId: userId };
      case 'TEACHER':
        return { teacherId: userId };
      case 'PARENT':
        return { parentId: userId };
      case 'ADMIN':
        return { adminId: userId };
      case 'DIRECTOR':
        return { directorId: userId };
      case 'GUEST':
        return { guestId: userId };
      default:
        return {}; // Return empty filter if user type is unknown
    }
  };

  // Fetch notifications
  const { data: notificationsData, isLoading, refetch } = dataProvider.useListQuery('notifications', {
    page: 1,
    perPage: 50,
    filter: getFilter(),
    orderBy: JSON.stringify({ createdAt: 'desc' }),
    select: JSON.stringify({
      id: true,
      content: true,
      type: true,
      fileUrl: true,
      createdAt: true,
      studentId: true,
      teacherId: true,
      parentId: true,
      adminId: true,
      directorId: true,
      guestId: true,
      student: true,
      teacher: true,
      parent: true,
      admin: true,
      director: true,
      guest: true
    })
  });

  const notifications = notificationsData?.data || [];

  // Since there's no isRead field in the database, we'll track read status differently
  // For now, we'll consider all notifications as unread
  const unreadCount = notifications.length;

  // Delete notification (since there's no isRead field)
  const deleteNotification = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    try {
      await dataProvider.delete('notifications', { id: notificationId });
      await refetch();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      await Promise.all(
        notifications.map((notification: Notification) =>
          dataProvider.delete('notifications', { id: notification.id })
        )
      );
      await refetch();
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return '🚨';
      case 'FILE':
        return '📎';
      case 'IMAGE':
        return '🖼️';
      case 'TEXT':
        return '💬';
      case 'OTHER':
      default:
        return 'ℹ️';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInDays < 1) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markingAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch,
    getNotificationIcon,
    formatTimeAgo,
    userId,
    userType
  };
}

// Hook to create notifications (for admin/teacher use)
export function useCreateNotification() {
  const [isCreating, setIsCreating] = useState(false);

  const createNotification = async (notificationData: {
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'FILE' | 'ALERT' | 'OTHER';
    fileUrl?: string;
    studentId?: string;
    teacherId?: string;
    parentId?: string;
    adminId?: string;
    directorId?: string;
    guestId?: string;
  }) => {
    setIsCreating(true);
    try {
      await dataProvider.create('notifications', {
        data: {
          content: notificationData.content,
          type: notificationData.type || 'TEXT',
          fileUrl: notificationData.fileUrl,
          studentId: notificationData.studentId,
          teacherId: notificationData.teacherId,
          parentId: notificationData.parentId,
          adminId: notificationData.adminId,
          directorId: notificationData.directorId,
          guestId: notificationData.guestId
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to create notification:', error);
      return { success: false, error };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createNotification,
    isCreating
  };
}
