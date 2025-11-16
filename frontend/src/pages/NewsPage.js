import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const url = selectedCategory === 'all' ? `${API}/news` : `${API}/news?category=${selectedCategory}`;
        const response = await axios.get(url);
        setNews(response.data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [selectedCategory]);

  const categories = [
    { value: 'all', label: 'Все' },
    { value: 'club', label: 'Клуб' },
    { value: 'academy', label: 'Академия' },
    { value: 'partners', label: 'Партнеры' }
  ];

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
          <h1 className="text-4xl sm:text-5xl font-bold text-[#005BBB] mb-8" data-testid="news-page-title">
            Новости
          </h1>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8" data-testid="category-filter">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                data-testid={`category-btn-${cat.value}`}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                className={selectedCategory === cat.value ? 'bg-[#005BBB] hover:bg-[#0066CC]' : ''}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                data-testid={`news-item-${item.id}`}
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

          {news.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Новостей не найдено</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NewsPage;