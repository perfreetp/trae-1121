export type EventType = 'crowd' | 'lost_item' | 'dispute' | 'suspicious' | 'injury' | 'other';
export type EventLevel = 'low' | 'medium' | 'high' | 'emergency';
export type EventStatus = 'pending' | 'processing' | 'completed' | 'closed';

export interface Event {
  id: string;
  type: EventType;
  level: EventLevel;
  location: string;
  description: string;
  status: EventStatus;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  assignee?: string;
}

export interface EventLog {
  id: string;
  eventId: string;
  action: string;
  operator: string;
  timestamp: string;
  remark: string;
}

export interface PassengerData {
  id: string;
  area: string;
  count: number;
  timestamp: string;
}

export interface WarningThreshold {
  id: string;
  area: string;
  areaName: string;
  yellowThreshold: number;
  redThreshold: number;
  currentCount: number;
}

export type DeviceType = 'gate' | 'escalator' | 'entrance' | 'security' | 'camera';
export type DeviceStatus = 'normal' | 'warning' | 'fault';

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  location: string;
  status: DeviceStatus;
  x: number;
  y: number;
}

export type MaterialCategory = 'fence' | 'stretcher' | 'first_aid' | 'megaphone' | 'other';
export type MaterialStatus = 'available' | 'in_use' | 'maintenance';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  quantity: number;
  location: string;
  status: MaterialStatus;
}

export interface MaterialLog {
  id: string;
  materialId: string;
  type: 'borrow' | 'return' | 'maintenance' | 'dispatch';
  quantity: number;
  operator: string;
  timestamp: string;
  remark: string;
}

export type Department = 'police' | 'medical' | 'fire' | 'station' | 'operation';

export interface Contact {
  id: string;
  name: string;
  department: Department;
  phone: string;
  role: string;
}

export interface PatrolRoute {
  id: string;
  name: string;
  description: string;
}

export interface PatrolPoint {
  id: string;
  routeId: string;
  name: string;
  location: string;
  order: number;
}

export interface PatrolShift {
  id: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  personnel: string;
  routeId: string;
}

export interface PatrolRecord {
  id: string;
  shiftId: string;
  pointId: string;
  checkTime: string;
  status: 'normal' | 'abnormal';
  remark: string;
}

export interface Alert {
  id: string;
  type: 'device' | 'passenger' | 'security';
  level: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
  status: 'unread' | 'processing' | 'resolved';
  createdAt: string;
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  content: string;
  category: 'normal' | 'warning' | 'emergency';
}

export interface RestrictionMeasure {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold: string;
}

export interface ReviewItem {
  id: string;
  eventId: string;
  eventType: string;
  duration: number;
  nodes: { name: string; duration: number; responsible: string; timestamp: string }[];
  improvements: { id: string; content: string; status: 'pending' | 'in_progress' | 'completed' }[];
}
