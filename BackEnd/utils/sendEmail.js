import nodemailer from "nodemailer";

// Verify environment variables upfront
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("Warning: EMAIL_USER or EMAIL_PASS environment variables are missing.");
}

export const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password generated from Google Account
  },
  pool: true,
  maxConnections: 5,
  // ADD THIS BLOCK TO BYPASS THE SELF-SIGNED CERTIFICATE ERROR
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'App Service'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      ...(html && { html }),
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to} [Message ID: ${info.messageId}]`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

export default sendEmail;