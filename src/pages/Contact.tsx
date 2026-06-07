import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  MessageSquare,
  Bell,
  Shield,
  Heart,
  Flame,
  Users,
  Radio,
  Check,
  MapPin,
  Clock,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { mockContacts } from '@/data/mockData';
import type { Department } from '@/types';

const deptConfig: Record<Department, { label: string; icon: typeof Shield; color: string; bgColor: string }> = {
  police: { label: '警务', icon: Shield, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  medical: { label: '医护', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-100' },
  fire: { label: '消防', icon: Flame, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  station: { label: '站务', icon: Users, color: 'text-green-600', bgColor: 'bg-green-100' },
  operation: { label: '运营', icon: Radio, color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

const typeLabels: Record<string, string> = {
  crowd: '客流拥挤',
  injury: '突发伤病',
  dispute: '纠纷',
  lost_item: '物品遗失',
  suspicious: '可疑人员',
  other: '其他',
};

export default function Contact() {
  const navigate = useNavigate();
  const { events, eventContactLogs } = useAppStore();
  const [selectedDept, setSelectedDept] = useState<Department | 'all'>('all');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const filteredContacts = selectedDept === 'all'
    ? mockContacts
    : mockContacts.filter((c) => c.department === selectedDept);

  const deptCounts = {
    police: mockContacts.filter((c) => c.department === 'police').length,
    medical: mockContacts.filter((c) => c.department === 'medical').length,
    fire: mockContacts.filter((c) => c.department === 'fire').length,
    station: mockContacts.filter((c) => c.department === 'station').length,
    operation: mockContacts.filter((c) => c.department === 'operation').length,
  };

  const handleQuickNotify = (dept: Department) => {
    setNotificationStatus(dept);
    setTimeout(() => setNotificationStatus(null), 2000);
  };

  const getEventInfo = (eventId: string) => {
    return events.find((e) => e.id === eventId);
  };

  const handleGoToEvent = (eventId: string) => {
    navigate('/event-handling', { state: { highlightEventId: eventId } });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedLogs = [...eventContactLogs].sort(
    (a, b) => new Date(b.notifyTime).getTime() - new Date(a.notifyTime).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">联动联络</h1>
          <p className="text-slate-500 mt-1">一键通知各部门，快速响应突发事件</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {(Object.keys(deptConfig) as Department[]).map((dept) => {
          const config = deptConfig[dept];
          const Icon = config.icon;
          const isNotifying = notificationStatus === dept;

          return (
            <button
              key={dept}
              onClick={() => handleQuickNotify(dept)}
              className={`p-5 rounded-xl border-2 transition-all ${
                isNotifying
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-xl ${config.bgColor} flex items-center justify-center transition-transform ${isNotifying ? 'scale-110' : ''}`}>
                  {isNotifying ? (
                    <Check className={config.color} size={28} />
                  ) : (
                    <Icon className={config.color} size={28} />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800">{config.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{deptCounts[dept]} 人待命</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                  isNotifying
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {isNotifying ? '已通知' : '一键通知'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">联系人列表</h3>
            <div className="flex items-center gap-2">
              {(Object.keys(deptConfig) as Department[]).map((dept) => {
                const config = deptConfig[dept];
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(selectedDept === dept ? 'all' : dept)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      selectedDept === dept
                        ? `${config.bgColor} ${config.color}`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
              <button
                onClick={() => setSelectedDept('all')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  selectedDept === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                全部
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredContacts.map((contact) => {
              const config = deptConfig[contact.department];
              const Icon = config.icon;

              return (
                <div key={contact.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={config.color} size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-800">{contact.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${config.bgColor} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{contact.role}</p>
                      <p className="text-sm text-slate-600 font-mono mt-1">{contact.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                        <Phone size={18} />
                      </button>
                      <button className="p-2.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <MessageSquare size={18} />
                      </button>
                      <button className="p-2.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                        <Bell size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">紧急广播</h3>
            </div>
            <div className="p-4 space-y-3">
              <button className="w-full p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bell className="text-white" size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-red-700">全站紧急疏散广播</p>
                    <p className="text-xs text-red-500">立即触发全站疏散广播</p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Radio className="text-white" size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-orange-700">区域限流广播</p>
                    <p className="text-xs text-orange-500">通知客流拥挤区域</p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="text-white" size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-blue-700">警务联动呼叫</p>
                    <p className="text-xs text-blue-500">一键呼叫驻站民警</p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="text-white" size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-green-700">医疗急救呼叫</p>
                    <p className="text-xs text-green-500">通知急救人员到位</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">通知记录</h3>
              <span className="text-xs text-slate-500">{sortedLogs.length} 条记录</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {sortedLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <Bell size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">暂无通知记录</p>
                </div>
              ) : (
                sortedLogs.map((log) => {
                  const event = getEventInfo(log.eventId);
                  const deptConfigItem = deptConfig[log.department];
                  const DeptIcon = deptConfigItem?.icon || Users;

                  return (
                    <div
                      key={log.id}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleGoToEvent(log.eventId)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${deptConfigItem?.bgColor || 'bg-slate-100'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <DeptIcon className={deptConfigItem?.color || 'text-slate-600'} size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                通知 {log.contactName}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {deptConfigItem?.label || log.department} · {log.remark}
                              </p>
                            </div>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0 mt-1" />
                          </div>

                          {event && (
                            <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <FileText size={12} className="text-blue-500" />
                                <span className="font-medium">{typeLabels[event.type] || event.type}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <MapPin size={10} />
                                  {event.location}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock size={10} />
                              {formatTime(log.notifyTime)}
                            </span>
                            <span className="text-xs text-slate-400">
                              操作人: {log.operator}
                            </span>
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
      </div>
    </div>
  );
}
