import { supabase } from "./supabase";

/**
 * Minimal Super Admin Authentication Service
 * Simplified version with only essential functionality
 */

export const minimalSuperAdminAuth = {
  /**
   * Authenticate admin using the simplified system
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
          return {
            success: true,
            admin: {
              id: authResult.admin_id,
              type: authResult.admin_type,
              name: authResult.name,
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
   * Get dashboard statistics
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
};

export default minimalSuperAdminAuth;
