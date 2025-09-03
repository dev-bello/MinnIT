import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

// WARNING: Do not expose this in client-side code.
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
