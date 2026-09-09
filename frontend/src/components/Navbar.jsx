import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const checkUnread = async () => {
      const token = localStorage.getItem('client_token');
      if (token) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/check_unread.php?token=${token}`);
          const data = await res.json();
          setHasUnread(data.unread);
        } catch (e) {}
      } else {
        setHasUnread(false);
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav className="w-full fixed top-0 z-50 flex justify-between items-center p-6 md:p-10 mix-blend-difference text-bg-primary">
        <div className="font-serif font-black text-xl sm:text-2xl tracking-tighter uppercase cursor-pointer hover:text-accent transition-colors whitespace-nowrap z-50">
          KULDEEP.<span className="hidden sm:inline"> / DEV</span>
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 font-sans font-bold text-sm tracking-widest uppercase items-center">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-terminal'))}
            className="flex items-center gap-2 bg-text-primary text-bg-primary px-3 py-1 hover:bg-accent transition-colors group"
          >
            <span className="font-mono bg-bg-primary text-text-primary px-1 group-hover:bg-text-primary group-hover:text-accent transition-colors">Ctrl</span> + <span className="font-mono bg-bg-primary text-text-primary px-1 group-hover:bg-text-primary group-hover:text-accent transition-colors">`</span> Terminal
          </button>
          <a href="/#about" className="hover:text-accent transition-colors">About</a>
          <a href="/#projects" className="hover:text-accent transition-colors">Work</a>
          <a href="/#contact" className="hover:text-accent transition-colors">Contact</a>
          <a href="/portal" className="text-accent hover:text-white transition-colors flex items-center gap-2">
            Portal
            {hasUnread ? (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
            ) : (
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            )}
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`bg-bg-primary block transition-all duration-300 ease-out h-1 w-full ${isOpen ? 'rotate-45 translate-y-[6px]' : '-translate-y-1'}`}></span>
          <span className={`bg-bg-primary block transition-all duration-300 ease-out h-1 w-full my-[2px] ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`bg-bg-primary block transition-all duration-300 ease-out h-1 w-full ${isOpen ? '-rotate-45 -translate-y-[6px]' : 'translate-y-1'}`}></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 bg-bg-primary text-text-primary flex flex-col justify-center items-center p-6"
          >
            <div className="flex flex-col gap-12 font-serif font-black text-5xl sm:text-6xl uppercase tracking-tighter text-center">
              <a href="/#about" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">About</a>
              <a href="/#projects" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">Work</a>
              <a href="/#contact" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">Contact</a>
              <a href="/portal" onClick={() => setIsOpen(false)} className="text-accent hover:text-white transition-colors flex items-center justify-center gap-4">
                Portal 
                {hasUnread ? (
                  <span className="w-4 h-4 bg-red-500 border-2 border-text-primary shadow-[2px_2px_0_0_#111111] animate-bounce"></span>
                ) : (
                  <span className="w-3 h-3 bg-accent rounded-full animate-pulse"></span>
                )}
              </a>
            </div>
            
            {/* Mobile Terminal Button */}
            <div className="mt-20">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  window.dispatchEvent(new Event('toggle-terminal'));
                }}
                className="flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-6 py-3 hover:bg-accent transition-colors font-sans font-bold text-sm tracking-widest uppercase"
              >
                Open Terminal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
