export type MathSkill =
  | 'starter'
  | 'growing'
  | 'confident'
  | 'challenge'
  | 'expert';
export type HintMode = 'immediate' | 'after-two';

export type GameSettings = {
  mathSkill: MathSkill;
  additionMax: number;
  subtractionMax: number;
  timesTables: number[];
  fractionsEnabled: boolean;
  divisionEnabled: boolean;
  timeMathEnabled: boolean;
  powersEnabled: boolean;
  rootsEnabled: boolean;
  missingNumbersEnabled: boolean;
  twoStepEnabled: boolean;
  timedQuestions: boolean;
  questionsPerLevel: number;
  hintMode: HintMode;
  chaosMode: boolean;
};

const SETTINGS_KEY = 'fbomb.settings.v1';

type MathSkillPreset = Pick<
  GameSettings,
  | 'additionMax'
  | 'subtractionMax'
  | 'timesTables'
  | 'fractionsEnabled'
  | 'divisionEnabled'
  | 'timeMathEnabled'
  | 'powersEnabled'
  | 'rootsEnabled'
  | 'missingNumbersEnabled'
  | 'twoStepEnabled'
  | 'questionsPerLevel'
>;

export const mathSkillPresets: Record<MathSkill, MathSkillPreset> = {
  starter: {
    additionMax: 20,
    subtractionMax: 20,
    timesTables: [2, 5, 10],
    fractionsEnabled: false,
    divisionEnabled: false,
    timeMathEnabled: false,
    powersEnabled: false,
    rootsEnabled: false,
    missingNumbersEnabled: false,
    twoStepEnabled: false,
    questionsPerLevel: 1,
  },
  growing: {
    additionMax: 50,
    subtractionMax: 50,
    timesTables: [2, 3, 4, 5, 10],
    fractionsEnabled: false,
    divisionEnabled: false,
    timeMathEnabled: true,
    powersEnabled: false,
    rootsEnabled: false,
    missingNumbersEnabled: true,
    twoStepEnabled: false,
    questionsPerLevel: 1,
  },
  confident: {
    additionMax: 100,
    subtractionMax: 100,
    timesTables: [2, 3, 4, 5, 8, 10],
    fractionsEnabled: true,
    divisionEnabled: true,
    timeMathEnabled: true,
    powersEnabled: false,
    rootsEnabled: false,
    missingNumbersEnabled: true,
    twoStepEnabled: false,
    questionsPerLevel: 2,
  },
  challenge: {
    additionMax: 100,
    subtractionMax: 100,
    timesTables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    fractionsEnabled: true,
    divisionEnabled: true,
    timeMathEnabled: true,
    powersEnabled: true,
    rootsEnabled: false,
    missingNumbersEnabled: true,
    twoStepEnabled: true,
    questionsPerLevel: 2,
  },
  expert: {
    additionMax: 100,
    subtractionMax: 100,
    timesTables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    fractionsEnabled: true,
    divisionEnabled: true,
    timeMathEnabled: true,
    powersEnabled: true,
    rootsEnabled: true,
    missingNumbersEnabled: true,
    twoStepEnabled: true,
    questionsPerLevel: 3,
  },
};

export const defaultSettings: GameSettings = {
  mathSkill: 'starter',
  ...mathSkillPresets.starter,
  timedQuestions: false,
  hintMode: 'immediate',
  chaosMode: false,
};

const mathSkills: MathSkill[] = [
  'starter',
  'growing',
  'confident',
  'challenge',
  'expert',
];

function isMathSkill(value: unknown): value is MathSkill {
  return typeof value === 'string' && mathSkills.includes(value as MathSkill);
}

function normalizeTimesTables(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return defaultSettings.timesTables;
  }

  const tables = value
    .filter((item): item is number => Number.isInteger(item) && item >= 1)
    .sort((a, b) => a - b);

  return tables.length > 0 ? tables : defaultSettings.timesTables;
}

export function applyMathSkillPreset(
  current: GameSettings,
  mathSkill: MathSkill,
): GameSettings {
  return {
    ...current,
    mathSkill,
    ...mathSkillPresets[mathSkill],
  };
}

export function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return defaultSettings;
    }

    const parsed = JSON.parse(stored) as Partial<GameSettings>;
    return {
      ...defaultSettings,
      ...parsed,
      mathSkill: isMathSkill(parsed.mathSkill)
        ? parsed.mathSkill
        : defaultSettings.mathSkill,
      timesTables: normalizeTimesTables(parsed.timesTables),
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
