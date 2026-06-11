import { RotateCcw, Save } from 'lucide-react';
import {
  applyMathSkillPreset,
  type GameSettings,
  type HintMode,
  type MathSkill,
} from '../game/systems/settingsService';

type ParentSettingsProps = {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onResetProgress: () => void;
};

const tableChoices = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const skillChoices: { value: MathSkill; label: string }[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'growing', label: 'Growing' },
  { value: 'confident', label: 'Confident' },
  { value: 'challenge', label: 'Challenge' },
  { value: 'expert', label: 'Expert' },
];

export default function ParentSettings({
  settings,
  onChange,
  onResetProgress,
}: ParentSettingsProps) {
  function update(partial: Partial<GameSettings>): void {
    onChange({ ...settings, ...partial });
  }

  function chooseSkill(mathSkill: MathSkill): void {
    onChange(applyMathSkillPreset(settings, mathSkill));
  }

  function toggleTable(table: number): void {
    const hasTable = settings.timesTables.includes(table);
    const nextTables = hasTable
      ? settings.timesTables.filter((item) => item !== table)
      : [...settings.timesTables, table].sort((a, b) => a - b);

    update({ timesTables: nextTables.length > 0 ? nextTables : [2] });
  }

  return (
    <section className="screen-shell settings-shell">
      <div className="screen-heading">
        <p className="eyebrow">Parent settings</p>
        <h1>Difficulty Controls</h1>
      </div>

      <div className="settings-grid">
        <div className="setting-block">
          <span>Maths skill</span>
          <div className="segmented-list">
            {skillChoices.map((skill) => (
              <button
                aria-pressed={settings.mathSkill === skill.value}
                className="segment-button skill-button"
                key={skill.value}
                onClick={() => chooseSkill(skill.value)}
                type="button"
              >
                {skill.label}
              </button>
            ))}
          </div>
        </div>

        <label className="setting-row">
          <span>Addition max</span>
          <input
            max={100}
            min={10}
            onChange={(event) => update({ additionMax: Number(event.target.value) })}
            step={10}
            type="range"
            value={settings.additionMax}
          />
          <strong>{settings.additionMax}</strong>
        </label>

        <label className="setting-row">
          <span>Subtraction max</span>
          <input
            max={100}
            min={10}
            onChange={(event) =>
              update({ subtractionMax: Number(event.target.value) })
            }
            step={10}
            type="range"
            value={settings.subtractionMax}
          />
          <strong>{settings.subtractionMax}</strong>
        </label>

        <div className="setting-block">
          <span>Times tables</span>
          <div className="segmented-list">
            {tableChoices.map((table) => (
              <button
                aria-pressed={settings.timesTables.includes(table)}
                className="segment-button"
                key={table}
                onClick={() => toggleTable(table)}
                type="button"
              >
                {table}x
              </button>
            ))}
          </div>
        </div>

        <label className="setting-row">
          <span>Questions per level</span>
          <input
            max={3}
            min={1}
            onChange={(event) =>
              update({ questionsPerLevel: Number(event.target.value) })
            }
            type="range"
            value={settings.questionsPerLevel}
          />
          <strong>{settings.questionsPerLevel}</strong>
        </label>

        <label className="setting-row select-row">
          <span>Hint mode</span>
          <select
            onChange={(event) => update({ hintMode: event.target.value as HintMode })}
            value={settings.hintMode}
          >
            <option value="immediate">Immediate hints</option>
            <option value="after-two">Hints after two tries</option>
          </select>
        </label>

        <label className="toggle-row">
          <input
            checked={settings.fractionsEnabled}
            onChange={(event) => update({ fractionsEnabled: event.target.checked })}
            type="checkbox"
          />
          <span>Fractions</span>
        </label>

        <label className="toggle-row">
          <input
            checked={settings.divisionEnabled}
            onChange={(event) => update({ divisionEnabled: event.target.checked })}
            type="checkbox"
          />
          <span>Division</span>
        </label>

        <label className="toggle-row">
          <input
            checked={settings.timeMathEnabled}
            onChange={(event) => update({ timeMathEnabled: event.target.checked })}
            type="checkbox"
          />
          <span>Time maths</span>
        </label>

        <label className="toggle-row">
          <input
            checked={settings.powersEnabled}
            onChange={(event) => update({ powersEnabled: event.target.checked })}
            type="checkbox"
          />
          <span>Squares and cubes</span>
        </label>

        <label className="toggle-row">
          <input
            checked={settings.rootsEnabled}
            onChange={(event) => update({ rootsEnabled: event.target.checked })}
            type="checkbox"
          />
          <span>Roots</span>
        </label>

        <label className="toggle-row">
          <input
            checked={settings.missingNumbersEnabled}
            onChange={(event) =>
              update({ missingNumbersEnabled: event.target.checked })
            }
            type="checkbox"
          />
          <span>Missing numbers</span>
        </label>

        <label className="toggle-row">
          <input
            checked={settings.twoStepEnabled}
            onChange={(event) => update({ twoStepEnabled: event.target.checked })}
            type="checkbox"
          />
          <span>Two-step questions</span>
        </label>

        <label className="toggle-row">
          <input
            checked={settings.timedQuestions}
            onChange={(event) => update({ timedQuestions: event.target.checked })}
            type="checkbox"
          />
          <span>Timed questions</span>
        </label>

        <label className="toggle-row">
          <input
            checked={settings.chaosMode}
            onChange={(event) => update({ chaosMode: event.target.checked })}
            type="checkbox"
          />
          <span>Chaos mode</span>
        </label>
      </div>

      <div className="settings-actions">
        <button className="secondary-button" onClick={onResetProgress} type="button">
          <RotateCcw size={18} />
          Reset progress
        </button>
        <button className="primary-button" type="button">
          <Save size={18} />
          Saved locally
        </button>
      </div>
    </section>
  );
}
