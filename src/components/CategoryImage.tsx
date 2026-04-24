"use client";

import Image from "next/image";
import { Gamepad2 } from "lucide-react";

interface CategoryImageProps {
    src: string | null;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    sizes?: string;
}

export default function CategoryImage({
    src,
    alt,
    fill = true,
    className = "",
    priority = false,
    sizes
}: CategoryImageProps) {
    if (!src) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <Gamepad2 className="w-12 h-12 text-slate-700" />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            priority={priority}
            sizes={sizes}
            className={className}
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-game.webp";
            }}
        />
    );
}
