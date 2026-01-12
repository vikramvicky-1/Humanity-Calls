import React, { useEffect } from 'react';
import seoData from '../seo.json';

const SEO = ({ title, description, keywords, image }) => {
  const { meta, open_graph, twitter } = seoData.seo;

  useEffect(() => {
    const seoTitle = title ? `${title} | Humanity Calls` : meta.title;
    const seoDescription = description || meta.description;
    const seoKeywords = keywords || meta.keywords;
    const seoImage = image || open_graph.og_image;

    document.title = seoTitle;
    
    const updateMeta = (name, content, property = false) => {
      if (!content) return;
      let el = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(property ? 'property' : 'name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', seoDescription);
    updateMeta('keywords', seoKeywords);
    updateMeta('author', meta.author);
    updateMeta('robots', meta.robots);
    
    // OG Tags
    updateMeta('og:title', seoTitle, true);
    updateMeta('og:description', seoDescription, true);
    updateMeta('og:type', open_graph.og_type, true);
    updateMeta('og:site_name', open_graph.og_site_name, true);
    updateMeta('og:image', seoImage, true);
    updateMeta('og:locale', open_graph.og_locale, true);

    // Twitter Tags
    updateMeta('twitter:card', twitter['twitter:card']);
    updateMeta('twitter:title', title || twitter['twitter:title']);
    updateMeta('twitter:description', seoDescription);
    updateMeta('twitter:image', seoImage);
    updateMeta('twitter:site', twitter['twitter:site']);

    // Schema.org JSON-LD
    const schemaEl = document.querySelector('script[type="application/ld+json"]');
    if (schemaEl) {
      schemaEl.innerHTML = JSON.stringify(seoData.seo.schemas);
    } else {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(seoData.seo.schemas);
      document.head.appendChild(script);
    }

  }, [title, description, keywords, image]);

  return null;
};

export default SEO;
