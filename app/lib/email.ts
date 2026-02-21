import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@elecstore.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
): Promise<void> {
  const subject =
    type === "EMAIL_VERIFICATION"
      ? "Verify Your Email - Electronics Store"
      : "Reset Your Password - Electronics Store";

  const message =
    type === "EMAIL_VERIFICATION"
      ? `Your email verification code is: <strong>${otp}</strong>`
      : `Your password reset code is: <strong>${otp}</strong>`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .otp { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; padding: 20px; background-color: white; border-radius: 5px; margin: 20px 0; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Electronics Store</h1>
          </div>
          <div class="content">
            <h2>${type === "EMAIL_VERIFICATION" ? "Email Verification" : "Password Reset"}</h2>
            <p>${message}</p>
            <div class="otp">${otp}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Electronics Store. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Your ${type === "EMAIL_VERIFICATION" ? "verification" : "password reset"} code is: ${otp}. This code will expire in 10 minutes.`;

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

export async function sendPasswordChangedEmail(
  email: string,
  name: string,
): Promise<void> {
  const subject = "Password Changed Successfully - Electronics Store";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .alert { background-color: #10B981; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background-color: #FEF3C7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #F59E0B; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Electronics Store</h1>
          </div>
          <div class="content">
            <h2>Password Changed Successfully</h2>
            <p>Hello ${name},</p>
            <div class="alert">
              <strong>✓ Your password has been changed successfully</strong>
            </div>
            <p>Your password was recently changed on ${new Date().toLocaleString()}.</p>
            <div class="warning">
              <strong>⚠️ If you didn't make this change:</strong><br>
              Please contact our support team immediately as your account may be compromised.
            </div>
            <p>For your security, we recommend:</p>
            <ul>
              <li>Use a strong, unique password</li>
              <li>Enable two-factor authentication if available</li>
              <li>Never share your password with anyone</li>
            </ul>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Electronics Store. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Hello ${name}, Your password has been changed successfully on ${new Date().toLocaleString()}. If you didn't make this change, please contact support immediately.`;

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}


export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  totalAmount: number | string,
  items: any[] 
): Promise<void> {
  const subject = `Order Confirmed! #${orderNumber} - Electronics Store`;

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.productSnapshot?.title || 'Product'}</strong><br/>
        <span style="color: #666; font-size: 12px;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${Number(item.priceAtPurchase) * item.quantity}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .total-row { font-size: 18px; font-weight: bold; color: #4F46E5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Successful!</h1>
          </div>
          <div class="content">
            <h2>Thank you for your order, ${name}!</h2>
            <p>We've received your payment and your order is now confirmed. We are getting it ready for shipment.</p>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            
            <table>
              <tbody>
                ${itemsHtml}
                <tr>
                  <td style="padding: 15px 10px; text-align: right;"><strong>Total Paid:</strong></td>
                  <td class="total-row" style="padding: 15px 10px; text-align: right;">₹${totalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Electronics Store. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Hi ${name}, your order #${orderNumber} for ₹${totalAmount} is confirmed!`;

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
