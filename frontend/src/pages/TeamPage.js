import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TeamPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState('all');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const url = selectedPosition === 'all' ? `${API}/players` : `${API}/players?position=${selectedPosition}`;
        const response = await axios.get(url);
        setPlayers(response.data);
      } catch (error) {
        console.error('Failed to fetch players:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [selectedPosition]);

  const positions = [
    { value: 'all', label: 'Все' },
    { value: 'goalkeeper', label: 'Вратари' },
    { value: 'defender', label: 'Защитники' },
    { value: 'midfielder', label: 'Полузащитники' },
    { value: 'forward', label: 'Нападающие' },
    { value: 'coach', label: 'Тренер' },
    { value: 'manager', label: 'Руководитель' },
    { value: 'representative', label: 'Представитель' }
  ];

  const getPositionLabel = (position) => {
    const pos = positions.find(p => p.value === position);
    return pos ? pos.label : position;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005BBB]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#005BBB] mb-8" data-testid="team-page-title">
            Команда
          </h1>

          {/* Position Filter */}
          <div className="flex flex-wrap gap-3 mb-8" data-testid="position-filter">
            {positions.map((pos) => (
              <Button
                key={pos.value}
                onClick={() => setSelectedPosition(pos.value)}
                data-testid={`position-btn-${pos.value}`}
                variant={selectedPosition === pos.value ? 'default' : 'outline'}
                className={selectedPosition === pos.value ? 'bg-[#005BBB] hover:bg-[#0066CC]' : ''}
              >
                {pos.label}
              </Button>
            ))}
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {players.map((player) => (
              <Link
                key={player.id}
                to={`/player/${player.id}`}
                data-testid={`player-card-${player.id}`}
                className="card-hover bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-[#005BBB] transition-all"
              >
                <div className="relative">
                  {player.photo_url ? (
                    <img
                      src={player.photo_url}
                      alt={player.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <User size={80} className="text-[#005BBB] opacity-30" />
                    </div>
                  )}
                  {player.number && (
                    <div className="absolute top-4 right-4 bg-[#005BBB] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {player.number}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{player.name}</h3>
                  <p className="text-[#005BBB] font-medium text-sm mb-3">
                    {getPositionLabel(player.position)}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Голи: {player.goals}</span>
                    <span>Передачи: {player.assists}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {players.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Игроков не найдено</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeamPage;