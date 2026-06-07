import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Box, AlertCircle, ArrowRightLeft, Plus, X, Eye, ArrowUpCircle, ArrowDownCircle, Clock, User, FileText } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Material } from '@/types';

const categoryLabels: Record<string, string> = {
  fence: '围栏',
  stretcher: '担架',
  firstAid: '急救包',
  megaphone: '扩音器',
};

const statusLabels: Record<string, string> = {
  available: '可用',
  in_use: '使用中',
  maintenance: '维护中',
};

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  in_use: 'bg-orange-100 text-orange-700',
  maintenance: 'bg-red-100 text-red-700',
};

const logTypeLabels: Record<string, string> = {
  borrow: '领用',
  return: '归还',
  dispatch: '调度',
  maintain: '维护',
};

const logTypeColors: Record<string, string> = {
  borrow: 'bg-orange-100 text-orange-700',
  return: 'bg-green-100 text-green-700',
  dispatch: 'bg-blue-100 text-blue-700',
  maintain: 'bg-red-100 text-red-700',
};

const typeLabels: Record<string, string> = {
  crowd: '客流拥挤',
  injury: '突发伤病',
  dispute: '纠纷',
  lost_item: '物品遗失',
  suspicious: '可疑人员',
  other: '其他',
};

export default function Materials() {
  const navigate = useNavigate();
  const { materials, materialLogs, events, addMaterial, updateMaterial, borrowMaterial, returnMaterial, dispatchMaterial, addMaterialLog } = useAppStore();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<Material | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState<Material | null>(null);
  const [showReturnModal, setShowReturnModal] = useState<Material | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState<Material | null>(null);

  const [newMaterialForm, setNewMaterialForm] = useState({
    name: '',
    category: 'fence' as Material['category'],
    quantity: 1,
    location: '',
    status: 'available' as Material['status'],
  });

  const [borrowForm, setBorrowForm] = useState({
    quantity: 1,
    operator: '',
    remark: '',
  });

  const [returnForm, setReturnForm] = useState({
    quantity: 1,
    operator: '',
    remark: '',
  });

  const [dispatchForm, setDispatchForm] = useState({
    fromLocation: '',
    toLocation: '',
    quantity: 1,
    operator: '',
    remark: '',
  });

  const filteredMaterials = filterCategory === 'all'
    ? materials
    : materials.filter((m) => m.category === filterCategory);

  const totalMaterials = materials.reduce((sum, m) => sum + m.quantity, 0);
  const availableMaterials = materials.filter((m) => m.status === 'available').reduce((sum, m) => sum + m.quantity, 0);
  const inUseMaterials = materials.filter((m) => m.status === 'in_use').reduce((sum, m) => sum + m.quantity, 0);
  const maintenanceMaterials = materials.filter((m) => m.status === 'maintenance').reduce((sum, m) => sum + m.quantity, 0);

  const handleAddMaterial = () => {
    if (!newMaterialForm.name || !newMaterialForm.location) return;
    addMaterial(newMaterialForm);
    setShowAddModal(false);
    setNewMaterialForm({
      name: '',
      category: 'fence',
      quantity: 1,
      location: '',
      status: 'available',
    });
  };

  const handleBorrow = () => {
    if (!showBorrowModal || !borrowForm.operator) return;
    if (borrowForm.quantity <= 0 || borrowForm.quantity > showBorrowModal.quantity) {
      alert(`领用数量不合法！当前可用数量：${showBorrowModal.quantity}`);
      return;
    }
    const success = borrowMaterial(showBorrowModal.id, borrowForm.quantity, borrowForm.operator, borrowForm.remark);
    if (!success) {
      alert('领用失败，请检查库存数量');
      return;
    }
    setShowBorrowModal(null);
    setBorrowForm({ quantity: 1, operator: '', remark: '' });
  };

  const handleReturn = () => {
    if (!showReturnModal || !returnForm.operator) return;
    if (returnForm.quantity <= 0) {
      alert('归还数量必须大于0！');
      return;
    }
    const success = returnMaterial(showReturnModal.id, returnForm.quantity, returnForm.operator, returnForm.remark);
    if (!success) {
      alert('归还失败');
      return;
    }
    setShowReturnModal(null);
    setReturnForm({ quantity: 1, operator: '', remark: '' });
  };

  const handleDispatch = () => {
    if (!showDispatchModal || !dispatchForm.operator || !dispatchForm.toLocation) return;
    if (dispatchForm.quantity <= 0 || dispatchForm.quantity > showDispatchModal.quantity) {
      alert(`调度数量不合法！当前可用数量：${showDispatchModal.quantity}`);
      return;
    }
    const success = dispatchMaterial(
      showDispatchModal.id,
      dispatchForm.fromLocation,
      dispatchForm.toLocation,
      dispatchForm.quantity,
      dispatchForm.operator,
      dispatchForm.remark
    );
    if (!success) {
      alert('调度失败，请检查库存数量');
      return;
    }
    setShowDispatchModal(null);
    setDispatchForm({ fromLocation: showDispatchModal.location, toLocation: '', quantity: 1, operator: '', remark: '' });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMaterialName = (id: string) => {
    return materials.find((m) => m.id === id)?.name || '未知物资';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">物资管理</h1>
          <p className="text-slate-500 mt-1">管理应急物资台账、调度和领用记录</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          新增物资
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalMaterials}</p>
              <p className="text-sm text-slate-500">物资总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Box className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{availableMaterials}</p>
              <p className="text-sm text-slate-500">可用</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{inUseMaterials}</p>
              <p className="text-sm text-slate-500">使用中</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{maintenanceMaterials}</p>
              <p className="text-sm text-slate-500">维护中</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">物资台账</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1 rounded text-sm ${
                  filterCategory === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                全部
              </button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key)}
                  className={`px-3 py-1 rounded text-sm ${
                    filterCategory === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {filteredMaterials.map((material) => (
                <div key={material.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-slate-800">{material.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {categoryLabels[material.category]} · {material.location}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[material.status]}`}>
                      {statusLabels[material.status]}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-2xl font-bold text-slate-800">{material.quantity}</div>
                    <span className="text-sm text-slate-500">件</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDetailModal(material)}
                      className="flex-1 py-1.5 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300 flex items-center justify-center gap-1"
                    >
                      <Eye size={12} />
                      详情
                    </button>
                    <button
                      onClick={() => {
                        setShowBorrowModal(material);
                        setBorrowForm({ ...borrowForm, quantity: 1 });
                      }}
                      disabled={material.quantity <= 0 || material.status === 'maintenance'}
                      className="flex-1 py-1.5 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUpCircle size={12} />
                      领用
                    </button>
                    <button
                      onClick={() => {
                        setShowReturnModal(material);
                        setReturnForm({ ...returnForm, quantity: 1 });
                      }}
                      className="flex-1 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      <ArrowDownCircle size={12} />
                      归还
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowDispatchModal(material);
                      setDispatchForm({
                        ...dispatchForm,
                        fromLocation: material.location,
                        toLocation: '',
                        quantity: 1,
                      });
                    }}
                    className="w-full mt-2 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <ArrowRightLeft size={12} />
                    调度
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">调度记录</h3>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {materialLogs.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">暂无调度记录</p>
            ) : (
              materialLogs.slice(0, 20).map((log) => {
                const event = log.eventId ? events.find((e) => e.id === log.eventId) : null;
                return (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${logTypeColors[log.type]}`}>
                        {logTypeLabels[log.type]}
                      </span>
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {getMaterialName(log.materialId)}
                      </span>
                      <span className="text-xs text-slate-500">x{log.quantity}</span>
                    </div>
                    <p className="text-xs text-slate-600">{log.remark}</p>
                    {event && (
                      <div
                        className="mt-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors"
                        onClick={() => navigate('/event-handling', { state: { highlightEventId: event.id } })}
                      >
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <FileText size={10} />
                          <span className="font-medium">{typeLabels[event.type] || event.type}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{event.location}</p>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <User size={10} />
                      {log.operator}
                      <span>·</span>
                      <Clock size={10} />
                      {formatTime(log.timestamp)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[450px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">新增物资</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">物资名称</label>
                <input
                  type="text"
                  value={newMaterialForm.name}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, name: e.target.value })}
                  placeholder="如：不锈钢伸缩围栏"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">物资类别</label>
                  <select
                    value={newMaterialForm.category}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, category: e.target.value as Material['category'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">数量</label>
                  <input
                    type="number"
                    value={newMaterialForm.quantity}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, quantity: Number(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">存放位置</label>
                <input
                  type="text"
                  value={newMaterialForm.location}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, location: e.target.value })}
                  placeholder="如：站厅西物资间"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                <select
                  value={newMaterialForm.status}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, status: e.target.value as Material['status'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800">
                取消
              </button>
              <button
                onClick={handleAddMaterial}
                disabled={!newMaterialForm.name || !newMaterialForm.location}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">物资详情</h3>
              <button onClick={() => setShowDetailModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-slate-800">{showDetailModal.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[showDetailModal.status]}`}>
                  {statusLabels[showDetailModal.status]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">物资类别</p>
                  <p className="font-medium text-slate-800 mt-1">{categoryLabels[showDetailModal.category]}</p>
                </div>
                <div>
                  <p className="text-slate-500">当前数量</p>
                  <p className="font-medium text-slate-800 mt-1">{showDetailModal.quantity} 件</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500">存放位置</p>
                  <p className="font-medium text-slate-800 mt-1">{showDetailModal.location}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button onClick={() => setShowDetailModal(null)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showBorrowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">领用物资</h3>
              <button onClick={() => setShowBorrowModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600">
                正在领用：<span className="font-medium text-slate-800">{showBorrowModal.name}</span>
                <span className="ml-2 text-slate-500">(可用: {showBorrowModal.quantity} 件)</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">领用数量</label>
                <input
                  type="number"
                  value={borrowForm.quantity}
                  onChange={(e) => {
                    const val = Math.min(Math.max(Number(e.target.value), 1), showBorrowModal.quantity);
                    setBorrowForm({ ...borrowForm, quantity: val });
                  }}
                  min={1}
                  max={showBorrowModal.quantity}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">领用人</label>
                <input
                  type="text"
                  value={borrowForm.operator}
                  onChange={(e) => setBorrowForm({ ...borrowForm, operator: e.target.value })}
                  placeholder="请输入领用人姓名"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={borrowForm.remark}
                  onChange={(e) => setBorrowForm({ ...borrowForm, remark: e.target.value })}
                  rows={2}
                  placeholder="用途说明等"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowBorrowModal(null)} className="px-4 py-2 text-slate-600 hover:text-slate-800">
                取消
              </button>
              <button
                onClick={handleBorrow}
                disabled={!borrowForm.operator || borrowForm.quantity <= 0 || borrowForm.quantity > showBorrowModal.quantity}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
              >
                确认领用
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">归还物资</h3>
              <button onClick={() => setShowReturnModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600">
                正在归还：<span className="font-medium text-slate-800">{showReturnModal.name}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">归还数量</label>
                <input
                  type="number"
                  value={returnForm.quantity}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), 1);
                    setReturnForm({ ...returnForm, quantity: val });
                  }}
                  min={1}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">归还人</label>
                <input
                  type="text"
                  value={returnForm.operator}
                  onChange={(e) => setReturnForm({ ...returnForm, operator: e.target.value })}
                  placeholder="请输入归还人姓名"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={returnForm.remark}
                  onChange={(e) => setReturnForm({ ...returnForm, remark: e.target.value })}
                  rows={2}
                  placeholder="归还状态说明等"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowReturnModal(null)} className="px-4 py-2 text-slate-600 hover:text-slate-800">
                取消
              </button>
              <button
                onClick={handleReturn}
                disabled={!returnForm.operator || returnForm.quantity <= 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                确认归还
              </button>
            </div>
          </div>
        </div>
      )}

      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">物资调度</h3>
              <button onClick={() => setShowDispatchModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600">
                调度物资：<span className="font-medium text-slate-800">{showDispatchModal.name}</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">调出位置</label>
                  <input
                    type="text"
                    value={dispatchForm.fromLocation}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, fromLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">调入位置</label>
                  <input
                    type="text"
                    value={dispatchForm.toLocation}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, toLocation: e.target.value })}
                    placeholder="请输入目标位置"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">调度数量</label>
                <input
                  type="number"
                  value={dispatchForm.quantity}
                  onChange={(e) => {
                    const val = Math.min(Math.max(Number(e.target.value), 1), showDispatchModal.quantity);
                    setDispatchForm({ ...dispatchForm, quantity: val });
                  }}
                  min={1}
                  max={showDispatchModal.quantity}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">调度人</label>
                <input
                  type="text"
                  value={dispatchForm.operator}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, operator: e.target.value })}
                  placeholder="请输入调度人姓名"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={dispatchForm.remark}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, remark: e.target.value })}
                  rows={2}
                  placeholder="调度原因等"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowDispatchModal(null)} className="px-4 py-2 text-slate-600 hover:text-slate-800">
                取消
              </button>
              <button
                onClick={handleDispatch}
                disabled={!dispatchForm.operator || !dispatchForm.toLocation || dispatchForm.quantity <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                确认调度
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
