import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  ClipboardList,
  Route,
  Phone,
  Package,
  FileBarChart,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/dashboard', label: '运行看板', icon: LayoutDashboard },
  { path: '/station-map', label: '站点地图', icon: Map },
  { path: '/passenger-warning', label: '客流预警', icon: AlertTriangle },
  { path: '/event-handling', label: '事件处置', icon: ClipboardList },
  { path: '/patrol', label: '巡查管理', icon: Route },
  { path: '/contact', label: '联动联络', icon: Phone },
  { path: '/materials', label: '物资管理', icon: Package },
  { path: '/review', label: '复盘分析', icon: FileBarChart },
  { path: '/handover', label: '值班交接', icon: ArrowLeftRight },
];

export function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-slate-700">
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="font-bold text-sm">地</span>
          </div>
          <div>
            <h1 className="font-bold text-sm">地铁安全联动平台</h1>
            <p className="text-xs text-slate-400">Metro Safety System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded p-3">
          <p className="text-xs text-slate-400">当前站点</p>
          <p className="font-semibold text-sm">人民广场站</p>
          <p className="text-xs text-slate-400 mt-1">3条线路 · 8个出入口</p>
        </div>
      </div>
    </aside>
  );
}
