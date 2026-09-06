import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Login() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch('http://localhost/Portfolio/backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage('Access Granted. Welcome back.');
        // Here you would typically set a token in localStorage and redirect to dashboard
        // localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setStatus('error');
        setMessage(data.message || 'Access Denied.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-6 relative overflow-hidden">
      
      <div className="w-full max-w-xl bg-text-primary text-bg-primary p-10 md:p-16 relative z-10 border-l-8 border-accent">
        <motion.h2 
          className="font-serif text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Auth<br/><span className="text-accent">Required.</span>
        </motion.h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col">
            <label className="font-sans font-bold text-sm tracking-widest text-accent mb-2">USERNAME OR PHONE</label>
            <input type="text" required 
              className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-2 font-sans text-2xl focus:border-accent transition-colors"
              value={formData.identifier} onChange={e => setFormData({...formData, identifier: e.target.value})} />
          </div>
            
          <div className="flex flex-col">
            <label className="font-sans font-bold text-sm tracking-widest text-accent mb-2">PASSWORD</label>
            <input type="password" required 
              className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-2 font-sans text-2xl focus:border-accent transition-colors"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
            
          <button type="submit" disabled={status === 'loading'} className="mt-4 bg-accent text-text-primary font-black uppercase text-2xl py-6 hover:bg-bg-primary transition-colors">
            {status === 'loading' ? 'VERIFYING...' : 'LOGIN'}
          </button>
          
          {message && (
            <div className={`mt-4 font-bold text-xl ${status === 'success' ? 'text-accent' : 'text-red-500'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
      
      <div className="absolute top-10 right-10 flex gap-4 mix-blend-difference z-0">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-32 h-32 bg-accent rounded-full" />
      </div>
    </div>
  );
}
