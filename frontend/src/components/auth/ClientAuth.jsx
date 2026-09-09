import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ClientAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const action = isLogin ? 'login' : 'register';
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/client_auth.php?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('client_token', data.token);
        localStorage.setItem('client_data', JSON.stringify(data.client));
        navigate('/portal');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center p-6 pt-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white text-text-primary p-8 shadow-[10px_10px_0_0_#111111] border-4 border-text-primary"
      >
        <h2 className="font-serif font-black text-4xl uppercase tracking-tighter mb-2">
          {isLogin ? 'Client Login' : 'Client Portal'}
        </h2>
        <p className="font-sans text-sm font-bold tracking-widest text-text-primary/60 mb-8 uppercase">
          {isLogin ? 'Access your secure chat' : 'Register to chat with us'}
        </p>

        {error && <div className="bg-red-500 text-white p-3 mb-6 font-mono text-sm border-4 border-text-primary font-bold uppercase">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {!isLogin && (
            <>
              <div>
                <label className="block font-sans font-bold text-xs tracking-widest uppercase mb-2">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border-4 border-text-primary p-3 bg-bg-primary outline-none focus:bg-accent transition-colors text-text-primary font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block font-sans font-bold text-xs tracking-widest uppercase mb-2">Phone Number</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border-4 border-text-primary p-3 bg-bg-primary outline-none focus:bg-accent transition-colors text-text-primary font-bold"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-sans font-bold text-xs tracking-widest uppercase mb-2">Username</label>
            <input 
              type="text" 
              required 
              className="w-full border-4 border-text-primary p-3 bg-bg-primary outline-none focus:bg-accent transition-colors text-text-primary font-bold"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-sans font-bold text-xs tracking-widest uppercase mb-2">Password</label>
            <input 
              type="password" 
              required 
              className="w-full border-4 border-text-primary p-3 bg-bg-primary outline-none focus:bg-accent transition-colors text-text-primary font-bold"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-accent text-text-primary border-4 border-text-primary font-sans font-black uppercase tracking-widest py-4 hover:bg-text-primary hover:text-accent transition-colors disabled:opacity-50 mt-4 shadow-[6px_6px_0_0_#111111] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]"
          >
            {loading ? 'Processing...' : (isLogin ? 'Enter Portal' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-sans text-sm font-bold text-text-primary/70 hover:text-accent transition-colors uppercase tracking-widest"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
