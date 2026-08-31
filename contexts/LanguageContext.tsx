import React, { createContext, useContext, ReactNode } from 'react';
import { translations } from '../translations';

// Define the shape of the context
interface LanguageContextType {
    t: (key: string, defaultVal?: string) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
    t: (key: string, defaultVal?: string) => defaultVal || key,
});

// Custom hook to use the language context
export const useTranslation = () => useContext(LanguageContext);

// Provider component
interface LanguageProviderProps {
    children: ReactNode;
    language: string;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, language }) => {
    
    const t = (key: string, defaultVal?: string): string => {
        const langKey = language as keyof typeof translations;
        // Fallback to English if the selected language or a specific key is missing
        const langTranslations = translations[langKey] || translations.en;
        const fallbackTranslations = translations.en;
        
        return langTranslations[key] || fallbackTranslations[key] || defaultVal || key;
    };

    return (
        <LanguageContext.Provider value={{ t }}>
            {children}
        </LanguageContext.Provider>
    );
};