import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { MathQuestion } from '../game/systems/questionGenerator';
import type { GameSettings } from '../game/systems/settingsService';

type MathsQuestionModalProps = {
  question: MathQuestion;
  settings: GameSettings;
  onCorrect: () => void;
};

export default function MathsQuestionModal({
  question,
  settings,
  onCorrect,
}: MathsQuestionModalProps) {
  const [attempts, setAttempts] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const showHint =
    attempts > 0 &&
    (settings.hintMode === 'immediate' || attempts >= 2);

  const orderedOptions = useMemo(() => question.options, [question]);

  useEffect(() => {
    setAttempts(0);
    setSelected(null);
    setTimeLeft(20);
  }, [question.id]);

  useEffect(() => {
    if (!settings.timedQuestions || selected === question.answer) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setAttempts((attempt) => attempt + 1);
          setSelected(null);
          return 20;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [question.answer, selected, settings.timedQuestions]);

  function chooseAnswer(value: number): void {
    setSelected(value);

    if (value === question.answer) {
      window.setTimeout(onCorrect, 450);
      return;
    }

    setAttempts((current) => current + 1);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="maths-question-title"
        aria-modal="true"
        className="maths-modal"
        role="dialog"
      >
        <div className="bomb-mark" aria-hidden="true">
          F
        </div>
        <div>
          <p className="eyebrow">Formula Bomb</p>
          <h2 id="maths-question-title">Defuse the lock</h2>
          <p className="question-text">{question.prompt}</p>
          {settings.timedQuestions ? (
            <div className="timer-bar" aria-label={`${timeLeft} seconds left`}>
              <span style={{ width: `${(timeLeft / 20) * 100}%` }} />
            </div>
          ) : null}
        </div>

        <div className="answer-grid">
          {orderedOptions.map((option) => {
            const isPicked = selected === option;
            const isCorrectPick = isPicked && option === question.answer;
            const isWrongPick = isPicked && option !== question.answer;

            return (
              <button
                className="answer-button"
                disabled={isCorrectPick}
                key={option}
                onClick={() => chooseAnswer(option)}
                type="button"
              >
                <span>{option}</span>
                {isCorrectPick ? <CheckCircle2 size={20} /> : null}
                {isWrongPick ? <XCircle size={20} /> : null}
              </button>
            );
          })}
        </div>

        <div className="hint-panel" aria-live="polite">
          {attempts === 0 ? (
            <span>Choose the answer to open the door.</span>
          ) : showHint ? (
            <span>
              Hint: {question.hint} {question.explanation}
            </span>
          ) : (
            <span>Close. Try one more and a hint will appear.</span>
          )}
        </div>
      </section>
    </div>
  );
}
