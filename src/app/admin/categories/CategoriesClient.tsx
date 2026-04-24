"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Plus, Edit, Trash2, X, Loader2, Search } from "lucide-react";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    description: string | null;
    keywords: string | null;
    fields: any;
    active: boolean;
    platform: string;
    _count?: { products: number };
}

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const filtered = initialCategories.filter(c => {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    });

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        try {
            const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--bg-border)] pb-4">
                <div>
                    <h1 style={{fontSize:"18px",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"10px"}}>
                        <Layers style={{width:"20px",height:"20px",color:"var(--accent-primary)"}} />
                        Manajemen Kategori
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm font-medium mt-1">Kelola kategori game yang tersedia di toko Anda.</p>
                </div>
                <Link
                    href="/admin/categories/create"
                    className="btn btn-primary"
                >
                    <Plus style={{width:"14px",height:"14px"}} />
                    Tambah Kategori
                </Link>
            </div>

            <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                <input 
                    type="text" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Cari kategori..."
                    className="form-input form-input-icon pr-10" 
                />
                {search && (
                    <button 
                        onClick={() => setSearch("")} 
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                        <X style={{width:"14px",height:"14px"}} />
                    </button>
                )}
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="tbl min-w-[800px]">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Gambar</th>
                                <th>Nama Kategori</th>
                                <th>Slug</th>
                                <th>Platform</th>
                                <th>Status</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c) => (
                                <tr key={c.slug}>
                                    <td className="font-mono text-[var(--text-muted)] text-xs">#{c.id.slice(-4)}</td>
                                    <td>
                                        {c.image ? (
                                            <img src={c.image} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-[var(--bg-border)] shadow-sm" />
                                        ) : (
                                            <div style={{width:"38px",height:"38px",borderRadius:"var(--radius-md)",background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:"var(--text-muted)"}}>N/A</div>
                                        )}
                                    </td>
                                    <td style={{fontWeight:700,fontSize:"13px",color:"var(--text-primary)"}}>{c.name}</td>
                                    <td className="font-mono text-[var(--text-muted)] text-xs">{c.slug}</td>
                                    <td>
                                        <span className={`badge ${
                                            c.platform === 'WEB' 
                                                ? 'badge-success' 
                                                : c.platform === 'TELEGRAM' 
                                                    ? 'text-purple-700 bg-purple-50 border-purple-100 badge-neutral' 
                                                    : 'badge-neutral'
                                        }`}>
                                            {c.platform || 'BOTH'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${c.active ? 'badge-success' : 'badge-danger'}`}>
                                            {c.active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link 
                                                href={`/admin/categories/${c.id}/edit`} 
                                                style={{width:"30px",height:"30px",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-elevated)",color:"var(--text-muted)",border:"1px solid var(--bg-border)",borderRadius:"var(--radius-md)",transition:"all 150ms ease",textDecoration:"none"}}
                                            >
                                                <Edit style={{width:"14px",height:"14px"}} />
                                            </Link>
                                            <button
                                                onClick={() => { if (confirm(`Hapus kategori "${c.name}"?`)) handleDelete(c.id); }}
                                                disabled={deleteId === c.id}
                                                style={{width:"30px",height:"30px",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-elevated)",color:"var(--text-muted)",border:"1px solid var(--bg-border)",borderRadius:"var(--radius-md)",cursor:"pointer",transition:"all 150ms ease"}}
                                            >
                                                {deleteId === c.id ? <Loader2 style={{width:"14px",height:"14px",animation:"spin 0.7s linear infinite"}} /> : <Trash2 style={{width:"14px",height:"14px"}} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-0 border-b-0">
                                        <div className="empty-state border-0 rounded-none bg-transparent">
                                            <div className="empty-icon">
                                                <Layers className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-bold text-[var(--text-primary)]">Kategori tidak ditemukan</p>
                                            <p className="text-xs text-[var(--text-muted)] mt-0.5">Gunakan kata kunci pencarian lainnya.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
