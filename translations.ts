


export type Language = 'en' | 'lv' | 'ru';

export type TranslationKey =
  | 'appTitle'
  | 'step1Title'
  | 'step1Description'
  | 'textareaPlaceholder'
  | 'processListButton'
  | 'step2Title'
  | 'step2Description'
  | 'numColorsLabel'
  | 'colors'
  | 'paletteEditorLabel'
  | 'changeColorTitle'
  | 'assignedProgress'
  | 'unassignedListTitle'
  | 'group'
  | 'shareImageButton'
  | 'startOverButton'
  | 'imageError'
  | 'shareTitle'
  | 'shareDialogTitle'
  | 'imageSavedToDownloads'
  | 'installPwaPrompt'
  | 'installButton'
  | 'dismissButton';

type Translations = {
  [lang in Language]: {
    [key in TranslationKey]: string;
  };
};

export const translations: Translations = {
  en: {
    appTitle: 'Team Color Sorter',
    step1Title: 'Step 1: Paste Your List',
    step1Description: 'Paste a list of names copied from WhatsApp or another source. Each name should be on a new line.',
    textareaPlaceholder: 'John Doe\nJane Smith\nPeter Jones...',
    processListButton: 'Process List',
    step2Title: 'Step 2: Assign Colors',
    step2Description: 'Select a color, then click a name from the list on the right to assign it.',
    numColorsLabel: 'Number of Colors',
    colors: 'colors',
    paletteEditorLabel: 'Palette & Editor',
    changeColorTitle: 'Change color',
    assignedProgress: 'Assigned',
    unassignedListTitle: 'Unassigned',
    group: 'Group',
    shareImageButton: 'Share Image',
    startOverButton: 'Start Over',
    imageError: 'Could not generate or share image. Please try again.',
    shareTitle: 'Team Assignments',
    shareDialogTitle: 'Share Teams',
    imageSavedToDownloads: 'Image saved to your Documents folder!',
    installPwaPrompt: 'Get the full app experience!',
    installButton: 'Install',
    dismissButton: 'Later',
  },
  lv: {
    appTitle: 'Komandu Krāsu Šķirotājs',
    step1Title: '1. Solis: Ielīmējiet savu sarakstu',
    step1Description: 'Ielīmējiet vārdu sarakstu, kas nokopēts no WhatsApp vai cita avota. Katram vārdam jābūt jaunā rindā.',
    textareaPlaceholder: 'Jānis Bērziņš\nAnna Liepiņa\nKārlis Ozoliņš...',
    processListButton: 'Apstrādāt sarakstu',
    step2Title: '2. Solis: Piešķiriet krāsas',
    step2Description: 'Izvēlieties krāsu, pēc tam noklikšķiniet uz vārda sarakstā labajā pusē, lai to piešķirtu.',
    numColorsLabel: 'Krāsu skaits',
    colors: 'krāsas',
    paletteEditorLabel: 'Palete un redaktors',
    changeColorTitle: 'Mainīt krāsu',
    assignedProgress: 'Piešķirti',
    unassignedListTitle: 'Nepiešķirti',
    group: 'Grupa',
    shareImageButton: 'Dalīties ar attēlu',
    startOverButton: 'Sākt no jauna',
    imageError: 'Neizdevās izveidot vai nosūtīt attēlu. Lūdzu mēģiniet vēlreiz.',
    shareTitle: 'Komandu sadalījums',
    shareDialogTitle: 'Dalīties ar komandām',
    imageSavedToDownloads: 'Attēls saglabāts jūsu Dokumentu mapē!',
    installPwaPrompt: 'Iegūstiet pilnu lietotnes pieredzi!',
    installButton: 'Instalēt',
    dismissButton: 'Vēlāk',
  },
  ru: {
    appTitle: 'Сортировщик по цветам',
    step1Title: 'Шаг 1: Вставьте ваш список',
    step1Description: 'Вставьте список имен, скопированный из WhatsApp или другого источника. Каждое имя должно быть на новой строке.',
    textareaPlaceholder: 'Иван Иванов\nПетр Петров\nМария Сидорова...',
    processListButton: 'Обработать список',
    step2Title: 'Шаг 2: Распределите цвета',
    step2Description: 'Выберите цвет, а затем имя из списка справа, чтобы присвоить его.',
    numColorsLabel: 'Количество цветов',
    colors: 'цвета',
    paletteEditorLabel: 'Палитра и редактор',
    changeColorTitle: 'Изменить цвет',
    assignedProgress: 'Назначено',
    unassignedListTitle: 'Нераспределенные',
    group: 'Группа',
    shareImageButton: 'Поделиться',
    startOverButton: 'Начать заново',
    imageError: 'Не удалось создать или отправить изображение. Пожалуйста, попробуйте еще раз.',
    shareTitle: 'Распределение по командам',
    shareDialogTitle: 'Поделиться командами',
    imageSavedToDownloads: 'Изображение сохранено в папку "Документы"!',
    installPwaPrompt: 'Установите приложение для лучшего опыта!',
    installButton: 'Установить',
    dismissButton: 'Позже',
  },
};