import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideshowProps {
  images: Array<{
    url: string;
    title: string;
    description?: string;
  }>;
  autoPlayInterval?: number;
  height?: string;
}

export default function ImageSlideshow({
  images,
  autoPlayInterval = 5000,
  height = "h-96",
}: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-play slideshow
  useEffect(() => {
    if (!isAutoPlay || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlay, images.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  if (images.length === 0) {
    return (
      <div className={`${height} bg-gray-200 rounded-lg flex items-center justify-center`}>
        <p className="text-gray-500">لا توجد صور</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="w-full">
      {/* Main Image Container */}
      <div className={`${height} relative rounded-lg overflow-hidden bg-black`}>
        <img
          src={currentImage.url}
          alt={currentImage.title}
          className="w-full h-full object-cover transition-opacity duration-500"
        />

        {/* Image Title and Description */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <h3 className="text-white text-2xl font-bold">{currentImage.title}</h3>
          {currentImage.description && (
            <p className="text-gray-200 text-sm mt-2">{currentImage.description}</p>
          )}
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        {/* Auto-play Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white text-xs"
        >
          {isAutoPlay ? "⏸ إيقاف" : "▶ تشغيل"}
        </Button>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 mt-4 justify-center">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? "border-primary scale-110"
                : "border-gray-300 opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={image.url}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="text-center mt-4 text-sm text-gray-600">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
