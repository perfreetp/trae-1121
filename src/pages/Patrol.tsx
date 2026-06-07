import { useState } from 'react';
import { Route, MapPin, Clock, User, CheckCircle, AlertTriangle, Calendar, Map } from 'lucide-react';
import { mockPatrolRoutes, mockPatrolPoints, mockPatrolShifts, mockPatrolRecords } from '@/data/mockData';

const shiftLabels = {
  morning: '早班',
  afternoon: '中班',
  night: '夜班',
};

const shiftColors = {
  morning: 'bg-blue-100 text-blue-700',
  afternoon: 'bg-orange-100 text-orange-700',
  night: 'bg-purple-100 text-purple-700',
};

export default function Patrol() {
  const [selectedRoute, setSelectedRoute] = useState(mockPatrolRoutes[0].id);
  const [selectedShift, setSelectedShift] = useState(mockPatrolShifts[0].id);

  const currentPoints = mockPatrolPoints.filter(p => p.routeId === selectedRoute);
  const currentShift = mockPatrolShifts.find(s => s.id === selectedShift);
  const currentRecords = mockPatrolRecords.filter(r => r.shiftId === selectedShift);

  const totalPoints = currentPoints.length;
  const checkedPoints = currentRecords.length;
  const completionRate = totalPoints > 0 ? Math.round((checkedPoints / totalPoints) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">巡查管理</h1>
          <p className="text-slate-500 mt-1">管理巡查路线、岗位安排与打卡记录</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Route className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{mockPatrolRoutes.length}</p>
              <p className="text-sm text-slate-500">巡查路线</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{mockPatrolPoints.length}</p>
              <p className="text-sm text-slate-500">巡查点</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{mockPatrolShifts.length}</p>
              <p className="text-sm text-slate-500">今日班次</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{completionRate}%</p>
              <p className="text-sm text-slate-500">当前完成率</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Route size={18} />
              巡查路线
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {mockPatrolRoutes.map((route) => (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedRoute === route.id
                    ? 'bg-blue-50 border border-blue-300'
                    : 'bg-slate-50 border border-transparent hover:border-slate-200'
                }`}
              >
                <h4 className="font-medium text-sm text-slate-800">{route.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{route.description}</p>
                <p className="text-xs text-blue-600 mt-2">
                  {mockPatrolPoints.filter(p => p.routeId === route.id).length} 个巡查点
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <MapPin size={18} />
              巡查点列表
            </h3>
          </div>
          <div className="p-4">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              <div className="space-y-4">
                {currentPoints.map((point, index) => {
                  const record = currentRecords.find(r => r.pointId === point.id);
                  const isChecked = !!record;
                  const isAbnormal = record?.status === 'abnormal';

                  return (
                    <div key={point.id} className="relative pl-10">
                      <div className={`absolute left-2.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isChecked
                          ? isAbnormal
                            ? 'bg-red-500 border-red-500'
                            : 'bg-green-500 border-green-500'
                          : 'bg-white border-slate-300'
                      }`}>
                        {isChecked && (
                          <span className="text-white text-[8px]">✓</span>
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        isChecked
                          ? isAbnormal
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-green-50 border border-green-200'
                          : 'bg-slate-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">点位 {index + 1}</span>
                          {isAbnormal && (
                            <span className="flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle size={10} />
                              异常
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-sm text-slate-800 mt-1">{point.name}</h4>
                        <p className="text-xs text-slate-500">{point.location}</p>
                        {isChecked && record && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(record.checkTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {record.remark && (
                              <p className="text-xs text-slate-600 mt-1">{record.remark}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar size={18} />
                今日班次
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {mockPatrolShifts.map((shift) => (
                <div
                  key={shift.id}
                  onClick={() => setSelectedShift(shift.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedShift === shift.id
                      ? 'bg-blue-50 border border-blue-300'
                      : 'bg-slate-50 border border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${shiftColors[shift.shift]}`}>
                      {shiftLabels[shift.shift]}
                    </span>
                    <span className="text-xs text-slate-500">{shift.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <User size={14} />
                    <span>{shift.personnel}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    路线: {mockPatrolRoutes.find(r => r.id === shift.routeId)?.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle size={18} />
                完成进度
              </h3>
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-slate-800">{checkedPoints}/{totalPoints}</div>
                <p className="text-sm text-slate-500 mt-1">已完成巡查点</p>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>0%</span>
                <span className="font-medium text-slate-700">{completionRate}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
