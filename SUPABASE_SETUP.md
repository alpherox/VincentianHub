# Supabase Setup Guide

This guide will help you connect your VincentianHub project to Supabase.

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in (or create an account)
2. Click **"New Project"**
3. Fill in:
   - **Name**: VincentianHub (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"** (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long JWT token)

## Step 3: Set Up Environment Variables

1. In your project root, create a file named `.env`
2. Copy the contents from `.env.example` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

**Important**: Replace `your-project-ref` and `your-anon-key-here` with your actual values from Step 2.

## Step 4: Run Database Migrations

Your project includes database migrations that set up all the necessary tables:

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Run each migration file in order (from `supabase/migrations/`):
   - `20260107032452_remix_migration_from_pg_dump.sql` (main schema)
   - `20260113065727_e96f2124-8da9-473d-8396-ca31b82d3bb2.sql` (policy updates)
   - `20260114000000_create_admin_user.sql` (optional - for admin user)
4. Or, if you have Supabase CLI installed:
   ```bash
   supabase db push
   ```

## Step 5: Set Up Storage Bucket (Optional)

If you want file uploads to work:

1. Go to **Storage** in Supabase Dashboard
2. Click **"Create bucket"**
3. Name: `research-files`
4. **Make it public**: ✅ Check "Public bucket"
5. Click **"Create bucket"**

## Step 6: Verify Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser
3. Try to register a new account
4. Check the browser console for any errors

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env` file has the correct values
- Make sure there are no spaces around the `=` sign
- Restart your dev server after changing `.env`

### "Failed to fetch" or network errors
- Check your `VITE_SUPABASE_URL` is correct
- Make sure your Supabase project is active (not paused)

### Database errors
- Verify all migrations have been run
- Check the SQL Editor in Supabase for any error messages
- Ensure RLS (Row Level Security) policies are set up correctly

### Storage upload errors
- Make sure the `research-files` bucket exists
- Check bucket policies allow uploads
- Verify the bucket is public if needed

## Quick Test

After setup, you can test the connection by:

1. Registering a new user at `/auth?mode=register`
2. Logging in with those credentials
3. Accessing the dashboard at `/dashboard`

## Creating an Admin Account

See `create_admin_account.sql` or `SUPABASE_SETUP.md` for instructions on creating an admin user.

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check your browser console for specific error messages
