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
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
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
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : item.alert
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm z-10">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white">
              <AlertCircle size={16} />
            </span>
            HyperRescue
          </h1>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden flex items-center justify-around p-3 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                  isActive 
                    ? 'text-primary-600' 
                    : item.alert 
                      ? 'text-red-500'
                      : 'text-gray-500'
                }`}
              >
                <Icon size={24} className={isActive && !item.alert ? 'fill-primary-100' : ''} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
};
