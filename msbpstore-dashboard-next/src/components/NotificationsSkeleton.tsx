import { Bell } from "lucide-react";

const SK = "skeleton";

export default function NotificationsSkeleton() {
    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 56px))", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 40px" }}>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes sk-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } } .skeleton { background: linear-gradient(90deg, #1a2235 0%, #242f45 50%, #1a2235 100%); background-size: 200% 100%; animation: sk-shimmer 1.5s infinite linear; border-radius: 6px; }` }} />
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
