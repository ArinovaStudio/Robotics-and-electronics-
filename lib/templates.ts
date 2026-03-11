export const getOTPTemplate = (otp: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "LOGIN_VERIFICATION") => {
    let message = "Thank you for registering! Please use the following OTP to verify your email address.";
    let title = "Email Verification";
    
    if (type === "PASSWORD_RESET") {
      message = "We received a request to reset your password. Please use the following OTP to proceed.";
      title = "Password Reset";
    } else if (type === "LOGIN_VERIFICATION") {
      message = "You are attempting to log in to your account. Please use the following OTP to securely complete your login.";
      title = "Secure Login Verification";
    }

    return `
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
            <h2>${title}</h2>
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
};

export const getOrderConfirmationTemplate = ( name: string, orderNumber: string, totalAmount: number | string, items: any[] ) => {
  const itemsHtml = items.map((item) => {
      const title = item.productSnapshot?.title || "Product";
      const itemTotal = Number(item.priceAtPurchase) * item.quantity;
      
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${title}</strong><br/>
            <span style="color: #666; font-size: 12px;">Qty: ${item.quantity}</span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            ₹${itemTotal.toFixed(2)}
          </td>
        </tr>
      `;
    }).join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4a439a; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .total-row { font-size: 18px; font-weight: bold; color: #4a439a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Successful! 🎉</h1>
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
                  <td class="total-row" style="padding: 15px 10px; text-align: right;">₹${Number(totalAmount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Robotics Store. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export function getOrderStatusUpdateTemplate(
  name: string,
  orderNumber: string,
  newStatus: string,
  trackingNumber?: string | null,
  trackingUrl?: string | null
) {
  const statusMessages: Record<string, string> = {
    CONFIRMED: "Great news! Your order has been confirmed and we are getting it ready.",
    PROCESSING: "We are currently processing your order and packing your items.",
    SHIPPED: "Good news! Your order has shipped and is on its way to you.",
    DELIVERED: "Your order has been delivered! We hope you love your new gear.",
    CANCELLED: "Your order has been cancelled. If you have been charged, a refund will be issued shortly.",
    REFUNDED: "Your refund has been successfully processed."
  };

  const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}.`;
  const title = `Order Status: ${newStatus}`;

  let trackingHtml = "";
  if (newStatus === "SHIPPED" && trackingNumber) {
    trackingHtml = `
      <div style="margin-top: 20px; padding: 20px; background-color: white; border: 1px solid #eee; border-radius: 5px;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #4a439a;">Tracking Information:</p>
        <p style="margin: 0; color: #333;">Tracking Number: <strong>${trackingNumber}</strong></p>
        ${trackingUrl ? `<p style="margin: 15px 0 0 0;"><a href="${trackingUrl}" style="background-color: #4a439a; color: white; padding: 8px 15px; text-decoration: none; border-radius: 4px; font-size: 14px; display: inline-block;">Track Your Package</a></p>` : ""}
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4a439a; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .status-badge { display: inline-block; padding: 5px 15px; background-color: #4a439a; color: white; border-radius: 20px; font-weight: bold; font-size: 14px; margin-top: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .order-info { margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px; border-left: 4px solid #4a439a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Update 📦</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>${message}</p>
            
            <div class="order-info">
              <p style="margin: 0;"><strong>Order Number:</strong> #${orderNumber}</p>
              <p style="margin: 5px 0 0 0;"><strong>Current Status:</strong> <span class="status-badge">${newStatus}</span></p>
            </div>

            ${trackingHtml}
            
            <p style="margin-top: 30px;">If you have any questions, feel free to reply to this email or visit your account dashboard.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Robotics Store. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export const getContactUsTemplate = (name: string, email: string, subject: string, message: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f0b31e; color: #050a30; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .label { font-weight: bold; color: #050a30; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 15px; }
          .message-box { background-color: white; padding: 15px; border-left: 4px solid #f0b31e; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">New Contact Form Submission</h1>
          </div>
          <div class="content">
            <p>You have received a new message from your website's Contact Us form.</p>
            
            <div class="label">Name</div>
            <p style="margin: 5px 0 15px 0;">${name}</p>
            
            <div class="label">Email Address</div>
            <p style="margin: 5px 0 15px 0;"><a href="mailto:${email}">${email}</a></p>

            <div class="label">Subject</div>
            <p style="margin: 5px 0 15px 0;">${subject}</p>
            
            <div class="label">Message</div>
            <div class="message-box">${message}</div>
          </div>
          <div class="footer">
            <p>This message was sent from the Robotics Store Contact Form.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};