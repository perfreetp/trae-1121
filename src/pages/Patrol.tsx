import { useState } from 'react';
import { Route, MapPin, Clock, User, CheckCircle, AlertTriangle, Calendar, Edit2, Save, X, Plus, Flag } from 'lucide-react';
import { useAppStore } from '@/store';
import { mockPatrolRoutes, mockPatrolPoints } from '@/data/mockData';
import type { PatrolShift } from '@/types';

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
  const { patrolShifts, patrolRecords, updatePatrolShift, addPatrolRecord, addPatrolShift } = useAppStore();
  const [selectedRoute, setSelectedRoute] = useState(mockPatrolRoutes[0].id);
  const [selectedShift, setSelectedShift] = useState(patrolShifts[0]?.id || '');
  const [editingShift, setEditingShift] = useState<string | null>(null);
  const [showAddShift, setShowAddShift] = useState(false);
  const [checkInPoint, setCheckInPoint] = useState<string | null>(null);
  const [showAbnormalModal, setShowAbnormalModal] = useState<string | null>(null);
  const [abnormalRemark, setAbnormalRemark] = useState('');

  const [editForm, setEditForm] = useState({
    personnel: '',
    routeId: '',
  });

  const [newShiftForm, setNewShiftForm] = useState({
    shift: 'morning' as PatrolShift['shift'],
    personnel: '',
    routeId: mockPatrolRoutes[0].id,
  });

  const currentShift = patrolShifts.find(s => s.id === selectedShift);
  const currentPoints = mockPatrolPoints.filter(p => p.routeId === (currentShift?.routeId || selectedRoute));
  const currentRecords = patrolRecords.filter(r => r.shiftId === selectedShift);

  const totalPoints = currentPoints.length;
  const checkedPoints = currentRecords.length;
  const completionRate = totalPoints > 0 ? Math.round((checkedPoints / totalPoints) * 100) : 0;

  const handleShiftClick = (shift: PatrolShift) => {
    setSelectedShift(shift.id);
    setSelectedRoute(shift.routeId);
  };

  const handleStartEdit = (shift: PatrolShift) => {
    setEditingShift(shift.id);
    setEditForm({
      personnel: shift.personnel,
      routeId: shift.routeId,
    });
  };

  const handleSaveEdit = (shiftId: string) => {
    updatePatrolShift(shiftId, editForm);
    setEditingShift(null);
  };

  const handleAddShift = () => {
    if (!newShiftForm.personnel) return;
    addPatrolShift({
      ...newShiftForm,
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddShift(false);
    setNewShiftForm({
      shift: 'morning',
      personnel: '',
      routeId: mockPatrolRoutes[0].id,
    });
  };

  const handleCheckIn = (pointId: string) => {
    if (currentRecords.find(r => r.pointId === pointId)) return;
    addPatrolRecord({
      shiftId: selectedShift,
      pointId,
      checkTime: new Date().toISOString(),
      status: 'normal',
      remark: '',
    });
    setCheckInPoint(null);
  };

  const handleAbnormalSubmit = (pointId: string) => {
    if (!abnormalRemark) return;
    addPatrolRecord({
      shiftId: selectedShift,
      pointId,
      checkTime: new Date().toISOString(),
      status: 'abnormal',
      remark: abnormalRemark,
    });
    setShowAbnormalModal(null);
    setAbnormalRemark('');
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">巡查管理</h1>
          <p className="text-slate-500 mt-1">管理巡查路线、岗位安排与打卡记录</p>
        </div>
        <button
          onClick={() => setShowAddShift(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          新增班次
        </button>
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
              <p className="text-2xl font-bold text-slate-800">{patrolShifts.length}</p>
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
              <p className="text-sm text-slate-500">当前班次完成率</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
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
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar size={18} />
                今日班次
              </h3>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {patrolShifts.map((shift) => (
                <div
                  key={shift.id}
                  onClick={() => handleShiftClick(shift)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedShift === shift.id
                      ? 'bg-blue-50 border border-blue-300'
                      : 'bg-slate-50 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {editingShift === shift.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">值班人员</label>
                        <input
                          type="text"
                          value={editForm.personnel}
                          onChange={(e) => setEditForm({ ...editForm, personnel: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="如：张三、李四"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">巡查路线</label>
                        <select
                          value={editForm.routeId}
                          onChange={(e) => setEditForm({ ...editForm, routeId: e.target.value })}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {mockPatrolRoutes.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveEdit(shift.id); }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          <Save size={12} />
                          保存
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingShift(null); }}
                          className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-xs"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${shiftColors[shift.shift]}`}>
                          {shiftLabels[shift.shift]}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartEdit(shift); }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <User size={14} />
                        <span>{shift.personnel}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        路线: {mockPatrolRoutes.find(r => r.id === shift.routeId)?.name}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">完成进度</span>
                          <span className="font-medium text-slate-700">
                            {patrolRecords.filter(r => r.shiftId === shift.id).length}/{mockPatrolPoints.filter(p => p.routeId === shift.routeId).length}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{
                              width: `${mockPatrolPoints.filter(p => p.routeId === shift.routeId).length > 0
                                ? (patrolRecords.filter(r => r.shiftId === shift.id).length / mockPatrolPoints.filter(p => p.routeId === shift.routeId).length) * 100
                                : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <MapPin size={18} />
              巡查点列表
              <span className="text-xs text-slate-500 font-normal ml-2">
                ({currentShift ? mockPatrolRoutes.find(r => r.id === currentShift.routeId)?.name : '请选择班次'})
              </span>
            </h3>
          </div>
          <div className="p-4">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {currentPoints.map((point, index) => {
                  const record = currentRecords.find(r => r.pointId === point.id);
                  const isChecked = !!record;
                  const isAbnormal = record?.status === 'abnormal';

                  return (
                    <div key={point.id} className="relative pl-10">
                      <div className={`absolute left-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
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
                          : 'bg-slate-50 border border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">点位 {index + 1}</span>
                          {isAbnormal && (
                            <span className="flex items-center gap-1 text-xs text-red-600">
                              <Flag size={10} />
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
                              {formatTime(record.checkTime)}
                            </p>
                            {record.remark && (
                              <p className="text-xs text-slate-600 mt-1 bg-white p-2 rounded">
                                {record.remark}
                              </p>
                            )}
                          </div>
                        )}

                        {!isChecked && checkInPoint !== point.id && showAbnormalModal !== point.id && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => setCheckInPoint(point.id)}
                              className="flex-1 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center justify-center gap-1"
                            >
                              <CheckCircle size={12} />
                              正常打卡
                            </button>
                            <button
                              onClick={() => setShowAbnormalModal(point.id)}
                              className="flex-1 py-1.5 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 flex items-center justify-center gap-1"
                            >
                              <AlertTriangle size={12} />
                              异常上报
                            </button>
                          </div>
                        )}

                        {!isChecked && checkInPoint === point.id && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-green-700 font-medium mb-2">确认正常打卡？</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCheckIn(point.id)}
                                className="flex-1 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              >
                                确认打卡
                              </button>
                              <button
                                onClick={() => setCheckInPoint(null)}
                                className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-xs bg-white border border-slate-200 rounded"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        )}

                        {!isChecked && showAbnormalModal === point.id && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-xs text-red-700 font-medium mb-2">上报异常情况</p>
                            <textarea
                              value={abnormalRemark}
                              onChange={(e) => setAbnormalRemark(e.target.value)}
                              placeholder="请描述异常情况..."
                              rows={2}
                              className="w-full px-2 py-1.5 border border-red-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleAbnormalSubmit(point.id)}
                                disabled={!abnormalRemark}
                                className="flex-1 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                              >
                                提交上报
                              </button>
                              <button
                                onClick={() => { setShowAbnormalModal(null); setAbnormalRemark(''); }}
                                className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-xs bg-white border border-slate-200 rounded"
                              >
                                取消
                              </button>
                            </div>
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
                <CheckCircle size={18} />
                当前班次进度
              </h3>
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-slate-800">{checkedPoints}/{totalPoints}</div>
                <p className="text-sm text-slate-500 mt-1">已完成巡查点</p>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>0%</span>
                <span className="font-medium text-slate-700">{completionRate}%</span>
                <span>100%</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">当前班次</span>
                  <span className="font-medium">
                    {currentShift ? shiftLabels[currentShift.shift] : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">值班人员</span>
                  <span className="font-medium">{currentShift?.personnel || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">巡查路线</span>
                  <span className="font-medium">
                    {currentShift ? mockPatrolRoutes.find(r => r.id === currentShift.routeId)?.name : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">打卡记录</h3>
            </div>
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {currentRecords.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">暂无打卡记录</p>
              ) : (
                currentRecords.map((record) => {
                  const point = mockPatrolPoints.find(p => p.id === record.pointId);
                  return (
                    <div key={record.id} className="flex items-start gap-3 p-2 bg-slate-50 rounded">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        record.status === 'normal' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{point?.name || '未知点位'}</p>
                        <p className="text-xs text-slate-500">
                          {record.status === 'normal' ? '正常打卡' : '异常上报'} · {formatTime(record.checkTime)}
                        </p>
                        {record.remark && (
                          <p className="text-xs text-slate-600 mt-1 bg-white p-2 rounded">{record.remark}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">新增班次</h3>
              <button
                onClick={() => setShowAddShift(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">班次类型</label>
                <select
                  value={newShiftForm.shift}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, shift: e.target.value as PatrolShift['shift'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="morning">早班</option>
                  <option value="afternoon">中班</option>
                  <option value="night">夜班</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">值班人员</label>
                <input
                  type="text"
                  value={newShiftForm.personnel}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, personnel: e.target.value })}
                  placeholder="如：张三、李四"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">巡查路线</label>
                <select
                  value={newShiftForm.routeId}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, routeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mockPatrolRoutes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddShift(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleAddShift}
                disabled={!newShiftForm.personnel}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
