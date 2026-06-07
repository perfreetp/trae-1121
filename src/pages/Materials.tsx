import { useState } from 'react';
import { Package, CheckCircle, Clock, AlertTriangle, MapPin, Plus, ArrowRightLeft, Wrench } from 'lucide-react';
import { useAppStore } from '@/store';
import type { MaterialCategory, MaterialStatus } from '@/types';

const categoryLabels: Record<MaterialCategory, string> = {
  fence: '围栏',
  stretcher: '担架',
  first_aid: '急救包',
  megaphone: '扩音器',
  other: '其他',
};

const statusColors: Record<MaterialStatus, string> = {
  available: 'bg-green-100 text-green-700',
  in_use: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-orange-100 text-orange-700',
};

const statusLabels: Record<MaterialStatus, string> = {
  available: '可用',
  in_use: '使用中',
  maintenance: '维护中',
};

const categoryIcons: Record<MaterialCategory, string> = {
  fence: '🚧',
  stretcher: '🛏️',
  first_aid: '🩹',
  megaphone: '📢',
  other: '📦',
};

export default function Materials() {
  const { materials } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MaterialStatus | 'all'>('all');

  const filteredMaterials = materials.filter(m => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
    return true;
  });

  const stats = {
    total: materials.reduce((sum, m) => sum + m.quantity, 0),
    available: materials.filter(m => m.status === 'available').reduce((sum, m) => sum + m.quantity, 0),
    inUse: materials.filter(m => m.status === 'in_use').reduce((sum, m) => sum + m.quantity, 0),
    maintenance: materials.filter(m => m.status === 'maintenance').reduce((sum, m) => sum + m.quantity, 0),
  };

  const categoryStats = {
    fence: materials.filter(m => m.category === 'fence').reduce((sum, m) => sum + m.quantity, 0),
    stretcher: materials.filter(m => m.category === 'stretcher').reduce((sum, m) => sum + m.quantity, 0),
    first_aid: materials.filter(m => m.category === 'first_aid').reduce((sum, m) => sum + m.quantity, 0),
    megaphone: materials.filter(m => m.category === 'megaphone').reduce((sum, m) => sum + m.quantity, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">物资管理</h1>
          <p className="text-slate-500 mt-1">管理应急物资，确保随时可用</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <ArrowRightLeft size={18} />
            物资调度
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            新增物资
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-sm text-slate-500">物资总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.available}</p>
              <p className="text-sm text-slate-500">可用</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.inUse}</p>
              <p className="text-sm text-slate-500">使用中</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wrench className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.maintenance}</p>
              <p className="text-sm text-slate-500">维护中</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {(Object.keys(categoryStats) as MaterialCategory[]).map((cat) => (
          <div
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedCategory === cat
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-slate-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{categoryIcons[cat]}</span>
              <div>
                <p className="text-xl font-bold text-slate-800">{categoryStats[cat]}</p>
                <p className="text-sm text-slate-500">{categoryLabels[cat]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">物资台账</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">状态:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as MaterialStatus | 'all')}
                className="px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-4 gap-4">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{categoryIcons[material.category]}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[material.status]}`}>
                  {statusLabels[material.status]}
                </span>
              </div>
              <h4 className="font-medium text-slate-800 mb-1">{material.name}</h4>
              <p className="text-xs text-slate-500 mb-2">{categoryLabels[material.category]}</p>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-slate-800">
                  {material.quantity}
                  <span className="text-sm font-normal text-slate-500 ml-1">件</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin size={12} />
                  {material.location}
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                {material.status === 'available' && (
                  <button className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                    领用
                  </button>
                )}
                {material.status === 'in_use' && (
                  <button className="flex-1 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                    归还
                  </button>
                )}
                <button className="py-1.5 px-3 border border-slate-300 rounded text-xs hover:bg-slate-100">
                  详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">最近调度记录</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { type: 'borrow', material: '急救包B型', quantity: 2, operator: '李四', time: '30分钟前', remark: '扶梯B摔倒事件' },
            { type: 'return', material: '伸缩围栏', quantity: 5, operator: '张三', time: '2小时前', remark: '早高峰限流完毕' },
            { type: 'maintenance', material: '手持扩音器', quantity: 2, operator: '王五', time: '1天前', remark: '电池更换' },
          ].map((log, idx) => (
            <div key={idx} className="p-4 flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                log.type === 'borrow' ? 'bg-blue-100' :
                log.type === 'return' ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                <ArrowRightLeft size={16} className={
                  log.type === 'borrow' ? 'text-blue-600' :
                  log.type === 'return' ? 'text-green-600' : 'text-orange-600'
                } />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{log.material}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    log.type === 'borrow' ? 'bg-blue-100 text-blue-700' :
                    log.type === 'return' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {log.type === 'borrow' ? '领用' : log.type === 'return' ? '归还' : '维护'}
                  </span>
                  <span className="text-slate-600">× {log.quantity}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {log.operator} · {log.time} · {log.remark}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
