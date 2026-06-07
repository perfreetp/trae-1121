import type {
  Event,
  PassengerData,
  Device,
  Material,
  Contact,
  Alert,
  WarningThreshold,
  BroadcastTemplate,
  RestrictionMeasure,
  PatrolRoute,
  PatrolPoint,
  PatrolShift,
  PatrolRecord,
  ReviewItem,
} from '../types';

const now = new Date();

export const mockEvents: Event[] = [
  {
    id: '1',
    type: 'crowd',
    level: 'high',
    location: 'A出入口',
    description: '早高峰期间A出入口出现客流拥堵，排队超过20米',
    status: 'processing',
    reporter: '张三',
    createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 10 * 60000).toISOString(),
    assignee: '李四',
  },
  {
    id: '2',
    type: 'lost_item',
    level: 'low',
    location: '2号站台座椅',
    description: '乘客遗失黑色背包一个，内有笔记本电脑',
    status: 'pending',
    reporter: '王五',
    createdAt: new Date(now.getTime() - 2 * 60 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 60 * 60000).toISOString(),
  },
  {
    id: '3',
    type: 'dispute',
    level: 'medium',
    location: '安检口3',
    description: '两名乘客因排队问题发生口角，情绪激动',
    status: 'processing',
    reporter: '安检员A',
    createdAt: new Date(now.getTime() - 15 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
    assignee: '驻站民警',
  },
  {
    id: '4',
    type: 'injury',
    level: 'high',
    location: '扶梯B',
    description: '老年乘客在扶梯上摔倒，疑似脚踝受伤',
    status: 'processing',
    reporter: '乘客',
    createdAt: new Date(now.getTime() - 8 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 60000).toISOString(),
    assignee: '车站值班员',
  },
  {
    id: '5',
    type: 'suspicious',
    level: 'emergency',
    location: '卫生间附近',
    description: '发现无人认领的黑色行李箱',
    status: 'pending',
    reporter: '保洁人员',
    createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
  },
];

export const mockPassengerData: PassengerData[] = Array.from({ length: 24 }, (_, i) => ({
  id: `pd-${i}`,
  area: ['站厅', '站台1', '站台2', '换乘通道', 'A出入口', 'B出入口'][i % 6],
  count: Math.floor(Math.random() * 500) + 100,
  timestamp: new Date(now.getTime() - (23 - i) * 60 * 60000).toISOString(),
}));

export const mockPassengerTrend = Array.from({ length: 12 }, (_, i) => ({
  time: `${6 + i}:00`,
  count: [120, 200, 380, 520, 680, 450, 320, 280, 350, 480, 580, 420][i],
}));

export const mockDevices: Device[] = [
  { id: 'd1', type: 'gate', name: '闸机1', location: '站厅西侧', status: 'normal', x: 15, y: 30 },
  { id: 'd2', type: 'gate', name: '闸机2', location: '站厅西侧', status: 'normal', x: 20, y: 30 },
  { id: 'd3', type: 'gate', name: '闸机3', location: '站厅西侧', status: 'warning', x: 25, y: 30 },
  { id: 'd4', type: 'gate', name: '闸机4', location: '站厅东侧', status: 'normal', x: 75, y: 30 },
  { id: 'd5', type: 'escalator', name: '扶梯A', location: '站厅-站台1', status: 'normal', x: 35, y: 20 },
  { id: 'd6', type: 'escalator', name: '扶梯B', location: '站厅-站台2', status: 'fault', x: 65, y: 20 },
  { id: 'd7', type: 'entrance', name: 'A出入口', location: '西北角', status: 'normal', x: 10, y: 10 },
  { id: 'd8', type: 'entrance', name: 'B出入口', location: '东北角', status: 'normal', x: 90, y: 10 },
  { id: 'd9', type: 'entrance', name: 'C出入口', location: '西南角', status: 'normal', x: 10, y: 90 },
  { id: 'd10', type: 'security', name: '安检1', location: 'A出入口内侧', status: 'normal', x: 15, y: 15 },
  { id: 'd11', type: 'security', name: '安检2', location: 'B出入口内侧', status: 'normal', x: 85, y: 15 },
  { id: 'd12', type: 'camera', name: '摄像头1', location: '站厅中央', status: 'normal', x: 50, y: 30 },
  { id: 'd13', type: 'camera', name: '摄像头2', location: '站台1东侧', status: 'normal', x: 80, y: 60 },
  { id: 'd14', type: 'camera', name: '摄像头3', location: '站台2西侧', status: 'normal', x: 20, y: 75 },
];

export const mockMaterials: Material[] = [
  { id: 'm1', name: '伸缩围栏', category: 'fence', quantity: 20, location: '物资室A', status: 'available' },
  { id: 'm2', name: '折叠担架', category: 'stretcher', quantity: 3, location: '急救站', status: 'available' },
  { id: 'm3', name: '急救包A型', category: 'first_aid', quantity: 15, location: '各服务台', status: 'available' },
  { id: 'm4', name: '急救包B型', category: 'first_aid', quantity: 8, location: '急救站', status: 'in_use' },
  { id: 'm5', name: '大功率扩音器', category: 'megaphone', quantity: 6, location: '物资室A', status: 'available' },
  { id: 'm6', name: '手持扩音器', category: 'megaphone', quantity: 12, location: '各岗位', status: 'available' },
  { id: 'm7', name: '轮椅', category: 'other', quantity: 2, location: '服务台', status: 'available' },
  { id: 'm8', name: '防爆毯', category: 'other', quantity: 2, location: '警务室', status: 'available' },
];

export const mockContacts: Contact[] = [
  { id: 'c1', name: '张警官', department: 'police', phone: '138****1234', role: '驻站警长' },
  { id: 'c2', name: '李警官', department: 'police', phone: '139****5678', role: '驻站民警' },
  { id: 'c3', name: '王医生', department: 'medical', phone: '137****9012', role: '急救医生' },
  { id: 'c4', name: '刘护士', department: 'medical', phone: '136****3456', role: '急救护士' },
  { id: 'c5', name: '赵队长', department: 'fire', phone: '135****7890', role: '消防联络员' },
  { id: 'c6', name: '陈站长', department: 'station', phone: '133****2345', role: '车站站长' },
  { id: 'c7', name: '周值班员', department: 'station', phone: '132****6789', role: '值班站长' },
  { id: 'c8', name: '吴调度', department: 'operation', phone: '131****0123', role: '运营调度' },
];

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'device',
    level: 'warning',
    title: '闸机3异常',
    description: '闸机3传感器响应超时，建议检查',
    status: 'processing',
    createdAt: new Date(now.getTime() - 45 * 60000).toISOString(),
  },
  {
    id: 'a2',
    type: 'device',
    level: 'danger',
    title: '扶梯B故障',
    description: '扶梯B紧急停止，需立即维修',
    status: 'processing',
    createdAt: new Date(now.getTime() - 2 * 60 * 60000).toISOString(),
  },
  {
    id: 'a3',
    type: 'passenger',
    level: 'warning',
    title: 'A出入口客流预警',
    description: 'A出入口客流接近黄色预警阈值',
    status: 'unread',
    createdAt: new Date(now.getTime() - 10 * 60000).toISOString(),
  },
  {
    id: 'a4',
    type: 'security',
    level: 'info',
    title: '可疑物品排查',
    description: '卫生间附近发现无人认领行李，已通知警务人员',
    status: 'processing',
    createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
  },
];

export const mockWarningThresholds: WarningThreshold[] = [
  { id: 'wt1', area: '站厅', areaName: '站厅区域', yellowThreshold: 400, redThreshold: 600, currentCount: 320 },
  { id: 'wt2', area: '站台1', areaName: '1号站台', yellowThreshold: 300, redThreshold: 450, currentCount: 280 },
  { id: 'wt3', area: '站台2', areaName: '2号站台', yellowThreshold: 300, redThreshold: 450, currentCount: 350 },
  { id: 'wt4', area: '换乘通道', areaName: '换乘通道', yellowThreshold: 200, redThreshold: 350, currentCount: 180 },
  { id: 'wt5', area: 'A出入口', areaName: 'A出入口', yellowThreshold: 150, redThreshold: 250, currentCount: 90 },
  { id: 'wt6', area: 'B出入口', areaName: 'B出入口', yellowThreshold: 150, redThreshold: 250, currentCount: 260 },
];

export const mockBroadcastTemplates: BroadcastTemplate[] = [
  {
    id: 'bt1',
    name: '常规广播-欢迎词',
    content: '各位乘客您好，欢迎乘坐本次列车。请您有序排队，先下后上，注意安全。',
    category: 'normal',
  },
  {
    id: 'bt2',
    name: '客流预警-请慢行',
    content: '各位乘客请注意，当前车站客流较大，请您放慢脚步，不要拥挤，照顾好身边的老人和小孩。',
    category: 'warning',
  },
  {
    id: 'bt3',
    name: '限流通知',
    content: '各位乘客请注意，因客流较大，本站已启动限流措施，请您配合工作人员引导，有序进站。感谢您的理解与配合。',
    category: 'warning',
  },
  {
    id: 'bt4',
    name: '紧急疏散',
    content: '各位乘客请注意，现在进行紧急疏散，请您保持冷静，按照工作人员指引，从最近的安全出口有序撤离。不要拥挤，不要乘坐电梯。',
    category: 'emergency',
  },
  {
    id: 'bt5',
    name: '寻找失物',
    content: '请丢失黑色背包的乘客尽快到服务台认领，您的背包已被我们的工作人员妥善保管。',
    category: 'normal',
  },
];

export const mockRestrictionMeasures: RestrictionMeasure[] = [
  {
    id: 'rm1',
    name: 'A出入口单进单出',
    description: 'A出入口改为只进不出，引导出站乘客使用B出入口',
    enabled: false,
    threshold: '黄色预警',
  },
  {
    id: 'rm2',
    name: '站厅蛇形限流',
    description: '在站厅设置蛇形围栏，控制进站速度',
    enabled: false,
    threshold: '黄色预警',
  },
  {
    id: 'rm3',
    name: '部分闸机关闭',
    description: '关闭2台进站闸机，减少进站客流',
    enabled: false,
    threshold: '红色预警',
  },
  {
    id: 'rm4',
    name: '列车越站通过',
    description: '联系调度中心，安排部分列车本站不停靠',
    enabled: false,
    threshold: '红色预警',
  },
];

export const mockPatrolRoutes: PatrolRoute[] = [
  { id: 'pr1', name: '白班巡查路线', description: '覆盖站厅、站台、出入口等主要区域' },
  { id: 'pr2', name: '夜班巡查路线', description: '重点巡查设备机房、消防通道等区域' },
];

export const mockPatrolPoints: PatrolPoint[] = [
  { id: 'pp1', routeId: 'pr1', name: 'A出入口', location: 'A出入口', order: 1 },
  { id: 'pp2', routeId: 'pr1', name: '安检点', location: '安检1', order: 2 },
  { id: 'pp3', routeId: 'pr1', name: '站厅西侧', location: '闸机区域', order: 3 },
  { id: 'pp4', routeId: 'pr1', name: '站台1', location: '站台1东侧', order: 4 },
  { id: 'pp5', routeId: 'pr1', name: '站台2', location: '站台2西侧', order: 5 },
  { id: 'pp6', routeId: 'pr1', name: 'B出入口', location: 'B出入口', order: 6 },
  { id: 'pp7', routeId: 'pr2', name: '设备机房', location: '地下一层机房', order: 1 },
  { id: 'pp8', routeId: 'pr2', name: '消防通道', location: '各层消防通道', order: 2 },
  { id: 'pp9', routeId: 'pr2', name: '配电室', location: '配电室', order: 3 },
];

export const mockPatrolShifts: PatrolShift[] = [
  { id: 'ps1', date: now.toISOString().split('T')[0], shift: 'morning', personnel: '张三、李四', routeId: 'pr1' },
  { id: 'ps2', date: now.toISOString().split('T')[0], shift: 'afternoon', personnel: '王五、赵六', routeId: 'pr1' },
  { id: 'ps3', date: now.toISOString().split('T')[0], shift: 'night', personnel: '孙七、周八', routeId: 'pr2' },
];

export const mockPatrolRecords: PatrolRecord[] = [
  {
    id: 'prec1',
    shiftId: 'ps1',
    pointId: 'pp1',
    checkTime: new Date(now.getTime() - 4 * 60 * 60000).toISOString(),
    status: 'normal',
    remark: '',
  },
  {
    id: 'prec2',
    shiftId: 'ps1',
    pointId: 'pp2',
    checkTime: new Date(now.getTime() - 3.5 * 60 * 60000).toISOString(),
    status: 'normal',
    remark: '',
  },
  {
    id: 'prec3',
    shiftId: 'ps1',
    pointId: 'pp3',
    checkTime: new Date(now.getTime() - 3 * 60 * 60000).toISOString(),
    status: 'abnormal',
    remark: '发现地面有水渍，已通知保洁',
  },
];

export const mockReviewItems: ReviewItem[] = [
  {
    id: 'r1',
    eventId: 'evt-2024001',
    eventType: 'crowd',
    duration: 45,
    nodes: [
      { name: '事件发现', duration: 2, responsible: '监控室', timestamp: '08:15:00' },
      { name: '事件登记', duration: 3, responsible: '值班员', timestamp: '08:17:00' },
      { name: '人员指派', duration: 5, responsible: '值班站长', timestamp: '08:20:00' },
      { name: '现场处置', duration: 30, responsible: '站务人员', timestamp: '08:25:00' },
      { name: '事件闭环', duration: 5, responsible: '值班员', timestamp: '09:00:00' },
    ],
    improvements: [
      { id: 'imp1', content: '在A出入口增加蛇形围栏', status: 'completed' },
      { id: 'imp2', content: '优化早高峰客流引导流程', status: 'in_progress' },
    ],
  },
  {
    id: 'r2',
    eventId: 'evt-2024002',
    eventType: 'injury',
    duration: 25,
    nodes: [
      { name: '事件发现', duration: 1, responsible: '乘客呼叫', timestamp: '14:30:00' },
      { name: '事件登记', duration: 2, responsible: '客服中心', timestamp: '14:31:00' },
      { name: '医疗救助', duration: 15, responsible: '急救人员', timestamp: '14:33:00' },
      { name: '送医安排', duration: 7, responsible: '值班站长', timestamp: '14:48:00' },
    ],
    improvements: [
      { id: 'imp3', content: '在扶梯旁增设紧急停止按钮标识', status: 'completed' },
      { id: 'imp4', content: '增加扶梯安全宣传广播', status: 'pending' },
    ],
  },
];

export const stationAreaStats = [
  { name: '站厅', current: 382, capacity: 800 },
  { name: '站台1', current: 256, capacity: 500 },
  { name: '站台2', current: 198, capacity: 500 },
  { name: '换乘通道', current: 145, capacity: 300 },
  { name: 'A出入口', current: 168, capacity: 200 },
  { name: 'B出入口', current: 89, capacity: 200 },
];

export const eventTypeStats = [
  { name: '拥挤', value: 12 },
  { name: '物品遗失', value: 8 },
  { name: '纠纷', value: 5 },
  { name: '可疑人员', value: 2 },
  { name: '突发伤病', value: 3 },
  { name: '其他', value: 4 },
];

export const monthlyEventTrend = [
  { month: '1月', count: 18 },
  { month: '2月', count: 22 },
  { month: '3月', count: 19 },
  { month: '4月', count: 25 },
  { month: '5月', count: 28 },
  { month: '6月', count: 34 },
];
