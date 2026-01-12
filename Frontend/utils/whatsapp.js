
import { WHATSAPP_NUMBER } from '../constants';

export const redirectToWhatsApp = (message) => {
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
};
