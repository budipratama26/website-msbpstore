"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ImageIcon, ChevronLeft, Save, Loader2 } from "lucide-react";
import { FormSkeleton } from "@/components/Skeletons";

export default function EditBannerPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        imageUrl: "",
        linkUrl: "",
        title: "",
        active: true,
        order: 0,
    });

    useEffect(() => {
        async function fetchBanner() {
            try {
                const res = await fetch("/api/admin/banners");
                const banners = await res.json();
                const banner = banners.find((b: any) => b.id === id);
                if (banner) {
                    setForm({
                        imageUrl: banner.imageUrl,
                        linkUrl: banner.linkUrl || "",
                        title: banner.title || "",
                        active: banner.active,
                        order: banner.order,
                    });
                } else {
                    setError("Banner tidak ditemukan.");
                }
            } catch {
                setError("Gagal mengambil data banner.");
            } finally {
                setFetching(false);
            }
        }
        fetchBanner();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/banners", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    ...form,
                    linkUrl: form.linkUrl || null,
                    title: form.title || null,
                    order: Number(form.order),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal memperbarui banner.");

            router.push("/admin/banners");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <FormSkeleton title="Edit Banner" />;
    }

    return (
        <div className="card p-6 sm:p-8 space-y-6" style={{maxWidth:"720px",margin:"0 auto"}}>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"16px",borderBottom:"1px solid var(--bg-border)",paddingBottom:"16px"}}>
                <Link
                    href="/admin/banners"
                    className="back-btn shrink-0"
                >
                    <ChevronLeft style={{width:"18px",height:"18px"}} />
                </Link>
                <div>
                    <h1 style={{fontSize:"18px",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"10px"}}>
                        <ImageIcon style={{width:"20px",height:"20px",color:"var(--accent-primary)"}} />
                        Edit Banner
                    </h1>
                    <p style={{color:"var(--text-muted)",fontSize:"13px",fontWeight:500,marginTop:"4px"}}>Ubah pengaturan banner visual Anda.</p>
                </div>
            </div>

            {error && (
                <div style={{background:"var(--error-muted)",border:"1px solid var(--error)",borderRadius:"var(--radius-xl)",padding:"12px 16px",fontSize:"13px",fontWeight:600,color:"var(--error)"}}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"24px"}}>
                <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>

                    {/* Gambar Banner */}
                    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                        <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"8px"}}>Gambar Banner</h3>
                        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                            <label className="form-label">URL Gambar Banner *</label>
                            <input
                                type="url"
                                value={form.imageUrl}
                                onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                                placeholder="https://example.com/banner-promo.jpg"
                                required
                                className="form-input"
                            />
                        </div>
                        {form.imageUrl && (
                            <div style={{borderRadius:"var(--radius-xl)",overflow:"hidden",aspectRatio:"16/5",background:"var(--bg-elevated)",border:"1px solid var(--bg-border)"}}>
                                <img src={form.imageUrl} alt="Preview" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                            </div>
                        )}
                    </div>

                    {/* Informasi Banner */}
                    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                        <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"8px"}}>Informasi Banner</h3>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px"}}>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">Judul Banner (Opsional)</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Promo Ramadan Terbatas"
                                    className="form-input"
                                />
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">Link Tujuan (URL / Path)</label>
                                <input
                                    type="text"
                                    value={form.linkUrl}
                                    onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))}
                                    placeholder="/category/mobile-legends"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pengaturan */}
                    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                        <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"8px"}}>Pengaturan</h3>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px"}}>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">Urutan Tampilan</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.order}
                                    onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))}
                                    className="form-input"
                                />
                                <p className="text-[10px] text-[var(--text-muted)] font-medium">Semakin kecil angka, semakin di depan urutan.</p>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:"14px",background:"var(--bg-elevated)",borderRadius:"var(--radius-xl)",padding:"14px",border:"1px solid var(--bg-border)"}}>
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                                    style={{position:"relative",width:"44px",height:"24px",borderRadius:"var(--radius-full)",transition:"background 200ms ease",flexShrink:0,background:form.active?"var(--accent-primary)":"var(--bg-border)",border:"none",cursor:"pointer"}}
                                >
                                    <div style={{position:"absolute",top:"4px",width:"16px",height:"16px",borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.3)",transition:"transform 200ms ease",transform:form.active?"translateX(22px)":"translateX(2px)"}} />
                                </button>
                                <div>
                                    <p style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)"}}>{form.active ? "Banner Aktif" : "Banner Nonaktif"}</p>
                                    <p style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:500,marginTop:"2px"}}>Tampilkan banner di halaman utama.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div style={{paddingTop:"20px",marginTop:"20px",borderTop:"1px solid var(--bg-border)",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"12px"}}>
                    <Link
                        href="/admin/banners"
                        className="btn btn-secondary"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? <Loader2 style={{width:"14px",height:"14px",animation:"spin 0.7s linear infinite"}} /> : <Save style={{width:"14px",height:"14px"}} />}
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </div>
    );
}
