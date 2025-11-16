import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Mail, MailOpen, Trash2, ExternalLink, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/contacts/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
      toast.success('Сообщение отмечено как прочитанное');
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      toast.error('Ошибка обновления сообщения');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это сообщение?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/contacts/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(messages.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);
      toast.success('Сообщение удалено');
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Ошибка удаления сообщения');
    }
  };

  const unreadCount = messages.filter(msg => !msg.read).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005BBB]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Сообщения</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `У вас ${unreadCount} непрочитанных сообщений` : 'Нет новых сообщений'}
            </p>
          </div>
        </div>

        {/* Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 space-y-3">
            {messages.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Mail size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Пока нет сообщений</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-[#005BBB]' : ''
                  } ${!message.read ? 'border-l-4 border-[#FFD700]' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {message.read ? (
                        <MailOpen size={20} className="text-gray-400" />
                      ) : (
                        <Mail size={20} className="text-[#005BBB]" />
                      )}
                      <h3 className={`font-semibold ${!message.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {message.name}
                      </h3>
                    </div>
                    {!message.read && (
                      <span className="bg-[#FFD700] text-[#005BBB] text-xs font-bold px-2 py-1 rounded-full">
                        Новое
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                  
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {message.message}
                  </p>
                  
                  <p className="text-xs text-gray-400">
                    {format(new Date(message.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">Детали сообщения</h2>
                  <div className="flex space-x-2">
                    {!selectedMessage.read && (
                      <Button
                        onClick={() => markAsRead(selectedMessage.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <MailOpen size={16} />
                        <span>Отметить прочитанным</span>
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      variant="destructive"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Trash2 size={16} />
                      <span>Удалить</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Sender Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-[#005BBB] p-2 rounded-full">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedMessage.name}</h3>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-[#005BBB] hover:text-[#0066CC] flex items-center space-x-1 text-sm transition-colors"
                        >
                          <span>{selectedMessage.email}</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>{format(new Date(selectedMessage.created_at), 'd MMMM yyyy в HH:mm', { locale: ru })}</span>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Сообщение:</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => window.location.href = `mailto:${selectedMessage.email}`}
                      className="flex-1 bg-gradient-to-r from-[#005BBB] to-[#0073E6] hover:from-[#0066CC] hover:to-[#4A9FFF] text-white"
                    >
                      <Mail size={18} className="mr-2" />
                      Ответить по Email
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Mail size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Выберите сообщение
                </h3>
                <p className="text-gray-500">
                  Выберите сообщение из списка слева, чтобы просмотреть детали
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
