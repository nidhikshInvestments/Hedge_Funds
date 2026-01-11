import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { resend } from "@/lib/resend"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phoneNumber, subject, message } = body

    console.log("[v0] Received contact form submission:", { name, email, subject })

    if (!name || !email || !phoneNumber || !subject || !message) {
      return NextResponse.json({ error: "All fields including phone number are required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    console.log("[v0] Attempting to insert into contact_messages table")

    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name,
          email,
          subject,
          message: phoneNumber ? `Phone: ${phoneNumber}\n\n${message}` : message,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Failed to save contact message:", error)
      return NextResponse.json(
        { error: "Failed to send message. Please try again or email us directly at kunjarpatel@gmail.com" },
        { status: 500 },
      )
    }

    console.log("[v0] Contact form saved successfully:", data.id)

    try {
      console.log("[v0] Checking RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Present" : "Missing")

      if (process.env.RESEND_API_KEY) {
        console.log("[v0] Attempting to send email via Resend...")
        console.log("[v0] Email details:", {
          from: "Nidhiksh Investments <onboarding@resend.dev>",
          to: "dallastechtexas@gmail.com",
          replyTo: email,
          subject: `New Contact: ${subject} - From ${name}`,
        })

        const emailResult = await resend.emails.send({
          from: "Nidhiksh Investments <onboarding@resend.dev>",
          to: ["dallastechtexas@gmail.com"],
          replyTo: email,
          subject: `New Contact: ${subject} - From ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">New Contact Form Submission</h2>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${phoneNumber}">${phoneNumber || "Not provided"}</a></p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Reply directly to this email to respond to ${name} at ${email}.
              </p>
            </div>
          `,
        })

        console.log("[v0] Resend API response:", JSON.stringify(emailResult, null, 2))

        if (emailResult.error) {
          console.error("[v0] Resend returned an error:", emailResult.error)
        } else if (emailResult.data) {
          console.log("[v0] Email sent successfully! Email ID:", emailResult.data.id)
        }
      } else {
        console.warn("[v0] RESEND_API_KEY not configured, skipping email")
      }
    } catch (emailError: any) {
      console.error("[v0] Failed to send email notification:", emailError)
      console.error("[v0] Email error details:", {
        message: emailError?.message,
        name: emailError?.name,
        stack: emailError?.stack,
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. We will get back to you within 24 hours.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again or contact us directly at kunjarpatel@gmail.com" },
      { status: 500 },
    )
  }
}
