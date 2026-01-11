# Admin/Owner Login Guide

## How the Owner Logs In to Manage Investors

### Step 1: Create Your Account
1. Go to **`/signup`** on the website
2. Enter your details (name, email, password)
3. Complete the signup process
4. Verify your email if required

### Step 2: Make Yourself an Admin

**Option A: Using Supabase Dashboard (Easiest)**
1. Go to your Supabase Dashboard
2. Click on **Table Editor** in the left sidebar
3. Click on the **users** table
4. Find your user record (search by your email)
5. Click on the **role** field
6. Change it from `investor` to `admin`
7. Save the changes

**Option B: Using SQL Script**
1. Open the Supabase SQL Editor
2. Open the file `scripts/005_create_admin_user.sql`
3. Replace `'your-email@example.com'` with your actual email
4. Run the script
5. Verify the admin was created by checking the output

### Step 3: Login as Admin
1. Go to **`/login`**
2. Enter your email and password (the same credentials you created in Step 1)
3. Click **"Sign In"**
4. You will automatically be redirected to **`/admin`** dashboard

### What You Can Do as Admin

Once logged in as admin at `/admin`, you can:

✅ **View All Investors**
- See complete list of all investors
- View total Assets Under Management (AUM)
- See active investor count
- Quick overview of all portfolios

✅ **Update Portfolio Values**
- Click **"Update Portfolio Values"** button
- Select an investor from the dropdown
- Enter their new portfolio value
- Choose the date
- Submit to update instantly

✅ **View Individual Investor Details**
- Click **"Manage"** on any investor
- See their complete portfolio history
- View their growth chart
- Track all portfolio values over time

✅ **Manage Investor Data**
- Add new portfolio values
- Track investor performance
- Monitor total AUM growth

### Login Credentials

**Your Admin Login:**
- **URL:** `https://your-website.com/login`
- **Email:** The email you signed up with
- **Password:** The password you created during signup
- **Login Method:** Email/Password OR Google SSO (if you signed up with Google)

### Automatic Routing

The system automatically knows you're an admin:
- Regular investors → redirected to `/investor` (their personal dashboard)
- Admin users → redirected to `/admin` (management dashboard)

### Security Notes

- Only users with `role = 'admin'` can access the admin dashboard
- Investors cannot see the admin panel
- Each investor can only see their own portfolio
- All data is protected with Row Level Security (RLS)

### Contact Information

If you need help setting up admin access:
- Email: nidhiksh.investments@gmail.com
- Phone: 469-514-8785

---

## Quick Reference

**Admin Dashboard URL:** `/admin`
**Login URL:** `/login`
**Default Role:** New signups are `investor` by default
**Admin Role:** Must be manually set to `admin` in database

**Admin Capabilities:**
1. View all investors and portfolios
2. Update portfolio values for any investor
3. Track total AUM
4. Manage all investor data
5. View individual investor performance
