import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Newspaper, Users, Calendar, Settings } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    news: 0,
    players: 0,
    matches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [newsRes, playersRes, matchesRes] = await Promise.all([
          axios.get(`${API}/news`),
          axios.get(`${API}/players`),
          axios.get(`${API}/matches`)
        ]);
        setStats({
          news: newsRes.data.length,
          players: playersRes.data.length,
          matches: matchesRes.data.length
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Новости',
      count: stats.news,
      icon: Newspaper,
      color: 'bg-blue-500',
      link: '/admin/news'
    },
    {
      title: 'Игроки',
      count: stats.players,
      icon: Users,
      color: 'bg-green-500',
      link: '/admin/players'
    },
    {
      title: 'Матчи',
      count: stats.matches,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/admin/matches'
    },
    {
      title: 'Настройки',
      count: '⚙️',
      icon: Settings,
      color: 'bg-orange-500',
      link: '/admin/settings'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005BBB]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div data-testid="admin-dashboard">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Панель управления</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.link}
                data-testid={`dashboard-card-${card.title.toLowerCase()}`}
                className="card-hover bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-[#005BBB] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {card.count}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-700">{card.title}</h3>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#005BBB] to-[#0066CC] rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Добро пожаловать в админ-панель!</h2>
          <p className="text-blue-100">
            Здесь вы можете управлять контентом сайта ФК Александрия. 
            Добавляйте новости, игроков, матчи и обновляйте настройки.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;