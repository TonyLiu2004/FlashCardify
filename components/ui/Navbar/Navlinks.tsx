'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from './user';
import s from './Navbar.module.css';
import { FiMenu, FiX } from 'react-icons/fi';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/generate', label: 'Generate' },
    { href: '/decks', label: 'My Decks' },
    { href: '/challenge', label: 'Challenge' },
    { href: '/shared', label: 'Public' },
    { href: '/upload', label: 'Upload' }
  ];

  return (
    <div className="relative flex items-center justify-between py-2 px-4 h-20 w-full max-w-7xl mx-auto">
      <div className="flex items-center">
        <Link href="/" className={s.logo} aria-label="Logo">
          <img
            src="/alt_logo.png"
            className="h-14 w-auto max-w-[180px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-[180px]"
            alt="FlashCardify Logo"
          />
        </Link>
        {!isMobile && (
          <nav className="ml-6 space-x-4 hidden lg:flex" style={{ fontSize: '17px' }}>
            {user && navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={s.link}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <div className="flex items-center">
        {user ? (
          <User />
        ) : (
          <Link
            href="/signin"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors duration-200"
          >
            Sign In
          </Link>
        )}
        {isMobile && (
          <button onClick={toggleMenu} className="ml-4 text-3xl focus:outline-none">
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md z-50">
          <nav className="flex flex-col items-center space-y-2 py-4">
            {user && navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={s.link} onClick={toggleMenu}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}