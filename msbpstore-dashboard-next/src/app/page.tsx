import prisma from "@/lib/prisma";
import HomeClientWrapper from "@/components/HomeClientWrapper";
import { Category } from "@prisma/client";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "MSBP Store - Top Up Game Instan 24 Jam Harga Termurah",
  description: "Top up game favoritmu di MSBP Store. Proses instan 24 jam, harga termurah, dan terpercaya. Mobile Legends, Free Fire, PUBG Mobile, dan lainnya.",
  keywords: ["top up game", "msbp store", "voucher game", "mobile legends", "free fire", "murah", "instan"],
  openGraph: {
    title: "MSBP Store - Top Up Game Instan 24 Jam",
    description: "Pusat Top Up Game Termurah & Terpercaya di Indonesia.",
    type: "website",
  },
};

export default async function ShopPage() {
  let categories: any[] = [];
  let banners: any[] = [];

  try {
    const [categoriesData, bannersData] = await Promise.all([
      prisma.category.findMany({
        where: {
          active: true,
          platform: { in: ["WEB", "BOTH"] }
        },
        orderBy: { name: "asc" }
      }),
      prisma.banner.findMany({
        where: { active: true },
        orderBy: { order: "asc" }
      })
    ]);

    categories = categoriesData.map((c: any) => ({
      ...c,
      id: c.id.toString()
    }));

    banners = bannersData.map((b: any) => ({
      ...b,
      id: b.id.toString()
    }));

  } catch (err) {
    console.error("Database error fetching data:", err);
  }

  return (
    <HomeClientWrapper 
      categories={categories} 
      banners={banners}
    />
  );
}
