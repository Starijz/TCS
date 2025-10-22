
import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { translations, Language, TranslationKey } from '../translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('ru');

    const t = useCallback((key: TranslationKey): string => {
        return translations[language][key] || translations['en'][key];
    }, [language]);

    const value = useMemo(() => ({
        language,
        setLanguage,
        t,
    }), [language, t]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
