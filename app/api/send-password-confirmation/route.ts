import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789")

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    await resend.emails.send({
      from: "Nidhiksh Investments <noreply@nidhikshinvestments.com>",
      to: email,
      subject: "Your password has been changed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D97706;">Password Changed Successfully</h2>
          
          <p>Hello,</p>
          
          <p>Your password for your Nidhiksh Investments account has been successfully changed.</p>
          
          <p>If you made this change, no further action is required.</p>
          
          <p><strong>If you did not make this change:</strong></p>
          <ul>
            <li>Your account may have been compromised</li>
            <li>Please contact us immediately at support@nidhikshinvestments.com</li>
            <li>Reset your password again to secure your account</li>
          </ul>
          
          <p>For your security:</p>
          <ul>
            <li>Never share your password with anyone</li>
            <li>Use a strong, unique password</li>
            <li>Enable two-factor authentication if available</li>
          </ul>
          
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #ccc;">
          
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            Nidhiksh Investments Team<br>
            <a href="mailto:support@nidhikshinvestments.com">support@nidhikshinvestments.com</a>
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending password confirmation email:", error)
    return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 })
  }
}
