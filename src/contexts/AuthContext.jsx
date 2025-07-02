import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, auth, db } from '../lib/supabase';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEstate, setCurrentEstate] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
        setCurrentEstate(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
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
        return;
      }

      // Default profile if no specific role found
      setUserProfile({
        role: 'user',
        name: user?.user_metadata?.name || user?.email || 'User'
      });

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

  const logout = async () => {
    try {
      await auth.signOut();
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
    try {
      // First create auth user
      const { user: authUser } = await auth.signUp(
        adminData.email, 
        adminData.password,
        { name: adminData.name, role: 'admin' }
      );

      // Then create admin profile
      const admin = await db.createEstateAdmin({
        ...adminData,
        user_id: authUser.id
      });

      return admin;
    } catch (error) {
      console.error('Error creating estate admin:', error);
      throw error;
    }
  };

  const createGuard = async (guardData) => {
    try {
      // First create auth user
      const { user: authUser } = await auth.signUp(
        guardData.email,
        guardData.password,
        { name: guardData.name, role: 'guard' }
      );

      // Then create guard profile
      const guard = await db.createGuard({
        ...guardData,
        user_id: authUser.id,
        estate_id: currentEstate?.id
      });

      return guard;
    } catch (error) {
      console.error('Error creating guard:', error);
      throw error;
    }
  };

  const createResident = async (residentData) => {
    try {
      // First create auth user
      const { user: authUser } = await auth.signUp(
        residentData.email,
        residentData.password,
        { name: residentData.name, role: 'resident' }
      );

      // Then create resident profile
      const resident = await db.createResident({
        ...residentData,
        user_id: authUser.id,
        estate_id: currentEstate?.id
      });

      return resident;
    } catch (error) {
      console.error('Error creating resident:', error);
      throw error;
    }
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

  const value = {
    user,
    userProfile,
    currentEstate,
    isLoading,
    login,
    logout,
    registerEstate,
    createEstateAdmin,
    createGuard,
    createResident,
    inviteVisitor,
    verifyVisitorOTP,
    // Database access
    db,
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