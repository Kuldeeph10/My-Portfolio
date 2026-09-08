import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TerminalOS() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: 'KULDEEP OS [Version 1.0.0]' },
    { type: 'system', content: '(c) 2026 Kuldeep Hawladar. All rights reserved.' },
    { type: 'system', content: 'Type "help" to see available commands.' }
  ]);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + ` (backtick)
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    const handleCustomToggle = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-terminal', handleCustomToggle);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-terminal', handleCustomToggle);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  const processCommand = (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    // Add command to history
    setHistory((prev) => [...prev, { type: 'command', content: `C:\\Users\\Guest> ${cmd}` }]);

    let output = [];

    switch (trimmedCmd) {
      case 'help':
        output = [
          { type: 'output', content: 'Available commands:' },
          { type: 'output', content: '  about        - View developer profile' },
          { type: 'output', content: '  skills       - List technical expertise' },
          { type: 'output', content: '  projects     - View portfolio projects' },
          { type: 'output', content: '  contact      - Get contact information' },
          { type: 'output', content: '  sudo hire me - ???' },
          { type: 'output', content: '  clear        - Clear terminal output' },
          { type: 'output', content: '  exit         - Close terminal' }
        ];
        break;
      case 'about':
        output = [
          { type: 'output', content: 'Loading profile data...' },
          { type: 'output', content: 'NAME: Kuldeep Hawladar' },
          { type: 'output', content: 'ROLE: Full-Stack Developer' },
          { type: 'output', content: 'STATUS: Building Digital Realities.' }
        ];
        break;
      case 'skills':
        output = [
          { type: 'output', content: 'Tech Stack:' },
          { type: 'output', content: '> FRONTEND: React.js, Tailwind CSS, Framer Motion, Next.js' },
          { type: 'output', content: '> BACKEND: PHP, Node.js, Express, Laravel, Python' },
          { type: 'output', content: '> DATABASE: MySQL, MongoDB' },
          { type: 'output', content: '> TOOLS: Git, Docker, Cursor AI, Antigravity' }
        ];
        break;
      case 'projects':
        output = [
          { type: 'output', content: 'Recent Projects:' },
          { type: 'output', content: '1. Antigravity IDE (AI Coding Assistant)' },
          { type: 'output', content: '2. Brutalist Portfolio (You are here)' },
          { type: 'output', content: '3. Next.js E-Commerce Platform' }
        ];
        break;
      case 'contact':
        output = [
          { type: 'output', content: 'Email: KULDEEPHAWLADAR14@GMAIL.COM' },
          { type: 'output', content: 'Type "exit" to leave and use the contact form.' }
        ];
        break;
      case 'sudo hire me':
        output = [
          { type: 'output', content: 'ACCESS GRANTED.' },
          { type: 'output', content: 'Initiating interview process...' },
          { type: 'output', content: 'Please email KULDEEPHAWLADAR14@GMAIL.COM with subject "YOU ARE HIRED".' }
        ];
        break;
      case 'clear':
        setHistory([
          { type: 'system', content: 'KULDEEP OS [Version 1.0.0]' }
        ]);
        return; // Early return so we don't append empty output
      case 'exit':
        setIsOpen(false);
        return;
      case '':
        break;
      default:
        output = [{ type: 'error', content: `'${cmd}' is not recognized as an internal or external command.` }];
    }

    if (output.length > 0) {
      setHistory((prev) => [...prev, ...output]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setInput('');
    } else if (e.key === 'c' && e.ctrlKey) {
      setHistory((prev) => [...prev, { type: 'command', content: `C:\\Users\\Guest> ${input}^C` }]);
      setInput('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-black text-[#0f0] font-mono p-4 sm:p-8 overflow-hidden flex flex-col"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Terminal Header */}
          <div className="absolute top-0 left-0 w-full bg-zinc-900 text-zinc-400 text-xs py-1 px-4 flex justify-between items-center cursor-default">
            <span>Terminal OS - C:\Windows\System32\cmd.exe</span>
            <div className="flex gap-4">
              <span className="hover:text-white cursor-pointer" onClick={() => setIsOpen(false)}>_</span>
              <span className="hover:text-white cursor-pointer">□</span>
              <span className="hover:text-red-500 cursor-pointer" onClick={() => setIsOpen(false)}>✕</span>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 overflow-y-auto mt-6 flex flex-col pb-10" style={{ textShadow: '0 0 5px #0f0' }}>
            {history.map((item, index) => (
              <div 
                key={index} 
                className={`mb-1 ${item.type === 'error' ? 'text-red-500' : ''}`}
                style={item.type === 'error' ? { textShadow: '0 0 5px red' } : {}}
              >
                {item.content}
              </div>
            ))}
            
            {/* Input Line */}
            <div className="flex mt-1 items-center">
              <span className="mr-2">C:\Users\Guest&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none flex-1 text-[#0f0]"
                spellCheck="false"
                autoComplete="off"
                autoFocus
              />
            </div>
            <div ref={bottomRef}></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
