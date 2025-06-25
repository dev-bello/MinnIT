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
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'guard001@example.com',
    password: 'guard123',
    name: 'Security Guard Alpha',
    role: 'guard',
    uniqueId: 'GRD001',
    shiftSchedule: 'Morning (6AM - 2PM)',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'resident001@example.com',
    password: 'resident123',
    name: 'John Resident',
    role: 'resident',
    uniqueId: 'RES001',
    apartmentNumber: 'A-101',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Mock data stores
export const mockGuards = [
  {
    id: '2',
    uniqueId: 'GRD001',
    name: 'Security Guard Alpha',
    email: 'guard001@example.com',
    shiftSchedule: 'Morning (6AM - 2PM)',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    uniqueId: 'GRD002',
    name: 'Security Guard Beta',
    email: 'guard002@example.com',
    shiftSchedule: 'Evening (2PM - 10PM)',
    createdAt: '2024-01-02T00:00:00Z'
  }
];

export const mockResidents = [
  {
    id: '3',
    uniqueId: 'RES001',
    name: 'John Resident',
    email: 'resident001@example.com',
    apartmentNumber: 'A-101',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    uniqueId: 'RES002',
    name: 'Jane Smith',
    email: 'resident002@example.com',
    apartmentNumber: 'B-205',
    createdAt: '2024-01-02T00:00:00Z'
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
    status: 'pending',
    createdAt: '2024-01-11T00:00:00Z'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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