"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    User,
    Mail,
    CreditCard,
    Zap,
    Check,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Diamond,
    QrCode,
    X,
    Clock,
    TicketPercent,
    Loader2,
    Tag
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CategoryFormProps {
    category: any;
    products: any[];
}

export default function CategoryForm({ category, products }: CategoryFormProps) {
    const searchParams = useSearchParams();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const { data: session } = useSession();
    const [email, setEmail] = useState("");
    const [formData, setFormData] = useState<Record<string, string>>({});

    // Voucher state
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherApplied, setVoucherApplied] = useState<{
        valid: boolean;
        discount: number;
        finalPrice: number;
        message: string;
    } | null>(null);
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [voucherError, setVoucherError] = useState("");

    const fields = category.fields || [];

    // Reset voucher when product changes
    useEffect(() => {
        setVoucherApplied(null);
        setVoucherError("");
    }, [selectedProduct]);

    // Auto-fill from URL params
    useEffect(() => {
        if (!searchParams) return;

        const defaultProductId = searchParams.get('productId');
        if (defaultProductId) {
            const prod = products.find(p => p.id === defaultProductId);
            if (prod) setSelectedProduct(prod);
        }

        let initialData: Record<string, string> = {};
        fields.forEach((f: any) => {
            const val = searchParams.get(f.key);
            if (val) initialData[f.key] = val;
        });

        if (Object.keys(initialData).length > 0) {
            setFormData(prev => {
                const isDifferent = Object.keys(initialData).some(k => prev[k] !== initialData[k]);
                return isDifferent ? { ...prev, ...initialData } : prev;
            });
        }
    }, [searchParams, products, fields]);

    // Auto-fill email from logged-in user session
    useEffect(() => {
        if (session?.user?.email) {
            setEmail(session.user.email);
        }
    }, [session]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleFieldChange = (key: string, value: string, type?: string) => {
        if (type === "number") {
            // Only allow digits
            const numericValue = value.replace(/\D/g, "");
            setFormData(prev => ({ ...prev, [key]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [key]: value }));
        }
    };

    const payments = [
        { id: "qris", name: "QRIS", img: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" },
    ];

    const [qrData, setQrData] = useState<{ qrString: string; orderId: string; amount: number; productName?: string } | null>(null);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
    const [error, setError] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Timer Effect
    useEffect(() => {
        if (!qrData || paymentSuccess) {
            setTimeLeft(900);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [qrData, paymentSuccess]);

    // Real-time polling for payment success
    useEffect(() => {
        let pollTimer: NodeJS.Timeout;
        if (qrData && !paymentSuccess) {
             pollTimer = setInterval(async () => {
                 try {
                     const res = await fetch(`/api/orders/status/${qrData.orderId}`);
                     if (res.ok) {
                         const data = await res.json();
                         if (data.status === "PAID" || data.status === "COMPLETED" || data.status === "PROCESSING") {
                             setPaymentSuccess(true);
                             // Auto close after 3s
                             setTimeout(() => {
                                 setQrData(null);
                                 setPaymentSuccess(false);
                                 // Optional: redirect or reload since order implies success
                                 window.location.reload(); 
                             }, 3000);
                         }
                     }
                 } catch (e) {
                     // ignore polling errors
                 }
             }, 3000);
        }
        return () => {
            if (pollTimer) clearInterval(pollTimer);
        }
    }, [qrData, paymentSuccess]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Voucher apply handler
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            setVoucherError("Masukkan kode voucher.");
            return;
        }
        if (!selectedProduct) {
            setVoucherError("Pilih produk terlebih dahulu.");
            return;
        }

        setVoucherLoading(true);
        setVoucherError("");
        setVoucherApplied(null);

        try {
            const res = await fetch("/api/voucher/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: voucherCode.trim(),
                    productPrice: selectedProduct.price,
                    categoryId: category.id
                })
            });

            const data = await res.json();
            if (data.valid) {
                setVoucherApplied(data);
                setVoucherError("");
            } else {
                setVoucherError(data.message || "Voucher tidak valid.");
                setVoucherApplied(null);
            }
        } catch {
            setVoucherError("Gagal memvalidasi voucher.");
        } finally {
            setVoucherLoading(false);
        }
    };

    const handleRemoveVoucher = () => {
        setVoucherApplied(null);
        setVoucherCode("");
        setVoucherError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !paymentMethod) {
            setError("Harap lengkapi semua data order.");
            return;
        }

        // Validate email format only if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Format email tidak valid.");
            return;
        }

        // Check all required fields are filled
        for (const field of fields) {
            if (!formData[field.key]) {
                setError(`Harap isi ${field.name}.`);
                return;
            }
        }

        setError("");
        setShowConfirmation(true);
    };

    const handleCheckout = async () => {
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    paymentMethod,
                    email: email || undefined,
                    formData,
                    voucherCode: voucherApplied ? voucherCode.trim() : undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal membuat pesanan.");

            setShowConfirmation(false);
            setQrData({
                qrString: data.qrString,
                orderId: data.orderId,
                amount: data.amount,
                productName: data.productName
            });
        } catch (err: any) {
            setError(err.message);
            setShowConfirmation(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 pb-20">
            {error && (
                <div style={{background:"var(--error-muted)",border:"1px solid var(--error)",borderRadius:"var(--radius-xl)",padding:"14px 16px",display:"flex",alignItems:"center",gap:"12px",fontSize:"13px",fontWeight:600,color:"var(--error)"}}>
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            {/* 1. Masukkan User ID */}
            <section className="card" style={{overflow:"hidden"}}>
                <div style={{background:"var(--bg-elevated)",padding:"16px 24px",display:"flex",alignItems:"center",gap:"16px",borderBottom:"1px solid var(--bg-border)"}}>
                    <div style={{background:"var(--accent-primary)",color:"#fff",width:"28px",height:"28px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"12px",flexShrink:0}}>1</div>
                    <h3 style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)",letterSpacing:"-0.01em"}}>
                        Masukkan Data Tujuan
                    </h3>
                </div>
                <div style={{padding:"20px 24px"}}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map((field: any) => (
                            <div key={field.key} style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                                <label className="form-label">
                                    {field.name}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{color:"var(--text-muted)"}} />
                                    <input
                                        type={field.type === "number" ? "text" : (field.type || "text")}
                                        inputMode={field.type === "number" ? "numeric" : undefined}
                                        placeholder={field.placeholder || "Masukkan " + field.name}
                                        required
                                        value={formData[field.key] || ""}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                                        className="form-input form-input-icon"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{marginTop:"16px",fontSize:"12px",color:"var(--text-muted)",lineHeight:1.65,background:"var(--bg-elevated)",padding:"14px",borderRadius:"var(--radius-xl)",border:"1px solid var(--bg-border)"}}>
                        Untuk mengetahui User ID Anda, silakan klik menu profile dibagian kiri atas pada menu utama game.
                    </p>
                </div>
            </section>

            {/* 2. Pilih Produk */}
            <section className="card" style={{overflow:"hidden"}}>
                <div style={{background:"var(--bg-elevated)",padding:"16px 24px",display:"flex",alignItems:"center",gap:"16px",borderBottom:"1px solid var(--bg-border)"}}>
                    <div style={{background:"var(--accent-primary)",color:"#fff",width:"28px",height:"28px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"12px",flexShrink:0}}>2</div>
                    <h3 style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)",letterSpacing:"-0.01em"}}>
                        Pilih Nominal Top Up
                    </h3>
                </div>
                <div style={{padding:"20px 24px"}}>
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                            {products.map((product) => {
                                const isSelected = selectedProduct?.id === product.id;
                                return (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => setSelectedProduct(product)}
                                        className={cn(
                                            "relative p-4 sm:p-5 rounded-2xl border text-left flex flex-col justify-between h-[104px] sm:h-[120px] transition-all",
                                            isSelected
                                                ? "selected-card-on"
                                                : "selected-card-off hover:border-[var(--accent-border)]"
                                        )}
                                    >
                                        {/* Top Left: Check Icon */}
                                        {isSelected && (
                                            <div style={{position:"absolute",top:0,right:0,width:"28px",height:"28px",background:"var(--accent-primary)",borderBottomLeftRadius:"var(--radius-xl)",borderTopRightRadius:"var(--radius-xl)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}

                                        {/* Product Name */}
                                        <div className="pr-6">
                                            <div className={cn(
                                                "font-bold text-xs sm:text-sm line-clamp-2",
                                                isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                                            )}>
                                                {product.name}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className={cn(
                                            "font-black text-sm sm:text-base mt-2",
                                            isSelected ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"
                                        )}>
                                            Rp {new Intl.NumberFormat("id-ID").format(product.price)}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Zap className="w-10 h-10 mx-auto mb-3" style={{color:"var(--text-muted)"}} />
                            <p style={{color:"var(--text-primary)",fontWeight:700,fontSize:"13px"}}>Belum ada item tersedia.</p>
                            <p style={{color:"var(--text-muted)",fontSize:"12px",marginTop:"4px"}}>Silakan hubungi Admin untuk menambahkan produk pada kategori ini.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 3. Pilih Pembayaran */}
            <section className="card" style={{overflow:"hidden"}}>
                <div style={{background:"var(--bg-elevated)",padding:"16px 24px",display:"flex",alignItems:"center",gap:"16px",borderBottom:"1px solid var(--bg-border)"}}>
                    <div style={{background:"var(--accent-primary)",color:"#fff",width:"28px",height:"28px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"12px",flexShrink:0}}>3</div>
                    <h3 style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)",letterSpacing:"-0.01em"}}>
                        Pilih Metode Pembayaran
                    </h3>
                </div>
                <div style={{padding:"20px 24px"}}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {payments.map((pm) => {
                            const isSelected = paymentMethod === pm.id;
                            return (
                                <button
                                    key={pm.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(pm.id)}
                                    className={cn(
                                        "relative p-4 rounded-2xl border flex items-center gap-4 transition-all h-[72px]",
                                        isSelected
                                            ? "selected-card-on"
                                            : "selected-card-off hover:border-[var(--accent-border)]"
                                    )}
                                >
                                    <div className="w-12 h-8 flex items-center justify-center relative shrink-0">
                                        <Image
                                            src={pm.img}
                                            alt={pm.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className={cn(
                                            "font-bold text-sm",
                                            isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                                        )}>
                                            {pm.name}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <Check className="w-5 h-5 shrink-0" style={{color:"var(--accent-primary)"}} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. Masukkan Detail */}
            <section className="card" style={{overflow:"hidden"}}>
                <div style={{background:"var(--bg-elevated)",padding:"16px 24px",display:"flex",alignItems:"center",gap:"16px",borderBottom:"1px solid var(--bg-border)"}}>
                    <div style={{background:"var(--accent-primary)",color:"#fff",width:"28px",height:"28px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"12px",flexShrink:0}}>4</div>
                    <h3 style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)",letterSpacing:"-0.01em"}}>
                        Detail Kontak & Beli
                    </h3>
                </div>
                <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:"20px"}}>
                    {session?.user?.email ? (
                        <div style={{display:"flex",alignItems:"flex-start",gap:"12px",background:"var(--success-muted)",border:"1px solid rgba(16,185,129,0.35)",borderRadius:"var(--radius-xl)",padding:"14px 16px",fontSize:"13px",fontWeight:600,color:"var(--success)"}}>
                            <Check className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>Email terdeteksi dari akun Anda. Bukti transaksi akan otomatis dikirim ke email ini.</p>
                        </div>
                    ) : (
                        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                            <label className="form-label">
                                Alamat Email (Opsional)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{color:"var(--text-muted)"}} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Masukkan email untuk invoice"
                                    className="form-input form-input-icon"
                                />
                            </div>
                        </div>
                    )}

                    {/* Voucher Code Input */}
                    <div className="space-y-2">
                        <label className="form-label">
                            Kode Voucher (Opsional)
                        </label>
                        {voucherApplied ? (
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--success-muted)",border:"1px solid rgba(16,185,129,0.35)",borderRadius:"var(--radius-xl)",padding:"14px 16px"}}>
                                <div className="flex items-center gap-2.5">
                                    <TicketPercent className="w-5 h-5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">{voucherApplied.message}</p>
                                        <p className="text-xs font-medium mt-0.5" style={{color:"var(--success)"}}>
                                            Kode: <span className="font-mono font-bold">{voucherCode.toUpperCase()}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveVoucher}
                                    style={{padding:"4px",background:"none",border:"none",cursor:"pointer",color:"var(--success)",borderRadius:"var(--radius-sm)"}}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <TicketPercent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{color:"var(--text-muted)"}} />
                                    <input
                                        type="text"
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                        placeholder="Masukkan kode voucher"
                                        className="form-input form-input-icon" style={{textTransform:"uppercase",fontFamily:"monospace",letterSpacing:"0.1em"}}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleApplyVoucher}
                                    disabled={voucherLoading || !voucherCode.trim()}
                                    className="btn btn-primary" style={{flexShrink:0}}
                                >
                                    {voucherLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Terapkan"
                                    )}
                                </button>
                            </div>
                        )}
                        {voucherError && (
                            <p style={{fontSize:"11px",fontWeight:600,color:"var(--error)",display:"flex",alignItems:"center",gap:"6px",marginTop:"4px"}}>
                                <AlertCircle className="w-3.5 h-3.5" />
                                {voucherError}
                            </p>
                        )}
                    </div>

                    {/* Price Summary with Discount */}
                    {selectedProduct && voucherApplied && (
                        <div style={{background:"var(--bg-elevated)",border:"1px solid var(--bg-border)",borderRadius:"var(--radius-xl)",padding:"14px",display:"flex",flexDirection:"column",gap:"8px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px"}}>
                                <span style={{color:"var(--text-muted)",fontWeight:500}}>Harga Asli</span>
                                <span style={{color:"var(--text-muted)",fontWeight:700,textDecoration:"line-through"}}>Rp {selectedProduct.price.toLocaleString("id-ID")}</span>
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px"}}>
                                <span style={{color:"var(--success)",fontWeight:500,display:"flex",alignItems:"center",gap:"6px"}}>
                                    <Tag className="w-3.5 h-3.5" />
                                    Diskon Voucher
                                </span>
                                <span style={{color:"var(--success)",fontWeight:700}}>-Rp {voucherApplied.discount.toLocaleString("id-ID")}</span>
                            </div>
                            <div style={{height:"1px",background:"var(--bg-border)",margin:"4px 0"}} />
                            <div style={{display:"flex",justifyContent:"space-between"}}>
                                <span style={{color:"var(--text-primary)",fontWeight:700}}>Total Bayar</span>
                                <span style={{color:"var(--text-primary)",fontWeight:900,fontSize:"18px"}}>Rp {voucherApplied.finalPrice.toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary btn-full btn-lg"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                <span>MEMPROSES...</span>
                            </div>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                <span>BELI SEKARANG</span>
                            </>
                        )}
                    </button>
                </div>
            </section>

            {/* Confirmation Modal */}
            {showConfirmation && selectedProduct && (
                <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",padding:"16px"}}>
                    <div className="card" style={{width:"100%",maxWidth:"440px",overflow:"hidden",borderRadius:"var(--radius-2xl)"}}>
                        <div style={{background:"var(--bg-elevated)",padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--bg-border)"}}>
                            <div className="flex items-center gap-3">
                                <div style={{padding:"8px",background:"var(--accent-muted)",borderRadius:"var(--radius-lg)"}}>
                                    <ShieldCheck style={{width:"18px",height:"18px",color:"var(--accent-primary)"}} />
                                </div>
                                <div>
                                    <h3 style={{fontSize:"16px",fontWeight:700,color:"var(--text-primary)"}}>Konfirmasi Order</h3>
                                    <p style={{fontSize:"11px",fontWeight:600,color:"var(--text-muted)",marginTop:"2px"}}>Periksa ulang detail pesanan Anda</p>
                                </div>
                            </div>
                            <button onClick={() => setShowConfirmation(false)} className="back-btn">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:"16px"}}>
                            {/* Product Card */}
                            <div style={{background:"var(--bg-elevated)",borderRadius:"var(--radius-xl)",padding:"14px",display:"flex",alignItems:"center",gap:"14px",border:"1px solid var(--bg-border)"}}>
                                <div style={{width:"44px",height:"44px",borderRadius:"var(--radius-lg)",background:"var(--accent-muted)",border:"1px solid var(--accent-border)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                    <Diamond style={{width:"20px",height:"20px",color:"var(--accent-primary)"}} />
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                    <h4 style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)",letterSpacing:"-0.01em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selectedProduct.name}</h4>
                                    <p style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600,marginTop:"4px"}}>{category.name}</p>
                                </div>
                            </div>

                            {/* Detail Fields */}
                            <div style={{display:"flex",flexDirection:"column",gap:"10px",background:"var(--bg-surface)",border:"1px solid var(--bg-border)",borderRadius:"var(--radius-xl)",padding:"14px"}}>
                                {fields.map((field: any) => (
                                    <div key={field.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                                        <span style={{fontSize:"11px",fontWeight:600,color:"var(--text-muted)"}}>{field.name}</span>
                                        <span style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)"}}>{formData[field.key] || "-"}</span>
                                    </div>
                                ))}
                                {email && (
                                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                                        <span style={{fontSize:"11px",fontWeight:600,color:"var(--text-muted)"}}>Email Resi</span>
                                        <span style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"150px"}}>{email}</span>
                                    </div>
                                )}
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                                    <span style={{fontSize:"11px",fontWeight:600,color:"var(--text-muted)"}}>Pembayaran</span>
                                    <span style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)",textTransform:"uppercase"}}>{paymentMethod}</span>
                                </div>
                            </div>

                            {/* Price */}
                            {voucherApplied ? (
                                <div style={{background:"var(--success-muted)",border:"1px solid rgba(16,185,129,0.35)",borderRadius:"var(--radius-xl)",padding:"14px",display:"flex",flexDirection:"column",gap:"8px"}}>
                                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                        <span style={{fontSize:"11px",fontWeight:600,color:"var(--success)"}}>Harga Asli</span>
                                        <span style={{fontSize:"13px",fontWeight:700,color:"var(--success)",opacity:0.5,textDecoration:"line-through"}}>Rp {new Intl.NumberFormat("id-ID").format(selectedProduct.price)}</span>
                                    </div>
                                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                        <span style={{fontSize:"11px",fontWeight:600,color:"var(--success)",display:"flex",alignItems:"center",gap:"4px"}}>
                                            <TicketPercent className="w-3.5 h-3.5" /> Voucher
                                        </span>
                                        <span style={{fontSize:"13px",fontWeight:700,color:"var(--success)"}}>-Rp {new Intl.NumberFormat("id-ID").format(voucherApplied.discount)}</span>
                                    </div>
                                    <div style={{height:"1px",background:"rgba(16,185,129,0.3)"}} />
                                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                        <span style={{fontSize:"13px",fontWeight:700,color:"var(--success)"}}>Total Tagihan</span>
                                        <span style={{fontSize:"20px",fontWeight:900,color:"var(--success)"}}>Rp {new Intl.NumberFormat("id-ID").format(voucherApplied.finalPrice)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{background:"var(--success-muted)",border:"1px solid rgba(16,185,129,0.35)",borderRadius:"var(--radius-xl)",padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                    <span style={{fontSize:"13px",fontWeight:700,color:"var(--success)"}}>Total Tagihan</span>
                                    <span style={{fontSize:"20px",fontWeight:900,color:"var(--success)"}}>Rp {new Intl.NumberFormat("id-ID").format(selectedProduct.price)}</span>
                                </div>
                            )}
                        </div>

                        <div style={{padding:"16px 24px",background:"var(--bg-elevated)",borderTop:"1px solid var(--bg-border)",display:"flex",flexDirection:"column",gap:"10px"}}>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                                className="btn btn-primary btn-full"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Lanjut Bayar
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                style={{width:"100%",color:"var(--text-muted)",background:"none",border:"none",cursor:"pointer",fontWeight:600,padding:"10px",borderRadius:"var(--radius-xl)",fontSize:"13px"}}
                            >
                                Batalkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QRIS Modal (Light Mode) */}
            {qrData && (
                <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",padding:"16px"}}>
                    <div className="card" style={{width:"100%",maxWidth:"440px",overflow:"hidden",borderRadius:"var(--radius-2xl)"}}>
                        {/* Header */}
                        <div style={{background:"var(--bg-elevated)",padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--bg-border)"}}>
                            <div className="flex items-center gap-3">
                                <div style={{padding:"8px",background:"var(--accent-muted)",borderRadius:"var(--radius-lg)",color:"var(--accent-primary)"}}>
                                    <QrCode className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 style={{fontSize:"16px",fontWeight:700,color:"var(--text-primary)"}}>Pembayaran QRIS</h3>
                                    <p style={{fontSize:"11px",fontWeight:600,color:"var(--text-muted)",marginTop:"2px"}}>Order ID: {qrData.orderId}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setQrData(null)}
                                className="back-btn"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Timer Banner */}
                        {!paymentSuccess && (
                            <div className={`py-2.5 px-6 flex items-center justify-center gap-2 font-bold text-xs tracking-wide ${timeLeft > 60 ? "bg-amber-100 text-amber-700 border-b border-amber-200" : "bg-red-100 text-red-700 border-b border-red-200 animate-pulse"}`}>
                                <Clock className="w-4 h-4 shrink-0" />
                                {timeLeft > 0 ? (
                                    <span>Berakhir dalam: {formatTime(timeLeft)}</span>
                                ) : (
                                    <span>Waktu Pembayaran Habis</span>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        {paymentSuccess ? (
                            <div style={{padding:"40px 24px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
                                <div style={{width:"80px",height:"80px",background:"var(--success-muted)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"20px",border:"1px solid rgba(16,185,129,0.35)"}}>
                                    <CheckCircle2 style={{width:"36px",height:"36px",color:"var(--success)"}} />
                                </div>
                                <h3 style={{fontSize:"20px",fontWeight:900,color:"var(--text-primary)",marginBottom:"8px",letterSpacing:"-0.02em"}}>Pembayaran Berhasil!</h3>
                                <p style={{color:"var(--text-muted)",fontWeight:500,fontSize:"13px"}}>Pesanan Anda sedang diproses. Menutup otomatis...</p>
                            </div>
                        ) : (
                            <div className="p-6 sm:p-8 flex flex-col items-center">
                                {/* Price */}
                                <div className="text-center mb-6">
                                    <p style={{fontSize:"11px",fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"4px"}}>Total Pembayaran</p>
                                    <div className={`font-black text-3xl text-[var(--text-primary)] ${timeLeft === 0 ? "opacity-40" : ""}`}>
                                        Rp {qrData.amount.toLocaleString("id-ID")}
                                    </div>
                                </div>

                                {/* QR Wrapper */}
                                <div className={`p-4 rounded-3xl border-2 border-dashed ${timeLeft === 0 ? "border-[var(--bg-border)] opacity-40" : "border-[var(--accent-border)] shadow-xl shadow-[var(--shadow-md)]"} relative mb-6`} style={{background:"var(--bg-surface)"}}>
                                    <div className="w-48 h-48 sm:w-56 sm:h-56 relative">
                                        <Image
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData.qrString)}`}
                                            alt="QRIS Code"
                                            fill
                                            unoptimized
                                            className={`object-contain ${timeLeft === 0 ? "grayscale" : ""}`}
                                        />
                                        {timeLeft === 0 && (
                                            <div className="absolute inset-0 z-20 flex items-center justify-center">
                                                <div className="bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg uppercase tracking-wider rotate-[-10deg]">
                                                    Expired
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{width:"100%",textAlign:"center",background:"var(--bg-elevated)",borderRadius:"var(--radius-xl)",padding:"14px",border:"1px solid var(--bg-border)",marginBottom:"24px"}}>
                                    <p style={{fontSize:"12px",fontWeight:500,color:"var(--text-muted)",lineHeight:1.65}}>
                                        Silakan scan kode QR ini menggunakan aplikasi e-wallet atau mobile banking Anda.
                                    </p>
                                </div>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn btn-primary btn-full"
                                >
                                    Selesai / Cek Status
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </form>
    );
}
