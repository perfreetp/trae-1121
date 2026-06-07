import { useState, useEffect } from 'react';
import {
  AlertCircle,
  Clock,
  User,
  MapPin,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  MessageSquare,
  Wrench,
  Activity,
  Phone,
  Package,
  FileText,
  Lightbulb,
  ArrowRight,
  FileBarChart,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { mockDevices, mockContacts } from '@/data/mockData';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Event, EventType, EventLevel, EventStatus, Department } from '@/types';

const eventTypeLabels: Record<EventType, string> = {
  crowd: '客流拥挤',
  lost_item: '物品遗失',
  dispute: '纠纷',
  suspicious: '可疑人员',
  injury: '突发伤病',
  other: '其他',
};

const eventLevelLabels: Record<EventLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
  emergency: '紧急',
};

const eventLevelColors: Record<EventLevel, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
};

const eventStatusLabels: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  closed: '已关闭',
  rejected: '已退回',
};

const eventStatusColors: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
  rejected: 'bg-red-100 text-red-700',
};

const actionLabels: Record<string, string> = {
  create: '事件创建',
  update_status: '状态变更',
  add_progress: '现场进展',
  add_measure: '处置措施',
  add_remark: '文字备注',
  notify_contact: '通知联络',
  borrow_material: '物资领用',
  complete: '事件完成',
  review_approve: '复核通过',
  review_reject: '复核退回',
};

const actionColors: Record<string, string> = {
  create: 'bg-blue-500',
  update_status: 'bg-purple-500',
  add_progress: 'bg-green-500',
  add_measure: 'bg-orange-500',
  add_remark: 'bg-slate-500',
  notify_contact: 'bg-pink-500',
  borrow_material: 'bg-yellow-500',
  complete: 'bg-emerald-500',
  review_approve: 'bg-teal-500',
  review_reject: 'bg-rose-500',
};

const departmentLabels: Record<Department, string> = {
  police: '警务',
  medical: '医护',
  fire: '消防',
  station: '站务',
  operation: '运营',
};

const departmentColors: Record<Department, string> = {
  police: 'bg-blue-100 text-blue-700',
  medical: 'bg-red-100 text-red-700',
  fire: 'bg-orange-100 text-orange-700',
  station: 'bg-green-100 text-green-700',
  operation: 'bg-purple-100 text-purple-700',
};

export default function EventHandling() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    events,
    eventLogs,
    eventContactLogs,
    eventMaterialLogs,
    materials,
    addEvent,
    updateEventStatus,
    completeEvent,
    addEventLog,
    notifyEventContact,
    borrowEventMaterial,
    setHighlightedDeviceId,
    matchDeviceByLocation,
    reviewEvent,
  } = useAppStore();

  useEffect(() => {
    const state = location.state as any;
    if (state?.newEventWithDevice) {
      setNewEventForm({
        type: 'crowd',
        level: 'medium',
        location: state.newEventWithDevice.location,
        deviceId: state.newEventWithDevice.deviceId,
        description: '',
        reporter: '',
        status: 'pending',
      });
      setShowAddModal(true);
      navigate('.', { replace: true, state: {} });
    }
    if (state?.highlightEventId) {
      setExpandedEvent(state.highlightEventId);
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'contacts' | 'materials'>('timeline');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [newEventForm, setNewEventForm] = useState({
    type: 'crowd' as EventType,
    level: 'medium' as EventLevel,
    location: '',
    deviceId: '',
    description: '',
    reporter: '',
    status: 'pending' as EventStatus,
  });

  const [addLogForm, setAddLogForm] = useState({
    action: 'add_progress' as 'add_progress' | 'add_measure' | 'add_remark',
    remark: '',
    detail: '',
  });

  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [completeForm, setCompleteForm] = useState({
    result: '',
    reviewSuggestion: '',
  });

  const [showNotifyModal, setShowNotifyModal] = useState<string | null>(null);
  const [notifyForm, setNotifyForm] = useState({
    department: 'police' as Department,
    contactId: '',
    remark: '',
  });

  const [showMaterialModal, setShowMaterialModal] = useState<string | null>(null);
  const [materialForm, setMaterialForm] = useState({
    materialId: '',
    quantity: 1,
    remark: '',
  });

  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    action: 'approve' as 'approve' | 'reject',
    remark: '',
  });

  const filteredEvents = events.filter((e) => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (filterType !== 'all' && e.type !== filterType) return false;
    return true;
  });

  const pendingCount = events.filter((e) => e.status === 'pending').length;
  const processingCount = events.filter((e) => e.status === 'processing').length;
  const completedCount = events.filter((e) => e.status === 'completed').length;

  const handleAddEvent = () => {
    if (!newEventForm.description || !newEventForm.reporter) return;
    addEvent(newEventForm);
    setShowAddModal(false);
    setNewEventForm({
      type: 'crowd',
      level: 'medium',
      location: '',
      deviceId: '',
      description: '',
      reporter: '',
      status: 'pending',
    });
  };

  const handleAddLog = (eventId: string) => {
    if (!addLogForm.remark) return;
    addEventLog(eventId, addLogForm.action, '值班员', addLogForm.remark, addLogForm.detail);
    setAddLogForm({ action: 'add_progress', remark: '', detail: '' });
  };

  const handleComplete = (eventId: string) => {
    if (!completeForm.result) return;
    completeEvent(eventId, completeForm.result, completeForm.reviewSuggestion, '值班员');
    setShowCompleteModal(null);
    setCompleteForm({ result: '', reviewSuggestion: '' });
    navigate('/review', { state: { highlightEventId: eventId } });
  };

  const handleNotify = (eventId: string) => {
    if (!notifyForm.contactId) return;
    const contact = mockContacts.find((c) => c.id === notifyForm.contactId);
    if (!contact) return;
    notifyEventContact(eventId, contact.id, contact.name, contact.department, '值班员', notifyForm.remark);
    setShowNotifyModal(null);
    setNotifyForm({ department: 'police', contactId: '', remark: '' });
  };

  const handleBorrowMaterial = (eventId: string) => {
    if (!materialForm.materialId) return;
    const material = materials.find((m) => m.id === materialForm.materialId);
    if (!material) return;
    if (materialForm.quantity <= 0 || materialForm.quantity > material.quantity) {
      alert(`领用数量不合法！当前可用数量：${material.quantity}`);
      return;
    }
    const success = borrowEventMaterial(eventId, material.id, material.name, materialForm.quantity, '值班员', materialForm.remark);
    if (!success) {
      alert('领用失败，请检查库存数量');
      return;
    }
    setShowMaterialModal(null);
    setMaterialForm({ materialId: '', quantity: 1, remark: '' });
  };

  const handleReview = (eventId: string) => {
    reviewEvent(eventId, reviewForm.action, '值班站长', reviewForm.remark);
    setShowReviewModal(null);
    setReviewForm({ action: 'approve', remark: '' });
  };

  const handleJumpToMap = (deviceId?: string) => {
    if (deviceId) {
      setHighlightedDeviceId(deviceId);
    }
    navigate('/station-map');
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventLogs = (eventId: string) => {
    return eventLogs.filter((log) => log.eventId === eventId).sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const getEventContacts = (eventId: string) => {
    return eventContactLogs.filter((log) => log.eventId === eventId);
  };

  const getEventMaterials = (eventId: string) => {
    return eventMaterialLogs.filter((log) => log.eventId === eventId);
  };

  const availableContacts = mockContacts.filter((c) => c.department === notifyForm.department);
  const availableMaterials = materials.filter((m) => m.quantity > 0 && m.status !== 'maintenance');

  const selectedMaterial = materials.find((m) => m.id === materialForm.materialId);
  const maxQuantity = selectedMaterial?.quantity || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">事件处置</h1>
          <p className="text-slate-500 mt-1">登记、处置和跟踪车站突发事件</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          登记事件
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <PauseCircle className="text-slate-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
              <p className="text-sm text-slate-500">待处理</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <PlayCircle className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{processingCount}</p>
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
              <p className="text-2xl font-bold text-slate-800">{completedCount}</p>
              <p className="text-sm text-slate-500">已完成</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{events.length}</p>
              <p className="text-sm text-slate-500">事件总数</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              {Object.entries(eventTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEvents.map((event) => (
            <div key={event.id}>
              <div
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-slate-800">
                          {eventTypeLabels[event.type]}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${eventLevelColors[event.level]}`}>
                          {eventLevelLabels[event.level]}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${eventStatusColors[event.status]}`}>
                          {eventStatusLabels[event.status]}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{event.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={14} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (event.deviceId) {
                            handleJumpToMap(event.deviceId);
                          } else {
                            matchDeviceByLocation(event.location);
                            handleJumpToMap();
                          }
                        }}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {event.location}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock size={14} />
                      {formatTime(event.createdAt)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <User size={14} />
                      {event.reporter}
                    </div>
                    {expandedEvent === event.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {expandedEvent === event.id && (
                <div className="bg-slate-50 px-4 pb-4">
                  <div className="bg-white rounded-lg border border-slate-200">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer"
                          onClick={() => {
                            if (event.deviceId) {
                              handleJumpToMap(event.deviceId);
                            } else {
                              matchDeviceByLocation(event.location);
                              handleJumpToMap();
                            }
                          }}
                        >
                          <MapPin size={14} />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <User size={14} />
                          {event.reporter}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.status === 'completed' && (
                          <>
                            <button
                              onClick={() => navigate('/review', { state: { highlightEventId: event.id } })}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                            >
                              <FileBarChart size={12} />
                              查看复盘
                            </button>
                            <button
                              onClick={() => {
                                setShowReviewModal(event.id);
                                setReviewForm({ action: 'approve', remark: '' });
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-teal-50 text-teal-600 rounded hover:bg-teal-100 transition-colors"
                            >
                              <ThumbsUp size={12} />
                              复核
                            </button>
                          </>
                        )}
                        {event.status === 'pending' && (
                          <button
                            onClick={() => updateEventStatus(event.id, 'processing', '值班员')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          >
                            <PlayCircle size={12} />
                            开始处理
                          </button>
                        )}
                        {event.status === 'processing' && (
                          <button
                            onClick={() => setShowCompleteModal(event.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                          >
                            <CheckCircle size={12} />
                            完成处置
                          </button>
                        )}
                        {event.reviewStatus === 'rejected' && (
                          <span className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded">
                            已退回
                          </span>
                        )}
                        {event.reviewStatus === 'approved' && (
                          <span className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded">
                            复核通过
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="border-b border-slate-200 px-4 py-2 flex gap-4">
                      <button
                        onClick={() => setActiveTab('timeline')}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          activeTab === 'timeline'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Activity size={14} />
                          处置时间线
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('contacts')}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          activeTab === 'contacts'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          联络记录
                          {getEventContacts(event.id).length > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">
                              {getEventContacts(event.id).length}
                            </span>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('materials')}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          activeTab === 'materials'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Package size={14} />
                          物资领用
                          {getEventMaterials(event.id).length > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">
                              {getEventMaterials(event.id).length}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>

                    {activeTab === 'timeline' && (
                      <div className="p-4">
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-500 mb-2">追加记录</div>
                          <div className="flex gap-2 mb-2">
                            <select
                              value={addLogForm.action}
                              onChange={(e) => setAddLogForm({ ...addLogForm, action: e.target.value as any })}
                              className="px-2 py-1.5 border border-slate-300 rounded text-sm"
                            >
                              <option value="add_progress">现场进展</option>
                              <option value="add_measure">处置措施</option>
                              <option value="add_remark">文字备注</option>
                            </select>
                            <input
                              type="text"
                              value={addLogForm.remark}
                              onChange={(e) => setAddLogForm({ ...addLogForm, remark: e.target.value })}
                              placeholder="请输入标题..."
                              className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <textarea
                              value={addLogForm.detail}
                              onChange={(e) => setAddLogForm({ ...addLogForm, detail: e.target.value })}
                              placeholder="详细描述（可选）..."
                              rows={2}
                              className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm resize-none"
                            />
                            <button
                              onClick={() => handleAddLog(event.id)}
                              disabled={!addLogForm.remark}
                              className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 self-end"
                            >
                              添加
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                          <div className="space-y-4">
                            {getEventLogs(event.id).map((log, index) => (
                              <div key={log.id} className="relative pl-10">
                                <div className={`absolute left-1 w-5 h-5 rounded-full ${actionColors[log.action]} flex items-center justify-center text-white text-[8px]`}>
                                  {index + 1}
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-800">
                                      {actionLabels[log.action] || log.action}
                                    </span>
                                    <span className="text-xs text-slate-400">{formatTime(log.timestamp)}</span>
                                  </div>
                                  <p className="text-sm text-slate-700">{log.remark}</p>
                                  {log.detail && (
                                    <p className="text-xs text-slate-500 mt-1 bg-white p-2 rounded">{log.detail}</p>
                                  )}
                                  <p className="text-xs text-slate-400 mt-1">操作人：{log.operator}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'contacts' && (
                      <div className="p-4">
                        <div className="mb-4 flex justify-end">
                          <button
                            onClick={() => setShowNotifyModal(event.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-pink-600 text-white rounded text-sm hover:bg-pink-700"
                          >
                            <Phone size={14} />
                            通知人员
                          </button>
                        </div>
                        {getEventContacts(event.id).length === 0 ? (
                          <p className="text-center text-slate-400 text-sm py-8">暂无联络记录</p>
                        ) : (
                          <div className="space-y-2">
                            {getEventContacts(event.id).map((log) => (
                              <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${departmentColors[log.department]}`}>
                                  <User size={16} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-800">{log.contactName}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-xs ${departmentColors[log.department]}`}>
                                      {departmentLabels[log.department]}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">{log.remark}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-400">{formatTime(log.notifyTime)}</p>
                                  <p className="text-xs text-slate-400">{log.operator}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'materials' && (
                      <div className="p-4">
                        <div className="mb-4 flex justify-end">
                          <button
                            onClick={() => setShowMaterialModal(event.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                          >
                            <Package size={14} />
                            领用物资
                          </button>
                        </div>
                        {getEventMaterials(event.id).length === 0 ? (
                          <p className="text-center text-slate-400 text-sm py-8">暂无物资领用记录</p>
                        ) : (
                          <div className="space-y-2">
                            {getEventMaterials(event.id).map((log) => (
                              <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                  <Package size={16} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-800">{log.materialName}</span>
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                      x{log.quantity}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">{log.remark}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-400">{formatTime(log.borrowTime)}</p>
                                  <p className="text-xs text-slate-400">{log.operator}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t border-slate-200 p-4 bg-slate-50 flex flex-wrap gap-2 justify-end">
                      {event.status === 'pending' && (
                        <button
                          onClick={() => updateEventStatus(event.id, 'processing', '值班员')}
                          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          <PlayCircle size={14} />
                          开始处理
                        </button>
                      )}
                      {event.status === 'processing' && (
                        <button
                          onClick={() => setShowCompleteModal(event.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          <CheckCircle size={14} />
                          完成处置
                        </button>
                      )}
                      {event.result && (
                        <div className="w-full mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-1">
                            <FileText size={14} />
                            处置结果
                          </div>
                          <p className="text-sm text-slate-700">{event.result}</p>
                          {event.reviewSuggestion && (
                            <div className="mt-2 pt-2 border-t border-green-200">
                              <div className="flex items-center gap-2 text-green-600 text-xs mb-1">
                                <Lightbulb size={12} />
                                复盘建议
                              </div>
                              <p className="text-xs text-slate-600">{event.reviewSuggestion}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-slate-800">登记事件</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">事件类型</label>
                  <select
                    value={newEventForm.type}
                    onChange={(e) => setNewEventForm({ ...newEventForm, type: e.target.value as EventType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(eventTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">事件等级</label>
                  <select
                    value={newEventForm.level}
                    onChange={(e) => setNewEventForm({ ...newEventForm, level: e.target.value as EventLevel })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(eventLevelLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">位置（选择设备）</label>
                <select
                  value={newEventForm.deviceId}
                  onChange={(e) => {
                    const device = mockDevices.find((d) => d.id === e.target.value);
                    setNewEventForm({
                      ...newEventForm,
                      deviceId: e.target.value,
                      location: device ? device.name : '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- 选择设备（可选）--</option>
                  {mockDevices.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} - {d.location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">位置描述</label>
                <input
                  type="text"
                  value={newEventForm.location}
                  onChange={(e) => setNewEventForm({ ...newEventForm, location: e.target.value })}
                  placeholder="如：A出入口、2号站台等"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">事件描述</label>
                <textarea
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  rows={3}
                  placeholder="请详细描述事件情况..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">报告人</label>
                <input
                  type="text"
                  value={newEventForm.reporter}
                  onChange={(e) => setNewEventForm({ ...newEventForm, reporter: e.target.value })}
                  placeholder="请输入报告人姓名"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800">
                取消
              </button>
              <button
                onClick={handleAddEvent}
                disabled={!newEventForm.description || !newEventForm.reporter}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                确认登记
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[450px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">完成处置</h3>
              <button onClick={() => setShowCompleteModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">处置结果 *</label>
                <textarea
                  value={completeForm.result}
                  onChange={(e) => setCompleteForm({ ...completeForm, result: e.target.value })}
                  rows={3}
                  placeholder="请描述最终处置结果..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">复盘建议（可选）</label>
                <textarea
                  value={completeForm.reviewSuggestion}
                  onChange={(e) => setCompleteForm({ ...completeForm, reviewSuggestion: e.target.value })}
                  rows={2}
                  placeholder="对此事件的改进建议..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowCompleteModal(null)} className="px-4 py-2 text-slate-600 hover:text-slate-800">
                取消
              </button>
              <button
                onClick={() => handleComplete(showCompleteModal)}
                disabled={!completeForm.result}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">通知人员</h3>
              <button onClick={() => setShowNotifyModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">部门</label>
                <select
                  value={notifyForm.department}
                  onChange={(e) => setNotifyForm({ ...notifyForm, department: e.target.value as Department, contactId: '' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(departmentLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系人</label>
                <select
                  value={notifyForm.contactId}
                  onChange={(e) => setNotifyForm({ ...notifyForm, contactId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- 请选择联系人 --</option>
                  {availableContacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">通知内容</label>
                <textarea
                  value={notifyForm.remark}
                  onChange={(e) => setNotifyForm({ ...notifyForm, remark: e.target.value })}
                  rows={2}
                  placeholder="请描述通知事由..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowNotifyModal(null)} className="px-4 py-2 text-slate-600 hover:text-slate-800">
                取消
              </button>
              <button
                onClick={() => handleNotify(showNotifyModal)}
                disabled={!notifyForm.contactId}
                className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50"
              >
                发送通知
              </button>
            </div>
          </div>
        </div>
      )}

      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">领用物资</h3>
              <button onClick={() => setShowMaterialModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">物资</label>
                <select
                  value={materialForm.materialId}
                  onChange={(e) => setMaterialForm({ ...materialForm, materialId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- 请选择物资 --</option>
                  {availableMaterials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} (库存: {m.quantity}, {m.location})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  数量
                  {selectedMaterial && (
                    <span className="text-xs text-slate-500 ml-2">
                      (可用库存: {selectedMaterial.quantity})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={materialForm.quantity}
                  onChange={(e) => {
                    const val = Math.min(Math.max(Number(e.target.value), 1), maxQuantity);
                    setMaterialForm({ ...materialForm, quantity: val });
                  }}
                  min={1}
                  max={maxQuantity}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">用途说明</label>
                <textarea
                  value={materialForm.remark}
                  onChange={(e) => setMaterialForm({ ...materialForm, remark: e.target.value })}
                  rows={2}
                  placeholder="请说明领用用途..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowMaterialModal(null)} className="px-4 py-2 text-slate-600 hover:text-slate-800">
                取消
              </button>
              <button
                onClick={() => handleBorrowMaterial(showMaterialModal)}
                disabled={!materialForm.materialId}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                确认领用
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[450px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">处置复核</h3>
              <button onClick={() => setShowReviewModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">复核结果</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReviewForm({ ...reviewForm, action: 'approve' })}
                    className={`flex-1 py-2 rounded border-2 flex items-center justify-center gap-2 transition-colors ${
                      reviewForm.action === 'approve'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <ThumbsUp size={16} />
                    复核通过
                  </button>
                  <button
                    onClick={() => setReviewForm({ ...reviewForm, action: 'reject' })}
                    className={`flex-1 py-2 rounded border-2 flex items-center justify-center gap-2 transition-colors ${
                      reviewForm.action === 'reject'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <ThumbsDown size={16} />
                    退回补充
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {reviewForm.action === 'reject' ? '退回原因 *' : '复核说明（可选）'}
                </label>
                <textarea
                  value={reviewForm.remark}
                  onChange={(e) => setReviewForm({ ...reviewForm, remark: e.target.value })}
                  rows={3}
                  placeholder={reviewForm.action === 'reject' ? '请填写退回原因，要求补充的内容...' : '请输入复核说明...'}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowReviewModal(null)} className="px-4 py-2 text-slate-600 hover:text-slate-800">
                取消
              </button>
              <button
                onClick={() => handleReview(showReviewModal)}
                disabled={reviewForm.action === 'reject' && !reviewForm.remark}
                className={`px-6 py-2 text-white rounded transition-colors disabled:opacity-50 ${
                  reviewForm.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewForm.action === 'approve' ? '确认通过' : '确认退回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
