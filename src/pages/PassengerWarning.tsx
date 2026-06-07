import { useState } from 'react';
import { AlertTriangle, Bell, Radio, Edit2, Save, X, Play, Volume2, Clock, User } from 'lucide-react';
import { useAppStore } from '@/store';

export default function PassengerWarning() {
  const {
    warningThresholds,
    restrictionMeasures,
    broadcastTemplates,
    broadcastLogs,
    updateThreshold,
    toggleRestrictionMeasure,
    updateBroadcastTemplate,
    addBroadcastLog,
  } = useAppStore();

  const [editingThreshold, setEditingThreshold] = useState<string | null>(null);
  const [thresholdForm, setThresholdForm] = useState({ yellow: 0, red: 0 });
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: '', content: '' });

  const handleStartEditThreshold = (threshold: typeof warningThresholds[0]) => {
    setEditingThreshold(threshold.id);
    setThresholdForm({
      yellow: threshold.yellowThreshold,
      red: threshold.redThreshold,
    });
  };

  const handleSaveThreshold = (id: string) => {
    updateThreshold(id, thresholdForm.yellow, thresholdForm.red);
    setEditingThreshold(null);
  };

  const handleStartEditTemplate = (template: typeof broadcastTemplates[0]) => {
    setEditingTemplate(template.id);
    setTemplateForm({
      name: template.name,
      content: template.content,
    });
  };

  const handleSaveTemplate = (id: string) => {
    updateBroadcastTemplate(id, templateForm);
    setEditingTemplate(null);
  };

  const handlePreview = (template: typeof broadcastTemplates[0]) => {
    addBroadcastLog({
      templateId: template.id,
      templateName: template.name,
      type: 'preview',
      operator: '值班员',
    });
  };

  const handleBroadcast = (template: typeof broadcastTemplates[0]) => {
    addBroadcastLog({
      templateId: template.id,
      templateName: template.name,
      type: 'broadcast',
      operator: '值班员',
    });
  };

  const getStatusColor = (current: number, yellow: number, red: number) => {
    if (current >= red) return 'text-red-600 bg-red-100';
    if (current >= yellow) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (current: number, yellow: number, red: number) => {
    if (current >= red) return '红色预警';
    if (current >= yellow) return '黄色预警';
    return '正常';
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">客流预警</h1>
        <p className="text-slate-500 mt-1">配置客流预警阈值、限流措施和广播模板</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} />
              预警阈值设置
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {warningThresholds.map((threshold) => {
              const isEditing = editingThreshold === threshold.id;
              return (
                <div key={threshold.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-800">{threshold.areaName}</h4>
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEditThreshold(threshold)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-3 ${
                    getStatusColor(threshold.currentCount, threshold.yellowThreshold, threshold.redThreshold)
                  }`}>
                    {getStatusText(threshold.currentCount, threshold.yellowThreshold, threshold.redThreshold)}
                  </div>

                  <p className="text-sm text-slate-600 mb-3">
                    当前客流: <span className="font-bold text-slate-800">{threshold.currentCount}</span> 人
                  </p>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">黄色预警阈值</label>
                        <input
                          type="number"
                          value={thresholdForm.yellow}
                          onChange={(e) => setThresholdForm({ ...thresholdForm, yellow: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">红色预警阈值</label>
                        <input
                          type="number"
                          value={thresholdForm.red}
                          onChange={(e) => setThresholdForm({ ...thresholdForm, red: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveThreshold(threshold.id)}
                          className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center justify-center gap-1"
                        >
                          <Save size={12} />
                          保存
                        </button>
                        <button
                          onClick={() => setEditingThreshold(null)}
                          className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-xs"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">黄色预警</span>
                        <span className="font-medium text-orange-600">{threshold.yellowThreshold} 人</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">红色预警</span>
                        <span className="font-medium text-red-600">{threshold.redThreshold} 人</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Radio size={18} />
              限流措施
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {restrictionMeasures.map((measure) => (
              <div key={measure.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm text-slate-800">{measure.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{measure.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={measure.enabled}
                    onChange={() => toggleRestrictionMeasure(measure.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Bell size={18} />
                广播模板
              </h3>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {broadcastTemplates.map((template) => {
                const isEditing = editingTemplate === template.id;
                return (
                  <div key={template.id} className="p-4 bg-slate-50 rounded-lg">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">模板名称</label>
                          <input
                            type="text"
                            value={templateForm.name}
                            onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">广播内容</label>
                          <textarea
                            value={templateForm.content}
                            onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                            rows={3}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveTemplate(template.id)}
                            className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center justify-center gap-1"
                          >
                            <Save size={12} />
                            保存
                          </button>
                          <button
                            onClick={() => setEditingTemplate(null)}
                            className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-xs"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm text-slate-800">{template.name}</h4>
                          <button
                            onClick={() => handleStartEditTemplate(template)}
                            className="p-1 text-slate-400 hover:text-blue-600"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 bg-white p-2 rounded mb-3">{template.content}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(template)}
                            className="flex-1 py-1.5 bg-slate-600 text-white rounded text-xs hover:bg-slate-700 flex items-center justify-center gap-1"
                          >
                            <Play size={12} />
                            试听
                          </button>
                          <button
                            onClick={() => handleBroadcast(template)}
                            className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center justify-center gap-1"
                          >
                            <Volume2 size={12} />
                            立即广播
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Clock size={18} />
                操作记录
              </h3>
            </div>
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
              {broadcastLogs.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">暂无操作记录</p>
              ) : (
                broadcastLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2 bg-slate-50 rounded">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      log.type === 'preview' ? 'bg-slate-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          log.type === 'preview'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {log.type === 'preview' ? '试听' : '广播'}
                        </span>
                        <span className="text-sm font-medium text-slate-800 truncate">{log.templateName}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <User size={10} />
                        {log.operator}
                        <span>·</span>
                        {formatTime(log.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
