# Implementation Guide: Integrating Supabase Auth Flow

This guide provides a practical, step-by-step approach to integrating the authentication flow described in `SUPABASE_AUTH_FLOW.md` into your existing React application.

---

## Step 1: Create the Supabase Edge Function

The core logic for creating a new estate and its first admin should reside in a secure Supabase Edge Function. This prevents exposing admin-level Supabase keys on the client-side.

**File to Edit:** [`supabase/functions/create-estate-and-admin/index.ts`](supabase/functions/create-estate-and-admin/index.ts:1)

Your function should perform the following actions:

1.  Receive a request containing the new estate's name and the admin's email.
2.  Create a Supabase client with the `service_role` key to perform admin actions.
3.  Insert a new record into your `estates` table.
4.  Use the returned `estate_id` to create a new user with `supabase.auth.admin.createUser()`.
    - Set `user_metadata` to `{ role: 'admin', estate_id: new_estate_id }`.
5.  Send a password reset/invitation email to the new admin using `supabase.auth.resetPasswordForEmail()`.
6.  Return a success or error response.

**Example Implementation (`index.ts`):**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// WARNING: Do not expose this in client-side code.
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  try {
    const { estate_name, admin_email } = await req.json();

    // 1. Create the estate
    const { data: estateData, error: estateError } = await supabaseAdmin
      .from("estates")
      .insert({ name: estate_name })
      .select()
      .single();

    if (estateError) throw estateError;

    // 2. Create the admin user
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email: admin_email,
        email_confirm: true,
        user_metadata: { role: "admin", estate_id: estateData.id },
      });

    if (userError) throw userError;

    // 3. Send the invitation email
    const { error: inviteError } =
      await supabaseAdmin.auth.resetPasswordForEmail(admin_email, {
        redirectTo: "https://yourapp.com/auth/set-password", // Your callback URL
      });

    if (inviteError) throw inviteError;

    return new Response(JSON.stringify({ success: true, estate: estateData }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

**Action:** Deploy this function to Supabase using the CLI: `supabase functions deploy create-estate-and-admin`.

---

## Step 2: Frontend Integration (Super Admin)

The Super Admin needs a UI to trigger this Edge Function. This will likely be a form in your Super Admin dashboard.

**File to Edit:** [`src/components/views/superadmin/SuperAdminEstates.jsx`](src/components/views/superadmin/SuperAdminEstates.jsx:1)

1.  **Create a Form:** Add a form with fields for "Estate Name" and "Admin Email".
2.  **Invoke the Function:** On form submission, use your client-side Supabase instance to invoke the Edge Function.

**Example Form Handler:**

```javascript
import { supabase } from "../../../lib/supabase"; // Your client-side Supabase instance

const handleCreateEstate = async (e) => {
  e.preventDefault();
  const estateName = e.target.estateName.value;
  const adminEmail = e.target.adminEmail.value;

  const { data, error } = await supabase.functions.invoke(
    "create-estate-and-admin",
    {
      body: { estate_name: estateName, admin_email: adminEmail },
    }
  );

  if (error) {
    console.error("Error creating estate:", error.message);
    // Show error notification
  } else {
    console.log("Estate created successfully:", data);
    // Show success notification and refresh the estates list
  }
};
```

---

## Step 3: Handle the Auth Callback

When a new user clicks the link in their invitation email, they will be redirected to your app. You need a dedicated route and component to handle this.

1.  **Create a New Route:** In your app's router (e.g., in [`src/App.jsx`](src/App.jsx:1)), create a route like `/auth/set-password`.
2.  **Create a Component:** This component will display a form with "Password" and "Confirm Password" fields.
3.  **Update the User:** When the user submits the form, use `supabase.auth.updateUser()` to set their password. Supabase automatically handles the session and access token from the URL.

**Example `SetPassword.jsx` Component:**

```javascript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const SetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  // This effect handles the session from the magic link
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // You can add logic here if needed, but the main part is updateUser
      }
    });
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      console.error("Error setting password:", error.message);
    } else {
      // Redirect to the appropriate dashboard after password is set
      navigate("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSetPassword}>
      <h2>Set Your Password</h2>
      <input
        type="password"
        placeholder="Enter your new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Save Password</button>
    </form>
  );
};

export default SetPassword;
```

---

## Step 4: Implement RLS Policies

Go to your Supabase project's dashboard -> Auth -> Policies.

1.  **Enable RLS:** For each table that contains estate-specific data (e.g., `residents`, `guards`, `invites`), enable Row Level Security.
2.  **Create Policies:** Write policies that check the user's metadata.

**Example Policy for a `residents` table (SELECT):**
This policy allows a user to see residents only if the `estate_id` in the `residents` table matches the `estate_id` in their own auth token metadata.

- **Policy Name:** `Allow access based on estate_id`
- **Target Roles:** `authenticated`
- **USING expression:** `(auth.jwt() ->> 'user_metadata' ->> 'estate_id')::uuid = estate_id`

Create similar policies for `INSERT`, `UPDATE`, and `DELETE` to secure your data. Admins might have broader permissions, which you can define by checking `(auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin'`.
