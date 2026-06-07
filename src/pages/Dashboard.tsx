import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  MapPin,
  Radio,
  Heart,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { mockPassengerTrend, stationAreaStats, eventTypeStats, monthlyEventTrend } from '@/data/mockData';

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

const typeLabels: Record<string, string> = {
  crowd: '客流拥挤',
  lost_item: '物品遗失',
  dispute: '纠纷',
  suspicious: '可疑人员',
  injury: '突发伤病',
  other: '其他',
};

const deptConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Heart }> = {
  police: { label: '警务', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Shield },
  medical: { label: '医护', color: 'text-red-600', bgColor: 'bg-red-100', icon: Heart },
  fire: { label: '消防', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Flame },
  station: { label: '站务', color: 'text-green-600', bgColor: 'bg-green-100', icon: Users },
  operation: { label: '运营', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Radio },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { events, alerts, eventContactLogs } = useAppStore();
  const [activeView, setActiveView] = useState<'overview' | 'dispatch'>('overview');

  const totalPassengers = stationAreaStats.reduce((sum, s) => sum + s.current, 0);
  const activeEvents = events.filter((e) => e.status === 'processing' || e.status === 'pending').length;
  const activeAlerts = alerts.filter((a) => a.status === 'unread' || a.status === 'processing').length;
  const avgDuration = 18;

  const processingEvents = events.filter((e) => e.status === 'processing' || e.status === 'pending');

  const getEventContacts = (eventId: string) => {
    return eventContactLogs.filter((log) => log.eventId === eventId);
  };

  const getNotifiedDepts = (eventId: string) => {
    const contacts = getEventContacts(eventId);
    return Array.from(new Set(contacts.map((c) => c.department)));
  };

  const handleGoToEvent = (eventId: string) => {
    navigate('/event-handling', { state: { highlightEventId: eventId } });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">运行看板</h1>
          <p className="text-slate-500 mt-1">实时监控车站运行状态与安全情况</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'overview'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              总览视角
            </button>
            <button
              onClick={() => setActiveView('dispatch')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'dispatch'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              应急调度
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-slate-600">系统运行正常</span>
          </div>
        </div>
      </div>

      {activeView === 'overview' ? (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">实时客流</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{totalPassengers}</p>
                  <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                    <TrendingUp size={14} />
                    较昨日 +12.5%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">进行中事件</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{activeEvents}</p>
                  <p className="text-orange-600 text-sm mt-1 flex items-center gap-1">
                    <Clock size={14} />
                    平均处置 {avgDuration} 分钟
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">待处理告警</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{activeAlerts}</p>
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <Activity size={14} />
                    2 条紧急告警
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-red-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">设备在线率</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">98.2%</p>
                  <p className="text-slate-500 text-sm mt-1">
                    127/129 设备在线
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="text-green-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-4">今日客流趋势</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={mockPassengerTrend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-4">各区域客流分布</h3>
              <div className="space-y-4">
                {stationAreaStats.map((area) => {
                  const percent = (area.current / area.capacity) * 100;
                  const barColor = percent > 80 ? 'bg-red-500' : percent > 60 ? 'bg-orange-500' : 'bg-blue-500';
                  return (
                    <div key={area.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 flex items-center gap-1">
                          <MapPin size={12} />
                          {area.name}
                        </span>
                        <span className="font-medium text-slate-800">
                          {area.current}/{area.capacity}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-500`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-4">事件类型分布</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={eventTypeStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {eventTypeStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {eventTypeStats.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-4">事件处理进度</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyEventTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-4">实时事件</h3>
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleGoToEvent(event.id)}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[event.level]}`}>
                            {levelLabels[event.level]}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${statusColors[event.status]}`}>
                            {statusLabels[event.status]}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">
                          {typeLabels[event.type]}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin size={12} />
                          {event.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {processingEvents.filter((e) => e.level === 'emergency' || e.level === 'high').length}
                  </p>
                  <p className="text-sm text-slate-500">高/紧急等级</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {processingEvents.filter((e) => e.status === 'pending').length}
                  </p>
                  <p className="text-sm text-slate-500">待处理</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {processingEvents.filter((e) => e.status === 'processing').length}
                  </p>
                  <p className="text-sm text-slate-500">处理中</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {eventContactLogs.length}
                  </p>
                  <p className="text-sm text-slate-500">已联动通知</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">正在处理的事件</h3>
              <p className="text-sm text-slate-500 mt-1">按等级、位置和联动进度汇总</p>
            </div>
            <div className="divide-y divide-slate-100">
              {processingEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Shield size={48} className="mx-auto mb-3 text-slate-300" />
                  <p>暂无正在处理的事件</p>
                </div>
              ) : (
                processingEvents.map((event) => {
                  const notifiedDepts = getNotifiedDepts(event.id);
                  const contacts = getEventContacts(event.id);
                  return (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleGoToEvent(event.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-1 h-16 rounded-full ${
                          event.level === 'emergency' ? 'bg-red-500' :
                          event.level === 'high' ? 'bg-orange-500' :
                          event.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-800">
                                {typeLabels[event.type]}
                              </h4>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[event.level]}`}>
                                {levelLabels[event.level]}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[event.status]}`}>
                                {statusLabels[event.status]}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {formatTime(event.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mb-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              报告人: {event.reporter}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">已联动:</span>
                              {notifiedDepts.length > 0 ? (
                                notifiedDepts.map((dept) => {
                                  const config = deptConfig[dept];
                                  if (!config) return null;
                                  const Icon = config.icon;
                                  return (
                                    <span
                                      key={dept}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${config.bgColor} ${config.color}`}
                                    >
                                      <Icon size={12} />
                                      {config.label}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-xs text-slate-400">暂未联动</span>
                              )}
                              {contacts.length > 0 && (
                                <span className="text-xs text-slate-400 ml-2">
                                  ({contacts.length} 人)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              查看详情
                              <ChevronRight size={14} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
