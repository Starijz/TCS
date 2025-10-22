
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface AssignmentStepProps {
    paletteSize: 2 | 4;
    onPaletteSizeChange: (size: 2 | 4) => void;
    currentPalette: string[];
    onPaletteColorChange: (index: number, newColor: string) => void;
    selectedColor: string;
    onSelectColor: (color: string) => void;
    assignedCount: number;
    totalCount: number;
}

const PaletteButton: React.FC<{ size: 2 | 4; active: boolean; onClick: () => void; children: React.ReactNode }> = ({ size, active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
            active ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
        }`}
    >
        {children}
    </button>
);

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
    paletteSize,
    onPaletteSizeChange,
    currentPalette,
    onPaletteColorChange,
    selectedColor,
    onSelectColor,
    assignedCount,
    totalCount,
}) => {
    const { t } = useLanguage();

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl flex flex-col justify-between h-full">
            <div>
                <h3 className="text-2xl font-semibold mb-2 text-slate-300">{t('step2Title')}</h3>
                <p className="text-slate-400 mb-6">{t('step2Description')}</p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-2">{t('numColorsLabel')}</label>
                    <div className="flex space-x-2">
                        <PaletteButton size={2} active={paletteSize === 2} onClick={() => onPaletteSizeChange(2)}>
                            2 {t('colors')}
                        </PaletteButton>
                        <PaletteButton size={4} active={paletteSize === 4} onClick={() => onPaletteSizeChange(4)}>
                            4 {t('colors')}
                        </PaletteButton>
                    </div>
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
