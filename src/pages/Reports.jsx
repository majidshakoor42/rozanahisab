import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSales, getCustomers, getSaleItems, getSettings } from '@/lib/storage';

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState({});
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    setSales(getSales());
    setCustomers(getCustomers());
    setItems(getSaleItems());
    setSettings(getSettings());
  }, []);

  const currency = settings.currency || 'PKR';

  // Monthly Sales Chart Data
  const monthlySalesData = sales.reduce((acc, sale) => {
    const month = new Date(sale.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += (sale.paid_amount || 0);
    return acc;
  }, {});
  const salesChartData = Object.entries(monthlySalesData).map(([name, earnings]) => ({ name, earnings })).reverse();

  // Top Customers by Spending
  const customerSpending = sales.reduce((acc, sale) => {
    if (!acc[sale.customer_id]) acc[sale.customer_id] = 0;
    acc[sale.customer_id] += sale.total_amount;
    return acc;
  }, {});
  const topCustomersBySpending = Object.entries(customerSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([customerId, total]) => ({ name: getCustomers().find(c => c.customer_id === customerId)?.name || 'Unknown', total }));

  // Top Customers by Number of Purchases
  const customerPurchases = sales.reduce((acc, sale) => {
    if (!acc[sale.customer_id]) acc[sale.customer_id] = 0;
    acc[sale.customer_id] += 1;
    return acc;
  }, {});
  const topCustomersByPurchases = Object.entries(customerPurchases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([customerId, purchases]) => ({ name: getCustomers().find(c => c.customer_id === customerId)?.name || 'Unknown', purchases }));

  // Top Sold Items
  const itemSales = items.reduce((acc, item) => {
    const name = item.product_name.toLowerCase();
    if (!acc[name]) acc[name] = { quantity: 0, name: item.product_name };
    acc[name].quantity += item.quantity;
    return acc;
  }, {});
  const topSoldItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  
  const COLORS = ['#14b8a6', '#0891b2', '#6366f1', '#f97316', '#ec4899'];

  const renderMonthlyChart = () => {
    if (chartType === 'bar') {
      return <BarChart data={salesChartData}><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${currency} ${value / 1000}k`} /><Tooltip cursor={{fill: 'hsl(var(--accent))'}} contentStyle={{ backgroundColor: 'hsl(var(--popover))' }} /><Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>;
    }
    return <LineChart data={salesChartData}><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${currency} ${value / 1000}k`} /><Tooltip cursor={{fill: 'hsl(var(--accent))'}} contentStyle={{ backgroundColor: 'hsl(var(--popover))' }} /><Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} /></LineChart>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">Visualize your business performance.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Monthly Earnings</CardTitle>
                <CardDescription>Total paid amounts per month in {currency}.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant={chartType === 'bar' ? 'default' : 'outline'} size="sm" onClick={() => setChartType('bar')}>Bar</Button>
                <Button variant={chartType === 'line' ? 'default' : 'outline'} size="sm" onClick={() => setChartType('line')}>Line</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>{renderMonthlyChart()}</ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Customers (by Spending)</CardTitle>
              <CardDescription>Highest total purchase value.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={topCustomersBySpending} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {topCustomersBySpending.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Frequent Buyers</CardTitle>
              <CardDescription>Most number of transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-4">
                  {topCustomersByPurchases.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="font-semibold text-primary">{customer.purchases} sales</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Sold Items</CardTitle>
            <CardDescription>By total quantity sold.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSoldItems.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1">
                    <p className="font-medium capitalize text-foreground">{item.name}</p>
                  </div>
                  <div className="w-1/2 bg-secondary rounded-full h-2.5">
                    <div className="h-2.5 rounded-full" style={{ width: `${(item.quantity / Math.max(...topSoldItems.map(i => i.quantity))) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                  </div>
                  <p className="ml-4 font-semibold w-12 text-right">{item.quantity}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Reports;