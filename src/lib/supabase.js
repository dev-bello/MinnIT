import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  // Estates
  async getEstates({
    search,
    regStart,
    regEnd,
    expStart,
    expEnd,
    page = 1,
    limit = 10,
  } = {}) {
    let query = supabase
      .from("estates")
      .select(`*`, {
        count: "exact",
      })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`
      );
    }
    if (regStart) {
      query = query.gte("created_at", regStart);
    }
    if (regEnd) {
      query = query.lte("created_at", regEnd);
    }
    if (expStart) {
      query = query.gte("expiry_date", expStart);
    }
    if (expEnd) {
      query = query.lte("expiry_date", expEnd);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count };
  },

  async createEstate(estate) {
    const { data, error } = await supabase
      .from("estates")
      .insert([estate])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEstate(id, updates) {
    const { data, error } = await supabase
      .from("estates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Estate Admins
  async getEstateAdmins(estateId) {
    const { data, error } = await supabase
      .from("estate_admins")
      .select("*")
      .eq("estate_id", estateId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createEstateAndAdmin(estate, admin) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-estate-and-admin",
        {
          body: { estate, admin },
        }
      );

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error invoking function:", error);
      throw error;
    }
  },

  // Guards
  async getGuards(estateId) {
    const { data, error } = await supabase
      .from("guards")
      .select("*")
      .eq("estate_id", estateId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createGuard(guard) {
    const { data, error } = await supabase
      .from("guards")
      .insert([guard])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGuard(id, updates) {
    const { data, error } = await supabase
      .from("guards")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGuard(id) {
    const { error } = await supabase.from("guards").delete().eq("id", id);

    if (error) throw error;
  },

  async getTotalGuards() {
    const { count, error } = await supabase
      .from("guards")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count;
  },

  // Residents
  async getResidents(estateId) {
    const { data, error } = await supabase
      .from("residents")
      .select("*")
      .eq("estate_id", estateId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createResident(resident) {
    const { data, error } = await supabase
      .from("residents")
      .insert([resident])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateResident(id, updates) {
    const { data, error } = await supabase
      .from("residents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteResident(id) {
    const { error } = await supabase.from("residents").delete().eq("id", id);

    if (error) throw error;
  },

  async getTotalResidents() {
    const { count, error } = await supabase
      .from("residents")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count;
  },

  // Visitor Invites
  async getVisitorInvites(residentId) {
    const { data, error } = await supabase
      .from("visitor_invites")
      .select("*")
      .eq("resident_id", residentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createVisitorInvite(invite) {
    // Generate OTP
    const { data: otpData } = await supabase.rpc("generate_otp");

    const inviteWithOtp = {
      ...invite,
      otp_code: otpData,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    const { data, error } = await supabase
      .from("visitor_invites")
      .insert([inviteWithOtp])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async verifyOTP(otpCode) {
    const { data, error } = await supabase
      .from("visitor_invites")
      .select(
        `
        *,
        residents(name, apartment_number),
        estates(name)
      `
      )
      .eq("otp_code", otpCode)
      .eq("status", "approved")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error) throw error;
    return data;
  },

  // Visitor Logs
  async createVisitorLog(log) {
    const { data, error } = await supabase
      .from("visitor_logs")
      .insert([log])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getVisitorLogs(estateId) {
    const { data, error } = await supabase
      .from("visitor_logs")
      .select(
        `
        *,
        visitor_invites(visitor_name, purpose),
        guards(name)
      `
      )
      .eq("estate_id", estateId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Residency Requests
  async getResidencyRequests(estateId) {
    const { data, error } = await supabase
      .from("residency_requests")
      .select(
        `
        *,
        residents(name, apartment_number)
      `
      )
      .eq("estate_id", estateId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createResidencyRequest(request) {
    const { data, error } = await supabase
      .from("residency_requests")
      .insert([request])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateResidencyRequest(id, updates) {
    const { data, error } = await supabase
      .from("residency_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Demo Requests
  async createDemoRequest(request) {
    const { data, error } = await supabase
      .from("demo_requests")
      .insert([request])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDemoRequests({ page = 1, limit = 10 } = {}) {
    let query = supabase
      .from("demo_requests")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count };
  },

  async getTotalDemoRequests() {
    const { count, error } = await supabase
      .from("demo_requests")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count;
  },
};

// Auth helper functions
export const auth = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async updateUser(updates) {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  },
};
