import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminChat from './AdminChat';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('settings');
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState({ 
    about_title: '', 
    about_bio: '',
    about_headline_1: '',
    about_headline_highlight: '',
    about_headline_2: '',
    about_tech_stack: ''
  });
  const [status, setStatus] = useState(null);
  const [messageText, setMessageText] = useState('');

  // Fetch current settings and messages on load
  useEffect(() => {
    fetch('http://localhost/Portfolio/backend/get_settings.php', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setSettings({
          about_title: data.about_title || 'FULL-STACK DEVELOPER',
          about_bio: data.about_bio || 'I am a full-stack developer passionate about bridging the gap between raw backend logic and striking frontend aesthetics.',
          about_headline_1: data.about_headline_1 || 'I Engineer',
          about_headline_highlight: data.about_headline_highlight || 'Digital',
          about_headline_2: data.about_headline_2 || 'Realities.',
          about_tech_stack: data.about_tech_stack || 'REACT.JS, NODE.JS, PHP, MONGODB, LARAVEL, NEXT.JS, TAILWIND CSS, ANTIGRAVITY, CURSOR AI, PYTHON'
        });
      })
      .catch(err => console.error(err));

    fetchMessages();
  }, []);

  const fetchMessages = () => {
    fetch('http://localhost/Portfolio/backend/get_messages.php', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setMessages(data);
      })
      .catch(err => console.error(err));
  };

  const handleMessageAction = async (id, action) => {
    if (action === 'delete' && !window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch('http://localhost/Portfolio/backend/manage_message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      if (response.ok) {
        fetchMessages();
      }
    } catch(err) {
      console.error(err);
    }
  };

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
        setMessageText('Settings updated successfully!');
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus('error');
        setMessageText(data.message || 'Failed to update.');
      }
    } catch (err) {
      setStatus('error');
      setMessageText('Network error. Please try again.');
    }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-4 sm:p-6 md:p-20 relative">
      <div className="max-w-5xl mx-auto z-10 relative">
        <motion.h1 
          className="font-serif text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 md:mb-12 border-b-8 border-text-primary pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>Control<br/><span className="text-accent">Panel.</span></span>
        </motion.h1>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-8 sm:mb-10 border-b-2 border-text-primary/20 pb-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`font-black uppercase text-sm sm:text-xl px-4 sm:px-6 py-2 sm:py-3 transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-accent text-bg-primary' : 'bg-transparent text-text-primary hover:text-accent'}`}
          >
            Settings
          </button>
          <button 
            onClick={() => setActiveTab('messages')} 
            className={`font-black uppercase text-sm sm:text-xl px-4 sm:px-6 py-2 sm:py-3 transition-colors relative whitespace-nowrap ${activeTab === 'messages' ? 'bg-accent text-bg-primary' : 'bg-transparent text-text-primary hover:text-accent'}`}
          >
            Contact Form
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('live_chats')} 
            className={`font-black uppercase text-sm sm:text-xl px-4 sm:px-6 py-2 sm:py-3 transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'live_chats' ? 'bg-accent text-bg-primary' : 'bg-transparent text-text-primary hover:text-accent'}`}
          >
            Live Chats <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </button>
        </div>

        {activeTab === 'settings' && (
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

                <div className="flex flex-col">
                  <label className="font-sans font-bold text-sm tracking-widest mb-2">TECH STACK (Comma separated)</label>
                  <textarea required rows="3"
                    className="bg-transparent border-b-2 border-bg-primary/30 outline-none py-2 font-sans text-xl focus:border-accent transition-colors resize-none"
                    value={settings.about_tech_stack} onChange={e => setSettings({...settings, about_tech_stack: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={status === 'saving'} className="bg-accent text-text-primary font-black uppercase text-3xl py-6 hover:bg-text-primary hover:text-bg-primary transition-colors border-4 border-transparent hover:border-accent">
              {status === 'saving' ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
            
            {messageText && (
              <div className={`font-bold text-2xl ${status === 'success' ? 'text-accent' : 'text-red-500'}`}>
                {messageText}
              </div>
            )}
          </form>
        )}

        {activeTab === 'messages' && (
          <div className="flex flex-col gap-8">
            {messages.length === 0 ? (
              <div className="bg-text-primary text-bg-primary p-8 font-black uppercase text-2xl">
                No messages yet.
              </div>
            ) : messages.map((msg) => (
              <div key={msg.id} className={`p-6 sm:p-8 border-l-8 ${msg.status === 'unread' ? 'border-accent bg-text-primary text-bg-primary' : 'border-text-primary/30 bg-text-primary/10'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <h3 className="font-black text-2xl sm:text-3xl uppercase tracking-wider mb-2">{msg.name}</h3>
                    <p className="font-bold font-sans text-base sm:text-lg opacity-80 break-all">{msg.email}</p>
                    <p className="font-bold font-sans text-base sm:text-lg opacity-80">{msg.phone}</p>
                  </div>
                  <div className="text-xs sm:text-sm font-bold opacity-60 bg-bg-primary/20 px-3 py-1">
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-bg-primary/10 p-4 sm:p-6 mb-6">
                  <p className="font-sans text-lg sm:text-xl leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-6">
                  {msg.status === 'unread' && (
                    <button onClick={() => handleMessageAction(msg.id, 'read')} className="font-black tracking-widest uppercase text-xs sm:text-sm bg-bg-primary text-text-primary px-4 sm:px-6 py-3 hover:bg-accent transition-colors w-full sm:w-auto text-center">
                      MARK AS READ
                    </button>
                  )}
                  
                  {/* Reply via Email */}
                  <a 
                    href={`mailto:${msg.email}?subject=Re: Your Inquiry&body=Hi ${msg.name},%0D%0A%0D%0AThank you for reaching out.%0D%0A%0D%0A`} 
                    className="font-black tracking-widest uppercase text-xs sm:text-sm bg-bg-primary text-text-primary px-4 sm:px-6 py-3 hover:bg-[#ea4335] hover:text-white transition-colors w-full sm:w-auto text-center"
                  >
                    REPLY VIA EMAIL
                  </a>
                  
                  {/* Reply via WhatsApp */}
                  <a 
                    href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=Hi ${encodeURIComponent(msg.name)}, thank you for reaching out regarding your project!`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-black tracking-widest uppercase text-xs sm:text-sm bg-bg-primary text-text-primary px-4 sm:px-6 py-3 hover:bg-[#25D366] hover:text-white transition-colors w-full sm:w-auto text-center"
                  >
                    REPLY VIA WHATSAPP
                  </a>

                  <button onClick={() => handleMessageAction(msg.id, 'delete')} className="font-black tracking-widest uppercase text-xs sm:text-sm bg-red-500 text-white px-4 sm:px-6 py-3 hover:bg-red-700 transition-colors sm:ml-auto w-full sm:w-auto text-center">
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'live_chats' && (
          <AdminChat />
        )}

      </div>
    </div>
  );
}
