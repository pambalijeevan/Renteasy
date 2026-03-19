import { useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  title?: string;
}

export function ImageGalleryModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  title,
}: ImageGalleryModalProps) {
  const handlePrev = useCallback(() => {
    onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {title && <p className="text-lg" style={{ fontWeight: 600 }}>{title}</p>}
          <p className="text-sm text-gray-400">
            {currentIndex + 1} / {images.length} images
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main Image Area */}
      <div
        className="flex-1 relative flex items-center justify-center px-16 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors shadow-lg"
          >
            <ChevronLeft className="w-7 h-7 text-white" />
          </button>
        )}

        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain rounded-lg select-none"
          draggable={false}
        />

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors shadow-lg"
          >
            <ChevronRight className="w-7 h-7 text-white" />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="px-6 py-4 flex gap-3 overflow-x-auto justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(idx)}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? 'border-orange-500 scale-110'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumb ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
