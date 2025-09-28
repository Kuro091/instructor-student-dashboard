import nodemailer, { SendMailOptions } from "nodemailer";

const emailHost = process.env.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

const isEmailConfigured = emailHost && emailPort && emailUser && emailPass;

let emailTransporter: nodemailer.Transporter | null = null;

if (isEmailConfigured) {
  emailTransporter = nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort!),
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
  console.log("✅ Email service configured successfully");
} else {
  console.warn("⚠️  Email not configured - using mock mode");
  emailTransporter = {
    sendMail: async (options: SendMailOptions) => {
      console.log(`📧 Mock Email to ${options.to}:`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.text || options.html}`);
      return { messageId: "mock-email-id" };
    },
  } as nodemailer.Transporter;
}

export { emailTransporter };
