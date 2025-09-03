# Supabase Estate Management Auth Flow

This document outlines the step-by-step process for creating estates, inviting administrators, and managing residents and guards using Supabase. The key principle is that no public signup page is exposed; all users are created via the admin API and invited to set their own passwords.

---

## How it Works (Step-by-Step)

### 1. Super Admin Creates an Estate + First Admin

First, the platform owner (Super Admin) creates an `estate` entry in the `estates` table.

Simultaneously, the Super Admin creates the first Admin account for that estate using Supabase’s Admin API. This ensures the user is created securely without requiring a public signup form.

**Example using `supabase-js` on the server-side:**

```javascript
// Example using supabase-js server-side
const { data, error } = await supabase.auth.admin.createUser({
  email: "estateadmin@example.com",
  email_confirm: true, // User is instantly confirmed
  user_metadata: { role: "admin", estate_id: "estate_123" },
});
```

After this step, the admin user exists in Supabase Auth. You can then either set a temporary password for them or, preferably, immediately send them a password reset link to set their own password.

### 2. Generate Invite / Magic Link

Supabase's `resetPasswordForEmail` function can be used as an invitation link. After creating the user, call this function to send them an email.

```javascript
await supabase.auth.resetPasswordForEmail("estateadmin@example.com", {
  redirectTo: "https://yourapp.com/auth/callback",
});
```

The user will receive an email with a link. When they click it, they will be directed to a page where they can set their password, similar to a "Create Account" flow. This process ensures that only invited email addresses can create an account.

### 3. Admin Invites Residents & Guards

Once the Estate Admin logs into their dashboard, they will have options like "Invite Guard" or "Invite Resident."

When the admin invites a new user, the application again calls `auth.admin.createUser()` with the appropriate role (`guard` or `resident`) and the same `estate_id`.

```javascript
// Create the guard or resident user
await supabase.auth.admin.createUser({
  email: "guard1@estate.com",
  email_confirm: true,
  user_metadata: { role: "guard", estate_id: "estate_123" },
});

// Then send the invite link
await supabase.auth.resetPasswordForEmail("guard1@estate.com", {
  redirectTo: "https://yourapp.com/auth/callback",
});
```

The new guard or resident receives an email, clicks the link to set their password, and can then log in.

### 4. Row Level Security (RLS) Keeps Estates Separate

To ensure data privacy and separation between different estates, Row Level Security (RLS) policies must be implemented in your Supabase database.

The policies should enforce the following rules:

- **Residents/Guards:** Can only view or modify rows that match their `estate_id`.
- **Admins:** Can only manage data associated with their own estate's `estate_id`.
- **Super Admin:** Has unrestricted access to all estates' data.

---

## 🎯 Why This Approach Fits Your Requirements

- **No Public Signup:** All users are created programmatically via the secure admin API.
- **User-Created Passwords:** Users set their own passwords through the secure invite/reset link.
- **Scalability:** Supabase's authentication service can handle thousands of users efficiently.
- **Role-Based Access Control:** Roles and estate affiliations are enforced through user metadata and RLS policies.

In short, this flow eliminates the need for a public signup page. The entire user management process is handled by creating users via `auth.admin.createUser()` and sending them an invite link to set their password.
