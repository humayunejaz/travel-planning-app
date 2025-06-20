# Resend Email Integration Setup Guide

Follow these steps to set up real email sending for trip invitations using Resend.

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Click "Sign Up" and create a free account
3. Verify your email address
4. Complete the onboarding process

**Free Tier Includes:**
- 100 emails per day
- 3,000 emails per month
- All features included

## Step 2: Get Your API Key

1. In your Resend dashboard, navigate to "API Keys" in the sidebar
2. Click "Create API Key"
3. Give it a descriptive name like "TravelPlan Demo"
4. Select the appropriate permissions (default is fine)
5. Click "Create"
6. **Copy the API key immediately** (it starts with `re_`)
7. Store it securely - you won't be able to see it again

## Step 3: Configure Environment Variables

1. In your project, copy `.env.example` to `.env.local`
2. Add your Resend API key:

\`\`\`env
# Required for real email sending
RESEND_API_KEY=re_your_actual_api_key_here

# App URL (important for generating correct invitation links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## Step 4: Test the Integration

1. **Restart your development server** after adding the environment variable:
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Create a test trip:**
   - Go to "New Trip"
   - Fill in trip details
   - Add a real email address as a collaborator (use your own email for testing)
   - Click "Create Trip"

3. **Check for success:**
   - You should see a green success notification
   - Check your email inbox (and spam folder)
   - The email should arrive within a few seconds

## Step 5: Test the Invitation Flow

1. **Open the invitation email**
2. **Click "Accept Invitation & Join Trip"**
3. **Verify the flow:**
   - Should redirect to the registration page
   - Email should be pre-filled
   - Trip information should be displayed
   - Complete registration to test full flow

## Step 6: Monitor Email Sending

1. **Check Resend Dashboard:**
   - Go to your Resend dashboard
   - Navigate to "Logs" to see sent emails
   - Monitor delivery status and any errors

2. **Check App Email Dashboard:**
   - Click "View Sent Emails" in the app
   - See local tracking of sent invitations

## Troubleshooting

### "Email service not configured" Error
- Verify `RESEND_API_KEY` is set in `.env.local`
- Restart your development server
- Check the API key is correct (starts with `re_`)

### Emails Not Arriving
- Check spam/junk folders
- Verify the recipient email address is correct
- Check Resend dashboard logs for delivery status
- Try sending to a different email provider

### "Failed to send email" Error
- Check browser console for detailed error messages
- Verify API key has correct permissions
- Check Resend dashboard for any account issues

### Demo Mode Fallback
If email sending fails, the app automatically falls back to demo mode and shows invitation links instead.

## Email Template Customization

The email template is defined in `app/api/send-invitation/route.ts`. You can customize:

- **From Address:** Change `from: "TravelPlan <onboarding@resend.dev>"`
- **Subject Line:** Modify the subject in the `resend.emails.send()` call
- **HTML Template:** Update the `generateEmailHTML()` function
- **Text Version:** Update the `generateEmailText()` function

## Production Considerations

### Custom Domain (Recommended for Production)

1. **Add Domain in Resend:**
   - Go to "Domains" in Resend dashboard
   - Click "Add Domain"
   - Enter your domain (e.g., `yourdomain.com`)

2. **Configure DNS:**
   - Add the provided DNS records to your domain
   - Wait for verification (can take up to 24 hours)

3. **Update From Address:**
   \`\`\`typescript
   from: 'TravelPlan <noreply@yourdomain.com>'
   \`\`\`

### Environment Variables for Production

\`\`\`env
RESEND_API_KEY=re_your_production_api_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
\`\`\`

## Testing Checklist

- [ ] Resend account created and verified
- [ ] API key generated and copied
- [ ] Environment variable set in `.env.local`
- [ ] Development server restarted
- [ ] Test email sent successfully
- [ ] Email received in inbox
- [ ] Invitation link works correctly
- [ ] Registration flow completes
- [ ] User added to trip successfully

## Support

- **Resend Documentation:** [resend.com/docs](https://resend.com/docs)
- **Resend Support:** Available through their dashboard
- **Rate Limits:** 100 emails/day on free tier
- **Delivery Reports:** Available in Resend dashboard
