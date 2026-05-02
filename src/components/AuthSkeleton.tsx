const SK = "skeleton";

export default function AuthSkeleton() {
    return (
        <div style={{ minHeight: "calc(100vh - var(--header-height, 56px))", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes sk-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .skeleton { position: relative; overflow: hidden; background: #1a2235; border-radius: 6px; } .skeleton::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); animation: sk-shimmer 1.2s infinite linear; }` }} />
            <div style={{ width: "100%", maxWidth: "420px" }}>
                <div className="card" style={{ padding: "28px 28px 32px", position: "relative" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px", marginTop: "20px" }}>
                        <div className={SK} style={{ width: "48px", height: "48px", borderRadius: "8px", marginBottom: "16px" }} />
                        <div className={SK} style={{ width: "200px", height: "22px", marginBottom: "8px" }} />
                        <div className={SK} style={{ width: "140px", height: "14px" }} />
                    </div>
                    <div className="space-y-4">
                        {[{ label: 80, field: "100%" }, { label: 80, field: "100%" }].map((f, i) => (
                            <div key={i}>
                                <div className={SK} style={{ width: `${f.label}px`, height: "12px", marginBottom: "8px" }} />
                                <div className={SK} style={{ width: f.field, height: "42px", borderRadius: "6px" }} />
                            </div>
                        ))}
                        <div className={SK} style={{ width: "100%", height: "46px", borderRadius: "6px", marginTop: "8px" }} />
                    </div>
                    <div style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flex: 1, height: "1px", background: "var(--bg-border)" }} />
                        <div className={SK} style={{ width: "28px", height: "12px" }} />
                        <div style={{ flex: 1, height: "1px", background: "var(--bg-border)" }} />
                    </div>
                    <div className={SK} style={{ width: "100%", height: "42px", borderRadius: "6px" }} />
                </div>
            </div>
        </div>
    );
}
