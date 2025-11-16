import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/contacts`, formData);
      toast.success('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Ошибка отправки сообщения. Попробуйте позже.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-8 fade-in" data-testid="contact-page-title">
            Контакты
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="slide-in-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Свяжитесь с нами</h2>
              
              <div className="space-y-6">
                {settings.contact_email && (
                  <div className="flex items-start space-x-4" data-testid="contact-email">
                    <div className="bg-[#005BBB] p-3 rounded-full">
                      <Mail size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                      <a
                        href={`mailto:${settings.contact_email}`}
                        className="text-[#005BBB] hover:text-[#0066CC] transition-colors"
                      >
                        {settings.contact_email}
                      </a>
                    </div>
                  </div>
                )}

                {settings.contact_phone && (
                  <div className="flex items-start space-x-4" data-testid="contact-phone">
                    <div className="bg-[#005BBB] p-3 rounded-full">
                      <Phone size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Телефон</h3>
                      <a
                        href={`tel:${settings.contact_phone}`}
                        className="text-[#005BBB] hover:text-[#0066CC] transition-colors"
                      >
                        {settings.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {settings.contact_address && (
                  <div className="flex items-start space-x-4" data-testid="contact-address">
                    <div className="bg-[#005BBB] p-3 rounded-full">
                      <MapPin size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Адрес</h3>
                      <p className="text-gray-700">{settings.contact_address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Placeholder for default values */}
              {!settings.contact_email && !settings.contact_phone && !settings.contact_address && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <p className="text-gray-700 font-medium">
                    Контактная информация будет добавлена в ближайшее время.
                    Вы можете добавить её через админ-панель.
                  </p>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="slide-in-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Отправить сообщение</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ваше имя"
                    required
                    data-testid="contact-name-input"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    data-testid="contact-email-input"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сообщение
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Ваше сообщение..."
                    required
                    rows={6}
                    data-testid="contact-message-textarea"
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="contact-submit-button"
                  className="w-full bg-gradient-to-r from-[#005BBB] to-[#0073E6] hover:from-[#0066CC] hover:to-[#4A9FFF] text-white font-bold py-4 rounded-xl transition-all hover:shadow-2xl hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Send size={20} />
                  <span>Отправить</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;