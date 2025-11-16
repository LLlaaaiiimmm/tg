import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    opponent: '',
    tournament: '',
    home_score: '',
    away_score: '',
    is_home: true,
    status: 'scheduled',
    broadcast_link: '',
    report_link: '',
    home_team_logo: '',
    away_team_logo: ''
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${API}/matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      toast.error('Ошибка загрузки матчей');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        home_score: formData.home_score ? parseInt(formData.home_score) : null,
        away_score: formData.away_score ? parseInt(formData.away_score) : null
      };

      if (editingMatch) {
        await axios.put(`${API}/matches/${editingMatch.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Матч обновлен!');
      } else {
        await axios.post(`${API}/matches`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Матч добавлен!');
      }
      
      setIsOpen(false);
      resetForm();
      fetchMatches();
    } catch (error) {
      console.error('Failed to save match:', error);
      toast.error('Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот матч?')) return;
    
    try {
      await axios.delete(`${API}/matches/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Матч удален');
      fetchMatches();
    } catch (error) {
      console.error('Failed to delete match:', error);
      toast.error('Ошибка удаления');
    }
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setFormData({
      date: match.date,
      time: match.time,
      opponent: match.opponent,
      tournament: match.tournament,
      home_score: match.home_score !== null ? match.home_score.toString() : '',
      away_score: match.away_score !== null ? match.away_score.toString() : '',
      is_home: match.is_home,
      status: match.status,
      broadcast_link: match.broadcast_link || '',
      report_link: match.report_link || '',
      home_team_logo: match.home_team_logo || '',
      away_team_logo: match.away_team_logo || ''
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      opponent: '',
      tournament: '',
      home_score: '',
      away_score: '',
      is_home: true,
      status: 'scheduled',
      broadcast_link: '',
      report_link: '',
      home_team_logo: '',
      away_team_logo: ''
    });
    setEditingMatch(null);
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
      <div data-testid="admin-matches-page">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Управление матчами</h1>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="add-match-button" className="bg-[#005BBB] hover:bg-[#0066CC]">
                <Plus size={20} className="mr-2" />
                Добавить матч
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMatch ? 'Редактировать матч' : 'Добавить матч'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="match-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Дата</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      data-testid="match-date-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Время</label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                      data-testid="match-time-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Соперник</label>
                  <Input
                    value={formData.opponent}
                    onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                    required
                    data-testid="match-opponent-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Турнир</label>
                  <Input
                    value={formData.tournament}
                    onChange={(e) => setFormData({ ...formData, tournament: e.target.value })}
                    required
                    placeholder="Первая лига, Кубок России"
                    data-testid="match-tournament-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Статус</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="match-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Запланировано</SelectItem>
                      <SelectItem value="live">Прямой эфир</SelectItem>
                      <SelectItem value="finished">Завершено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_home"
                    checked={formData.is_home}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_home: checked })}
                    data-testid="match-is-home-checkbox"
                  />
                  <label htmlFor="is_home" className="text-sm font-medium">
                    Домашний матч
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Голы Александрии (дома)</label>
                    <Input
                      type="number"
                      value={formData.home_score}
                      onChange={(e) => setFormData({ ...formData, home_score: e.target.value })}
                      min="0"
                      placeholder="Не заполняйте для будущих"
                      data-testid="match-home-score-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Голы соперника (в гостях)</label>
                    <Input
                      type="number"
                      value={formData.away_score}
                      onChange={(e) => setFormData({ ...formData, away_score: e.target.value })}
                      min="0"
                      placeholder="Не заполняйте для будущих"
                      data-testid="match-away-score-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Логотип домашней команды (URL)</label>
                    <Input
                      value={formData.home_team_logo}
                      onChange={(e) => setFormData({ ...formData, home_team_logo: e.target.value })}
                      placeholder="https://..."
                      data-testid="match-home-logo-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Логотип гостевой команды (URL)</label>
                    <Input
                      value={formData.away_team_logo}
                      onChange={(e) => setFormData({ ...formData, away_team_logo: e.target.value })}
                      placeholder="https://..."
                      data-testid="match-away-logo-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ссылка на трансляцию</label>
                  <Input
                    value={formData.broadcast_link}
                    onChange={(e) => setFormData({ ...formData, broadcast_link: e.target.value })}
                    placeholder="https://..."
                    data-testid="match-broadcast-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ссылка на отчет</label>
                  <Input
                    value={formData.report_link}
                    onChange={(e) => setFormData({ ...formData, report_link: e.target.value })}
                    placeholder="https://..."
                    data-testid="match-report-input"
                  />
                </div>
                <Button type="submit" data-testid="match-submit-button" className="w-full bg-[#005BBB] hover:bg-[#0066CC]">
                  {editingMatch ? 'Обновить' : 'Создать'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} data-testid={`match-item-${match.id}`} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      match.status === 'live' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status === 'scheduled' ? 'Запланировано' :
                       match.status === 'live' ? 'Прямой эфир' : 'Завершено'}
                    </span>
                    <span className="text-sm text-gray-600">{match.tournament}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <span className="text-lg font-semibold">
                      {match.is_home ? 'Александрия' : match.opponent}
                    </span>
                    <span className="text-2xl font-bold text-[#005BBB]">
                      {match.status === 'finished' && match.home_score !== null ? (
                        `${match.is_home ? match.home_score : match.away_score} : ${match.is_home ? match.away_score : match.home_score}`
                      ) : 'VS'}
                    </span>
                    <span className="text-lg font-semibold">
                      {match.is_home ? match.opponent : 'Александрия'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {match.date} о {match.time}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(match)}
                    data-testid={`edit-match-${match.id}`}
                    variant="outline"
                    size="sm"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDelete(match.id)}
                    data-testid={`delete-match-${match.id}`}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">Матчей еще нет. Добавьте первый!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMatches;
