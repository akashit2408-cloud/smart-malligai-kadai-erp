# Smart Malligai Kadai ERP - Deployment Guide

This guide covers deploying the application completely free using Vercel + Supabase.

## 1. Supabase Setup

### Create Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Name: `smart-malligai-kadai-erp`
4. Choose region closest to your users (e.g., Mumbai for India)
5. Save database password securely

### Run Database Migration

1. Open Supabase SQL Editor
2. Copy contents of `supabase/migrations/000001_initial_schema.sql`
3. Paste and run
4. Verify tables created in Table Editor

### Configure Auth

1. Go to Authentication → Providers
2. Enable **Email** provider
3. Enable **Google** provider:
   - Add Google Client ID and Secret
   - Set Authorized Redirect URI in Google Console: `https://your-project.supabase.co/auth/v1/callback`
4. Go to Authentication → URL Configuration
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/api/auth/callback`, `https://your-app.vercel.app/reset-password`

### Get API Keys

1. Go to Project Settings → API
2. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public)
   - `SUPABASE_SERVICE_ROLE_KEY` (service role - keep secret)
3. Copy Project ID from General Settings

## 2. Resend Setup (Optional)

1. Sign up at [https://resend.com](https://resend.com)
2. Verify a domain or use onboarding domain
3. Create API key: `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL`

Note: Supabase Auth handles email by default. Resend can be used for custom transactional emails.

## 3. Cloudinary Setup (Optional)

1. Sign up at [https://cloudinary.com](https://cloudinary.com)
2. Copy cloud name, API key, API secret
3. Set environment variables:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 4. Vercel Deployment

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/smart-malligai-kadai-erp.git
git push -u origin main
```

### Import to Vercel

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
5. Add environment variables (from step 1 and 2)
6. Deploy

### Environment Variables on Vercel

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=onboarding@yourdomain.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 5. Post-Deployment

1. Create a store owner account at `/register`
2. Verify profile and store created in Supabase
3. Add first product at `/inventory`
4. Create first sale at `/billing`
5. Test PWA install on mobile

## 6. Custom Domain (Optional)

1. In Vercel project settings, add custom domain
2. Update Supabase Auth URL Configuration with new domain
3. Update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL`

## 7. Monitoring

- Vercel Analytics: Performance monitoring
- Supabase Dashboard: Database usage, auth events, realtime connections
- Vercel Logs: Serverless function logs

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login redirects to 404 | Check Supabase Auth URL configuration |
| RLS policy errors | Verify store_id in user profile |
| Realtime not working | Enable Realtime for tables in Supabase Database → Replication |
| Images not loading | Add domain to `next.config.js` images.remotePatterns |
| PWA not installable | Regenerate icons and verify manifest.json |

## Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| Vercel | 100 GB bandwidth, 6,000 execution hours |
| Supabase | 500 MB database, 2 GB storage, 5 GB bandwidth |
| Resend | 3,000 emails/day |
| Cloudinary | 25 GB storage + credits |

For small grocery stores, this is sufficient for production usage.
