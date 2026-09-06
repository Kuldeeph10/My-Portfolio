import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedIdentifier = localStorage.getItem('portfolio_identifier');
    const savedPassword = localStorage.getItem('portfolio_password');
    if (savedIdentifier && savedPassword) {
      setFormData({ identifier: savedIdentifier, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

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
        
        if (rememberMe) {
          localStorage.setItem('portfolio_identifier', formData.identifier);
          localStorage.setItem('portfolio_password', formData.password);
        } else {
          localStorage.removeItem('portfolio_identifier');
          localStorage.removeItem('portfolio_password');
        }

        setTimeout(() => {
          navigate('/sdashboard');
        }, 1000);
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
          Auth<br /><span className="text-accent">Required.</span>
        </motion.h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col">
            <label className="font-sans font-bold text-sm tracking-widest text-accent mb-2">USERNAME OR PHONE</label>
            <input type="text" required
              className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-2 font-sans text-2xl focus:border-accent transition-colors"
              value={formData.identifier} onChange={e => setFormData({ ...formData, identifier: e.target.value })} />
          </div>

          <div className="flex flex-col">
            <label className="font-sans font-bold text-sm tracking-widest text-accent mb-2">PASSWORD</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required
                className="w-full bg-transparent border-b-2 border-bg-primary/30 outline-none py-2 font-sans text-2xl focus:border-accent transition-colors pr-12"
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              
              <button type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-accent font-bold text-sm uppercase tracking-widest hover:text-bg-primary transition-colors"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <input type="checkbox" id="rememberMe" className="w-5 h-5 accent-accent" 
              checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <label htmlFor="rememberMe" className="font-sans font-bold text-sm tracking-widest cursor-pointer select-none">REMEMBER ME</label>
          </div>

          <button type="submit" disabled={status === 'loading'} className="mt-4 bg-accent text-text-primary font-black uppercase text-2xl py-6 hover:bg-bg-primary transition-colors border-4 border-transparent hover:border-accent">
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
