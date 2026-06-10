import Phaser from 'phaser';
import type { MathQuestion } from './systems/questionGenerator';

export type MathsRequestPayload = {
  gateId: string;
  levelId: string;
  question: MathQuestion;
};

export type MathsSuccessPayload = {
  gateId: string;
};

export type LevelCompletePayload = {
  levelId: string;
};

export type VirtualControl = 'left' | 'right' | 'jump' | 'defuse';

export type VirtualControlPayload = {
  control: VirtualControl;
  active: boolean;
};

export const GameEvents = new Phaser.Events.EventEmitter();
