import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RTL_LANGUAGES = ['ar'];

/**
 * Sets `dir="rtl"` on <html> when an RTL language (Darija) is active.
 * Resets to `dir="ltr"` for all other languages.
 */
const DirectionHandler = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);

  return null;
};

export default DirectionHandler;
