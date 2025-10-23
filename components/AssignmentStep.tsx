


import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MIN_TEAMS, MAX_TEAMS } from '../constants';

interface AssignmentStepProps {
    numTeams: number;
    onNumTeamsChange: (size: number) => void;
    currentPalette: string[];
    onPaletteColorChange: (index: number, newColor: string) => void;
    selectedColor: string;
    onSelectColor: (color: string) => void;
    assignedCount: number;
    totalCount: number;
    onAutoAssign: () => void;
}

const NumberControl: React.FC<{ value: number; onChange: (newValue: number) => void; min: number; max: number; }> = ({ value, onChange, min, max }) => {
    const { t } = useLanguage();
    return (
        <div className="flex items-center gap-2 bg-slate-700 rounded-md p-1">
            <button
                onClick={() => onChange(value - 1)}
                disabled={value <= min}
                className="w-12 h-10 flex items-center justify-center text-2xl font-bold rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Decrease number of teams"
            >-</button>
            <span className="font-bold text-xl text-white w-12 text-center">{value} {t('colors')}</span>
            <button
                onClick={() => onChange(value + 1)}
                disabled={value >= max}
                className="w-12 h-10 flex items-center justify-center text-2xl font-bold rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Increase number of teams"
            >+</button>
        </div>
    );
};


const ColorSwatch: React.FC<{ color: string; isSelected: boolean; onClick: () => void; }> = ({ color, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-12 h-12 rounded-full transition-transform duration-200 transform hover:scale-110 shadow-md border-4 ${
            isSelected ? 'border-sky-400 scale-110' : 'border-transparent'
        }`}
        style={{ backgroundColor: color }}
        aria-label={`Select color ${color}`}
    />
);

export const AssignmentStep: React.FC<AssignmentStepProps> = ({
    numTeams,
    onNumTeamsChange,
    currentPalette,
    onPaletteColorChange,
    selectedColor,
    onSelectColor,
    assignedCount,
    totalCount,
    onAutoAssign,
}) => {
    const { t } = useLanguage();

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl flex flex-col justify-between h-full">
            <div>
                <h3 className="text-2xl font-semibold mb-2 text-slate-300">{t('step2Title')}</h3>
                <p className="text-slate-400 mb-6">{t('step2Description')}</p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">{t('numColorsLabel')}</label>
                     <NumberControl value={numTeams} onChange={onNumTeamsChange} min={MIN_TEAMS} max={MAX_TEAMS} />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">{t('paletteEditorLabel')}</label>
                    <div className="flex flex-wrap gap-4">
                         {currentPalette.map((color, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 p-2 rounded-lg bg-slate-900/50">
                                <ColorSwatch
                                    color={color}
                                    isSelected={selectedColor === color}
                                    onClick={() => onSelectColor(color)}
                                />
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => onPaletteColorChange(index, e.target.value)}
                                    className="w-10 h-10 p-0 border-none cursor-pointer bg-transparent"
                                    title={t('changeColorTitle')}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="my-6">
                    <button
                        onClick={onAutoAssign}
                        title={t('autoAssignTooltip')}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                        aria-label={t('autoAssignButton')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM1 15a1 1 0 100 2h18a1 1 0 100-2H1z" />
                        </svg>
                        {t('autoAssignButton')}
                    </button>
                </div>


                <div className="bg-slate-700/50 rounded-lg p-4 mt-auto">
                    <p className="text-center text-slate-300 font-medium">
                        {t('assignedProgress')}: <span className="text-sky-400 font-bold text-lg">{assignedCount}</span> / <span className="font-bold text-lg">{totalCount}</span>
                    </p>
                    <div className="w-full bg-slate-600 rounded-full h-2.5 mt-2">
                        <div
                            className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${totalCount > 0 ? (assignedCount / totalCount) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};