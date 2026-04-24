"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ChevronLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ name: "", description: "", image: "", price: "", stock: "0", categoryId: "", active: true });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description || null,
                    image: form.image || null,
                    price: form.price,
                    stock: form.stock,
                    categoryId: form.categoryId || null,
                    active: form.active,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.push("/admin/products");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-6 sm:p-8 space-y-6" style={{maxWidth:"720px",margin:"0 auto"}}>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"16px",borderBottom:"1px solid var(--bg-border)",paddingBottom:"16px"}}>
                <Link
                    href="/admin/products"
                    className="back-btn shrink-0"
                >
                    <ChevronLeft style={{width:"18px",height:"18px"}} />
                </Link>
                <div>
                    <h1 style={{fontSize:"18px",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"10px"}}>
                        <Package style={{width:"20px",height:"20px",color:"var(--accent-primary)"}} />
                        Tambah Produk
                    </h1>
                    <p style={{color:"var(--text-muted)",fontSize:"13px",fontWeight:500,marginTop:"4px"}}>Buat produk baru untuk katalog toko Anda.</p>
                </div>
            </div>

            {error && (
                <div style={{background:"var(--error-muted)",border:"1px solid var(--error)",borderRadius:"var(--radius-xl)",padding:"12px 16px",fontSize:"13px",fontWeight:600,color:"var(--error)"}}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"24px"}}>
                <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>

                    {/* Informasi Produk */}
                    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                        <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"8px"}}>Informasi Produk</h3>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px"}}>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">Nama Produk *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Contoh: 86 Diamonds"
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">Kategori ID</label>
                                <input
                                    type="text"
                                    value={form.categoryId}
                                    onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                                    placeholder="ID Kategori"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Harga & Stok */}
                    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                        <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"8px"}}>Harga & Stok</h3>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px"}}>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">Harga Jual (Rp) *</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                    placeholder="15000"
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">Jumlah Stok</label>
                                <input
                                    type="number"
                                    value={form.stock}
                                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                                    placeholder="999"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Detail Tambahan */}
                    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                        <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"8px"}}>Detail Tambahan</h3>
                        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                            <label className="form-label">Image URL</label>
                            <input
                                type="text"
                                value={form.image}
                                onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                                placeholder="https://i.imgur.com/..."
                                className="form-input"
                            />
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                            <label className="form-label">Keterangan Produk</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                rows={4}
                                className="form-input resize-y"
                                placeholder="Detail mengenai produk ini..."
                            />
                        </div>
                    </div>

                    {/* Active Toggle */}
                    <div style={{display:"flex",alignItems:"center",gap:"14px",background:"var(--bg-elevated)",borderRadius:"var(--radius-xl)",padding:"14px",border:"1px solid var(--bg-border)"}}>
                        <button
                            type="button"
                            onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                            style={{position:"relative",width:"44px",height:"24px",borderRadius:"var(--radius-full)",transition:"background 200ms ease",flexShrink:0,background:form.active?"var(--accent-primary)":"var(--bg-border)",border:"none",cursor:"pointer"}}
                        >
                            <div style={{position:"absolute",top:"4px",width:"16px",height:"16px",borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.3)",transition:"transform 200ms ease",transform:form.active?"translateX(22px)":"translateX(2px)"}} />
                        </button>
                        <div>
                            <p style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)"}}>{form.active ? "Produk Aktif" : "Produk Nonaktif"}</p>
                            <p style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:500,marginTop:"2px"}}>Menentukan apakah produk muncul ke publik.</p>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div style={{paddingTop:"20px",marginTop:"20px",borderTop:"1px solid var(--bg-border)",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"12px"}}>
                    <Link
                        href="/admin/products"
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
                        {loading ? "Menyimpan..." : "Simpan Produk"}
                    </button>
                </div>
            </form>
        </div>
    );
}
