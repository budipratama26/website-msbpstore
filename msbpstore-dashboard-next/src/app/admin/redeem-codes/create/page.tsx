"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ticket, ChevronLeft, Save, Loader2, Search, Check } from "lucide-react";

interface Category {
    id: string;
    name: string;
    platform: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    categoryId: string | null;
}

export default function CreateRedeemCodePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ code: "", reward: "", productId: "" });

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedPlatform, setSelectedPlatform] = useState<string>("TELEGRAM");
    const [searchProduct, setSearchProduct] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const catRes = await fetch("/api/admin/categories");
                const catData = await catRes.json();
                if (catData.categories) setCategories(catData.categories);

                const prodRes = await fetch("/api/admin/products");
                const prodData = await prodRes.json();
                if (prodData.products) setProducts(prodData.products);
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setFetching(false);
            }
        }
        fetchData();
    }, []);

    const filteredCategories = categories.filter(c =>
        !selectedPlatform || c.platform === selectedPlatform || c.platform === "BOTH"
    );

    const filteredProducts = products.filter(p => {
        const cat = categories.find(c => String(c.id) === String(p.categoryId));
        const matchesPlatform = !selectedPlatform || cat?.platform === selectedPlatform || cat?.platform === "BOTH" || !p.categoryId;
        const matchesCategory = !selectedCategory || String(p.categoryId) === String(selectedCategory);
        const matchesSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase()) || String(p.id).includes(searchProduct);
        return matchesPlatform && matchesCategory && matchesSearch;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!form.productId) {
            setError("Silakan pilih produk terlebih dahulu.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/admin/redeem-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.push("/admin/redeem-codes");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-[var(--bg-border)] pb-6 relative">
                <Link
                    href="/admin/redeem-codes"
                    className="back-btn shrink-0"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
                        <Ticket className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent-primary)]" />
                        Buat Kode Redeem
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm font-medium mt-1">Buat voucher khusus untuk klaim produk di Telegram.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-semibold">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-8">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="label-text border-b border-[var(--bg-border)] pb-2">Informasi Kode</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="form-label">Kode Redeem *</label>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                    placeholder="CONTOH-VOUCHER-2024"
                                    required
                                    className="form-input uppercase tracking-widest font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label">Keterangan Hadiah *</label>
                                <input
                                    type="text"
                                    value={form.reward}
                                    onChange={e => setForm(p => ({ ...p, reward: e.target.value }))}
                                    placeholder="Gratis 1000 CP COD Mobile"
                                    required
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pilih Produk */}
                    <div className="space-y-5">
                        <h3 className="label-text border-b border-[var(--bg-border)] pb-2">Pilih Produk Untuk Diklaim</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <label className="form-label">Platform</label>
                                <select
                                    value={selectedPlatform}
                                    onChange={(e) => { setSelectedPlatform(e.target.value); setSelectedCategory(""); }}
                                    className="form-input appearance-none"
                                >
                                    <option value="TELEGRAM">Telegram</option>
                                    <option value="WEB">Web</option>
                                    <option value="BOTH">Semua</option>
                                    <option value="">Lihat Semua</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="form-label">Kategori</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="form-input appearance-none"
                                >
                                    <option value="">Semua Kategori</option>
                                    {filteredCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="form-label">Cari Produk</label>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Nama atau ID..."
                                        value={searchProduct}
                                        onChange={(e) => setSearchProduct(e.target.value)}
                                        className="form-input form-input-icon"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-2xl overflow-hidden">
                            <div className="max-h-[400px] overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {fetching ? (
                                    <div className="col-span-2 py-10 flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
                                        <span className="text-xs font-bold text-[var(--text-muted)] tracking-widest uppercase">MEMUAT PRODUK...</span>
                                    </div>
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map(prod => (
                                        <div
                                            key={prod.id}
                                            onClick={() => setForm(p => ({ ...p, productId: prod.id }))}
                                            className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${form.productId === prod.id
                                                ? "bg-[var(--bg-surface)] border-[var(--accent-primary)] shadow-lg shadow-[var(--shadow-md)] ring-2 ring-0"
                                                : "bg-[var(--bg-surface)] border-[var(--bg-border)] hover:border-[var(--accent-border)]"
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`text-[9px] font-black uppercase mb-0.5 tracking-wider ${form.productId === prod.id ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`}>
                                                    #{prod.id}
                                                </span>
                                                <span className={`text-sm font-bold line-clamp-1 ${form.productId === prod.id ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"}`}>
                                                    {prod.name}
                                                </span>
                                                <span className={`text-[11px] font-black mt-1 ${form.productId === prod.id ? "text-[var(--accent-primary)]" : "text-[var(--accent-primary)]"}`}>
                                                    Rp {new Intl.NumberFormat("id-ID").format(prod.price)}
                                                </span>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${form.productId === prod.id ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]" : "border-[var(--bg-border)]"}`}>
                                                {form.productId === prod.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-16 text-center">
                                        <Search className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-3" />
                                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Produk tidak ditemukan</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-6 mt-6 border-t border-[var(--bg-border)] flex items-center justify-end gap-4">
                    <Link
                        href="/admin/redeem-codes"
                        className="btn bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--bg-border)]"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || fetching}
                        className="btn btn-primary"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? "Menyimpan..." : "Buat Kode Redeem"}
                    </button>
                </div>
            </form>
        </div>
    );
}
