# ConsentCycle Web App

A privacy-focused cycle tracking web application built with React, TypeScript, and Privy authentication.

## Features

- **Secure Authentication**: Powered by Privy with support for email, Google, and Twitter login
- **Privacy-First**: All data is encrypted and users control their consent
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS for a clean, accessible interface

## Authentication Setup

This app uses [Privy](https://privy.io) for authentication. To set up your own Privy app:

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Create a new app
3. Copy your App ID
4. Set the environment variable:
   ```bash
   export VITE_PRIVY_APP_ID=your-app-id-here
   ```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── logging/        # Cycle logging components
│   └── ui/             # Reusable UI components
├── hooks/
│   ├── auth/           # Authentication hooks
│   ├── data/           # Data management hooks
│   └── sharing/        # Sharing functionality hooks
├── pages/              # Page components
├── lib/
│   └── types/          # TypeScript type definitions
└── App.tsx             # Main app component
```

## Authentication Flow

1. User visits the app
2. `AuthGuard` checks if user is authenticated
3. If not authenticated, shows `LoginScreen`
4. User can login with email, Google, or Twitter
5. After successful authentication, user sees the main app

## Environment Variables

- `VITE_PRIVY_APP_ID`: Your Privy App ID (required for authentication)

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Privy (Authentication)
- React Router (Navigation) 