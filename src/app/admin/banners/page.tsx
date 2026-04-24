"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminListSkeleton } from "@/components/Skeletons";
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon, ExternalLink } from "lucide-react";

interface Banner {
    id: string;
    imageUrl: string;
    linkUrl: string | null;
    title: string | null;
    active: boolean;
    order: number;
}

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchBanners = async () => {
        try {
            const res = await fetch("/api/admin/banners");
            if (res.ok) setBanners(await res.json());
        } catch {}
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBanners(); }, []);

    const handleDelete = async (id: string, title?: string | null) => {
        if (!confirm(`Hapus banner "${title || 'Tanpa Judul'}"?`)) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchBanners();
        } catch {}
        finally { setDeletingId(null); }
    };

    if (loading) {
        return <AdminListSkeleton title="Manajemen Banner" icon={ImageIcon} />;
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"16px",borderBottom:"1px solid var(--bg-border)",paddingBottom:"16px"}}>
                <div>
                    <h1 style={{fontSize:"18px",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"10px"}}>
                        <ImageIcon style={{width:"20px",height:"20px",color:"var(--accent-primary)"}} />
                        Manajemen Banner
                    </h1>
                    <p style={{color:"var(--text-muted)",fontSize:"13px",fontWeight:500,marginTop:"4px"}}>Kelola banner iklan yang akan tampil di halaman utama website.</p>
                </div>
                <Link
                    href="/admin/banners/create"
                    className="btn btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Banner
                </Link>
            </div>

            {/* Banner List Table/Grid */}
            {banners.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <ImageIcon style={{width:"24px",height:"24px",color:"var(--text-muted)"}} />
                    </div>
                    <p style={{color:"var(--text-primary)",fontWeight:700,fontSize:"16px",marginBottom:"4px"}}>Belum ada banner tersedia</p>
                    <p style={{color:"var(--text-muted)",fontSize:"13px",fontWeight:500}}>Anda belum menambahkan banner iklan apapun untuk website.</p>
                </div>
            ) : (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"16px"}}>
                    {banners.map((banner) => (
                        <div key={banner.id} className="card" style={{display:"flex",flexDirection:"column",overflow:"hidden",borderRadius:"var(--radius-xl)",padding:0}}>
                            {/* Preview Image */}
                            <div style={{position:"relative",aspectRatio:"16/5",background:"var(--bg-elevated)",borderBottom:"1px solid var(--bg-border)",overflow:"hidden",flexShrink:0}}>
                                {banner.imageUrl ? (
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.title || "Banner"}
                                        style={{width:"100%",height:"100%",objectFit:"cover"}}
                                    />
                                ) : (
                                    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"var(--text-muted)",gap:"8px"}}>
                                        <ImageIcon className="w-6 h-6" />
                                        <span style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em"}}>No Image URL</span>
                                    </div>
                                )}
                                
                                {/* Status Overlay (if inactive) */}
                                {!banner.active && (
                                    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(2px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                        <span style={{background:"var(--bg-surface)",color:"var(--text-primary)",fontSize:"10px",fontWeight:900,padding:"6px 16px",borderRadius:"var(--radius-full)",textTransform:"uppercase",letterSpacing:"0.15em"}}>Nonaktif</span>
                                    </div>
                                )}
                                
                                {/* Order Badge */}
                                <div style={{position:"absolute",top:"10px",left:"10px",background:"rgba(10,14,23,0.85)",backdropFilter:"blur(8px)",color:"var(--text-primary)",fontSize:"9px",fontWeight:900,padding:"4px 10px",borderRadius:"var(--radius-md)",border:"1px solid var(--bg-border)",display:"flex",alignItems:"center",gap:"4px"}}>
                                    <span style={{color:"var(--accent-primary)"}}>ORDER:</span> #{banner.order}
                                </div>
                            </div>

                            {/* Info Container */}
                            <div style={{padding:"16px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                                    <div>
                                        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                                            <span style={{width:"8px",height:"8px",borderRadius:"50%",flexShrink:0,background:banner.active?"var(--success)":"var(--text-muted)"}} />
                                            <p style={{color:"var(--text-primary)",fontWeight:700,fontSize:"14px",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                                {banner.title || "Tanpa Judul Kliping"}
                                            </p>
                                        </div>
                                        <div style={{display:"flex",alignItems:"center",gap:"6px",color:"var(--text-muted)"}}>
                                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                            <p style={{fontSize:"11px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500,fontStyle:"italic"}}>
                                                {banner.linkUrl || "Tidak ada link tautan"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"16px"}}>
                                    <Link
                                        href={`/admin/banners/${banner.id}/edit`}
                                        className="btn btn-secondary" style={{flex:1,justifyContent:"center"}}
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(banner.id, banner.title)}
                                        disabled={deletingId === banner.id}
                                        className="btn btn-danger-ghost" style={{padding:"0 12px"}}
                                    >
                                        {deletingId === banner.id
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Trash2 className="w-4 h-4" />
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}