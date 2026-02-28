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