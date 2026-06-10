import { Home, Map, Play, Settings } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import GameCanvas from './components/GameCanvas';
import LevelSelect from './components/LevelSelect';
import MathsQuestionModal from './components/MathsQuestionModal';
import ParentSettings from './components/ParentSettings';
import RewardScreen from './components/RewardScreen';
import TouchControls from './components/TouchControls';
import { GameEvents, type LevelCompletePayload, type MathsRequestPayload } from './game/events';
import { getLevel, getNextLevelId, levels } from './game/systems/levelRegistry';
import {
  loadProgress,
  markLevelComplete,
  resetProgress,
  type ProgressState,
} from './game/systems/progressService';
import { getRewardForLevel, type Reward } from './game/systems/rewardService';
import {
  loadSettings,
  saveSettings,
  type GameSettings,
} from './game/systems/settingsService';

type Screen = 'menu' | 'levels' | 'settings' | 'game' | 'reward';

type RewardState = {
  levelId: string;
  reward: Reward;
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [selectedLevelId, setSelectedLevelId] = useState(levels[0].id);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [mathsRequest, setMathsRequest] = useState<MathsRequestPayload | null>(
    null,
  );
  const [rewardState, setRewardState] = useState<RewardState | null>(null);

  const selectedLevel = useMemo(
    () => getLevel(selectedLevelId),
    [selectedLevelId],
  );

  const handleSettingsChange = useCallback((nextSettings: GameSettings) => {
    setSettings(nextSettings);
    saveSettings(nextSettings);
  }, []);

  const playLevel = useCallback((levelId: string) => {
    setSelectedLevelId(levelId);
    setMathsRequest(null);
    setScreen('game');
  }, []);

  const handleQuestionRequested = useCallback((payload: MathsRequestPayload) => {
    setMathsRequest(payload);
  }, []);

  const handleCorrectAnswer = useCallback(() => {
    if (!mathsRequest) {
      return;
    }

    const { gateId } = mathsRequest;
    setMathsRequest(null);
    GameEvents.emit('maths:success', { gateId });
  }, [mathsRequest]);

  const handleLevelComplete = useCallback((payload: LevelCompletePayload) => {
    const reward = getRewardForLevel(payload.levelId);
    setProgress((current) => markLevelComplete(current, payload.levelId, reward.id));
    setRewardState({ levelId: payload.levelId, reward });
    setMathsRequest(null);
    setScreen('reward');
  }, []);

  const nextLevelId = rewardState ? getNextLevelId(rewardState.levelId) : null;

  function resetAllProgress(): void {
    setProgress(resetProgress());
  }

  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Primary">
        <button className="brand-button" onClick={() => setScreen('menu')} type="button">
          <span className="brand-mark">F</span>
          <span>Formula Bomb</span>
        </button>
        <div className="topbar-actions">
          <button
            aria-label="Home"
            className="icon-button"
            onClick={() => setScreen('menu')}
            type="button"
          >
            <Home size={20} />
          </button>
          <button
            aria-label="Map"
            className="icon-button"
            onClick={() => setScreen('levels')}
            type="button"
          >
            <Map size={20} />
          </button>
          <button
            aria-label="Settings"
            className="icon-button"
            onClick={() => setScreen('settings')}
            type="button"
          >
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {screen === 'menu' ? (
        <section className="menu-layout">
          <div className="hero-panel">
            <div>
              <p className="eyebrow">Solve the maths. Defuse the bomb.</p>
              <h1>F-Bomb: Formula Bomb</h1>
              <p className="hero-copy">
                Jump through blocky levels, dodge surprise traps and unlock each
                exit with a maths puzzle.
              </p>
            </div>
            <div className="menu-actions">
              <button
                className="primary-button"
                onClick={() => playLevel(selectedLevelId)}
                type="button"
              >
                <Play size={18} />
                Continue
              </button>
              <button
                className="secondary-button"
                onClick={() => setScreen('levels')}
                type="button"
              >
                <Map size={18} />
                Level map
              </button>
            </div>
          </div>
          <div className="preview-scene" aria-hidden="true">
            <div className="sun" />
            <div className="cloud one" />
            <div className="cloud two" />
            <div className="floating-block grass" />
            <div className="floating-block stone" />
            <div className="player-preview" />
            <div className="bomb-preview">F</div>
            <div className="door-preview" />
            <div className="ground-strip" />
          </div>
        </section>
      ) : null}

      {screen === 'levels' ? (
        <LevelSelect progress={progress} onPlay={playLevel} />
      ) : null}

      {screen === 'settings' ? (
        <ParentSettings
          settings={settings}
          onChange={handleSettingsChange}
          onResetProgress={resetAllProgress}
        />
      ) : null}

      {screen === 'game' ? (
        <section className="game-screen">
          <div className="game-header">
            <div>
              <p className="eyebrow">Now playing</p>
              <h1>{selectedLevel.title}</h1>
            </div>
            <button
              className="secondary-button"
              onClick={() => setScreen('levels')}
              type="button"
            >
              <Map size={18} />
              Map
            </button>
          </div>
          <GameCanvas
            key={selectedLevelId}
            levelId={selectedLevelId}
            settings={settings}
            onLevelComplete={handleLevelComplete}
            onQuestionRequested={handleQuestionRequested}
          />
          <TouchControls />
          <div className="control-strip">
            <span>Move: A/D, arrows or touch buttons</span>
            <span>Jump: W, up arrow, space or touch jump</span>
            <span>Defuse: press E, tap the bomb or use Defuse nearby</span>
            <span>Tip: {selectedLevel.mechanic}</span>
          </div>
        </section>
      ) : null}

      {screen === 'reward' && rewardState ? (
        <RewardScreen
          reward={rewardState.reward}
          nextLevelId={nextLevelId}
          onMap={() => setScreen('levels')}
          onMenu={() => setScreen('menu')}
          onNext={() => {
            if (nextLevelId) {
              playLevel(nextLevelId);
            }
          }}
        />
      ) : null}

      {mathsRequest ? (
        <MathsQuestionModal
          question={mathsRequest.question}
          settings={settings}
          onCorrect={handleCorrectAnswer}
        />
      ) : null}
    </main>
  );
}
