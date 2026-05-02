import { Bell } from "lucide-react";

const SK = "skeleton";

export default function NotificationsSkeleton() {
    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 56px))", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 40px" }}>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes sk-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .skeleton { position: relative; overflow: hidden; background: #1a2235; border-radius: 6px; } .skeleton::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); animation: sk-shimmer 1.2s infinite linear; }` }} />
            <div style={{ width: "100%", maxWidth: "640px" }} className="space-y-5">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className={SK} style={{ width: "40px", height: "40px", borderRadius: "8px" }} />
                    <div className={SK} style={{ width: "160px", height: "22px" }} />
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card" style={{ padding: "16px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                            <div className={SK} style={{ width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0 }} />
                            <div style={{ flex: 1 }} className="space-y-2">
                                <div className={SK} style={{ width: "66%", height: "14px" }} />
                                <div className={SK} style={{ width: "45%", height: "12px" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
