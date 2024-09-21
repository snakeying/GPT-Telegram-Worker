import en from '../locales/en.json';
import zhCn from '../locales/zhCn.json';
import zhHant from '../locales/zhHant.json';
import ja from '../locales/ja.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import ru from '../locales/ru.json';
import de from '../locales/de.json';

const locales: { [key: string]: { [key: string]: string } } = {
  en,
  zhCn,
  zhHant,
  ja,
  es,
  fr,
  ru,
  de,
};

export const getMessage = (lang: string, key: string, params: { [key: string]: string } = {}): string => {
  const locale = locales[lang] || locales['en'];
  let message = locale[key] || locales['en'][key] || key;

  Object.keys(params).forEach(param => {
    message = message.replace(`{${param}}`, params[param]);
  });

  return message;
};

export const getSupportedLanguages = (): string[] => {
  return Object.keys(locales);
};