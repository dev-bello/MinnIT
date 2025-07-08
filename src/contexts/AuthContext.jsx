import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, auth, db } from '../lib/supabase';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEstate, setCurrentEstate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Fetching initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session:', session);
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        console.log('Setting isLoading to false (initial session)');
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log('Auth state changed:', event, session);
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
          setCurrentEstate(null);
        }
      } catch (error) {
        console.error('Error in onAuthStateChange:', error);
      } finally {
        console.log('Setting isLoading to false (auth state change)');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      console.log('Loading user profile for:', userId);
      // Check if user is a developer (has estates)
      const { data: estates } = await supabase
        .from('estates')
        .select('*')
        .eq('developer_id', userId);

      if (estates && estates.length > 0) {
        setUserProfile({
          role: 'developer',
          estates: estates,
          name: user?.user_metadata?.name || 'Developer'
        });
        console.log('User profile loaded:', userProfile);
        return;
      }

      // Check if user is an estate admin
      const { data: adminProfile } = await supabase
        .from('estate_admins')
        .select(`
          *,
          estates(*)
        `)
        .eq('user_id', userId)
        .single();

      if (adminProfile) {
        setUserProfile({
          role: 'admin',
          ...adminProfile,
          estate: adminProfile.estates
        });
        setCurrentEstate(adminProfile.estates);
        console.log('User profile loaded:', userProfile);
        return;
      }

      // Check if user is a guard
      const { data: guardProfile } = await supabase
        .from('guards')
        .select(`
          *,
          estates(*)
        `)
        .eq('user_id', userId)
        .single();

      if (guardProfile) {
        setUserProfile({
          role: 'guard',
          ...guardProfile,
          estate: guardProfile.estates
        });
        setCurrentEstate(guardProfile.estates);
        console.log('User profile loaded:', userProfile);
        return;
      }

      // Check if user is a resident
      const { data: residentProfile } = await supabase
        .from('residents')
        .select(`
          *,
          estates(*)
        `)
        .eq('user_id', userId)
        .single();

      if (residentProfile) {
        setUserProfile({
          role: 'resident',
          ...residentProfile,
          estate: residentProfile.estates
        });
        setCurrentEstate(residentProfile.estates);
        console.log('User profile loaded:', userProfile);
        return;
      }

      // Check if user is a super admin
      const { data: superAdminProfile } = await supabase
        .from('estate_admins')
        .select(`*, estates(*)`)
        .eq('user_id', userId)
        .eq('role', 'super_admin')
        .single();

      if (superAdminProfile) {
        setUserProfile({
          role: 'super_admin',
          ...superAdminProfile,
          estate: superAdminProfile.estates
        });
        setCurrentEstate(superAdminProfile.estates);
        console.log('User profile loaded:', userProfile);
        return;
      }

      // Default profile if no specific role found
      setUserProfile({
        role: 'user',
        name: user?.user_metadata?.name || user?.email || 'User'
      });
      console.log('User profile loaded:', userProfile);

    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        throw new Error(error.message);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error.message);
        throw new Error(error.message);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registration error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('Password reset error:', error.message);
        throw new Error(error.message);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const registerEstate = async (estateData) => {
    try {
      if (!user) throw new Error('User must be logged in');
      
      const estate = await db.createEstate({
        ...estateData,
        developer_id: user.id
      });
      
      return estate;
    } catch (error) {
      console.error('Error registering estate:', error);
      throw error;
    }
  };

  const createEstateAdmin = async (adminData) => {
    // TODO: Implement admin-only/manual creation logic for estate admin
    throw new Error('Manual admin creation only. Not available via public UI.');
  };

  const createGuard = async (guardData) => {
    // TODO: Implement admin-only/manual creation logic for guard
    throw new Error('Manual guard creation only. Not available via public UI.');
  };

  const createResident = async (residentData) => {
    // TODO: Implement admin-only/manual creation logic for resident
    throw new Error('Manual resident creation only. Not available via public UI.');
  };

  const inviteVisitor = async (inviteData) => {
    try {
      if (userProfile?.role !== 'resident') {
        throw new Error('Only residents can invite visitors');
      }

      const invite = await db.createVisitorInvite({
        ...inviteData,
        estate_id: currentEstate?.id,
        resident_id: userProfile.id,
        status: 'approved' // Auto-approve for now
      });

      return invite;
    } catch (error) {
      console.error('Error creating visitor invite:', error);
      throw error;
    }
  };

  const verifyVisitorOTP = async (otpCode) => {
    try {
      const invite = await db.verifyOTP(otpCode);
      
      if (invite) {
        // Create visitor log entry
        await db.createVisitorLog({
          estate_id: currentEstate?.id,
          invite_id: invite.id,
          guard_id: userProfile?.id,
          visitor_name: invite.visitor_name,
          visitor_phone: invite.visitor_phone,
          verification_method: 'otp',
          status: 'entered'
        });

        // Update invite status to used
        await supabase
          .from('visitor_invites')
          .update({ status: 'used' })
          .eq('id', invite.id);
      }

      return invite;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  // Fetch notifications for a user
  const getUserNotifications = async (userId) => {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllNotificationsAsRead = async (userId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const createNotification = async (notificationData) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    currentEstate,
    isLoading,
    error,
    login,
    register,
    resetPassword,
    logout,
    registerEstate,
    createEstateAdmin,
    createGuard,
    createResident,
    inviteVisitor,
    verifyVisitorOTP,
    // Database access
    db,
    // Notification functions
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    createNotification,
    // Utility functions
    getUserRole: () => userProfile?.role || 'user',
    isAdmin: () => userProfile?.role === 'admin',
    isGuard: () => userProfile?.role === 'guard',
    isResident: () => userProfile?.role === 'resident',
    isDeveloper: () => userProfile?.role === 'developer'
  };

  return (
    <AuthContext.Provider value={value}>
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