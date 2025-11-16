import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'club',
    image_url: ''
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API}/news`);
      setNews(response.data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      toast.error('Ошибка загрузки новостей');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await axios.put(`${API}/news/${editingNews.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Новость обновлена!');
      } else {
        await axios.post(`${API}/news`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Новость добавлена!');
      }
      
      setIsOpen(false);
      resetForm();
      fetchNews();
    } catch (error) {
      console.error('Failed to save news:', error);
      toast.error('Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту новость?')) return;
    
    try {
      await axios.delete(`${API}/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Новость удалена');
      fetchNews();
    } catch (error) {
      console.error('Failed to delete news:', error);
      toast.error('Ошибка удаления');
    }
  };

  const handleEdit = (item) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      image_url: item.image_url || ''
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'club',
      image_url: ''
    });
    setEditingNews(null);
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
      <div data-testid="admin-news-page">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Управление новостями</h1>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="add-news-button" className="bg-[#005BBB] hover:bg-[#0066CC]">
                <Plus size={20} className="mr-2" />
                Добавить новость
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNews ? 'Редактировать новость' : 'Добавить новость'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="news-form">
                <div>
                  <label className="block text-sm font-medium mb-2">Заголовок</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="news-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Категория</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="news-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="club">Клуб</SelectItem>
                      <SelectItem value="academy">Академия</SelectItem>
                      <SelectItem value="partners">Партнеры</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Контент</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={6}
                    data-testid="news-content-textarea"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL изображения</label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    data-testid="news-image-input"
                  />
                </div>
                <Button type="submit" data-testid="news-submit-button" className="w-full bg-[#005BBB] hover:bg-[#0066CC]">
                  {editingNews ? 'Обновить' : 'Создать'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div key={item.id} data-testid={`news-item-${item.id}`} className="bg-white rounded-lg shadow-md overflow-hidden">
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-[#005BBB] font-semibold uppercase">{item.category}</span>
                  <div className="flex space-x-1">
                    <Button
                      onClick={() => handleEdit(item)}
                      data-testid={`edit-news-${item.id}`}
                      variant="outline"
                      size="sm"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      data-testid={`delete-news-${item.id}`}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">{item.content}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(item.created_at), 'd MMMM yyyy', { locale: ru })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">Новостей еще нет. Добавьте первую!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNews;