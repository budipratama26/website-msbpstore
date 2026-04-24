"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Banner {
    id: string;
    imageUrl: string;
    linkUrl?: string | null;
    title?: string | null;
}

interface BannerCarouselProps {
    banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isTouching, setIsTouching] = useState(false);

    // Drag to scroll state
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const draggedAmount = useRef(0);

    // Update active dot based on scroll position
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            const index = Math.round(el.scrollLeft / el.clientWidth);
            setCurrent(index);
        };

        el.addEventListener("scroll", handleScroll, { passive: true });
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);

    // Auto slide
    useEffect(() => {
        if (banners.length <= 1 || isHovered || isTouching || isDragging) return;

        const interval = setInterval(() => {
            const el = scrollRef.current;
            if (!el) return;

            const isLastSlide = current >= banners.length - 1;
            const nextIndex = isLastSlide ? 0 : current + 1;
            
            el.scrollTo({
                left: nextIndex * el.clientWidth,
                behavior: "smooth"
            });
        }, 3500);

        return () => clearInterval(interval);
    }, [isHovered, isTouching, isDragging, current, banners.length]);

    const slideTo = (index: number) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({
            left: index * el.clientWidth,
            behavior: "smooth"
        });
    };

    // Mouse drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        draggedAmount.current = 0;
        if (!scrollRef.current) return;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setIsHovered(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2;
        draggedAmount.current = Math.abs(walk);
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const preventDragClick = (e: React.MouseEvent) => {
        if (draggedAmount.current > 10) {
            e.preventDefault();
        }
    };

    if (!banners || banners.length === 0) return null;

    const renderSlide = (banner: Banner) => {
        const img = (
            <>
                <Image
                    src={banner.imageUrl}
                    alt={banner.title || "Banner"}
                    fill
                    className="object-cover"
                    priority={banners.indexOf(banner) === 0}
                    sizes="(max-width: 768px) 100vw, 1200px"
                    draggable={false}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </>
        );

        if (banner.linkUrl) {
            return (
                <Link
                    href={banner.linkUrl}
                    className="block w-full h-full relative"
                    draggable={false}
                    onClick={preventDragClick}
                    {...(banner.linkUrl.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                    {img}
                </Link>
            );
        }
        return (
            <div className="block w-full h-full relative" onClick={preventDragClick}>
                {img}
            </div>
        );
    };

    return (
        <div
            className="relative w-full group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => setIsTouching(true)}
            onTouchEnd={() => setIsTouching(false)}
        >
            <div
                ref={scrollRef}
                className={`flex w-full overflow-x-auto snap-x snap-mandatory rounded-xl shadow-lg bg-[var(--bg-elevated)] scrollbar-hide ${isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {banners.map((banner) => (
                    <div 
                        key={banner.id} 
                        className="min-w-full w-full aspect-[2/1] sm:aspect-[21/9] lg:aspect-[24/9] flex-shrink-0 snap-center relative select-none"
                    >
                        {renderSlide(banner)}
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}} />

            {/* Dot Indicators */}
            {banners.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 sm:mt-6">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => slideTo(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === current
                                    ? "w-8"
                                    : "w-2"
                            }`}
                            style={{ background: i === current ? "var(--accent-primary)" : "var(--bg-border)" }}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}