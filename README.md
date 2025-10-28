# Off-Peak Offers Platform

A platform where merchants can publish short-duration, limited-quantity micro-offers to fill cold hours. Users discover nearby live offers on a map & list, claim, and redeem in-store.

## 🚀 Features

- **Time-Limited Offers**: Short-duration offers to boost foot traffic during cold hours
- **Location-Based Discovery**: Find nearby offers with geofence controls
- **Real-Time Inventory**: Live stock tracking with atomic claim management
- **QR Code Redemption**: Secure in-store redemption with QR codes or 6-digit codes
- **Multi-Role System**: Support for customers, merchants, staff, and admins
- **OTP Authentication**: Phone-based authentication with verification
- **Merchant Dashboard**: Create and manage offers, view analytics
- **Staff Redemption Interface**: Quick claim verification for venue staff

## 📋 Project Structure

```
src/
├── collections/          # Payload CMS collections
│   ├── Users.ts          # User management with roles
│   ├── Merchants.ts      # Merchant accounts
│   ├── Venues.ts         # Venue locations
│   ├── Offers.ts         # Offer definitions
│   ├── OfferSlots.ts    # Time-based offer windows
│   ├── Claims.ts         # User claims
│   ├── Reviews.ts         # User reviews
│   └── Favorites.ts       # User favorites
├── app/
│   ├── (frontend)/       # Public-facing pages
│   │   ├── page.tsx      # Home page
│   │   ├── offers/       # Offers list view
│   │   ├── merchant/     # Merchant dashboard
│   │   └── staff/        # Staff redemption
│   ├── (payload)/        # Payload admin panel
│   └── api/              # API endpoints
│       ├── offers/       # Offers browsing
│       ├── claims/       # Claims management
│       ├── auth/         # OTP authentication
│       └── cron/         # Background jobs
├── hooks/                # Business logic hooks
└── access/               # Access control helpers
```

## 🛠️ Setup

### Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9+
- PostgreSQL database (local, Docker, or managed service)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd off-peak
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PAYLOAD_SECRET=your-secret-key-here
DATABASE_URI=postgresql://user:password@localhost:5432/off-peak

NEXT_PUBLIC_SERVER_URL=http://localhost:3000
CRON_SECRET=your-cron-secret
```

4. Generate types and import map:

```bash
pnpm generate:types
pnpm generate:importmap
```

5. Run the development server:

```bash
pnpm dev
```

6. Open the application:

- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

## 📱 User Flows

### 1. Customer Flow

1. Browse live offers at http://localhost:3000/offers
2. Click on an offer to view details
3. Click "Claim Now" to reserve the offer (you have 7 minutes to redeem)
4. Show QR code or 6-digit code to staff at venue
5. Staff verifies and redeems

### 2. Merchant Flow

1. Sign in to admin panel at http://localhost:3000/admin
2. Create merchant account and venue
3. Create offers with offer slots
4. Monitor live offers on dashboard
5. View analytics and redemption rates

### 3. Staff Flow

1. Navigate to http://localhost:3000/staff/redeem
2. Enter the 6-digit code or scan QR code
3. System verifies and redeems the claim
4. Track successful redemptions

## 🎯 API Endpoints

### Public Endpoints

- `GET /api/offers` - Get live/upcoming offers
  - Query params: `lat`, `lng`, `radius`, `filter`, `category`
- `POST /api/auth/otp/start` - Start OTP flow
  - Body: `{ phone: string }`
- `POST /api/auth/otp/verify` - Verify OTP and login
  - Body: `{ phone: string, code: string }`

### Protected Endpoints

- `POST /api/claims` - Claim an offer
  - Body: `{ slotId: string }`
- `GET /api/claims/[id]` - Get claim details
- `PATCH /api/claims/[id]` - Update claim (redeem, cancel)
- `POST /api/claims/redeem` - Staff redemption
  - Body: `{ code: string }` or `{ qrToken: string }`
- `POST /api/cron/expire-claims` - Expire old claims (cron)

## 🎨 Collections

### Users

- Phone authentication with OTP
- Roles: customer, merchant_owner, staff, admin
- Device fingerprinting for fraud prevention

### Merchants

- Business information and branding
- Stripe Connect integration
- KYC status tracking
- Category management

### Venues

- Location data (lat/lng)
- Address, hours, photos
- Active status management

### Offers

- Types: percent, fixed, BOGO, addon
- Visibility windows
- User limits and cooldowns
- Geofence controls

### OfferSlots

- Time-based windows (startsAt, endsAt)
- Inventory management (qtyTotal, qtyRemaining)
- Release modes: flash, drip
- State: scheduled, live, paused, ended

### Claims

- Status: RESERVED, REDEEMED, EXPIRED, CANCELLED
- QR tokens and 6-digit codes
- Expiry timestamps
- Staff tracking for redemption

## 🔐 Security Features

- Phone verification via OTP
- Device fingerprinting
- Per-user claim limits
- Geofence validation
- Atomic claim operations
- QR code rotation and verification
- Rate limiting and fraud detection

## 🚦 Roadmap

### v1 (Current MVP)

- ✅ Basic offer creation and browsing
- ✅ Claim management with atomic operations
- ✅ QR code redemption
- ✅ Staff interface
- ✅ OTP authentication

### v2 (Planned)

- [ ] Map view with clusters
- [ ] Lottery/Queue offer modes
- [ ] Favorites and notifications
- [ ] User reviews
- [ ] Advanced analytics
- [ ] Stripe Connect integration

### v3 (Future)

- [ ] AI-powered timing suggestions
- [ ] A/B testing for offers
- [ ] Waitlists
- [ ] Social sharing
- [ ] Multi-language support

## 📝 Development

### Database Migrations

Payload handles PostgreSQL schema automatically based on your collection definitions. Use the admin panel to view and manage your database schema.

### Adding Custom Fields

Edit collection files in `src/collections/` and Payload will update the schema.

### Running Tests

```bash
pnpm test          # Run all tests
pnpm test:int      # Integration tests
pnpm test:e2e      # End-to-end tests
```

### Building for Production

```bash
pnpm build
pnpm start
```

## 🐛 Troubleshooting

### PostgreSQL Connection Issues

Ensure PostgreSQL is running and the connection string is correct in `.env`.

### Type Generation Errors

Run `pnpm generate:types` after making collection changes.

### API Authentication

Ensure cookies are enabled and the auth flow completes properly.

## 📄 License

MIT License

## 👥 Contributing

Contributions welcome! Please open an issue or submit a pull request.
