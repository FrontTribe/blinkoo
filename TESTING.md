# Testing Guide - Off-Peak Platform

## Quick Start

1. Start the development server:

```bash
npm run dev
```

2. Open browser: http://localhost:3000

---

## 1. User Onboarding

### Test First-Time User Experience

**Clear onboarding completion:**

```javascript
// Open browser console (F12)
localStorage.removeItem('onboarding_completed')
```

**Steps:**

1. Visit http://localhost:3000/offers
2. Modal should appear automatically
3. Go through 4 steps or skip
4. Visit again - modal should NOT appear

**What to check:**

- ✅ Modal appears on first visit
- ✅ Can navigate between steps (Next/Back)
- ✅ Can skip onboarding
- ✅ Won't appear again after completion
- ✅ Help tooltip appears on claim page

**Help Tooltip:**

1. Go to any offer details
2. Click "Claim This Offer"
3. Find (?) icon next to title
4. Click to show tooltip explaining process

---

## 2. Claim Success Experience

### Test Celebration & Confetti

**Steps:**

1. Make sure you're logged in (merchant@merchant.com / merchant)
2. Go to http://localhost:3000/offers
3. Click on any available offer
4. Click "Claim This Offer"
5. Enter location if prompted
6. Click "Claim Offer"

**What to check:**

- ✅ Confetti animation appears (50 particles, 3 seconds)
- ✅ Success page shows 🎉 "You've Claimed It!"
- ✅ Large QR code displayed
- ✅ 6-digit code shown in large bold text
- ✅ Time remaining countdown works
- ✅ Venue name and address displayed
- ✅ "Get Directions" button works (opens Google Maps)
- ✅ "Share" button works
- ✅ "View More Offers" link works
- ✅ Next steps guide visible
- ✅ Can close and return to offers

**Test sharing:**

- Click "Share" button
- Should use native share API (mobile) or copy to clipboard (desktop)

**Test directions:**

- Click "Get Directions"
- Should open Google Maps with venue location
- URL should include correct lat/lng

---

## 3. Offers Page with Map

### Test Browse & Filter Experience

**Steps:**

1. Go to http://localhost:3000/offers
2. Browse offers in list/grid view
3. Test categories (click different category buttons)
4. Click "Filters" button
5. Adjust distance slider
6. Select time filters
7. Toggle map view

**What to check:**

- ✅ Offers load and display in grid
- ✅ Map shows on right side (60% width)
- ✅ Category filters update URL and content
- ✅ Filter panel slides in from right
- ✅ Blur overlay appears
- ✅ Active filters show count badge
- ✅ Distance slider works
- ✅ Time filters apply correctly
- ✅ Cards show: title, venue, time remaining, category, distance
- ✅ Click card → go to offer details

---

## 4. Offer Details Page

### Test Countdown Timer & Info

**Steps:**

1. Go to http://localhost:3000/offers
2. Click any offer card
3. View offer details page

**What to check:**

- ✅ Countdown timer in header (live updating H:M:S)
- ✅ Countdown timer in stats grid (mobile)
- ✅ Photo displays
- ✅ Title and venue name
- ✅ Stats: Time, Available qty, Total qty
- ✅ Description section
- ✅ Terms & Conditions section
- ✅ Map with venue marker
- ✅ Reviews section
- ✅ Sticky "Claim" button on right (desktop)

**Test countdown:**

- Watch countdown timer
- Should update every second
- Shows hours, minutes, seconds
- Format: "02:15:30"

---

## 5. Merchant Dashboard

### Test Today's Stats & Alerts

**Steps:**

1. Login as merchant: http://localhost:3000/auth/login
2. Credentials: merchant@merchant.com / merchant
3. Go to http://localhost:3000/merchant/dashboard

**What to check:**

- ✅ "Today's Claims" stat shows current day's claims
- ✅ "Today's Fill Rate" stat displays percentage
- ✅ Low stock alert appears if any slots < 10
- ✅ Live slots section shows current offers
- ✅ Recent claims section displays
- ✅ Quick actions work (Add Venue, Manage Offers, View Analytics)

**Test analytics link:**

- Click "View Analytics →" button
- Should go to http://localhost:3000/merchant/analytics

---

## 6. Analytics Page

### Test Business Metrics

**Steps:**

1. Login as merchant
2. Go to http://localhost:3000/merchant/analytics

**What to check:**

- ✅ Fill Rate metric displays
- ✅ Redemption Rate displays
- ✅ Average Time to Redemption shows
- ✅ Repeat Customer Rate displays
- ✅ Foot Traffic Uplift shows
- ✅ Category Performance section
- ✅ Fill Rate by Offer section
- ✅ Popular Time Slots section
- ✅ Top Performing Offers section
- ✅ Date range filter works
- ✅ All metrics update with date range

**Test date filtering:**

- Select start date
- Select end date
- Click outside or wait
- Data should refresh with new dates

---

## 7. Claim & Redemption Flow

### Full User Journey Test

**Steps:**

1. **As User:**
   - Browse offers at http://localhost:3000/offers
   - Click on offer card
   - View details with countdown
   - Click "Claim This Offer"
   - Location check (optional)
   - Click "Claim Offer"

2. **Success Screen:**
   - See confetti animation
   - Get QR code and 6-digit code
   - Note time remaining
   - Read next steps

3. **Redeem (as Staff):**
   - Go to http://localhost:3000/staff/redeem
   - Enter 6-digit code from claim
   - Or scan QR code
   - Click "Redeem"

4. **Check Status:**
   - Go to http://localhost:3000/my-claims
   - Claim should show as "REDEEMED"

**What to check:**

- ✅ Can claim offer successfully
- ✅ Geofence check works (if location provided)
- ✅ QR code is unique for each claim
- ✅ 6-digit code matches
- ✅ Time countdown works
- ✅ Can redeem as staff
- ✅ Status updates correctly
- ✅ Appears in my-claims

---

## 8. Vercel Cron Job

### Test Claim Expiration

**Manual Trigger:**

```bash
# In browser console or terminal
curl -X POST http://localhost:3000/api/cron/expire-claims \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**What to check:**

- ✅ Expired claims are marked as "EXPIRED"
- ✅ Quantity returned to offer slot
- ✅ qtyRemaining increases by 1

**Automated:**

- Cron runs every 5 minutes (configured in vercel.json)
- Claims with expiresAt < now are processed

---

## 9. Photo Uploads

### Test Offer Photo Upload

**Steps:**

1. Login as merchant
2. Go to http://localhost:3000/merchant/offers/create
3. Fill form
4. Click "Upload Photo"
5. Select image file
6. Wait for upload
7. Submit offer

**What to check:**

- ✅ File upload works
- ✅ Preview shows after upload
- ✅ Photo ID saved with offer
- ✅ Photo displays on offer details
- ✅ Photo displays on offers list cards

---

## 10. Mobile Responsive

### Test on Mobile View

**Browser DevTools:**

1. Press F12
2. Click device toggle (mobile icon)
3. Select mobile device (iPhone, Android)

**What to check:**

- ✅ All pages responsive
- ✅ Navigation works
- ✅ Forms usable
- ✅ Cards stack properly
- ✅ Map adjusts
- ✅ Countdown timer works
- ✅ Filters accessible
- ✅ Share button works

---

## Quick Test Checklist

### User Flow

- [ ] Landing page loads
- [ ] Browse offers
- [ ] Filter by category
- [ ] View offer details
- [ ] Claim offer
- [ ] See confetti
- [ ] Get QR/code
- [ ] Navigate to venue
- [ ] Redeem claim

### Merchant Flow

- [ ] Login
- [ ] Dashboard loads
- [ ] Create venue
- [ ] Create offer
- [ ] Upload photo
- [ ] Add slots
- [ ] View analytics

### Onboarding

- [ ] First visit shows modal
- [ ] Can complete tutorial
- [ ] Help tooltip works
- [ ] Completion tracked

### Analytics

- [ ] Metrics display
- [ ] Date range works
- [ ] Categories analyzed
- [ ] Fill rates shown

---

## Environment Setup

**Required environment variables:**

```env
PAYLOAD_SECRET=your-secret
DATABASE_URI=postgresql://...
MAPBOX_ACCESS_TOKEN=pk.your-token
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
CRON_SECRET=your-secret
```

**Test merchant account:**

- Email: merchant@merchant.com
- Password: merchant

**Seed data:**

```bash
# Create test merchant
npm run seed:merchant

# Create test categories
# Use CMS admin panel
```

---

## Common Issues

**Onboarding doesn't show:**

- Clear localStorage: `localStorage.removeItem('onboarding_completed')`

**No offers display:**

- Create offers via merchant dashboard
- Ensure slots are "live" state
- Check qtyRemaining > 0

**Map doesn't load:**

- Check Mapbox token in .env
- Open browser console for errors
- Try different browser (Chrome works best)

**Claim fails:**

- Check user is logged in
- Verify phone is verified
- Check geofence (must be within distance)
- Ensure slot is live and has capacity

**Cron doesn't run:**

- Check vercel.json configuration
- Manually trigger via API
- Check CRON_SECRET in .env

---

## Performance Testing

**Test load times:**

- Offers page: Should load < 2s
- Claim process: Should complete < 1s
- Analytics: Should load < 3s
- Map rendering: Should appear < 1s

**Test with many offers:**

1. Create 10+ offers
2. View offers page
3. Check pagination works
4. Verify map markers show

---

**Last Updated:** After onboarding and claim success improvements
