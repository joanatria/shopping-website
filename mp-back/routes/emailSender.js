const nodemailer = require('nodemailer');

// Create a transporter object using the SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com', // Replace with your SMTP server host
  port: 587, // Replace with your SMTP server port
  secure: false, // Set to true if using a secure connection (e.g., SSL/TLS)
  auth: {
    user: 'your-email@example.com', // Replace with your email address
    pass: 'your-email-password', // Replace with your email password or an app-specific password
  },
});

// Function to send the verification email
const sendVerificationEmail = async (toEmail, verificationCode) => {
  try {
    // Send mail with defined transport object
    await transporter.sendMail({
      from: 'your-email@example.com', // Replace with your email address
      to: toEmail,
      subject: 'Account Verification',
      text: `Your verification code: ${verificationCode}`,
    });
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
};

module.exports = {
  sendVerificationEmail,
};
