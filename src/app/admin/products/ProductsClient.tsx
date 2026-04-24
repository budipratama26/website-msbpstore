"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Package, Edit, Loader2, Search, X } from "lucide-react";

interface Product {
    id: string;
    name: string;
    image: string | null;
    price: number;
    stock: number;
    active: boolean;
    category: { name: string } | null;
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const filtered = initialProducts.filter(p => {
        const q = search.toLowerCase();
        return (
            p.name.toLowerCase().includes(q) ||
            (p.category?.name || "").toLowerCase().includes(q) ||
            p.id.includes(q)
        );
    });

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus produk "${name}"?`)) return;
        setDeleteId(id);
        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
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
        <div className="space-y-5">
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"16px",borderBottom:"1px solid var(--bg-border)",paddingBottom:"16px"}}>
                <div>
                    <h1 style={{fontSize:"18px",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"10px"}}>
                        <Package style={{width:"20px",height:"20px",color:"var(--accent-primary)"}} />
                        Manajemen Produk
                    </h1>
                    <p style={{color:"var(--text-muted)",fontSize:"13px",fontWeight:500,marginTop:"4px"}}>Kelola data seluruh produk dan harga.</p>
                </div>
                <Link 
                    href="/admin/products/create" 
                    className="btn btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Produk
                </Link>
            </div>

            <div className="relative w-full max-w-md">
                <Search style={{position:"absolute",left:"13px",top:"50%",transform:"translateY(-50%)",width:"14px",height:"14px",color:"var(--text-muted)",pointerEvents:"none"}} />
                <input 
                    type="text" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Cari produk, kategori..."
                    className="form-input form-input-icon pr-10" 
                />
                {search && (
                    <button 
                        onClick={() => setSearch("")} 
                        style={{position:"absolute",right:"13px",top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)",background:"none",border:"none",cursor:"pointer",padding:0}}
                    >
                        <X className="w-4 h-4" />
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
                                <th>Nama Produk</th>
                                <th>Kategori</th>
                                <th>Harga</th>
                                <th>Stok</th>
                                <th>Status</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id}>
                                    <td style={{fontFamily:"monospace",color:"var(--text-muted)",fontSize:"12px"}}>#{p.id.slice(-4)}</td>
                                    <td>
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} style={{width:"38px",height:"38px",borderRadius:"var(--radius-md)",objectFit:"cover",border:"1px solid var(--bg-border)"}} />
                                        ) : (
                                            <div style={{width:"38px",height:"38px",borderRadius:"var(--radius-md)",background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:"var(--text-muted)"}}>N/A</div>
                                        )}
                                    </td>
                                    <td style={{fontWeight:700,fontSize:"13px",color:"var(--text-primary)"}}>{p.name}</td>
                                    <td>
                                        <span className="badge badge-info">
                                            {p.category?.name || 'GENERIC'}
                                        </span>
                                    </td>
                                    <td style={{color:"var(--text-primary)",fontWeight:700,fontSize:"13px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Rp {p.price.toLocaleString("id-ID")}</td>
                                    <td style={{fontSize:"13px",fontWeight:600,color:"var(--text-muted)"}}>{p.stock}</td>
                                    <td>
                                        <span className={`badge ${p.active ? 'badge-success' : 'badge-danger'}`}>
                                            {p.active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link 
                                                href={`/admin/products/${p.id}/edit`} 
                                                style={{width:"30px",height:"30px",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-elevated)",color:"var(--text-muted)",border:"1px solid var(--bg-border)",borderRadius:"var(--radius-md)",transition:"all 150ms ease",textDecoration:"none"}}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p.id, p.name)}
                                                disabled={deleteId === p.id}
                                                style={{width:"30px",height:"30px",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-elevated)",color:"var(--text-muted)",border:"1px solid var(--bg-border)",borderRadius:"var(--radius-md)",cursor:"pointer",transition:"all 150ms ease"}}
                                            >
                                                {deleteId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-0 border-b-0">
                                        <div className="empty-state border-0 rounded-none bg-transparent">
                                            <div className="empty-icon">
                                                <Package className="w-6 h-6" />
                                            </div>
                                            <p style={{fontSize:"13px",fontWeight:700,color:"var(--text-secondary)"}}>Produk tidak ditemukan</p>
                                            <p style={{fontSize:"11px",color:"var(--text-muted)",marginTop:"2px"}}>Gunakan kata kunci pencarian lainnya.</p>
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
