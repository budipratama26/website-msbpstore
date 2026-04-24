import { Receipt, Search, ShoppingBag } from "lucide-react";

const skCls = "skeleton";

export default function HistorySkeleton() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "24px 16px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes sk-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                .skeleton { background: linear-gradient(90deg, #1a2235 0%, #242f45 50%, #1a2235 100%); background-size: 200% 100%; animation: sk-shimmer 1.5s infinite linear; border-radius: 6px; }
            `}} />
            <div style={{ width: "100%", maxWidth: "900px" }} className="space-y-5">
                {/* Header skeleton */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className={skCls} style={{ width: "40px", height: "40px", borderRadius: "8px" }} />
                        <div>
                            <div className={skCls} style={{ width: "180px", height: "20px", marginBottom: "6px" }} />
                            <div className={skCls} style={{ width: "240px", height: "14px" }} />
                        </div>
                    </div>
                    <div className={skCls} style={{ width: "220px", height: "42px", borderRadius: "6px" }} />
                </div>

                {/* Orders list skeleton */}
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ background: "var(--bg-surface)", border: "var(--border-default)", borderRadius: "8px", padding: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div className={skCls} style={{ width: "44px", height: "44px", borderRadius: "8px", flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div className={skCls} style={{ width: "55%", height: "14px", marginBottom: "7px" }} />
                                    <div className={skCls} style={{ width: "30%", height: "12px" }} />
                                </div>
                                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                        <div className={skCls} style={{ width: "48px", height: "10px" }} />
                                        <div className={skCls} style={{ width: "80px", height: "14px" }} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                        <div className={skCls} style={{ width: "36px", height: "10px" }} />
                                        <div className={skCls} style={{ width: "90px", height: "14px" }} />
                                    </div>
                                    <div className={skCls} style={{ width: "90px", height: "28px", borderRadius: "4px", alignSelf: "center" }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
