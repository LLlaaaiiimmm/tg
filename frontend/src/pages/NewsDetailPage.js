import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NewsDetailPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const [newsRes, allNewsRes] = await Promise.all([
          axios.get(`${API}/news/${id}`),
          axios.get(`${API}/news`)
        ]);
        setNews(newsRes.data);
        
        // Get related news (same category, different id)
        const related = allNewsRes.data
          .filter(n => n.category === newsRes.data.category && n.id !== id)
          .slice(0, 3);
        setRelatedNews(related);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005BBB]"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Новину не знайдено</h1>
            <Link to="/news" className="text-[#005BBB] hover:text-[#0066CC] transition-colors">
              Повернутися до новин
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
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            to="/news"
            data-testid="back-to-news-button"
            className="inline-flex items-center space-x-2 text-[#005BBB] hover:text-[#0066CC] transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Назад до новин</span>
          </Link>

          {/* Article */}
          <article data-testid="news-detail-article">
            <div className="mb-6">
              <div className="text-sm text-[#005BBB] font-semibold mb-2 uppercase">
                {news.category}
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{news.title}</h1>
              <div className="text-gray-500">
                {format(new Date(news.created_at), 'd MMMM yyyy', { locale: ru })}
              </div>
            </div>

            {news.image_url && (
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-96 object-cover rounded-xl mb-8 shadow-lg"
              />
            )}

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {news.content}
              </p>
            </div>

            {news.tags && news.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {news.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-[#005BBB] text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className="mt-16" data-testid="related-news-section">
              <h2 className="text-2xl font-bold text-[#005BBB] mb-6">Похожі новини</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <Link
                    key={item.id}
                    to={`/news/${item.id}`}
                    className="card-hover bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;