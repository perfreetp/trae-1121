import { create } from 'zustand';
import type {
  Event,
  Alert,
  Material,
  PatrolShift,
  PatrolRecord,
  WarningThreshold,
  RestrictionMeasure,
  BroadcastTemplate,
  MaterialLog,
} from '../types';
import {
  mockEvents,
  mockAlerts,
  mockMaterials,
  mockPatrolShifts,
  mockPatrolRecords,
  mockWarningThresholds,
  mockRestrictionMeasures,
  mockBroadcastTemplates,
} from '../data/mockData';

interface BroadcastLog {
  id: string;
  templateId: string;
  templateName: string;
  type: 'preview' | 'broadcast';
  timestamp: string;
  operator: string;
}

interface AppState {
  events: Event[];
  alerts: Alert[];
  materials: Material[];
  materialLogs: MaterialLog[];
  patrolShifts: PatrolShift[];
  patrolRecords: PatrolRecord[];
  warningThresholds: WarningThreshold[];
  restrictionMeasures: RestrictionMeasure[];
  broadcastTemplates: BroadcastTemplate[];
  broadcastLogs: BroadcastLog[];
  currentStation: string;

  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEventStatus: (id: string, status: Event['status']) => void;
  assignEvent: (id: string, assignee: string) => void;
  updateAlertStatus: (id: string, status: Alert['status']) => void;
  toggleRestrictionMeasure: (id: string) => void;
  updateThreshold: (id: string, yellow: number, red: number) => void;

  updatePatrolShift: (id: string, data: Partial<PatrolShift>) => void;
  addPatrolShift: (shift: Omit<PatrolShift, 'id'>) => void;
  addPatrolRecord: (record: Omit<PatrolRecord, 'id'>) => void;

  updateBroadcastTemplate: (id: string, data: Partial<BroadcastTemplate>) => void;
  addBroadcastLog: (log: Omit<BroadcastLog, 'id' | 'timestamp'>) => void;

  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, data: Partial<Material>) => void;
  borrowMaterial: (id: string, quantity: number, operator: string, remark: string) => void;
  returnMaterial: (id: string, quantity: number, operator: string, remark: string) => void;
  addMaterialLog: (log: Omit<MaterialLog, 'id' | 'timestamp'>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  events: mockEvents,
  alerts: mockAlerts,
  materials: mockMaterials,
  materialLogs: [],
  patrolShifts: mockPatrolShifts,
  patrolRecords: mockPatrolRecords,
  warningThresholds: mockWarningThresholds,
  restrictionMeasures: mockRestrictionMeasures,
  broadcastTemplates: mockBroadcastTemplates,
  broadcastLogs: [],
  currentStation: '人民广场站',

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

  updatePatrolShift: (id, data) =>
    set((state) => ({
      patrolShifts: state.patrolShifts.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    })),

  addPatrolShift: (shift) =>
    set((state) => ({
      patrolShifts: [
        ...state.patrolShifts,
        { ...shift, id: `shift-${Date.now()}` },
      ],
    })),

  addPatrolRecord: (record) =>
    set((state) => ({
      patrolRecords: [
        ...state.patrolRecords,
        { ...record, id: `rec-${Date.now()}` },
      ],
    })),

  updateBroadcastTemplate: (id, data) =>
    set((state) => ({
      broadcastTemplates: state.broadcastTemplates.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),

  addBroadcastLog: (log) =>
    set((state) => ({
      broadcastLogs: [
        { ...log, id: `log-${Date.now()}`, timestamp: new Date().toISOString() },
        ...state.broadcastLogs,
      ],
    })),

  addMaterial: (material) =>
    set((state) => ({
      materials: [
        { ...material, id: `mat-${Date.now()}` },
        ...state.materials,
      ],
    })),

  updateMaterial: (id, data) =>
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, ...data } : m
      ),
    })),

  borrowMaterial: (id, quantity, operator, remark) =>
    set((state) => {
      const material = state.materials.find((m) => m.id === id);
      if (!material) return state;

      const newQuantity = material.quantity - quantity;
      const newStatus = newQuantity <= 0 ? 'in_use' : material.status;

      return {
        materials: state.materials.map((m) =>
          m.id === id ? { ...m, quantity: newQuantity, status: newStatus } : m
        ),
        materialLogs: [
          {
            id: `mlog-${Date.now()}`,
            materialId: id,
            type: 'borrow',
            quantity,
            operator,
            timestamp: new Date().toISOString(),
            remark,
          },
          ...state.materialLogs,
        ],
      };
    }),

  returnMaterial: (id, quantity, operator, remark) =>
    set((state) => {
      const material = state.materials.find((m) => m.id === id);
      if (!material) return state;

      const newQuantity = material.quantity + quantity;

      return {
        materials: state.materials.map((m) =>
          m.id === id ? { ...m, quantity: newQuantity, status: 'available' } : m
        ),
        materialLogs: [
          {
            id: `mlog-${Date.now()}`,
            materialId: id,
            type: 'return',
            quantity,
            operator,
            timestamp: new Date().toISOString(),
            remark,
          },
          ...state.materialLogs,
        ],
      };
    }),

  addMaterialLog: (log) =>
    set((state) => ({
      materialLogs: [
        { ...log, id: `mlog-${Date.now()}`, timestamp: new Date().toISOString() },
        ...state.materialLogs,
      ],
    })),
}));
