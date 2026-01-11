# Nidhiksh Investments - Setup Guide

## Complete Website Overview

Welcome to the Nidhiksh Investments platform! This is a comprehensive hedge fund investor portal with multi-page website, authentication, and portfolio management.

## Website Structure

### Public Pages (Accessible to Everyone)

1. **Home Page** (`/`)
   - Landing page with hero section
   - Company overview and mission
   - Key features and benefits
   - Call-to-action buttons for signup/login

2. **About Us** (`/about`)
   - Detailed company information
   - Values and principles
   - Mission statement

3. **Invest** (`/invest`)
   - Investment benefits
   - What investors get
   - Getting started information

4. **Contact** (`/contact`)
   - Contact form with email functionality
   - Email: nidhiksh.investments@gmail.com
   - Phone: 469-514-8785
   - Office hours and location info

### Authentication Pages

5. **Signup** (`/signup`)
   - New investor registration
   - Email/password signup
   - Email verification required

6. **Login** (`/login`)
   - Email/password login
   - Google SSO authentication
   - Automatic role-based redirect (admin → /admin, investor → /investor)

### Protected Pages (Requires Authentication)

7. **Investor Dashboard** (`/investor`)
   - Personal portfolio view
   - Beautiful growth chart showing investment over time
   - Current portfolio value
   - Total gains/losses with percentages
   - Performance metrics

8. **Admin Dashboard** (`/admin`)
   - Owner/administrator panel
   - View all investors
   - Total AUM (Assets Under Management)
   - Active investor count
   - Portfolio management
   - Quick link to update portfolio values

9. **Add Portfolio Value** (`/admin/add-value`)
   - Form to update investor portfolio values
   - Select investor
   - Enter new portfolio value
   - Date selection
   - Updates reflected immediately in investor dashboard

10. **Individual Investor View** (`/admin/investor/[id]`)
    - Detailed view of specific investor
    - Full portfolio history
    - Performance chart
    - All portfolio values over time

## How To Use The System

### For the Hedge Fund Owner (Admin):

1. **First Time Setup:**
   - You need to create an admin account in the database
   - The first user should be set with `role = 'admin'` in the Supabase users table
   - Login at `/login` with your admin credentials

2. **Logging In:**
   - Go to `/login`
   - Use your email and password (or Google SSO)
   - You'll automatically be redirected to `/admin` dashboard

3. **Managing Investors:**
   - View all investors on the admin dashboard
   - See total AUM and portfolio counts
   - Click "Manage" on any investor to view their details

4. **Updating Portfolio Values:**
   - Click "Update Portfolio Values" button
   - Select the investor from dropdown
   - Enter the new portfolio value
   - Select the date
   - Submit - the investor will see this immediately

### For Investors:

1. **Creating an Account:**
   - Go to `/signup`
   - Enter full name, email, and password
   - Verify email (check inbox)
   - Login at `/login`

2. **Logging In:**
   - Go to `/login`
   - Use email/password or Google SSO
   - Automatically redirected to `/investor` dashboard

3. **Viewing Portfolio:**
   - See current portfolio value
   - View beautiful growth chart over time
   - See total gains/losses
   - Track performance percentage

### For Website Visitors:

1. **Contact the Company:**
   - Go to `/contact`
   - Fill out the contact form with name, email, subject, message
   - Or directly email: nidhiksh.investments@gmail.com
   - Or call/text: 469-514-8785

2. **Learn About the Company:**
   - Navigate using the top navigation bar
   - Home, About Us, Invest, Contact Us pages
   - Click "Get Started" to signup
   - Click "Login" if already an investor

## Key Features

### Design
- Ultra-modern dark theme
- Sophisticated gradients throughout
- Glassmorphism effects
- Responsive on desktop and mobile
- Professional and elegant appearance

### Authentication
- Email/password authentication
- Google SSO integration
- Role-based access control (admin vs investor)
- Secure session management
- Email verification

### Security
- Row Level Security (RLS) in database
- Investors can only see their own data
- Admins can see and manage all data
- Protected routes with middleware
- Encrypted passwords

### Database Structure
- **users table**: Store user info and roles
- **portfolios table**: Link investors to their portfolios
- **portfolio_values table**: Track portfolio values over time

## Database Setup

The following SQL scripts are in the `/scripts` folder:
1. `001_create_users_table.sql` - Creates users table
2. `002_create_portfolios_table.sql` - Creates portfolios table
3. `003_create_portfolio_values_table.sql` - Creates portfolio values table
4. `004_create_user_trigger.sql` - Auto-creates user profile on signup

These scripts are automatically executed when you run the project.

## Environment Variables

All required environment variables are already configured:
- Supabase URL and keys
- PostgreSQL connection strings
- JWT secrets

## Creating the First Admin User

After signup, you need to manually set the first admin user in Supabase:

1. Go to Supabase Dashboard
2. Navigate to Table Editor → users
3. Find your user record
4. Change the `role` field from 'investor' to 'admin'
5. Log out and log back in
6. You'll now have admin access

## Next Steps

1. Create your admin account via `/signup`
2. Update your role to 'admin' in Supabase
3. Log in as admin
4. Create portfolios for your investors
5. Update portfolio values regularly
6. Investors can track their growth in real-time

## Support

For any issues or questions:
- Email: nidhiksh.investments@gmail.com
- Phone: 469-514-8785
