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
  | 'time'
  | 'power'
  | 'root'
  | 'two-step'
  | 'mixed';

export type MathAnswer = number | string;

export type MathQuestion = {
  id: string;
  prompt: string;
  answer: MathAnswer;
  options: MathAnswer[];
  hint: string;
  explanation: string;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(values: T[]): T[] {
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

function makeTextOptions(answer: string, distractors: string[]): string[] {
  const options = new Set<string>([answer]);

  for (const distractor of distractors) {
    options.add(distractor);

    if (options.size >= 4) {
      break;
    }
  }

  while (options.size < 4) {
    options.add(`${randomInt(1, 11)}/${randomInt(2, 12)}`);
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

function gcd(a: number, b: number): number {
  let left = Math.abs(a);
  let right = Math.abs(b);

  while (right !== 0) {
    const next = left % right;
    left = right;
    right = next;
  }

  return left || 1;
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

function simplifyFraction(numerator: number, denominator: number): [number, number] {
  const divisor = gcd(numerator, denominator);
  return [numerator / divisor, denominator / divisor];
}

function formatFraction(numerator: number, denominator: number): string {
  const [simpleNumerator, simpleDenominator] = simplifyFraction(
    numerator,
    denominator,
  );
  return simpleDenominator === 1
    ? `${simpleNumerator}`
    : `${simpleNumerator}/${simpleDenominator}`;
}

function formatClock(totalMinutes: number): string {
  const normalized = ((totalMinutes % 720) + 720) % 720;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const displayHour = hour === 0 ? 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')}`;
}

function describeClock(totalMinutes: number): string {
  const normalized = ((totalMinutes % 720) + 720) % 720;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const displayHour = hour === 0 ? 12 : hour;
  const nextHour = displayHour === 12 ? 1 : displayHour + 1;

  if (minute === 0) {
    return `${displayHour} o'clock`;
  }

  if (minute === 15) {
    return `quarter past ${displayHour}`;
  }

  if (minute === 30) {
    return `half past ${displayHour}`;
  }

  if (minute === 45) {
    return `quarter to ${nextHour}`;
  }

  return formatClock(totalMinutes);
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
  if (mathTier >= 14 && Math.random() > 0.35) {
    const useDifferentDenominators = mathTier >= 28 && Math.random() > 0.45;
    const denominatorChoices = mathTier >= 42 ? [3, 4, 5, 6, 8, 10, 12] : [2, 3, 4, 6, 8];
    const denominatorA =
      denominatorChoices[randomInt(0, denominatorChoices.length - 1)] ?? 4;
    const denominatorB = useDifferentDenominators
      ? denominatorChoices[randomInt(0, denominatorChoices.length - 1)] ?? 6
      : denominatorA;
    const numeratorA = randomInt(1, denominatorA - 1);
    const numeratorB = randomInt(1, denominatorB - 1);
    const subtract = mathTier >= 24 && Math.random() > 0.62;
    const commonDenominator = lcm(denominatorA, denominatorB);
    const scaledA = numeratorA * (commonDenominator / denominatorA);
    const scaledB = numeratorB * (commonDenominator / denominatorB);
    const top = subtract ? Math.max(scaledA, scaledB) : scaledA;
    const bottom = subtract ? Math.min(scaledA, scaledB) : scaledB;
    const answerNumerator = subtract ? top - bottom : top + bottom;
    const answer = formatFraction(answerNumerator, commonDenominator);
    const left = subtract
      ? formatFraction(top, commonDenominator)
      : `${numeratorA}/${denominatorA}`;
    const right = subtract
      ? formatFraction(bottom, commonDenominator)
      : `${numeratorB}/${denominatorB}`;
    const operator = subtract ? '-' : '+';
    const [simpleNumerator, simpleDenominator] = simplifyFraction(
      answerNumerator,
      commonDenominator,
    );
    const distractors = [
      formatFraction(Math.max(1, simpleNumerator + 1), simpleDenominator),
      formatFraction(Math.max(1, simpleNumerator - 1), simpleDenominator),
      formatFraction(answerNumerator, Math.max(2, commonDenominator + 2)),
      formatFraction(answerNumerator + 1, commonDenominator),
      formatFraction(Math.max(1, answerNumerator - 1), commonDenominator),
    ];

    return {
      id: questionId(),
      prompt: `What is ${left} ${operator} ${right}?`,
      answer,
      options: makeTextOptions(answer, distractors),
      hint: `Use a common denominator of ${commonDenominator}.`,
      explanation: `${left} ${operator} ${right} = ${answer}`,
    };
  }

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

function timeMath(mathTier: number): MathQuestion {
  const hour = randomInt(1, 11);
  const minuteChoices = [0, 15, 30, 45];
  const startMinute = minuteChoices[randomInt(0, minuteChoices.length - 1)] ?? 0;
  const start = hour * 60 + startMinute;
  const minuteDeltas =
    mathTier >= 45 ? [15, 30, 45, 60, 75, 90, 120] : [15, 30, 45, 60, 90];
  const delta = minuteDeltas[randomInt(0, minuteDeltas.length - 1)] ?? 30;
  const subtract = mathTier >= 28 && Math.random() > 0.66;
  const answerMinutes = subtract ? start - delta : start + delta;
  const answer = formatClock(answerMinutes);
  const distractors = [
    formatClock(answerMinutes + 15),
    formatClock(answerMinutes - 15),
    formatClock(answerMinutes + 30),
    formatClock(answerMinutes - 30),
    formatClock(answerMinutes + 60),
  ];

  return {
    id: questionId(),
    prompt: `What is ${describeClock(start)} ${
      subtract ? 'minus' : 'plus'
    } ${delta} minutes?`,
    answer,
    options: makeTextOptions(answer, distractors),
    hint: `Move ${delta} minutes ${subtract ? 'back' : 'forward'} from ${formatClock(
      start,
    )}.`,
    explanation: `${formatClock(start)} ${subtract ? '-' : '+'} ${delta} minutes = ${answer}`,
  };
}

function power(mathTier: number): MathQuestion {
  const useCube = mathTier >= 68 && Math.random() > 0.45;
  const base = useCube
    ? randomInt(2, Math.min(10, Math.max(5, Math.floor(mathTier / 9))))
    : randomInt(2, Math.min(15, Math.max(6, Math.floor(mathTier / 5))));
  const answer = useCube ? base * base * base : base * base;

  return {
    id: questionId(),
    prompt: `What is ${base} ${useCube ? 'cubed' : 'squared'}?`,
    answer,
    options: makeOptions(answer),
    hint: useCube
      ? `Multiply ${base} x ${base} x ${base}.`
      : `Multiply ${base} x ${base}.`,
    explanation: useCube
      ? `${base} x ${base} x ${base} = ${answer}`
      : `${base} x ${base} = ${answer}`,
  };
}

function root(mathTier: number): MathQuestion {
  const useCubeRoot = mathTier >= 78 && Math.random() > 0.45;
  const answer = useCubeRoot
    ? randomInt(2, Math.min(10, Math.max(5, Math.floor(mathTier / 9))))
    : randomInt(2, Math.min(15, Math.max(7, Math.floor(mathTier / 5))));
  const radicand = useCubeRoot ? answer * answer * answer : answer * answer;

  return {
    id: questionId(),
    prompt: `What is the ${useCubeRoot ? 'cube' : 'square'} root of ${radicand}?`,
    answer,
    options: makeOptions(answer),
    hint: useCubeRoot
      ? `Find the number that makes ${radicand} when cubed.`
      : `Find the number that makes ${radicand} when squared.`,
    explanation: useCubeRoot
      ? `${answer} cubed = ${radicand}`
      : `${answer} squared = ${radicand}`,
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
  'time',
  'power',
  'root',
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

  if (mode === 'time') {
    return settings.timeMathEnabled;
  }

  if (mode === 'power') {
    return settings.powersEnabled;
  }

  if (mode === 'root') {
    return settings.rootsEnabled;
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

  if (mode === 'time') {
    return timeMath(mathTier);
  }

  if (mode === 'power') {
    return power(mathTier);
  }

  if (mode === 'root') {
    return root(mathTier);
  }

  if (mode === 'two-step') {
    return twoStep(settings, mathTier);
  }

  return addition(settings, mathTier);
}
