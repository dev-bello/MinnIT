import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, auth, db } from "../lib/supabase";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEstate, setCurrentEstate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadUserProfile(user.id);
    } else {
      // Clear profile and estate when user is logged out
      setUserProfile(null);
      setCurrentEstate(null);
    }
  }, [user]);

  useEffect(() => {
    const fetchEstateDetails = async () => {
      if (userProfile && userProfile.estate_id) {
        try {
          const { data: estate, error } = await supabase
            .from("estates")
            .select("*")
            .eq("id", userProfile.estate_id)
            .single();

          if (error) {
            throw error;
          }
          setCurrentEstate(estate);
        } catch (error) {
          console.error("Error fetching estate details:", error);
          setError("Could not load estate details.");
        }
      }
    };

    fetchEstateDetails();
  }, [userProfile]);

  const loadUserProfile = async (userId) => {
    try {
      // Super admin first
      const { data: superAdminProfile } = await supabase
        .from("estate_admins")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();

      if (superAdminProfile) {
        setUserProfile({
          role: "super_admin",
          ...superAdminProfile,
          name:
            superAdminProfile.name ||
            user?.user_metadata?.name ||
            user?.email ||
            "Super Admin",
          estate: null,
        });
        return;
      }

      // Admin by user_id
      const { data: adminProfile } = await supabase
        .from("estate_admins")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (adminProfile) {
        setUserProfile({
          role: "admin",
          ...adminProfile,
          name:
            adminProfile.name ||
            user?.user_metadata?.name ||
            user?.email ||
            "Admin",
          estate: null,
        });
        return;
      }

      // Fallback: Admin by email (for newly invited admins without user_id yet)
      if (user?.email) {
        const { data: adminByEmail } = await supabase
          .from("estate_admins")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();
        if (adminByEmail) {
          setUserProfile({
            role: "admin",
            ...adminByEmail,
            name:
              adminByEmail.name ||
              user?.user_metadata?.name ||
              user?.email ||
              "Admin",
            estate: null,
          });
          return;
        }
      }

      // Guard
      const { data: guardProfile } = await supabase
        .from("guards")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (guardProfile) {
        setUserProfile({
          role: "guard",
          ...guardProfile,
          name:
            guardProfile.name ||
            user?.user_metadata?.name ||
            user?.email ||
            "Guard",
          estate: null,
        });
        return;
      }

      // Resident
      const { data: residentProfile } = await supabase
        .from("residents")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (residentProfile) {
        setUserProfile({
          role: "resident",
          ...residentProfile,
          name:
            residentProfile.name ||
            user?.user_metadata?.name ||
            user?.email ||
            "Resident",
          estate: null,
        });
        return;
      }

      // Default guest
      setUserProfile({
        role: "guest",
        name: user?.user_metadata?.name || user?.email || "Guest",
      });
    } catch (error) {
      console.error("Error loading user profile:", error);
      setError("Failed to load user profile.");
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Check if the user needs to change their password
      if (data.user.user_metadata?.force_password_change) {
        // Redirect to password change page
        window.location.href = "/set-password";
        return { success: true, user: data.user, needsPasswordChange: true };
      }

      return { success: true, user: data.user };
    } catch (error) {
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
            name: name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Failed to log out.");
    }
  };

  const updateUserPassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        throw new Error(error.message);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const createGuardUser = async (guardData) => {
    return await db.createGuardUser(guardData);
  };

  const createResidentUser = async (residentData) => {
    return await db.createResidentUser(residentData);
  };

  const inviteVisitor = async (inviteData) => {
    try {
      if (userProfile?.role !== "resident") {
        throw new Error("Only residents can invite visitors");
      }

      const invite = await db.createVisitorInvite({
        ...inviteData,
        estate_id: currentEstate?.id,
        resident_id: userProfile.id,
        status: "approved", // Auto-approve for now
      });

      return invite;
    } catch (error) {
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
          verification_method: "otp",
          status: "entered",
        });

        // Update invite status to used
        await supabase
          .from("visitor_invites")
          .update({ status: "used" })
          .eq("id", invite.id);
      }

      return invite;
    } catch (error) {
      throw error;
    }
  };

  // Fetch notifications for a user
  const getUserNotifications = async (userId) => {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching notifications:", error);
        setError("Could not load notifications.");
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Could not load notifications.");
      return [];
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to update notification.");
      throw error;
    }
  };

  const markAllNotificationsAsRead = async (userId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setError("Failed to update notifications.");
      throw error;
    }
  };

  const createNotification = async (notificationData) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([notificationData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error creating notification:", error);
      setError("Failed to create notification.");
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
    updateUserPassword,
    createGuardUser,
    createResidentUser,
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
    getUserRole: () => userProfile?.role || "guest",
    isAdmin: () => userProfile?.role === "admin",
    isGuard: () => userProfile?.role === "guard",
    isResident: () => userProfile?.role === "resident",
    isSuperAdmin: () => userProfile?.role === "super_admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
