import { ArrowLeft, ArrowRight, ArrowUp, Bomb } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { GameEvents, type VirtualControl } from '../game/events';

const controls: VirtualControl[] = ['left', 'right', 'jump', 'defuse'];
const controlGroups: VirtualControl[][] = [
  ['left', 'right'],
  ['jump', 'defuse'],
];

const controlConfig: Record<
  VirtualControl,
  {
  label: string;
  icon: typeof ArrowLeft;
  }
> = {
  left: { label: 'Move left', icon: ArrowLeft },
  right: { label: 'Move right', icon: ArrowRight },
  jump: { label: 'Jump', icon: ArrowUp },
  defuse: { label: 'Defuse', icon: Bomb },
};

function createPressedState(): Record<VirtualControl, boolean> {
  return {
    left: false,
    right: false,
    jump: false,
    defuse: false,
  };
}

function createPointerState(): Record<VirtualControl, Set<number>> {
  return {
    left: new Set<number>(),
    right: new Set<number>(),
    jump: new Set<number>(),
    defuse: new Set<number>(),
  };
}

export default function TouchControls() {
  const pointerIdsRef = useRef<Record<VirtualControl, Set<number>>>(
    createPointerState(),
  );
  const pressedRef = useRef<Record<VirtualControl, boolean>>(
    createPressedState(),
  );
  const [pressed, setPressed] = useState<Record<VirtualControl, boolean>>(
    createPressedState,
  );

  const setControlPressed = useCallback(
    (control: VirtualControl, active: boolean, syncState = true): void => {
      if (pressedRef.current[control] === active) {
        return;
      }

      const nextPressed = { ...pressedRef.current, [control]: active };
      pressedRef.current = nextPressed;

      if (syncState) {
        setPressed(nextPressed);
      }

      GameEvents.emit('input:virtual-control', { control, active });
    },
    [],
  );

  const releasePointer = useCallback(
    (control: VirtualControl, pointerId: number, syncState = true): void => {
      const pointerIds = pointerIdsRef.current[control];

      if (!pointerIds.has(pointerId)) {
        return;
      }

      pointerIds.delete(pointerId);

      if (pointerIds.size === 0) {
        setControlPressed(control, false, syncState);
      }
    },
    [setControlPressed],
  );

  const releaseAllControls = useCallback(
    (syncState = true): void => {
      for (const control of controls) {
        pointerIdsRef.current[control].clear();
        setControlPressed(control, false, syncState);
      }
    },
    [setControlPressed],
  );

  useEffect(() => {
    function releaseOnBlur(): void {
      releaseAllControls();
    }

    function releaseOnVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
        releaseAllControls();
      }
    }

    window.addEventListener('blur', releaseOnBlur);
    document.addEventListener('visibilitychange', releaseOnVisibilityChange);

    return () => {
      window.removeEventListener('blur', releaseOnBlur);
      document.removeEventListener('visibilitychange', releaseOnVisibilityChange);
      releaseAllControls(false);
    };
  }, [releaseAllControls]);

  function pressControl(
    control: VirtualControl,
    event: PointerEvent<HTMLButtonElement>,
  ): void {
    event.preventDefault();

    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    pointerIdsRef.current[control].add(event.pointerId);
    setControlPressed(control, true);
  }

  function releaseControl(
    control: VirtualControl,
    event: PointerEvent<HTMLButtonElement>,
  ): void {
    event.preventDefault();
    releasePointer(control, event.pointerId);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function renderButton(control: VirtualControl) {
    const config = controlConfig[control];
    const Icon = config.icon;

    return (
      <button
        aria-label={config.label}
        aria-pressed={pressed[control]}
        className="touch-control-button"
        key={control}
        onContextMenu={(event) => event.preventDefault()}
        onPointerCancel={(event) => releaseControl(control, event)}
        onPointerDown={(event) => pressControl(control, event)}
        onPointerLeave={(event) => {
          if (pressed[control]) {
            releaseControl(control, event);
          }
        }}
        onLostPointerCapture={(event) => releasePointer(control, event.pointerId)}
        onPointerUp={(event) => releaseControl(control, event)}
        title={config.label}
        type="button"
      >
        <Icon size={28} strokeWidth={3} />
      </button>
    );
  }

  return (
    <div aria-label="Touch controls" className="touch-controls">
      {controlGroups.map((group) => (
        <div className="touch-control-group" key={group.join('-')}>
          {group.map((control) => renderButton(control))}
        </div>
      ))}
    </div>
  );
}
