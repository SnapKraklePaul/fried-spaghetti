const sgMail = require('@sendgrid/mail');

// Set your SendGrid API Key here
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(name, email, message) {
  const msg = {
    to: 'pwag11b@icloud.com', // Change this to your email address
    from: 'hamey40807@polatrix.com', // Change this to your verified sender email in SendGrid
    subject: 'New Contact Form Submission',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    html: `<strong>Name:</strong> ${name}<br>
           <strong>Email:</strong> ${email}<br>
           <strong>Message:</strong> ${message}`,
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error sending email' };
  }
}

module.exports = sendEmail;