import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', username: '', password: '' });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch('http://localhost/Portfolio/backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Registration successful!');
        setFormData({ name: '', email: '', phone: '', username: '', password: '' });
      } else {
        setStatus('error');
        setMessage(data.message || 'Registration failed.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-6 relative overflow-hidden">
      
      <div className="w-full max-w-2xl bg-text-primary text-bg-primary p-10 md:p-16 relative z-10">
        <motion.h2 
          className="font-serif text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          System<br/><span className="text-accent">Init.</span>
        </motion.h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input type="text" required placeholder="FULL NAME" 
            className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-3 font-sans text-xl focus:border-accent transition-colors"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            
          <input type="email" required placeholder="EMAIL ADDRESS" 
            className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-3 font-sans text-xl focus:border-accent transition-colors"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            
          <input type="tel" required placeholder="PHONE NUMBER" 
            className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-3 font-sans text-xl focus:border-accent transition-colors"
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            
          <input type="text" required placeholder="USERNAME" 
            className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-3 font-sans text-xl focus:border-accent transition-colors"
            value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            
          <input type="password" required placeholder="PASSWORD" 
            className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-3 font-sans text-xl focus:border-accent transition-colors"
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            
          <button type="submit" disabled={status === 'loading'} className="mt-6 bg-accent text-text-primary font-black uppercase text-2xl py-6 hover:bg-bg-primary transition-colors">
            {status === 'loading' ? 'PROCESSING...' : 'REGISTER'}
          </button>
          
          {message && (
            <div className={`mt-4 font-bold ${status === 'success' ? 'text-accent' : 'text-red-500'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
      
      {/* Brutalist Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5 font-serif text-[30rem] leading-none font-black flex items-center justify-center select-none whitespace-nowrap">
        AUTH
      </div>
    </div>
  );
}
