import { ArrowRight, Home, Map } from 'lucide-react';
import type { Reward } from '../game/systems/rewardService';

type RewardScreenProps = {
  reward: Reward;
  nextLevelId: string | null;
  onMenu: () => void;
  onMap: () => void;
  onNext: () => void;
};

export default function RewardScreen({
  reward,
  nextLevelId,
  onMenu,
  onMap,
  onNext,
}: RewardScreenProps) {
  return (
    <section className="screen-shell reward-shell">
      <p className="eyebrow">Level complete</p>
      <div className="reward-token" style={{ backgroundColor: reward.color }}>
        {reward.label.slice(0, 1)}
      </div>
      <h1>{reward.label}</h1>
      <p className="reward-copy">The Formula Bomb is safe and the exit is open.</p>
      <div className="reward-actions">
        <button className="secondary-button" onClick={onMenu} type="button">
          <Home size={18} />
          Menu
        </button>
        <button className="secondary-button" onClick={onMap} type="button">
          <Map size={18} />
          Map
        </button>
        {nextLevelId ? (
          <button className="primary-button" onClick={onNext} type="button">
            <ArrowRight size={18} />
            Next level
          </button>
        ) : null}
      </div>
    </section>
  );
}
