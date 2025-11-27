# DRVN VHCLS Mini App - Replit Configuration

## Overview
DRVN VHCLS is a full-stack Web3 application tokenizing real-world automotive assets (RWA) on the Base blockchain. It features a Next.js 15 frontend, Solidity smart contracts, and decentralized storage. The platform aims to be a next-generation automotive platform, supporting vehicle tokenization, NFT collections, social features, a sponsorship system, and token swaps. It is designed for multi-platform access, including standard dApp, Farcaster Mini App, and Base Mini App integrations.

## User Preferences
None documented yet.

## System Architecture

### UI/UX Decisions
The application utilizes TailwindCSS for utility-first styling and Radix UI for accessible component primitives. Glassmorphic styling is used for modals, creating a modern, transparent effect. The design emphasizes responsive layouts, adapting from desktop (multi-column) to mobile (stacked) views.

### Technical Implementations
- **Frontend**: Next.js 15 with App Router, TypeScript, OnchainKit for wallet integration, Wagmi/Viem for Web3 hooks, and TanStack Query for server state management.
- **Smart Contracts**: Developed with Hardhat, written in Solidity. Includes contracts for various NFT tiers (Carbon, Steel, Titanium), Vehicle Registry, Sponsorship NFTs, Token Wrapper, and BSTR Vault.
- **Multi-Platform Support**: Designed to function as a standard dApp, a Farcaster Mini App, and a Base Mini App.
- **Key Features**:
    - **Vehicle Tokenization**: System for registering and tokenizing real-world vehicles.
    - **NFT Collections**: Management of exclusive automotive NFT collections.
    - **Social Features**: User profiles, content feeds, and multi-platform posting with Farcaster, Base, and X integration.
    - **Sponsorship System**: Allows sponsoring vehicles and earning rewards.
    - **Token Swap**: In-platform token exchange functionality.
    - **Wallet Authentication**: Web3-based user authentication.
- **Development Environment**: Configured for Replit with Node.js 22, frontend dependencies, and a development server on port 5000. Next.js host checking is disabled for Replit proxy compatibility.

### Feature Specifications
- **Vehicle Detail Modal (VHCL)**: Full-screen, responsive overlay for ownership-focused vehicle details including image gallery, car profile card, sponsorship module, token details, valuation card (AV/MV/Spread), content feed (Timeline, Gallery, Modifications), and Tagged Posts section. Uses glassmorphic styling (bg-white/[0.03], bg-black/40 backdrop-blur-md). Opens from Garage page for community/ownership experience.
- **Marketplace Detail Modal**: Buyer-focused modal with same glassmorphic styling but different content. Features:
  - Vehicle identity card with brand, model, year, collection
  - Valuation card with AV/MV/Spread and color-coded spread indicator (green=undervalued buying opportunity, red=premium pricing)
  - Tabbed section for Specs/History/Upgrades with detailed specifications (VIN, mileage, engine, transmission, colors, curb weight)
  - History tab with description and provenance documentation
  - Performance highlights (engine, power, top speed, 0-100 acceleration)
  - Buy Shares action card with Coming Soon handling
  Opens from Marketplace section for shopping/buying experience.
- **Sponsor Details Modal**: Opens when clicking claimed sponsorship slots. Displays sponsor logo (large), website + promo links, social accounts row (Base, X, Instagram, Facebook, YouTube, TikTok, LinkedIn), bio section, photo gallery with navigation, and OpenSea NFT link. Includes wallet-gated "Manage Sponsorship" button (only visible to holder).
- **Manage Sponsorship Modal**: Allows NFT holders to update sponsor branding (name, logo, bio, website, social links, gallery photos). Accessible only when connected wallet matches sponsor's holderAddress.
- **VehicleTitleModule**: Combined component for vehicle detail pages featuring:
  - Left side: NFT image (80x80), vehicle title (nickname or make/model/year), token ticker badge
  - Right side: Token stats (price, 24h change, mcap) with Swap button
  - Owner row: Clickable PFP + username + abbreviated wallet linking to owner's Garage
  - Social icons: Car-associated social links (X, Instagram, etc.) with edit capability for owners
- **SponsorshipModule Enhancements**:
  - Owner view (pre-activation): "Learn More" and "Enable Sponsorships" buttons with clear explanation
  - Active view: Stats row showing Available slots (X of 14), Price Tier with expandable info modal, and View Offer button
  - 7x2 grid layout for 14 sponsor slots with hover states and claimed/available indicators
  - Edit button for owners to manage sponsorship settings
- **Garage Page**: Functions as a public profile, separating public and private sections based on `isOwner` detection. Structure:
  - **User Profile Card** (above Hero on desktop): Two-column compact layout with:
    - Left: PFP, username, Farcaster/Base handles, follower counts
    - Right: Social icons + Follow button (same row), bio with clickable links, token ticker quick links
  - **Hero Section (GarageHero)**: Multi-layer compositing system with fixed-position car overlay:
    - **Layer 1 - Background**: Garage background images (1:1 ratio cropped to 3:2 display) with object-fit:cover
    - **Layer 2 - Glow Effect**: Radial gradient blur effect at bottom center for neon glow behind car
    - **Layer 3 - Gradient**: Dark gradient overlay from bottom for text readability
    - **Layer 4 - Content**: Vehicle info (collection, name, ticker badge, location) positioned at top-left
    - **Car Overlay**: Uses `position: fixed` with dynamic viewport tracking to escape parent `overflow:auto` clipping from DRVNDashboard.tsx main content area. Position updates on scroll/resize via getBoundingClientRect().
    - Navigation arrows on left/right sides for switching cars
    - Customize button (gear icon, owner-only) opens GarageCustomizeModal
    - Transparent PNG assets with drop-shadow filter for glow effect
    - Assets located at: `/public/garage-backgrounds/` and `/public/car-overlays/`
    - **Technical Note**: Fixed positioning required because DRVNDashboard main content has `overflow-y-auto` which clips absolutely-positioned elements extending outside component bounds
  - **Portfolio Snapshot**: Summary cards showing total value, 24h change, vehicles owned, ETH balance
  - **VHCL Collection** (4 tabs, public):
    - RWA Collection: List-style view of car tokens held with tickers and ownership %
    - VHCL Registry: Grid of user's registered vehicles with "Register New VHCL" button
    - VHCL Collection: Grid of other users' tokenized vehicles user owns shares of
    - Sponsored VHCLs: Grid of sponsorship NFTs with manage/OpenSea links
  - **Asset Vault** (2 tabs, owner-only with Private badge):
    - Assets: List of ETH, USDC, BSTR, and partner tokens with live balances
    - Collectibles: Grid of Founder's Keys and Sponsorship NFTs with condensed supported collections list
- **DRVN Culture Page**: A content hub with category filters, featured content, stats bar, latest episodes grid, browse-by-category, and a "Coming Soon" section for originals.
- **Feed (Social Hub)**: Accessible via "Feed" nav item (renamed from Social). Features platform connection cards (Farcaster, Base, X), multi-platform feed filtering, and cross-posting functionality.
- **Arcade Section**: Expandable navigation section with three subsections:
  - Games: Onchain gaming hub (Coming Soon)
  - Apps: Automotive tools and utilities (Coming Soon)
  - Predictions: Market prediction games (Coming Soon)
- **Navigation Order**: Dashboard, Feed, DRVN Culture, Marketplace, Garage, Buster Club, Arcade (expandable), Settings, X/Twitter, Discord

### Data Architecture
- **Shared Vehicle Data**: All vehicle information is centralized in `Frontend/app/data/vehicleData.ts`. This single source of truth exports:
  - Vehicle array with full specs (make, model, year, VIN, etc.)
  - Valuation data: Appraised Value (AV), Market Value (MV), Spread, and SpreadPercent
  - Sponsor information with social links
  - Car tokens and sponsorship collection details
  - TypeScript interfaces: Vehicle, Sponsor, SponsorSocialLinks, CarToken, VehicleImage, etc.
- **Financial Transparency**: Each vehicle displays AV (independent appraisal), MV (current market price), and spread with color coding:
  - Green: Below appraisal (buying opportunity)
  - Red: Above appraisal (premium pricing)

## External Dependencies
- **OnchainKit**: For wallet integration on Base.
- **MongoDB**: Primary database for user data.
- **Redis**: Used for caching and notifications.
- **Pinata**: For decentralized storage via IPFS.
- **Alchemy**: Blockchain developer platform.
- **Farcaster**: For social integrations and Mini App support (optional).