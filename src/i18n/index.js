import en from "./en.js";
import pl from "./pl.js";

const dictionaries = { en, pl };

export const getDictionary = (lang) => dictionaries[lang] || dictionaries.en;

export const createTranslator = (lang) => {
  const dict = getDictionary(lang);
  return (key) => dict[key] || dictionaries.en[key] || key;
};
