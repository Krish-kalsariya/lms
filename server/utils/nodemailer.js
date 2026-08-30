import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  // Option A: HTTP Webhook (e.g., Google Apps Script Webhook URL)
  if (process.env.EMAIL_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.EMAIL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, html, from: process.env.EMAIL_USER }),
      });
      if (response.ok) {
        console.log(`Email successfully sent to ${to} via HTTP Webhook!`);
        return;
      }
      console.warn("HTTP Webhook returned status:", response.status);
    } catch (webhookErr) {
      console.warn("HTTP Webhook send failed:", webhookErr.message);
    }
  }

  // Option B: Brevo API (HTTPS REST API over Port 443 - 300 free emails/day to ANY recipient email!)
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Brainera LMS", email: process.env.EMAIL_USER || "error22.prof@gmail.com" },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`Email successfully sent to ${to} via Brevo HTTP API!`);
        return;
      }
      console.warn("Brevo API error:", data);
    } catch (brevoErr) {
      console.warn("Brevo API send failed:", brevoErr.message);
    }
  }

  // Option C: Resend API (HTTPS REST API over Port 443)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Brainera LMS <onboarding@resend.dev>",
          to: [to],
          subject: subject,
          html: html,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`Email successfully sent to ${to} via Resend HTTP API!`);
        return;
      }
      console.warn("Resend API error:", data);
    } catch (resendErr) {
      console.warn("Resend API send failed:", resendErr.message);
    }
  }

  // Option C: Nodemailer SMTP (Works on localhost & cloud hosts without outbound SMTP port blocking)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("EMAIL_USER or EMAIL_PASS environment variable is missing!");
    throw new Error("Server email configuration is missing (EMAIL_USER/EMAIL_PASS).");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `Brainera LMS <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const getTransporter = (options) =>
    nodemailer.createTransport({
      ...options,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 4000,
    });

  // Try Gmail Service
  try {
    const transporter = getTransporter({ service: "gmail" });
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to} via Gmail service`);
    return;
  } catch (err1) {
    console.warn(`Gmail service transport failed: ${err1.message}`);
  }

  // Try Port 587
  try {
    const transporter = getTransporter({ host: "smtp.gmail.com", port: 587, secure: false });
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to} via Port 587`);
    return;
  } catch (err2) {
    console.warn(`Port 587 transport failed: ${err2.message}`);
  }

  // Try Port 465
  try {
    const transporter = getTransporter({ host: "smtp.gmail.com", port: 465, secure: true });
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to} via Port 465`);
    return;
  } catch (err3) {
    console.error(`All email transport strategies failed. Last error: ${err3.message}`);
    throw err3;
  }
};




