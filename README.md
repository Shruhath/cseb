# Linktree Clone - Firebase Edition

A production-ready Linktree-style profile link sharing app built with React, Next.js, Firebase, and Tailwind CSS.

## Features

- **Public Profile Page** - Beautiful minimal design with black background and burnt orange accents
- **Admin Dashboard** - Manage links with real-time updates via Firestore
- **Firebase Authentication** - Email/password based admin login
- **Role-Based Access** - Only users in the `admins` collection can manage links
- **Responsive Design** - Mobile-first, optimized for all screen sizes
- **Real-Time Updates** - Firestore listeners ensure instant sync across all sessions

## Tech Stack

- **Frontend**: React 19 + Next.js 16 (App Router)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 2. Configure Firebase

The app comes pre-configured with a Firebase project (`semtree-2450d`). For production:

1. Create your own Firebase project at [firebase.google.com](https://firebase.google.com)
2. Update the `firebaseConfig` in `lib/firebase.ts` with your credentials
3. Set up environment variables (optional but recommended for production):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - etc.

### 3. Set Up Firestore

1. Go to Firebase Console → Your Project → Firestore Database
2. Create database in production mode
3. Create two collections:
   - `links` (for storing profile links)
   - `admins` (for storing admin user IDs)
4. Paste the security rules from `firestore.rules` into Firestore Security Rules tab

### 4. Create First Admin Account

**Option A: Using the App (Recommended)**
1. Run the app: `npm run dev`
2. Navigate to `http://localhost:3000/admin`
3. Since `admins` collection is empty, you'll see the "Create First Admin" form
4. Sign up with your email and password
5. Confirm the warning message
6. You're now an admin!

**Option B: Using Firebase Console**
1. In Firebase Console, go to Firestore
2. Create a document in the `admins` collection:
   - Document ID: Your user's UID (get from Auth section)
   - Add field: `role: "admin"`

### 5. Add Sample Links

Once logged in to admin panel:
1. Click "Add New Link"
2. Fill in Title (e.g., "My Portfolio"), URL, and Order
3. Click "Add Link"
4. Repeat for multiple links
5. Links appear immediately on the public page

### 6. Run Locally

\`\`\`bash
npm run dev
\`\`\`

Visit:
- Public page: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`

## File Structure

\`\`\`
app/
├── page.tsx          # Public profile page
├── admin/
│   └── page.tsx      # Admin dashboard & login
├── layout.tsx        # Root layout with metadata
└── globals.css       # Tailwind configuration

lib/
└── firebase.ts       # Firebase initialization & helpers

firestore.rules       # Firestore security rules
sample-links.json     # Example data
README.md             # This file
\`\`\`

## Firestore Structure

### `links` Collection

\`\`\`json
{
  "title": "My Portfolio",
  "url": "https://example.com",
  "order": 0,
  "target": "_blank"
}
\`\`\`

### `admins` Collection

\`\`\`json
{
  "role": "admin"
}
\`\`\`
Document ID should be the user's Firebase UID.

## Admin Panel Features

- ✅ Real-time link management (Create, Read, Update, Delete)
- ✅ Drag-free reordering via numeric order field
- ✅ URL validation
- ✅ Confirmation dialogs for destructive actions
- ✅ Error and success messages
- ✅ First-time admin setup helper
- ✅ Logout functionality

## Design System

- **Background**: Pure black (`#000`)
- **Accent**: Burnt orange (`#CC5500`)
- **Text**: White with subtle gray secondary text
- **Button Style**: Pill-shaped, border-based dark cards
- **Hover Effects**: Subtle scale transform and glow effects
- **Focus Ring**: Burnt orange outline for accessibility

## Security Considerations

### Current Setup (Development/Learning)
- Firebase API key is public (standard for client-side apps)
- Email/password auth with no MFA
- Admins collection protects write operations

### For Production
1. **Enable reCAPTCHA** in Firebase Authentication
2. **Enforce strong passwords** in Firebase auth settings
3. **Enable Multi-Factor Authentication** for admin accounts
4. **Move sensitive config to .env** (though Firebase keys are meant to be public)
5. **Use Cloud Functions** to manage admin roles (more secure than client-side)
6. **Review Firestore Rules** to ensure proper access control
7. **Enable Firestore backups** in Firebase Console

### Firestore Security Rules

The provided rules ensure:
- ✅ Anyone can READ links (public profile)
- ✅ Only authenticated admins can CREATE/UPDATE/DELETE links
- ✅ Only admins can access the `admins` collection

## Deployment

### Option 1: Vercel (Recommended)

\`\`\`bash
# Push to GitHub
git push origin main

# Deploy from Vercel dashboard
# or use Vercel CLI
vercel
\`\`\`

### Option 2: Firebase Hosting

\`\`\`bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
\`\`\`

### Option 3: Any Static Host (Netlify, etc.)

\`\`\`bash
npm run build
# Deploy the `.next` folder
\`\`\`

## Customization

### Change Colors

Edit `app/page.tsx` and `app/admin/page.tsx`:
- `#000` → Background color
- `#CC5500` → Accent color
- `#111`, `#333` → Card/border colors

### Add Profile Avatar

In `app/page.tsx`, replace the avatar section:

\`\`\`tsx
const [avatar, setAvatar] = useState('https://your-avatar-url.jpg');
\`\`\`

### Add Bio and Name

In `app/page.tsx`:

\`\`\`tsx
const [name] = useState('Your Name');
const [bio] = useState('Your bio text');
\`\`\`

## Troubleshooting

### "Access Denied" on Admin Page
- Make sure your user ID exists in the `admins` collection
- Check Firestore Rules are deployed correctly

### Links Not Loading
- Check browser console for Firebase errors
- Verify Firestore Rules allow public read on `links` collection
- Ensure `links` documents have `order` field

### Admin Form Not Working
- Verify Firebase config in `lib/firebase.ts`
- Check that you're authenticated (signed in)
- Look for error messages in the UI

## Environment Variables (Optional)

For production, add to `.env.local`:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
\`\`\`

Then update `lib/firebase.ts` to use these instead of hardcoded values.

## Support

For issues:
1. Check browser console for errors
2. Visit Firebase Console to verify collections exist
3. Review Firestore Rules match the provided snippet
4. Ensure admin user exists in `admins` collection

## License

MIT - Feel free to use and modify for your projects!
