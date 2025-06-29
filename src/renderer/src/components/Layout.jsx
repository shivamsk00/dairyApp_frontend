import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className=" bg-gray-800 text-white flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-white shadow-md ">
          <Header />
        </header>

        {/* Main outlet/content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 shadow-inner p-4">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Layout;
