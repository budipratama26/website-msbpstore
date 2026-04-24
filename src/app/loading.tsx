export default function Loading() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes sk-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .sk {
                    background: linear-gradient(90deg, #1a2235 0%, #242f45 50%, #1a2235 100%);
                    background-size: 200% 100%;
                    animation: sk-shimmer 1.5s infinite linear;
                    border-radius: 6px;
                }
            `}} />

            <section style={{ padding: "16px 16px 0" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }} className="space-y-5">
                    {/* Banner skeleton */}
                    <div style={{ paddingTop: "16px" }}>
                        <div className="sk" style={{ width: "100%", aspectRatio: "2/1", borderRadius: "12px" }} />
                    </div>
                    {/* Title */}
                    <div style={{ textAlign: "center", marginBottom: "8px" }} className="space-y-3">
                        <div className="sk" style={{ height: "32px", width: "180px", margin: "0 auto" }} />
                        <div className="sk" style={{ height: "14px", width: "240px", margin: "0 auto" }} />
                    </div>
                </div>
            </section>

            {/* Sticky search skeleton */}
            <div style={{ position: "sticky", top: "56px", zIndex: 90, background: "rgba(10,14,23,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1e2d45", padding: "12px 16px" }}>
                <div style={{ maxWidth: "640px", margin: "0 auto" }}>
                    <div className="sk" style={{ width: "100%", height: "42px", borderRadius: "6px" }} />
                </div>
            </div>

            {/* Categories grid skeleton */}
            <section style={{ padding: "24px 16px", flex: 1 }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                        <div className="sk" style={{ width: "16px", height: "16px", borderRadius: "50%" }} />
                        <div className="sk" style={{ height: "18px", width: "120px" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }} className="sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                <div className="sk" style={{ width: "100%", aspectRatio: "1/1.15", borderRadius: "8px" }} />
                                <div className="sk" style={{ height: "12px", width: "60px" }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
