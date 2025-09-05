import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import AddSale from '@/pages/AddSale';
import CustomerSearch from '@/pages/CustomerSearch';
import SalesHistory from '@/pages/SalesHistory';
import Settings from '@/pages/Settings';
import Reports from '@/pages/Reports';
import CustomerProfile from '@/pages/CustomerProfile';
import { TooltipProvider } from '@/components/ui/tooltip';
import SplashScreen from '@/components/SplashScreen';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // Simulate loading time
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Rozana Hisab - Sales Ledger</title>
        <meta name="description" content="A modern and professional digital khata system to manage sales and customers for Pakistani businesses." />
        <meta property="og:title" content="Digital Khata - Sales Ledger" />
        <meta property="og:description" content="A modern and professional digital khata system to manage sales and customers for Pakistani businesses." />
      </Helmet>
      <TooltipProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-sale" element={<AddSale />} />
              <Route path="/edit-sale/:saleId" element={<AddSale />} />
              <Route path="/customers" element={<CustomerSearch />} />
              <Route path="/customer/:customerId" element={<CustomerProfile />} />
              <Route path="/sales-history" element={<SalesHistory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </TooltipProvider>
    </>
  );
}


export default App;
