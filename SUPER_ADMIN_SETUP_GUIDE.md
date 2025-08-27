# Super Admin Dashboard Setup Guide

This guide explains how to set up and use the super admin dashboard functionality for your MinnIT visitor management system using Supabase.

## 🚀 Quick Setup

### 1. Run the SQL Script

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Copy and paste the entire content from `supabase_super_admin_setup.sql`
4. Click **Run** to execute the script

### 2. Default Super Admin Credentials

After running the script, you'll have a default super admin account:

- **Email**: `admin@minnit.com`
- **Password**: `SuperAdmin123!`

⚠️ **IMPORTANT**: Change these credentials immediately after first login!

## 📋 What the Script Creates

### New Tables

1. **`super_admins`** - Platform-wide administrators
2. **`admin_credentials`** - Shared authentication for all admin types
3. **`admin_sessions`** - Session management for admins
4. **`system_analytics`** - Dashboard metrics and analytics
5. **`audit_logs`** - Tracks all admin actions

### Enhanced Existing Tables

- **`estates`** - Added super admin tracking, status, subscription info
- **`estate_admins`** - Added super admin reference and permissions

## 🔐 Authentication System

### How It Works

1. **Unified Login**: Both super admins and estate admins use the same login system
2. **Shared Credentials**: All admin credentials are stored in `admin_credentials` table
3. **Role-Based Access**: Different permissions based on admin type
4. **Session Management**: Secure session tokens with expiration

### Admin Types

- **`super_admin`**: Platform-wide access, can manage all estates and admins
- **`estate_admin`**: Limited to specific estate management

## 🛠️ Key Functions

### Authentication Functions

```sql
-- Authenticate any admin type
SELECT * FROM public.authenticate_admin('email@example.com', 'password');

-- Create admin session
SELECT public.create_admin_session(admin_id, 'super_admin', '192.168.1.1', 'Mozilla/5.0...');

-- Validate session
SELECT * FROM public.validate_admin_session('session_token_here');
```

### Admin Management Functions

```sql
-- Create estate admin with credentials
SELECT * FROM public.create_estate_admin_with_credentials(
    estate_id, 'Admin Name', 'admin@estate.com', '+1234567890', 'password123', super_admin_id
);

-- Update admin password
SELECT public.update_admin_password(admin_id, 'estate_admin', 'new_password');

-- Generate password hash
SELECT * FROM public.generate_password_hash('password123');
```

### Dashboard Functions

```sql
-- Get dashboard statistics
SELECT * FROM public.get_super_admin_dashboard_stats();
```

## 🎯 Usage Examples

### 1. Creating a New Estate with Admin

```sql
-- First, create the estate
INSERT INTO public.estates (
    name, subdomain, address, city, state, country,
    contact_email, contact_phone, super_admin_id
) VALUES (
    'Sunset Gardens', 'sunset', '123 Main St', 'Lagos', 'Lagos', 'Nigeria',
    'contact@sunset.com', '+2341234567890', 'super_admin_id_here'
);

-- Then create the estate admin
SELECT * FROM public.create_estate_admin_with_credentials(
    'estate_id_here',
    'John Doe',
    'john@sunset.com',
    '+2341234567890',
    'TempPassword123!',
    'super_admin_id_here'
);
```

### 2. Authenticating an Admin

```sql
-- Login attempt
SELECT * FROM public.authenticate_admin('john@sunset.com', 'TempPassword123!');

-- If successful, create session
SELECT public.create_admin_session(
    'admin_id_from_auth_result',
    'estate_admin',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
);
```

### 3. Getting Dashboard Data

```sql
-- Super admin dashboard stats
SELECT * FROM public.get_super_admin_dashboard_stats();

-- Recent admin actions
SELECT
    al.*,
    CASE
        WHEN al.admin_type = 'super_admin' THEN sa.name
        ELSE ea.name
    END as admin_name
FROM public.audit_logs al
LEFT JOIN public.super_admins sa ON al.admin_id = sa.id AND al.admin_type = 'super_admin'
LEFT JOIN public.estate_admins ea ON al.admin_id = ea.id AND al.admin_type = 'estate_admin'
ORDER BY al.created_at DESC
LIMIT 50;
```

## 🔒 Security Features

### Password Security

- SHA-256 hashing with random salt
- Failed login attempt tracking
- Account lockout after 5 failed attempts (30 minutes)

### Session Security

- Secure random session tokens
- 24-hour session expiration
- IP address and user agent tracking
- Session invalidation on logout

### Row Level Security (RLS)

- Super admins can access all data
- Estate admins limited to their estate data
- Audit logs track all admin actions

## 🎨 Frontend Integration

### Authentication Flow

```javascript
// Login function for your React app
const loginAdmin = async (email, password) => {
  const { data, error } = await supabase.rpc("authenticate_admin", {
    p_email: email,
    p_password: password,
  });

  if (data && data.success) {
    // Create session
    const { data: sessionData } = await supabase.rpc("create_admin_session", {
      p_admin_id: data.admin_id,
      p_admin_type: data.admin_type,
      p_ip_address: await getClientIP(),
      p_user_agent: navigator.userAgent,
    });

    // Store session token
    localStorage.setItem("admin_session", sessionData);

    return {
      success: true,
      admin: {
        id: data.admin_id,
        type: data.admin_type,
        name: data.name,
        permissions: data.permissions,
      },
    };
  }

  return { success: false, message: data?.message || "Login failed" };
};
```

### Dashboard Data Fetching

```javascript
// Get dashboard stats
const getDashboardStats = async () => {
  const { data, error } = await supabase.rpc("get_super_admin_dashboard_stats");
  return data;
};

// Get estates for super admin
const getEstates = async () => {
  const { data, error } = await supabase
    .from("estates")
    .select(
      `
      *,
      estate_admins(count),
      guards(count),
      residents(count)
    `
    )
    .order("created_at", { ascending: false });

  return data;
};
```

## 🔧 Customization

### Adding New Super Admin

```sql
-- Create new super admin
INSERT INTO public.super_admins (
    name, email, phone, permissions
) VALUES (
    'Jane Smith',
    'jane@minnit.com',
    '+2341234567891',
    '{"manage_estates": true, "manage_admins": true, "view_analytics": true}'::jsonb
);

-- Get the ID and create credentials
-- (Use the create_estate_admin_with_credentials function as a template)
```

### Updating Permissions

```sql
-- Update super admin permissions
UPDATE public.super_admins
SET permissions = '{"manage_estates": true, "manage_admins": true, "view_analytics": true, "system_settings": true}'::jsonb
WHERE email = 'admin@minnit.com';

-- Update estate admin permissions
UPDATE public.estate_admins
SET permissions = '{"manage_residents": true, "manage_guards": true, "view_reports": true, "manage_visitors": true}'::jsonb
WHERE email = 'admin@estate.com';
```

## 📊 Monitoring and Analytics

### View System Analytics

```sql
-- Insert custom metrics
INSERT INTO public.system_analytics (metric_name, metric_value, metric_type, estate_id)
VALUES ('monthly_visitors', 1250, 'count', 'estate_id_here');

-- View analytics
SELECT
    metric_name,
    metric_value,
    metric_type,
    recorded_at,
    CASE WHEN estate_id IS NULL THEN 'System-wide' ELSE e.name END as scope
FROM public.system_analytics sa
LEFT JOIN public.estates e ON sa.estate_id = e.id
ORDER BY recorded_at DESC;
```

### Audit Trail

```sql
-- View recent admin actions
SELECT
    al.action,
    al.resource_type,
    al.created_at,
    CASE
        WHEN al.admin_type = 'super_admin' THEN sa.name
        ELSE ea.name
    END as admin_name,
    al.admin_type
FROM public.audit_logs al
LEFT JOIN public.super_admins sa ON al.admin_id = sa.id AND al.admin_type = 'super_admin'
LEFT JOIN public.estate_admins ea ON al.admin_id = ea.id AND al.admin_type = 'estate_admin'
WHERE al.created_at >= NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC;
```

## 🚨 Troubleshooting

### Common Issues

1. **"No direct access to admin credentials" error**

   - This is expected! Use the authentication functions instead of direct queries

2. **RLS policy blocking access**

   - Ensure the user has proper super admin or estate admin role
   - Check that `is_active = true` in the admin tables

3. **Session validation failing**
   - Check if session has expired (24 hours)
   - Verify session token is correct
   - Ensure session is marked as active

### Debug Queries

```sql
-- Check if user is super admin
SELECT * FROM public.super_admins WHERE user_id = auth.uid();

-- Check admin credentials (only works via functions)
SELECT public.authenticate_admin('email@example.com', 'password');

-- Check active sessions
SELECT * FROM public.admin_sessions WHERE expires_at > NOW() AND is_active = true;

-- View RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename LIKE '%admin%';
```

## 🔄 Maintenance

### Regular Tasks

1. **Clean expired sessions**

```sql
DELETE FROM public.admin_sessions
WHERE expires_at < NOW() - INTERVAL '7 days';
```

2. **Archive old audit logs**

```sql
-- Archive logs older than 1 year
DELETE FROM public.audit_logs
WHERE created_at < NOW() - INTERVAL '1 year';
```

3. **Update analytics**

```sql
-- Run daily to update system metrics
INSERT INTO public.system_analytics (metric_name, metric_value, metric_type)
SELECT
    'daily_active_estates',
    COUNT(*),
    'count'
FROM public.estates
WHERE status = 'active';
```

## 📞 Support

If you encounter issues:

1. Check the Supabase logs in your dashboard
2. Verify RLS policies are correctly applied
3. Ensure all required extensions are enabled
4. Check that the script ran without errors

---

**Security Note**: Always use HTTPS in production and regularly update passwords. The default credentials are for initial setup only and should be changed immediately.
