
import React, { useState, useEffect } from 'react';
import Icon from './Icon';

interface HeaderProps {
  onOpenSignup: () => void;
  onSignin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSignup, onSignin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Partners', href: '#partners' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#feedback' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-yellow-500/20">
              <span className="text-slate-900 font-bold text-xl">L</span>
            </div>
            <span className={`text-xl font-bold ${isScrolled ? 'text-slate-900' : 'text-white'} transition-colors`}>
              Location Register
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium hover:text-yellow-500 transition-colors ${
                  isScrolled ? 'text-slate-600' : 'text-slate-200'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={onSignin}
              className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-all ${
                isScrolled 
                    ? 'border-slate-300 text-slate-700 hover:border-yellow-500 hover:text-yellow-500' 
                    : 'border-white text-white hover:border-yellow-500 hover:text-yellow-500'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={onOpenSignup}
              className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 border border-transparent shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-0.5
                bg-yellow-500 text-slate-900
                hover:bg-white hover:text-yellow-600 hover:border-yellow-500
              `}
            >
              Sign Up
              <Icon name="chevron-right" className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`lg:hidden p-2 transition-colors ${isScrolled ? 'text-slate-600 hover:text-yellow-500' : 'text-white hover:text-yellow-400'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
             {isMobileMenuOpen ? <Icon name="x-mark" className="w-6 h-6" /> : <Icon name="hamburger" className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out pt-24 px-6 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-lg font-medium text-slate-800 hover:text-yellow-500 transition-colors border-b border-gray-100 pb-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="flex flex-col gap-4 mt-8">
            <button 
              onClick={() => { onSignin(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-center font-semibold text-slate-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => { onOpenSignup(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-center font-semibold text-slate-900 bg-yellow-500 rounded-xl hover:bg-white hover:text-yellow-600 border border-transparent hover:border-yellow-500 transition-colors shadow-lg shadow-yellow-500/20"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
