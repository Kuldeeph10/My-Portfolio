export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 z-40 flex justify-between items-center p-6 md:p-10 mix-blend-difference text-bg-primary">
      <div className="font-serif font-black text-2xl tracking-tighter uppercase cursor-pointer hover:text-accent transition-colors">
        KULDEEP. / DEV
      </div>
      <div className="flex gap-8 font-sans font-bold text-sm tracking-widest uppercase">
        <a href="#about" className="hover:text-accent transition-colors">About</a>
        <a href="#projects" className="hover:text-accent transition-colors">Work</a>
        <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
      </div>
    </nav>
  );
}
