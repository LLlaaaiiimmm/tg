import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Newspaper, Users, Calendar, Settings, LogOut, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Главная', icon: Home },
    { path: '/admin/news', label: 'Новости', icon: Newspaper },
    { path: '/admin/players', label: 'Игроки', icon: Users },
    { path: '/admin/matches', label: 'Матчи', icon: Calendar },
    { path: '/admin/messages', label: 'Сообщения', icon: Mail },
    { path: '/admin/settings', label: 'Настройки', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#005BBB] text-white shadow-xl z-50">
        <div className="p-6 border-b border-blue-400">
          <h1 className="text-2xl font-bold">ФК Александрия</h1>
          <p className="text-blue-200 text-sm mt-1">Админ-панель</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    data-testid={`admin-nav-${item.label.toLowerCase()}`}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white text-[#005BBB] font-semibold'
                        : 'text-blue-100 hover:bg-blue-600'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-400">
          <Link
            to="/"
            className="block mb-2 text-blue-100 hover:text-white transition-colors text-sm text-center"
          >
            Перейти на сайт
          </Link>
          <Button
            onClick={handleLogout}
            data-testid="admin-logout-button"
            variant="outline"
            className="w-full bg-transparent border-blue-300 text-white hover:bg-blue-600 hover:text-white"
          >
            <LogOut size={18} className="mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;