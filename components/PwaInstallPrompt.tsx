import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Define the interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallPrompt: React.FC = () => {
    const { t } = useLanguage();
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e as BeforeInstallPromptEvent);
            // Show the install prompt only if it hasn't been dismissed before
            if (!localStorage.getItem('pwaInstallDismissed')) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const handleAppInstalled = () => {
            // Hide the prompt if the app is successfully installed
            setIsVisible(false);
            setInstallPromptEvent(null);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPromptEvent) {
            return;
        }
        // Show the browser's install prompt
        await installPromptEvent.prompt();
        // We no longer need the event
        setInstallPromptEvent(null);
        setIsVisible(false);
    };

    const handleDismissClick = () => {
        // Remember the user's choice
        localStorage.setItem('pwaInstallDismissed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm p-4 z-50 flex items-center justify-center gap-2 sm:gap-4 animate-fade-in-up">
            <p className="text-slate-200 text-sm sm:text-base">{t('installPwaPrompt')}</p>
            <button
                onClick={handleInstallClick}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition"
            >
                {t('installButton')}
            </button>
            <button
                onClick={handleDismissClick}
                className="text-slate-400 hover:text-slate-200 font-semibold py-2 px-4 rounded-lg"
                aria-label={t('dismissButton')}
            >
                {t('dismissButton')}
            </button>
        </div>
    );
};
