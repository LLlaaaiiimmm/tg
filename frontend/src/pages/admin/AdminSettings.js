import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    logo_url: '',
    stadium_name: '',
    stadium_info: '',
    contact_email: '',
    contact_phone: '',
    contact_address: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setFormData({
        logo_url: response.data.logo_url || '',
        stadium_name: response.data.stadium_name || '',
        stadium_info: response.data.stadium_info || '',
        contact_email: response.data.contact_email || '',
        contact_phone: response.data.contact_phone || '',
        contact_address: response.data.contact_address || ''
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Ошибка загрузки настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Настройки сохранены!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005BBB]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div data-testid="admin-settings-page">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Настройки сайта</h1>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
          {/* Logo Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <ImageIcon size={24} className="text-[#005BBB]" />
              <span>Логотип клуба</span>
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                URL логотипа
              </label>
              <Input
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png или /path/to/logo.png"
                data-testid="settings-logo-input"
              />
              <p className="text-sm text-gray-500 mt-2">
                Вставьте полный URL или путь к файлу логотипа. Например: https://customer-assets.emergentagent.com/...
              </p>
            </div>
            {formData.logo_url && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Предпросмотр:</p>
                <img
                  src={formData.logo_url}
                  alt="Logo preview"
                  className="h-24 w-24 object-contain border rounded-lg p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Stadium Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Информация о стадионе</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название стадиона</label>
                <Input
                  value={formData.stadium_name}
                  onChange={(e) => setFormData({ ...formData, stadium_name: e.target.value })}
                  placeholder="Стадион Гвардеец"
                  data-testid="settings-stadium-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Описание стадиона</label>
                <Textarea
                  value={formData.stadium_info}
                  onChange={(e) => setFormData({ ...formData, stadium_info: e.target.value })}
                  rows={6}
                  placeholder="Информация о стадионе, его истории и особенностях..."
                  data-testid="settings-stadium-info-textarea"
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Контактная информация</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="info@fc-alexandria.com"
                  data-testid="settings-contact-email-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Телефон</label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+7 (XXX) XXX-XX-XX"
                  data-testid="settings-contact-phone-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Адрес</label>
                <Textarea
                  value={formData.contact_address}
                  onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                  rows={3}
                  placeholder="г. Александрия, Кировоградская область, Россия"
                  data-testid="settings-contact-address-textarea"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            data-testid="settings-save-button"
            className="w-full bg-[#005BBB] hover:bg-[#0066CC] text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            <Save size={20} />
            <span>{saving ? 'Сохранение...' : 'Сохранить настройки'}</span>
          </Button>
        </form>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 max-w-3xl">
          <h3 className="font-bold text-gray-800 mb-3">Инструкции:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Логотип:</strong> Вставьте URL изображения логотипа в поле выше. Например: https://customer-assets.emergentagent.com/.../logo.jpg</li>
            <li>• <strong>Стадион:</strong> Укажите название и описание стадиона клуба</li>
            <li>• <strong>Контакты:</strong> Укажите контактную информацию, которая будет отображаться на сайте</li>
            <li>• Все изменения применяются мгновенно после сохранения</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
