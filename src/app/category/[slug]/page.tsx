import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import { Info, CheckCircle2, ChevronRight } from "lucide-react";
import CategoryForm from "./CategoryForm";
import CategoryImage from "@/components/CategoryImage";
import { CategoryFormSkeleton } from "@/components/Skeletons";
import Link from "next/link";
import Script from "next/script";

export const revalidate = 60;

export async function generateStaticParams() {
    try {
        const categories = await prisma.category.findMany({
            where: { active: true },
            select: { slug: true },
            take: 20,
        });
        return categories.map((c) => ({ slug: c.slug }));
    } catch {
        // DB not available at build time (e.g. local dev) — pages will be generated on-demand
        return [];
    }
}

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const category = await prisma.category.findUnique({
        where: { slug },
        select: { name: true }
    });

    if (!category) return { title: "Category Not Found" };

    return {
        title: `Top Up ${category.name} Murah & Instan 24 Jam - MSBP Store`,
        description: `Top up ${category.name} harga termurah, proses instan 24 jam hanya di MSBP Store. Official dan aman 100%.`,
        openGraph: {
            title: `Top Up ${category.name} Murah & Instan`,
            description: `Beli top up ${category.name} dengan harga terbaik di Indonesia.`,
        }
    };
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;

    const category = await prisma.category.findUnique({
        where: { slug, active: true },
        include: {
            products: {
                where: { active: true },
                orderBy: { price: "asc" },
            },
        },
    });

    if (!category) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `Top Up ${category.name}`,
        "image": category.image,
        "description": `Top up ${category.name} harga termurah, proses instan 24 jam hanya di MSBP Store.`,
        "offers": {
            "@type": "AggregateOffer",
            "lowPrice": category.products.length > 0 ? category.products[0].price : 0,
            "priceCurrency": "IDR",
            "offerCount": category.products.length,
            "availability": "https://schema.org/InStock"
        },
        "brand": {
            "@type": "Brand",
            "name": "MSBP Store"
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", paddingBottom: "80px" }}>
            <Script
                id="product-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px 0" }}>

                {/* Breadcrumbs */}
                <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "24px" }}>
                    <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}
                        className="hover:text-[var(--accent-primary)] transition-colors"
                    >Beranda</Link>
                    <ChevronRight style={{ width: "14px", height: "14px" }} />
                    <span style={{ color: "var(--text-primary)" }}>{category.name}</span>
                </nav>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="lg:grid-cols-12-custom">
                    <style dangerouslySetInnerHTML={{ __html: `
                        @media (min-width: 1024px) {
                            .cat-grid { display: grid; grid-template-columns: 340px 1fr; gap: 28px; align-items: start; }
                        }
                    `}} />
                    <div className="cat-grid">
                        {/* Left Column */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                            <div className="card" style={{ padding: "24px" }}>
                                {/* Image */}
                                <div style={{ position: "relative", aspectRatio: "2/1", borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: "20px", border: "1px solid var(--bg-border)", background: "var(--bg-elevated)" }}>
                                    <div style={{ position: "absolute", inset: 0, filter: "blur(20px)", opacity: 0.3, transform: "scale(1.1)" }}>
                                        <CategoryImage src={category.image} alt={category.name} fill className="object-cover" />
                                    </div>
                                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                        <CategoryImage src={category.image} alt={category.name} fill className="object-contain" priority />
                                    </div>
                                </div>

                                <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "8px" }}>
                                    {category.name}
                                </h1>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "16px" }}>
                                    Top up {category.name} harga termurah, proses instan 24 jam hanya di MSBP Store.
                                </p>

                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {[
                                        { text: "Official & Aman" },
                                        { text: "Proses Instan 24 Jam" },
                                    ].map(({ text }) => (
                                        <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                                            <CheckCircle2 style={{ width: "15px", height: "15px", color: "var(--success)", flexShrink: 0 }} />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Help card */}
                            <div style={{ padding: "16px 20px", borderRadius: "var(--radius-xl)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)" }}>
                                <h3 style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "13px", color: "var(--accent-primary)" }}>
                                    <Info style={{ width: "15px", height: "15px" }} />
                                    Bantuan
                                </h3>
                                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                                    Butuh bantuan? CS kami siap melayani Anda 24/7 melalui WhatsApp.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Form */}
                        <div>
                            <Suspense fallback={<CategoryFormSkeleton />}>
                                <CategoryForm
                                    category={{
                                        id: category.id.toString(),
                                        name: category.name,
                                        slug: category.slug,
                                        image: category.image,
                                        description: category.description,
                                        fields: category.fields,
                                    }}
                                    products={category.products.map(p => ({
                                        id: p.id.toString(),
                                        name: p.name,
                                        price: p.price,
                                        description: p.description,
                                        image: p.image,
                                        categoryId: p.categoryId?.toString() || null
                                    }))}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
