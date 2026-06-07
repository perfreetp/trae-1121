import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Clock,
  User,
  AlertCircle,
  Phone,
  Package,
  CheckCircle,
  ChevronRight,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { HandoverRecord } from '@/types';

const shiftLabels: Record<string, string> = {
  morning: '早班',
  afternoon: '中班',
  night: '晚班',
};

const typeLabels: Record<string, string> = {
  crowd: '客流拥挤',
  injury: '突发伤病',
  dispute: '纠纷',
  lost_item: '物品遗失',
  suspicious: '可疑人员',
  other: '其他',
};

const levelColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
};

const levelLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  emergency: '紧急',
};

const deptLabels: Record<string, string> = {
  police: '警务',
  medical: '医护',
  fire: '消防',
  station: '站务',
  operation: '运营',
};

const statusLabels: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  closed: '已关闭',
  rejected: '已退回',
};

export default function Handover() {
  const navigate = useNavigate();
  const {
    events,
    eventContactLogs,
    materials,
    handoverRecords,
    createHandoverRecord,
    confirmHandoverRecord,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [selectedRecord, setSelectedRecord] = useState<HandoverRecord | null>(null);
  const [formData, setFormData] = useState({
    shift: 'morning' as 'morning' | 'afternoon' | 'night',
    outgoingOfficer: '张站长',
    incomingOfficer: '',
    remark: '',
  });

  const pendingEvents = events.filter((e) => e.status === 'pending' || e.status === 'processing');
  const activeContacts = eventContactLogs;
  const activeMaterials = materials.filter((m) => m.status === 'in_use' || m.quantity < 5);

  const handleCreateHandover = () => {
    if (!formData.incomingOfficer) {
      alert('请填写接班人');
      return;
    }

    const eventSnapshots = pendingEvents.map((e) => ({
      id: e.id,
      type: e.type,
      level: e.level,
      location: e.location,
      status: e.status,
      description: e.description,
    }));

    const contactSnapshots = activeContacts.map((c) => ({
      id: c.id,
      eventId: c.eventId,
      contactName: c.contactName,
      department: c.department,
      notifyTime: c.notifyTime,
    }));

    const materialSnapshots = activeMaterials.map((m) => ({
      id: m.id,
      name: m.name,
      quantity: m.quantity,
      location: m.location,
      status: m.status,
    }));

    createHandoverRecord({
      shift: formData.shift,
      date: new Date().toISOString().split('T')[0],
      outgoingOfficer: formData.outgoingOfficer,
      incomingOfficer: formData.incomingOfficer,
      remark: formData.remark,
      pendingEvents: eventSnapshots,
      pendingContacts: contactSnapshots,
      activeMaterials: materialSnapshots,
      confirmed: false,
    });

    alert('交接记录已创建');
    setActiveTab('history');
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (selectedRecord) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedRecord(null)}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft size={18} />
            返回
          </button>
          <h2 className="text-xl font-bold text-slate-800">交接记录详情</h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">
                  {shiftLabels[selectedRecord.shift]}交接 - {selectedRecord.date}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  交班人：{selectedRecord.outgoingOfficer} → 接班人：{selectedRecord.incomingOfficer}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedRecord.confirmed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {selectedRecord.confirmed ? '已确认' : '待确认'}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                <AlertCircle size={16} />
                未完成事件 ({selectedRecord.pendingEvents.length})
              </h4>
              <div className="space-y-2">
                {selectedRecord.pendingEvents.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100"
                    onClick={() => navigate('/event-handling', { state: { highlightEventId: e.id } })}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[e.level]}`}>
                        {levelLabels[e.level]}
                      </span>
                      <span className="font-medium text-slate-800">{typeLabels[e.type]}</span>
                      <span className="text-sm text-slate-500 ml-auto">{statusLabels[e.status]}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{e.location}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                <Phone size={16} />
                已通知联动记录 ({selectedRecord.pendingContacts.length})
              </h4>
              <div className="space-y-2">
                {selectedRecord.pendingContacts.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{c.contactName}</span>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        {deptLabels[c.department]}
                      </span>
                      <span className="text-xs text-slate-500 ml-auto">{formatTime(c.notifyTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                <Package size={16} />
                使用中物资 ({selectedRecord.activeMaterials.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedRecord.activeMaterials.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-medium text-slate-800">{m.name}</div>
                    <p className="text-xs text-slate-500 mt-1">
                      数量: {m.quantity} · {m.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {selectedRecord.remark && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  交接说明
                </h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {selectedRecord.remark}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">值班交接</h2>
          <p className="text-sm text-slate-500 mt-1">管理交接班记录，确保事项无缝衔接</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'create'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              创建交接
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              交接记录
            </button>
          </div>
        </div>

        {activeTab === 'create' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">班次</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="morning">早班</option>
                  <option value="afternoon">中班</option>
                  <option value="night">晚班</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">交班人</label>
                <input
                  type="text"
                  value={formData.outgoingOfficer}
                  onChange={(e) => setFormData({ ...formData, outgoingOfficer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">接班人 *</label>
                <input
                  type="text"
                  value={formData.incomingOfficer}
                  onChange={(e) => setFormData({ ...formData, incomingOfficer: e.target.value })}
                  placeholder="请输入接班人姓名"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-700 mb-2">
                  <AlertCircle size={18} />
                  <span className="font-medium">未完成事件</span>
                </div>
                <div className="text-3xl font-bold text-orange-700">{pendingEvents.length}</div>
                <p className="text-xs text-orange-600 mt-1">待处理 + 处理中</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Phone size={18} />
                  <span className="font-medium">联动通知</span>
                </div>
                <div className="text-3xl font-bold text-blue-700">{activeContacts.length}</div>
                <p className="text-xs text-blue-600 mt-1">已通知未闭环</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Package size={18} />
                  <span className="font-medium">使用中物资</span>
                </div>
                <div className="text-3xl font-bold text-green-700">{activeMaterials.length}</div>
                <p className="text-xs text-green-600 mt-1">未归还或低库存</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">交接说明</label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                rows={3}
                placeholder="请填写需要特别说明的事项..."
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveTab('history')}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleCreateHandover}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                创建交接记录
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="divide-y divide-slate-100">
            {handoverRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <ArrowLeftRight size={48} className="mx-auto mb-3 text-slate-300" />
                <p>暂无交接记录</p>
              </div>
            ) : (
              handoverRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <ArrowLeftRight size={20} className="text-slate-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">
                          {record.date} {shiftLabels[record.shift]}交接
                        </h4>
                        <p className="text-sm text-slate-500">
                          {record.outgoingOfficer} → {record.incomingOfficer}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <AlertCircle size={12} />
                          {record.pendingEvents.length} 件事件
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Package size={12} />
                          {record.activeMaterials.length} 项物资
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.confirmed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.confirmed ? '已确认' : '待确认'}
                      </span>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
