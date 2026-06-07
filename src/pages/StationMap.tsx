import { useState } from 'react';
import { Camera, DoorOpen, Ban, Shield, ArrowUpDown, Info, Filter } from 'lucide-react';
import { mockDevices } from '@/data/mockData';
import type { Device, DeviceType } from '@/types';

const deviceIcons: Record<DeviceType, typeof Camera> = {
  gate: Ban,
  escalator: ArrowUpDown,
  entrance: DoorOpen,
  security: Shield,
  camera: Camera,
};

const deviceTypeLabels: Record<DeviceType, string> = {
  gate: '闸机',
  escalator: '扶梯',
  entrance: '出入口',
  security: '安检点',
  camera: '摄像头',
};

const statusColors = {
  normal: 'bg-green-500',
  warning: 'bg-yellow-500',
  fault: 'bg-red-500',
};

const statusLabels = {
  normal: '正常',
  warning: '异常',
  fault: '故障',
};

export default function StationMap() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [filterType, setFilterType] = useState<DeviceType | 'all'>('all');

  const filteredDevices = filterType === 'all'
    ? mockDevices
    : mockDevices.filter(d => d.type === filterType);

  const deviceCounts = {
    gate: mockDevices.filter(d => d.type === 'gate').length,
    escalator: mockDevices.filter(d => d.type === 'escalator').length,
    entrance: mockDevices.filter(d => d.type === 'entrance').length,
    security: mockDevices.filter(d => d.type === 'security').length,
    camera: mockDevices.filter(d => d.type === 'camera').length,
  };

  const faultCount = mockDevices.filter(d => d.status === 'fault').length;
  const warningCount = mockDevices.filter(d => d.status === 'warning').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">站点地图</h1>
          <p className="text-slate-500 mt-1">查看车站设备分布与实时状态</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              正常 {mockDevices.filter(d => d.status === 'normal').length}
            </span>
            <span className="flex items-center gap-1 text-yellow-600">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              异常 {warningCount}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              故障 {faultCount}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {(Object.keys(deviceCounts) as DeviceType[]).map((type) => {
          const Icon = deviceIcons[type];
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`p-4 rounded-lg border transition-all ${
                filterType === type
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${
                  filterType === type ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <Icon size={20} className={filterType === type ? 'text-blue-600' : 'text-slate-600'} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{deviceTypeLabels[type]}</p>
                  <p className="text-2xl font-bold">{deviceCounts[type]}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">人民广场站 - B1层平面图</h3>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500">
                显示: {filterType === 'all' ? '全部设备' : deviceTypeLabels[filterType]}
              </span>
            </div>
          </div>
          <div className="relative bg-slate-50 h-[500px]">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              <rect x="5" y="5" width="90" height="90" fill="#fff" stroke="#CBD5E1" strokeWidth="0.5" rx="2" />
              
              <rect x="8" y="8" width="84" height="15" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.3" rx="1" />
              <text x="50" y="18" textAnchor="middle" fill="#1E40AF" fontSize="3" fontWeight="500">站厅层</text>
              
              <rect x="8" y="45" width="40" height="45" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="0.3" rx="1" />
              <text x="28" y="70" textAnchor="middle" fill="#166534" fontSize="3" fontWeight="500">1号站台</text>
              
              <rect x="52" y="45" width="40" height="45" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="0.3" rx="1" />
              <text x="72" y="70" textAnchor="middle" fill="#92400E" fontSize="3" fontWeight="500">2号站台</text>
              
              <rect x="30" y="28" width="40" height="12" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="0.3" />
              <text x="50" y="36" textAnchor="middle" fill="#64748B" fontSize="2.5">换乘通道</text>
              
              <rect x="8" y="8" width="10" height="8" fill="#BFDBFE" stroke="#60A5FA" strokeWidth="0.3" />
              <text x="13" y="13.5" textAnchor="middle" fill="#1E40AF" fontSize="2.5">A口</text>
              
              <rect x="82" y="8" width="10" height="8" fill="#BFDBFE" stroke="#60A5FA" strokeWidth="0.3" />
              <text x="87" y="13.5" textAnchor="middle" fill="#1E40AF" fontSize="2.5">B口</text>
              
              <rect x="8" y="82" width="10" height="8" fill="#BFDBFE" stroke="#60A5FA" strokeWidth="0.3" />
              <text x="13" y="87.5" textAnchor="middle" fill="#1E40AF" fontSize="2.5">C口</text>
              
              <rect x="82" y="82" width="10" height="8" fill="#BFDBFE" stroke="#60A5FA" strokeWidth="0.3" />
              <text x="87" y="87.5" textAnchor="middle" fill="#1E40AF" fontSize="2.5">D口</text>

              {filteredDevices.map((device) => {
                const Icon = deviceIcons[device.type];
                return (
                  <g
                    key={device.id}
                    transform={`translate(${device.x}, ${device.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedDevice(device)}
                  >
                    <circle
                      r="4"
                      className={device.status === 'normal' ? 'fill-green-400' : device.status === 'warning' ? 'fill-yellow-400' : 'fill-red-400'}
                      opacity="0.3"
                    />
                    <circle
                      r="2.5"
                      className={device.status === 'normal' ? 'fill-green-500' : device.status === 'warning' ? 'fill-yellow-500' : 'fill-red-500'}
                    />
                  </g>
                );
              })}
            </svg>

            {selectedDevice && (
              <div className="absolute top-4 right-4 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${
                      selectedDevice.status === 'normal' ? 'bg-green-100' :
                      selectedDevice.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {(() => {
                        const Icon = deviceIcons[selectedDevice.type];
                        return <Icon size={18} className={
                          selectedDevice.status === 'normal' ? 'text-green-600' :
                          selectedDevice.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        } />;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{selectedDevice.name}</p>
                      <p className="text-xs text-slate-500">{deviceTypeLabels[selectedDevice.type]}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDevice(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">位置</span>
                    <span className="text-slate-800">{selectedDevice.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">状态</span>
                    <span className={`flex items-center gap-1 ${
                      selectedDevice.status === 'normal' ? 'text-green-600' :
                      selectedDevice.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${statusColors[selectedDevice.status]}`}></span>
                      {statusLabels[selectedDevice.status]}
                    </span>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                  查看详情
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">设备列表</h3>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  selectedDevice?.id === device.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${
                    device.status === 'normal' ? 'bg-green-100' :
                    device.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {(() => {
                      const Icon = deviceIcons[device.type];
                      return <Icon size={16} className={
                        device.status === 'normal' ? 'text-green-600' :
                        device.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      } />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{device.name}</p>
                    <p className="text-xs text-slate-500 truncate">{device.location}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${statusColors[device.status]}`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
