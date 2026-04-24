"use client";

import { Settings, Save, Globe, Shield, User, Loader2, CheckCircle2, Lock, ChevronLeft, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SettingsAdminPage() {
    const { data: session, update } = useSession();
    const [name, setName] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Store Identity
    const [storeName, setStoreName] = useState("MSBP STORE");
    const [storeDomain, setStoreDomain] = useState("msbpstore.my.id");
    const [storeLoading, setStoreLoading] = useState(false);
    const [storeSuccess, setStoreSuccess] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
        // Load store settings from localStorage
        const saved = localStorage.getItem("msbpstore_settings");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.storeName) setStoreName(data.storeName);
                if (data.storeDomain) setStoreDomain(data.storeDomain);
            } catch { }
        }
    }, [session]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, oldPassword, newPassword, confirmPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil");

            setSuccess(true);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            if (update) await update({ name });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStore = () => {
        setStoreLoading(true);
        localStorage.setItem("msbpstore_settings", JSON.stringify({ storeName, storeDomain }));
        setTimeout(() => {
            setStoreLoading(false);
            setStoreSuccess(true);
            setTimeout(() => setStoreSuccess(false), 3000);
        }, 500);
    };

    return (
        <div className="card p-6 sm:p-8 space-y-6 max-w-4xl mx-auto" style={{paddingBottom:"80px"}}>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"16px",borderBottom:"1px solid var(--bg-border)",paddingBottom:"16px"}}>
                <Link href="/admin/dashboard" className="back-btn shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 style={{fontSize:"18px",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"10px"}}>
                        <Settings style={{width:"20px",height:"20px",color:"var(--accent-primary)"}} />
                        Pengaturan Sistem
                    </h1>
                    <p style={{color:"var(--text-muted)",fontSize:"13px",fontWeight:500,marginTop:"4px"}}>Konfigurasi profile admin dan identitas website.</p>
                </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:"24px"}}>
                
                {/* Profile Settings - Left Column */}
                <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
                    <form onSubmit={handleUpdateProfile} style={{overflow:"hidden", border:"1px solid var(--bg-border)", borderRadius:"var(--radius-xl)", background:"var(--bg-base)"}}>
                        <div style={{padding:"24px",display:"flex",flexDirection:"column",gap:"24px"}}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
                                    <div style={{width:"44px",height:"44px",background:"var(--accent-muted)",borderRadius:"var(--radius-xl)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--accent-border)",flexShrink:0}}>
                                        <User style={{width:"22px",height:"22px",color:"var(--accent-primary)"}} />
                                    </div>
                                    <div className="">
                                        <h3 style={{fontWeight:700,fontSize:"17px",color:"var(--text-primary)"}}>Profil & Keamanan</h3>
                                        <p style={{fontSize:"9px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.15em",marginTop:"2px"}}>Kelola Akun Admin Utama</p>
                                    </div>
                                </div>
                                {success && (
                                    <div style={{display:"flex",alignItems:"center",gap:"8px",color:"var(--success)",fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",background:"var(--success-muted)",padding:"8px 16px",borderRadius:"var(--radius-lg)",border:"1px solid rgba(16,185,129,0.35)"}}>
                                        <CheckCircle2 style={{width:"14px",height:"14px"}} /> Updated Successfully
                                    </div>
                                )}
                            </div>

                            <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
                                <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                                    <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.2em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"10px"}}>Informasi Profil</h3>
                                    <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                        <label className="form-label">Nama Lengkap Admin</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Nama Anda"
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                                    <h3 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.2em",color:"var(--text-muted)",borderBottom:"1px solid var(--bg-border)",paddingBottom:"10px"}}>Ubah Password</h3>
                                    <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                        <label className="form-label">Password Lama</label>
                                        <input
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="form-input"
                                        />
                                    </div>
                                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px"}}>
                                        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                            <label className="form-label">Password Baru</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Min. 8 karakter"
                                                className="form-input"
                                            />
                                        </div>
                                        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                            <label className="form-label">Konfirmasi Baru</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Ulangi password baru"
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    <p style={{fontSize:"10px",color:"var(--text-muted)",fontWeight:600,fontStyle:"italic",display:"flex",alignItems:"center",gap:"6px",marginTop:"4px"}}>
                                        <AlertCircle style={{width:"11px",height:"11px",opacity:0.5}} />
                                        * Kosongkan jika tidak ingin mengubah password.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div style={{padding:"14px",background:"var(--error-muted)",border:"1px solid var(--error)",borderRadius:"var(--radius-xl)",color:"var(--error)",fontSize:"12px",fontWeight:700,display:"flex",alignItems:"center",gap:"12px"}}>
                                    <AlertCircle style={{width:"18px",height:"18px",flexShrink:0,opacity:0.8}} /> {error}
                                </div>
                            )}
                        </div>

                        <div style={{padding:"20px 24px 0",marginTop:"20px",borderTop:"1px solid var(--bg-border)",display:"flex",justifyContent:"flex-end"}}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save style={{width:"14px",height:"14px"}} />}
                                {loading ? "Menyimpan..." : "Simpan Profil"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column - Store Info & API */}
                <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
                    {/* General Settings */}
                    <div style={{overflow:"hidden", border:"1px solid var(--bg-border)", borderRadius:"var(--radius-xl)", background:"var(--bg-base)"}}>
                        <div className="p-6 sm:p-8 space-y-6">
                            <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
                                <div style={{width:"40px",height:"40px",background:"var(--bg-elevated)",borderRadius:"var(--radius-xl)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--bg-border)",flexShrink:0}}>
                                    <Globe style={{width:"18px",height:"18px",color:"var(--text-secondary)"}} />
                                </div>
                                <div>
                                    <h3 style={{fontWeight:700,fontSize:"16px",color:"var(--text-primary)",lineHeight:1}}>Identitas Toko</h3>
                                    <p style={{fontSize:"9px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.15em",marginTop:"6px",lineHeight:1}}>Branding Website</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                    <label className="form-label">Nama Website</label>
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={e => setStoreName(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                    <label className="form-label">Domain Toko</label>
                                    <input
                                        type="text"
                                        value={storeDomain}
                                        onChange={e => setStoreDomain(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{padding:"0 24px 24px"}}>
                            <button
                                onClick={handleSaveStore}
                                disabled={storeLoading}
                                className="btn btn-primary btn-full" style={{justifyContent:"center"}}
                            >
                                {storeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : storeSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save style={{width:"14px",height:"14px"}} />}
                                {storeSuccess ? "Berhasil Disimpan" : "Simpan Info Toko"}
                            </button>
                        </div>
                    </div>

                    {/* API Integration */}
                    <div style={{padding:"24px",position:"relative",overflow:"hidden",border:"2px dashed var(--bg-border)", borderRadius:"var(--radius-xl)", background:"var(--bg-base)"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"20px"}}>
                            <div style={{width:"40px",height:"40px",background:"var(--bg-elevated)",borderRadius:"var(--radius-xl)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--bg-border)",flexShrink:0}}>
                                <Lock style={{width:"18px",height:"18px",color:"var(--text-muted)"}} />
                            </div>
                            <div className="">
                                <h3 style={{fontWeight:700,fontSize:"16px",color:"var(--text-muted)",lineHeight:1}}>Integrasi API</h3>
                                <p style={{fontSize:"9px",color:"var(--accent-primary)",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.2em",marginTop:"6px",opacity:0.6}}>System Core</p>
                            </div>
                        </div>

                        <div style={{display:"flex",flexDirection:"column",gap:"16px",opacity:0.4,pointerEvents:"none",userSelect:"none"}}>
                            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                                <label style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--text-muted)"}}>Digiflazz API Key</label>
                                <div style={{width:"100%",background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",borderRadius:"var(--radius-xl)",padding:"14px 20px",color:"var(--text-muted)",fontWeight:700,fontSize:"13px",letterSpacing:"0.15em"}}>
                                    ••••••••••••••••••••••••
                                </div>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                                <h4 style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--accent-primary)",opacity:0.5}}>Webhook Endpoint</h4>
                                <div style={{padding:"12px",background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",borderRadius:"var(--radius-xl)",fontSize:"10px",fontFamily:"monospace",color:"var(--text-muted)",wordBreak:"break-all",lineHeight:1.65}}>
                                    https://msbpstore.my.id/api/webhook
                                </div>
                            </div>
                        </div>

                        <div style={{position:"absolute",bottom:"24px",left:"20px",right:"20px",pointerEvents:"none"}}>
                            <div style={{background:"var(--accent-primary)",color:"#fff",borderRadius:"var(--radius-xl)",padding:"12px",textAlign:"center"}}>
                                <p style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",letterSpacing:"0.2em",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
                                    <Shield style={{width:"11px",height:"11px"}} />
                                    Security Enabled
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
