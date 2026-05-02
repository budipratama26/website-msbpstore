const SK = "skeleton";

export default function ProfileSkeleton() {
    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 56px))", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 40px" }}>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes sk-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .skeleton { position: relative; overflow: hidden; background: #1a2235; border-radius: 6px; } .skeleton::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); animation: sk-shimmer 1.2s infinite linear; }` }} />
            <div style={{ width: "100%", maxWidth: "520px" }} className="space-y-4">
                <div className="card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
                    <div className={SK} style={{ width: "72px", height: "72px", borderRadius: "50%", flexShrink: 0 }} />
                    <div style={{ flex: 1 }} className="space-y-3">
                        <div className={SK} style={{ width: "60%", height: "20px" }} />
                        <div className={SK} style={{ width: "40%", height: "14px" }} />
                    </div>
                </div>
                <div className="card space-y-4" style={{ padding: "20px" }}>
                    <div className={SK} style={{ width: "120px", height: "13px" }} />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "7px", paddingBottom: "16px", borderBottom: i < 2 ? "var(--border-default)" : "none" }}>
                            <div className={SK} style={{ width: "80px", height: "12px" }} />
                            <div className={SK} style={{ width: "100%", height: "40px", borderRadius: "6px" }} />
                        </div>
                    ))}
                    <div style={{ paddingTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                        <div className={SK} style={{ width: "120px", height: "40px", borderRadius: "6px" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
