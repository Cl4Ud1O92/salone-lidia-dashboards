import { useState, useEffect } from 'react';
import { Award, Calendar, User, LogOut, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ClientDashboard() {
  // ✅ TUTTI hooks SEMPRE TOP (prima conditional returns)
  const { user, logout, axios } = useAuth();
  const [profile, setProfile] = useState({ points: 0, appointments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Simula API /api/client/profile
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // TODO: await axios.get('/api/client/profile');
        setTimeout(() => {
          setProfile({ 
            points: 245, 
            appointments: [
              { id: 1, date: '2026-01-10', service: 'Taglio + Piega', points: 15, status: 'confermato' }
            ]
          });
        }, 800);
      } catch (err) {
        console.error('Errore profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, axios]);

  // ✅ Conditional AFTER tutti hooks
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50">
        <div>Reindirizzamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              La Mia Area Clienti
            </h1>
            <p className="text-gray-600">Salone Lidia Zucaro</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl font-medium transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Esci</span>
          </button>
        </div>
      </header>

      {/* Hero Points */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-12 max-w-2xl mx-auto">
          <Award className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-3xl mx-auto mb-6 shadow-2xl animate-pulse" />
          <h2 className="text-5xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            {profile.points}
          </h2>
          <p className="text-xl text-gray-700 font-semibold mb-2">Punti Fedeltà</p>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600 mb-8">
            <Star className="w-5 h-5 text-yellow-400 fill-current animate-bounce" />
            <span className="font-semibold text-lg">Mancano 55 punti per Oro! 🏆</span>
          </div>
          <button className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 shadow-xl">
            Prenota Ora
          </button>
        </div>
      </section>

      {/* Profile & Appointments */}
      <main className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Profile Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all">
            <User className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 p-5 rounded-3xl mx-auto mb-6 shadow-lg" />
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Il Mio Profilo</h3>
            <div className="text-center space-y-4">
              <p className="text-3xl font-black text-gray-900">{user.username}</p>
              <p className="text-lg text-gray-600 bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-2 rounded-2xl inline-block">
                Cliente VIP
              </p>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 mt-6">
                <div>
                  <p className="text-2xl font-bold text-green-600">12</p>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Visite</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">98%</p>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Soddisfazione</p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Prossimi Appuntamenti</h3>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
                <p className="text-gray-600">Caricamento...</p>
              </div>
            ) : profile.appointments.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 font-semibold">Nessun appuntamento</p>
                <p className="text-gray-500">Prenota il tuo prossimo trattamento</p>
              </div>
            ) : (
              profile.appointments.map((appt) => (
                <div key={appt.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500 mb-4 hover:shadow-md hover:-translate-x-1 transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                      {appt.date}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                      +{appt.points} pts
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">{appt.service}</h4>
                  <p className="text-sm text-gray-600">{appt.status}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <a href="#prenota" className="group bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 text-center block no-underline">
            <Calendar className="w-20 h-20 mx-auto mb-6 opacity-90 group-hover:scale-110 transition-transform" />
            <h4 className="text-2xl font-black mb-3">Prenota</h4>
            <p className="opacity-90">Nuovo appuntamento</p>
          </a>
          
          <div className="group bg-gradient-to-br from-purple-500 to-pink-600 text-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 text-center cursor-pointer">
            <Award className="w-20 h-20 mx-auto mb-6 opacity-90 group-hover:scale-110 transition-transform" />
            <h4 className="text-2xl font-black mb-3">Premi</h4>
            <p className="opacity-90">Catalogo punti</p>
          </div>
          
          <div className="group bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 text-center cursor-pointer">
            <Star className="w-20 h-20 mx-auto mb-6 opacity-90 group-hover:scale-110 transition-transform" />
            <h4 className="text-2xl font-black mb-3">Recensioni</h4>
            <p className="opacity-90">Lascia feedback</p>
          </div>
        </div>
      </main>
    </div>
  );
}
