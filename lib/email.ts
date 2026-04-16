import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to, subject, html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Email not configured - skipping");
    return;
  }
  await transporter.sendMail({
    from: `"OGH SCD E-Tracker" <${process.env.GMAIL_USER}>`,
    to, subject, html,
  });
}

export function welcomeEmailHtml(fullName: string): string {
  return `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:2rem">
      <div style="background:#1a5276;color:#fff;padding:1.5rem;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="margin:0;font-size:1.5rem">OGH SCD E-Tracker</h1>
        <p style="margin:0.5rem 0 0;opacity:0.8;font-size:0.85rem">Oda Government Hospital</p>
      </div>
      <div style="background:#fff;padding:2rem;border:1px solid #e0e0e0;border-radius:0 0 8px 8px">
        <h2 style="color:#1a5276">Welcome, ${fullName}!</h2>
        <p>Your account has been created on the OGH SCD Screening E-Tracker platform.</p>
        <p><strong>Your role:</strong> Screener</p>
        <p>You can now log in and start adding screening records.</p>
        <div style="background:#f8f9fa;padding:1rem;border-radius:6px;margin:1rem 0">
          <p style="margin:0;font-size:0.85rem;color:#666">
            If your role needs to be upgraded to Manager, contact your system administrator.
          </p>
        </div>
        <p style="color:#999;font-size:0.8rem;margin-top:2rem">
          OGH SCD E-Tracker · Oda Government Hospital<br/>
          Birim Central Municipal · Eastern Region · Ghana
        </p>
      </div>
    </div>
  `;
}

export function passwordResetEmailHtml(fullName: string, tempPassword: string): string {
  return `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:2rem">
      <div style="background:#1a5276;color:#fff;padding:1.5rem;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="margin:0;font-size:1.5rem">OGH SCD E-Tracker</h1>
        <p style="margin:0.5rem 0 0;opacity:0.8;font-size:0.85rem">Password Reset</p>
      </div>
      <div style="background:#fff;padding:2rem;border:1px solid #e0e0e0;border-radius:0 0 8px 8px">
        <h2 style="color:#1a5276">Password Reset — ${fullName}</h2>
        <p>Your password has been reset by an administrator.</p>
        <div style="background:#fff3cd;padding:1rem;border-radius:6px;border:1px solid #ffc107;margin:1rem 0">
          <p style="margin:0;font-size:0.9rem"><strong>Temporary Password:</strong></p>
          <p style="margin:0.5rem 0 0;font-size:1.2rem;font-family:monospace;color:#1a5276">
            ${tempPassword}
          </p>
        </div>
        <p style="color:#dc3545;font-size:0.85rem">
          Please log in and change this password immediately from My Profile.
        </p>
        <p style="color:#999;font-size:0.8rem;margin-top:2rem">
          OGH SCD E-Tracker · Oda Government Hospital
        </p>
      </div>
    </div>
  `;
}
