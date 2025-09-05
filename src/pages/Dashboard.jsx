import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, ShoppingCart, Wallet, Plus, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTodaysSummary, getCustomers, getSales, getSettings, getDailySummaries } from '@/lib/storage';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [todaysSummary, setTodaysSummary] = useState(null);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [recentSales, setRecentSales] = useState([]);
  const [settings, setSettings] = useState({});
  const [salesChartData, setSalesChartData] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);

  const refreshData = () => {
    const summary = getTodaysSummary();
    const sales = getSales();
    const appSettings = getSettings();
    const customers = getCustomers();

    setAllCustomers(customers);
    setSettings(appSettings);
    setTodaysSummary(summary);
    setTotalCustomers(customers.length);

    const pending = sales.reduce((acc, s) => acc + (s.due_amount || 0), 0);
    setPendingAmount(pending);
    
    setRecentSales(sales.slice(-5).reverse());
    
    // Prepare chart data for last 7 days
    const summaries = getDailySummaries();
    const last7DaysSales = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const keyDate = d.toISOString().split('T')[0];
      const keyName = d.toLocaleDateString('en-US', { weekday: 'short' });
      last7DaysSales[keyName] = summaries[keyDate] ? summaries[keyDate].total_sales : 0;
    }

    setSalesChartData(Object.entries(last7DaysSales).map(([name, sales]) => ({ name, sales })));
  };


  useEffect(() => {
    refreshData();
  }, []);

  const getCustomerName = (customerId) => {
    const customer = allCustomers.find(c => c.customer_id === customerId);
    return customer ? customer.name : 'Unknown';
  };

  const stats = [
    { title: "Today's Earnings", value: `${settings.currency || 'PKR'} ${todaysSummary?.total_sales?.toLocaleString() || '0'}`, icon: Wallet, color: 'from-green-500 to-emerald-600', change: `${todaysSummary?.number_of_transactions || 0} transactions` },
    { title: 'Total Due Amount', value: `${settings.currency || 'PKR'} ${pendingAmount.toLocaleString()}`, icon: TrendingUp, color: 'from-orange-500 to-red-600', change: 'Across all sales' },
    { title: 'Total Customers', value: totalCustomers.toLocaleString(), icon: Users, color: 'from-blue-500 to-cyan-600', change: 'Active clients' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome! Here's your business at a glance.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/add-sale"><Button className="bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 shadow-lg shadow-green-500/20"><Plus className="w-4 h-4 mr-2" />Add Sale</Button></Link>
          <Link to="/reports"><Button variant="outline"><BarChart2 className="w-4 h-4 mr-2" />View Reports</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} shadow-lg shadow-green-500/20`}><stat.icon className="w-6 h-6 text-white" /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                   <BarChart data={salesChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'hsl(var(--accent))'}} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}/>
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle className="flex items-center justify-between"><span>Recent Sales</span><Link to="/sales-history"><Button variant="ghost" size="sm" className="text-primary">View All</Button></Link></CardTitle></CardHeader>
            <CardContent>
              {recentSales.length > 0 ? (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.sale_id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">{getCustomerName(sale.customer_id)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right"><p className="font-semibold text-green-400 text-sm">{sale.currency} {sale.total_amount.toLocaleString()}</p></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8"><ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No sales recorded yet</p><Link to="/add-sale"><Button className="mt-4 bg-gradient-to-r from-teal-500 to-green-600">Add Your First Sale</Button></Link></div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;