
(function () {
    'use strict';

    const { useState, useMemo, useCallback, useRef, createContext, useContext } = React;

    const PALETTES = {
        2: ['#3b82f6', '#f43f5e'], 
        4: ['#3b82f6', '#22c55e', '#eab308', '#ef4444'], 
    };

    const translations = {
      en: { appTitle: 'Team Color Sorter', step1Title: 'Step 1: Paste Your List', step1Description: 'Paste a list of names copied from WhatsApp or another source. Each name should be on a new line.', textareaPlaceholder: 'John Doe\nJane Smith\nPeter Jones...', processListButton: 'Process List', step2Title: 'Step 2: Assign Colors', step2Description: 'Select a color, then click a name from the list on the right to assign it.', numColorsLabel: 'Number of Colors', colors: 'colors', paletteEditorLabel: 'Palette & Editor', changeColorTitle: 'Change color', assignedProgress: 'Assigned', unassignedListTitle: 'Unassigned', group: 'Group', createImageButton: 'Create Image', startOverButton: 'Start Over', imageError: 'Could not generate image. Please try again.', },
      lv: { appTitle: 'Komandu Krāsu Šķirotājs', step1Title: '1. Solis: Ielīmējiet savu sarakstu', step1Description: 'Ielīmējiet vārdu sarakstu, kas nokopēts no WhatsApp vai cita avota. Katram vārdam jābūt jaunā rindā.', textareaPlaceholder: 'Jānis Bērziņš\nAnna Liepiņa\nKārlis Ozoliņš...', processListButton: 'Apstrādāt sarakstu', step2Title: '2. Solis: Piešķiriet krāsas', step2Description: 'Izvēlieties krāsu, pēc tam noklikšķiniet uz vārda sarakstā labajā pusē, lai to piešķirtu.', numColorsLabel: 'Krāsu skaits', colors: 'krāsas', paletteEditorLabel: 'Palete un redaktors', changeColorTitle: 'Mainīt krāsu', assignedProgress: 'Piešķirti', unassignedListTitle: 'Nepiešķirti', group: 'Grupa', createImageButton: 'Izveidot attēlu', startOverButton: 'Sākt no jauna', imageError: 'Neizdevās izveidot attēlu. Lūdzu mēģiniet vēlreiz.', },
      ru: { appTitle: 'Сортировщик по цветам', step1Title: 'Шаг 1: Вставьте ваш список', step1Description: 'Вставьте список имен, скопированный из WhatsApp или другого источника. Каждое имя должно быть на новой строке.', textareaPlaceholder: 'Иван Иванов\nПетр Петров\nМария Сидорова...', processListButton: 'Обработать список', step2Title: 'Шаг 2: Распределите цвета', step2Description: 'Выберите цвет, а затем имя из списка справа, чтобы присвоить его.', numColorsLabel: 'Количество цветов', colors: 'цвета', paletteEditorLabel: 'Палитра и редактор', changeColorTitle: 'Изменить цвет', assignedProgress: 'Назначено', unassignedListTitle: 'Нераспределенные', group: 'Группа', createImageButton: 'Создать картинку', startOverButton: 'Начать заново', imageError: 'Не удалось создать изображение. Пожалуйста, попробуйте еще раз.', },
    };

    const LanguageContext = createContext(undefined);
    const LanguageProvider = ({ children }) => {
        const [language, setLanguage] = useState('ru');
        const t = useCallback((key) => {
            return translations[language][key] || translations['en'][key];
        }, [language]);
        const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);
        return React.createElement(LanguageContext.Provider, { value }, children);
    };
    const useLanguage = () => {
        const context = useContext(LanguageContext);
        if (context === undefined) {
            throw new Error('useLanguage must be used within a LanguageProvider');
        }
        return context;
    };

    const NameInputStep = ({ rawNames, setRawNames, onProcess }) => {
        const { t } = useLanguage();
        return React.createElement("div", { className: "bg-slate-800 p-8 rounded-xl shadow-2xl flex flex-col items-center" },
            React.createElement("h2", { className: "text-2xl font-bold text-slate-200 mb-4" }, t('step1Title')),
            React.createElement("p", { className: "text-slate-400 mb-6 text-center" }, t('step1Description')),
            React.createElement("textarea", { value: rawNames, onChange: (e) => setRawNames(e.target.value), placeholder: t('textareaPlaceholder'), className: "w-full h-64 p-4 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 resize-none" }),
            React.createElement("button", { onClick: onProcess, disabled: !rawNames.trim(), className: "mt-6 w-full sm:w-auto bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100 shadow-lg" }, t('processListButton'))
        );
    };

    const PaletteButton = ({ size, active, onClick, children }) => (
        React.createElement("button", { onClick: onClick, className: `px-4 py-2 text-sm font-semibold rounded-md transition ${active ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}` }, children)
    );
    const ColorSwatch = ({ color, isSelected, onClick }) => (
        React.createElement("button", { onClick: onClick, className: `w-12 h-12 rounded-full transition-transform duration-200 transform hover:scale-110 shadow-md border-4 ${isSelected ? 'border-sky-400 scale-110' : 'border-transparent'}`, style: { backgroundColor: color }, "aria-label": `Select color ${color}` })
    );
    const AssignmentStep = ({ paletteSize, onPaletteSizeChange, currentPalette, onPaletteColorChange, selectedColor, onSelectColor, assignedCount, totalCount }) => {
        const { t } = useLanguage();
        return React.createElement("div", { className: "bg-slate-800 rounded-xl p-6 shadow-2xl flex flex-col justify-between h-full" },
            React.createElement("div", null,
                React.createElement("h3", { className: "text-2xl font-semibold mb-2 text-slate-300" }, t('step2Title')),
                React.createElement("p", { className: "text-slate-400 mb-6" }, t('step2Description')),
                React.createElement("div", { className: "mb-6" },
                    React.createElement("label", { className: "block text-sm font-medium text-slate-400 mb-2" }, t('numColorsLabel')),
                    React.createElement("div", { className: "flex space-x-2" },
                        React.createElement(PaletteButton, { size: 2, active: paletteSize === 2, onClick: () => onPaletteSizeChange(2) }, "2 ", t('colors')),
                        React.createElement(PaletteButton, { size: 4, active: paletteSize === 4, onClick: () => onPaletteSizeChange(4) }, "4 ", t('colors'))
                    )
                ),
                React.createElement("div", { className: "mb-6" },
                    React.createElement("label", { className: "block text-sm font-medium text-slate-400 mb-2" }, t('paletteEditorLabel')),
                    React.createElement("div", { className: "flex flex-wrap gap-4" },
                        currentPalette.map((color, index) => (
                            React.createElement("div", { key: index, className: "flex flex-col items-center gap-2 p-2 rounded-lg bg-slate-900/50" },
                                React.createElement(ColorSwatch, { color: color, isSelected: selectedColor === color, onClick: () => onSelectColor(color) }),
                                React.createElement("input", { type: "color", value: color, onChange: (e) => onPaletteColorChange(index, e.target.value), className: "w-10 h-10 p-0 border-none cursor-pointer bg-transparent", title: t('changeColorTitle') })
                            )
                        ))
                    )
                ),
                React.createElement("div", { className: "bg-slate-700/50 rounded-lg p-4 mt-auto" },
                    React.createElement("p", { className: "text-center text-slate-300 font-medium" },
                        t('assignedProgress'), ": ", React.createElement("span", { className: "text-sky-400 font-bold text-lg" }, assignedCount), " / ", React.createElement("span", { className: "font-bold text-lg" }, totalCount)
                    ),
                    React.createElement("div", { className: "w-full bg-slate-600 rounded-full h-2.5 mt-2" },
                        React.createElement("div", { className: "bg-sky-500 h-2.5 rounded-full transition-all duration-500", style: { width: `${totalCount > 0 ? (assignedCount / totalCount) * 100 : 0}%` } })
                    )
                )
            )
        );
    };

    const getTextColorForBg = (hexColor) => {
        if (!hexColor) return '#f1f5f9';
        const cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
        const fullHex = cleanHex.length === 3 ? cleanHex.split('').map(char => char + char).join('') : cleanHex;
        if (fullHex.length !== 6) return '#f1f5f9';
        const r = parseInt(fullHex.substring(0, 2), 16);
        const g = parseInt(fullHex.substring(2, 4), 16);
        const b = parseInt(fullHex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.6 ? '#1e293b' : '#f1f5f9';
    };

    const App = () => {
        const { language, setLanguage, t } = useLanguage();
        const [rawNames, setRawNames] = useState('');
        const [people, setPeople] = useState([]);
        const [paletteSize, setPaletteSize] = useState(4);
        const [currentPalette, setCurrentPalette] = useState(PALETTES[4]);
        const [selectedColor, setSelectedColor] = useState(PALETTES[4][0]);
        const [step, setStep] = useState('input');
        const resultsRef = useRef(null);

        const handleProcessNames = useCallback(() => {
            const names = rawNames.split('\n').map(name => name.trim()).filter(Boolean);
            const peopleData = names.map((name, index) => ({ id: index, name, color: null }));
            setPeople(peopleData);
            setStep('assign');
        }, [rawNames]);

        const handlePaletteSizeChange = useCallback((size) => {
            setPaletteSize(size);
            const newPalette = PALETTES[size];
            setCurrentPalette(newPalette);
            setSelectedColor(newPalette[0]);
            setPeople(prev => prev.map(p => ({
                ...p,
                color: p.color && newPalette.includes(p.color) ? p.color : null,
            })));
        }, []);

        const handlePaletteColorChange = useCallback((index, newColor) => {
            setCurrentPalette(prev => {
                const newPalette = [...prev];
                const oldColor = newPalette[index];
                newPalette[index] = newColor;
                setPeople(p => p.map(person => person.color === oldColor ? { ...person, color: newColor } : person));
                if (selectedColor === oldColor) {
                    setSelectedColor(newColor);
                }
                return newPalette;
            });
        }, [selectedColor]);

        const handleAssignColor = useCallback((personId) => {
            setPeople(prev => prev.map(p => {
                if (p.id === personId) {
                    return { ...p, color: p.color !== null ? null : selectedColor };
                }
                return p;
            }));
        }, [selectedColor]);

        const handleReset = useCallback(() => {
            setRawNames('');
            setPeople([]);
            setStep('input');
            setPaletteSize(4);
            const initialPalette = PALETTES[4];
            setCurrentPalette(initialPalette);
            setSelectedColor(initialPalette[0]);
        }, []);

        const handleCreateImage = useCallback(() => {
            if (resultsRef.current === null) return;
            htmlToImage.toPng(resultsRef.current, { cacheBust: true, backgroundColor: '#1e293b' })
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = 'team-assignments.png';
                    link.href = dataUrl;
                    link.click();
                })
                .catch((err) => {
                    console.error(err);
                    alert(t('imageError'));
                });
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
        const languageOptions = [{ code: 'en', name: 'English' }, { code: 'lv', name: 'Latviešu' }, { code: 'ru', name: 'Русский' }];

        return React.createElement("div", { className: "min-h-screen flex flex-col p-4 sm:p-8" },
            React.createElement("header", { className: "w-full max-w-7xl mx-auto flex justify-between items-center mb-8" },
                React.createElement("h1", { className: "text-2xl sm:text-3xl font-bold text-slate-200" }, t('appTitle')),
                React.createElement("div", { className: "flex items-center space-x-2" },
                    languageOptions.map(({ code, name }) => (
                        React.createElement("button", { key: code, onClick: () => setLanguage(code), className: `px-3 py-1 text-sm font-semibold rounded-md transition ${language === code ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}` }, name)
                    ))
                )
            ),
            React.createElement("main", { className: "flex-grow w-full max-w-7xl mx-auto" },
                step === 'input' ?
                    React.createElement(NameInputStep, { rawNames: rawNames, setRawNames: setRawNames, onProcess: handleProcessNames }) :
                    React.createElement("div", { className: "flex flex-col xl:flex-row gap-8" },
                        React.createElement("div", { className: "w-full xl:w-1/3" }, React.createElement(AssignmentStep, { paletteSize: paletteSize, onPaletteSizeChange: handlePaletteSizeChange, currentPalette: currentPalette, onPaletteColorChange: handlePaletteColorChange, selectedColor: selectedColor, onSelectColor: setSelectedColor, assignedCount: assignedCount, totalCount: people.length })),
                        React.createElement("div", { className: "w-full xl:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 items-start" },
                            React.createElement("div", { className: "bg-slate-800 rounded-xl p-6 shadow-2xl" },
                                React.createElement("h3", { className: "text-xl font-semibold mb-4 text-slate-300" }, `${t('unassignedListTitle')} (${unassigned.length})`),
                                React.createElement("ul", { className: "space-y-2" },
                                    unassigned.map(person => (
                                        React.createElement("li", { key: person.id }, React.createElement("button", { onClick: () => handleAssignColor(person.id), className: "w-full text-left p-3 rounded-md bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 transition" }, person.name))
                                    ))
                                )
                            ),
                            React.createElement("div", { className: "md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6", ref: resultsRef },
                                assigned.map(({ color, people: groupPeople }, groupIndex) => (
                                    React.createElement("div", { key: groupIndex, style: { backgroundColor: color }, className: "rounded-xl p-6 shadow-2xl" },
                                        React.createElement("ul", { className: "space-y-2" },
                                            groupPeople.map((person, personIndex) => (
                                                React.createElement("li", { key: person.id, onClick: () => handleAssignColor(person.id), className: "cursor-pointer font-semibold", style: { color: getTextColorForBg(color) } }, `${personIndex + 1}. ${person.name}`)
                                            ))
                                        )
                                    )
                                ))
                            )
                        )
                    )
            ),
            step === 'assign' && React.createElement("footer", { className: "w-full max-w-7xl mx-auto mt-8 flex flex-col sm:flex-row justify-center items-center gap-4" },
                React.createElement("button", { onClick: handleCreateImage, className: "w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg" }, t('createImageButton')),
                React.createElement("button", { onClick: handleReset, className: "w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg" }, t('startOverButton'))
            )
        );
    };

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => console.log('ServiceWorker registration successful with scope: ', registration.scope))
          .catch(error => console.log('ServiceWorker registration failed: ', error));
      });
    }

    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Could not find root element to mount to");
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(React.StrictMode, null, 
        React.createElement(LanguageProvider, null, 
          React.createElement(App, null)
        )
      )
    );

}());
