import { ArrowLeft, ArrowRight, ArrowUp, Bomb } from 'lucide-react';
import { useState, type PointerEvent } from 'react';
import { GameEvents, type VirtualControl } from '../game/events';

const controls: Array<{
  control: VirtualControl;
  label: string;
  icon: typeof ArrowLeft;
}> = [
  { control: 'left', label: 'Move left', icon: ArrowLeft },
  { control: 'right', label: 'Move right', icon: ArrowRight },
  { control: 'jump', label: 'Jump', icon: ArrowUp },
  { control: 'defuse', label: 'Defuse', icon: Bomb },
];

const initialPressedState: Record<VirtualControl, boolean> = {
  left: false,
  right: false,
  jump: false,
  defuse: false,
};

export default function TouchControls() {
  const [pressed, setPressed] =
    useState<Record<VirtualControl, boolean>>(initialPressedState);

  function emitControl(control: VirtualControl, active: boolean): void {
    GameEvents.emit('input:virtual-control', { control, active });
  }

  function pressControl(
    control: VirtualControl,
    event: PointerEvent<HTMLButtonElement>,
  ): void {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setPressed((current) => ({ ...current, [control]: true }));
    emitControl(control, true);
  }

  function releaseControl(
    control: VirtualControl,
    event: PointerEvent<HTMLButtonElement>,
  ): void {
    event.preventDefault();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setPressed((current) => ({ ...current, [control]: false }));
    emitControl(control, false);
  }

  function renderButton(control: VirtualControl) {
    const config = controls.find((item) => item.control === control);

    if (!config) {
      return null;
    }

    const Icon = config.icon;

    return (
      <button
        aria-label={config.label}
        aria-pressed={pressed[control]}
        className="touch-control-button"
        onContextMenu={(event) => event.preventDefault()}
        onPointerCancel={(event) => releaseControl(control, event)}
        onPointerDown={(event) => pressControl(control, event)}
        onPointerLeave={(event) => {
          if (pressed[control]) {
            releaseControl(control, event);
          }
        }}
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
      <div className="touch-control-group">
        {renderButton('left')}
        {renderButton('right')}
      </div>
      <div className="touch-control-group">
        {renderButton('jump')}
        {renderButton('defuse')}
      </div>
    </div>
  );
}
