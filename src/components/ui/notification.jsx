import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, XIcon, CheckIcon, AlertCircleIcon, FileTextIcon, UserIcon } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from './modal';

export const NotificationDropdown = () => {
  const { user, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, allUsers } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const dropdownRef = useRef(null);

  // Ensure notifications is always an array
  const rawNotifications = getUserNotifications(user?.id || '');
  const notifications = Array.isArray(rawNotifications) ? rawNotifications : [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
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

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(user.id);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'residency_request':
        return <FileTextIcon className="w-4 h-4 text-blue-500" />;
      case 'request_update':
        return <CheckIcon className="w-4 h-4 text-green-500" />;
      case 'profile_update':
        return <UserIcon className="w-4 h-4 text-purple-500" />;
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
              {/* Mobile close button */}
              <span className="sm:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <XIcon className="w-4 h-4" />
                </Button>
              </span>
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {notifications.length === 0 ? (
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