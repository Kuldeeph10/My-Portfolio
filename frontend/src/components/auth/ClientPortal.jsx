import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ClientPortal() {
  const [messages, setMessages] = useState([]);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [client, setClient] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isUserScrollingUp = useRef(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('client_token');

  useEffect(() => {
    if (!token) {
      navigate('/client-login');
      return;
    }
    const cData = localStorage.getItem('client_data');
    if (cData) setClient(JSON.parse(cData));

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    isUserScrollingUp.current = scrollHeight - scrollTop - clientHeight > 150;
  };

  useEffect(() => {
    if (!isUserScrollingUp.current) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [messages, adminTyping]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/chat_sync.php?token=${token}`);
      if (res.status === 401) {
        localStorage.removeItem('client_token');
        navigate('/client-login');
        return;
      }
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
      setAdminOnline(data.admin_online);
      setAdminTyping(data.admin_typing);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = async (e) => {
    setInputMsg(e.target.value);
    
    // Auto-expand textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }

    // Ping server that we are typing
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/chat_typing.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, is_typing: true })
      });
    } catch(e) {}
  };

  const handleStopTyping = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/chat_typing.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, is_typing: false })
      });
    } catch(e) {}
  };

  const handleSend = async () => {
    if (!inputMsg.trim() && !mediaFile) return;

    const formData = new FormData();
    formData.append('token', token);
    if (inputMsg.trim()) formData.append('message', inputMsg);
    if (mediaFile) formData.append('media', mediaFile);

    // Optimistic UI update
    const optimisticMsg = {
      id: Date.now(),
      sender: 'client',
      message_text: inputMsg,
      media_url: mediaFile ? URL.createObjectURL(mediaFile) : null,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    isUserScrollingUp.current = false;
    setInputMsg('');
    setMediaFile(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    handleStopTyping();

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/chat_send.php`, {
        method: 'POST',
        body: formData
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_data');
    navigate('/client-login');
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const about = form.about.value;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/client_auth.php?action=update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, about })
      });
      if (res.ok) {
        const updatedClient = { ...client, name, about };
        setClient(updatedClient);
        localStorage.setItem('client_data', JSON.stringify(updatedClient));
        setShowSettings(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!client) return <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center font-mono">LOADING...</div>;

  return (
    <div className="fixed top-20 bottom-0 left-0 right-0 md:top-24 flex flex-col md:flex-row px-4 pb-4 md:px-10 md:pb-8 gap-4 font-sans max-w-[1400px] mx-auto overflow-hidden bg-bg-primary">
      
      {/* Sidebar - Profile & Settings */}
      <div className={`w-full md:w-80 bg-white border-4 border-text-primary shadow-[8px_8px_0_0_#111111] flex flex-col ${showSettings ? 'block' : 'hidden md:flex'}`}>
        <div className="bg-text-primary text-bg-primary p-6 flex justify-between items-center border-b-4 border-text-primary">
          <h2 className="font-serif font-black text-2xl uppercase tracking-tighter">Profile</h2>
          <button onClick={() => setShowSettings(!showSettings)} className="md:hidden text-accent">✕</button>
        </div>
        <div className="p-6 flex-1 text-text-primary bg-bg-primary">
          <form onSubmit={handleSettingsSave} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-text-primary/70 mb-2">Display Name</label>
              <input name="name" defaultValue={client.name} className="w-full border-4 border-text-primary bg-white p-3 outline-none focus:bg-accent focus:text-text-primary transition-colors font-bold" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-text-primary/70 mb-2">About</label>
              <input name="about" defaultValue={client.about || ''} className="w-full border-4 border-text-primary bg-white p-3 outline-none focus:bg-accent focus:text-text-primary transition-colors font-bold" />
            </div>
            <button type="submit" className="bg-accent text-text-primary border-4 border-text-primary font-black py-4 uppercase tracking-widest hover:bg-text-primary hover:text-accent transition-colors shadow-[4px_4px_0_0_#111111] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">SAVE SETTINGS</button>
          </form>
          <button onClick={handleLogout} className="w-full text-red-500 border-4 border-red-500 font-black uppercase tracking-widest py-4 mt-6 hover:bg-red-500 hover:text-white transition-colors">LOGOUT</button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 min-h-0 bg-bg-primary border-4 border-text-primary shadow-[8px_8px_0_0_#111111] flex flex-col relative ${showSettings ? 'hidden' : 'flex'}`}>
        {/* Chat Header */}
        <div className="bg-text-primary text-bg-primary p-4 border-b-4 border-text-primary flex items-center gap-4">
          <button onClick={() => setShowSettings(true)} className="md:hidden mr-2 hover:text-accent transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div className="w-14 h-14 bg-accent rounded-full border-4 border-text-primary flex items-center justify-center font-serif font-black text-2xl text-text-primary shrink-0 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover p-1" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
            <span className="hidden">K</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-widest uppercase">Kuldeep</span>
            {adminTyping ? (
              <span className="text-accent text-sm font-black font-mono tracking-widest animate-pulse uppercase">typing...</span>
            ) : adminOnline ? (
              <span className="text-green-400 font-bold text-sm tracking-wider uppercase flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-none border-2 border-green-700 shadow-[2px_2px_0_0_#000]"></div> ONLINE</span>
            ) : (
              <span className="text-zinc-500 font-bold text-sm tracking-wider uppercase">OFFLINE</span>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef} 
          onScroll={handleScroll} 
          className="flex-1 overflow-y-auto p-4 md:p-8 bg-bg-primary flex flex-col gap-6 scrollbar-brutal"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[70%] p-4 border-4 border-text-primary shadow-[4px_4px_0_0_#111111] ${msg.sender === 'client' ? 'bg-accent text-text-primary' : 'bg-white text-text-primary'}`}>
                {msg.media_url && (
                  <a href={`${import.meta.env.VITE_API_BASE_URL}/${msg.media_url}`} target="_blank" rel="noopener noreferrer" download className="block mb-3 relative group">
                    <img src={`${import.meta.env.VITE_API_BASE_URL}/${msg.media_url}`} alt="media" className="max-w-full h-auto border-4 border-text-primary group-hover:opacity-80 transition-opacity cursor-pointer" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="bg-text-primary text-bg-primary font-black uppercase tracking-widest px-4 py-2 text-xs border-2 border-text-primary shadow-[2px_2px_0_0_#111111]">OPEN MEDIA</span>
                    </div>
                  </a>
                )}
                {msg.message_text && <div className="whitespace-pre-wrap break-words font-bold text-lg">{msg.message_text}</div>}
                <div className="text-[10px] text-text-primary/60 font-black text-right mt-2 font-mono uppercase tracking-widest">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {adminTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-4 border-4 border-text-primary shadow-[4px_4px_0_0_#111111] flex gap-2">
                <span className="w-3 h-3 bg-text-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-3 h-3 bg-text-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-3 h-3 bg-text-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-white p-3 md:p-4 flex items-end gap-3 border-t-4 border-text-primary">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={(e) => setMediaFile(e.target.files[0])}
            accept="image/*,video/mp4,application/pdf"
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="p-3 bg-text-primary text-bg-primary hover:bg-accent hover:text-text-primary border-4 border-text-primary shadow-[4px_4px_0_0_#111111] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
          </button>
          
          <div className="flex-1 bg-bg-primary border-4 border-text-primary shadow-[4px_4px_0_0_#111111] flex flex-col relative focus-within:bg-white transition-colors">
            {mediaFile && (
              <div className="p-3 border-b-4 border-text-primary flex justify-between items-center text-sm font-black bg-accent text-text-primary uppercase tracking-widest">
                <span className="truncate">{mediaFile.name}</span>
                <button onClick={() => setMediaFile(null)} className="text-red-600 hover:text-red-800">✕</button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={inputMsg}
              onChange={handleTyping}
              onBlur={handleStopTyping}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="TYPE YOUR MESSAGE..."
              className="w-full bg-transparent text-text-primary font-bold placeholder-text-primary/40 outline-none p-4 resize-none overflow-y-auto min-h-[56px] max-h-[150px]"
              rows="1"
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={!inputMsg.trim() && !mediaFile}
            className="p-3 bg-accent text-text-primary border-4 border-text-primary shadow-[4px_4px_0_0_#111111] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-text-primary hover:text-accent transition-all disabled:opacity-50 disabled:pointer-events-none shrink-0"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
