# Email Integration Setup Guide

This guide will help you set up real email sending for trip invitations using Resend.

## Option 1: Quick Demo (No Setup Required)

The app works out of the box in demo mode. When you invite collaborators:
- Instead of sending emails, it will show you the invitation link
- You can copy this link and share it manually to test the invitation flow

## Option 2: Real Email Integration with Resend

### Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### Step 2: Get Your API Key

1. In your Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Give it a name like "TravelPlan Demo"
4. Copy the API key (starts with `re_`)

### Step 3: Add Domain (Optional but Recommended)

For production use, you should add your own domain:

1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow the DNS setup instructions

For demo purposes, you can skip this and use the default domain.

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Add your Resend API key:

\`\`\`env
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### Step 5: Update Email From Address (If Using Custom Domain)

If you added a custom domain, update the `from` field in `app/api/send-invitation/route.ts`:

\`\`\`typescript
from: 'TravelPlan <noreply@yourdomain.com>', // Replace with your domain
\`\`\`

### Step 6: Test the Integration

1. Restart your development server: `npm run dev`
2. Create a new trip
3. Add a collaborator email address
4. Check that the email is sent successfully

## Troubleshooting

### "Failed to send email" Error

- Check that your RESEND_API_KEY is correct
- Verify the API key has the right permissions
- Check the browser console for detailed error messages

### Emails Not Arriving

- Check spam/junk folders
- Verify the recipient email address is correct
- For custom domains, ensure DNS records are properly configured

### Demo Mode Fallback

If email sending fails, the app automatically falls back to demo mode and shows the invitation link instead.

## Free Tier Limits

Resend free tier includes:
- 100 emails per day
- 3,000 emails per month
- All features included

This is perfect for demo and testing purposes!
\`\`\`

Finally, let's update the next.config.mjs to ensure API routes work properly:
\`\`\`
... This file was left out for brevity. Assume it is correct and does not need any modifications. ...
