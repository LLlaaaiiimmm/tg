import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Trophy, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StandingsPage = () => {
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStandings = async () => {
    try {
      const response = await axios.get(`${API}/standings`);
      setStandings(response.data);
    } catch (error) {
      console.error('Failed to fetch standings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, []);

  const getPositionColor = (position) => {
    if (position <= 3) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (position >= 14) return 'bg-gradient-to-r from-red-500 to-red-600';
    return 'bg-gradient-to-r from-blue-500 to-blue-600';
  };

  const getPositionIcon = (position, index) => {
    if (index === 0) return null;
    const prevPos = standings.teams[index - 1]?.position || position;
    if (position < prevPos) return <TrendingUp className="text-green-500" size={16} />;
    if (position > prevPos) return <TrendingDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-400" size={16} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#005BBB] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Загрузка турнирной таблицы...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 fade-in">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="text-[#FFD700] mr-3" size={48} />
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
                Турнирная таблица
              </h1>
            </div>
            <p className="text-xl text-gray-700 font-semibold mb-2">{standings?.league_name}</p>
            {standings?.last_updated && (
              <p className="text-sm text-gray-500">
                Обновлено: {format(new Date(standings.last_updated), 'd MMMM yyyy, HH:mm', { locale: ru })}
              </p>
            )}
          </div>

          {/* Standings Table */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden scale-up">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#005BBB] to-[#0073E6] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Место</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Команда</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">И</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">В</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Н</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">П</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">ЗМ</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">ПМ</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">РМ</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">О</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {standings?.teams?.map((team, index) => (
                    <tr
                      key={index}
                      className={`transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent ${
                        team.team.toLowerCase().includes('александ') ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${getPositionColor(team.position)}`}>
                            {team.position}
                          </span>
                          {index > 0 && getPositionIcon(team.position, index)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold text-gray-800 ${
                          team.team.toLowerCase().includes('александ') ? 'text-[#005BBB] font-bold text-lg' : ''
                        }`}>
                          {team.team}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700 font-medium">{team.games}</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">{team.wins}</td>
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">{team.draws}</td>
                      <td className="px-6 py-4 text-center text-red-600 font-semibold">{team.losses}</td>
                      <td className="px-6 py-4 text-center text-gray-700 font-medium">{team.goals_for}</td>
                      <td className="px-6 py-4 text-center text-gray-700 font-medium">{team.goals_against}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${
                          team.goal_difference > 0 ? 'text-green-600' : team.goal_difference < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#005BBB] font-bold text-lg rounded-lg shadow-md">
                          {team.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4 p-4">
              {standings?.teams?.map((team, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 shadow-lg border-l-4 ${
                    team.team.toLowerCase().includes('александ') ? 'border-[#FFD700] bg-gradient-to-br from-yellow-50 to-white' : 'border-[#005BBB]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${getPositionColor(team.position)}`}>
                        {team.position}
                      </span>
                      <div>
                        <h3 className={`font-bold text-gray-800 ${
                          team.team.toLowerCase().includes('александ') ? 'text-[#005BBB] text-lg' : ''
                        }`}>
                          {team.team}
                        </h3>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#005BBB] font-bold text-lg rounded-lg shadow-md">
                        {team.points}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Очки</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{team.wins}</div>
                      <div className="text-xs text-gray-500">Побед</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">{team.draws}</div>
                      <div className="text-xs text-gray-500">Ничьих</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{team.losses}</div>
                      <div className="text-xs text-gray-500">Поражений</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-around text-sm">
                    <div>
                      <span className="text-gray-500">Игры:</span>
                      <span className="ml-2 font-semibold text-gray-800">{team.games}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ЗМ-ПМ:</span>
                      <span className="ml-2 font-semibold text-gray-800">{team.goals_for}-{team.goals_against}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">РМ:</span>
                      <span className={`ml-2 font-semibold ${
                        team.goal_difference > 0 ? 'text-green-600' : team.goal_difference < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Обозначения:</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div><span className="font-semibold">И</span> - Игры</div>
              <div><span className="font-semibold">В</span> - Выигрыши</div>
              <div><span className="font-semibold">Н</span> - Ничьи</div>
              <div><span className="font-semibold">П</span> - Поражения</div>
              <div><span className="font-semibold">ЗМ</span> - Забитые мячи</div>
              <div><span className="font-semibold">ПМ</span> - Пропущенные мячи</div>
              <div><span className="font-semibold">РМ</span> - Разница мячей</div>
              <div><span className="font-semibold">О</span> - Очки</div>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Турнирная таблица автоматически обновляется каждый день в 3:00</p>
            <p className="mt-1">Источник данных: <a href="https://ffsr.ru/standings" target="_blank" rel="noopener noreferrer" className="text-[#005BBB] hover:underline">ФФСР</a></p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StandingsPage;
