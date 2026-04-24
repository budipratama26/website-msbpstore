"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Activity,
    Users,
    Eye,
    Globe,
    UserCircle,
    ShoppingCart,
    LogIn,
    UserPlus,
    Clock,
    Wifi,
    WifiOff,
    RefreshCw,
    Trash2,
    Loader2,
    Filter,
    ChevronLeft,
    ChevronRight,
    Monitor,
    Smartphone,
    TrendingUp,
    Search,
} from "lucide-react";

interface OnlineUser {
    userId?: string;
    name?: string;
    email?: string;
    role?: string;
    path: string;
    ip: string;
    userAgent?: string;
    lastSeen: number;
    isGuest: boolean;
}

interface ActivityLog {
    id: string;
    userId: string | null;
    action: string;
    detail: string | null;
    ip: string | null;
    path: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        avatar: string | null;
        role: string;
    } | null;
}

interface Stats {
    onlineNow: number;
    visitorsToday: number;
    topPages: { path: string; count: number }[];
}

const ACTION_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    LOGIN: { icon: LogIn, color: "var(--accent-primary)", bg: "accent-muted", label: "Login" },
    OAUTH_LOGIN: { icon: LogIn, color: "var(--info)", bg: "info-muted", label: "Google Login" },
    REGISTER: { icon: UserPlus, color: "var(--success)", bg: "success-muted", label: "Daftar" },
    CHECKOUT: { icon: ShoppingCart, color: "var(--warning)", bg: "warning-muted", label: "Checkout" },
    PAGE_VIEW: { icon: Eye, color: "var(--text-muted)", bg: "bg-elevated", label: "Lihat Halaman" },
    LOGOUT: { icon: WifiOff, color: "var(--error)", bg: "error-muted", label: "Logout" },
};

const REFRESH_INTERVAL = 8000; // 8 detik — prioritas pengunjung real-time

function timeAgo(ts: number | string): string {
    const now = Date.now();
    const time = typeof ts === "string" ? new Date(ts).getTime() : ts;
    const diff = Math.floor((now - time) / 1000);

    if (diff < 5) return "Baru saja";
    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}

function isMobile(ua?: string): boolean {
    if (!ua) return false;
    return /mobile|android|iphone|ipad|ipod/i.test(ua);
}

function getPageLabel(path: string): string {
    const labels: Record<string, string> = {
        "/": "🏠 Beranda",
        "/status": "📋 Cek Status",
        "/history": "📜 Riwayat",
        "/login": "🔑 Login",
        "/register": "📝 Daftar",
        "/profile": "👤 Profil",
        "/checkout": "🛒 Checkout",
    };
    if (labels[path]) return labels[path];
    if (path.startsWith("/category/")) return `🎮 ${path.split("/").pop()}`;
    if (path.startsWith("/admin/")) return `⚙️ Admin: ${path.split("/admin/")[1]}`;
    return path;
}

export default function MonitoringPage() {
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [stats, setStats] = useState<Stats>({ onlineNow: 0, visitorsToday: 0, topPages: [] });
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [activityPage, setActivityPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalActivities, setTotalActivities] = useState(0);
    const [actionFilter, setActionFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cleaning, setCleaning] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [searchOnline, setSearchOnline] = useState("");

    const fetchRealtime = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const res = await fetch("/api/admin/monitoring");
            if (res.ok) {
                const data = await res.json();
                setOnlineUsers(data.onlineUsers || []);
                setStats(data.stats || { onlineNow: 0, visitorsToday: 0, topPages: [] });
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error("Fetch realtime error:", e);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const fetchActivities = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/monitoring/activities?page=${activityPage}&action=${actionFilter}`);
            if (res.ok) {
                const data = await res.json();
                setActivities(data.logs || []);
                setTotalPages(data.totalPages || 1);
                setTotalActivities(data.total || 0);
            }
        } catch (e) {
            console.error("Fetch activities error:", e);
        }
    }, [activityPage, actionFilter]);

    // Initial load
    useEffect(() => {
        Promise.all([fetchRealtime(), fetchActivities()]).then(() => setLoading(false));
    }, [fetchRealtime, fetchActivities]);

    // Auto-refresh real-time data
    useEffect(() => {
        const interval = setInterval(() => fetchRealtime(), REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchRealtime]);

    // Refetch activities when filter/page changes
    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const handleCleanup = async () => {
        if (!confirm("Hapus semua activity log yang lebih dari 30 hari?")) return;
        setCleaning(true);
        try {
            const res = await fetch("/api/admin/monitoring/cleanup", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                alert(`Berhasil menghapus ${data.deleted} log lama.`);
                fetchActivities();
            }
        } catch {}
        setCleaning(false);
    };

    const loggedInUsers = onlineUsers.filter(u => !u.isGuest);
    const guestUsers = onlineUsers.filter(u => u.isGuest);

    const filteredOnline = onlineUsers.filter(u => {
        if (!searchOnline) return true;
        const q = searchOnline.toLowerCase();
        return (
            (u.name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            u.ip.includes(q) ||
            u.path.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"}}>
                    <div style={{width:"44px",height:"44px",borderRadius:"var(--radius-xl)",background:"var(--accent-muted)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--accent-border)"}}>
                        <Loader2 style={{width:"22px",height:"22px",color:"var(--accent-primary)",animation:"spin 0.7s linear infinite"}} />
                    </div>
                    <p style={{fontSize:"12px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Memuat Monitoring...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-8">
            {/* Header */}
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"16px",borderBottom:"1px solid var(--bg-border)",paddingBottom:"16px"}}>
                <div>
                    <h1 style={{fontSize:"18px",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"10px"}}>
                        <Activity style={{width:"20px",height:"20px",color:"var(--accent-primary)"}} />
                        User Monitoring
                    </h1>
                    <p style={{color:"var(--text-muted)",fontSize:"13px",fontWeight:500,marginTop:"4px"}}>
                        Pantau aktivitas pengunjung dan pengguna secara real-time.
                    </p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"var(--text-muted)",fontWeight:500}}>
                        <div style={{width:"8px",height:"8px",borderRadius:"50%",background:refreshing?"var(--warning)":"var(--success)",animation:refreshing?"pulse 1s ease-in-out infinite":undefined}} />
                        Update: {lastUpdated.toLocaleTimeString("id-ID")}
                    </div>
                    <button
                        onClick={() => fetchRealtime(true)}
                        disabled={refreshing}
                        className="btn btn-secondary btn-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px"}}>
                <div className="card" style={{padding:"16px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"12px"}}>
                        <div style={{width:"36px",height:"36px",borderRadius:"var(--radius-lg)",background:"var(--accent-muted)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid var(--accent-border)"}}>
                            <Wifi style={{width:"18px",height:"18px",color:"var(--accent-primary)"}} />
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"9px",fontWeight:700,padding:"4px 8px",borderRadius:"var(--radius-md)",background:"var(--accent-muted)",color:"var(--accent-primary)",border:"1px solid var(--accent-border)"}}>
                            <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"var(--accent-primary)",animation:"pulse 1s ease-in-out infinite"}} />
                            LIVE
                        </div>
                    </div>
                    <p className="label-text mb-1">Online Sekarang</p>
                    <h3 style={{fontSize:"22px",fontWeight:800,color:"var(--text-primary)",letterSpacing:"-0.02em"}}>{stats.onlineNow}</h3>
                </div>

                <div className="card" style={{padding:"16px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"12px"}}>
                        <div style={{width:"36px",height:"36px",borderRadius:"var(--radius-lg)",background:"var(--info-muted)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(56,189,248,0.3)"}}>
                            <Users style={{width:"18px",height:"18px",color:"var(--info)"}} />
                        </div>
                    </div>
                    <p className="label-text mb-1">User Login</p>
                    <h3 style={{fontSize:"22px",fontWeight:800,color:"var(--text-primary)",letterSpacing:"-0.02em"}}>{loggedInUsers.length}</h3>
                </div>

                <div className="card" style={{padding:"16px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"12px"}}>
                        <div style={{width:"36px",height:"36px",borderRadius:"var(--radius-lg)",background:"rgba(139,92,246,0.1)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(139,92,246,0.2)"}}>
                            <Globe style={{width:"18px",height:"18px",color:"#8b5cf6"}} />
                        </div>
                    </div>
                    <p className="label-text mb-1">Guest / Anonim</p>
                    <h3 style={{fontSize:"22px",fontWeight:800,color:"var(--text-primary)",letterSpacing:"-0.02em"}}>{guestUsers.length}</h3>
                </div>

                <div className="card" style={{padding:"16px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"12px"}}>
                        <div style={{width:"36px",height:"36px",borderRadius:"var(--radius-lg)",background:"rgba(245,158,11,0.1)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(245,158,11,0.2)"}}>
                            <TrendingUp style={{width:"18px",height:"18px",color:"var(--warning)"}} />
                        </div>
                    </div>
                    <p className="label-text mb-1">Visitor Hari Ini</p>
                    <h3 style={{fontSize:"22px",fontWeight:800,color:"var(--text-primary)",letterSpacing:"-0.02em"}}>{stats.visitorsToday}</h3>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:"16px"}}>

                {/* Online Users Table — 2/3 width */}
                <div className="card" style={{overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:"1px solid var(--bg-border)"}}>
                        <h3 style={{fontWeight:700,color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"8px",fontSize:"13px"}}>
                            <Wifi style={{width:"14px",height:"14px",color:"var(--accent-primary)"}} />
                            Pengunjung Online
                            <span style={{fontSize:"10px",fontWeight:700,color:"var(--accent-primary)",background:"var(--accent-muted)",padding:"2px 8px",borderRadius:"var(--radius-full)",border:"1px solid var(--accent-border)"}}>
                                {filteredOnline.length}
                            </span>
                        </h3>
                        <div style={{position:"relative",width:"180px"}}>
                            <Search style={{position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)",width:"13px",height:"13px",color:"var(--text-muted)",pointerEvents:"none"}} />
                            <input
                                type="text"
                                value={searchOnline}
                                onChange={e => setSearchOnline(e.target.value)}
                                placeholder="Cari..."
                                className="form-input form-input-icon" style={{padding:"6px 10px 6px 28px",fontSize:"11px"}}
                            />
                        </div>
                    </div>

                    <div style={{maxHeight:"520px",overflowY:"auto"}}>
                        {filteredOnline.length > 0 ? (
                            <div style={{borderTop:"none"}}>
                                {filteredOnline.map((u, idx) => (
                                    <div key={`${u.userId || u.ip}-${idx}`} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",transition:"background 150ms ease"}}>
                                        {/* Avatar */}
                                        <div style={{position:"relative",flexShrink:0}}>
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                                                u.isGuest
                                                    ? "bg-elevated border-bg"
                                                    : "accent-muted border-accent"
                                            }`}>
                                                {u.isGuest ? <Globe style={{width:"14px",height:"14px"}} /> : (u.name?.[0]?.toUpperCase() || "U")}
                                            </div>
                                            <div style={{position:"absolute",bottom:"-2px",right:"-2px",width:"10px",height:"10px",borderRadius:"50%",background:"var(--success)",border:"2px solid var(--bg-surface)"}} />
                                        </div>

                                        {/* Info */}
                                        <div style={{flex:1,minWidth:0}}>
                                            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                                                <span style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                                    {u.isGuest ? "Guest" : (u.name || "User")}
                                                </span>
                                                {u.role === "admin" && (
                                                    <span style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",padding:"2px 6px",background:"var(--accent-primary)",color:"#fff",borderRadius:"var(--radius-sm)"}}>Admin</span>
                                                )}
                                                {isMobile(u.userAgent) ? (
                                                    <Smartphone style={{width:"13px",height:"13px",color:"var(--text-muted)",flexShrink:0}} />
                                                ) : (
                                                    <Monitor style={{width:"13px",height:"13px",color:"var(--text-muted)",flexShrink:0}} />
                                                )}
                                            </div>
                                            <p style={{fontSize:"11px",color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                                {u.isGuest ? u.ip : (u.email || u.ip)}
                                            </p>
                                        </div>

                                        {/* Current Page */}
                                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",flexShrink:0}}>
                                            <span style={{fontSize:"11px",fontWeight:600,color:"var(--text-secondary)",maxWidth:"160px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                                {getPageLabel(u.path)}
                                            </span>
                                            <span style={{fontSize:"10px",color:"var(--text-muted)",fontWeight:500}}>
                                                {timeAgo(u.lastSeen)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{padding:"48px 16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"12px"}}>
                                <div style={{width:"44px",height:"44px",borderRadius:"var(--radius-xl)",background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                    <WifiOff style={{width:"18px",height:"18px",color:"var(--text-muted)"}} />
                                </div>
                                <p style={{fontSize:"13px",fontWeight:700,color:"var(--text-muted)"}}>Tidak ada pengunjung online</p>
                                <p style={{fontSize:"11px",color:"var(--text-muted)",opacity:0.6}}>Data refresh otomatis setiap 8 detik</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Pages — 1/3 width */}
                <div className="card overflow-hidden">
                    <div style={{padding:"14px 20px",borderBottom:"1px solid var(--bg-border)"}}>
                        <h3 style={{fontWeight:700,color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"8px",fontSize:"13px"}}>
                            <TrendingUp style={{width:"14px",height:"14px",color:"var(--warning)"}} />
                            Halaman Terpopuler
                        </h3>
                        <p style={{fontSize:"11px",color:"var(--text-muted)",marginTop:"2px"}}>Hari ini</p>
                    </div>
                    <div style={{borderTop:"none"}}>
                        {stats.topPages.length > 0 ? stats.topPages.map((page, idx) => (
                            <div key={page.path} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px"}}>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    idx === 0 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                    idx === 1 ? "bg-elevated text-muted border-bg" :
                                    idx === 2 ? "bg-orange-50 text-orange-600 border border-orange-100" :
                                    "bg-elevated text-muted border-bg opacity-60"
                                }`}>
                                    #{idx + 1}
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                    <p style={{fontSize:"12px",fontWeight:600,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{getPageLabel(page.path)}</p>
                                </div>
                                <span style={{fontSize:"11px",fontWeight:700,color:"var(--text-muted)",background:"var(--bg-elevated)",padding:"3px 8px",borderRadius:"var(--radius-md)",border:"1px solid var(--bg-border)",flexShrink:0}}>
                                    {page.count}x
                                </span>
                            </div>
                        )) : (
                            <div style={{padding:"40px 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
                                <Eye style={{width:"18px",height:"18px",color:"var(--text-muted)",opacity:0.4}} />
                                <p style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:500}}>Belum ada data</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="card overflow-hidden">
                <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:"1px solid var(--bg-border)",gap:"12px"}}>
                    <div>
                        <h3 style={{fontWeight:700,color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"8px",fontSize:"13px"}}>
                            <Clock style={{width:"14px",height:"14px",color:"var(--accent-primary)"}} />
                            Riwayat Aktivitas
                            <span style={{fontSize:"10px",fontWeight:700,color:"var(--text-muted)",background:"var(--bg-elevated)",padding:"2px 8px",borderRadius:"var(--radius-full)",border:"1px solid var(--bg-border)"}}>
                                {totalActivities} log
                            </span>
                        </h3>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"6px",background:"var(--bg-elevated)",padding:"4px",borderRadius:"var(--radius-md)",border:"1px solid var(--bg-border)"}}>
                            <Filter style={{width:"13px",height:"13px",color:"var(--text-muted)",marginLeft:"4px"}} />
                            <select
                                value={actionFilter}
                                onChange={e => { setActionFilter(e.target.value); setActivityPage(1); }}
                                className="form-input" style={{fontSize:"11px",fontWeight:700,padding:"4px 20px 4px 4px",background:"transparent",border:"none",appearance:"none",cursor:"pointer",color:"var(--text-primary)"}}
                            >
                                <option value="ALL">Semua</option>
                                <option value="LOGIN">Login</option>
                                <option value="OAUTH_LOGIN">Google Login</option>
                                <option value="REGISTER">Daftar</option>
                                <option value="CHECKOUT">Checkout</option>
                                <option value="LOGOUT">Logout</option>
                            </select>
                        </div>
                        <button
                            onClick={handleCleanup}
                            disabled={cleaning}
                            style={{display:"flex",alignItems:"center",gap:"6px",padding:"6px 10px",background:"var(--bg-elevated)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"var(--radius-md)",cursor:"pointer",fontSize:"11px",fontWeight:700,color:"var(--error)",transition:"all 150ms ease"}}
                            title="Hapus log > 30 hari"
                        >
                            {cleaning ? <Loader2 style={{width:"13px",height:"13px",animation:"spin 0.7s linear infinite"}} /> : <Trash2 style={{width:"13px",height:"13px"}} />}
                            <span className="hidden sm:inline">Bersihkan</span>
                        </button>
                    </div>
                </div>

                <div style={{maxHeight:"600px",overflowY:"auto"}}>
                    {activities.length > 0 ? (
                        <div style={{borderTop:"none"}}>
                            {activities.map((log) => {
                                const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.PAGE_VIEW;
                                const Icon = config.icon;
                                return (
                                    <div key={log.id} style={{display:"flex",alignItems:"flex-start",gap:"12px",padding:"12px 20px",transition:"background 150ms ease"}}>
                                        <div style={{width:"32px",height:"32px",borderRadius:"var(--radius-md)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:"var(--bg-elevated)",border:"1px solid var(--bg-border)"}}>
                                            <Icon style={{width:"14px",height:"14px"}} />
                                        </div>
                                        <div style={{flex:1,minWidth:0}}>
                                            <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                                                <span style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)"}}>
                                                    {log.user?.name || "Guest"}
                                                </span>
                                                <span style={{fontSize:"9px",fontWeight:900,textTransform:"uppercase",padding:"2px 6px",borderRadius:"var(--radius-sm)",background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",color:"var(--text-muted)"}}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <p style={{fontSize:"11px",color:"var(--text-muted)",marginTop:"2px",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>
                                                {log.detail || log.path || "—"}
                                            </p>
                                            <div style={{display:"flex",alignItems:"center",gap:"12px",marginTop:"4px"}}>
                                                <span style={{fontSize:"10px",color:"var(--text-muted)",fontWeight:500}}>{timeAgo(log.createdAt)}</span>
                                                {log.ip && <span style={{fontSize:"10px",color:"var(--text-muted)",fontFamily:"monospace",opacity:0.7}}>{log.ip}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{padding:"48px 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px"}}>
                            <div style={{width:"44px",height:"44px",borderRadius:"var(--radius-xl)",background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <Clock style={{width:"18px",height:"18px",color:"var(--text-muted)"}} />
                            </div>
                            <p style={{fontSize:"13px",fontWeight:700,color:"var(--text-muted)"}}>Belum ada aktivitas tercatat</p>
                            <p style={{fontSize:"11px",color:"var(--text-muted)",opacity:0.6}}>Aktivitas akan muncul saat ada login, checkout, dll.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderTop:"1px solid var(--bg-border)",background:"var(--bg-elevated)"}}>
                        <span style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:500}}>
                            Hal. {activityPage} dari {totalPages}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                                disabled={activityPage <= 1}
                                style={{width:"30px",height:"30px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"var(--radius-md)",border:"1px solid var(--bg-border)",background:"var(--bg-elevated)",cursor:"pointer",transition:"all 150ms ease"}}
                            >
                                <ChevronLeft style={{width:"14px",height:"14px",color:"var(--text-muted)"}} />
                            </button>
                            <button
                                onClick={() => setActivityPage(p => Math.min(totalPages, p + 1))}
                                disabled={activityPage >= totalPages}
                                style={{width:"30px",height:"30px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"var(--radius-md)",border:"1px solid var(--bg-border)",background:"var(--bg-elevated)",cursor:"pointer",transition:"all 150ms ease"}}
                            >
                                <ChevronRight style={{width:"14px",height:"14px",color:"var(--text-muted)"}} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
