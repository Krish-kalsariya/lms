import nodemailer from "nodemailer";

const getTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000, // 15s connection timeout to prevent hanging on cloud servers
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("EMAIL_USER or EMAIL_PASS environment variable is missing!");
      throw new Error("Server email configuration is missing (EMAIL_USER/EMAIL_PASS).");
    }

    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `Brainera LMS <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email successfully sent to ${to}`);
  } catch (error) {
    console.error("Email sending error:", error.message || error);
    throw error;
  }
};


