import nodemailer from 'nodemailer'

type EmailOptions = {
  to: string
  subject: string
  html: string
}

// Create reusable transporter based on environment
const getTransporter = () => {
  // In development, use console.log to output email content
  if (process.env.NODE_ENV === 'development') {
    return {
      sendMail: async (options: EmailOptions) => {
        console.log('=== EMAIL (Development Mode) ===')
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('HTML:', options.html)
        console.log('================================')
        return { messageId: 'dev-mode' }
      },
    }
  }

  // In production, use configured SMTP or service
  // For now, default to console output if SMTP not configured
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP not configured, using console output')
    return {
      sendMail: async (options: EmailOptions) => {
        console.log('=== EMAIL (Production - SMTP not configured) ===')
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('HTML:', options.html)
        console.log('================================================')
        return { messageId: 'console-mode' }
      },
    }
  }

  // Configure with SMTP settings
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Off-Peak <noreply@offpeak.app>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export function getKYCApprovedEmail(userName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff385c 0%, #ff6b7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #ff385c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Account Approved!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Great news! Your merchant account has been approved and you can now start using Off-Peak.</p>
      <p>You can now:</p>
      <ul>
        <li>Create and manage venues</li>
        <li>Post off-peak offers</li>
        <li>Track analytics and performance</li>
        <li>Manage customer claims</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/merchant/dashboard" class="button">Go to Dashboard</a>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The Off-Peak Team</p>
    </div>
  </div>
</body>
</html>
  `
}

export function getKYCRejectedEmail(userName: string, reason: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .alert-box { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 5px; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #ff385c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Account Update Required</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>We regret to inform you that your merchant account application was not approved at this time.</p>
      <div class="alert-box">
        <strong>Reason:</strong>
        <p>${reason}</p>
      </div>
      <p>Please review your business information and feel free to resubmit your application with the necessary updates.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/merchant/rejected" class="button">Resubmit Application</a>
      <p>If you have questions or need assistance, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Off-Peak Team</p>
    </div>
  </div>
</body>
</html>
  `
}
