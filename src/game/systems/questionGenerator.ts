import type { GameSettings } from './settingsService';

export type QuestionMode =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'sequence'
  | 'missing-number'
  | 'geometry'
  | 'fraction'
  | 'two-step'
  | 'mixed';

export type MathQuestion = {
  id: string;
  prompt: string;
  answer: number;
  options: number[];
  hint: string;
  explanation: string;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(values: number[]): number[] {
  return [...values].sort(() => Math.random() - 0.5);
}

function makeOptions(answer: number): number[] {
  const options = new Set<number>([answer]);
  const spread = Math.max(4, Math.ceil(Math.abs(answer) / 3));

  while (options.size < 4) {
    const value = Math.max(0, answer + randomInt(-spread, spread + 3));
    options.add(value);
  }

  return shuffle([...options]);
}

function questionId(): string {
  return `q-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function tierCap(max: number, mathTier: number): number {
  const caps = [12, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const tierMax = caps[Math.max(0, Math.min(caps.length - 1, mathTier - 1))];
  return Math.max(10, Math.min(max, tierMax));
}

function maxMultiplier(mathTier: number): number {
  return Math.max(5, Math.min(12, 4 + mathTier));
}

function getTable(settings: GameSettings): number {
  return settings.timesTables[randomInt(0, settings.timesTables.length - 1)] ?? 2;
}

function addition(settings: GameSettings, mathTier: number): MathQuestion {
  const max = tierCap(settings.additionMax, mathTier);
  const a = randomInt(1, Math.max(2, Math.floor(max / 2)));
  const b = randomInt(1, max - a);
  const answer = a + b;

  return {
    id: questionId(),
    prompt: `You mined ${a} crystals and found ${b} more. How many crystals now?`,
    answer,
    options: makeOptions(answer),
    hint: `Try counting on from ${a}: ${a + 1}, ${a + 2}...`,
    explanation: `${a} + ${b} = ${answer}`,
  };
}

function subtraction(settings: GameSettings, mathTier: number): MathQuestion {
  const max = tierCap(settings.subtractionMax, mathTier);
  const a = randomInt(8, max);
  const b = randomInt(1, Math.min(Math.max(9, mathTier * 2), a - 1));
  const answer = a - b;

  return {
    id: questionId(),
    prompt: `A cave cart had ${a} stones. ${b} rolled away. How many are left?`,
    answer,
    options: makeOptions(answer),
    hint: `Start at ${a} and count back ${b} steps.`,
    explanation: `${a} - ${b} = ${answer}`,
  };
}

function multiplication(settings: GameSettings, mathTier: number): MathQuestion {
  const table = getTable(settings);
  const groups = randomInt(2, maxMultiplier(mathTier));
  const answer = table * groups;

  return {
    id: questionId(),
    prompt: `${groups} crystal stacks have ${table} crystals each. How many crystals?`,
    answer,
    options: makeOptions(answer),
    hint: `Count in ${table}s ${groups} times.`,
    explanation: `${groups} x ${table} = ${answer}`,
  };
}

function division(settings: GameSettings, mathTier: number): MathQuestion {
  const table = getTable(settings);
  const groups = randomInt(2, maxMultiplier(mathTier));
  const total = table * groups;

  return {
    id: questionId(),
    prompt: `${total} crystals are shared into stacks of ${table}. How many stacks?`,
    answer: groups,
    options: makeOptions(groups),
    hint: `Think: ${table} times what number makes ${total}?`,
    explanation: `${total} / ${table} = ${groups}`,
  };
}

function sequence(settings: GameSettings, mathTier: number): MathQuestion {
  const stepChoices = [...settings.timesTables, 2, 3, 4, 5, 10]
    .filter((value, index, values) => values.indexOf(value) === index)
    .filter((value) => value <= Math.max(5, mathTier + 4));
  const step = stepChoices[randomInt(0, stepChoices.length - 1)] ?? 2;
  const start = randomInt(1, Math.max(6, mathTier + 2));
  const values = [start, start + step, start + step * 2, start + step * 3];
  const answer = start + step * 4;

  return {
    id: questionId(),
    prompt: `Sparkstone pattern: ${values.join(', ')}, ?`,
    answer,
    options: makeOptions(answer),
    hint: `The pattern adds ${step} each time.`,
    explanation: `${values[3]} + ${step} = ${answer}`,
  };
}

function missingNumber(settings: GameSettings, mathTier: number): MathQuestion {
  const useMultiplication = mathTier >= 6 && Math.random() > 0.45;

  if (useMultiplication) {
    const answer = getTable(settings);
    const groups = randomInt(2, maxMultiplier(mathTier));
    const total = answer * groups;

    return {
      id: questionId(),
      prompt: `A machine shows ? x ${groups} = ${total}. What number is missing?`,
      answer,
      options: makeOptions(answer),
      hint: `Count in ${groups}s until you reach ${total}.`,
      explanation: `${answer} x ${groups} = ${total}`,
    };
  }

  const max = tierCap(settings.additionMax, mathTier);
  const answer = randomInt(2, Math.max(4, Math.floor(max / 2)));
  const known = randomInt(2, Math.max(4, Math.floor(max / 2)));
  const total = answer + known;

  return {
    id: questionId(),
    prompt: `A door code says ? + ${known} = ${total}. What number is missing?`,
    answer,
    options: makeOptions(answer),
    hint: `Start at ${known} and count up to ${total}.`,
    explanation: `${total} - ${known} = ${answer}`,
  };
}

function geometry(mathTier: number): MathQuestion {
  const width = randomInt(2, Math.min(10, mathTier + 2));
  const height = randomInt(2, Math.min(8, Math.max(3, Math.floor(mathTier / 2) + 2)));
  const answer = width * height;

  return {
    id: questionId(),
    prompt: `A prism wall is ${width} blocks wide and ${height} blocks tall. How many blocks?`,
    answer,
    options: makeOptions(answer),
    hint: `Make ${height} rows of ${width}.`,
    explanation: `${width} x ${height} = ${answer}`,
  };
}

function fraction(mathTier: number): MathQuestion {
  const divisor = mathTier >= 8 && Math.random() > 0.45 ? 4 : 2;
  const answer = randomInt(2, Math.min(12, mathTier + 4));
  const total = answer * divisor;
  const name = divisor === 2 ? 'half' : 'quarter';

  return {
    id: questionId(),
    prompt: `A forge cake has ${total} block slices. What is one ${name} of it?`,
    answer,
    options: makeOptions(answer),
    hint: `Split ${total} into ${divisor} equal groups.`,
    explanation: `${total} / ${divisor} = ${answer}`,
  };
}

function twoStep(settings: GameSettings, mathTier: number): MathQuestion {
  if (Math.random() > 0.5) {
    const table = getTable(settings);
    const groups = randomInt(2, Math.min(8, maxMultiplier(mathTier)));
    const extra = randomInt(2, Math.min(20, mathTier * 3));
    const subtotal = table * groups;
    const answer = subtotal + extra;

    return {
      id: questionId(),
      prompt: `${groups} stacks have ${table} crystals each, then you find ${extra} more. How many crystals?`,
      answer,
      options: makeOptions(answer),
      hint: `First solve ${groups} x ${table}, then add ${extra}.`,
      explanation: `${groups} x ${table} = ${subtotal}; ${subtotal} + ${extra} = ${answer}`,
    };
  }

  const max = tierCap(settings.additionMax, mathTier);
  const first = randomInt(4, Math.max(4, Math.floor(max / 2)));
  const second = randomInt(3, Math.max(3, Math.floor(max / 3)));
  const lost = randomInt(2, Math.min(15, first + second - 2));
  const answer = first + second - lost;

  return {
    id: questionId(),
    prompt: `You collect ${first} sparks, collect ${second} more, then spend ${lost}. How many are left?`,
    answer,
    options: makeOptions(answer),
    hint: `Add the first two numbers, then subtract ${lost}.`,
    explanation: `${first} + ${second} - ${lost} = ${answer}`,
  };
}

const mixedModes: QuestionMode[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'sequence',
  'missing-number',
  'geometry',
  'fraction',
  'two-step',
];

function expandModes(modes: QuestionMode[]): QuestionMode[] {
  return modes.flatMap((mode) => (mode === 'mixed' ? mixedModes : [mode]));
}

function modeAllowed(mode: QuestionMode, settings: GameSettings): boolean {
  if (mode === 'division') {
    return settings.divisionEnabled;
  }

  if (mode === 'missing-number') {
    return settings.missingNumbersEnabled;
  }

  if (mode === 'fraction') {
    return settings.fractionsEnabled;
  }

  if (mode === 'two-step') {
    return settings.twoStepEnabled;
  }

  return true;
}

function getAvailableModes(
  modes: QuestionMode[],
  settings: GameSettings,
): QuestionMode[] {
  const expandedModes = expandModes(modes);
  const availableModes = expandedModes.filter((mode) => modeAllowed(mode, settings));

  if (availableModes.length > 0) {
    return availableModes;
  }

  const fallbackModes = expandedModes.filter((mode) =>
    ['addition', 'subtraction', 'multiplication', 'sequence', 'geometry'].includes(
      mode,
    ),
  );

  return fallbackModes.length > 0 ? fallbackModes : ['addition', 'subtraction'];
}

export function generateQuestion(
  modes: QuestionMode[],
  settings: GameSettings,
  mathTier: number,
): MathQuestion {
  const availableModes = getAvailableModes(modes, settings);
  const mode = availableModes[randomInt(0, availableModes.length - 1)];

  if (mode === 'addition') {
    return addition(settings, mathTier);
  }

  if (mode === 'subtraction') {
    return subtraction(settings, mathTier);
  }

  if (mode === 'multiplication') {
    return multiplication(settings, mathTier);
  }

  if (mode === 'division') {
    return division(settings, mathTier);
  }

  if (mode === 'sequence') {
    return sequence(settings, mathTier);
  }

  if (mode === 'missing-number') {
    return missingNumber(settings, mathTier);
  }

  if (mode === 'geometry') {
    return geometry(mathTier);
  }

  if (mode === 'fraction') {
    return fraction(mathTier);
  }

  if (mode === 'two-step') {
    return twoStep(settings, mathTier);
  }

  return addition(settings, mathTier);
}
