import { Resend } from "resend"

// Initialize Resend with API key from environment variable
// You need to add RESEND_API_KEY to your environment variables
export const resend = new Resend(process.env.RESEND_API_KEY)
