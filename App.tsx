




import React, { useState, useMemo, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import type { Person } from './types';
import { PREDEFINED_PALETTE, MIN_TEAMS, MAX_TEAMS } from './constants';
import { NameInputStep } from './components/NameInputStep';
import { AssignmentStep } from './components/AssignmentStep';
import { useLanguage } from './contexts/LanguageContext';
import type { Language } from './translations';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

// Helper to determine the best text color (light/dark) for a given background color
const getTextColorForBg = (hexColor: string | null): string => {
    if (!hexColor) return '#f1f5f9'; // Default: slate-100

    const cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    const fullHex = cleanHex.length === 3 
        ? cleanHex.split('').map(char => char + char).join('') 
        : cleanHex;

    if (fullHex.length !== 6) return '#f1f5f9';

    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return dark text for light colors, light text for dark colors
    return luminance > 0.6 ? '#1e293b' : '#f1f5f9'; // slate-800 or slate-100
};

const App: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const [rawNames, setRawNames] = useState<string>('');
    const [people, setPeople] = useState<Person[]>([]);
    const [numTeams, setNumTeams] = useState<number>(2);
    const [currentPalette, setCurrentPalette] = useState<string[]>(PREDEFINED_PALETTE.slice(0, 2));
    const [selectedColor, setSelectedColor] = useState<string>(PREDEFINED_PALETTE[0]);
    const [step, setStep] = useState<'input' | 'assign'>('input');
    const resultsRef = useRef<HTMLDivElement>(null);

    const handleProcessNames = useCallback(() => {
        const names = rawNames.split('\n').map(name => name.trim()).filter(Boolean);
        const peopleData = names.map((name, index) => ({ id: index, name, color: null }));
        setPeople(peopleData);
        setStep('assign');
    }, [rawNames]);

    const handleNumTeamsChange = useCallback((newSize: number) => {
        if (newSize < MIN_TEAMS || newSize > MAX_TEAMS) return;

        setNumTeams(newSize);
        const newPalette = PREDEFINED_PALETTE.slice(0, newSize);
        setCurrentPalette(newPalette);
        
        // If the currently selected color is not in the new palette, select the first one.
        if (!newPalette.includes(selectedColor)) {
            setSelectedColor(newPalette[0]);
        }


        // Unassign colors that are no longer in the palette
        setPeople(prev => prev.map(p => ({
            ...p,
            color: p.color && newPalette.includes(p.color) ? p.color : null,
        })));
    }, [selectedColor]);

    const handlePaletteColorChange = useCallback((index: number, newColor: string) => {
        setCurrentPalette(prev => {
            const newPalette = [...prev];
            const oldColor = newPalette[index];
            newPalette[index] = newColor;

            // Update people with the new color
            setPeople(p => p.map(person => person.color === oldColor ? { ...person, color: newColor } : person));
            
            // Update selected color if it was the one changed
            if (selectedColor === oldColor) {
                setSelectedColor(newColor);
            }

            return newPalette;
        });
    }, [selectedColor]);

    const handleAssignColor = useCallback((personId: number) => {
        setPeople(prev => prev.map(p => {
            if (p.id === personId) {
                // If the person is already assigned to ANY color, unassign them.
                // Otherwise, assign them the currently selected color.
                return { ...p, color: p.color !== null ? null : selectedColor };
            }
            return p;
        }));
    }, [selectedColor]);

    const handleAutoAssign = useCallback(() => {
        setPeople(prevPeople => {
            const unassigned = prevPeople.filter(p => !p.color);
            const assigned = prevPeople.filter(p => p.color);
    
            if (unassigned.length === 0) return prevPeople;
    
            // Fisher-Yates shuffle
            const shuffled = [...unassigned];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
    
            const newAssignments = shuffled.map((person, index) => {
                return { ...person, color: currentPalette[index % numTeams] };
            });
    
            return [...assigned, ...newAssignments].sort((a, b) => a.id - b.id);
        });
    }, [currentPalette, numTeams]);

    const handleReset = useCallback(() => {
        setRawNames('');
        setPeople([]);
        setStep('input');
        setNumTeams(2);
        const initialPalette = PREDEFINED_PALETTE.slice(0, 2);
        setCurrentPalette(initialPalette);
        setSelectedColor(initialPalette[0]);
    }, []);

    const handleCreateImage = useCallback(async () => {
        if (resultsRef.current === null) {
            return;
        }

        try {
            const dataUrl = await toPng(resultsRef.current, { 
                cacheBust: true, 
                backgroundColor: '#1e293b',
                pixelRatio: 1,
                quality: 0.95
            });
            
            if (Capacitor.isNativePlatform()) {
                await Filesystem.writeFile({
                    path: `team-assignments-${Date.now()}.png`,
                    data: dataUrl,
                    // Fix: Changed Directory.Downloads to Directory.Documents as Downloads is not a valid enum member.
                    directory: Directory.Documents,
                });
                alert(t('imageSavedToDownloads'));
            } else {
                const link = document.createElement('a');
                link.download = 'team-assignments.png';
                link.href = dataUrl;
                link.click();
            }

        } catch (err) {
            console.error(err);
            // A generic error is shown if either image generation or saving fails.
            alert(t('imageError'));
        }
    }, [resultsRef, t]);

    const { unassigned, assigned } = useMemo(() => {
        const unassigned = people.filter(p => !p.color);
        const assigned = currentPalette.map(color => ({
            color,
            people: people.filter(p => p.color === color)
        }));
        return { unassigned, assigned };
    }, [people, currentPalette]);

    const assignedCount = useMemo(() => people.filter(p => p.color).length, [people]);

    const languageOptions: { code: Language; name: string }[] = [
        { code: 'en', name: 'English' },
        { code: 'lv', name: 'Latviešu' },
        { code: 'ru', name: 'Русский' },
    ];

    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-8">
             <header className="w-full max-w-7xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-200">{t('appTitle')}</h1>
                <div className="flex items-center space-x-2">
                    {languageOptions.map(({ code, name }) => (
                         <button
                            key={code}
                            onClick={() => setLanguage(code)}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition ${
                                language === code ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-grow w-full max-w-7xl mx-auto">
                {step === 'input' ? (
                    <NameInputStep
                        rawNames={rawNames}
                        setRawNames={setRawNames}
                        onProcess={handleProcessNames}
                    />
                ) : (
                    <div className="flex flex-col xl:flex-row gap-8">
                        {/* Left Column: Controls */}
                        <div className="w-full xl:w-1/3">
                            <AssignmentStep
                                numTeams={numTeams}
                                onNumTeamsChange={handleNumTeamsChange}
                                currentPalette={currentPalette}
                                onPaletteColorChange={handlePaletteColorChange}
                                selectedColor={selectedColor}
                                onSelectColor={setSelectedColor}
                                assignedCount={assignedCount}
                                totalCount={people.length}
                                onAutoAssign={handleAutoAssign}
                            />
                        </div>

                        {/* Right Column: Lists */}
                        <div className="w-full xl:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Unassigned List */}
                            <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
                                <h3 className="text-xl font-semibold mb-4 text-slate-300">{t('unassignedListTitle')} ({unassigned.length})</h3>
                                <ul className="space-y-2">
                                    {unassigned.map(person => (
                                        <li key={person.id}>
                                            <button
                                                onClick={() => handleAssignColor(person.id)}
                                                className="w-full text-left p-3 rounded-md bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                                            >
                                                {person.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Assigned Lists Container */}
                            <div className="md:col-span-2 grid gap-6" ref={resultsRef} style={{gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`}}>
                                {assigned.map(({ color, people: groupPeople }, groupIndex) => (
                                    <div key={groupIndex} style={{ backgroundColor: color }} className="rounded-xl p-6 shadow-2xl">
                                        <ul className="space-y-2">
                                            {groupPeople.map((person, personIndex) => (
                                                <li
                                                    key={person.id}
                                                    onClick={() => handleAssignColor(person.id)}
                                                    className="cursor-pointer font-semibold"
                                                    style={{ color: getTextColorForBg(color) }}
                                                >
                                                    {personIndex + 1}. {person.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            {step === 'assign' && (
                <footer className="w-full max-w-7xl mx-auto mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                     <button
                        onClick={handleCreateImage}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        {t('shareImageButton')}
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        {t('startOverButton')}
                    </button>
                </footer>
            )}
            <PwaInstallPrompt />
        </div>
    );
};

export default App;