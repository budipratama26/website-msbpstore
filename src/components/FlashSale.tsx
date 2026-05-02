"use client";

import { useState, useEffect } from "react";
import { Zap, Clock } from "lucide-react";

export default function FlashSale() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const diff = endOfDay.getTime() - now.getTime();

            if (diff <= 0) {
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                hours: Math.floor(diff / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const pad = (n: number) => n.toString().padStart(2, "0");

    return (
        <div style={{ background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 50%, var(--bg-surface) 100%)", borderRadius: "var(--radius-xl)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", boxShadow: "var(--shadow-md)", border: "var(--border-default)" }}>
            {/* Left: Flash Sale Label */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1.5 flash-pulse">
                    <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="font-black text-white text-sm sm:text-base tracking-tight">Flash Sale</span>
                </div>
            </div>

            {/* Center: Countdown */}
            <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                <span className="text-[10px] sm:text-xs text-gray-400 font-semibold hidden sm:block mr-1">Berakhir dalam</span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {[pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)].map((v, i) => (
                        <>
                            <div key={i} style={{ background: "var(--accent-primary)", color: "#fff", fontWeight: 900, fontSize: "13px", padding: "4px 8px", borderRadius: "var(--radius-md)", minWidth: "32px", textAlign: "center" }}>
                                {v}
                            </div>
                            {i < 2 && <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: "12px" }}>:</span>}
                        </>
                    ))}
                </div>
            </div>

            {/* Right: CTA */}
            <div className="shrink-0">
                <span className="text-[10px] sm:text-xs text-amber-400 font-bold hidden sm:block">Harga Spesial!</span>
            </div>
        </div>
    );
}
