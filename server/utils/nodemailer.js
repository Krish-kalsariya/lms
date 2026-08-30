import nodemailer from "nodemailer";

// Strategy 1: service: "gmail"
const getGmailServiceTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

// Strategy 2: Port 587 explicit STARTTLS
const getPort587Transporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS upgraded via STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

// Strategy 3: Port 465 explicit SSL/TLS
const getPort465Transporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

export const sendEmail = async ({ to, subject, html }) => {
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

  // Strategy 1: service "gmail"
  try {
    const transporter = getGmailServiceTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to} via Gmail service`);
    return;
  } catch (err1) {
    console.warn(`Gmail service transport failed: ${err1.message}. Trying Port 587...`);
  }

  // Strategy 2: Port 587 (STARTTLS)
  try {
    const transporter = getPort587Transporter();
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to} via Port 587`);
    return;
  } catch (err2) {
    console.warn(`Port 587 transport failed: ${err2.message}. Trying Port 465...`);
  }

  // Strategy 3: Port 465 (SSL)
  try {
    const transporter = getPort465Transporter();
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to} via Port 465`);
    return;
  } catch (err3) {
    console.error(`All email transport strategies failed. Last error: ${err3.message}`);
    throw err3;
  }
};



