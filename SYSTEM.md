# PrivyCycle - System Architecture & File Structure

## Project Overview
Privacy-first, end-to-end encrypted period tracking PWA with blockchain anchoring and selective sharing capabilities. Sophisticated dark theme with clean, minimal design that subtly honors cypherpunk privacy principles while maintaining medical-grade professionalism.

## Core Technologies & Versions

### Frontend Stack
- **React** 18.2.0 + **TypeScript** 5.3.3
- **Vite** 5.0.8 (dev server, fast builds)
- **Vite PWA Plugin** 0.17.4 (minimal PWA setup)
- **Tailwind CSS** 3.4.1 + **PostCSS** 8.4.32
- **React Router** 6.20.1 (client-side routing)

### Authentication & Crypto
- **Privy SDK** @privy-io/react-auth ^1.46.4 (email/SMS auth → non-custodial keys)
- **Libsodium** libsodium-wrappers ^0.7.11 (encryption/decryption)
- **Ethers.js** 6.8.0 (blockchain interaction)

### Data & Storage
- **Dexie** 3.2.4 (IndexedDB wrapper with encryption)

### Development Tools
- **ESLint** 8.55.0 (with TypeScript rules)
- **Prettier** 3.1.0 (code formatting)

## Architecture Principles

### Privacy & Security
- **Zero-knowledge storage** - All data encrypted client-side before storage
- **Offline-first** - Full functionality without internet connection
- **Modular blockchain** - Zircuit default, easily switchable to other EVM chains
- **End-to-end encryption** - Keys derived from Privy, never leave device in plaintext

### PWA Strategy (Minimal)
- **Installable** - Basic web app manifest for home screen installation
- **Offline capable** - Simple service worker for app shell caching
- **Local-first** - All operations work immediately, sync when online
- **Basic sync** - Queue blockchain operations for when connection returns

### Design Philosophy
- **Sophisticated dark theme** - Single mode, no light/dark toggle
- **Clean minimalism** - Generous whitespace, thoughtful typography
- **Medical-grade polish** - Professional enough for healthcare settings
- **Accessibility-first** - WCAG AA compliance, high contrast
- **Privacy-conscious UX** - Subtle cues about encryption and data control
- **Fully responsive** - Mobile-first design, works on all screen sizes

## Design System

### Color Palette (Sophisticated Dark)
```css
/* Primary Backgrounds */
--bg-primary: #0f172a;      /* Deep navy */
--bg-secondary: #1e293b;    /* Charcoal */
--bg-tertiary: #334155;     /* Slate gray */

/* Text Colors */
--text-primary: #f8fafc;    /* Clean white */
--text-secondary: #cbd5e1;  /* Light gray */
--text-muted: #94a3b8;      /* Muted gray */

/* Accent Colors */
--accent-primary: #06b6d4;  /* Sophisticated teal */
--accent-secondary: #8b5cf6; /* Muted purple */

/* Semantic Colors */
--success: #10b981;         /* Soft green */
--warning: #f59e0b;         /* Warm amber */
--error: #ef4444;           /* Muted red */

/* Borders & Dividers */
--border-primary: #475569;  /* Subtle borders */
--border-secondary: #64748b; /* Lighter borders */
```

### Typography
- **Primary Font:** Inter (clean, readable)
- **Font Sizes:** 12px, 14px, 16px, 18px, 24px, 32px, 48px
- **Font Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Responsive Breakpoints
- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+

## Project Structure

```
privycycle/
├── public/
│   ├── manifest.json                # PWA manifest (installable)
│   ├── sw.js                       # Simple service worker
│   ├── favicon.ico
│   ├── icon-192.png                # PWA icon 192x192
│   ├── icon-512.png                # PWA icon 512x512
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── Button.tsx           # Primary/secondary button variants
│   │   │   ├── Card.tsx             # Dashboard cards with hover states
│   │   │   ├── Input.tsx            # Form inputs with validation states
│   │   │   ├── Modal.tsx            # Overlay modals for forms/confirmations
│   │   │   ├── LoadingSpinner.tsx   # Loading states
│   │   │   ├── Badge.tsx            # Status indicators
│   │   │   ├── Tooltip.tsx          # Contextual help
│   │   │   ├── ProgressBar.tsx      # Cycle progress indicators
│   │   │   └── OfflineIndicator.tsx # Offline status display
│   │   │
│   │   ├── dashboard/               # Main dashboard components
│   │   │   ├── InsightCard.tsx      # Expandable insight cards
│   │   │   ├── CycleOverview.tsx    # Current cycle status
│   │   │   ├── PredictionCard.tsx   # Next period predictions
│   │   │   ├── SymptomTrends.tsx    # Symptom pattern visualization
│   │   │   └── DashboardLayout.tsx  # Main dashboard container
│   │   │
│   │   ├── logging/                 # Cycle logging interface
│   │   │   ├── LogEntryForm.tsx     # Main logging form
│   │   │   ├── FlowSelector.tsx     # Flow intensity picker
│   │   │   ├── SymptomPicker.tsx    # Multi-select symptoms
│   │   │   ├── MoodSelector.tsx     # Mood tracking
│   │   │   ├── QuickLog.tsx         # One-tap period start
│   │   │   └── NotesInput.tsx       # Free-form notes
│   │   │
│   │   ├── sharing/                 # Data sharing components
│   │   │   ├── FamilyDashboard.tsx  # Family member view (read-only)
│   │   │   ├── PartnerDashboard.tsx # Partner view with tips & support
│   │   │   ├── DoctorCapsule.tsx    # Medical data export
│   │   │   ├── GiftDataFlow.tsx     # Data inheritance setup
│   │   │   ├── ShareModal.tsx       # Sharing configuration
│   │   │   ├── ACLManager.tsx       # Access control settings
│   │   │   ├── QRCodeShare.tsx      # QR code for doctor access
│   │   │   ├── PartnerInvite.tsx    # Partner invitation system
│   │   │   └── PartnerTips.tsx      # Tips and guidance for partners
│   │   │
│   │   ├── auth/                    # Authentication components
│   │   │   ├── LoginForm.tsx        # Privy login interface
│   │   │   ├── PrivyWrapper.tsx     # Privy provider wrapper
│   │   │   ├── AuthGuard.tsx        # Route protection
│   │   │   └── KeyRecovery.tsx      # Key backup/recovery flow
│   │   │
│   │   └── layout/                  # App layout components
│   │       ├── Header.tsx           # Top navigation bar
│   │       ├── Navigation.tsx       # Responsive navigation menu
│   │       ├── MobileMenu.tsx       # Mobile hamburger menu
│   │       └── AppLayout.tsx        # Main app container
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── auth/                    # Authentication hooks
│   │   │   ├── usePrivyAuth.ts      # Privy integration wrapper
│   │   │   ├── useKeyManagement.ts  # Crypto key derivation/storage
│   │   │   └── useAuthState.ts      # Authentication state management
│   │   │
│   │   ├── data/                    # Data management hooks
│   │   │   ├── useEncryptedStorage.ts # Encrypted IndexedDB operations
│   │   │   ├── useLogEntries.ts     # Cycle log CRUD operations
│   │   │   ├── useCycleData.ts      # Cycle calculations and state
│   │   │   ├── useOfflineSync.ts    # Offline/online sync logic
│   │   │   └── useDataExport.ts     # Data export/backup
│   │   │
│   │   ├── insights/                # Analytics and insights hooks
│   │   │   ├── useCycleInsights.ts  # Cycle pattern analysis
│   │   │   ├── usePredictions.ts    # Period prediction algorithms
│   │   │   ├── usePersonalAI.ts     # On-device AI insights
│   │   │   ├── useSymptomTrends.ts  # Symptom pattern tracking
│   │   │   └── usePartnerTips.ts    # Partner-specific tips and guidance
│   │   │
│   │   ├── sharing/                 # Data sharing hooks
│   │   │   ├── useShareCapsules.ts  # Encrypted data capsule creation
│   │   │   ├── useFamilyACL.ts      # Family access control
│   │   │   ├── usePartnerACL.ts     # Partner access control
│   │   │   ├── useGiftData.ts       # Data inheritance management
│   │   │   ├── useBlockchainACL.ts  # On-chain access control
│   │   │   └── usePartnerLink.ts    # Partner invitation/linking
│   │   │
│   │   └── ui/                      # UI-specific hooks
│   │       ├── useModal.ts          # Modal state management
│   │       ├── useToast.ts          # Toast notifications
│   │       ├── useResponsive.ts     # Responsive breakpoint detection
│   │       ├── useOffline.ts        # Offline status detection
│   │       └── useLocalStorage.ts   # Browser storage utilities
│   │
│   ├── lib/                         # Core utilities and services
│   │   ├── crypto/                  # Cryptographic utilities
│   │   │   ├── encryption.ts        # Libsodium encryption wrappers
│   │   │   ├── keyDerivation.ts     # Key derivation from Privy
│   │   │   ├── hashing.ts           # Data hashing for blockchain
│   │   │   └── signatures.ts        # Digital signatures
│   │   │
│   │   ├── storage/                 # Data persistence layer
│   │   │   ├── database.ts          # Dexie database schema
│   │   │   ├── indexedDB.ts         # IndexedDB operations
│   │   │   ├── migrations.ts        # Database schema migrations
│   │   │   ├── backup.ts            # Data backup/restore
│   │   │   └── syncQueue.ts         # Offline operation queue
│   │   │
│   │   ├── blockchain/              # Blockchain integration
│   │   │   ├── zircuit.ts           # Zircuit-specific implementation
│   │   │   ├── contracts.ts         # Smart contract interfaces
│   │   │   ├── anchoring.ts         # Data anchoring service
│   │   │   ├── acl.ts               # Access control contracts
│   │   │   └── provider.ts          # Blockchain provider abstraction
│   │   │
│   │   ├── types/                   # TypeScript type definitions
│   │   │   ├── user.ts              # User and authentication types
│   │   │   ├── cycle.ts             # Cycle and health data types
│   │   │   ├── sharing.ts           # Sharing and ACL types
│   │   │   ├── partner.ts           # Partner-specific types
│   │   │   ├── blockchain.ts        # Blockchain-related types
│   │   │   ├── pwa.ts               # PWA-related types
│   │   │   └── api.ts               # API response types
│   │   │
│   │   ├── utils/                   # General utilities
│   │   │   ├── dateHelpers.ts       # Date manipulation utilities
│   │   │   ├── cycleCalculations.ts # Cycle math and predictions
│   │   │   ├── validation.ts        # Form and data validation
│   │   │   ├── formatting.ts        # Data formatting utilities
│   │   │   ├── partnerTips.ts       # Partner tip generation logic
│   │   │   └── constants.ts         # App-wide constants
│   │   │
│   │   ├── ai/                      # On-device AI utilities
│   │   │   ├── insights.ts          # AI insight generation
│   │   │   ├── predictions.ts       # ML prediction models
│   │   │   ├── partnerAI.ts         # Partner-specific AI insights
│   │   │   └── privacy.ts           # Privacy-preserving AI
│   │   │
│   │   └── pwa/                     # PWA utilities
│   │       ├── serviceWorker.ts     # Service worker registration
│   │       ├── install.ts           # App installation prompts
│   │       └── offline.ts           # Offline detection utilities
│   │
│   ├── pages/                       # Main application pages
│   │   ├── Dashboard.tsx            # Main dashboard view
│   │   ├── LogEntry.tsx             # Cycle logging page
│   │   ├── Family.tsx               # Family sharing dashboard
│   │   ├── Partner.tsx              # Partner dashboard with tips
│   │   ├── Doctor.tsx               # Medical data sharing
│   │   ├── Settings.tsx             # App settings and preferences
│   │   ├── Privacy.tsx              # Privacy settings and key management
│   │   ├── Login.tsx                # Authentication page
│   │   └── NotFound.tsx             # 404 error page
│   │
│   ├── styles/                      # Global styles and themes
│   │   ├── globals.css              # Global CSS reset and base styles
│   │   ├── components.css           # Component-specific styles
│   │   └── animations.css           # Transition and animation styles
│   │
│   ├── assets/                      # Static assets
│   │   ├── icons/                   # SVG icons and graphics
│   │   │   ├── cycle.svg
│   │   │   ├── symptoms.svg
│   │   │   ├── sharing.svg
│   │   │   ├── privacy.svg
│   │   │   ├── partner.svg
│   │   │   └── offline.svg
│   │   └── images/                  # Images and illustrations
│   │
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # App entry point
│   └── vite-env.d.ts               # Vite type definitions
│
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.node.json              # Node.js TypeScript config
├── vite.config.ts                  # Vite build configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── eslint.config.js                # ESLint configuration
├── .gitignore                      # Git ignore rules
├── README.md                       # Project documentation
└── SYSTEM.md                       # This file
```

## Key Features Implementation

### 1. Authentication Flow
- Privy email/SMS login → non-custodial wallet generation
- Key derivation for encryption from wallet private key
- Secure key storage in browser with optional export

### 2. Data Storage Architecture
- All data encrypted with user's derived key before IndexedDB storage
- Offline-first with automatic sync when online
- Simple queue for blockchain operations when offline
- Daily blockchain anchoring of data hashes for tamper evidence

### 3. PWA Capabilities (Minimal)
- **Installable:** Basic manifest.json for home screen installation
- **Offline-capable:** Simple service worker caches app shell
- **Sync queue:** Operations queued when offline, processed when online
- **Status indicator:** Clear offline/online status for users

### 4. Sharing Mechanisms
- **Family Dashboard:** Read-only access with configurable detail levels
- **Partner Dashboard:** Cycle status, tips, and supportive guidance for boyfriends/girlfriends
- **Doctor Capsule:** Time-limited, depth-controlled medical data export
- **Gift Data:** Inheritance mechanism with time-locks or trigger conditions

### 5. Partner Features
- **Cycle Status:** Current phase, days until next period, general mood indicators
- **Partner Tips:** AI-generated suggestions for support (e.g., "Great time for a date night", "Consider extra patience this week")
- **Symptom Awareness:** General symptom patterns without detailed medical info
- **Support Suggestions:** Actionable advice for being a supportive partner
- **Privacy Controls:** User controls exactly what partner can see

### 6. Privacy Features
- Zero-knowledge storage (app never sees plaintext data)
- On-device AI insights (no data leaves device)
- Granular sharing controls for different relationship types
- Optional community analytics via Oasis TEE (fully anonymized)

### 7. Responsive Design
- Mobile-first approach with touch-friendly interfaces
- Adaptive layouts for tablet and desktop
- Optimized for both portrait and landscape orientations
- Fast loading and smooth interactions

## Development Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

## Partner Dashboard Features

### Information Shared with Partners
- **Cycle Phase:** Menstrual, follicular, ovulation, luteal (general phases)
- **Mood Trends:** General mood patterns without specific details
- **Energy Levels:** High/medium/low energy indicators
- **Comfort Needs:** Suggestions for support without medical details
- **Timeline:** Days until next period (if user chooses to share)

### Partner Tips & Guidance
- **Phase-specific advice:** "This is a great time for active dates" vs "Consider cozy nights in"
- **Mood support:** "Extra patience and understanding may be appreciated"
- **Comfort suggestions:** "Hot water bottle or heating pad might help"
- **Activity recommendations:** Based on energy levels and cycle phase
- **Communication tips:** How to be supportive without being intrusive

### Privacy Controls for Partners
- **Granular permissions:** Choose exactly what information to share
- **Time-limited access:** Set expiration dates for partner access
- **Revocable sharing:** Instantly revoke partner access if needed
- **Anonymous mode:** Share general patterns without specific dates

## Minimal PWA Implementation Details

### Service Worker Strategy
```javascript
// Cache app shell (HTML, CSS, JS)
// Serve from cache when offline
// Network-first for API calls
// Cache-first for static assets
```

### Offline Sync Queue
```typescript
// Queue blockchain operations when offline
// Process queue when connection returns
// Simple retry mechanism with exponential backoff
// User feedback for sync status
```

### Installation Flow
```typescript
// Detect PWA installability
// Show install prompt at appropriate time
// Handle installation success/failure
// Update UI based on installation status
```

## Next Steps for Implementation

1. **Setup Phase:** Initialize Vite project with TypeScript, Tailwind, and PWA plugin
2. **Authentication:** Integrate Privy and implement key derivation
3. **Storage Layer:** Set up encrypted IndexedDB with Dexie
4. **PWA Basics:** Create manifest, simple service worker, offline detection
5. **Core UI:** Build responsive dashboard and logging components
6. **Partner System:** Implement partner invitation, linking, and dashboard
7. **Blockchain:** Implement Zircuit integration for data anchoring
8. **Sharing:** Create encrypted capsule system for all sharing types
9. **Sync Queue:** Implement offline operation queue
10. **Partner Tips:** Develop AI-driven partner guidance system
11. **Polish:** Implement sophisticated dark theme and animations
12. **Testing:** Ensure offline functionality and sharing permissions work correctly

This architecture provides a comprehensive foundation for PrivyCycle with the essential partner support features that make the app valuable for couples while maintaining strict privacy controls and user autonomy.
