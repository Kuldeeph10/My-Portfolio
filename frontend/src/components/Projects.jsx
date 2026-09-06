import { motion } from 'framer-motion';

const projects = [
  {
    id: 1,
    title: "AI-Powered 10th Class Tutor",
    description: "An intelligent learning platform providing student guidance, practice exercises, and personalized AI notes.",
    tech: ["React", "Node.js", "AI Agents", "Tailwind"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    title: "Student Loan Fund (Hackathon)",
    description: "A fintech platform designed to provide accessible micro-loans for students, built during a competitive hackathon.",
    tech: ["MERN Stack", "Express.js", "MongoDB"],
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 3,
    title: "Enterprise ERP & CRM",
    description: "A fully dynamic suite covering CRM, Supplier Management, and Laundry ERP with robust backend logic.",
    tech: ["PHP", "MySQL", "JavaScript", "Bootstrap"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"
  }
];

export default function Projects() {
  return (
    <section id="projects" className="min-h-screen bg-text-primary text-bg-primary py-20 px-6 md:px-20 border-t-8 border-bg-primary relative overflow-hidden">
      
      <motion.h2 
        className="font-serif text-6xl md:text-9xl font-black uppercase mb-16"
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        Selected<br/>
        <span className="text-accent">Work.</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
        {projects.map((project, index) => (
          <motion.div 
            key={project.id}
            className="group relative cursor-pointer"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            {/* Image Container */}
            <div className="aspect-[4/5] w-full overflow-hidden bg-bg-primary border-4 border-bg-primary relative">
              <motion.img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                whileHover={{ scale: 1.1 }}
              />
              
              {/* Brutalist Overlay Info */}
              <div className="absolute inset-0 bg-text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                <div>
                  <h3 className="font-serif text-3xl font-bold uppercase">{project.title}</h3>
                  <p className="font-sans text-sm mt-2">{project.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t, i) => (
                    <span key={i} className="text-xs font-bold uppercase bg-accent text-text-primary px-2 py-1">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Index Number */}
            <div className="absolute -top-6 -left-6 font-serif text-6xl font-black text-bg-primary mix-blend-difference pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
              0{project.id}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
