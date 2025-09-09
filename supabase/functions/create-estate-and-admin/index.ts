import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";
import { sendTemporaryPasswordEmail } from "../_shared/email.ts";

serve(async (req) => {
  // to invoke  function from a browser.
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

    // 2. Generate a temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8);

    // 3. Create the admin user
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email: admin_email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          role: "admin",
          estate_id: estateData.id,
          force_password_change: true,
        },
      });

    if (userError) {
      if (userError.message.includes("already registered")) {
        throw new Error("An admin with this email already exists.");
      }
      throw userError;
    }

    // 4. Insert the admin into the 'estate_admins' table
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("estate_admins")
      .insert([
        {
          id: userData.user.id,
          user_id: userData.user.id,
          estate_id: estateData.id,
          role: "admin",
          full_name: admin_email,
          email: admin_email,
        },
      ])
      .select()
      .single();

    if (adminError) throw adminError;

    // 5. Send the temporary password email
    await sendTemporaryPasswordEmail(admin_email, temporaryPassword);

    return new Response(
      JSON.stringify({
        success: true,
        estate: estateData,
        admin: adminData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
