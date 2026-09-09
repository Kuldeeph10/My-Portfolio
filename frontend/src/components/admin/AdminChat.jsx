import { useState, useEffect, useRef } from 'react';

export default function AdminChat() {
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [clientOnline, setClientOnline] = useState(false);
  const [clientTyping, setClientTyping] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isUserScrollingUp = useRef(false);

  // Poll clients list
  useEffect(() => {
    fetchClients();
    const int1 = setInterval(fetchClients, 5000);
    return () => clearInterval(int1);
  }, []);

  // Poll messages for active client
  useEffect(() => {
    if (!activeClient) return;
    fetchMessages();
    const int2 = setInterval(fetchMessages, 3000);
    return () => clearInterval(int2);
  }, [activeClient]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    isUserScrollingUp.current = scrollHeight - scrollTop - clientHeight > 150;
  };

  useEffect(() => {
    if (!isUserScrollingUp.current) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [messages, clientTyping]);

  const fetchClients = async () => {
    try {
      const res = await fetch('http://localhost/Portfolio/backend/admin_chat.php?action=get_clients');
      const data = await res.json();
      setClients(data);
    } catch(e) {}
  };

  const fetchMessages = async () => {
    if (!activeClient) return;
    try {
      const res = await fetch(`http://localhost/Portfolio/backend/admin_chat.php?action=get_messages&client_id=${activeClient.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setClientOnline(data.client_online);
      setClientTyping(data.client_typing);
    } catch(e) {}
  };

  const handleTyping = async (e) => {
    setInputMsg(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
    
    try {
      await fetch('http://localhost/Portfolio/backend/chat_typing.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_auth: true, client_id: activeClient.id, is_typing: true })
      });
    } catch(e) {}
  };

  const handleStopTyping = async () => {
    try {
      await fetch('http://localhost/Portfolio/backend/chat_typing.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_auth: true, client_id: activeClient.id, is_typing: false })
      });
    } catch(e) {}
  };

  const handleSend = async () => {
    if (!inputMsg.trim() && !mediaFile) return;

    const formData = new FormData();
    formData.append('admin_auth', 'true');
    formData.append('client_id', activeClient.id);
    if (inputMsg.trim()) formData.append('message', inputMsg);
    if (mediaFile) formData.append('media', mediaFile);

    const optimisticMsg = {
      id: Date.now(),
      sender: 'admin',
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
      await fetch('http://localhost/Portfolio/backend/chat_send.php', {
        method: 'POST',
        body: formData
      });
      fetchMessages();
    } catch(e) {}
  };

  const handleClearChat = async () => {
    if (!window.confirm('Clear all chat history with this client?')) return;
    try {
      await fetch('http://localhost/Portfolio/backend/admin_chat.php?action=clear_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: activeClient.id })
      });
      setMessages([]);
      fetchMessages();
    } catch(e) {}
  };

  return (
    <div className="bg-bg-primary text-text-primary flex flex-col md:flex-row h-[calc(100dvh-250px)] md:h-[700px] border-4 border-text-primary shadow-[10px_10px_0_0_#111111] overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r-4 border-text-primary flex flex-col bg-white ${activeClient ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b-4 border-text-primary bg-accent text-text-primary font-black uppercase tracking-widest flex justify-between items-center">
          <span>Client List</span>
          <span className="bg-text-primary text-accent px-2 py-1 text-xs">{clients.length} Total</span>
        </div>
        <div className="flex-1 overflow-y-auto bg-bg-primary">
          {clients.length === 0 ? (
            <div className="p-6 text-center font-bold text-text-primary/50 uppercase tracking-widest text-sm">No clients registered.</div>
          ) : clients.map(client => (
            <div 
              key={client.id} 
              onClick={() => { setActiveClient(client); setMessages([]); }}
              className={`p-4 border-b-4 border-text-primary cursor-pointer flex items-center gap-4 hover:bg-accent hover:text-text-primary transition-colors ${activeClient?.id === client.id ? 'bg-text-primary text-bg-primary' : 'bg-white text-text-primary'}`}
            >
              <div className={`w-12 h-12 border-4 border-current flex items-center justify-center shrink-0 font-black text-xl uppercase ${activeClient?.id === client.id ? 'bg-text-primary text-accent' : 'bg-accent text-text-primary'}`}>
                {client.profile_image ? (
                  <img src={client.profile_image} className="w-full h-full object-cover" />
                ) : client.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-black truncate uppercase tracking-widest text-sm">{client.name}</h4>
                  {client.is_online && <span className="w-3 h-3 bg-green-500 border-2 border-current shadow-[2px_2px_0_0_#000] shrink-0"></span>}
                </div>
                <div className="text-xs font-bold truncate flex justify-between opacity-70 uppercase tracking-wider">
                  <span>{client.last_message || 'No messages yet'}</span>
                  {client.unread_count > 0 && (
                    <span className="bg-red-500 text-white border-2 border-current font-black px-2 text-xs ml-2">{client.unread_count}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeClient ? (
        <div className="flex-1 flex flex-col relative bg-bg-primary min-h-0">
          {/* Header */}
          <div className="p-4 border-b-4 border-text-primary bg-text-primary text-bg-primary flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveClient(null)} className="md:hidden p-2 hover:text-accent transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <div className="flex flex-col">
                <span className="font-black tracking-widest text-xl uppercase">{activeClient.name}</span>
                <div className="text-sm font-bold tracking-wider uppercase">
                  {clientTyping ? <span className="text-accent animate-pulse font-mono">typing...</span> : clientOnline ? <span className="text-green-400 flex items-center gap-2"><div className="w-3 h-3 bg-green-400 border-2 border-green-700 shadow-[2px_2px_0_0_#000]"></div> ONLINE</span> : <span className="text-zinc-500">OFFLINE</span>}
                </div>
              </div>
            </div>
            <button onClick={handleClearChat} className="bg-red-500 text-white border-4 border-red-700 px-4 py-2 font-black text-xs uppercase hover:bg-red-600 transition-colors shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">Clear Chat</button>
          </div>

          {/* Messages */}
          <div 
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-bg-primary scrollbar-brutal"
          >
            {messages.length === 0 && <div className="text-center text-text-primary/50 font-black p-10 mx-auto uppercase tracking-widest">No messages yet. Say hello!</div>}
            
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-4 border-4 border-text-primary shadow-[4px_4px_0_0_#111111] ${msg.sender === 'admin' ? 'bg-accent text-text-primary' : 'bg-white text-text-primary'}`}>
                  {msg.media_url && (
                    <a href={`http://localhost/Portfolio/${msg.media_url}`} target="_blank" rel="noopener noreferrer" download className="block mb-3 relative group">
                      <img src={`http://localhost/Portfolio/${msg.media_url}`} alt="media" className="max-w-full h-auto border-4 border-text-primary group-hover:opacity-80 transition-opacity cursor-pointer" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="bg-text-primary text-bg-primary font-black uppercase tracking-widest px-4 py-2 text-xs border-2 border-text-primary shadow-[2px_2px_0_0_#111111]">OPEN MEDIA</span>
                      </div>
                    </a>
                  )}
                  {msg.message_text && <div className="whitespace-pre-wrap break-words font-bold text-lg">{msg.message_text}</div>}
                  <div className="text-[10px] text-text-primary/60 text-right mt-2 font-black font-mono uppercase tracking-widest">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {clientTyping && (
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

          {/* Input Area */}
          <div className="bg-white p-3 border-t-4 border-text-primary flex items-end gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={(e) => setMediaFile(e.target.files[0])}
            />
            <button onClick={() => fileInputRef.current.click()} className="p-3 bg-text-primary text-bg-primary hover:bg-accent hover:text-text-primary border-4 border-text-primary shadow-[4px_4px_0_0_#111111] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all shrink-0">
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
                className="w-full bg-transparent text-text-primary font-bold placeholder-text-primary/40 outline-none p-4 resize-none max-h-[150px]"
                rows="1"
              />
            </div>
            <button onClick={handleSend} disabled={!inputMsg.trim() && !mediaFile} className="p-3 bg-accent text-text-primary border-4 border-text-primary shadow-[4px_4px_0_0_#111111] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-text-primary hover:text-accent transition-all disabled:opacity-50 disabled:pointer-events-none shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-bg-primary text-text-primary/30 font-black text-3xl uppercase tracking-widest p-10 text-center">
          Select a client to start chatting
        </div>
      )}
    </div>
  );
}
