import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Tv } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const url = filter === 'all' ? `${API}/matches` : `${API}/matches?status_filter=${filter}`;
        const response = await axios.get(url);
        setMatches(response.data);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [filter]);

  const filters = [
    { value: 'all', label: 'Все' },
    { value: 'scheduled', label: 'Запланированные' },
    { value: 'finished', label: 'Завершенные' },
    { value: 'live', label: 'Прямой эфир' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'finished': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled': return 'Запланирован';
      case 'live': return 'Прямой эфир';
      case 'finished': return 'Завершен';
      default: return status;
    }
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
          <h1 className="text-4xl sm:text-5xl font-bold text-[#005BBB] mb-8" data-testid="matches-page-title">
            Матчи и Результаты
          </h1>

          {/* Filter */}
          <div className="flex flex-wrap gap-3 mb-8" data-testid="match-filter">
            {filters.map((f) => (
              <Button
                key={f.value}
                onClick={() => setFilter(f.value)}
                data-testid={`filter-btn-${f.value}`}
                variant={filter === f.value ? 'default' : 'outline'}
                className={filter === f.value ? 'bg-[#005BBB] hover:bg-[#0066CC]' : ''}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* Matches List */}
          <div className="space-y-6">
            {matches.map((match) => (
              <div
                key={match.id}
                data-testid={`match-card-${match.id}`}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Match Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(match.status)}`}>
                        {getStatusLabel(match.status)}
                      </span>
                      <span className="text-sm text-gray-600">{match.tournament}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col items-center flex-1">
                        {match.home_team_logo && match.is_home && (
                          <img src={match.home_team_logo} alt="Home Team" className="w-16 h-16 object-contain mb-2" />
                        )}
                        {match.away_team_logo && !match.is_home && (
                          <img src={match.away_team_logo} alt="Away Team" className="w-16 h-16 object-contain mb-2" />
                        )}
                        <div className="text-xl font-bold text-gray-800">
                          {match.is_home ? 'Александрия' : match.opponent}
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-[#005BBB] mx-6">
                        {match.status === 'finished' ? (
                          <>
                            {match.is_home ? match.home_score : match.away_score}
                            {' : '}
                            {match.is_home ? match.away_score : match.home_score}
                          </>
                        ) : (
                          'VS'
                        )}
                      </div>
                      <div className="flex flex-col items-center flex-1">
                        {match.away_team_logo && match.is_home && (
                          <img src={match.away_team_logo} alt="Away Team" className="w-16 h-16 object-contain mb-2" />
                        )}
                        {match.home_team_logo && !match.is_home && (
                          <img src={match.home_team_logo} alt="Home Team" className="w-16 h-16 object-contain mb-2" />
                        )}
                        <div className="text-xl font-bold text-gray-800">
                          {match.is_home ? match.opponent : 'Александрия'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>{match.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={16} />
                        <span>{match.is_home ? 'Дома' : 'В гостях'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {match.broadcast_link && (
                      <a
                        href={match.broadcast_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`broadcast-link-${match.id}`}
                        className="btn-primary inline-flex items-center justify-center space-x-2"
                      >
                        <Tv size={18} />
                        <span>Трансляция</span>
                      </a>
                    )}
                    {match.report_link && (
                      <a
                        href={match.report_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`report-link-${match.id}`}
                        className="btn-secondary inline-flex items-center justify-center"
                      >
                        Отчет
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {matches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Матчей не найдено</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MatchesPage;