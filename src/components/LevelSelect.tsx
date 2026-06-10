import { Lock, Play, Trophy } from 'lucide-react';
import { isLevelUnlocked, levels } from '../game/systems/levelRegistry';
import type { ProgressState } from '../game/systems/progressService';

type LevelSelectProps = {
  progress: ProgressState;
  onPlay: (levelId: string) => void;
};

export default function LevelSelect({ progress, onPlay }: LevelSelectProps) {
  return (
    <section className="screen-shell">
      <div className="screen-heading">
        <p className="eyebrow">Choose a level</p>
        <h1>Formula Bomb Map</h1>
      </div>

      <div className="level-grid">
        {levels.map((level, index) => {
          const complete = progress.completedLevels.includes(level.id);
          const unlocked = isLevelUnlocked(level.id, progress.completedLevels);

          return (
            <article className="level-card" key={level.id}>
              <div className="level-card-top">
                <span
                  className="level-number"
                  style={{ backgroundColor: level.accent }}
                >
                  {index + 1}
                </span>
                {complete ? <Trophy size={20} /> : null}
                {!unlocked ? <Lock size={20} /> : null}
              </div>
              <h2>{level.title}</h2>
              <p>{level.theme}</p>
              <dl>
                <div>
                  <dt>Move</dt>
                  <dd>{level.mechanic}</dd>
                </div>
                <div>
                  <dt>Maths</dt>
                  <dd>{level.mathFocus}</dd>
                </div>
              </dl>
              <button
                className="primary-button"
                disabled={!unlocked}
                onClick={() => onPlay(level.id)}
                type="button"
              >
                <Play size={18} />
                {complete ? 'Replay' : unlocked ? 'Play' : 'Locked'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
