import sendEmail from "@/lib/email";
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
    try {
        const { email } = await req.json();
        
        if (!email || typeof email !== "string") {
            return NextResponse.json({ success: false, message: "Invalid email address" }, { status: 400 });
        }

        const name = "New Lead for Tech Engi"
        const UserTemplate = `
        <!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(90deg, #34a853, #6ddf8b); padding:15px; text-align:center;">
              <h2 style="margin:0; color:#ffffff; font-size:18px;">
                Tech Engi
              </h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:25px; text-align:center;">
              
              <p style="margin:0; font-size:16px; color:#333;">
                🎉 You're Subscribed!
              </p>

              <p style="margin:12px 0 0; font-size:14px; color:#666;">
                Thank you for subscribing to Tech Engi.  
                You're now part of our community 🚀
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#777;">
              © 2026 Tech Engi <br/>
              <span style="font-size:11px; color:#aaa;">
                You're receiving this because you subscribed
              </span>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
        `
        const htmlContent = `
        <!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(90deg, #1a73e8, #4cafef); padding:15px; text-align:center;">
              <h2 style="margin:0; color:#ffffff; font-size:18px; letter-spacing:0.5px;">
                Tech Engi
              </h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:25px; text-align:center;">
              
              <p style="margin:0; font-size:14px; color:#888;">
                New Lead Email Received
              </p>

              <p style="margin:12px 0 0; font-size:18px; font-weight:bold; color:#333;">
                ${email}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#777;">
              © 2026 Tech Engi <br/>
              <span style="font-size:11px; color:#aaa;">
                This is an automated notification
              </span>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
        `

        const adminMail = await sendEmail("tsy1@tsquarey.store", name, htmlContent)
        if (adminMail) {
            sendEmail(email, "Thank you for subscribing to Tech Engi updates!", UserTemplate)
            return NextResponse.json({ success: true, message: "Subscription successful" }, { status: 200 })
        }
    }
    catch (er) {
        console.error("Error", er)
        return NextResponse.json({success: false, message: "Internal server error"}, {status: 500})
    }
}