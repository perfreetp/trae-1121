import { useState } from 'react';
import { AlertTriangle, Volume2, Settings, Play, Pause, Edit2, Save, Zap } from 'lucide-react';
import { useAppStore } from '@/store';
import { stationAreaStats } from '@/data/mockData';

export default function PassengerWarning() {
  const { warningThresholds, restrictionMeasures, broadcastTemplates, updateThreshold, toggleRestrictionMeasure } = useAppStore();
  const [editingThreshold, setEditingThreshold] = useState<string | null>(null);
  const [tempYellow, setTempYellow] = useState(0);
  const [tempRed, setTempRed] = useState(0);
  const [editingBroadcast, setEditingBroadcast] = useState<string | null>(null);
  const [tempBroadcast, setTempBroadcast] = useState('');

  const handleEditThreshold = (id: string, yellow: number, red: number) => {
    setEditingThreshold(id);
    setTempYellow(yellow);
    setTempRed(red);
  };

  const handleSaveThreshold = (id: string) => {
    updateThreshold(id, tempYellow, tempRed);
    setEditingThreshold(null);
  };

  const getStatusColor = (current: number, yellow: number, red: number) => {
    if (current >= red) return 'bg-red-500';
    if (current >= yellow) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (current: number, yellow: number, red: number) => {
    if (current >= red) return { text: '红色预警', color: 'text-red-600 bg-red-50' };
    if (current >= yellow) return { text: '黄色预警', color: 'text-yellow-600 bg-yellow-50' };
    return { text: '正常', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">客流预警</h1>
          <p className="text-slate-500 mt-1">设置客流预警阈值与响应措施</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-slate-600">预警系统运行中</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Settings size={18} />
              预警阈值设置
            </h3>
            <span className="text-xs text-slate-500">单位：人</span>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {warningThresholds.map((threshold) => {
                const areaStat = stationAreaStats.find(s => s.name === threshold.area);
                const current = areaStat?.current || 0;
                const status = getStatusText(current, threshold.yellowThreshold, threshold.redThreshold);
                const percent = Math.min((current / threshold.redThreshold) * 100, 100);

                return (
                  <div key={threshold.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-slate-800">{threshold.area}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        当前: <span className="font-semibold">{current}</span> 人
                      </div>
                    </div>

                    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all"
                        style={{
                          width: `${(threshold.yellowThreshold / threshold.redThreshold) * 100}%`,
                          backgroundColor: '#FCD34D',
                          opacity: 0.3,
                        }}
                      />
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full ${getStatusColor(current, threshold.yellowThreshold, threshold.redThreshold)}`}
                        style={{ width: `${percent}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-0.5 bg-yellow-600"
                        style={{ left: `${(threshold.yellowThreshold / threshold.redThreshold) * 100}%` }}
                      />
                    </div>

                    {editingThreshold === threshold.id ? (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-yellow-600">黄色阈值:</span>
                          <input
                            type="number"
                            value={tempYellow}
                            onChange={(e) => setTempYellow(Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-600">红色阈值:</span>
                          <input
                            type="number"
                            value={tempRed}
                            onChange={(e) => setTempRed(Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => handleSaveThreshold(threshold.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          <Save size={14} />
                          保存
                        </button>
                        <button
                          onClick={() => setEditingThreshold(null)}
                          className="px-3 py-1 text-slate-600 hover:text-slate-800 text-sm"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-yellow-400"></span>
                            黄色预警: {threshold.yellowThreshold} 人
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-red-500"></span>
                            红色预警: {threshold.redThreshold} 人
                          </span>
                        </div>
                        <button
                          onClick={() => handleEditThreshold(threshold.id, threshold.yellowThreshold, threshold.redThreshold)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 size={14} />
                          编辑
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Zap size={18} />
                限流措施
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {restrictionMeasures.map((measure) => (
                <div
                  key={measure.id}
                  className={`p-3 rounded-lg border transition-all ${
                    measure.enabled
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm text-slate-800">{measure.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{measure.description}</p>
                    </div>
                    <button
                      onClick={() => toggleRestrictionMeasure(measure.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        measure.enabled ? 'bg-orange-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          measure.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <AlertTriangle size={12} className={measure.enabled ? 'text-orange-500' : 'text-slate-400'} />
                    <span className={measure.enabled ? 'text-orange-600' : 'text-slate-500'}>
                      触发条件: {measure.threshold}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Volume2 size={18} />
                广播模板
              </h3>
            </div>
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {broadcastTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => {
                    setEditingBroadcast(template.id);
                    setTempBroadcast(template.content);
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm text-slate-800">{template.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      template.category === 'emergency' ? 'bg-red-100 text-red-700' :
                      template.category === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {template.category === 'emergency' ? '紧急' : template.category === 'warning' ? '预警' : '常规'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{template.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                      <Play size={12} />
                      试听
                    </button>
                    <button className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                      <Volume2 size={12} />
                      立即广播
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
