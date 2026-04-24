"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { TicketPercent, ChevronLeft, Save, Loader2 } from "lucide-react";
import { FormSkeleton } from "@/components/Skeletons";

interface Category {
    id: string;
    name: string;
}

export default function EditVoucherPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    const [form, setForm] = useState({
        code: "",
        description: "",
        discountType: "NOMINAL",
        discountValue: "",
        maxDiscount: "",
        minPurchase: "",
        usageLimit: "",
        perUserLimit: "1",
        categoryId: "",
        expiresAt: "",
        active: true
    });

    useEffect(() => {
        // Fetch categories
        fetch("/api/admin/categories")
            .then(res => res.json())
            .then(data => {
                const cats = data.categories || data;
                if (Array.isArray(cats)) {
                    setCategories(cats.map((c: any) => ({ id: c.id?.toString(), name: c.name })));
                }
            })
            .catch(() => {});

        // Fetch voucher data
        fetch("/api/admin/vouchers")
            .then(res => res.json())
            .then(data => {
                const voucher = data.find((v: any) => v.id === id);
                if (voucher) {
                    setForm({
                        code: voucher.code || "",
                        description: voucher.description || "",
                        discountType: voucher.discountType || "NOMINAL",
                        discountValue: voucher.discountValue?.toString() || "",
                        maxDiscount: voucher.maxDiscount?.toString() || "",
                        minPurchase: voucher.minPurchase?.toString() || "",
                        usageLimit: voucher.usageLimit?.toString() || "",
                        perUserLimit: voucher.perUserLimit?.toString() || "1",
                        categoryId: voucher.categoryId || "",
                        expiresAt: voucher.expiresAt ? new Date(voucher.expiresAt).toISOString().slice(0, 16) : "",
                        active: voucher.active
                    });
                }
                setFetching(false);
            })
            .catch(() => setFetching(false));
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/vouchers", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...form })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal mengupdate voucher.");

            router.push("/admin/vouchers");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <FormSkeleton title="Edit Voucher" />;
    }

    return (
        <div className="card p-6 sm:p-8 space-y-6" style={{maxWidth:"720px",margin:"0 auto"}}>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"16px",borderBottom:"1px solid var(--bg-border)",paddingBottom:"16px"}}>
                <Link
                    href="/admin/vouchers"
                    className="back-btn shrink-0"
                    title="Kembali"
                >
                    <ChevronLeft style={{width:"18px",height:"18px"}} />
                </Link>
                <div>
                    <h1 style={{fontSize:"18px",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"10px"}}>
                        <TicketPercent style={{width:"20px",height:"20px",color:"var(--accent-primary)"}} />
                        Edit Voucher
                    </h1>
                    <p style={{color:"var(--text-muted)",fontSize:"13px",fontWeight:500,marginTop:"4px"}}>Ubah pengaturan voucher <span className="font-mono font-bold text-[var(--text-primary)]">{form.code}</span></p>
                </div>
            </div>

            {error && (
                <div style={{background:"var(--error-muted)",border:"1px solid var(--error)",borderRadius:"var(--radius-xl)",padding:"12px 16px",fontSize:"13px",fontWeight:600,color:"var(--error)"}}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"24px"}}>
                <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>

                    {/* Code & Description */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--bg-border)] pb-3">Informasi Dasar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Kode Voucher *</label>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                                    placeholder="e.g. DISKON10"
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Deskripsi (Opsional)</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="e.g. Diskon spesial pelanggan baru"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Discount Settings */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--bg-border)] pb-3">Pengaturan Diskon</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Tipe Diskon *</label>
                                <select
                                    value={form.discountType}
                                    onChange={e => setForm({ ...form, discountType: e.target.value })}
                                    className="form-input"
                                >
                                    <option value="NOMINAL">Nominal (Rp)</option>
                                    <option value="PERCENTAGE">Persentase (%)</option>
                                </select>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                    Nilai Diskon * {form.discountType === "PERCENTAGE" ? "(%)" : "(Rp)"}
                                </label>
                                <input
                                    type="number"
                                    value={form.discountValue}
                                    onChange={e => setForm({ ...form, discountValue: e.target.value })}
                                    placeholder={form.discountType === "PERCENTAGE" ? "e.g. 5" : "e.g. 1000"}
                                    required
                                    min="1"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {form.discountType === "PERCENTAGE" && (
                                <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                    <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Max Diskon (Rp)</label>
                                    <input
                                        type="number"
                                        value={form.maxDiscount}
                                        onChange={e => setForm({ ...form, maxDiscount: e.target.value })}
                                        placeholder="e.g. 3000"
                                        className="form-input"
                                    />
                                </div>
                            )}
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Min. Pembelian (Rp)</label>
                                <input
                                    type="number"
                                    value={form.minPurchase}
                                    onChange={e => setForm({ ...form, minPurchase: e.target.value })}
                                    placeholder="e.g. 10000"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scope & Limits */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--bg-border)] pb-3">Scope & Batasan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Berlaku Untuk</label>
                                <select
                                    value={form.categoryId}
                                    onChange={e => setForm({ ...form, categoryId: e.target.value })}
                                    className="form-input"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Limit Total Pemakaian</label>
                                <input
                                    type="number"
                                    value={form.usageLimit}
                                    onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                                    placeholder="Kosong = unlimited"
                                    min="1"
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Limit Per User</label>
                                <input
                                    type="number"
                                    value={form.perUserLimit}
                                    onChange={e => setForm({ ...form, perUserLimit: e.target.value })}
                                    placeholder="1"
                                    min="1"
                                    className="form-input"
                                />
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Tanggal Kadaluarsa</label>
                                <input
                                    type="datetime-local"
                                    value={form.expiresAt}
                                    onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Toggle */}
                    <div style={{display:"flex",alignItems:"center",gap:"14px",background:"var(--bg-elevated)",borderRadius:"var(--radius-xl)",padding:"14px",border:"1px solid var(--bg-border)"}}>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, active: !form.active })}
                            style={{position:"relative",width:"44px",height:"24px",borderRadius:"var(--radius-full)",transition:"background 200ms ease",background:form.active?"var(--accent-primary)":"var(--bg-border)",border:"none",cursor:"pointer"}}
                        >
                            <div style={{position:"absolute",top:"4px",width:"16px",height:"16px",borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.3)",transition:"transform 200ms ease",transform:form.active?"translateX(22px)":"translateX(2px)"}} />
                        </button>
                        <div>
                            <p style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)"}}>{form.active ? "Voucher Aktif" : "Voucher Nonaktif"}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium">Voucher bisa langsung dipakai pelanggan jika aktif.</p>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-6 mt-6 border-t border-[var(--bg-border)] flex items-center justify-end gap-4">
                    <Link
                        href="/admin/vouchers"
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
                        {loading ? "MENYIMPAN..." : "UPDATE VOUCHER"}
                    </button>
                </div>
            </form>
        </div>
    );
}
