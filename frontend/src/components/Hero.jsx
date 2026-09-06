import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const words = ["Matter.", "Scale.", "Inspire.", "Perform."];

export default function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];
    let typingSpeed = 250; // Slower typing speed

    if (isDeleting) {
      typingSpeed = 150; // Slower deleting speed
    }

    if (!isDeleting && currentText === word) {
      typingSpeed = 2500; // Pause at end of word
      setIsDeleting(true);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      typingSpeed = 800; // Pause before typing next word
    }

    const timeout = setTimeout(() => {
      setCurrentText(
        isDeleting 
          ? word.substring(0, currentText.length - 1)
          : word.substring(0, currentText.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex]);

  return (
    <section className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Left side: Massive Typography */}
      <div className="w-full lg:w-3/5 min-h-[50vh] md:min-h-screen flex flex-col justify-center p-6 md:p-12 lg:p-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-serif text-6xl md:text-7xl lg:text-[8rem] xl:text-[9rem] font-black leading-[0.85] tracking-tighter text-text-primary uppercase mb-6 min-h-[4em]">
            I Build<br/>
            Things<br/>
            <span className="text-accent underline decoration-8 underline-offset-8">That</span><br/>
            <span className="border-r-8 border-text-primary pr-2 animate-pulse whitespace-nowrap">{currentText}</span>
          </h1>
          <p className="font-sans text-lg md:text-xl font-medium max-w-md mt-8 border-l-4 border-text-primary pl-4">
            Innovative Full-Stack Developer skilled in MERN & PHP with a passion for AI. I use advanced AI agents to accelerate development and build responsive, high-performance web applications.
          </p>
        </motion.div>
      </div>

      {/* Right side: Abstract Visual / Image Placeholder */}
      <div className="w-full lg:w-2/5 min-h-[50vh] md:min-h-screen bg-text-primary flex items-center justify-center p-10 relative">
        <motion.div
          className="w-full max-w-md aspect-square bg-bg-primary relative overflow-hidden flex items-center justify-center group"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Brutalist Abstract Geometry inside the box */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center mix-blend-luminosity opacity-40 group-hover:opacity-80 transition-opacity duration-700"></div>
          <motion.div 
            className="w-32 h-32 md:w-48 md:h-48 bg-accent rounded-full absolute mix-blend-exclusion"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360] 
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <div className="font-serif text-5xl md:text-7xl font-bold text-bg-primary z-10 mix-blend-difference pointer-events-none">
            [01]
          </div>
        </motion.div>
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--color-bg-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-bg-primary) 1px, transparent 1px)', backgroundSize: '100px 100px', opacity: 0.05 }}></div>
      </div>
    </section>
  );
}
