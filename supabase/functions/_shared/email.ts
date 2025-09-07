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
    await resend.emails.send({
      from: "noreply@minnit.ng",
      to: email,
      subject: "Your Login Credentials",
      html: `
        <p>Hello,</p>
        <p>Your account has been created. Here is your temporary password:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        <p>Please log in and change your password immediately.</p>
      `,
    });
    console.log("Password reset email sent successfully to", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email.");
  }
}
