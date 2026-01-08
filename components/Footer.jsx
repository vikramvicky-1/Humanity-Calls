import React, { useState, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import Button from "./Button";
import { redirectToWhatsApp } from "../utils/whatsapp";
import { SOCIAL_LINKS } from "../constants";
import { animateFooterElements } from "../utils/animations";

const Footer = () => {
  const footerRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      animateFooterElements();
    }, footerRef);
    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `General Inquiry via Footer:\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nMessage: ${formData.message}`;
    redirectToWhatsApp(msg);
  };

  return (
    <footer className="bg-[#1A1A1A] text-white pt-20 pb-10" ref={footerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div id="contact" data-animation="footer-form">
            <h3 className="text-3xl font-bold mb-8 text-white relative">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-[#B71C1C]"></span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                name="name"
                onChange={handleChange}
                type="text"
                placeholder="Name"
                className="w-full px-4 py-4 bg-[#2A2A2A] border border-transparent rounded-md focus:border-[#B71C1C] focus:bg-[#333333] outline-none transition-all"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  name="email"
                  onChange={handleChange}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-4 bg-[#2A2A2A] border border-transparent rounded-md focus:border-[#B71C1C] focus:bg-[#333333] outline-none transition-all"
                />
                <input
                  required
                  name="phone"
                  onChange={handleChange}
                  type="tel"
                  placeholder="Phone"
                  className="w-full px-4 py-4 bg-[#2A2A2A] border border-transparent rounded-md focus:border-[#B71C1C] focus:bg-[#333333] outline-none transition-all"
                />
              </div>
              <textarea
                required
                name="message"
                onChange={handleChange}
                placeholder="Message"
                rows={4}
                className="w-full px-4 py-4 bg-[#2A2A2A] border border-transparent rounded-md focus:border-[#B71C1C] focus:bg-[#333333] outline-none transition-all resize-none"
              ></textarea>
              <Button type="submit" className="w-full py-4 text-lg">
                Send Message
              </Button>
            </form>
          </div>

          {/* Quick Links & Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-8 text-[#B71C1C] tracking-wide uppercase">
                Quick Links
              </h3>
              <ul className="space-y-4 text-gray-400">
                <li data-animation="footer-link">
                  <Link
                    to="/about"
                    className="hover:text-white hover:pl-2 transition-all duration-300 flex items-center"
                  >
                    About Us
                  </Link>
                </li>
                <li data-animation="footer-link">
                  <Link
                    to="/request-donors"
                    className="hover:text-white hover:pl-2 transition-all duration-300 flex items-center"
                  >
                    Request For Donors
                  </Link>
                </li>
                <li data-animation="footer-link">
                  <Link
                    to="/poor-needy"
                    className="hover:text-white hover:pl-2 transition-all duration-300 flex items-center"
                  >
                    Poor/Needy
                  </Link>
                </li>
                <li data-animation="footer-link">
                  <Link
                    to="/animal-rescue"
                    className="hover:text-white hover:pl-2 transition-all duration-300 flex items-center"
                  >
                    Animal Rescue
                  </Link>
                </li>
                <li data-animation="footer-link">
                  <Link
                    to="/volunteer"
                    className="hover:text-white hover:pl-2 transition-all duration-300 flex items-center"
                  >
                    Volunteer
                  </Link>
                </li>
                <li data-animation="footer-link">
                  <Link
                    to="/collaborate"
                    className="hover:text-white hover:pl-2 transition-all duration-300 flex items-center"
                  >
                    Collaborate
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-8 text-[#B71C1C] tracking-wide uppercase">
                Get in Touch
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Office Address
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Humanity Calls,
                    <br />
                    Bengaluru, Karnataka, India.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Email Inquiries
                  </p>
                  <a
                    href="mailto:humanitycalls20@gmail.com"
                    className="text-white hover:text-[#B71C1C] transition-colors"
                  >
                    humanitycalls20@gmail.com
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Phone Numbers
                  </p>
                  <a
                    href="tel:+918042185687"
                    className="text-white hover:text-[#B71C1C] transition-colors"
                  >
                    +91 8867713031
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-[#2A2A2A] flex flex-col items-center">
          <div className="flex space-x-8 mb-8">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-all transform hover:scale-110"
              >
                <social.icon className="w-6 h-6" />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs text-gray-500 font-medium">
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link
              to="/disclaimer"
              className="hover:text-white transition-colors"
            >
              Disclaimer
            </Link>
          </div>

          <p className="text-sm text-gray-600 text-center">
            &copy; {new Date().getFullYear()} Humanity Calls Trust®. All Rights
            Reserved.
          </p>
          <p className="text-xs font-bold text-gray-600 text-center mt-2">
            Designed and Developed by{" "}
            <a
              href="https://cortexit.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              @cortexit.in
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
