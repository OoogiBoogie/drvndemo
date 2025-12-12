const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjc4ODgwMCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQzOTI5OEVmQUQzMEY2MjgyMWM4NWI2NUFkNzVlN0MwNDFlMzY2RDcifQ",
    payload: "eyJkb21haW4iOiJ3d3cuZHJ2bnZoY2xzLmFwcCJ9",
    signature:
      "Di80WzSMTY3UuZgve2vebMvkXX8MUjqTTwovhqmqXhZvXPCjUNil9SNqgQ2Y13wq8IrZQQ5tup7XytM+FbAXCBw=",
  },
  baseBuilder: {
    allowedAddresses: ["0x1d0B2cfeBaBB59b3AF59ff77DeF5397Ce4Be9e77"],
  },
  miniapp: {
    version: "1",
    name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "DRVN VHCLS",
    subtitle: "Automotive RWA and Car Culture",
    description:
      "Bringing car culture onchain We tokenize real automotive assets, unlock transparent ownership, and rally a community to fund, govern and grow the garage—together.",
    screenshotUrls: [
      `${ROOT_URL}/screenshot1.png`,
      `${ROOT_URL}/screenshot2.png`,
      `${ROOT_URL}/screenshot3.png`,
    ],
    iconUrl: process.env.NEXT_PUBLIC_ICON_URL || `${ROOT_URL}/newIcon.png`,
    splashImageUrl: `${ROOT_URL}/newSplash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "finance",
    tags: ["rwa", "cars", "automotive", "motorsport", "racing"],
    heroImageUrl: `${ROOT_URL}/newHero.png`,
    tagline: "Bringing car culture onchain.",
    ogTitle: "DRVN VHCLS",
    ogDescription: "Automotive RWA and Car Culture",
    ogImageUrl: `${ROOT_URL}/newIcon.png`,
    noindex: false,
  },
} as const;
