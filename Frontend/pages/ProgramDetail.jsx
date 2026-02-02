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

  const program = PROGRAMS.find((p) => p.id === id);

  useEffect(() => {
    const fetchGallery = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/gallery?projectId=${id}`);
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
    <div className="bg-bg min-h-screen pt-32 pb-12" ref={containerRef}>
      <SEO title={`${title} | Humanity Calls`} description={desc} />

      <div className="max-w-4xl mx-auto px-[5%]">
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

        <div className="mt-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-primary mb-8 uppercase">
            {t("common.word_gallery")}
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-video bg-gray-200 animate-pulse rounded-3xl"></div>
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {images.map((img) => (
                <div key={img._id} className="group relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-border bg-white">
                  <img
                    src={img.imageUrl}
                    alt="Gallery"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 min-h-[300px] border-2 border-dashed border-primary/20 rounded-3xl flex items-center justify-center text-text-body/40 bg-white/50">
              <div className="text-center p-8 col-span-full">
                <p className="text-xl font-medium mb-2 italic">
                  {t("common.gallery_preparing_title")}
                </p>
                <p className="text-sm">{t("common.gallery_preparing_desc")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
