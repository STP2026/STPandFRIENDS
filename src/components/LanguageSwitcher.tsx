import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'fr', flag: '🇫🇷' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`text-lg p-1 rounded-md transition-all hover:bg-accent ${
            i18n.language === lang.code 
              ? 'bg-accent ring-2 ring-primary ring-offset-1' 
              : 'opacity-60 hover:opacity-100'
          }`}
          title={lang.code.toUpperCase()}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
