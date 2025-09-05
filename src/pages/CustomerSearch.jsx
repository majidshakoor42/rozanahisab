import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, User, Phone, Mail, Plus, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { getCustomers, searchCustomers, saveCustomer } from '@/lib/storage';

const CustomerSearch = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });

  useEffect(() => {
    const allCustomers = getCustomers();
    setCustomers(allCustomers);
    setFilteredCustomers(allCustomers);
  }, []);

  useEffect(() => {
    const results = searchCustomers(searchQuery);
    setFilteredCustomers(results);
  }, [searchQuery, customers]);

  const handleAddCustomer = () => {
    if (!newCustomer.name) {
      toast({ title: "Error", description: "Customer name is required", variant: "destructive" });
      return;
    }

    const customer = saveCustomer(newCustomer);
    const updatedCustomers = [...customers, customer];
    setCustomers(updatedCustomers);
    setShowAddForm(false);
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
    toast({ title: "Success", description: "Customer added successfully" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Customers</h1>
          <p className="text-muted-foreground mt-2">Search, view, and manage your customer records.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700">
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </div>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
          <Card>
            <CardHeader><CardTitle>Add New Customer</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} placeholder="Customer Name *" />
                <Input value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} placeholder="Phone Number (Optional)" />
                <Input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} placeholder="Email (Optional)" />
                <Input value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} placeholder="Address (Optional)" />
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleAddCustomer} className="bg-gradient-to-r from-teal-500 to-green-600">Add Customer</Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search customers by name or phone..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer, index) => (
            <motion.div key={customer.customer_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }}>
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-teal-500/20 to-green-600/20 text-primary">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg mb-2">{customer.name}</h3>
                      <div className="space-y-2">
                        {customer.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /><span className="text-sm">{customer.phone}</span></div>}
                        {customer.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /><span className="text-sm truncate">{customer.email}</span></div>}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">Joined: {new Date(customer.created_date).toLocaleDateString()}</p>
                        <Link to={`/customer/${customer.customer_id}`}>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View Profile <Eye className="w-3 h-3 ml-2" /></Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{searchQuery ? 'No customers found' : 'No customers yet'}</h3>
                <p className="text-muted-foreground mb-6">{searchQuery ? 'Try adjusting your search terms' : 'Add your first customer to get started'}</p>
                {!searchQuery && <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-teal-500 to-green-600"><Plus className="w-4 h-4 mr-2" />Add Customer</Button>}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSearch;