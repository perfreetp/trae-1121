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
  EventLog,
  EventContactLog,
  EventMaterialLog,
  EventLogAction,
  Department,
  HandoverRecord,
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
  mockEventLogs,
  mockDevices,
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
  eventLogs: EventLog[];
  eventContactLogs: EventContactLog[];
  eventMaterialLogs: EventMaterialLog[];
  alerts: Alert[];
  materials: Material[];
  materialLogs: MaterialLog[];
  patrolShifts: PatrolShift[];
  patrolRecords: PatrolRecord[];
  warningThresholds: WarningThreshold[];
  restrictionMeasures: RestrictionMeasure[];
  broadcastTemplates: BroadcastTemplate[];
  broadcastLogs: BroadcastLog[];
  handoverRecords: HandoverRecord[];
  currentStation: string;
  highlightedDeviceId: string | null;

  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEventStatus: (id: string, status: Event['status'], operator: string, remark?: string) => void;
  assignEvent: (id: string, assignee: string) => void;
  completeEvent: (id: string, result: string, reviewSuggestion: string, operator: string) => void;
  reviewEvent: (id: string, action: 'approve' | 'reject', operator: string, remark?: string) => void;
  addEventLog: (eventId: string, action: EventLogAction, operator: string, remark: string, detail?: string) => void;
  notifyEventContact: (eventId: string, contactId: string, contactName: string, department: Department, operator: string, remark: string) => void;
  borrowEventMaterial: (eventId: string, materialId: string, materialName: string, quantity: number, operator: string, remark: string) => boolean;
  setHighlightedDeviceId: (id: string | null) => void;
  matchDeviceByLocation: (locationName: string) => void;
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
  borrowMaterial: (id: string, quantity: number, operator: string, remark: string) => boolean;
  returnMaterial: (id: string, quantity: number, operator: string, remark: string) => boolean;
  dispatchMaterial: (id: string, fromLocation: string, toLocation: string, quantity: number, operator: string, remark: string) => boolean;
  addMaterialLog: (log: Omit<MaterialLog, 'id' | 'timestamp'>) => void;

  createHandoverRecord: (data: Omit<HandoverRecord, 'id' | 'handoverTime'>) => void;
  confirmHandoverRecord: (id: string, officer: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  events: mockEvents,
  eventLogs: mockEventLogs,
  eventContactLogs: [],
  eventMaterialLogs: [],
  alerts: mockAlerts,
  materials: mockMaterials,
  materialLogs: [],
  patrolShifts: mockPatrolShifts,
  patrolRecords: mockPatrolRecords,
  warningThresholds: mockWarningThresholds,
  restrictionMeasures: mockRestrictionMeasures,
  broadcastTemplates: mockBroadcastTemplates,
  broadcastLogs: [],
  handoverRecords: [],
  currentStation: '人民广场站',
  highlightedDeviceId: null,

  addEvent: (event) =>
    set((state) => {
      const newEvent = {
        ...event,
        id: `evt-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        events: [newEvent, ...state.events],
        eventLogs: [
          {
            id: `elog-${Date.now()}`,
            eventId: newEvent.id,
            action: 'create',
            operator: event.reporter,
            timestamp: new Date().toISOString(),
            remark: '事件登记',
            detail: event.description,
          },
          ...state.eventLogs,
        ],
      };
    }),

  updateEventStatus: (id, status, operator, remark = '') =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e
      ),
      eventLogs: [
        {
          id: `elog-${Date.now()}`,
          eventId: id,
          action: 'update_status',
          operator,
          timestamp: new Date().toISOString(),
          remark: `状态变更为：${status === 'pending' ? '待处理' : status === 'processing' ? '处理中' : status === 'completed' ? '已完成' : '已关闭'}`,
          detail: remark,
        },
        ...state.eventLogs,
      ],
    })),

  assignEvent: (id, assignee) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, assignee, updatedAt: new Date().toISOString() } : e
      ),
    })),

  completeEvent: (id, result, reviewSuggestion, operator) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id
          ? { ...e, status: 'completed', result, reviewSuggestion, reviewStatus: 'pending', updatedAt: new Date().toISOString() }
          : e
      ),
      eventLogs: [
        {
          id: `elog-${Date.now()}`,
          eventId: id,
          action: 'complete',
          operator,
          timestamp: new Date().toISOString(),
          remark: '事件完成',
          detail: `处置结果：${result}\n复盘建议：${reviewSuggestion}`,
        },
        ...state.eventLogs,
      ],
    })),

  reviewEvent: (id, action, operator, remark = '') =>
    set((state) => {
      const event = state.events.find((e) => e.id === id);
      if (!event) return state;

      const newStatus = action === 'approve' ? 'closed' : 'processing';
      const reviewStatus = action === 'approve' ? 'approved' : 'rejected';
      const logAction: EventLogAction = action === 'approve' ? 'review_approve' : 'review_reject';
      const logRemark = action === 'approve' ? '复核通过' : '复核退回';

      return {
        events: state.events.map((e) =>
          e.id === id
            ? {
                ...e,
                status: newStatus,
                reviewStatus,
                reviewRemark: remark,
                reviewedBy: operator,
                reviewedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : e
        ),
        eventLogs: [
          {
            id: `elog-${Date.now()}`,
            eventId: id,
            action: logAction,
            operator,
            timestamp: new Date().toISOString(),
            remark: logRemark,
            detail: remark,
          },
          ...state.eventLogs,
        ],
      };
    }),

  addEventLog: (eventId, action, operator, remark, detail) =>
    set((state) => ({
      eventLogs: [
        {
          id: `elog-${Date.now()}`,
          eventId,
          action,
          operator,
          timestamp: new Date().toISOString(),
          remark,
          detail,
        },
        ...state.eventLogs,
      ],
    })),

  notifyEventContact: (eventId, contactId, contactName, department, operator, remark) =>
    set((state) => ({
      eventContactLogs: [
        {
          id: `eclog-${Date.now()}`,
          eventId,
          contactId,
          contactName,
          department,
          notifyTime: new Date().toISOString(),
          operator,
          remark,
        },
        ...state.eventContactLogs,
      ],
      eventLogs: [
        {
          id: `elog-${Date.now()}`,
          eventId,
          action: 'notify_contact',
          operator,
          timestamp: new Date().toISOString(),
          remark: `通知${contactName}`,
          detail: remark,
        },
        ...state.eventLogs,
      ],
    })),

  borrowEventMaterial: (eventId, materialId, materialName, quantity, operator, remark) => {
    const state = get();
    const material = state.materials.find((m) => m.id === materialId);
    const event = state.events.find((e) => e.id === eventId);
    
    if (!material || quantity <= 0 || quantity > material.quantity) {
      return false;
    }

    const newQuantity = material.quantity - quantity;
    const newStatus = newQuantity <= 0 ? 'in_use' : material.status;

    set({
      materials: state.materials.map((m) =>
        m.id === materialId ? { ...m, quantity: newQuantity, status: newStatus } : m
      ),
      eventMaterialLogs: [
        {
          id: `emlog-${Date.now()}`,
          eventId,
          materialId,
          materialName,
          quantity,
          borrowTime: new Date().toISOString(),
          operator,
          remark,
          returned: false,
        },
        ...state.eventMaterialLogs,
      ],
      materialLogs: [
        {
          id: `mlog-${Date.now()}`,
          materialId,
          type: 'borrow',
          quantity,
          operator,
          timestamp: new Date().toISOString(),
          remark: `事件领用：${remark}`,
          eventId,
          eventType: event?.type,
        },
        ...state.materialLogs,
      ],
      eventLogs: [
        {
          id: `elog-${Date.now()}`,
          eventId,
          action: 'borrow_material',
          operator,
          timestamp: new Date().toISOString(),
          remark: `领用${materialName} x${quantity}`,
          detail: remark,
        },
        ...state.eventLogs,
      ],
    });
    return true;
  },

  setHighlightedDeviceId: (id) =>
    set({ highlightedDeviceId: id }),

  matchDeviceByLocation: (locationName) =>
    set(() => {
      if (!locationName) return { highlightedDeviceId: null };
      
      let matchedDevice = mockDevices.find(
        (d) => d.name.includes(locationName) || locationName.includes(d.name)
      );
      
      if (!matchedDevice) {
        const locationLower = locationName.toLowerCase();
        matchedDevice = mockDevices.find((d) => {
          const nameLower = d.name.toLowerCase();
          if (locationLower.includes('安检') && d.type === 'security') {
            const numMatch = locationLower.match(/\d+/);
            const nameNumMatch = nameLower.match(/\d+/);
            if (numMatch && nameNumMatch && numMatch[0] === nameNumMatch[0]) {
              return true;
            }
            return !nameLower.match(/\d+/);
          }
          if (locationLower.includes('出入口') && d.type === 'entrance') {
            return nameLower.includes('a') || nameLower.includes('b');
          }
          if (locationLower.includes('扶梯') && d.type === 'escalator') {
            return true;
          }
          return false;
        });
      }
      
      return { highlightedDeviceId: matchedDevice?.id || null };
    }),

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

  borrowMaterial: (id, quantity, operator, remark) => {
    const state = get();
    const material = state.materials.find((m) => m.id === id);
    if (!material || quantity <= 0 || quantity > material.quantity) {
      return false;
    }

    const newQuantity = material.quantity - quantity;
    const newStatus = newQuantity <= 0 ? 'in_use' : material.status;

    set({
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
    });
    return true;
  },

  returnMaterial: (id, quantity, operator, remark) => {
    const state = get();
    const material = state.materials.find((m) => m.id === id);
    if (!material || quantity <= 0) {
      return false;
    }

    const newQuantity = material.quantity + quantity;

    set({
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
    });
    return true;
  },

  dispatchMaterial: (id, fromLocation, toLocation, quantity, operator, remark) => {
    const state = get();
    const material = state.materials.find((m) => m.id === id);
    if (!material || quantity <= 0 || material.quantity < quantity) {
      return false;
    }

    const remainingQuantity = material.quantity - quantity;
    const newMaterials = [...state.materials];

    if (remainingQuantity > 0) {
      newMaterials.forEach((m, idx) => {
        if (m.id === id) {
          newMaterials[idx] = { ...m, quantity: remainingQuantity };
        }
      });
      const existingAtLocation = state.materials.find(
        (m) => m.name === material.name && m.location === toLocation && m.category === material.category
      );
      if (existingAtLocation) {
        newMaterials.forEach((m, idx) => {
          if (m.id === existingAtLocation.id) {
            newMaterials[idx] = { ...m, quantity: m.quantity + quantity };
          }
        });
      } else {
        newMaterials.unshift({
          ...material,
          id: `mat-${Date.now()}`,
          quantity,
          location: toLocation,
        });
      }
    } else {
      newMaterials.forEach((m, idx) => {
        if (m.id === id) {
          newMaterials[idx] = { ...m, location: toLocation };
        }
      });
    }

    set({
      materials: newMaterials,
      materialLogs: [
        {
          id: `mlog-${Date.now()}`,
          materialId: id,
          type: 'dispatch',
          quantity,
          operator,
          timestamp: new Date().toISOString(),
          remark: `从${fromLocation}调度到${toLocation}：${remark}`,
        },
        ...state.materialLogs,
      ],
    });
    return true;
  },

  addMaterialLog: (log) =>
    set((state) => ({
      materialLogs: [
        { ...log, id: `mlog-${Date.now()}`, timestamp: new Date().toISOString() },
        ...state.materialLogs,
      ],
    })),

  createHandoverRecord: (data) =>
    set((state) => ({
      handoverRecords: [
        {
          ...data,
          id: `handover-${Date.now()}`,
          handoverTime: new Date().toISOString(),
        },
        ...state.handoverRecords,
      ],
    })),

  confirmHandoverRecord: (id, officer) =>
    set((state) => ({
      handoverRecords: state.handoverRecords.map((h) =>
        h.id === id
          ? {
              ...h,
              confirmed: true,
              confirmedAt: new Date().toISOString(),
              confirmedBy: officer,
            }
          : h
      ),
    })),
}));
