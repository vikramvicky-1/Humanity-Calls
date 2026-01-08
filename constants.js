import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaTelegramPlane,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export const WHATSAPP_NUMBER = "918867713031"; // Placeholder number

export const IMAGE_ALTS = {
  hero: "Volunteers helping blood donation at a hospital - Humanity Calls NGO",
  bloodDonation:
    "Blood donation bag with heart shape - Save lives with Humanity Calls",
  poorNeedy: "Volunteers distributing food and clothes to people in need",
  animalRescue: "Volunteer rescuing a stray dog from the streets",
  collaborate: "Professionals and NGO leaders collaborating for a cause",
  howCanIHelp: "Person helping others - Humanity Calls NGO initiative",
  mission: "Our Mission - Humanity Calls NGO helping those in need",
  vision: "Our Vision - Empowering Communities and building a better future",
};

export const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/HumanityGcalls/",
    icon: FaFacebook,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/humanitycalls_/",
    icon: FaInstagram,
  },
  { name: "X", href: "https://x.com/Humanitycalls1", icon: FaXTwitter },
  {
    name: "WhatsApp",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    icon: FaWhatsapp,
  },
  {
    name: "Telegram",
    href: "https://t.me/+Hm9LfMm2fTljZjBl",
    icon: FaTelegramPlane,
  },
  {
    name: "Youtube",
    href: "https://www.youtube.com/@humanitycalls",
    icon: FaYoutube,
  },
];
