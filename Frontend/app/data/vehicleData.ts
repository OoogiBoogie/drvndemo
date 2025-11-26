export interface SponsorSocialLinks {
  base?: string;
  x?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
}

export interface Sponsor {
  tokenId: string;
  logo?: string;
  name?: string;
  holderAddress: string;
  websiteUrl?: string;
  promoUrl?: string;
  socialLinks?: SponsorSocialLinks;
  bio?: string;
  gallery?: string[];
  openSeaUrl?: string;
}

export interface VehicleImage {
  url: string;
  isNftImage: boolean;
}

export interface CarToken {
  address: string;
  ticker: string;
  price: number;
  change24h: number;
  mcap: number;
}

export interface SponsorshipCollection {
  contractAddress: string;
  maxSupply: number;
  mintPrice: number;
  mintedCount: number;
}

export interface VehicleOwner {
  name: string;
  username?: string;
  avatar?: string;
}

export interface VehicleValuation {
  appraisedValue: number;
  marketValue: number;
  spread: number;
  spreadPercent: number;
}

export interface Vehicle {
  _id: string;
  nickname?: string;
  make: string;
  model: string;
  year: number;
  images: VehicleImage[];
  isUpgraded: boolean;
  location?: string;
  registryId?: string;
  collection?: string;
  status?: 'coming_soon' | 'demo' | 'live';
  owner?: VehicleOwner;
  followerCount?: number;
  valuation: VehicleValuation;
  carToken?: CarToken;
  sponsorshipCollection?: SponsorshipCollection;
  sponsors: Sponsor[];
}

function calculateSpread(appraisedValue: number, marketValue: number): { spread: number; spreadPercent: number } {
  const spread = marketValue - appraisedValue;
  const spreadPercent = appraisedValue > 0 ? ((spread / appraisedValue) * 100) : 0;
  return { spread, spreadPercent };
}

const defaultOwner: VehicleOwner = {
  name: "DRVN Enthusiast",
  username: "drvn_enthusiast",
  avatar: "https://github.com/shadcn.png",
};

const defaultSponsors: Sponsor[] = [
  { 
    tokenId: "1", 
    name: "BSTR Labs", 
    logo: "/Cars/BSTR-Logo-Official.png", 
    holderAddress: "0x1234567890abcdef1234567890abcdef12345678",
    websiteUrl: "https://bstr.io",
    promoUrl: "https://bstr.io/promo/drvn",
    socialLinks: {
      base: "https://base.org/bstr",
      x: "https://x.com/bstrlabs",
      instagram: "https://instagram.com/bstrlabs",
    },
    bio: "BSTR Labs is a leading Web3 automotive technology company, building the future of decentralized vehicle ownership and community engagement on the Base blockchain.",
    gallery: ["/Cars/BusterHero1.jpg", "/Cars/BusterHero2.jpg", "/Cars/LFGBuster1.jpg"],
    openSeaUrl: "https://opensea.io/assets/base/0x1234/1",
  },
  { 
    tokenId: "2", 
    name: "DRVN Platform", 
    logo: "/Cars/DRVNLaboLogoDrk.png", 
    holderAddress: "0x2345678901abcdef2345678901abcdef23456789",
    websiteUrl: "https://drvn.io",
    promoUrl: "https://drvn.io/sponsors",
    socialLinks: {
      base: "https://base.org/drvn",
      x: "https://x.com/drvn_platform",
      youtube: "https://youtube.com/@drvn",
    },
    bio: "DRVN is the next-generation automotive platform tokenizing real-world vehicles on Base. Join the revolution in car culture and Web3.",
    gallery: ["/Cars/CultureHero1.jpg", "/Cars/CultureHero2.jpg"],
    openSeaUrl: "https://opensea.io/assets/base/0x1234/2",
  },
  { 
    tokenId: "3", 
    name: "FatStacks Racing", 
    logo: "/Cars/FatstacksLogo.png", 
    holderAddress: "0x3456789012abcdef3456789012abcdef34567890",
    websiteUrl: "https://fatstacks.racing",
    socialLinks: {
      x: "https://x.com/fatstacksracing",
      instagram: "https://instagram.com/fatstacksracing",
      tiktok: "https://tiktok.com/@fatstacks",
    },
    bio: "FatStacks Racing - where performance meets passion. Premium automotive parts and racing equipment for enthusiasts worldwide.",
    gallery: ["/Cars/GtrHero1.jpg", "/Cars/GtrDemo1.png"],
    openSeaUrl: "https://opensea.io/assets/base/0x1234/3",
  },
  { 
    tokenId: "4", 
    name: "JDM Culture", 
    logo: "/Cars/DCWhtV4.png", 
    holderAddress: "0x4567890123abcdef4567890123abcdef45678901",
    websiteUrl: "https://jdmculture.jp",
    socialLinks: {
      x: "https://x.com/jdmculture",
      instagram: "https://instagram.com/jdmculturejp",
    },
    bio: "Authentic Japanese Domestic Market culture. Celebrating the heritage and future of JDM automotive excellence.",
    gallery: ["/Cars/SupraHero1.jpg", "/Cars/nsx-ts-2.jpg"],
    openSeaUrl: "https://opensea.io/assets/base/0x1234/4",
  },
  { 
    tokenId: "5", 
    name: "Base Motorsports", 
    logo: "/Cars/base-logo.png", 
    holderAddress: "0x5678901234abcdef5678901234abcdef56789012",
    websiteUrl: "https://base.org/motorsports",
    socialLinks: {
      base: "https://base.org/motorsports",
      x: "https://x.com/base",
    },
    bio: "Official Base blockchain motorsports division. Bringing Web3 innovation to racing and automotive culture worldwide.",
    gallery: ["/Cars/modena1.jpg", "/Cars/ModenaHero1.jpg"],
    openSeaUrl: "https://opensea.io/assets/base/0x1234/5",
  },
];

export const vehicles: Vehicle[] = [
  {
    _id: "1",
    nickname: "Red Devil",
    make: "Ferrari",
    model: "360 Modena",
    year: 1999,
    collection: "Paul Walker Collection",
    status: "coming_soon",
    location: "Los Angeles, CA",
    registryId: "RS1",
    images: [
      { url: "/Cars/modena1.jpg", isNftImage: true },
      { url: "/Cars/ModenaHero1.jpg", isNftImage: false }
    ],
    isUpgraded: true,
    owner: defaultOwner,
    followerCount: 3421,
    valuation: {
      appraisedValue: 190000,
      marketValue: 190000,
      ...calculateSpread(190000, 190000)
    },
    carToken: {
      address: "0x2345678901abcdef2345678901abcdef23456789",
      ticker: "MODENA",
      price: 0.0038,
      change24h: 8.2,
      mcap: 190000,
    },
    sponsorshipCollection: {
      contractAddress: "0x1234...5678",
      maxSupply: 8,
      mintPrice: 0.05,
      mintedCount: 5,
    },
    sponsors: defaultSponsors.slice(0, 5),
  },
  {
    _id: "2",
    nickname: "Godzilla",
    make: "Nissan",
    model: "GT-R R34",
    year: 1999,
    collection: "Skyline Legends",
    status: "demo",
    location: "Tokyo, JP",
    registryId: "RS2",
    images: [
      { url: "/Cars/GtrDemo1.png", isNftImage: true },
      { url: "/Cars/GtrDemo2.png", isNftImage: false },
      { url: "/Cars/bsb-gtr-1.jpg", isNftImage: false }
    ],
    isUpgraded: true,
    owner: defaultOwner,
    followerCount: 5892,
    valuation: {
      appraisedValue: 185000,
      marketValue: 172000,
      ...calculateSpread(185000, 172000)
    },
    carToken: {
      address: "0x3456789012abcdef3456789012abcdef34567890",
      ticker: "R34GTR",
      price: 0.0034,
      change24h: -2.1,
      mcap: 172000,
    },
    sponsorshipCollection: {
      contractAddress: "0x2345...6789",
      maxSupply: 8,
      mintPrice: 0.05,
      mintedCount: 4,
    },
    sponsors: defaultSponsors.slice(0, 4),
  },
  {
    _id: "3",
    nickname: "NSX Dream",
    make: "Honda",
    model: "NSX Type S",
    year: 1997,
    collection: "Track Icons",
    status: "demo",
    location: "Miami, FL",
    registryId: "RS3",
    images: [
      { url: "/Cars/nsx-ts-2.jpg", isNftImage: true },
      { url: "/Cars/NSXGarage.jpg", isNftImage: false }
    ],
    isUpgraded: true,
    owner: defaultOwner,
    followerCount: 2156,
    valuation: {
      appraisedValue: 165000,
      marketValue: 152000,
      ...calculateSpread(165000, 152000)
    },
    carToken: {
      address: "0x4567890123abcdef4567890123abcdef45678901",
      ticker: "NSXTS",
      price: 0.0030,
      change24h: 4.5,
      mcap: 152000,
    },
    sponsorshipCollection: {
      contractAddress: "0x3456...7890",
      maxSupply: 8,
      mintPrice: 0.05,
      mintedCount: 3,
    },
    sponsors: defaultSponsors.slice(0, 3),
  },
  {
    _id: "4",
    nickname: "Black Widow",
    make: "Nissan",
    model: "GT-R R35",
    year: 2024,
    collection: "Modern JDM",
    status: "live",
    location: "Los Angeles, CA",
    registryId: "RS4",
    images: [
      { url: "/Cars/GtrHero1.jpg", isNftImage: true },
      { url: "/Cars/DRVNGtr3.jpg", isNftImage: false }
    ],
    isUpgraded: true,
    owner: defaultOwner,
    followerCount: 4127,
    valuation: {
      appraisedValue: 220000,
      marketValue: 235000,
      ...calculateSpread(220000, 235000)
    },
    carToken: {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      ticker: "BWIDOW",
      price: 0.0047,
      change24h: 12.5,
      mcap: 235000,
    },
    sponsorshipCollection: {
      contractAddress: "0x4567...8901",
      maxSupply: 8,
      mintPrice: 0.05,
      mintedCount: 5,
    },
    sponsors: defaultSponsors.slice(0, 5),
  },
  {
    _id: "5",
    nickname: "MK4 Legend",
    make: "Toyota",
    model: "Supra MK4",
    year: 1998,
    collection: "90s Icons",
    status: "live",
    location: "San Diego, CA",
    registryId: "RS5",
    images: [
      { url: "/Cars/SupraHero1.jpg", isNftImage: true },
      { url: "/Cars/SupraHero2.jpg", isNftImage: false }
    ],
    isUpgraded: true,
    owner: defaultOwner,
    followerCount: 3865,
    valuation: {
      appraisedValue: 145000,
      marketValue: 158000,
      ...calculateSpread(145000, 158000)
    },
    carToken: {
      address: "0x5678901234abcdef5678901234abcdef56789012",
      ticker: "MK4",
      price: 0.0032,
      change24h: 6.8,
      mcap: 158000,
    },
    sponsorshipCollection: {
      contractAddress: "0x5678...9012",
      maxSupply: 8,
      mintPrice: 0.05,
      mintedCount: 4,
    },
    sponsors: defaultSponsors.slice(0, 4),
  },
];

export function getVehicleById(id: string): Vehicle | undefined {
  return vehicles.find(v => v._id === id);
}

export function getVehiclesByStatus(status: Vehicle['status']): Vehicle[] {
  return vehicles.filter(v => v.status === status);
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function formatSpread(spread: number, spreadPercent: number): { text: string; isPositive: boolean } {
  const isPositive = spread >= 0;
  const sign = isPositive ? '+' : '';
  return {
    text: `${sign}${formatCurrency(spread)} (${sign}${spreadPercent.toFixed(1)}%)`,
    isPositive,
  };
}
