import { ArrowRight, Home, Map } from 'lucide-react';
import { useMemo, type CSSProperties } from 'react';
import type { Reward } from '../game/systems/rewardService';

type RewardScreenProps = {
  reward: Reward;
  nextLevelId: string | null;
  onMenu: () => void;
  onMap: () => void;
  onNext: () => void;
};

type CelebrationStyle = CSSProperties & Record<`--${string}`, string>;

type PraiseMessage = {
  text: string;
  x: string;
  y: string;
  tilt: string;
  delay: string;
  color: string;
};

const praiseMessageTexts = [
  'Well Done!',
  "You're Awesome!",
  'Super Solver!',
  'Maths Hero!',
  'Brilliant!',
  'You Did It!',
  'Amazing Focus!',
  'Great Thinking!',
];

const praiseMessageSlots = [
  {
    x: 'clamp(-330px, -34vw, -132px)',
    y: 'clamp(-230px, -23vh, -96px)',
  },
  {
    x: 'clamp(120px, 29vw, 300px)',
    y: 'clamp(-235px, -22vh, -102px)',
  },
  {
    x: 'clamp(-300px, -29vw, -118px)',
    y: 'clamp(92px, 17vh, 185px)',
  },
  {
    x: 'clamp(104px, 27vw, 286px)',
    y: 'clamp(82px, 16vh, 176px)',
  },
  {
    x: 'clamp(-190px, -18vw, -82px)',
    y: 'clamp(-315px, -30vh, -144px)',
  },
  {
    x: 'clamp(76px, 16vw, 178px)',
    y: 'clamp(-320px, -31vh, -150px)',
  },
  {
    x: 'clamp(-420px, -37vw, -150px)',
    y: 'clamp(190px, 30vh, 310px)',
  },
  {
    x: 'clamp(150px, 37vw, 420px)',
    y: 'clamp(190px, 30vh, 310px)',
  },
];

const praiseMessageColors = [
  '#ffdd4a',
  '#7bdff2',
  '#b8f7a4',
  '#ff9f80',
  '#c9b6ff',
  '#f9a8d4',
  '#a7f3d0',
  '#fde68a',
];

const creatureParty = [
  {
    kind: 'round',
    x: '7%',
    y: '17%',
    delay: '0ms',
    color: '#ff6b6b',
    accent: '#ffe66d',
  },
  {
    kind: 'wide',
    x: '82%',
    y: '16%',
    delay: '160ms',
    color: '#4ecdc4',
    accent: '#172033',
  },
  {
    kind: 'tall',
    x: '12%',
    y: '72%',
    delay: '320ms',
    color: '#f8c642',
    accent: '#ff8fab',
  },
  {
    kind: 'round',
    x: '84%',
    y: '72%',
    delay: '480ms',
    color: '#9b8cff',
    accent: '#b8f7a4',
  },
  {
    kind: 'wide',
    x: '47%',
    y: '9%',
    delay: '640ms',
    color: '#ff9f80',
    accent: '#7bdff2',
  },
  {
    kind: 'tall',
    x: '48%',
    y: '82%',
    delay: '800ms',
    color: '#7dd3fc',
    accent: '#f9a8d4',
  },
];

const rainbowColors = [
  '#ff4d6d',
  '#ff9f1c',
  '#ffdd4a',
  '#57cc99',
  '#38bdf8',
  '#7c3aed',
  '#f472b6',
  '#2dd4bf',
];

function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function randomTilt(): string {
  return `${Math.round(Math.random() * 16 - 8)}deg`;
}

function createPraiseMessages(): PraiseMessage[] {
  const shuffledTexts = shuffle(praiseMessageTexts);
  const shuffledSlots = shuffle(praiseMessageSlots);
  const shuffledColors = shuffle(praiseMessageColors);

  return shuffledTexts.map((text, index) => ({
    text,
    x: shuffledSlots[index].x,
    y: shuffledSlots[index].y,
    tilt: randomTilt(),
    delay: `${index * 140}ms`,
    color: shuffledColors[index],
  }));
}

export default function RewardScreen({
  reward,
  nextLevelId,
  onMenu,
  onMap,
  onNext,
}: RewardScreenProps) {
  const praiseMessages = useMemo(() => createPraiseMessages(), [reward.id]);

  return (
    <section className="screen-shell reward-shell" aria-labelledby="reward-title">
      <div className="rainbow-explosion" aria-hidden="true">
        <div className="rainbow-rings">
          <span />
          <span />
          <span />
        </div>
        <div className="rainbow-rays">
          {Array.from({ length: 32 }, (_, index) => (
            <span
              key={index}
              style={
                {
                  '--angle': `${index * 11.25}deg`,
                  '--delay': `${index * 18}ms`,
                  '--ray-color': rainbowColors[index % rainbowColors.length],
                  '--ray-length': `${160 + (index % 4) * 28}px`,
                } as CelebrationStyle
              }
            />
          ))}
        </div>
      </div>

      <div className="message-burst" aria-hidden="true">
        {praiseMessages.map((message) => (
          <span
            className="praise-pop"
            key={message.text}
            style={
              {
                '--x': message.x,
                '--y': message.y,
                '--tilt': message.tilt,
                '--delay': message.delay,
                '--message-color': message.color,
              } as CelebrationStyle
            }
          >
            {message.text}
          </span>
        ))}
      </div>

      <div className="creature-party" aria-hidden="true">
        {creatureParty.map((creature, index) => (
          <span
            className={`celebration-creature ${creature.kind}`}
            key={`${creature.kind}-${index}`}
            style={
              {
                '--x': creature.x,
                '--y': creature.y,
                '--delay': creature.delay,
                '--creature-color': creature.color,
                '--creature-accent': creature.accent,
              } as CelebrationStyle
            }
          >
            <span className="creature-eye left" />
            <span className="creature-eye right" />
            <span className="creature-mouth" />
          </span>
        ))}
      </div>

      <div className="reward-content">
        <p className="eyebrow">Level complete</p>
        <div className="reward-token-wrap">
          <span className="reward-spark sparkle-one" aria-hidden="true" />
          <span className="reward-spark sparkle-two" aria-hidden="true" />
          <span className="reward-spark sparkle-three" aria-hidden="true" />
          <div className="reward-token" style={{ backgroundColor: reward.color }}>
            {reward.label.slice(0, 1)}
          </div>
        </div>
        <h1 id="reward-title">{reward.label}</h1>
        <p className="reward-copy">
          The Formula Bomb is safe and the exit is open.
        </p>
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
      </div>
    </section>
  );
}
