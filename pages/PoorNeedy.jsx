import React, { useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../components/SEO";
import Button from "../components/Button";
import { IMAGE_ALTS } from "../constants";
import { redirectToWhatsApp } from "../utils/whatsapp";

gsap.registerPlugin(ScrollTrigger);

const PoorNeedy = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const isMobile = window.innerWidth < 768;
    const yOffset = isMobile ? 15 : 30;
    
    const ctx = gsap.context(() => {
      const image = document.querySelector('[data-animation="pn-image"]');
      const title = document.querySelector('[data-animation="pn-title"]');
      const text = document.querySelector('[data-animation="pn-text"]');
      const form = document.querySelector('[data-animation="pn-form"]');

      if (image) {
        gsap.fromTo(
          image,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: image,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (title) {
        gsap.fromTo(
          title,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: title,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (text) {
        gsap.fromTo(
          text,
          { opacity: 0, y: isMobile ? 10 : 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: text,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      if (form) {
        gsap.fromTo(
          form,
          { opacity: 0, y: isMobile ? 20 : 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: form,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);
  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    address: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Help Request (Poor/Needy):\n\nName: ${formData.firstName}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nAddress: ${formData.address}\nMessage: ${formData.message}`;
    redirectToWhatsApp(msg);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white pb-24" ref={containerRef}>
      <SEO
        title="Supporting Poor & Needy | Humanity Calls NGO"
        description="We provide essential support to the underprivileged including food distribution, education, and moral support. Help us build a better society."
      />

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8">
          <img
            src="https://res.cloudinary.com/daokrum7i/image/upload/v1767814233/humanity_calls_poor_needy_oef47s.avif"
            alt={IMAGE_ALTS.poorNeedy}
            className="rounded-2xl shadow-lg"
            data-animation="pn-image"
          />
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-blood-red" data-animation="pn-title">
              Supporting the Poor/Needy
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed" data-animation="pn-text">
              One of the better ways to help the poor and needy people is to
              give them a hand up rather than a hand out. Giving them moral
              support, showing heartfelt humility and respect makes them aware
              that someone really does care about them and trying to improve
              their condition. By providing them with the opportunities to
              improve their condition on their own would increase their
              self-esteem and help them in overcoming barriers they face every
              day. Work with the poor and needy people and help them discover
              their own capabilities and capacity and putting them to use at the
              right place at the right time. Support them and let them know that
              they have something of value which can be used for meeting their
              basic requirements. One cannot make such people opulent but can at
              least help them achieve the essentials of life and lead a
              prosperous life. Helping the poor and needy people is a good deed.
              Caring for the poor and needy people and helping them is a noble
              endeavor. The more you give to poor and needy people, the more you
              strengthen their dependency. If you give them the chance or
              opportunity, you will see an effective and long-lasting
              improvement in their lives. Create a new system built on
              inter-dependency which motivates them to work and move forward and
              their dignity is maintained. Tossing out money or other kinds of
              donation do help the poor and needy people but the need is to
              direct your energies and efforts in raising them, building
              relationship, teaching them and moreover, regaining their
              self-confidence and selfesteem to work for themselves.
            </p>
            <div className="p-8 bg-gray-50 rounded-2xl border-l-8 border-blood-red">
              <h2 className="text-2xl font-bold mb-2">Direct Impact</h2>
              <p className="text-gray-600">
                Every donation reaches someone in real need.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-[#F5F5F5] p-8 md:p-12 rounded-3xl border border-gray-200" data-animation="pn-form">
          <h3 className="text-2xl font-bold mb-8 text-center">
            Assistance Request Form
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  First Name
                </label>
                <input
                  required
                  name="firstName"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Phone
                </label>
                <input
                  required
                  name="phone"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Email
              </label>
              <input
                required
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Address / Location
              </label>
              <input
                required
                name="address"
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">
                Details about the requirement
              </label>
              <textarea
                required
                name="message"
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              ></textarea>
            </div>
            <Button type="submit" className="w-full py-4">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PoorNeedy;
