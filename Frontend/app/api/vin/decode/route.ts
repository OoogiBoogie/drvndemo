import { NextRequest, NextResponse } from "next/server";

interface VINContext {
    make?: string;
    model?: string;
    year?: number | null;
}

interface FactorySpecs {
    make: string;
    model: string;
    year: number;
    trim: string;
    engine: string;
    transmission: string;
    exteriorColor: string;
    drivetrain: string;
    fuelType: string;
    bodyStyle: string;
}

interface DecodeResponse {
    vin: string;
    factorySpecs: FactorySpecs;
    confidence: number;
}

async function lookupVINFromNHTSA(vin: string): Promise<Partial<FactorySpecs> | null> {
    try {
        const response = await fetch(
            `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
        );
        
        if (!response.ok) return null;
        
        const data = await response.json();
        const results = data.Results || [];
        
        const getValue = (variableId: number): string => {
            const item = results.find((r: { VariableId: number }) => r.VariableId === variableId);
            return item?.Value || "";
        };
        
        return {
            make: getValue(26) || undefined,
            model: getValue(28) || undefined,
            year: parseInt(getValue(29)) || undefined,
            trim: getValue(38) || undefined,
            engine: `${getValue(13)} ${getValue(71)}`.trim() || undefined,
            transmission: getValue(37) || undefined,
            drivetrain: getValue(15) || undefined,
            fuelType: getValue(24) || undefined,
            bodyStyle: getValue(5) || undefined,
        };
    } catch (error) {
        console.error("NHTSA lookup failed:", error);
        return null;
    }
}

function generateMockVIN(): string {
    const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
    let vin = "";
    for (let i = 0; i < 17; i++) {
        vin += chars[Math.floor(Math.random() * chars.length)];
    }
    return vin;
}

function getMockSpecs(context: VINContext): FactorySpecs {
    const mockVehicles: FactorySpecs[] = [
        {
            make: "Porsche",
            model: "911 GT3 RS",
            year: 2024,
            trim: "Weissach Package",
            engine: "4.0L Naturally Aspirated Flat-6",
            transmission: "7-Speed PDK",
            exteriorColor: "Python Green",
            drivetrain: "RWD",
            fuelType: "Gasoline",
            bodyStyle: "Coupe",
        },
        {
            make: "Nissan",
            model: "GT-R NISMO",
            year: 2024,
            trim: "NISMO Special Edition",
            engine: "3.8L Twin-Turbo V6",
            transmission: "6-Speed Dual-Clutch",
            exteriorColor: "Stealth Gray",
            drivetrain: "AWD",
            fuelType: "Gasoline",
            bodyStyle: "Coupe",
        },
        {
            make: "Toyota",
            model: "GR Supra",
            year: 2024,
            trim: "A91-MT Edition",
            engine: "3.0L Inline-6 Turbo",
            transmission: "6-Speed Manual",
            exteriorColor: "Phantom Matte Gray",
            drivetrain: "RWD",
            fuelType: "Gasoline",
            bodyStyle: "Coupe",
        },
        {
            make: "BMW",
            model: "M3 Competition",
            year: 2024,
            trim: "xDrive",
            engine: "3.0L Twin-Turbo I6",
            transmission: "8-Speed Automatic",
            exteriorColor: "Isle of Man Green",
            drivetrain: "AWD",
            fuelType: "Gasoline",
            bodyStyle: "Sedan",
        },
        {
            make: "Honda",
            model: "Civic Type R",
            year: 2024,
            trim: "Type R",
            engine: "2.0L VTEC Turbo I4",
            transmission: "6-Speed Manual",
            exteriorColor: "Championship White",
            drivetrain: "FWD",
            fuelType: "Gasoline",
            bodyStyle: "Hatchback",
        },
    ];

    if (context.make) {
        const matched = mockVehicles.find(
            v => v.make.toLowerCase().includes(context.make!.toLowerCase())
        );
        if (matched) {
            return {
                ...matched,
                model: context.model || matched.model,
                year: context.year || matched.year,
            };
        }
    }

    const randomVehicle = mockVehicles[Math.floor(Math.random() * mockVehicles.length)];
    return {
        ...randomVehicle,
        make: context.make || randomVehicle.make,
        model: context.model || randomVehicle.model,
        year: context.year || randomVehicle.year,
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { images, context, manualVin } = body as {
            images?: string[];
            context?: VINContext;
            manualVin?: string;
        };

        if (!images?.length && !manualVin) {
            return NextResponse.json(
                { error: "No images or VIN provided" },
                { status: 400 }
            );
        }

        let vin = manualVin || generateMockVIN();
        let specs: FactorySpecs;
        let confidence = 0.85;

        if (manualVin && manualVin.length === 17) {
            const nhtsaSpecs = await lookupVINFromNHTSA(manualVin);
            
            if (nhtsaSpecs && nhtsaSpecs.make) {
                specs = {
                    make: nhtsaSpecs.make || context?.make || "Unknown",
                    model: nhtsaSpecs.model || context?.model || "Unknown",
                    year: nhtsaSpecs.year || context?.year || new Date().getFullYear(),
                    trim: nhtsaSpecs.trim || "Base",
                    engine: nhtsaSpecs.engine || "Unknown",
                    transmission: nhtsaSpecs.transmission || "Unknown",
                    exteriorColor: "Unknown",
                    drivetrain: nhtsaSpecs.drivetrain || "Unknown",
                    fuelType: nhtsaSpecs.fuelType || "Gasoline",
                    bodyStyle: nhtsaSpecs.bodyStyle || "Unknown",
                };
                confidence = 0.95;
            } else {
                specs = getMockSpecs(context || {});
                confidence = 0.75;
            }
        } else {
            specs = getMockSpecs(context || {});
            vin = `WP0${generateMockVIN().slice(3)}`;
        }

        await new Promise((resolve) => setTimeout(resolve, 800));

        const response: DecodeResponse = {
            vin,
            factorySpecs: specs,
            confidence,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error decoding VIN:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
