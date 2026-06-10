const PROGRESS_KEY = 'fbomb.progress.v1';

export type ProgressState = {
  completedLevels: string[];
  rewards: string[];
};

export const defaultProgress: ProgressState = {
  completedLevels: [],
  rewards: [],
};

export function loadProgress(): ProgressState {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (!stored) {
      return defaultProgress;
    }

    const parsed = JSON.parse(stored) as Partial<ProgressState>;
    return {
      completedLevels: Array.isArray(parsed.completedLevels)
        ? parsed.completedLevels
        : [],
      rewards: Array.isArray(parsed.rewards) ? parsed.rewards : [],
    };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: ProgressState): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function markLevelComplete(
  progress: ProgressState,
  levelId: string,
  rewardId: string,
): ProgressState {
  const nextProgress = {
    completedLevels: progress.completedLevels.includes(levelId)
      ? progress.completedLevels
      : [...progress.completedLevels, levelId],
    rewards: progress.rewards.includes(rewardId)
      ? progress.rewards
      : [...progress.rewards, rewardId],
  };

  saveProgress(nextProgress);
  return nextProgress;
}

export function resetProgress(): ProgressState {
  saveProgress(defaultProgress);
  return defaultProgress;
}
