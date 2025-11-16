import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Users, Calendar } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StadiumPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#005BBB] mb-8" data-testid="stadium-page-title">
            {settings.stadium_name || 'Стадион Гвардеец'}
          </h1>

          {/* Hero Image Placeholder */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <div className="w-full h-96 bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center">
              <div className="text-center">
                <MapPin size={80} className="mx-auto text-[#005BBB] opacity-30 mb-4" />
                <p className="text-gray-500 text-lg">Место для фото стадиона</p>
                <p className="text-gray-400 text-sm mt-2">Добавьте фото через админ-панель</p>
              </div>
            </div>
          </div>

          {/* Stadium Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-[#005BBB] p-3 rounded-full">
                  <Users size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Вместимость</h3>
              </div>
              <p className="text-3xl font-bold text-[#005BBB]">~100</p>
              <p className="text-gray-600 text-sm mt-1">зрителей</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-[#005BBB] p-3 rounded-full">
                  <Calendar size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Открытие</h3>
              </div>
              <p className="text-3xl font-bold text-[#005BBB]">2012</p>
              <p className="text-gray-600 text-sm mt-1">год</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-md md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-[#005BBB] p-3 rounded-full">
                  <MapPin size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Адрес</h3>
              </div>
              <p className="text-lg text-gray-700">п. г. т. Гвардейское, ул. Острякова 30, Республика Крым</p>
            </div>
          </div>

          {/* Stadium Description */}
          {settings.stadium_info && (
            <div className="bg-white rounded-xl shadow-md p-8 mb-12" data-testid="stadium-info">
              <h2 className="text-2xl font-bold text-[#005BBB] mb-4">О стадионе</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {settings.stadium_info}
              </p>
            </div>
          )}

          {/* Rules Section */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-[#005BBB] mb-6">Правила посещения</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-3">Разрешено:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Баннеры и флаги</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Фотоаппараты и камеры</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Символика клуба</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-3">Запрещено:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center space-x-2">
                    <span className="text-red-500">✗</span>
                    <span>Алкогольные напитки</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-500">✗</span>
                    <span>Пиротехника</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-500">✗</span>
                    <span>Нецензурная лексика</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Yandex Map with Stadium Location */}
          <div className="mt-12 rounded-xl overflow-hidden shadow-lg">
            <h3 className="text-2xl font-bold text-[#005BBB] mb-4 bg-white p-6">Как добраться</h3>
            <div className="relative w-full h-96">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=33.997906%2C45.110590&z=17&l=map&pt=33.995575,45.110597,pm2rdm"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen={true}
                style={{ position: 'relative' }}
                title="Стадион на карте"
              ></iframe>
            </div>
            <div className="bg-white p-6">
              <p className="text-gray-700 mb-2">
                <strong>Координаты:</strong> 45.110597, 33.995575
              </p>
              <p className="text-gray-600">
                Стадион расположен по адресу: п. г. т. Гвардейское, ул. Острякова 30, Республика Крым.
                <a 
                  href="https://yandex.com/maps/?ll=33.997906%2C45.110590&mode=poi&poi%5Bpoint%5D=33.995575%2C45.110597&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D208462561897&z=17.43" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#005BBB] hover:underline ml-1"
                >
                  Открыть в Яндекс.Картах →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StadiumPage;