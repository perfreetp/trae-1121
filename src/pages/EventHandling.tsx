import { useState } from 'react';
import { Plus, Filter, Clock, MapPin, User, AlertCircle, CheckCircle, ChevronRight, X } from 'lucide-react';
import { useAppStore } from '@/store';
import type { EventType, EventLevel, EventStatus } from '@/types';

const typeLabels: Record<EventType, string> = {
  crowd: '客流拥挤',
  lost_item: '物品遗失',
  dispute: '纠纷',
  suspicious: '可疑人员',
  injury: '突发伤病',
  other: '其他',
};

const levelColors = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  emergency: 'bg-red-100 text-red-700 border-red-200',
};

const levelLabels = {
  low: '低',
  medium: '中',
  high: '高',
  emergency: '紧急',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700',
};

const statusLabels = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  closed: '已关闭',
};

const typeIcons: Record<EventType, string> = {
  crowd: '👥',
  lost_item: '🎒',
  dispute: '💬',
  suspicious: '🔍',
  injury: '🏥',
  other: '📋',
};

export default function EventHandling() {
  const { events, addEvent, updateEventStatus, assignEvent } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');

  const [newEvent, setNewEvent] = useState({
    type: 'crowd' as EventType,
    level: 'medium' as EventLevel,
    location: '',
    description: '',
    reporter: '',
  });

  const filteredEvents = events.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    return true;
  });

  const handleAddEvent = () => {
    if (!newEvent.location || !newEvent.description) return;
    addEvent({
      ...newEvent,
      status: 'pending',
    });
    setShowModal(false);
    setNewEvent({
      type: 'crowd',
      level: 'medium',
      location: '',
      description: '',
      reporter: '',
    });
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const stats = {
    pending: events.filter(e => e.status === 'pending').length,
    processing: events.filter(e => e.status === 'processing').length,
    completed: events.filter(e => e.status === 'completed').length,
    today: events.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">事件处置</h1>
          <p className="text-slate-500 mt-1">登记、跟踪和处理各类安全事件</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          登记事件
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
              <p className="text-sm text-slate-500">待处理</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.processing}</p>
              <p className="text-sm text-slate-500">处理中</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
              <p className="text-sm text-slate-500">已完成</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.today}</p>
              <p className="text-sm text-slate-500">今日事件</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">事件列表</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
                className="px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
                <option value="closed">已关闭</option>
              </select>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as EventType | 'all')}
              className="px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">{typeIcons[event.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs border ${levelColors[event.level]}`}>
                      {levelLabels[event.level]}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[event.status]}`}>
                      {statusLabels[event.status]}
                    </span>
                    <span className="text-sm font-medium text-slate-800">{typeLabels[event.type]}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-1">{event.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {event.reporter}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTime(event.createdAt)}
                    </span>
                    {event.assignee && (
                      <span className="text-blue-600">
                        负责人: {event.assignee}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </div>

              {selectedEvent === event.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 ml-12">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">事件描述</p>
                      <p className="text-sm text-slate-700">{event.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">报告时间</p>
                      <p className="text-sm text-slate-700">{new Date(event.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">更新时间</p>
                      <p className="text-sm text-slate-700">{new Date(event.updatedAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">操作</p>
                      <div className="flex gap-2">
                        {event.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateEventStatus(event.id, 'processing');
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            开始处理
                          </button>
                        )}
                        {event.status === 'processing' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateEventStatus(event.id, 'completed');
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            完成
                          </button>
                        )}
                        {!event.assignee && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              assignEvent(event.id, '值班站长');
                            }}
                            className="px-3 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-700"
                          >
                            指派
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">登记新事件</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">事件类型</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">事件等级</label>
                  <select
                    value={newEvent.level}
                    onChange={(e) => setNewEvent({ ...newEvent, level: e.target.value as EventLevel })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(levelLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">发生位置</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="如：A出入口、2号站台"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">事件描述</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="请详细描述事件情况..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">报告人</label>
                <input
                  type="text"
                  value={newEvent.reporter}
                  onChange={(e) => setNewEvent({ ...newEvent, reporter: e.target.value })}
                  placeholder="请输入报告人姓名"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                提交登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
