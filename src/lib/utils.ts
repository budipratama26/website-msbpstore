export function stringifyBigInt<T>(obj: T): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "bigint") return obj.toString();
    if (Array.isArray(obj)) return obj.map(stringifyBigInt);
    if (typeof obj === "object") {
        const out: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                out[key] = stringifyBigInt((obj as any)[key]);
            }
        }
        return out;
    }
    return obj;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getClientIp(req: Request | any) {
    // 🛡️ Enhanced IP Detection (Anti-Spoofing)
    // Priority: req.ip (provided by Next.js/Vercel) -> Headers
    return req.ip || 
           req.headers.get("cf-connecting-ip") || 
           req.headers.get("x-real-ip") || 
           (req.headers.get("x-forwarded-for")?.split(',')[0].trim()) || 
           "127.0.0.1";
}
