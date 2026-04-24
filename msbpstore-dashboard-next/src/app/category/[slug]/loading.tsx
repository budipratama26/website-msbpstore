import { CategoryFormSkeleton, ShimmerStyle } from "@/components/Skeletons";
import { ChevronRight } from "lucide-react";

export default function CategoryLoading() {
    return (
        <div className="min-h-screen bg-[var(--bg-elevated)] text-[var(--text-primary)] pb-20 font-sans">
            <ShimmerStyle />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
                {/* Breadcrumbs Skeleton */}
                <div className="flex items-center gap-2 mb-6 sm:mb-8">
                    <div className="h-4 bg-gray-100 rounded w-16 shimmer-wrapper" />
                    <ChevronRight className="w-3.5 h-3.5 text-gray-100" />
                    <div className="h-4 bg-gray-100 rounded w-32 shimmer-wrapper" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column Skeleton */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-3xl p-6 sm:p-8 shadow-sm">
                            <div className="aspect-square rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--bg-border)] mb-6 shimmer-wrapper" />
                            <div className="h-8 bg-gray-100 rounded-lg w-3/4 mb-4 shimmer-wrapper" />
                            <div className="space-y-3">
                                <div className="h-4 bg-[var(--bg-elevated)] rounded w-full shimmer-wrapper" />
                                <div className="h-4 bg-[var(--bg-elevated)] rounded w-5/6 shimmer-wrapper" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="lg:col-span-8">
                        <CategoryFormSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );
}
