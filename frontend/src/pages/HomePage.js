import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Trophy, ArrowRight, Clock } from 'lucide-react';
import { format, parseISO, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextMatch, setNextMatch] = useState(null);
  const [lastMatch, setLastMatch] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, matchesRes] = await Promise.all([
          axios.get(`${API}/news`),
          axios.get(`${API}/matches`)
        ]);
        setNews(newsRes.data.slice(0, 3));
        setMatches(matchesRes.data);
        
        // Find next and last match
        const now = new Date();
        const scheduled = matchesRes.data.filter(m => m.status === 'scheduled');
        const finished = matchesRes.data.filter(m => m.status === 'finished');
        
        if (scheduled.length > 0) {
          setNextMatch(scheduled[0]);
        }
        if (finished.length > 0) {
          setLastMatch(finished[0]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTimeUntilMatch = (date, time) => {
    try {
      const matchDateTime = parseISO(`${date}T${time}`);
      const now = new Date();
      const days = differenceInDays(matchDateTime, now);
      const hours = differenceInHours(matchDateTime, now) % 24;
      const minutes = differenceInMinutes(matchDateTime, now) % 60;
      
      if (days > 0) return `${days} дней ${hours} часов`;
      if (hours > 0) return `${hours} часов ${minutes} минут`;
      return `${minutes} минут`;
    } catch {
      return '';
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
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden" data-testid="hero-section">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://customer-assets.emergentagent.com/job_50debc7f-3211-44bc-a1ff-945b9eca5079/artifacts/qsnfqp97_f13a3ee1-6b7d-4204-838b-da34b66b8b9c.jpeg"
            alt="ФК Александрия"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-yellow-700/40"></div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#005BBB] opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFD700] opacity-20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="mb-6 fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black gradient-text mb-4 leading-tight">
                Добро пожаловать в<br />
                <span className="inline-block mt-2">ФК Александрия</span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-[#005BBB] via-[#FFD700] to-[#005BBB] mx-auto rounded-full"></div>
            </div>
            
            <p className="text-xl text-white mb-10 max-w-3xl mx-auto font-medium scale-up leading-relaxed drop-shadow-lg">
              Официальный сайт футбольного клуба. Следите за новостями, матчами и результатами команды в режиме реального времени.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 slide-in-left">
              <Link
                to="/matches"
                data-testid="hero-matches-button"
                className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4"
              >
                <Calendar size={24} />
                <span>Календарь матчей</span>
              </Link>
              <Link
                to="/standings"
                className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4"
              >
                <Trophy size={24} />
                <span>Турнирная таблица</span>
              </Link>
              <Link
                to="/news"
                data-testid="hero-news-button"
                className="btn-secondary inline-flex items-center space-x-2 text-lg px-8 py-4"
              >
                <span>Новости клуба</span>
                <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Next Match */}
      {nextMatch && (
        <section className="py-20 px-4 bg-gradient-to-r from-[#005BBB] via-[#0073E6] to-[#005BBB] relative overflow-hidden" data-testid="next-match-section">
          {/* Animated lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent sport-line"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent sport-line"></div>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="bg-white rounded-3xl shadow-2xl p-10 scale-up">
              <div className="text-center mb-8">
                <div className="inline-block px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full mb-4">
                  <h2 className="text-xl font-black text-white">СЛЕДУЮЩИЙ МАТЧ</h2>
                </div>
                <p className="text-gray-600 font-medium">{nextMatch.tournament}</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-around gap-8 mb-8">
                <div className="text-center flex-1">
                  {nextMatch.home_team_logo && nextMatch.is_home && (
                    <img src={nextMatch.home_team_logo} alt="Home Team" className="w-24 h-24 object-contain mx-auto mb-3" />
                  )}
                  {nextMatch.away_team_logo && !nextMatch.is_home && (
                    <img src={nextMatch.away_team_logo} alt="Away Team" className="w-24 h-24 object-contain mx-auto mb-3" />
                  )}
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {nextMatch.is_home ? 'ФК Александрия' : nextMatch.opponent}
                  </h3>
                  <p className="text-[#005BBB] font-medium">{nextMatch.is_home ? 'Дома' : 'В гостях'}</p>
                </div>
                
                <div className="text-center px-8">
                  <div className="text-5xl font-black text-[#005BBB] mb-2">VS</div>
                  <div className="bg-[#FFD700] text-white px-6 py-2 rounded-full">
                    <Clock size={20} className="inline mr-2" />
                    <span className="font-bold">{getTimeUntilMatch(nextMatch.date, nextMatch.time)}</span>
                  </div>
                </div>
                
                <div className="text-center flex-1">
                  {nextMatch.away_team_logo && nextMatch.is_home && (
                    <img src={nextMatch.away_team_logo} alt="Away Team" className="w-24 h-24 object-contain mx-auto mb-3" />
                  )}
                  {nextMatch.home_team_logo && !nextMatch.is_home && (
                    <img src={nextMatch.home_team_logo} alt="Home Team" className="w-24 h-24 object-contain mx-auto mb-3" />
                  )}
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {nextMatch.is_home ? nextMatch.opponent : 'ФК Александрия'}
                  </h3>
                  <p className="text-[#005BBB] font-medium">{nextMatch.is_home ? 'В гостях' : 'Дома'}</p>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-4 text-gray-600">
                  <Calendar size={20} />
                  <span className="font-medium">{format(parseISO(nextMatch.date), 'd MMMM yyyy', { locale: ru })}</span>
                  <span className="mx-2">•</span>
                  <Clock size={20} />
                  <span className="font-medium">{nextMatch.time}</span>
                </div>
                {nextMatch.broadcast_link && (
                  <a
                    href={nextMatch.broadcast_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center space-x-2 mt-4"
                  >
                    <span>Смотреть трансляцию</span>
                    <ArrowRight size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* News */}
      <section className="py-20 px-4 bg-gray-50" data-testid="news-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-[#005BBB]">Последние новости</h2>
            <Link to="/news" className="text-[#005BBB] font-semibold hover:text-[#0066CC] transition-colors">
              Все новости →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                data-testid={`news-card-${item.id}`}
                className="card-hover bg-white rounded-xl shadow-md overflow-hidden"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-56 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="text-xs text-[#005BBB] font-semibold mb-2 uppercase">
                    {item.category}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{item.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {format(new Date(item.created_at), 'd MMMM yyyy', { locale: ru })}
                    </span>
                    <span className="text-[#005BBB] font-medium text-sm hover:text-[#0066CC] transition-colors">
                      Читать далее →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;