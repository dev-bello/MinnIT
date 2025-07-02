import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Mock users for demonstration
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin',
    phone: '+2348012345678',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'guard001@example.com',
    password: 'guard123',
    name: 'Security Guard Alpha',
    role: 'guard',
    uniqueId: 'GRD001',
    phone: '+2348023456789',
    shiftSchedule: 'Morning (6AM - 2PM)',
    emergencyContact: '+2348034567890',
    address: '123 Security Street, Lagos',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'resident001@example.com',
    password: 'resident123',
    name: 'John Resident',
    role: 'resident',
    uniqueId: 'RES001',
    phone: '+2348045678901',
    // Personal Info Layer (self-editable)
    personalInfo: {
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      nationality: 'Nigerian',
      emergencyContact: '+2348056789012',
      emergencyContactName: 'Sarah Resident',
      emergencyContactRelation: 'Spouse'
    },
    // Residency Layer (admin-controlled)
    residencyInfo: {
      apartmentNumber: 'A-101',
      block: 'A',
      floor: '1',
      apartmentType: '2 Bedroom',
      leaseStartDate: '2023-01-01',
      leaseEndDate: '2024-12-31',
      monthlyRent: 150000,
      paymentStatus: 'current',
      maintenanceRequests: []
    },
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    email: 'eze@example.com',
    password: 'eze123',
    name: 'Eze',
    role: 'guard',
    uniqueId: 'GRD002',
    phone: '+2348067890123',
    shiftSchedule: 'Morning (6AM - 2PM)',
    emergencyContact: '+2348078901234',
    address: '456 Guard Avenue, Lagos',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '5',
    email: 'bello@example.com',
    password: 'bello123',
    name: 'Bello',
    role: 'guard',
    uniqueId: 'GRD003',
    phone: '+2348089012345',
    shiftSchedule: 'Evening (2PM - 10PM)',
    emergencyContact: '+2348090123456',
    address: '789 Security Road, Lagos',
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '6',
    email: 'yusuf@example.com',
    password: 'yusuf123',
    name: 'Yusuf',
    role: 'guard',
    uniqueId: 'GRD004',
    phone: '+2348001234567',
    shiftSchedule: 'Night (10PM - 6AM)',
    emergencyContact: '+2348012345678',
    address: '321 Night Watch Street, Lagos',
    createdAt: '2024-01-04T00:00:00Z'
  }
];

// Mock residency requests for residents
export const mockResidencyRequests = [
  {
    id: '1',
    residentId: '3',
    type: 'apartment_change',
    currentApartment: 'A-101',
    requestedApartment: 'B-205',
    reason: 'Need larger space for family',
    status: 'pending',
    submittedAt: '2024-01-15T00:00:00Z',
    adminNotes: ''
  },
  {
    id: '2',
    residentId: '3',
    type: 'maintenance_request',
    apartment: 'A-101',
    issue: 'Leaking faucet in kitchen',
    priority: 'medium',
    status: 'approved',
    submittedAt: '2024-01-10T00:00:00Z',
    adminNotes: 'Maintenance team will visit on Monday'
  }
];

// Mock notifications
const mockNotifications = [
  {
    id: '1',
    userId: '1', // Admin
    type: 'residency_request',
    title: 'New Residency Request',
    message: 'John Resident submitted a maintenance request for apartment A-101',
    isRead: false,
    createdAt: '2024-01-15T10:30:00Z',
    data: { requestId: '1' }
  },
  {
    id: '2',
    userId: '3', // Resident
    type: 'request_update',
    title: 'Request Approved',
    message: 'Your maintenance request has been approved. Maintenance team will visit on Monday.',
    isRead: false,
    createdAt: '2024-01-10T14:20:00Z',
    data: { requestId: '2' }
  },
  {
    id: '3',
    userId: '2', // Guard
    type: 'profile_update',
    title: 'Profile Updated',
    message: 'Your profile information has been updated by the administrator.',
    isRead: false,
    createdAt: '2024-01-12T09:15:00Z'
  }
];

// Mock data stores
export const mockGuards = [
  {
    id: '2',
    uniqueId: 'GRD001',
    name: 'Security Guard Alpha',
    email: 'guard001@example.com',
    phone: '+2348023456789',
    shiftSchedule: 'Morning (6AM - 2PM)',
    emergencyContact: '+2348034567890',
    address: '123 Security Street, Lagos',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    uniqueId: 'GRD002',
    name: 'Eze',
    email: 'eze@example.com',
    phone: '+2348067890123',
    shiftSchedule: 'Morning (6AM - 2PM)',
    emergencyContact: '+2348078901234',
    address: '456 Guard Avenue, Lagos',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '5',
    uniqueId: 'GRD003',
    name: 'Bello',
    email: 'bello@example.com',
    phone: '+2348089012345',
    shiftSchedule: 'Evening (2PM - 10PM)',
    emergencyContact: '+2348090123456',
    address: '789 Security Road, Lagos',
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '6',
    uniqueId: 'GRD004',
    name: 'Yusuf',
    email: 'yusuf@example.com',
    phone: '+2348001234567',
    shiftSchedule: 'Night (10PM - 6AM)',
    emergencyContact: '+2348012345678',
    address: '321 Night Watch Street, Lagos',
    createdAt: '2024-01-04T00:00:00Z'
  }
];

export const mockResidents = [
  {
    id: '3',
    uniqueId: 'RES001',
    name: 'John Resident',
    email: 'resident001@example.com',
    phone: '+2348045678901',
    apartmentNumber: 'A-101',
    status: 'active',
    personalInfo: {
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      nationality: 'Nigerian',
      emergencyContact: '+2348056789012',
      emergencyContactName: 'Sarah Resident',
      emergencyContactRelation: 'Spouse'
    },
    residencyInfo: {
      apartmentNumber: 'A-101',
      block: 'A',
      floor: '1',
      apartmentType: '2 Bedroom',
      leaseStartDate: '2023-01-01',
      leaseEndDate: '2024-12-31',
      monthlyRent: 150000,
      paymentStatus: 'current',
      maintenanceRequests: []
    },
    createdAt: '2024-01-01T00:00:00Z',
    canEdit: false
  },
  {
    id: '5',
    uniqueId: 'RES002',
    name: 'Jane Smith',
    email: 'resident002@example.com',
    phone: '+2348098765432',
    apartmentNumber: 'B-205',
    status: 'active',
    personalInfo: {
      dateOfBirth: '1990-07-22',
      gender: 'Female',
      nationality: 'Nigerian',
      emergencyContact: '+2348098765433',
      emergencyContactName: 'Mike Smith',
      emergencyContactRelation: 'Brother'
    },
    residencyInfo: {
      apartmentNumber: 'B-205',
      block: 'B',
      floor: '2',
      apartmentType: '1 Bedroom',
      leaseStartDate: '2023-06-01',
      leaseEndDate: '2024-05-31',
      monthlyRent: 120000,
      paymentStatus: 'current',
      maintenanceRequests: []
    },
    createdAt: '2024-01-02T00:00:00Z',
    canEdit: true
  }
];

export const mockVisitorInvites = [
  {
    id: '1',
    residentId: '3',
    visitorName: 'Mike Johnson',
    visitorPhone: '+1234567890',
    visitDate: '2024-01-15',
    visitTime: '14:30',
    purpose: 'Business Meeting',
    code: 'VIS001',
    status: 'approved',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    residentId: '3',
    visitorName: 'Sarah Wilson',
    visitorPhone: '+0987654321',
    visitDate: '2024-01-16',
    visitTime: '10:00',
    purpose: 'Personal Visit',
    code: 'VIS002',
    status: 'approved',
    createdAt: '2024-01-11T00:00:00Z'
  }
];

// Notification types:
// - profile_update_request: Sent to admin when a user requests a profile update
// - profile_updated: Sent to user when admin updates their profile
//
// To integrate with a backend, replace setNotifications/addNotification with API calls.

export const AuthProvider = ({ children }) => {
  // Hydrate users and notifications from sessionStorage if available
  const sessionUsers = sessionStorage.getItem('allUsers');
  const sessionNotifications = sessionStorage.getItem('notifications');

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState(sessionUsers ? JSON.parse(sessionUsers) : mockUsers);
  const [residencyRequests, setResidencyRequests] = useState(mockResidencyRequests);
  const [notifications, setNotifications] = useState(sessionNotifications ? JSON.parse(sessionNotifications) : []);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Sync allUsers and notifications to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem('allUsers', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    sessionStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const login = async (email, password) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = allUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // --- Notification helpers ---
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => {
      const updated = [...prev, newNotification];
      sessionStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(notif => notif.id === notificationId ? { ...notif, isRead: true } : notif);
      sessionStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllNotificationsAsRead = (userId) => {
    setNotifications(prev => {
      const updated = prev.map(notif => notif.userId === userId ? { ...notif, isRead: true } : notif);
      sessionStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const getUserNotifications = (userId) => {
    return notifications.filter(notif => notif.userId === userId);
  };

  // --- Profile update request (user -> admin) ---
  const requestProfileUpdate = (requestingUser) => {
    addNotification({
      userId: '1', // Admin
      type: 'profile_update_request',
      title: 'Profile Update Request',
      message: `${requestingUser.name} (${requestingUser.role}) updated their profile.`,
      data: { userId: requestingUser.id }
    });
  };

  // --- Profile updated by admin (admin -> user) ---
  const notifyProfileUpdated = (targetUser) => {
    addNotification({
      userId: targetUser.id,
      type: 'profile_updated',
      title: 'Profile Updated',
      message: 'Your profile information has been updated by the administrator.',
      data: { userId: targetUser.id }
    });
  };

  // --- Profile update logic ---
  // Anyone can edit their own profile; admin can edit anyone's profile
  const updatePersonalInfo = (userId, personalInfo, email, phone) => {
    setAllUsers(prev => {
      const updated = prev.map(u =>
        u.id === userId
          ? { ...u, personalInfo: { ...u.personalInfo, ...personalInfo }, ...(email && { email }), ...(phone && { phone }) }
          : u
      );
      sessionStorage.setItem('allUsers', JSON.stringify(updated));
      return updated;
    });
    // If editing self, update user state and localStorage
    if (user && user.id === userId) {
      const updatedUser = {
        ...user,
        personalInfo: { ...user.personalInfo, ...personalInfo },
        ...(email && { email }),
        ...(phone && { phone })
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Notify admin of self-edit
      if (user.role !== 'admin') requestProfileUpdate(updatedUser);
    } else if (user && user.role === 'admin') {
      // If admin edits someone else, notify that user
      const targetUser = allUsers.find(u => u.id === userId);
      if (targetUser) notifyProfileUpdated(targetUser);
    }
  };

  const updateResidencyInfo = (userId, residencyInfo) => {
    setAllUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, residencyInfo: { ...u.residencyInfo, ...residencyInfo } } : u
    ));
    
    // Update current user if it's the logged-in user
    if (user && user.id === userId) {
      const updatedUser = { ...user, residencyInfo: { ...user.residencyInfo, ...residencyInfo } };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateGuardInfo = (userId, guardInfo) => {
    setAllUsers(prev => {
      const updated = prev.map(u =>
        u.id === userId ? { ...u, ...guardInfo } : u
      );
      sessionStorage.setItem('allUsers', JSON.stringify(updated));
      return updated;
    });
    if (user && user.id === userId) {
      const updatedUser = { ...user, ...guardInfo };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (user.role !== 'admin') requestProfileUpdate(updatedUser);
    } else if (user && user.role === 'admin') {
      const targetUser = allUsers.find(u => u.id === userId);
      if (targetUser) notifyProfileUpdated(targetUser);
    }
  };

  const submitResidencyRequest = (request) => {
    const newRequest = {
      ...request,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    setResidencyRequests(prev => [...prev, newRequest]);
    
    // Add notification for admin when new request is submitted
    addNotification({
      userId: '1', // Admin ID
      type: 'residency_request',
      title: 'New Residency Request',
      message: `${request.residentName || 'A resident'} submitted a ${request.type.replace('_', ' ')} request for apartment ${request.apartment}`,
      data: { requestId: newRequest.id }
    });
  };

  const updateResidencyRequest = (requestId, updates) => {
    setResidencyRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, ...updates } : req
    ));
    
    // Add notification for resident when request is updated
    const request = residencyRequests.find(req => req.id === requestId);
    if (request && updates.status) {
      addNotification({
        userId: request.residentId,
        type: 'request_update',
        title: `Request ${updates.status === 'approved' ? 'Approved' : updates.status === 'rejected' ? 'Rejected' : 'Updated'}`,
        message: `Your ${request.type.replace('_', ' ')} request has been ${updates.status}. ${updates.adminNotes ? `Notes: ${updates.adminNotes}` : ''}`,
        data: { requestId }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading,
      allUsers,
      residencyRequests,
      notifications,
      updatePersonalInfo,
      updateResidencyInfo,
      updateGuardInfo,
      submitResidencyRequest,
      updateResidencyRequest,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      getUserNotifications,
      requestProfileUpdate,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};