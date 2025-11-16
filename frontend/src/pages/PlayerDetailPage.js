import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, User } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PlayerDetailPage = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await axios.get(`${API}/players/${id}`);
        setPlayer(response.data);
      } catch (error) {
        console.error('Failed to fetch player:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  const positions = {
    goalkeeper: 'Вратар',
    defender: 'Захисник',
    midfielder: 'Півзахисник',
    forward: 'Нападник'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005BBB]"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Гравця не знайдено</h1>
            <Link to="/team" className="text-[#005BBB] hover:text-[#0066CC] transition-colors">
              Повернутися до команди
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <Link
            to="/team"
            data-testid="back-to-team-button"
            className="inline-flex items-center space-x-2 text-[#005BBB] hover:text-[#0066CC] transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span>Назад к команде</span>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12" data-testid="player-detail">
            {/* Player Photo */}
            <div>
              {player.photo_url ? (
                <img
                  src={player.photo_url}
                  alt={player.name}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center shadow-2xl">
                  <User size={120} className="text-[#005BBB] opacity-30" />
                </div>
              )}
            </div>

            {/* Player Info */}
            <div>
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  {player.number && (
                    <div className="bg-[#005BBB] text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
                      {player.number}
                    </div>
                  )}
                  <div>
                    <h1 className="text-4xl font-bold text-gray-800">{player.name}</h1>
                    <p className="text-xl text-[#005BBB] font-medium mt-1">
                      {positions[player.position] || player.position}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-[#005BBB] mb-4">Статистика</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-3xl font-bold text-[#005BBB]">{player.goals}</div>
                    <div className="text-gray-600 mt-1">Голов</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-3xl font-bold text-[#005BBB]">{player.assists}</div>
                    <div className="text-gray-600 mt-1">Передач</div>
                  </div>
                </div>
              </div>

              {/* Biography */}
              {player.biography && (
                <div>
                  <h2 className="text-2xl font-bold text-[#005BBB] mb-4">Біографія</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {player.biography}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlayerDetailPage;