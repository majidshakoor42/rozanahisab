import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x && !x.match(/^\d+$/) && x !== 'edit-sale');

  if (pathnames.length === 0 && location.pathname !== '/') return null;

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4">
      <a href="/" className="hover:text-foreground">Home</a>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = value.replace(/-/g, ' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight size={16} className="mx-1" />
            {isLast ? (
              <span className="font-medium text-foreground capitalize">{name}</span>
            ) : (
              <a href={to} className="hover:text-foreground capitalize">{name}</a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 lg:ml-64 flex flex-col">
          <Header />
          <motion.main
            key={useLocation().pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4 lg:p-8 flex-grow"
          >
            <Breadcrumbs />
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default Layout;