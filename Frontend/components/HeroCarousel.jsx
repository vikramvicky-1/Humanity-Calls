import React, { useState, useEffect } from "react";
import axios from "axios";

const FALLBACK_IMAGES = [
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_60,w_800,c_limit/v1768556077/landing_page3_dlrxfk.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555729/landing_page4_yjkb6r.png",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555360/landing_page2_inavn7.webp",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555429/landing_page5_ebletc.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555357/landing_page8_zcjgcn.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555358/landing_page7_yzqyda.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555359/landing_page6_lvaoju.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200,c_limit/v1768555359/landing_page1_jdiydd.jpg",
];

const HeroCarousel = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSlider, setShowSlider] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/carousel`);
        if (response.data && response.data.length > 0) {
          setImages(response.data.map(img => img.imageUrl));
        } else {
          setImages(FALLBACK_IMAGES);
        }
      } catch (err) {
        console.error("Failed to fetch carousel images:", err);
        setImages(FALLBACK_IMAGES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    // Delay slider activation to prioritize LCP image
    const timer = setTimeout(() => setShowSlider(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSlider || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showSlider, images.length]);

  if (isLoading || images.length === 0) {
    return (
      <div className="absolute inset-0 w-full h-full bg-black/20 animate-pulse flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* LCP Primary Image - Always rendered */}
      <div
        className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
          currentIndex === 0 ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src={images[0]}
          alt="Slide 1"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width="800"
          height="533"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      </div>

      {/* Subsequent images loaded only after slider activation */}
      {showSlider &&
        images.slice(1).map((image, index) => {
          const actualIndex = index + 1;
          return (
            <div
              key={actualIndex}
              className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
                actualIndex === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image}
                alt={`Slide ${actualIndex + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width="1200"
                height="800"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          );
        })}
      {/* Black light overlay to ensure text visibility */}
      <div className="absolute inset-0 bg-black/70"></div>
    </div>
  );
};

export default HeroCarousel;
