import { Abi, Address } from "viem";

export const VEHICLE_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

export const ERC6551_REGISTRY_ADDRESS = "0x000000006551c19487814612e58FE06813775758" as const;

export const VEHICLE_REGISTRY_ABI = [
    {
        inputs: [
            { internalType: "address", name: "_usdcToken", type: "address" },
            { internalType: "address", name: "_treasury", type: "address" },
            { internalType: "address", name: "_registry6551", type: "address" },
            { internalType: "address", name: "_implementation6551", type: "address" }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
            { indexed: true, internalType: "address", name: "owner", type: "address" },
            { indexed: false, internalType: "string", name: "vinHash", type: "string" },
            { indexed: false, internalType: "address", name: "tba", type: "address" }
        ],
        name: "VehicleRegistered",
        type: "event"
    },
    {
        inputs: [],
        name: "registrationFee",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "to", type: "address" },
            { internalType: "string", name: "tokenURI", type: "string" },
            { internalType: "string", name: "vin", type: "string" }
        ],
        name: "registerVehicle",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "vehicleTBA",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        name: "vinHashes",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "ownerOf",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "tokenURI",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function"
    },
] as const satisfies Abi;

export const USDC_ABI = [
    {
        inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" }
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "owner", type: "address" },
            { internalType: "address", name: "spender", type: "address" }
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
] as const satisfies Abi;

export interface VehicleRegistryConfig {
    address: Address;
    abi: typeof VEHICLE_REGISTRY_ABI;
}

export const vehicleRegistryConfig: VehicleRegistryConfig = {
    address: VEHICLE_REGISTRY_ADDRESS,
    abi: VEHICLE_REGISTRY_ABI,
};

export const usdcConfig = {
    address: USDC_ADDRESS,
    abi: USDC_ABI,
};

export const REGISTRATION_FEE_USDC = 50;
export const UPGRADE_FEE_USDC = 5;
export const PLATFORM_TOKEN_FEE_PERCENT = 5;
