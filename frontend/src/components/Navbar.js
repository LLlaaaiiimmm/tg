import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState({});
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navLinks = [
    { path: '/', label: 'Главная' },
    { path: '/news', label: 'Новости' },
    { path: '/team', label: 'Команда' },
    { path: '/matches', label: 'Матчи' },
    { path: '/standings', label: 'Таблица' },
    { path: '/stadium', label: 'Стадион' },
    { path: '/contact', label: 'Контакты' }
  ];

  return (
    <nav
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white shadow-2xl' 
          : 'bg-white/95 backdrop-blur-md shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover-glow" data-testid="navbar-logo">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="ФК Александрия"
                className="h-14 w-14 object-contain transition-transform duration-300 hover:scale-110"
              />
            ) : (
              <div className="h-14 w-14 bg-gradient-to-br from-[#005BBB] to-[#0073E6] rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <span className="text-white font-bold text-2xl">А</span>
              </div>
            )}
            <span className="text-2xl font-bold gradient-text">ФК Александрия</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={`px-4 py-2 text-base font-semibold rounded-lg transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'bg-gradient-to-r from-[#005BBB] to-[#0073E6] text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-[#005BBB]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            data-testid="mobile-menu-button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300"
          >
            {isOpen ? <X size={24} className="text-[#005BBB]" /> : <Menu size={24} className="text-[#005BBB]" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-gradient-to-br from-white to-blue-50 border-t-2 border-[#005BBB] shadow-xl slide-in-left" data-testid="mobile-menu">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'bg-gradient-to-r from-[#005BBB] to-[#0073E6] text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:bg-white hover:text-[#005BBB] hover:shadow-md'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;