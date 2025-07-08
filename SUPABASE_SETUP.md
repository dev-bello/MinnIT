# Supabase Database Setup Guide for MinnIT

This guide will help you set up your Supabase database for the MinnIT visitor management system.

## 🚀 Quick Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `minnit-visitor-management`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Your Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

### 3. Set Up Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Migrations

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the migrations in order:

#### Migration 1: Base Schema
```sql
-- Copy and paste the content from: supabase/migrations/20250702094415_green_frog.sql
```

#### Migration 2: Additional Functions
```sql
-- Copy and paste the content from: supabase/migrations/20250702100138_fragrant_heart.sql
```

#### Migration 3: Final Setup
```sql
-- Copy and paste the content from: supabase/migrations/20250702100318_pink_grass.sql
```

### 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure the following:

#### Email Templates
- **Confirm signup**: Customize the email template
- **Reset password**: Customize the email template
- **Magic link**: Customize the email template

#### Site URL
- Set your site URL (e.g., `http://localhost:5173` for development)

#### Redirect URLs
- Add: `http://localhost:5173/**`
- Add: `http://localhost:5173/reset-password`

### 6. Set Up Row Level Security (RLS)

The migrations include RLS policies, but verify they're working:

1. Go to **Authentication** → **Policies**
2. Ensure all tables have RLS enabled
3. Verify policies are created for each table

## 🗄️ Database Schema Overview

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `estates` | Property management | name, address, developer_id |
| `estate_admins` | Estate administrators | user_id, estate_id, role |
| `guards` | Security personnel | user_id, estate_id, shift_schedule |
| `residents` | Estate residents | user_id, estate_id, apartment_number |
| `visitor_invites` | Visitor invitations | resident_id, otp_code, status |
| `visitor_logs` | Entry/exit tracking | invite_id, guard_id, entry_time |
| `notifications` | System notifications | user_id, type, message |
| `residency_requests` | Maintenance requests | resident_id, type, status |

### User Roles Hierarchy

```
Developer (Super Admin)
├── Estate Admin
│   ├── Guards
│   └── Residents
└── Estate Admin
    ├── Guards
    └── Residents
```

## 🔐 Security Configuration

### Row Level Security Policies

The system implements the following security policies:

1. **Estates**: Only developers can manage their estates
2. **Estate Admins**: Admins can only access their assigned estate
3. **Guards**: Guards can only access their assigned estate
4. **Residents**: Residents can only access their assigned estate
5. **Visitor Invites**: Residents can only manage their own invites
6. **Visitor Logs**: Guards can only view logs for their estate
7. **Notifications**: Users can only view their own notifications

### Authentication Flow

1. User registers with email/password
2. Email confirmation required
3. User profile created based on role
4. Access granted based on RLS policies

## 🧪 Testing Your Setup

### 1. Test Database Connection

Run your development server:
```bash
npm run dev
```

Check the browser console for any connection errors.

### 2. Test User Registration

1. Go to your app
2. Click "Sign up"
3. Create a test account
4. Check your email for confirmation
5. Verify the user appears in Supabase Auth

### 3. Test Role Assignment

After registration, manually assign roles in Supabase:

```sql
-- Example: Make a user an estate admin
INSERT INTO estate_admins (
  unique_id,
  estate_id,
  user_id,
  name,
  email,
  role
) VALUES (
  'ADMIN001',
  'your-estate-id',
  'user-uuid-from-auth',
  'Admin Name',
  'admin@example.com',
  'admin'
);
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Error**
   - Verify your environment variables
   - Check if Supabase project is active
   - Ensure anon key is correct

2. **RLS Policy Errors**
   - Verify policies are created
   - Check user authentication status
   - Ensure proper role assignment

3. **Email Not Sending**
   - Check Supabase email settings
   - Verify site URL configuration
   - Check spam folder

4. **Migration Errors**
   - Run migrations in order
   - Check for syntax errors
   - Verify UUID extension is enabled

### Debug Commands

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check user roles
SELECT * FROM estate_admins WHERE user_id = 'your-user-id';
```

## 📊 Database Functions

The system includes these custom functions:

1. **generate_otp()**: Generates 6-digit OTP codes
2. **generate_unique_id()**: Creates unique identifiers
3. **update_updated_at()**: Auto-updates timestamp fields

## 🔄 Backup & Recovery

### Backup Strategy

1. **Automatic Backups**: Supabase provides daily backups
2. **Manual Backups**: Use Supabase CLI for custom backups
3. **Migration Versioning**: All schema changes are versioned

### Recovery Process

1. Restore from Supabase dashboard
2. Re-run migrations if needed
3. Verify data integrity

## 📈 Monitoring

### Key Metrics to Monitor

1. **Authentication Success Rate**
2. **Database Query Performance**
3. **Storage Usage**
4. **API Request Count**

### Supabase Dashboard

Monitor your project in the Supabase dashboard:
- **Database**: Query performance, storage
- **Authentication**: User signups, logins
- **API**: Request logs, errors
- **Storage**: File uploads, usage

## 🚀 Production Deployment

### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Security Checklist

- [ ] RLS policies enabled
- [ ] Email templates configured
- [ ] Site URL updated
- [ ] Redirect URLs configured
- [ ] Database backups enabled
- [ ] Monitoring alerts set up

## 📞 Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [Supabase Community](https://github.com/supabase/supabase/discussions)
3. Check your project logs in the Supabase dashboard

---

**Note**: Keep your database credentials secure and never commit them to version control. The `.env` file is already in your `.gitignore`. 