const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Reusable transporter object using the default SMTP transport (Gmail in this case)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
          rejectUnauthorized: false
      }
    });

    // Define the email payload configuration
    const mailOptions = {
      from: `CivicEye Admin Platform <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    // Dispatch the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Automated Email Successfully Dispatched to ${options.email} [ID: ${info.messageId}]`);
  } catch (error) {
    console.error('❌ FATAL: Automated Email Engine failed to broadcast message:', error.message);
  }
};

module.exports = sendEmail;
