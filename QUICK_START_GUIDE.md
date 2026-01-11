# Nidhiksh Investments - Quick Start Guide

## 🚀 Getting Your Admin Account Set Up

### Easiest Method: Let v0 Do It

Simply tell me in the chat:
- "Set up my admin account with email: youremail@example.com and password: YourPassword123"

I'll run all the database setup and create your admin account automatically!

### Manual Method: Using Supabase Dashboard

1. **Access Supabase Dashboard**
   - Go to https://supabase.com
   - Log in with your Supabase credentials
   - Select your project: `supabase-kunj-first`

2. **Run Database Scripts**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy and paste each script from the `/scripts` folder in order:
     - `001_create_users_table.sql`
     - `002_create_portfolios_table.sql`
     - `003_create_portfolio_values_table.sql`
     - `004_create_user_trigger.sql`
   - Click "Run" for each script

3. **Create Your Admin Account**
   - Go to `/signup` on your website
   - Create an account with your email and password
   - In Supabase Dashboard, go to "Table Editor" → "users"
   - Find your user row and change `role` from 'investor' to 'admin'

## 📝 How to Login as Owner/Admin

1. Go to https://your-website.com/login
2. Enter your admin email and password
3. You'll automatically be redirected to `/admin`
4. From there you can:
   - View all investors
   - Add new portfolio values
   - Manage investor data

## 👥 How Investors Use the Platform

1. **Investor Signup:**
   - Investors go to `/signup`
   - They create an account (automatically assigned 'investor' role)
   - Email verification is sent

2. **Investor Login:**
   - Investors go to `/login`
   - After login, they're redirected to `/investor`
   - They see their personal portfolio dashboard with:
     - Current portfolio value
     - Growth chart over time
     - Total gains/losses
     - Portfolio details

## 🔐 Google OAuth Setup (Optional)

To enable "Sign in with Google":

1. In Supabase Dashboard → Authentication → Providers
2. Enable "Google"
3. Add your Google OAuth credentials
4. Set redirect URL to: `https://your-website.com/auth/callback`

See `GOOGLE_OAUTH_SETUP.md` for detailed instructions.

## 📊 How to Update Investor Portfolio Values

1. Login to admin account at `/login`
2. Click "Update Portfolio Values"
3. Select the investor
4. Enter the new portfolio value and date
5. Click "Add Value"

The investor will immediately see the updated value and chart when they login!

## 🎨 Current Theme

- Dark slate background with gold accents
- Sophisticated gradient effects
- Responsive design for mobile and desktop
- Tree logo symbolizing growth and stability

## 📧 Contact Information

- Email: nidhiksh.investments@gmail.com
- Phone: 469-514-8785

## ⚡ Need Help?

Just ask me in the chat! I can:
- Set up your admin account
- Run database scripts
- Fix any issues
- Add new features
- Update styling

---

**Pro Tip:** The fastest way to get started is to let me set up your admin account directly. Just tell me your preferred email and password!
