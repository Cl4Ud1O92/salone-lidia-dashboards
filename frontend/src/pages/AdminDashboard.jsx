import { useState, useEffect } from 'react';
import { Users, Calendar, Award, LogOut, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AdminDashboard() {
  const { user, logout, axios } = useAuth();
  const [stats, setStats] = useState({ total_clients: 0, total_appointments: 0, total_points: 0 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Protezione user null
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento autenticazione...</div>;
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setStatsLoading(true);
        const statsRes = await axios.get('/api/admin/stats');
        setStats(statsRes.data);
      } catch (err) {
        console.error('Errore stats:', err);
      } finally {
        setStatsLoading(false);
        setLoading(false);
      }
    };
    loadData();
  }, [axios]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard Admin
            </h1>
            <p className="text-gray-600">Salone Lidia Zucaro - {user.username || 'Admin'}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-medium transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {statsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-500 animate-pulse">Caricamento statistiche...</div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 group">
                <Users className="w-14 h-14 bg-blue-100 text-blue-600 p-3 rounded-2xl mb-4 mx-auto group-hover:rotate-6 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Clienti Totali</h3>
                <p className="text-4xl font-bold text-blue-600 text-center">{stats.total_clients}</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 group">
                <Calendar className="w-14 h-14 bg-green-100 text-green-600 p-3 rounded-2xl mb-4 mx-auto group-hover:rotate-6 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Appuntamenti</h3>
                <p className="text-4xl font-bold text-green-600 text-center">{stats.total_appointments || 0}</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 group">
                <Award className="w-14 h-14 bg-purple-100 text-purple-600 p-3 rounded-2xl mb-4 mx-auto group-hover:rotate-6 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Punti Totali</h3>
                <p className="text-4xl font-bold text-purple-600 text-center">{stats.total_points || 0}</p>
              </div>
            </div>

            {/* Clients Section */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Gestione Clienti</h2>
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2 shadow-xl">
                  <Plus size={24} />
                  <span>Nuovo Cliente</span>
                </button>
              </div>
              
              <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nome</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Telefono</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Punti</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Data Iscrizione</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {/* Placeholder row - sostituirà con API */}
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="font-medium text-gray-900">Maria Rossi</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">+39 123 456 789</td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">150</span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">2026-01-01</td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-2 rounded-xl hover:bg-blue-50 transition-all">
                          <Edit size={18} />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-2 rounded-xl hover:bg-red-50 transition-all">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
