import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Sidbar from './Sidebar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className='layoutContainer'>
      <Header />
      <div className='mainContainer'>
        <Sidbar />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout