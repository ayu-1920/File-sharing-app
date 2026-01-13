const nodemailer = require('nodemailer');

// Create a transporter using SendGrid (more reliable for cloud hosting)
const createTransport = () => {
  // Use SendGrid if API key is available, fallback to Gmail
  console.log('Checking email configuration...');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  
  if (process.env.SENDGRID_API_KEY) {
    console.log('Using SendGrid transporter');
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // Fallback to Gmail for development
  console.log('Using Gmail transporter (fallback)');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    },
    // Add connection timeout settings
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000      // 60 seconds
  });
};

// Send file sharing email
const sendFileShareEmail = async (toEmail, fromUser, fileName, shareUrl, fileSize) => {
  try {
    const transporter = createTransport();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: toEmail,
      subject: `📁 File Shared: ${fileName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>File Shared With You</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              font-size: 28px;
              margin-bottom: 10px;
            }
            .file-info {
              background: linear-gradient(135deg, #ff6b35 0%, #8b5cf6 100%);
              color: white;
              padding: 20px;
              border-radius: 15px;
              margin: 20px 0;
            }
            .file-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .file-size {
              opacity: 0.9;
              font-size: 14px;
            }
            .download-btn {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              margin: 20px 0;
              transition: transform 0.3s ease;
            }
            .download-btn:hover {
              transform: translateY(-2px);
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .security-note {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 10px;
              margin: 20px 0;
              border-left: 4px solid #ff6b35;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📁</div>
              <h1>File Shared With You!</h1>
            </div>
            
            <p>Hello,</p>
            <p><strong>${fromUser}</strong> has shared a file with you through our secure file sharing platform.</p>
            
            <div class="file-info">
              <div class="file-name">📄 ${fileName}</div>
              <div class="file-size">File Size: ${formatFileSize(fileSize)}</div>
            </div>
            
            <div style="text-align: center;">
              <a href="${shareUrl}" class="download-btn">
                🚀 Download File Now
              </a>
            </div>
            
            <div class="security-note">
              <strong>🔒 Security Notice:</strong> This download link is secure and will expire after 7 days for your privacy and security.
            </div>
            
            <p>If you have any questions or didn't expect this file, please contact the sender directly.</p>
            
            <div class="footer">
              <p>Best regards,<br>The FileShare Team</p>
              <p style="font-size: 12px; color: #999;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Format file size in human readable format
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransport();
    await transporter.verify();
    console.log('Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendFileShareEmail,
  testEmailConfig,
  formatFileSize
};
