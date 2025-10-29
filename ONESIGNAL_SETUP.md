# OneSignal Push Notifications Setup

## Quick Setup (5 minutes)

### Step 1: Create OneSignal Account

1. Go to [https://onesignal.com](https://onesignal.com)
2. Sign up for free account (10,000 notifications/month free)
3. Create a new Web Push app

### Step 2: Get Your Keys

After creating your app, you'll get:

- **App ID** - Your OneSignal app ID
- **REST API Key** - For sending notifications from server

### Step 3: Add to Environment Variables

Add to your `.env` file:

```env
# OneSignal Configuration
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_app_id_here
ONESIGNAL_REST_API_KEY=your_rest_api_key_here
ONESIGNAL_APP_ID=your_app_id_here (same as NEXT_PUBLIC_ONESIGNAL_APP_ID)

# Optional: For Safari
NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID=your_safari_web_id (if using Safari)
```

### Step 4: Configure in OneSignal Dashboard

1. Go to Settings → Platform → Web Push
2. Configure your site URL
3. Upload your site icon (192x192 and 512x512)
4. Set default notification icon

### Step 5: Test

1. Start your dev server: `pnpm dev`
2. Visit customer profile page
3. Enable push notifications
4. Send test notification from merchant dashboard (`/merchant/notifications`)

## Features Included

✅ **Automatic Subscription** - Customers subscribe via profile page
✅ **Merchant Dashboard** - Send notifications to saved offer users or custom selection
✅ **Automated Notifications** - Cron jobs send slot reminders
✅ **Analytics** - View delivery stats in OneSignal dashboard
✅ **No Service Worker Setup** - OneSignal handles everything

## Usage

### From Merchant Dashboard:

1. Go to `/merchant/notifications`
2. Select "Saved Offer Users" or "Custom Selection"
3. Compose message
4. Click "Send Notification"

### From Code:

```typescript
import { sendPushToSavedOfferUsers } from '@/utilities/sendPushNotification'

await sendPushToSavedOfferUsers(offerId, {
  title: 'New offer live!',
  body: 'Check out our 50% off special',
  url: '/offers/offer-slug',
})
```

## OneSignal Dashboard

Access your OneSignal dashboard to:

- View delivery analytics
- See subscriber count
- Send manual notifications
- Configure segments
- Set up automated campaigns

## Benefits over VAPID

✅ **Easier Setup** - No key generation needed
✅ **Analytics Built-in** - Track opens, clicks, delivery rates
✅ **Dashboard UI** - Send notifications without code
✅ **Better Delivery** - Optimized delivery infrastructure
✅ **Free Tier** - 10,000 notifications/month free
✅ **Segments** - Target specific user groups easily

## Troubleshooting

### Notifications not showing

- Check browser notification permissions
- Verify OneSignal SDK loaded (check browser console)
- Ensure App ID is correct in `.env`
- Check OneSignal dashboard for errors

### "OneSignal is not ready"

- Wait a moment and try again
- Check browser console for OneSignal errors
- Verify `NEXT_PUBLIC_ONESIGNAL_APP_ID` is set

### Sending fails

- Check `ONESIGNAL_REST_API_KEY` is correct
- Verify API key has correct permissions in OneSignal
- Check server logs for specific errors

## Next Steps

1. ✅ Setup complete - OneSignal is integrated
2. Configure web push in OneSignal dashboard
3. Test with a real notification
4. Set up segments for targeted campaigns (optional)
