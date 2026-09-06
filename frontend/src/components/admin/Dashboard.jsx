import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [settings, setSettings] = useState({ 
    about_title: '', 
    about_bio: '',
    about_headline_1: '',
    about_headline_highlight: '',
    about_headline_2: ''
  });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch current settings on load
  useEffect(() => {
    fetch('http://localhost/Portfolio/backend/get_settings.php', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setSettings({
          about_title: data.about_title || 'FULL-STACK DEVELOPER',
          about_bio: data.about_bio || 'I am a full-stack developer passionate about bridging the gap between raw backend logic and striking frontend aesthetics.',
          about_headline_1: data.about_headline_1 || 'I Engineer',
          about_headline_highlight: data.about_headline_highlight || 'Digital',
          about_headline_2: data.about_headline_2 || 'Realities.'
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    
    try {
      const response = await fetch('http://localhost/Portfolio/backend/update_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage('Settings updated successfully!');
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to update.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-20 relative">
      <div className="max-w-4xl mx-auto z-10 relative">
        <motion.h1 
          className="font-serif text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 border-b-8 border-text-primary pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Control<br/><span className="text-accent">Panel.</span>
        </motion.h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          
          {/* About Section Settings */}
          <div className="bg-text-primary text-bg-primary p-8 border-l-8 border-accent">
            <h2 className="font-sans font-black uppercase text-2xl mb-6 tracking-widest text-accent">About Section</h2>
            
            <div className="flex flex-col gap-6">
              
              {/* Headline Split */}
              <div className="p-4 border-2 border-bg-primary/20 flex flex-col gap-4">
                <h3 className="font-sans font-bold text-lg mb-2 text-accent">Main Headline</h3>
                <div className="flex flex-col">
                  <label className="font-sans font-bold text-xs tracking-widest mb-2">LINE 1</label>
                  <input type="text" required 
                    className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-1 font-sans text-xl focus:border-accent transition-colors"
                    value={settings.about_headline_1} onChange={e => setSettings({...settings, about_headline_1: e.target.value})} />
                </div>
                <div className="flex flex-col">
                  <label className="font-sans font-bold text-xs tracking-widest mb-2">HIGHLIGHT WORD (Stroked Text)</label>
                  <input type="text" required 
                    className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-1 font-sans text-xl focus:border-accent transition-colors text-accent"
                    value={settings.about_headline_highlight} onChange={e => setSettings({...settings, about_headline_highlight: e.target.value})} />
                </div>
                <div className="flex flex-col">
                  <label className="font-sans font-bold text-xs tracking-widest mb-2">LINE 3</label>
                  <input type="text" required 
                    className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-1 font-sans text-xl focus:border-accent transition-colors"
                    value={settings.about_headline_2} onChange={e => setSettings({...settings, about_headline_2: e.target.value})} />
                </div>
              </div>

              <div className="flex flex-col mt-4">
                <label className="font-sans font-bold text-sm tracking-widest mb-2">GIANT BACKGROUND TEXT</label>
                <input type="text" required 
                  className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-2 font-sans text-xl focus:border-accent transition-colors"
                  value={settings.about_title} onChange={e => setSettings({...settings, about_title: e.target.value})} />
              </div>
              
              <div className="flex flex-col">
                <label className="font-sans font-bold text-sm tracking-widest mb-2">BIO PARAGRAPH</label>
                <textarea required rows="4"
                  className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-2 font-sans text-xl focus:border-accent transition-colors resize-none"
                  value={settings.about_bio} onChange={e => setSettings({...settings, about_bio: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={status === 'saving'} className="bg-accent text-text-primary font-black uppercase text-3xl py-6 hover:bg-text-primary hover:text-bg-primary transition-colors border-4 border-transparent hover:border-accent">
            {status === 'saving' ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
          
          {message && (
            <div className={`font-bold text-2xl ${status === 'success' ? 'text-accent' : 'text-red-500'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
