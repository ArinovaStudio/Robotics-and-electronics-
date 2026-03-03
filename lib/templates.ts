export const getOTPTemplate = (otp: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET") => {
    const message = type === "EMAIL_VERIFICATION" 
        ? "Thank you for registering! Please use the following OTP to verify your email address."
        : "We received a request to reset your password. Please use the following OTP to proceed.";

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