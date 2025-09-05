import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Edit, Save, X, DollarSign, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { getCustomerById, getSales, getSaleItems, updateCustomer } from '@/lib/storage';

const CustomerProfile = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [customerSales, setCustomerSales] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(null);

  useEffect(() => {
    const cust = getCustomerById(customerId);
    if (cust) {
      setCustomer(cust);
      setEditedCustomer({ ...cust });
      const allSales = getSales();
      const salesForCustomer = allSales.filter(sale => sale.customer_id === customerId).reverse();
      setCustomerSales(salesForCustomer);
    } else {
      toast({ title: "Error", description: "Customer not found.", variant: "destructive" });
      navigate('/customers');
    }
  }, [customerId, navigate]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    if (!editedCustomer.name || !editedCustomer.phone) {
      toast({ title: "Validation Error", description: "Name and phone cannot be empty.", variant: "destructive" });
      return;
    }
    updateCustomer(editedCustomer);
    setCustomer({ ...editedCustomer });
    setIsEditing(false);
    toast({ title: "Success", description: "Customer details updated." });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-500/10';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'partial': return 'text-orange-400 bg-orange-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };
  
  const totalSpent = customerSales.reduce((acc, sale) => acc + sale.total_amount, 0);
  const totalPending = customerSales.filter(s => s.payment_status !== 'paid').reduce((acc, sale) => acc + sale.total_amount, 0);

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <User size={48} />
              </div>
              <div className="flex-grow">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input name="name" value={editedCustomer.name} onChange={handleInputChange} className="text-2xl font-bold" />
                    <Input name="phone" value={editedCustomer.phone} onChange={handleInputChange} />
                    <Input name="email" value={editedCustomer.email} onChange={handleInputChange} />
                    <Input name="address" value={editedCustomer.address} onChange={handleInputChange} />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-white">{customer.name}</h1>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-gray-400">
                      <span className="flex items-center gap-2"><Phone size={16} /> {customer.phone}</span>
                      {customer.email && <span className="flex items-center gap-2"><Mail size={16} /> {customer.email}</span>}
                      {customer.address && <span className="flex items-center gap-2"><MapPin size={16} /> {customer.address}</span>}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveChanges} size="sm" className="bg-green-500 hover:bg-green-600"><Save size={16} className="mr-2" /> Save</Button>
                    <Button onClick={handleEditToggle} size="sm" variant="outline"><X size={16} className="mr-2" /> Cancel</Button>
                  </>
                ) : (
                  <Button onClick={handleEditToggle} size="sm"><Edit size={16} className="mr-2" /> Edit</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover"><CardContent className="p-6"><p className="text-sm text-gray-400">Total Spent</p><p className="text-2xl font-bold">{customer.currency || 'PKR'} {totalSpent.toLocaleString()}</p></CardContent></Card>
        <Card className="card-hover"><CardContent className="p-6"><p className="text-sm text-gray-400">Total Pending</p><p className="text-2xl font-bold text-yellow-400">{customer.currency || 'PKR'} {totalPending.toLocaleString()}</p></CardContent></Card>
        <Card className="card-hover"><CardContent className="p-6"><p className="text-sm text-gray-400">Total Transactions</p><p className="text-2xl font-bold">{customerSales.length}</p></CardContent></Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>All sales transactions for this customer.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerSales.length > 0 ? (
                customerSales.map(sale => (
                  <div key={sale.sale_id} className="flex justify-between items-center p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-4">
                       <Package className="w-5 h-5 text-blue-400" />
                       <div>
                         <p className="font-semibold text-white">Sale #{sale.sale_id.slice(-6)}</p>
                         <p className="text-sm text-gray-400 flex items-center gap-2">
                           <Calendar size={14} /> {new Date(sale.date).toLocaleDateString()}
                         </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-lg text-green-400">{sale.currency} {sale.total_amount.toLocaleString()}</p>
                       <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(sale.payment_status)}`}>
                          {sale.payment_status}
                       </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Package size={48} className="mx-auto mb-4" />
                  <p>No sales history for this customer.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomerProfile;