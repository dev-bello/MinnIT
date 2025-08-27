import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, XIcon, CheckIcon, AlertCircleIcon, FileTextIcon, UserIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from './modal';

export const NotificationDropdown = () => {
  const { user, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, allUsers } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  // Load notifications
  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError('');
      const data = await getUserNotifications(user.id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
    
    if (
      user.role === 'admin' &&
      (notification.type === 'residency_change_request' || notification.type === 'profile_updated' || notification.type === 'profile_update_request')
    ) {
      const resident = allUsers.find(u => u.id === notification.data?.residentId || u.id === notification.data?.userId);
      setModalData({
        resident,
        notification
      });
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead(user.id);
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all as read');
    }
  };

  const handleRefresh = () => {
    loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'residency_request':
        return <FileTextIcon className="w-4 h-4 text-blue-500" />;
      case 'request_update':
        return <CheckIcon className="w-4 h-4 text-green-500" />;
      case 'profile_update':
        return <UserIcon className="w-4 h-4 text-purple-500" />;
      case 'visitor_verification':
        return <CheckIcon className="w-4 h-4 text-green-500" />;
      case 'security_alert':
        return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircleIcon className="w-4 h-4 text-neutral-500" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="button-icon relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BellIcon className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-0 h-5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div
          className="fixed sm:absolute z-[999999] w-[calc(100vw-1rem)] max-w-md sm:w-96 right-auto sm:right-4 left-1/2 sm:left-auto top-20 sm:top-20 -translate-x-1/2 sm:translate-x-0 bg-white rounded-2xl shadow-lg border border-neutral-200 max-h-[60vh] overflow-y-auto px-2 sm:px-0"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-800">Notifications</h3>
            <div className="flex gap-2 items-center">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-sm text-neutral-600 hover:text-neutral-700"
              >
                <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {/* Mobile close button */}
              <span className="sm:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <XIcon className="w-4 h-4" />
                </Button>
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircleIcon className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          <div className="divide-y divide-neutral-100">
            {isLoading ? (
              <div className="p-6 text-center text-neutral-500">
                <RefreshCwIcon className="w-8 h-8 mx-auto mb-2 text-neutral-300 animate-spin" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">
                <BellIcon className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-neutral-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-neutral-800 truncate">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-neutral-400 mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {modalData && (
        <Modal isOpen={!!modalData} onClose={() => setModalData(null)} zIndex={999999} size="sm" title="Request / Change Details" align="start">
          <div className="bg-white rounded-2xl absolute top-1 shadow-lg  border border-neutral-200 p-6 ">
            <div className="mb-6">
              <h4 className="text-lg font-bold text-neutral-800 mb-2">Resident Info</h4>
              {modalData.resident ? (
                <ul className="text-sm space-y-1 text-neutral-700">
                  <li><span className="font-semibold">Name:</span> {modalData.resident.name}</li>
                  <li><span className="font-semibold">Email:</span> {modalData.resident.email}</li>
                  <li><span className="font-semibold">Phone:</span> {modalData.resident.phone}</li>
                </ul>
              ) : (
                <div className="text-neutral-500">Resident not found.</div>
              )}
            </div>
            <hr className="my-4 border-neutral-200" />
            <div>
              <h4 className="text-lg font-bold text-neutral-800 mb-2">Request / Change Details</h4>
              <div className="text-neutral-800 whitespace-pre-line">
                {modalData.notification.title && <div className="font-semibold mb-1">{modalData.notification.title}</div>}
                <div className="text-sm">{modalData.notification.data?.details || modalData.notification.message}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}; 