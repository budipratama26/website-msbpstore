import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ textAlign: "center", maxWidth: "420px" }}>

        {/* Animated 404 */}
        <div style={{ position: "relative", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "clamp(80px, 20vw, 140px)",
              fontWeight: 900,
              lineHeight: 1,
              userSelect: "none",
              margin: 0,
              background: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </h1>
          <div
            style={{
              position: "absolute",
              inset: 0,
              fontSize: "clamp(80px, 20vw, 140px)",
              fontWeight: 900,
              lineHeight: 1,
              userSelect: "none",
              color: "var(--accent-primary)",
              opacity: 0.06,
              filter: "blur(20px)",
            }}
          >
            404
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "32px 28px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "10px" }}>
            Halaman Tidak Ditemukan
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "28px" }}>
            Halaman yang kamu cari tidak ada atau sudah dipindahkan. Yuk kembali ke beranda!
          </p>

          <Link
            href="/"
            className="btn btn-primary btn-lg btn-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

        <p style={{ marginTop: "20px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
          MSBP Store · msbpstore.my.id
        </p>
      </div>
    </div>
  );
}
