import { useState } from 'react';
import { FileBarChart, Clock, Users, AlertTriangle, CheckCircle, ChevronRight, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { mockReviewItems, eventTypeStats, monthlyEventTrend } from '@/data/mockData';

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#EF4444', '#6B7280'];

export default function Review() {
  const [selectedReview, setSelectedReview] = useState<string | null>(null);

  const avgDuration = Math.round(mockReviewItems.reduce((sum, r) => sum + r.duration, 0) / mockReviewItems.length);
  const totalImprovements = mockReviewItems.reduce((sum, r) => sum + r.improvements.length, 0);
  const completedImprovements = mockReviewItems.reduce((sum, r) => sum + r.improvements.filter(i => i.status === 'completed').length, 0);

  const typeLabels: Record<string, string> = {
    crowd: '客流拥挤',
    injury: '突发伤病',
    dispute: '纠纷',
    lost_item: '物品遗失',
    suspicious: '可疑人员',
    other: '其他',
  };

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
              <p className="text-2xl font-bold text-slate-800">{mockReviewItems.length}</p>
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
              <p className="text-2xl font-bold text-slate-800">{avgDuration}<span className="text-base font-normal">分钟</span></p>
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
              <p className="text-sm text-slate-500">改进项</p>
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
              <p className="text-sm text-slate-500">已完成改进</p>
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
          {mockReviewItems.map((review) => (
            <div
              key={review.id}
              className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => setSelectedReview(selectedReview === review.id ? null : review.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileBarChart size={24} className="text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-800">
                      {typeLabels[review.eventType] || review.eventType}事件复盘
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">{review.eventId}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      总时长: {review.duration} 分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {review.nodes.length} 个处理节点
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {review.improvements.length} 个改进项
                    </span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </div>

              {selectedReview === review.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 ml-16">
                  <h5 className="text-sm font-medium text-slate-700 mb-3">处置流程节点</h5>
                  <div className="flex items-start gap-2 mb-6 overflow-x-auto pb-2">
                    {review.nodes.map((node, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 min-w-[140px]">
                          <p className="text-sm font-medium text-slate-800">{node.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{node.responsible}</p>
                          <p className="text-xs text-blue-600 mt-1">{node.duration} 分钟</p>
                          <p className="text-xs text-slate-400 font-mono">{node.timestamp}</p>
                        </div>
                        {idx < review.nodes.length - 1 && (
                          <div className="mx-2 text-slate-300">
                            <ChevronRight size={20} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <h5 className="text-sm font-medium text-slate-700 mb-3">改进项跟踪</h5>
                  <div className="space-y-2">
                    {review.improvements.map((imp) => (
                      <div
                        key={imp.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            imp.status === 'completed' ? 'bg-green-500' :
                            imp.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
                          }`}>
                            {imp.status === 'completed' && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <span className="text-sm text-slate-700">{imp.content}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          imp.status === 'completed' ? 'bg-green-100 text-green-700' :
                          imp.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {imp.status === 'completed' ? '已完成' :
                           imp.status === 'in_progress' ? '进行中' : '待处理'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
