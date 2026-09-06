import { motion } from 'framer-motion';

const techStack = [
  "REACT.JS", "NODE.JS", "PHP", "MONGODB", "LARAVEL", "NEXT.JS", 
  "TAILWIND CSS", "ANTIGRAVITY", "CURSOR AI", "PYTHON"
];

export default function About() {
  return (
    <section id="about" className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-between overflow-hidden py-20 relative">
      
      {/* Decorative Giant Typography */}
      <div className="absolute top-0 left-0 w-full overflow-hidden opacity-5 pointer-events-none select-none flex">
        <h2 className="font-serif text-[15rem] md:text-[25rem] font-black leading-none whitespace-nowrap">
          FULL-STACK DEVELOPER
        </h2>
      </div>

      <div className="flex-grow flex flex-col md:flex-row p-6 md:p-20 relative z-10 gap-10 mt-10 md:mt-20">
        
        {/* Left Side: Headline */}
        <div className="w-full md:w-1/2">
          <motion.h2 
            className="font-serif text-5xl md:text-7xl font-black uppercase mb-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            I Engineer<br/>
            <span className="text-transparent" style={{ WebkitTextStroke: '2px var(--color-text-primary)' }}>Digital</span><br/>
            Realities.
          </motion.h2>
        </div>

        {/* Right Side: Bio */}
        <div className="w-full md:w-1/2 flex flex-col justify-end border-t-4 border-text-primary pt-6">
          <motion.p 
            className="font-sans text-xl md:text-2xl font-medium leading-relaxed max-w-xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            I am a full-stack developer passionate about bridging the gap between raw backend logic and striking frontend aesthetics. 
            Skilled in MERN and PHP, I use advanced AI tools to accelerate development and craft high-performance applications that leave a lasting impression.
          </motion.p>
          
          <motion.div 
            className="mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a href="#contact" className="inline-block bg-text-primary text-bg-primary font-bold uppercase tracking-widest px-8 py-4 hover:bg-accent hover:text-text-primary transition-colors duration-300">
              Get in Touch
            </a>
          </motion.div>
        </div>
      </div>

      {/* Infinite Scrolling Marquee */}
      <div className="mt-20 border-y-8 border-text-primary py-4 overflow-hidden bg-text-primary text-accent flex whitespace-nowrap relative">
        <motion.div 
          className="flex gap-8 font-serif text-5xl font-black uppercase"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          {/* We repeat the array twice to create a seamless loop */}
          {[...techStack, ...techStack].map((tech, index) => (
            <span key={index} className="flex items-center gap-8">
              {tech} 
              <span className="text-bg-primary opacity-30 text-3xl">✦</span>
            </span>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
