"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const thumbnails = images.slice(1, 3).length
    ? images.slice(1, 3)
    : [images[0], images[0]];

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = "";
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const toggleZoom = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, closeLightbox, nextImage, prevImage]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && scale > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div className="tenant-detail-gallery-grid grid gap-3 md:grid-cols-[1.6fr_1fr]" data-reveal="soft">
        <div
          className="tenant-detail-main-image relative min-h-[380px] overflow-hidden md:min-h-[570px] cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 65vw"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 flex items-center justify-center">
            <span className="opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              Xem ảnh
            </span>
          </div>
        </div>
        <div className="tenant-detail-thumbnails grid grid-cols-2 gap-3 md:grid-cols-1">
          {thumbnails.map((image, i) => (
            <div
              key={`${image}-${i}`}
              className="relative min-h-44 overflow-hidden md:min-h-0 cursor-pointer group"
              onClick={() => openLightbox(i + 1)}
            >
              <Image
                src={image}
                alt={`${title} - ảnh ${i + 2}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="35vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6 z-10 text-white/70">
            <div className="text-sm font-medium tracking-widest uppercase">
              {currentIndex + 1} / {images.length}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleZoom}
                className="hover:text-white transition-colors p-2"
                aria-label="Phóng to / Thu nhỏ"
              >
                {scale === 1 ? <ZoomIn size={24} /> : <ZoomOut size={24} />}
              </button>
              <button
                onClick={closeLightbox}
                className="hover:text-white transition-colors p-2"
                aria-label="Đóng"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-10 hidden sm:block"
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={48} strokeWidth={1.5} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-10 hidden sm:block"
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRight size={48} strokeWidth={1.5} />
          </button>

          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
            onClick={closeLightbox}
          >
            <div
              className={`relative max-w-7xl max-h-[85vh] w-full h-full transition-transform ${isDragging ? "duration-0" : "duration-300"}`}
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (scale === 1) toggleZoom();
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <Image
                src={images[currentIndex]}
                alt={`${title} - ảnh ${currentIndex + 1}`}
                fill
                className="object-contain select-none animate-in zoom-in-95 duration-300"
                sizes="100vw"
                draggable={false}
              />
            </div>
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-6 sm:hidden z-10">
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="p-3 text-white/70 bg-black/50 rounded-full backdrop-blur-md">
              <ChevronLeft size={24} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="p-3 text-white/70 bg-black/50 rounded-full backdrop-blur-md">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
