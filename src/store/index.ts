import { create } from 'zustand';
import type {
  Event,
  Alert,
  Material,
  PatrolShift,
  WarningThreshold,
  RestrictionMeasure,
  BroadcastTemplate,
} from '../types';
import {
  mockEvents,
  mockAlerts,
  mockMaterials,
  mockPatrolShifts,
  mockWarningThresholds,
  mockRestrictionMeasures,
  mockBroadcastTemplates,
} from '../data/mockData';

interface AppState {
  events: Event[];
  alerts: Alert[];
  materials: Material[];
  patrolShifts: PatrolShift[];
  warningThresholds: WarningThreshold[];
  restrictionMeasures: RestrictionMeasure[];
  broadcastTemplates: BroadcastTemplate[];
  currentStation: string;
  currentTime: string;

  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEventStatus: (id: string, status: Event['status']) => void;
  assignEvent: (id: string, assignee: string) => void;
  updateAlertStatus: (id: string, status: Alert['status']) => void;
  toggleRestrictionMeasure: (id: string) => void;
  updateThreshold: (id: string, yellow: number, red: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  events: mockEvents,
  alerts: mockAlerts,
  materials: mockMaterials,
  patrolShifts: mockPatrolShifts,
  warningThresholds: mockWarningThresholds,
  restrictionMeasures: mockRestrictionMeasures,
  broadcastTemplates: mockBroadcastTemplates,
  currentStation: '人民广场站',
  currentTime: new Date().toLocaleString('zh-CN'),

  addEvent: (event) =>
    set((state) => ({
      events: [
        {
          ...event,
          id: `evt-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...state.events,
      ],
    })),

  updateEventStatus: (id, status) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e
      ),
    })),

  assignEvent: (id, assignee) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, assignee, updatedAt: new Date().toISOString() } : e
      ),
    })),

  updateAlertStatus: (id, status) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  toggleRestrictionMeasure: (id) =>
    set((state) => ({
      restrictionMeasures: state.restrictionMeasures.map((m) =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      ),
    })),

  updateThreshold: (id, yellow, red) =>
    set((state) => ({
      warningThresholds: state.warningThresholds.map((t) =>
        t.id === id ? { ...t, yellowThreshold: yellow, redThreshold: red } : t
      ),
    })),
}));
