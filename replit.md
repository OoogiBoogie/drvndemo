# DRVN VHCLS Mini App - Replit Configuration

## Overview

DRVN VHCLS is a next-generation automotive platform that tokenizes real-world automotive assets (RWA) on the Base blockchain. This is a full-stack Web3 application featuring:

- **Frontend**: Next.js 15 application with TypeScript, TailwindCSS, and OnchainKit
- **Smart Contracts**: Hardhat development environment with Solidity contracts
- **Blockchain**: Built on Base (Ethereum L2)
- **Database**: MongoDB for user data, Redis for caching/notifications
- **IPFS**: Pinata for decentralized storage

## Current State

The project has been configured to run in the Replit environment:

- ✅ Node.js 22 installed
- ✅ Frontend dependencies installed
- ✅ Development server configured to run on port 5000
- ✅ Next.js configured to allow all hosts (required for Replit proxy)
- ✅ Workflow set up for frontend development

## Project Structure

```
DRVN-MINI-APP/
├── Frontend/              # Next.js 15 frontend application
│   ├── app/               # Next.js App Router pages and API routes
│   │   ├── api/           # Backend API routes
│   │   ├── components/    # React components
│   │   ├── cars/          # Car detail pages
│   │   ├── garage/        # User garage
│   │   ├── social/        # Social features
│   │   ├── sponsors/      # Sponsorship system
│   │   └── swap/          # Token swap interface
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and models
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── Hardhat/               # Smart contracts workspace
│   ├── contracts/         # Solidity smart contracts
│   ├── deploy/            # Deployment scripts
│   ├── scripts/           # Utility scripts
│   └── package.json       # Contract dependencies
│
└── mints/                 # Additional contract files
```

## Environment Variables

The application requires several environment variables to function. Copy `Frontend/.env.example` to `Frontend/.env.local` and fill in the values:

### Required Services:
- **OnchainKit API Key**: Get from [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/)
- **MongoDB**: Database connection string (contact DBRO/DRVN Labo for access)
- **Redis**: URL and token from [console.upstash.com](https://console.upstash.com/)
- **Pinata**: API keys from [app.pinata.cloud](https://app.pinata.cloud/)
- **Alchemy**: API key from [alchemy.com](https://www.alchemy.com/)

### Optional Services:
- Farcaster credentials (for Farcaster Mini App support)

## Development

### Running the Application

The frontend development server is configured to run automatically via the workflow.

**Manual start:**
```bash
cd Frontend
npm run dev
```

The app will be available at the Replit webview URL (port 5000).

### Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **OnchainKit**: Wallet integration for Base
- **Wagmi/Viem**: Web3 React hooks and Ethereum library
- **TailwindCSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management

### Smart Contracts (Hardhat)

The Hardhat workspace contains:
- NFT contracts (Carbon, Steel, Titanium tiers)
- Vehicle Registry contract
- Sponsorship NFT contract
- Token Wrapper contract
- BSTR Vault contract

**Note**: Smart contract development is separate from the frontend. Install dependencies in the Hardhat folder with `yarn install` if needed.

## Architecture Notes

### Multi-Platform Support

The application supports multiple access methods:
- **Standard dApp**: Direct web access
- **Farcaster Mini App**: Integration with Farcaster
- **Base Mini App**: Integration with Base.dev

### Key Features

1. **Vehicle Tokenization**: Register and tokenize real-world cars
2. **NFT Collections**: Exclusive car collections (Paul Walker Ferrari, R34 GT-R, etc.)
3. **Social Features**: User profiles, posts, content feed
4. **Sponsorship System**: Sponsor vehicles and earn rewards
5. **Token Swap**: Exchange tokens within the platform
6. **Wallet Authentication**: Web3-based user authentication

## Recent Changes

### November 26, 2025 - Vehicle Detail Modal Implementation
- **Created VehicleDetailModal** as a full-screen responsive overlay for registered vehicle details:
  - Full-screen modal with dark backdrop and scrollable content
  - Swipeable image gallery using SwipeableGallery component
  - Car Profile Card showing vehicle name, location, registry ID, owner info, and follow button
  - Sponsorship Module for minting sponsorship slots (owner view) or viewing sponsors (public view)
  - Token Details section for upgraded vehicles showing price, market cap, 24hr change
  - Content Feed section with tabs for Timeline, Gallery, Modifications
  - Responsive layout: 2-column grid on desktop (profile+sponsors | token+feed), stacked on mobile
- **Updated VHCLRegistry component**:
  - Changed from `<Link>` navigation to `<button>` with `onVehicleClick` callback
  - Vehicle clicks now open modal overlay instead of navigating to separate route
  - Maintains context on Garage page without full page reload
- **Updated Garage component**:
  - Added state management for `selectedVehicle` and `showVehicleDetail`
  - Added `handleVehicleClick` handler to convert vehicle data for modal format
  - Renders VehicleDetailModal conditionally when vehicle is selected

### November 25, 2025 - Edit Profile Navigation & Farcaster Social Links
- **Fixed Edit Profile button navigation**:
  - Added `onNavigate` prop to Garage component for in-dashboard navigation
  - Edit Profile button now uses `setActivePage("settings")` instead of `router.push("/settings")`
  - Stays within the dashboard context without full page reload
- **Added Farcaster to social links editing**:
  - Added farcaster field to `SocialLinksEditor` component
  - Updated `SOCIAL_PLATFORMS` array to include Farcaster as first option
  - Added farcaster to Settings `socialLinks` state and User interface
  - All social link initializations now include farcaster with proper defaults

### November 25, 2025 - Garage Page Redesigned as Public Profile
- **Implemented public/private section separation**:
  - Dynamic `isOwner` detection comparing connected wallet address with profile wallet address
  - Added `profileWalletAddress` prop to support viewing other users' profiles
  - **Public sections** (visible to everyone): User Profile Card, Swipeable Garage Graphic, VHCL Collection, VHCL Registry, Digital Collectibles
  - **Private sections** (visible only to profile owner): Assets Vault with "Private" badge
- **Enhanced UserProfileCard**:
  - Added Farcaster social link support in SocialLinks interface
  - Social links now include: farcaster, base, x, instagram, facebook, youtube, tiktok, linkedin
  - Proper URL formatting for all social links
- **Updated DigitalCollectibles component**:
  - Added `profileAddress` and `isOwner` props for public profile viewing
  - Dynamic messaging based on profile ownership
  - "Collections to purchase" recommendations only shown to profile owners
- **VHCL Collection layout improvements**:
  - Full-width layout for non-owners (since they don't see Assets Vault)
  - Grid layout with Assets Vault for owners
- **RegisterVehicleModal** already integrated for vehicle registration flow

### November 25, 2025 - Amplified DRVN Culture Page
- **Complete redesign of DRVN Culture section** as a full content hub:
  - Hero header with updated tagline "Your gateway to automotive culture, IRL and onchain"
  - **Category filter tabs**: All Content, Trending, Podcasts, Videos, Motorsport, JDM
  - **Featured Content section** with the existing Top Stories carousel
  - **Stats bar** showing Episodes (24), Total Views (156K), Creators (12), Premium Series (3)
  - **Latest Episodes grid** with thumbnail cards showing:
    - Episode title, host, duration, date
    - Play button overlay and NEW badges for recent content
  - **Browse by Category grid** with 8 category tiles:
    - Podcasts, Videos, Motorsport, JDM Culture, Euro Scene, American Muscle, Onchain, IRL Events
    - Each with item counts and gradient backgrounds
  - **Coming Soon section** for DRVN Originals:
    - Teaser for exclusive documentaries and behind-the-scenes content
    - Get Notified and Learn More buttons
  - **Featured Creators spotlight** showing 4 creator profiles:
    - Avatar, name, handle, and follower counts
- Consistent navigation behavior: DRVN Culture now renders within dashboard like Garage/Social/Buster Club

### November 25, 2025 - Enhanced Social Hub with Multi-Platform Integration
- **Completely redesigned Social page** (`/social`) as a Social Hub:
  - Hero header with "Social Hub" branding and car garage background
  - Platform connection cards for Farcaster, Base, and X (Twitter)
  - Each platform shows connection status, benefits, and connect buttons
  - Stats bar showing platforms connected, post count, and on-chain status
- **Multi-platform feed filtering**:
  - Extended `SocialPostSource` type to include: in-app, farcaster, base, x
  - Added platform badges with icons (🚗 DRVN, 🟣 Farcaster, 🔵 Base, ✕ X)
  - Feed filters show platform icons and post counts
- **Cross-posting functionality**:
  - Added `CrossPostSettings` and `PlatformConnection` types
  - CreatePostModal includes platform selection toggles
  - Posts show "Also on:" badges for cross-posted content
- **Enhanced PostCard component**:
  - Platform-colored badges for each source
  - External link icons for posts from external platforms
  - Cross-posted indicators showing where else content was shared
- **Extended social types** in `types.ts`:
  - Added `SocialPlatform`, `PlatformConnection`, `CrossPostSettings`
  - Extended `SocialAuthor` with fid, baseAddress, xHandle
  - Extended `SocialPost` with crossPostedTo and externalUrl

### November 25, 2025 - Social Feed Navigation & Type Fixes
- **Added Social Feed tab** to navigation menu between Buster Club and Settings
  - Uses MessageSquare icon from lucide-react
  - Inherits green styling consistent with other main navigation items
  - Integrated into dashboard's activePage system with "Open Social Feed" button
- **Fixed TypeScript errors in Garage.tsx**
  - Added RwaHolding interface for proper typing
  - Typed rwaHoldings array to eliminate implicit any usage
- **Updated next.config.mjs** to add external image domains:
  - Wikipedia (upload.wikimedia.org)
  - Pravatar (i.pravatar.cc)
  - Unsplash (images.unsplash.com)
  - GitHub avatars (avatars.githubusercontent.com)

### November 25, 2025 - Replit Setup
- Installed Node.js 22 module
- Installed frontend dependencies (npm install)
- Updated Next.js configuration to run on port 5000 with host 0.0.0.0
- **Disabled Next.js host checking** via `.env.development.local` file with `DANGEROUSLY_DISABLE_HOST_CHECK=true`
  - **Rationale**: Replit serves the application through a proxy with dynamic domains (*.replit.dev, *.id.repl.co)
  - Next.js 15 has strict host validation by default which would block Replit's proxy traffic
  - Using DANGEROUSLY_DISABLE_HOST_CHECK disables host validation to allow all Replit preview domains
  - This is safe in the Replit development environment as it's isolated and not publicly accessible without authentication
  - The setting is in .env.development.local which is gitignored and only affects local development
- Set HOSTNAME=0.0.0.0 in .env.development.local and npm scripts to bind to all network interfaces
- Updated package.json dev and start scripts for port 5000 with explicit host binding
- Created workflow: "Frontend Dev Server" on port 5000
- Updated .env.example to reference port 5000 instead of 3000
- Configured deployment with autoscale target using Next.js production server

## User Preferences

None documented yet.

## Known Issues

- Application requires external services (MongoDB, Redis) to be fully functional
- Environment variables need to be configured for full functionality
- Smart contracts are separate and may need independent setup

## Development Guidelines

### Code Standards
- TypeScript for all new code
- Functional React components with hooks
- Follow existing patterns in the codebase
- Use Prettier for formatting
- Run linting before commits

### Commit Conventions
- Follow Conventional Commits format
- Branch naming: `feature/`, `fix/`, `docs/`, etc.
- All checks must pass before PR merge

### Testing
```bash
cd Frontend
npm run typecheck  # TypeScript checking
npm run lint       # ESLint
npm run build      # Production build test
```

## Deployment

The application can be deployed using Replit's deployment feature. For production:

1. Set all required environment variables
2. Run `npm run build` to verify production build
3. Configure deployment to use `npm run start` command
4. Ensure port 5000 is configured

## Support

- **Documentation**: See README.md and DEVELOPER_SETUP.md
- **Lead Developer**: Justin Taylor (Decentral Bros LLC)
- **Email**: development@decentralbros.tech
- **Website**: [www.decentralbros.io](https://www.decentralbros.io)

## License

Apache License 2.0
