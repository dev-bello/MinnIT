import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

// WARNING: Do not expose this in client-side code.

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Function received a request.");

    // Initialize client inside the handler to ensure logs appear even if secrets are wrong
    const supabaseAdmin = createClient(
      Deno.env.get("PROJECT_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Request body:", body);

    const { estate_data, admin_email } = body;

    if (!estate_data || !admin_email) {
      throw new Error(
        "Estate data and admin email are required in the request body."
      );
    }

    // 1. Create the estate
    const { data: estateData, error: estateError } = await supabaseAdmin
      .from("estates")
      .insert(estate_data)
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
