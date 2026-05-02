/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DARK ARSENAL — Skeleton Components
   All skeletons MUST match the exact layout/size of real content
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const ShimmerStyle = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sk-shimmer {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .sk {
            position: relative;
            overflow: hidden;
            background: #1a2235;
            border-radius: 6px;
        }
        .sk::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
            animation: sk-shimmer 1.2s infinite linear;
        }
    `}} />
);

/** Skeleton for Admin List Pages (Banners, Categories, Products, etc.) */
export function AdminListSkeleton({ title, icon: Icon }: { title: string, icon: any }) {
    return (
        <div style={{ padding: "24px", paddingBottom: "32px" }} className="space-y-6">
            <ShimmerStyle />
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="sk" style={{ width: "40px", height: "40px", borderRadius: "8px" }} />
                    <div className="sk" style={{ width: "160px", height: "26px" }} />
                </div>
                <div className="sk" style={{ width: "140px", height: "38px", borderRadius: "6px" }} />
            </div>

            {/* Table card */}
            <div style={{ background: "var(--bg-surface)", border: "var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
                {/* Search bar */}
                <div style={{ padding: "12px 16px", borderBottom: "var(--border-default)", background: "var(--bg-elevated)", display: "flex", gap: "12px" }}>
                    <div className="sk" style={{ flex: 1, height: "38px", borderRadius: "6px" }} />
                    <div className="sk" style={{ width: "100px", height: "38px", borderRadius: "6px" }} />
                </div>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 100px", gap: "0", borderBottom: "var(--border-default)", background: "var(--bg-elevated)", padding: "12px 16px" }}>
                    {[200, 80, 70, 70].map((w, i) => (
                        <div key={i} className="sk" style={{ width: `${w}px`, height: "12px" }} />
                    ))}
                </div>
                {/* Rows */}
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "var(--border-default)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div className="sk" style={{ width: "40px", height: "40px", borderRadius: "8px", flexShrink: 0 }} />
                            <div className="space-y-2">
                                <div className="sk" style={{ width: "140px", height: "13px" }} />
                                <div className="sk" style={{ width: "90px", height: "11px" }} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <div className="sk" style={{ width: "30px", height: "18px", borderRadius: "4px" }} />
                            <div className="sk" style={{ width: "60px", height: "30px", borderRadius: "6px" }} />
                            <div className="sk" style={{ width: "60px", height: "30px", borderRadius: "6px" }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Skeleton for Admin Creation/Edit Forms */
export function FormSkeleton({ title }: { title: string }) {
    return (
        <div style={{ padding: "24px" }} className="space-y-6">
            <ShimmerStyle />
            <div className="sk" style={{ width: "220px", height: "28px" }} />
            <div style={{ background: "var(--bg-surface)", border: "var(--border-default)", borderRadius: "8px", padding: "24px" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="sk" style={{ width: "100px", height: "12px" }} />
                            <div className="sk" style={{ width: "100%", height: "40px", borderRadius: "6px" }} />
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "var(--border-default)", display: "flex", justifyContent: "flex-end" }}>
                    <div className="sk" style={{ width: "140px", height: "40px", borderRadius: "6px" }} />
                </div>
            </div>
        </div>
    );
}

/** Skeleton for Category Product Forms (Customer Side) */
export function CategoryFormSkeleton() {
    return (
        <div style={{ background: "var(--bg-base)", minHeight: "100vh", padding: "24px 16px" }}>
            <ShimmerStyle />
            <div className="max-w-xl mx-auto space-y-6">
                {/* Banner skeleton */}
                <div className="sk" style={{ width: "100%", height: "160px", borderRadius: "8px" }} />
                {/* Title */}
                <div className="sk" style={{ width: "200px", height: "28px" }} />
                {/* Form card */}
                <div style={{ background: "var(--bg-surface)", border: "var(--border-default)", borderRadius: "8px", padding: "20px" }} className="space-y-4">
                    <div className="sk" style={{ width: "120px", height: "13px" }} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sk" style={{ height: "42px", borderRadius: "6px" }} />
                        <div className="sk" style={{ height: "42px", borderRadius: "6px" }} />
                    </div>
                </div>
                {/* Product grid skeleton */}
                <div className="space-y-3">
                    <div className="sk" style={{ width: "140px", height: "13px" }} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} style={{ background: "var(--bg-surface)", border: "var(--border-default)", borderRadius: "8px", padding: "14px", height: "90px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div className="sk" style={{ width: "75%", height: "13px" }} />
                                <div className="sk" style={{ width: "50%", height: "16px" }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Skeleton for Notifications */
export function NotificationSkeleton() {
    return (
        <div style={{ background: "var(--bg-base)", minHeight: "100vh", padding: "80px 16px 32px" }}>
            <ShimmerStyle />
            <div className="max-w-2xl mx-auto space-y-5">
                <div className="sk" style={{ width: "200px", height: "28px" }} />
                <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ background: "var(--bg-surface)", border: "var(--border-default)", borderRadius: "8px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                            <div className="sk" style={{ width: "40px", height: "40px", borderRadius: "8px", flexShrink: 0 }} />
                            <div style={{ flex: 1 }} className="space-y-2">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div className="sk" style={{ width: "180px", height: "14px" }} />
                                    <div className="sk" style={{ width: "60px", height: "11px" }} />
                                </div>
                                <div className="sk" style={{ width: "100%", height: "12px" }} />
                                <div className="sk" style={{ width: "66%", height: "12px" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Home page game grid skeleton (2→3→4→5 col) */
export function HomeGameSkeleton() {
    return (
        <div style={{ padding: "24px 16px", background: "var(--bg-base)", minHeight: "100vh" }}>
            <ShimmerStyle />
            <div className="max-w-5xl mx-auto">
                <div className="sk" style={{ width: "100px", height: "14px", marginBottom: "16px" }} />
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                            <div className="sk" style={{ width: "100%", aspectRatio: "1/1", borderRadius: "8px" }} />
                            <div className="sk" style={{ width: "70%", height: "10px" }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
