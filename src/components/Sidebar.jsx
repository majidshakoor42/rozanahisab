import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Plus, Users, History, Settings, Menu, X, BookOpen, BarChart2 } from 'lucide-react';
const Sidebar = ({
  isOpen,
  setIsOpen
}) => {
  const location = useLocation();
  const menuItems = [{
    path: '/',
    icon: LayoutDashboard,
    label: 'Dashboard'
  }, {
    path: '/add-sale',
    icon: Plus,
    label: 'Add Sale'
  }, {
    path: '/customers',
    icon: Users,
    label: 'Customers'
  }, {
    path: '/sales-history',
    icon: History,
    label: 'Sales History'
  }, {
    path: '/reports',
    icon: BarChart2,
    label: 'Reports'
  }];
  const bottomMenuItems = [{
    path: '/settings',
    icon: Settings,
    label: 'Settings'
  }];
  const toggleSidebar = () => setIsOpen(!isOpen);
  return <>
      <button onClick={toggleSidebar} className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card/80 backdrop-blur-sm text-foreground">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={toggleSidebar} />}

      <motion.aside initial={{
      x: '-100%'
    }} animate={{
      x: isOpen || window.innerWidth >= 1024 ? 0 : '-100%'
    }} transition={{
      type: 'spring',
      stiffness: 300,
      damping: 30
    }} className="fixed left-0 top-0 h-full w-64 glass-effect z-40 lg:z-30 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-green-600 shadow-lg shadow-green-500/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Rozana Hisab</h1>
              <p className="text-xs text-muted-foreground">Sales Ledger</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-grow px-4 space-y-2">
          {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-teal-500/30 to-green-600/30 text-primary-foreground font-semibold shadow-inner' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>;
        })}
        </nav>

        <nav className="px-4 pb-6 space-y-2">
           {bottomMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-teal-500/30 to-green-600/30 text-primary-foreground font-semibold shadow-inner' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>;
        })}
        </nav>
      </motion.aside>
    </>;
};
export default Sidebar;