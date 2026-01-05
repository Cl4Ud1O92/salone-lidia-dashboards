import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { LogIn } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, formData);
      login(response.data);
    } catch (err) {
      setError('Credenziali errate');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <LogIn className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Salone Lidia</h1>
          <p className="text-gray-500">Dashboard Login</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? 'Accesso...' : 'Accedi'}</span>
          </button>
        </form>
        <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
          <p>Admin: admin / admin123</p>
          <p>Client: client / client123</p>
          <p>API: {API_BASE}</p>
        </div>
      </div>
    </div>
  );
}
