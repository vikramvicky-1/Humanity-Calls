import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const animateNavBar = () => {
  const logo = document.querySelector('[data-animation="logo"]');
  const navLinks = document.querySelectorAll('[data-animation="nav-link"]');
  const ctaButtons = document.querySelectorAll('[data-animation="cta-button"]');
  const isMobile = window.innerWidth < 768;

  const tl = gsap.timeline();

  if (logo) {
    tl.fromTo(
      logo,
      { opacity: 0, x: isMobile ? -10 : -20 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
      0
    );
  }

  if (navLinks.length > 0) {
    tl.fromTo(
      navLinks,
      { opacity: 0, y: isMobile ? -5 : -10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      },
      0.2
    );
  }

  if (ctaButtons.length > 0) {
    tl.fromTo(
      ctaButtons,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'back.out',
      },
      0.3
    );
  }

  return tl;
};

export const animateMobileMenuOpen = (menu) => {
  if (!menu) return;
  gsap.fromTo(
    menu,
    { opacity: 0, y: -20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
    }
  );
};

export const animateFooterElements = () => {
  const contactForm = document.querySelector('[data-animation="footer-form"]');
  const footerLinks = document.querySelectorAll('[data-animation="footer-link"]');
  const socialIcons = document.querySelectorAll('[data-animation="social-icon"]');

  if (contactForm) {
    gsap.fromTo(
      contactForm,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: contactForm,
          start: 'top 80%',
          end: 'bottom 60%',
          once: true,
        },
      }
    );
  }

  if (footerLinks.length > 0) {
    footerLinks.forEach((link, idx) => {
      gsap.fromTo(
        link,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          delay: idx * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: link,
            start: 'top 80%',
            end: 'bottom 60%',
            once: true,
          },
        }
      );
    });
  }

  if (socialIcons.length > 0) {
    socialIcons.forEach((icon, idx) => {
      gsap.fromTo(
        icon,
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          delay: idx * 0.1,
          ease: 'back.out',
          scrollTrigger: {
            trigger: icon,
            start: 'top 80%',
            end: 'bottom 60%',
            once: true,
          },
        }
      );
    });
  }
};

export const animateCards = (cards) => {
  if (!cards || cards.length === 0) return;
  
  gsap.set(cards, { willChange: "transform, opacity" });
  
  cards.forEach((card, idx) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        delay: idx * 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'bottom 60%',
          once: true,
        },
        onComplete: () => gsap.set(card, { willChange: "auto" }),
      }
    );
  });
};

export const animateTitleIn = (element) => {
  if (!element) return;
  
  const wordSpans = element.querySelectorAll('[data-word="true"]');
  if (wordSpans.length === 0) {
    const childNodes = Array.from(element.childNodes);
    element.innerHTML = '';

    childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        const words = node.textContent.split(/(\s+)/);
        words.forEach((word) => {
          if (word.trim() === '') {
            element.appendChild(document.createTextNode(word));
          } else {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.setAttribute('data-word', 'true');
            span.textContent = word;
            element.appendChild(span);
          }
        });
      } else if (node.nodeType === 1) {
        const el = node;
        el.setAttribute('data-word', 'true');
        if (!el.style.display) {
          el.style.display = 'inline-block';
        }
        element.appendChild(el);
      }
    });
  }

  const targets = element.querySelectorAll('[data-word="true"]');
  gsap.set(targets, { willChange: "transform, opacity" });
  gsap.fromTo(
    targets,
    { opacity: 0, y: 30, scale: 0.8, rotate: -2 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: element,
        start: 'top 90%',
        once: true,
      },
      onComplete: () => gsap.set(targets, { willChange: "auto" }),
    }
  );
};

export const animateParagraphIn = (element) => {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 20, x: -10 },
    {
      opacity: 1,
      y: 0,
      x: 0,
      duration: 1,
      delay: 0.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 90%',
        once: true,
      },
    }
  );
};
