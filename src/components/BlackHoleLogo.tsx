import { HTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BlackHoleLogoProps extends HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg";
}

export default function BlackHoleLogo({ className, size = "md", ...props }: BlackHoleLogoProps) {
    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-12 h-12",
        lg: "w-16 h-16",
    };

    return (
        <div 
            className={cn(
                "relative flex items-center justify-center shrink-0 drop-shadow-lg transition-transform hover:scale-105",
                sizeClasses[size],
                className
            )}
            {...props}
        >
            <svg 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
            >
                <defs>
                    <linearGradient id="bh-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="bh-disk" x1="0%" y1="50%" x2="100%" y2="50%">
                        <stop offset="0%" stopColor="#059669" stopOpacity="0.8" />
                        <stop offset="20%" stopColor="#34d399" stopOpacity="1" />
                        <stop offset="50%" stopColor="#a7f3d0" stopOpacity="1" />
                        <stop offset="80%" stopColor="#10b981" stopOpacity="1" />
                        <stop offset="100%" stopColor="#047857" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="bh-blur" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" />
                    </filter>
                    <filter id="bh-strong-blur" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" />
                    </filter>
                </defs>

                {/* Ambient Deep Glow */}
                <circle cx="50" cy="50" r="28" fill="#10b981" opacity="0.15" filter="url(#bh-strong-blur)" />

                {/* Top Halo (Gravitational Lensing) */}
                <path 
                    d="M 12 50 C 12 -5 88 -5 88 50 C 75 18 25 18 12 50 Z" 
                    fill="url(#bh-glow)" 
                    opacity="0.8" 
                    filter="url(#bh-blur)"
                />
                
                {/* Bottom Halo (Gravitational Lensing) */}
                <path 
                    d="M 22 50 C 22 95 78 95 78 50 C 68 75 32 75 22 50 Z" 
                    fill="url(#bh-glow)" 
                    opacity="0.5" 
                    filter="url(#bh-blur)"
                />

                {/* Event Horizon (The Black Hole) */}
                <circle cx="50" cy="50" r="24" fill="#020617" />
                <circle cx="50" cy="50" r="24" fill="transparent" stroke="#047857" strokeWidth="0.5" opacity="0.5" />

                {/* The "M" embedded in the Black Hole */}
                <text 
                    x="50" 
                    y="58" 
                    fontFamily="Inter, system-ui, sans-serif" 
                    fontWeight="900" 
                    fontSize="24" 
                    fill="#34d399" 
                    textAnchor="middle" 
                    letterSpacing="-1"
                >
                    M
                </text>

                {/* Front Accretion Disk (Swooping across) */}
                <path 
                    d="M -5 60 C 15 70 30 58 50 56 C 70 54 85 45 105 45 C 90 35 70 48 50 50 C 30 52 10 65 -5 60 Z" 
                    fill="url(#bh-disk)" 
                    filter="url(#bh-blur)"
                />
                
                {/* Inner bright core line of the accretion disk */}
                <path 
                    d="M 5 58 C 20 62 30 55 50 53 C 70 51 80 47 95 47 C 80 43 70 49 50 51 C 30 53 20 56 5 58 Z" 
                    fill="#fff" 
                    opacity="0.9"
                    filter="url(#bh-blur)"
                />

            </svg>
        </div>
    );
}
