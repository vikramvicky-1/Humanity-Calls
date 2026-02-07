import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import gsap from "gsap";
import SEO from "../components/SEO";
import { PROGRAMS } from "../constants";
import axios from "axios";

const ProgramDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  const program = PROGRAMS.find((p) => p.id === id);

  useEffect(() => {
    const fetchGallery = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/gallery?projectId=${id}`,
        );
        setImages(response.data);
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (program) {
      fetchGallery();
    }
  }, [id, program]);

  if (!program) {
    return <Navigate to="/404" />;
  }

  const title = t(`about.programs.${id}.title`);
  const desc = t(`about.programs.${id}.desc`);

  const sortedImages = [...images].sort((a, b) => {
    const dateA = new Date(a.eventDate || a.createdAt);
    const dateB = new Date(b.eventDate || b.createdAt);
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".animate-fade-in",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, [id, i18n.language]);

  return (
    <div className="bg-bg min-h-screen pt-12 pb-12" ref={containerRef}>
      <SEO title={`${title} | Humanity Calls`} description={desc} />

      <div className="max-w-none mx-auto px-[5%]">
        {/* Text Content - Centered and Narrow */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-8 animate-fade-in uppercase">
            {title}
          </h1>

          <div className="prose prose-lg max-w-none text-text-body mb-16 animate-fade-in">
            <p className="text-xl leading-relaxed">{desc}</p>
            <div className="clear-both mt-8 space-y-4">
              <p className="text-lg text-text-body/80 leading-relaxed">
                <Trans
                  i18nKey="program_detail.initiative_cornerstone"
                  values={{ title }}
                  components={{ strong: <strong /> }}
                />
              </p>
              <p className="text-lg text-text-body/80 leading-relaxed">
                {t("program_detail.initiative_expansion")}
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Content - Full Width */}
        <div className="mt-20 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <h2 className="text-3xl md:text-5xl font-bold text-primary uppercase">
              {t("common.word_gallery")}
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-text-body/60 uppercase tracking-widest">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-border px-6 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer font-bold text-primary shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4 md:gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="aspect-video bg-gray-200 animate-pulse rounded-3xl"
                ></div>
              ))}
            </div>
          ) : sortedImages.length > 0 ? (
            <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4 md:gap-8">
              {sortedImages.map((img) => (
                <div
                  key={img._id}
                  className="group relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border bg-white cursor-pointer"
                  onClick={() => setSelectedImage(img.imageUrl)}
                >
                  <img
                    src={img.imageUrl}
                    alt="Gallery"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {img.eventDate && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-black backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                        {new Date(img.eventDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto min-h-[300px] border-2 border-dashed border-primary/20 rounded-3xl flex items-center justify-center text-text-body/40 bg-white/50">
              <div className="text-center p-8">
                <p className="text-xl font-medium mb-2 italic">
                  {t("common.gallery_preparing_title")}
                </p>
                <p className="text-sm">{t("common.gallery_preparing_desc")}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-10"
            onClick={() => setSelectedImage(null)}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Fullscreen"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
          />
        </div>
      )}
    </div>
  );
};

export default ProgramDetail;
