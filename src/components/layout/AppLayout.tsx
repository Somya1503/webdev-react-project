import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, AlertCircle, Users, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'New SOS', path: '/request/new', icon: AlertCircle, alert: true },
  { name: 'Volunteer', path: '/volunteer', icon: Users },
  { name: 'Profile', path: '/profile', icon: User },
];

export const AppLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shadow-2xl z-20">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-50 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/30">
              <AlertCircle size={20} />
            </span>
            HyperRescue
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-400 font-medium border border-primary-500/20' 
                    : item.alert
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium border border-red-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shadow-lg z-20">
          <h1 className="text-lg font-bold text-slate-50 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/30">
              <AlertCircle size={16} />
            </span>
            HyperRescue
          </h1>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden flex items-center justify-around p-3 bg-slate-900 border-t border-slate-800 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.3)] z-20">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary-400' 
                    : item.alert 
                      ? 'text-red-400'
                      : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={24} className={isActive && !item.alert ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
};
