import { Resend } from "https://esm.sh/resend@3.2.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is not set in environment variables.");
}

const resend = new Resend(resendApiKey);

export async function sendTemporaryPasswordEmail(
  email: string,
  temporaryPassword: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "MinnIT <onboarding@resend.dev>",
      to: email,
      subject: "Your Login Credentials",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; width: 100%; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <p>Hello,</p>
        <p>Your account has been created. Here is your temporary password:</p>
        <p style="color: red;"><strong>Email:</strong> ${email}</p>
        <p style="color: red;"><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <a href="https://minnit.vercel.app/login">Click here to log in</a>
      </div>
        `,
    });

    if (error) {
      throw error;
    }

    console.log(
      `Temporary password email sent successfully to ${email}. Response: ${JSON.stringify(
        data
      )}`
    );
  } catch (error) {
    console.error(`Error sending temporary password email to ${email}:`, error);
    throw new Error(`Failed to send temporary password email to ${email}.`);
  }
}
