import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar - Fixed */}
      <aside className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex-shrink-0 shadow-2xl border-r border-slate-700/30 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main Content Container */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header - Fixed */}
        <header className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm z-10">
          <Header />
        </header>

        {/* Main Content - Scrollable Only */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
            {/* Content Container with Modern Design */}
            <div className="min-h-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <div className="p-4 sm:p-6 lg:p-8">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll to top button - Only shows when main content scrolls */}
          <ScrollToTopButton />
        </main>

        {/* Footer - Fixed */}
        <footer className="flex-shrink-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/30 shadow-inner">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <Footer />
          </div>
        </footer>
      </div>
    </div>
  );
};

// Updated Scroll to Top Button Component
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollContainer = document.querySelector('main');
      if (scrollContainer && scrollContainer.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const scrollContainer = document.querySelector('main');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', toggleVisibility);
      return () => scrollContainer.removeEventListener('scroll', toggleVisibility);
    }
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-20 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300/50 group"
      aria-label="Scroll to top"
    >
      <svg
        className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

export default Layout;
