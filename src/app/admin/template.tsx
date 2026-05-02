"use client";

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
    return (
        <div className="page-transition-enter w-full">
            {children}
        </div>
    );
}
