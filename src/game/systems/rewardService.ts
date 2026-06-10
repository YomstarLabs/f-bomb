import { levels } from './levelRegistry';

export type Reward = {
  id: string;
  label: string;
  color: string;
};

export function getRewardForLevel(levelId: string): Reward {
  const level = levels.find((item) => item.id === levelId);
  return (
    level?.reward ?? {
      id: 'practice-star',
      label: 'Practice star',
      color: '#f7c948',
    }
  );
}
