import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // We will point this to our PHP backend in Phase 2 Setup
      const response = await fetch('http://localhost/Portfolio/backend/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Error submitting form", error);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-20 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20">
        
        {/* Left Side: Massive Header */}
        <div className="w-full md:w-1/2">
          <motion.h2 
            className="font-serif text-7xl md:text-9xl font-black uppercase tracking-tighter"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Let's<br/>
            Talk.
          </motion.h2>
          <p className="font-sans text-xl mt-8 font-medium max-w-sm">
            Have a project in mind, or just want to say hi? Drop a message below and I'll get back to you.
          </p>
        </div>

        {/* Right Side: Brutalist Form */}
        <div className="w-full md:w-1/2 flex items-center">
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
            
            <div className="flex flex-col group">
              <label htmlFor="name" className="font-sans font-bold uppercase tracking-widest text-sm mb-2 group-focus-within:text-accent transition-colors">Name</label>
              <input 
                type="text" 
                id="name" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-transparent border-b-4 border-text-primary outline-none py-4 font-serif text-3xl md:text-4xl focus:border-accent transition-colors rounded-none"
                placeholder="YOUR NAME"
              />
            </div>

            <div className="flex flex-col group">
              <label htmlFor="email" className="font-sans font-bold uppercase tracking-widest text-sm mb-2 group-focus-within:text-accent transition-colors">Email</label>
              <input 
                type="email" 
                id="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-transparent border-b-4 border-text-primary outline-none py-4 font-serif text-3xl md:text-4xl focus:border-accent transition-colors rounded-none"
                placeholder="KULDEEPHAWLADAR14@GMAIL.COM"
              />
            </div>

            <div className="flex flex-col group">
              <label htmlFor="message" className="font-sans font-bold uppercase tracking-widest text-sm mb-2 group-focus-within:text-accent transition-colors">Message</label>
              <textarea 
                id="message" 
                rows="3"
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="bg-transparent border-b-4 border-text-primary outline-none py-4 font-serif text-2xl md:text-3xl focus:border-accent transition-colors resize-none rounded-none"
                placeholder="TELL ME ABOUT YOUR PROJECT"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === 'sending'}
              className="mt-8 bg-text-primary text-bg-primary font-black uppercase text-4xl md:text-6xl py-8 px-6 hover:bg-accent hover:text-text-primary transition-colors duration-300 disabled:opacity-50"
            >
              {status === 'sending' ? 'SENDING...' : status === 'success' ? 'SENT!' : 'SEND MESSAGE'}
            </button>
            
            {status === 'error' && (
              <p className="text-red-500 font-bold font-sans">Something went wrong. Please try again later.</p>
            )}

          </form>
        </div>
      </div>
    </section>
  );
}
