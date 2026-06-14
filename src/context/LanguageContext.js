import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { strings } from '../constants/strings';

const LanguageContext = createContext(null);
const LANG_KEY = '@aza_language';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const t = strings[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored) setLanguage(stored);
    });
  }, []);

  const switchLanguage = async (lang) => {
    setLanguage(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
    // RTL requires app restart to fully apply — handled in App.js
    I18nManager.forceRTL(lang === 'ar');
  };

  return (
    <LanguageContext.Provider value={{ language, t, isRTL, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
