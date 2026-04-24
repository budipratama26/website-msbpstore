"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Layers, ChevronLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { FormSkeleton } from "@/components/Skeletons";

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    
    const [form, setForm] = useState({ 
        name: "", slug: "", image: "", description: "", keywords: "", active: true, platform: "BOTH", fields: "[]"
    });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await fetch(`/api/admin/categories?id=${id}`);
                const data = await res.json();
                if (res.ok && data.category) {
                    const cat = data.category;
                    setForm({
                        name: cat.name || "", slug: cat.slug || "", image: cat.image || "",
                        description: cat.description || "", keywords: cat.keywords || "",
                        active: cat.active, platform: cat.platform || "BOTH",
                        fields: cat.fields ? JSON.stringify(cat.fields, null, 2) : "[]",
                    });
                } else {
                    setError(data.error || "Kategori tidak ditemukan.");
                }
            } catch {
                setError("Gagal memuat data kategori.");
            } finally {
                setFetching(false);
            }
        };
        fetchCategory();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let parsedFields;
            try { parsedFields = JSON.parse(form.fields); } catch { throw new Error("Format JSON Fields tidak valid."); }

            const res = await fetch("/api/admin/categories", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id, name: form.name, slug: form.slug, image: form.image || null,
                    description: form.description || null, keywords: form.keywords || null,
                    active: form.active, platform: form.platform, fields: parsedFields,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.push("/admin/categories");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <FormSkeleton title="Edit Kategori" />;
    }

    return (
        <div className="card p-6 sm:p-8 space-y-6" style={{maxWidth:"720px",margin:"0 auto"}}>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"16px",borderBottom:"1px solid var(--bg-border)",paddingBottom:"16px"}}>
                <Link href="/admin/categories" className="back-btn shrink-0">
                    <ChevronLeft style={{width:"18px",height:"18px"}} />
                </Link>
                <div>
                    <h1 style={{fontSize:"18px",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"10px"}}>
                        <Layers style={{width:"20px",height:"20px",color:"var(--accent-primary)"}} />
                        Edit Kategori
                    </h1>
                    <p style={{color:"var(--text-muted)",fontSize:"13px",fontWeight:500,marginTop:"4px"}}>Perbarui informasi kategori <span className="text-[var(--accent-primary)] font-bold font-mono">#{id}</span>.</p>
                </div>
            </div>

            {error && (
                <div style={{background:"var(--error-muted)",border:"1px solid var(--error)",borderRadius:"var(--radius-xl)",padding:"12px 16px",fontSize:"13px",fontWeight:600,color:"var(--error)"}}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"24px"}}>
                <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>

                    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                        <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"8px"}}>Informasi Dasar</h3>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px"}}>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">Nama Kategori *</label>
                                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="form-input" />
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">Slug (URL) *</label>
                                <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required className="form-input font-mono text-sm" />
                            </div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                            <label className="form-label">URL Gambar Banner</label>
                            <input type="text" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} className="form-input" />
                        </div>
                    </div>

                    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                        <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"8px"}}>Deskripsi & Instruksi</h3>
                        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                            <label className="form-label">Deskripsi</label>
                            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} className="form-input resize-y" />
                        </div>
                    </div>

                    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                        <div className="flex items-center justify-between border-b border-[var(--bg-border)] pb-2">
                            <h3 className="label-text border-none p-0">Form Input Fields (JSON)</h3>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setForm(p => ({ ...p, fields: JSON.stringify([{ key: "user_id", name: "User ID", type: "number", placeholder: "Contoh: 12345678" }], null, 2) }))} className="badge" style={{background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",cursor:"pointer",color:"var(--text-muted)"}}>FF / PUBG</button>
                                <button type="button" onClick={() => setForm(p => ({ ...p, fields: JSON.stringify([{ key: "user_id", name: "User ID", type: "number", placeholder: "Contoh: 12345678" }, { key: "zone_id", name: "Zone ID", type: "number", placeholder: "Contoh: 1234" }], null, 2) }))} className="badge" style={{background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",cursor:"pointer",color:"var(--text-muted)"}}>MLBB</button>
                            </div>
                        </div>
                        <textarea value={form.fields} onChange={e => setForm(p => ({ ...p, fields: e.target.value }))} rows={6} className="form-input font-mono text-sm text-[var(--accent-primary)] resize-y" />
                    </div>

                    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                        <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"8px"}}>Platform & Status</h3>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px"}}>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">Target Platform</label>
                                <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} className="form-input appearance-none">
                                    <option value="BOTH">Semua Platform</option>
                                    <option value="WEB">Website Saja</option>
                                    <option value="TELEGRAM">Telegram Bot</option>
                                </select>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:"14px",background:"var(--bg-elevated)",borderRadius:"var(--radius-xl)",padding:"14px",border:"1px solid var(--bg-border)"}}>
                                <button type="button" onClick={() => setForm(p => ({ ...p, active: !p.active }))} style={{position:"relative",width:"44px",height:"24px",borderRadius:"var(--radius-full)",transition:"background 200ms ease",flexShrink:0,background:form.active?"var(--accent-primary)":"var(--bg-border)",border:"none",cursor:"pointer"}}>
                                    <div style={{position:"absolute",top:"4px",width:"16px",height:"16px",borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.3)",transition:"transform 200ms ease",transform:form.active?"translateX(22px)":"translateX(2px)"}} />
                                </button>
                                <div>
                                    <p style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)"}}>{form.active ? "Aktif" : "Nonaktif"}</p>
                                    <p style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:500,marginTop:"2px"}}>Tampilkan di publik.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{paddingTop:"20px",marginTop:"20px",borderTop:"1px solid var(--bg-border)",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"12px"}}>
                    <Link href="/admin/categories" className="btn btn-secondary">Batal</Link>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? <Loader2 style={{width:"14px",height:"14px",animation:"spin 0.7s linear infinite"}} /> : <Save style={{width:"14px",height:"14px"}} />}
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </div>
    );
}
