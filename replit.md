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
- **Garage Page**: Functions as a public profile, separating public and private sections based on `isOwner` detection. Enhanced User Profile Card with extensive social links.
- **DRVN Culture Page**: A content hub with category filters, featured content, stats bar, latest episodes grid, browse-by-category, and a "Coming Soon" section for originals.
- **Social Hub**: Redesigned `/social` page with platform connection cards (Farcaster, Base, X), multi-platform feed filtering, and cross-posting functionality.

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