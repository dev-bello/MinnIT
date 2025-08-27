import { supabase } from "./supabase";

/**
 * Super Admin Authentication Service
 * Handles authentication for both super admins and estate admins
 * using the new unified credential system
 */

export const superAdminAuth = {
  /**
   * Authenticate admin using the new unified system
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<{success: boolean, admin?: object, message?: string}>}
   */
  async authenticateAdmin(email, password) {
    try {
      const { data, error } = await supabase.rpc("authenticate_admin", {
        p_email: email,
        p_password: password,
      });

      if (error) {
        console.error("Authentication error:", error);
        return { success: false, message: "Authentication failed" };
      }

      if (data && data.length > 0) {
        const authResult = data[0];

        if (authResult.success) {
          // Create session
          const sessionToken = await this.createSession(
            authResult.admin_id,
            authResult.admin_type
          );

          return {
            success: true,
            admin: {
              id: authResult.admin_id,
              type: authResult.admin_type,
              name: authResult.name,
              permissions: authResult.permissions,
              sessionToken,
            },
          };
        } else {
          return { success: false, message: authResult.message };
        }
      }

      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      console.error("Authentication error:", error);
      return { success: false, message: "Authentication failed" };
    }
  },

  /**
   * Create admin session
   * @param {string} adminId - Admin ID
   * @param {string} adminType - Admin type (super_admin or estate_admin)
   * @returns {Promise<string>} Session token
   */
  async createSession(adminId, adminType) {
    try {
      const { data, error } = await supabase.rpc("create_admin_session", {
        p_admin_id: adminId,
        p_admin_type: adminType,
        p_ip_address: await this.getClientIP(),
        p_user_agent: navigator.userAgent,
      });

      if (error) {
        console.error("Session creation error:", error);
        return null;
      }

      // Store session token
      localStorage.setItem("admin_session_token", data);
      localStorage.setItem(
        "admin_session_expires",
        Date.now() + 24 * 60 * 60 * 1000
      ); // 24 hours

      return data;
    } catch (error) {
      console.error("Session creation error:", error);
      return null;
    }
  },

  /**
   * Validate current session
   * @returns {Promise<{valid: boolean, admin?: object}>}
   */
  async validateSession() {
    try {
      const sessionToken = localStorage.getItem("admin_session_token");
      const sessionExpires = localStorage.getItem("admin_session_expires");

      if (!sessionToken || !sessionExpires) {
        return { valid: false };
      }

      // Check local expiration first
      if (Date.now() > parseInt(sessionExpires)) {
        this.clearSession();
        return { valid: false };
      }

      const { data, error } = await supabase.rpc("validate_admin_session", {
        p_session_token: sessionToken,
      });

      if (error || !data || data.length === 0) {
        this.clearSession();
        return { valid: false };
      }

      const sessionData = data[0];
      if (sessionData.is_valid) {
        return {
          valid: true,
          admin: {
            id: sessionData.admin_id,
            type: sessionData.admin_type,
          },
        };
      } else {
        this.clearSession();
        return { valid: false };
      }
    } catch (error) {
      console.error("Session validation error:", error);
      this.clearSession();
      return { valid: false };
    }
  },

  /**
   * Clear session data
   */
  clearSession() {
    localStorage.removeItem("admin_session_token");
    localStorage.removeItem("admin_session_expires");
    localStorage.removeItem("admin_data");
  },

  /**
   * Logout admin
   */
  async logout() {
    const sessionToken = localStorage.getItem("admin_session_token");

    if (sessionToken) {
      try {
        // Invalidate session in database
        await supabase
          .from("admin_sessions")
          .update({ is_active: false })
          .eq("session_token", sessionToken);
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    this.clearSession();
  },

  /**
   * Get dashboard statistics (super admin only)
   * @returns {Promise<object>} Dashboard stats
   */
  async getDashboardStats() {
    try {
      const { data, error } = await supabase.rpc(
        "get_super_admin_dashboard_stats"
      );

      if (error) {
        console.error("Dashboard stats error:", error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return null;
    }
  },

  /**
   * Create estate admin with credentials
   * @param {object} adminData - Admin data
   * @returns {Promise<{success: boolean, adminId?: string, message?: string}>}
   */
  async createEstateAdmin(adminData) {
    try {
      const { data, error } = await supabase.rpc(
        "create_estate_admin_with_credentials",
        {
          p_estate_id: adminData.estateId,
          p_name: adminData.name,
          p_email: adminData.email,
          p_phone: adminData.phone,
          p_password: adminData.password,
          p_created_by_super_admin: adminData.createdBy,
        }
      );

      if (error) {
        console.error("Create admin error:", error);
        return { success: false, message: "Failed to create admin" };
      }

      if (data && data.length > 0) {
        const result = data[0];
        return {
          success: result.success,
          adminId: result.admin_id,
          message: result.message,
        };
      }

      return { success: false, message: "Unknown error" };
    } catch (error) {
      console.error("Create admin error:", error);
      return { success: false, message: "Failed to create admin" };
    }
  },

  /**
   * Update admin password
   * @param {string} adminId - Admin ID
   * @param {string} adminType - Admin type
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>}
   */
  async updateAdminPassword(adminId, adminType, newPassword) {
    try {
      const { data, error } = await supabase.rpc("update_admin_password", {
        p_admin_id: adminId,
        p_admin_type: adminType,
        p_new_password: newPassword,
      });

      if (error) {
        console.error("Password update error:", error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error("Password update error:", error);
      return false;
    }
  },

  /**
   * Get client IP address (simplified)
   * @returns {Promise<string>}
   */
  async getClientIP() {
    try {
      // In a real application, you might want to use a service to get the real IP
      // For now, we'll return a placeholder
      return "0.0.0.0";
    } catch (error) {
      return "0.0.0.0";
    }
  },

  /**
   * Get audit logs
   * @param {number} limit - Number of logs to fetch
   * @returns {Promise<Array>}
   */
  async getAuditLogs(limit = 50) {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(
          `
          *,
          super_admins!inner(name),
          estate_admins!inner(name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Audit logs error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Audit logs error:", error);
      return [];
    }
  },

  /**
   * Get system analytics
   * @param {string} estateId - Estate ID (optional, for estate-specific analytics)
   * @returns {Promise<Array>}
   */
  async getSystemAnalytics(estateId = null) {
    try {
      let query = supabase
        .from("system_analytics")
        .select("*")
        .order("recorded_at", { ascending: false });

      if (estateId) {
        query = query.eq("estate_id", estateId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("System analytics error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("System analytics error:", error);
      return [];
    }
  },
};

export default superAdminAuth;
