import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Footer = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-gradient-to-br from-[#005BBB] via-[#0066CC] to-[#005BBB] text-white relative overflow-hidden" data-testid="main-footer">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#FFD700] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About */}
          <div className="slide-in-left">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center">
                <span className="text-[#005BBB] font-bold text-xl">А</span>
              </div>
              <h3 className="text-2xl font-bold">ФК Александрия</h3>
            </div>
            <p className="text-blue-100 leading-relaxed">
              Официальный веб-сайт футбольного клуба «Александрия». 
              Свежие новости, матчи и результаты команды в режиме реального времени.
            </p>
          </div>

          {/* Quick Links */}
          <div className="fade-in">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2">Навигация</span>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-[#FFD700] to-transparent"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/news" className="text-blue-100 hover:text-[#FFD700] transition-all hover:translate-x-2 inline-block font-medium">
                  → Новости
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-blue-100 hover:text-[#FFD700] transition-all hover:translate-x-2 inline-block font-medium">
                  → Команда
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-blue-100 hover:text-[#FFD700] transition-all hover:translate-x-2 inline-block font-medium">
                  → Матчи
                </Link>
              </li>
              <li>
                <Link to="/standings" className="text-blue-100 hover:text-[#FFD700] transition-all hover:translate-x-2 inline-block font-medium">
                  → Турнирная таблица
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-100 hover:text-[#FFD700] transition-all hover:translate-x-2 inline-block font-medium">
                  → Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="slide-in-right">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2">Контакты</span>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-[#FFD700] to-transparent"></div>
            </h3>
            <ul className="space-y-4">
              {settings.contact_email && (
                <li className="flex items-start space-x-3 group">
                  <div className="bg-blue-500 p-2 rounded-lg group-hover:bg-[#FFD700] transition-colors">
                    <Mail size={18} className="text-white group-hover:text-[#005BBB]" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-200 mb-1">Email</div>
                    <span className="text-white font-medium">{settings.contact_email}</span>
                  </div>
                </li>
              )}
              <li className="flex items-start space-x-3 group">
                <div className="bg-blue-500 p-2 rounded-lg group-hover:bg-[#FFD700] transition-colors">
                  <Phone size={18} className="text-white group-hover:text-[#005BBB]" />
                </div>
                <div>
                  <div className="text-xs text-blue-200 mb-1">Телефон</div>
                  <a href="tel:+79788378777" className="text-white font-medium hover:text-[#FFD700] transition-colors">
                    {settings.contact_phone || '+7 978 837-87-77'}
                  </a>
                </div>
              </li>
              {settings.contact_address && (
                <li className="flex items-start space-x-3 group">
                  <div className="bg-blue-500 p-2 rounded-lg group-hover:bg-[#FFD700] transition-colors">
                    <MapPin size={18} className="text-white group-hover:text-[#005BBB]" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-200 mb-1">Адрес</div>
                    <span className="text-white font-medium">{settings.contact_address}</span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-400 mt-12 pt-8 text-center">
          <p className="text-blue-100 font-medium">
            © {new Date().getFullYear()} ФК Александрия. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;