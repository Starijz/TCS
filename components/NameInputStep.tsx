
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface NameInputStepProps {
    rawNames: string;
    setRawNames: (value: string) => void;
    onProcess: () => void;
}

export const NameInputStep: React.FC<NameInputStepProps> = ({ rawNames, setRawNames, onProcess }) => {
    const { t } = useLanguage();

    return (
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl flex flex-col items-center">
            <h2 className="text-2xl font-bold text-slate-200 mb-4">{t('step1Title')}</h2>
            <p className="text-slate-400 mb-6 text-center">{t('step1Description')}</p>
            <textarea
                value={rawNames}
                onChange={(e) => setRawNames(e.target.value)}
                placeholder={t('textareaPlaceholder')}
                className="w-full h-64 p-4 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 resize-none"
            />
            <button
                onClick={onProcess}
                disabled={!rawNames.trim()}
                className="mt-6 w-full sm:w-auto bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
                {t('processListButton')}
            </button>
        </div>
    );
};
