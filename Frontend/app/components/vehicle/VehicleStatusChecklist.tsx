"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { ReactNode } from "react";

export interface VehicleStatusItem {
    id: string;
    label: string;
    description: string;
    state: "complete" | "active" | "pending";
}

interface VehicleStatusChecklistProps {
    title?: string;
    items: VehicleStatusItem[];
}

const STATE_STYLES: Record<VehicleStatusItem["state"], { badge: string; icon: ReactNode }> = {
    complete: {
        badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    },
    active: {
        badge: "bg-primary/10 text-primary border border-primary/30",
        icon: <Sparkles className="w-4 h-4 text-primary" />,
    },
    pending: {
        badge: "bg-zinc-800 text-zinc-400 border border-white/5",
        icon: <Clock3 className="w-4 h-4 text-zinc-500" />,
    },
};

export function VehicleStatusChecklist({ title = "Vehicle Pipeline", items }: VehicleStatusChecklistProps) {
    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.map((item) => {
                    const styles = STATE_STYLES[item.state];
                    const badgeLabel = item.state.charAt(0).toUpperCase() + item.state.slice(1);
                    return (
                        <div
                            key={item.id}
                            className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                        >
                            <div className="mt-0.5">{styles.icon}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-white">{item.label}</p>
                                    <Badge className={`${styles.badge} text-[10px]`}>{badgeLabel}</Badge>
                                </div>
                                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
