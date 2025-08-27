import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const db = {
  // Estates
  async getEstates() {
    const { data, error } = await supabase
      .from('estates')
      .select(`
        *,
        estate_admins(count),
        guards(count),
        residents(count)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createEstate(estate) {
    const { data, error } = await supabase
      .from('estates')
      .insert([estate])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateEstate(id, updates) {
    const { data, error } = await supabase
      .from('estates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Estate Admins
  async getEstateAdmins(estateId) {
    const { data, error } = await supabase
      .from('estate_admins')
      .select('*')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createEstateAdmin(admin) {
    const { data, error } = await supabase
      .from('estate_admins')
      .insert([admin])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Guards
  async getGuards(estateId) {
    const { data, error } = await supabase
      .from('guards')
      .select('*')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createGuard(guard) {
    const { data, error } = await supabase
      .from('guards')
      .insert([guard])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateGuard(id, updates) {
    const { data, error } = await supabase
      .from('guards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteGuard(id) {
    const { error } = await supabase
      .from('guards')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Residents
  async getResidents(estateId) {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createResident(resident) {
    const { data, error } = await supabase
      .from('residents')
      .insert([resident])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateResident(id, updates) {
    const { data, error } = await supabase
      .from('residents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteResident(id) {
    const { error } = await supabase
      .from('residents')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Visitor Invites
  async getVisitorInvites(residentId) {
    const { data, error } = await supabase
      .from('visitor_invites')
      .select('*')
      .eq('resident_id', residentId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createVisitorInvite(invite) {
    // Generate OTP
    const { data: otpData } = await supabase.rpc('generate_otp')
    
    const inviteWithOtp = {
      ...invite,
      otp_code: otpData,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    const { data, error } = await supabase
      .from('visitor_invites')
      .insert([inviteWithOtp])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async verifyOTP(otpCode) {
    const { data, error } = await supabase
      .from('visitor_invites')
      .select(`
        *,
        residents(name, apartment_number),
        estates(name)
      `)
      .eq('otp_code', otpCode)
      .eq('status', 'approved')
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error) throw error
    return data
  },

  // Visitor Logs
  async createVisitorLog(log) {
    const { data, error } = await supabase
      .from('visitor_logs')
      .insert([log])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getVisitorLogs(estateId) {
    const { data, error } = await supabase
      .from('visitor_logs')
      .select(`
        *,
        visitor_invites(visitor_name, purpose),
        guards(name)
      `)
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Notifications
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createNotification(notification) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async markNotificationAsRead(id) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    
    if (error) throw error
  },

  // Residency Requests
  async getResidencyRequests(estateId) {
    const { data, error } = await supabase
      .from('residency_requests')
      .select(`
        *,
        residents(name, apartment_number)
      `)
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createResidencyRequest(request) {
    const { data, error } = await supabase
      .from('residency_requests')
      .insert([request])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateResidencyRequest(id, updates) {
    const { data, error } = await supabase
      .from('residency_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Demo Requests
  async createDemoRequest(request) {
    const { data, error } = await supabase
      .from('demo_requests')
      .insert([request])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Auth helper functions
export const auth = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async updateUser(updates) {
    const { data, error } = await supabase.auth.updateUser(updates)
    if (error) throw error
    return data
  }
}