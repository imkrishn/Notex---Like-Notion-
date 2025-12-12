"use server";

export async function sendVerificationEmail(
  email: string,
  username: string,
  otp: string,
  type: "signup" | "reset"
) {
  const bodyStructure = ` 
  <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table align="center" cellpadding="0" cellspacing="0" width="100%" 
           style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      <tr>
        <td style="padding:30px;text-align:left;color:#333333;">
          <p style="font-size:18px;margin:0;">Hi <b>${username}</b>,</p>
          <p style="margin:15px 0;font-size:16px;line-height:1.6;">
            ${
              type === "signup"
                ? "Thank you for signing up! Please use the following OTP to verify your email address:"
                : "Please use the following OTP to reset your credentials"
            }
          </p>
          <p style="margin:30px 0;text-align:center;">
            <span style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:28px;font-weight:bold;letter-spacing:4px;padding:12px 25px;border-radius:6px;">
              ${otp}
            </span>
          </p>
          <p style="font-size:14px;color:#666;line-height:1.6;">
            This OTP will expire in <b>15 minutes</b>. If you did not request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb;text-align:center;padding:15px;color:#999999;font-size:12px;">
          © 2030 Notex. All rights reserved.
        </td>
      </tr>
    </table>
  </body>`;

  try {
    const response = await fetch(process.env.BREVO_ENDPOINT!, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY as string,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_USER, name: "Notex" },
        to: [{ email, name: username }],
        subject: "Your OTP Verification Code From Notex",
        htmlContent: bodyStructure,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    console.log("Email sent");
  } catch (err) {
    console.error(" Email send failed:", err);
  }
}
