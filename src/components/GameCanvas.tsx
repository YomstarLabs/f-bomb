import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import { createFbombGame } from '../game/FbombGame';
import { GameEvents, type LevelCompletePayload, type MathsRequestPayload } from '../game/events';
import type { GameSettings } from '../game/systems/settingsService';
import TouchControls from './TouchControls';

type GameCanvasProps = {
  levelId: string;
  settings: GameSettings;
  onQuestionRequested: (payload: MathsRequestPayload) => void;
  onLevelComplete: (payload: LevelCompletePayload) => void;
};

export default function GameCanvas({
  levelId,
  settings,
  onQuestionRequested,
  onLevelComplete,
}: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    GameEvents.on('maths:request', onQuestionRequested);
    GameEvents.on('level:complete', onLevelComplete);

    return () => {
      GameEvents.off('maths:request', onQuestionRequested);
      GameEvents.off('level:complete', onLevelComplete);
    };
  }, [onLevelComplete, onQuestionRequested]);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    gameRef.current = createFbombGame(hostRef.current, { levelId, settings });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [levelId, settings]);

  return (
    <div className="game-canvas" ref={hostRef}>
      <div className="orientation-prompt" role="status">
        <span className="brand-mark" aria-hidden="true">
          F
        </span>
        <div>
          <h2>Turn your phone sideways</h2>
          <p>
            Formula Bomb plays in landscape on phones so the full game area and
            controls fit.
          </p>
        </div>
      </div>
      <TouchControls />
    </div>
  );
}
