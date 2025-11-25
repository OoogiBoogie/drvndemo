"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";

interface VehicleStat {
    label: string;
    value: string;
    hint?: string;
    icon?: ReactNode;
}

interface VehicleStatGridProps {
    title: string;
    stats: VehicleStat[];
    columns?: 2 | 3;
}

export function VehicleStatGrid({ title, stats, columns = 2 }: VehicleStatGridProps) {
    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn("grid gap-3", columns === 3 ? "grid-cols-3" : "grid-cols-2")}>
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                        >
                            <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
                                {stat.label}
                            </p>
                            <div className="flex items-baseline gap-2">
                                {stat.icon}
                                <p className="text-lg font-semibold text-white leading-tight">
                                    {stat.value}
                                </p>
                            </div>
                            {stat.hint && (
                                <p className="text-[11px] text-zinc-500 mt-1">{stat.hint}</p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
