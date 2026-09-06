import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

function Portfolio() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen selection:bg-accent selection:text-bg-primary">
        <CustomCursor />
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/slogin" element={<Login />} />
          <Route path="/sregistration" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
