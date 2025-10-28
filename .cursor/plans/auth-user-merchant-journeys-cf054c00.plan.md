<!-- cf054c00-aad4-40db-a087-c0007478cde6 52293f78-018a-47a9-aebb-3b912f797c83 -->
# Airbnb-Inspired Design System Redesign

## Design Principles

**Visual Style:**

- Light theme with white/off-white backgrounds
- Subtle shadows for depth (no harsh borders)
- Rounded corners (8px for cards, 24px for buttons)
- Generous white space and padding
- Clean typography hierarchy
- Orange (#FF385C - Airbnb-like) as primary accent for CTAs and highlights

**Color Palette:**

- Primary: `#FF385C` (vibrant coral-pink, Airbnb-like)
- Background: `#FFFFFF` (white)
- Surface: `#F7F7F7` (light gray for cards)
- Text Primary: `#222222` (near black)
- Text Secondary: `#717171` (gray)
- Border: `#DDDDDD` (light gray)
- Success: `#00A699` (teal)
- Hover States: Subtle gray overlays

## Phase 1: Design System Setup

### Update Color Tokens

**File: `src/app/(frontend)/styles.css`**

Replace current dark theme tokens with light theme:

```css
@theme {
  --color-primary: #FF385C;
  --color-primary-dark: #E31C5F;
  --color-background: #FFFFFF;
  --color-surface: #F7F7F7;
  --color-border: #DDDDDD;
  --color-text-primary: #222222;
  --color-text-secondary: #717171;
  --color-text-muted: #B0B0B0;
  --color-success: #00A699;
  --color-error: #C13515;
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 24px;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

Update body styles for light theme:

- White background
- Dark text color
- Remove black backgrounds

## Phase 2: Navigation Redesign

**File: `src/components/NavigationClient.tsx`**

Airbnb-style navigation:

- White background with subtle bottom shadow
- Sticky header
- Logo on left (keep orange)
- Search bar in center (optional)
- User menu on right with rounded avatar
- Rounded button styles for CTAs
- Remove border, add shadow instead
- Smooth hover states

## Phase 3: Offer Cards Redesign

**File: `src/app/(frontend)/offers/OffersContent.tsx`**

Card improvements:

- White background with shadow on hover
- Rounded corners (12px)
- Remove borders, use shadows
- Image with rounded top corners
- Favorite heart button positioned top-right with white background circle
- Clean typography with good spacing
- Price/discount in bold primary color
- Venue name in secondary text color
- Smooth scale transform on hover

## Phase 4: Offer Details Page

**File: `src/app/(frontend)/offers/[slug]/page.tsx`**

Airbnb-style details:

- Full-width hero image with rounded corners
- Sticky booking card on right (desktop) or bottom (mobile)
- Clean section dividers (subtle lines)
- Generous padding and white space
- Map in rounded container with shadow
- Reviews displayed with user avatars (or initials)
- Primary CTA button: large, rounded, primary color
- Breadcrumb navigation at top

## Phase 5: Forms Redesign

**Files:**

- `src/app/(frontend)/merchant/offers/create/OfferForm.tsx`
- `src/app/(frontend)/merchant/venues/create/page.tsx`
- `src/app/(frontend)/auth/login/page.tsx`
- `src/app/(frontend)/auth/signup/page.tsx`

Form styling:

- White cards with subtle shadow
- Rounded input fields (8px)
- Light gray borders that turn primary on focus
- Floating labels or clear placeholder text
- Primary color submit buttons with rounded corners
- Proper field spacing and grouping
- Validation states with color coding

## Phase 6: Dashboard Redesign

**File: `src/app/(frontend)/merchant/dashboard/DashboardContent.tsx`**

Dashboard improvements:

- White background
- Stats cards with subtle shadows and rounded corners
- Color-coded metrics (use primary sparingly)
- Clean data tables with alternating row colors
- Charts with Airbnb-style colors
- Quick action buttons with rounded style

## Phase 7: Analytics Page

**File: `src/app/(frontend)/merchant/analytics/page.tsx`**

Analytics styling:

- White cards for each metric group
- Rounded corners and shadows
- Date picker with rounded inputs
- Color-coded charts (primary color for main data)
- Export button in secondary style
- Clean grid layout

## Phase 8: My Claims & Favorites

**Files:**

- `src/app/(frontend)/my-claims/page.tsx`
- `src/app/(frontend)/my-favorites/page.tsx`

List improvements:

- Card-based layout with shadows
- Rounded corners
- Status badges with rounded style and appropriate colors
- Clean separation between items
- Empty states with illustrations or icons

## Phase 9: Modal & Component Updates

**Files:**

- `src/components/ConfirmModal.tsx`
- `src/components/FavoriteButton.tsx`
- `src/app/(frontend)/offers/[slug]/Reviews.tsx`

Component updates:

- Modal: centered, rounded corners, white background, shadow overlay
- Buttons: rounded (24px), proper padding, hover states
- Star ratings: larger, cleaner
- Toast notifications: rounded with shadows

## Phase 10: Authentication Pages

**Files:**

- `src/app/(frontend)/auth/login/page.tsx`
- `src/app/(frontend)/auth/signup/page.tsx`
- `src/app/(frontend)/auth/verify-phone/page.tsx`

Auth page styling:

- Centered card layout
- White background with shadow
- Rounded inputs and buttons
- Social auth buttons if needed
- Clean error/success states
- Smooth transitions

## Phase 11: Landing Page

**File: `src/app/(frontend)/page.tsx`**

Hero section:

- Large search bar (Airbnb style)
- Clean CTAs with rounded buttons
- Feature cards with icons
- Testimonials/reviews section
- Footer with organized links

## Implementation Guidelines

### Typography

- Headings: Bold, clear hierarchy
- Body: Regular weight, good line height (1.6)
- Use system fonts or keep Space Grotesk/DM Sans

### Spacing

- Consistent padding (16px, 24px, 32px)
- Generous margins between sections
- Card padding: 24px

### Interactions

- Subtle hover effects (scale 1.02, shadow increase)
- Smooth transitions (200-300ms)
- Focus states with primary color outline
- Active states with slight color darkening

### Responsive Design

- Mobile-first approach
- Stacked layouts on mobile
- Grid layouts on desktop
- Collapsible navigation on mobile

### Accessibility

- Maintain color contrast ratios
- Focus indicators
- Semantic HTML
- ARIA labels where needed

## Todo Breakdown

### Design System

- [ ] Update Tailwind color tokens to light theme
- [ ] Add shadow utilities
- [ ] Add border radius utilities
- [ ] Update typography scale

### Navigation

- [ ] Redesign main navigation header
- [ ] Add search bar (optional)
- [ ] Update mobile menu

### Cards & Lists

- [ ] Redesign offer cards
- [ ] Update card grid layouts
- [ ] Add hover animations

### Detail Pages

- [ ] Redesign offer detail page
- [ ] Update booking/claim flow
- [ ] Improve photo display

### Forms

- [ ] Redesign all form inputs
- [ ] Update button styles
- [ ] Improve validation states

### Dashboard

- [ ] Redesign merchant dashboard
- [ ] Update analytics page
- [ ] Improve data visualization

### User Pages

- [ ] Redesign my-claims page
- [ ] Redesign my-favorites page
- [ ] Update profile pages

### Components

- [ ] Update modal components
- [ ] Redesign review components
- [ ] Update favorite button

### Auth

- [ ] Redesign login page
- [ ] Redesign signup page
- [ ] Update verification pages

### Landing

- [ ] Redesign hero section
- [ ] Update features section
- [ ] Improve CTAs

### To-dos

- [ ] Implement geofence enforcement in claim API with distance validation
- [ ] Implement cooldown period enforcement in claim API
- [ ] Create reviews API endpoints (POST, GET) with validation
- [ ] Build review submission form and reviews display on offer details
- [ ] Create favorites API endpoints (POST, DELETE, GET)
- [ ] Build favorite button component and my-favorites page
- [ ] Create comprehensive analytics API with metrics and date filtering
- [ ] Build analytics dashboard page with charts and key metrics
- [ ] Add photo upload to offer forms and display in UI
- [ ] Setup Vercel Cron configuration and update expire-claims endpoint
- [ ] Add geolocation request and distance display in claim flow
- [ ] Update navigation with favorites and analytics links