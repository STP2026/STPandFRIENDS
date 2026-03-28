// Central config — change contact details here without redeployment via env
export const CONTACT = {
  whatsapp: import.meta.env.VITE_CONTACT_WHATSAPP || 'https://wa.me/4915756175163',
  phone: import.meta.env.VITE_CONTACT_PHONE || 'tel:+4915756175163',
  email: import.meta.env.VITE_CONTACT_EMAIL || 'niklas@save-the-paws.com',
  facebook: 'https://www.facebook.com/share/g/1AsLrfAibF/?mibextid=K35XfP',
  website: 'https://save-the-paws.de',
  gofundme: 'https://www.gofundme.com/f/kastrationsprogramm-in-agadir',
  dogAid: 'https://aid.save-the-paws.de/dog-aid',
  firstAid: 'https://aid.save-the-paws.de/first-aid',
  adopt: 'https://aid.save-the-paws.de/adopt',
};
