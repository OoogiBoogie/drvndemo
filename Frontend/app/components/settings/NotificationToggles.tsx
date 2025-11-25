"use client";

import { Label } from "@/app/components/ui/label";

interface NotificationPreferences {
    postMentions: boolean;
    sponsorshipUpdates: boolean;
    vehicleActivity: boolean;
}

interface NotificationTogglesProps {
    preferences: NotificationPreferences;
    onChange: (key: keyof NotificationPreferences, value: boolean) => void;
    disabled?: boolean;
}

const NOTIFICATION_OPTIONS = [
    {
        id: "postMentions" as const,
        label: "Post Mentions",
        description: "Get notified when someone mentions you in a post",
    },
    {
        id: "sponsorshipUpdates" as const,
        label: "Sponsorship Updates",
        description: "Receive updates about your sponsorship activities",
    },
    {
        id: "vehicleActivity" as const,
        label: "Vehicle Activity",
        description: "Get notified about activity on your registered vehicles",
    },
];

export function NotificationToggles({
    preferences,
    onChange,
    disabled = false,
}: NotificationTogglesProps) {
    return (
        <div>
            <Label className="text-white mb-3 block">Notification Preferences</Label>
            <div className="space-y-4">
                {NOTIFICATION_OPTIONS.map((option) => (
                    <div
                        key={option.id}
                        className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg border border-white/10"
                    >
                        <div className="flex-1">
                            <Label className="text-white font-medium block mb-1">
                                {option.label}
                            </Label>
                            <p className="text-sm text-zinc-400">{option.description}</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={preferences[option.id]}
                            disabled={disabled}
                            onClick={() => onChange(option.id, !preferences[option.id])}
                            className={`
                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                ${preferences[option.id] ? "bg-[#00daa2]" : "bg-zinc-700"}
                                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                            `}
                        >
                            <span
                                className={`
                                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                    ${preferences[option.id] ? "translate-x-6" : "translate-x-1"}
                                `}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
