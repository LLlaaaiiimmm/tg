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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    position: 'midfielder',
    photo_url: '',
    biography: '',
    goals: 0,
    assists: 0
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(`${API}/players`);
      setPlayers(response.data);
    } catch (error) {
      console.error('Failed to fetch players:', error);
      toast.error('Ошибка загрузки игроков');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        number: formData.number ? parseInt(formData.number) : null,
        goals: parseInt(formData.goals),
        assists: parseInt(formData.assists)
      };

      if (editingPlayer) {
        await axios.put(`${API}/players/${editingPlayer.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Игрок обновлен!');
      } else {
        await axios.post(`${API}/players`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Игрок добавлен!');
      }
      
      setIsOpen(false);
      resetForm();
      fetchPlayers();
    } catch (error) {
      console.error('Failed to save player:', error);
      toast.error('Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого игрока?')) return;
    
    try {
      await axios.delete(`${API}/players/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Игрок удален');
      fetchPlayers();
    } catch (error) {
      console.error('Failed to delete player:', error);
      toast.error('Ошибка удаления');
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      number: player.number ? player.number.toString() : '',
      position: player.position,
      photo_url: player.photo_url || '',
      biography: player.biography || '',
      goals: player.goals,
      assists: player.assists
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      position: 'midfielder',
      photo_url: '',
      biography: '',
      goals: 0,
      assists: 0
    });
    setEditingPlayer(null);
  };

  const positions = {
    goalkeeper: 'Вратарь',
    defender: 'Защитник',
    midfielder: 'Полузащитник',
    forward: 'Нападающий',
    coach: 'Тренер',
    manager: 'Руководитель',
    representative: 'Представитель'
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
      <div data-testid="admin-players-page">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Управление игроками</h1>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="add-player-button" className="bg-[#005BBB] hover:bg-[#0066CC]">
                <Plus size={20} className="mr-2" />
                Добавить игрока
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlayer ? 'Редактировать игрока' : 'Добавить игрока'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="player-form">
                <div>
                  <label className="block text-sm font-medium mb-2">Имя</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="player-name-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Номер {['coach', 'manager', 'representative'].includes(formData.position) && '(необязательно)'}
                    </label>
                    <Input
                      type="number"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      required={!['coach', 'manager', 'representative'].includes(formData.position)}
                      min="1"
                      max="99"
                      data-testid="player-number-input"
                      placeholder={['coach', 'manager', 'representative'].includes(formData.position) ? 'Не требуется' : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Позиция</label>
                    <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                      <SelectTrigger data-testid="player-position-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goalkeeper">Вратарь</SelectItem>
                        <SelectItem value="defender">Защитник</SelectItem>
                        <SelectItem value="midfielder">Полузащитник</SelectItem>
                        <SelectItem value="forward">Нападающий</SelectItem>
                        <SelectItem value="coach">Тренер</SelectItem>
                        <SelectItem value="manager">Руководитель</SelectItem>
                        <SelectItem value="representative">Представитель</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL фото</label>
                  <Input
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    data-testid="player-photo-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Биография</label>
                  <Textarea
                    value={formData.biography}
                    onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                    rows={4}
                    data-testid="player-biography-textarea"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Голы</label>
                    <Input
                      type="number"
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      min="0"
                      data-testid="player-goals-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Передачи</label>
                    <Input
                      type="number"
                      value={formData.assists}
                      onChange={(e) => setFormData({ ...formData, assists: e.target.value })}
                      min="0"
                      data-testid="player-assists-input"
                    />
                  </div>
                </div>
                <Button type="submit" data-testid="player-submit-button" className="w-full bg-[#005BBB] hover:bg-[#0066CC]">
                  {editingPlayer ? 'Обновить' : 'Создать'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <div key={player.id} data-testid={`player-item-${player.id}`} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {player.number && (
                      <div className="bg-[#005BBB] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold">
                        {player.number}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{player.name}</h3>
                      <p className="text-sm text-[#005BBB]">{positions[player.position]}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      onClick={() => handleEdit(player)}
                      data-testid={`edit-player-${player.id}`}
                      variant="outline"
                      size="sm"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(player.id)}
                      data-testid={`delete-player-${player.id}`}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                  <span>Голы: {player.goals}</span>
                  <span>Передачи: {player.assists}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {players.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">Игроков еще нет. Добавьте первого!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPlayers;