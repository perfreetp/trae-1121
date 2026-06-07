import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileBarChart,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Target,
  MapPin,
  User,
  Package,
  ArrowLeft,
  Lightbulb,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store';
import { eventTypeStats, monthlyEventTrend } from '@/data/mockData';
import type { Event, EventLog } from '@/types';

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#EF4444', '#6B7280'];

const levelColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
};

const levelLabels = {
  low: '低',
  medium: '中',
  high: '高',
  emergency: '紧急',
};

const typeLabels: Record<string, string> = {
  crowd: '客流拥挤',
  injury: '突发伤病',
  dispute: '纠纷',
  lost_item: '物品遗失',
  suspicious: '可疑人员',
  other: '其他',
};

const actionLabels: Record<string, string> = {
  create: '事件登记',
  update_status: '状态变更',
  add_progress: '现场进展',
  add_measure: '处置措施',
  add_remark: '文字备注',
  notify_contact: '通知联络',
  borrow_material: '领用物资',
  complete: '事件完成',
};

const actionColors: Record<string, string> = {
  create: 'bg-blue-500',
  update_status: 'bg-purple-500',
  add_progress: 'bg-cyan-500',
  add_measure: 'bg-green-500',
  add_remark: 'bg-slate-500',
  notify_contact: 'bg-orange-500',
  borrow_material: 'bg-yellow-500',
  complete: 'bg-emerald-500',
};

const deptLabels: Record<string, string> = {
  police: '警务',
  medical: '医护',
  fire: '消防',
  station: '站务',
  operation: '运营',
};

export default function Review() {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, eventLogs, eventContactLogs, eventMaterialLogs } = useAppStore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as any;
    if (state?.highlightEventId) {
      setSelectedEventId(state.highlightEventId);
      const el = document.getElementById(`event-review-${state.highlightEventId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.state]);

  const completedEvents = events.filter((e) => e.status === 'completed');

  const avgDuration = completedEvents.length > 0
    ? Math.round(
        completedEvents.reduce((sum, e) => {
          const start = new Date(e.createdAt).getTime();
          const end = new Date(e.updatedAt).getTime();
          return sum + Math.round((end - start) / 60000);
        }, 0) / completedEvents.length
      )
    : 0;

  const totalImprovements = completedEvents.filter((e) => e.reviewSuggestion).length;
  const completedImprovements = Math.floor(totalImprovements * 0.7);

  const getEventDuration = (event: Event) => {
    const start = new Date(event.createdAt).getTime();
    const end = new Date(event.updatedAt).getTime();
    return Math.round((end - start) / 60000);
  };

  const getEventLogs = (eventId: string) => {
    return eventLogs.filter((log) => log.eventId === eventId).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const getEventContacts = (eventId: string) => {
    return eventContactLogs.filter((log) => log.eventId === eventId);
  };

  const getEventMaterials = (eventId: string) => {
    return eventMaterialLogs.filter((log) => log.eventId === eventId);
  };

  const getUniqueOperators = (eventId: string) => {
    const logs = eventLogs.filter((log) => log.eventId === eventId);
    const contacts = eventContactLogs.filter((log) => log.eventId === eventId);
    const operators = new Set<string>();
    logs.forEach((log) => operators.add(log.operator));
    contacts.forEach((log) => operators.add(log.contactName));
    return Array.from(operators);
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGoToEvent = (eventId: string) => {
    navigate('/event-handling', { state: { highlightEventId: eventId } });
  };

  const selectedEvent = completedEvents.find((e) => e.id === selectedEventId);
  const selectedLogs = selectedEvent ? getEventLogs(selectedEvent.id) : [];
  const selectedContacts = selectedEvent ? getEventContacts(selectedEvent.id) : [];
  const selectedMaterials = selectedEvent ? getEventMaterials(selectedEvent.id) : [];
  const selectedOperators = selectedEvent ? getUniqueOperators(selectedEvent.id) : [];

  if (selectedEvent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedEventId(null)}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            返回复盘列表
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-slate-800">
                  {typeLabels[selectedEvent.type] || selectedEvent.type}事件复盘
                </h2>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[selectedEvent.level]}`}>
                  {levelLabels[selectedEvent.level]}
                </span>
                <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                  已完成
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {selectedEvent.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  总时长: {getEventDuration(selectedEvent)} 分钟
                </span>
                <span className="flex items-center gap-1">
                  <User size={14} />
                  报告人: {selectedEvent.reporter}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleGoToEvent(selectedEvent.id)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText size={16} />
              查看原事件
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500 mb-1">处置节点</p>
              <p className="text-2xl font-bold text-slate-800">{selectedLogs.length}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500 mb-1">参与人员</p>
              <p className="text-2xl font-bold text-slate-800">{selectedOperators.length}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500 mb-1">通知部门</p>
              <p className="text-2xl font-bold text-slate-800">{selectedContacts.length}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500 mb-1">领用物资</p>
              <p className="text-2xl font-bold text-slate-800">{selectedMaterials.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-500" />
                处置时间线
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {selectedLogs.map((log: EventLog, idx: number) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${actionColors[log.action] || 'bg-slate-400'}`} />
                      {idx < selectedLogs.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-800">
                          {actionLabels[log.action] || log.action}
                        </span>
                        <span className="text-xs text-slate-400">{formatTime(log.timestamp)}</span>
                      </div>
                      <p className="text-sm text-slate-600">{log.remark}</p>
                      {log.detail && (
                        <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded">
                          {log.detail}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">操作人: {log.operator}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {selectedContacts.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Users size={18} className="text-orange-500" />
                    通知人员
                  </h3>
                  <div className="space-y-2">
                    {selectedContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users size={14} className="text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{contact.contactName}</p>
                            <p className="text-xs text-slate-500">
                              {deptLabels[contact.department] || contact.department} · {contact.remark}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{formatTime(contact.notifyTime)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMaterials.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Package size={18} className="text-yellow-500" />
                    领用物资
                  </h3>
                  <div className="space-y-2">
                    {selectedMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Package size={14} className="text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {material.materialName} x{material.quantity}
                            </p>
                            <p className="text-xs text-slate-500">{material.remark}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{formatTime(material.borrowTime)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.result && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-500" />
                    处置结果
                  </h3>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">{selectedEvent.result}</p>
                  </div>
                </div>
              )}

              {selectedEvent.reviewSuggestion && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Lightbulb size={18} className="text-amber-500" />
                    复盘建议
                  </h3>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">{selectedEvent.reviewSuggestion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">复盘分析</h1>
          <p className="text-slate-500 mt-1">事件处置数据统计与改进跟踪</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileBarChart className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{completedEvents.length}</p>
              <p className="text-sm text-slate-500">复盘事件</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {avgDuration}<span className="text-base font-normal">分钟</span>
              </p>
              <p className="text-sm text-slate-500">平均处置时长</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalImprovements}</p>
              <p className="text-sm text-slate-500">改进建议</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{completedImprovements}/{totalImprovements}</p>
              <p className="text-sm text-slate-500">已跟进改进</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">月度事件趋势</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyEventTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="事件数" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">事件类型分布</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={eventTypeStats}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {eventTypeStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">复盘记录</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {completedEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <FileBarChart size={48} className="mx-auto mb-3 text-slate-300" />
              <p>暂无已完成的事件</p>
            </div>
          ) : (
            completedEvents.map((event) => (
              <div
                id={`event-review-${event.id}`}
                key={event.id}
                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                  selectedEventId === event.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedEventId(event.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileBarChart size={24} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-800">
                        {typeLabels[event.type] || event.type}事件复盘
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[event.level]}`}>
                        {levelLabels[event.level]}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{event.id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        总时长: {getEventDuration(event)} 分钟
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {getEventLogs(event.id).length} 个处理节点
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={14} />
                        {getEventMaterials(event.id).length} 项物资领用
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoToEvent(event.id);
                      }}
                      className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      查看原事件
                    </button>
                    <ChevronRight size={20} className="text-slate-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
