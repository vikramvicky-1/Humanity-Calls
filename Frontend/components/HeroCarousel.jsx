import React, { useState, useEffect } from "react";

const HERO_IMAGES = [
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto/v1768556077/landing_page3_dlrxfk.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto/v1768555729/landing_page4_yjkb6r.png",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto/v1768555360/landing_page2_inavn7.webp",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto/v1768555429/landing_page5_ebletc.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto/v1768555357/landing_page8_zcjgcn.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto/v1768555358/landing_page7_yzqyda.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto/v1768555359/landing_page6_lvaoju.jpg",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto/v1768555359/landing_page1_jdiydd.jpg",
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {HERO_IMAGES.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
      {/* Black light overlay to ensure text visibility */}
      <div className="absolute inset-0 bg-black/70"></div>
    </div>
  );
};

export default HeroCarousel;
