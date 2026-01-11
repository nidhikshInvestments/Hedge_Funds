# Email Setup with Resend

To enable email notifications for contact form submissions, follow these steps:

## 1. Create a Resend Account

1. Go to https://resend.com and sign up for a free account
2. Free tier includes 3,000 emails per month and 100 emails per day

## 2. Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name like "Nidhiksh Investments Production"
4. Copy the API key (it starts with `re_`)

## 3. Add API Key to Environment Variables

In your Vercel project or local .env file, add:

```
RESEND_API_KEY=re_your_api_key_here
```

## 4. Verify Your Domain (For Production)

**IMPORTANT:** In test mode, Resend only allows sending emails to the email address you signed up with. To send to other recipients (like kunjarpatel@gmail.com), you MUST verify a custom domain.

For production use, verify your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `nidhiksh.com`)
4. Add the DNS records provided by Resend to your domain
5. Wait for verification (usually takes a few minutes)

Once verified, update the `from` address in `app/api/contact/route.ts`:

```typescript
from: 'Nidhiksh Investments <contact@nidhiksh.com>',
to: ['kunjarpatel@gmail.com'], // Now you can send to any email
```

## 5. Test the Contact Form

1. Visit `/contact` on your website
2. Fill out and submit the form
3. Check your email at dallastechtexas@gmail.com (your Resend verified email)
4. The email will contain the sender's information and you can reply directly

## Current Status

- ✅ Contact form saves messages to database
- ✅ Email notifications sent to dallastechtexas@gmail.com (Resend test mode)
- ⚠️ Currently using onboarding@resend.dev domain (test mode only)
- 🔜 Verify custom domain to send directly to kunjarpatel@gmail.com

## Test Mode Limitations

In Resend test mode:
- Emails can only be sent to the email you registered with (dallastechtexas@gmail.com)
- To send to kunjarpatel@gmail.com or other addresses, you must verify a domain
- All contact form submissions are forwarded to dallastechtexas@gmail.com for now

## Notes

- Contact form will work even if email fails (messages are saved to database)
- You can view all messages in the admin panel at `/admin/messages`
- Email errors are logged but don't affect form submission
- Forward emails from dallastechtexas@gmail.com to kunjarpatel@gmail.com until domain is verified
