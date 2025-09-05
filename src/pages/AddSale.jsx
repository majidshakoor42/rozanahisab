import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Save, User, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { getCustomers, saveCustomer, saveSale, getSaleWithDetails, getSettings, searchCustomers } from '@/lib/storage';
import { CustomerCombobox } from '@/components/CustomerCombobox';

const AddSale = () => {
  const navigate = useNavigate();
  const { saleId } = useParams();
  const isEditMode = !!saleId;

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [saleItems, setSaleItems] = useState([{ product_name: '', quantity: 1, unit_price: 0 }]);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paidAmount, setPaidAmount] = useState(0);
  const [saleCurrency, setSaleCurrency] = useState('PKR');

  useEffect(() => {
    const settings = getSettings();
    setSaleCurrency(settings.currency || 'PKR');
    setCustomers(getCustomers());

    if (isEditMode) {
      const saleData = getSaleWithDetails(saleId);
      if (saleData) {
        setSelectedCustomer(saleData.sale.customer_id);
        setPaymentStatus(saleData.sale.payment_status);
        setPaidAmount(saleData.sale.paid_amount || 0);
        setSaleItems(saleData.items.length > 0 ? saleData.items : [{ product_name: '', quantity: 1, unit_price: 0 }]);
        setSaleCurrency(saleData.sale.currency);
      } else {
        toast({ title: "Error", description: "Sale not found", variant: "destructive" });
        navigate('/sales-history');
      }
    }
  }, [saleId, isEditMode, navigate]);
  
  const totalAmount = saleItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  const dueAmount = totalAmount - paidAmount;

  const addItem = () => setSaleItems([...saleItems, { product_name: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (index) => {
    if (saleItems.length > 1) {
      setSaleItems(saleItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...saleItems];
    const numValue = Number(value);
    if (field === 'quantity' || field === 'unit_price') {
        updatedItems[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
        updatedItems[index][field] = value;
    }
    setSaleItems(updatedItems);
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name) {
      toast({ title: "Error", description: "Customer name is required", variant: "destructive" });
      return;
    }
    const customer = saveCustomer(newCustomer);
    setCustomers(prev => [...prev, customer]);
    setSelectedCustomer(customer.customer_id);
    setShowNewCustomerForm(false);
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
    toast({ title: "Success", description: "Customer added successfully" });
  };
  
  const handlePaymentStatusChange = (status) => {
    setPaymentStatus(status);
    if (status === 'paid') {
      setPaidAmount(totalAmount);
    } else if (status === 'pending') {
      setPaidAmount(0);
    }
  };

  useEffect(() => {
    if (paymentStatus === 'paid') {
      setPaidAmount(totalAmount);
    }
  }, [totalAmount, paymentStatus]);


  const handleSaveSale = () => {
    if (!selectedCustomer) {
      toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
      return;
    }
    const validItems = saleItems.filter(item => item.product_name && item.quantity > 0 && item.unit_price >= 0);
    if (validItems.length === 0) {
      toast({ title: "Error", description: "Please add at least one valid item", variant: "destructive" });
      return;
    }

    if(paymentStatus === 'partial' && (paidAmount <= 0 || paidAmount >= totalAmount)) {
        toast({ title: "Error", description: "For partial payment, paid amount must be greater than 0 and less than total.", variant: "destructive" });
        return;
    }

    const finalPaidAmount = paymentStatus === 'paid' ? totalAmount : (paymentStatus === 'pending' ? 0 : paidAmount);

    const sale = {
      customer_id: selectedCustomer,
      total_amount: totalAmount,
      paid_amount: finalPaidAmount,
      due_amount: totalAmount - finalPaidAmount,
      payment_status: paymentStatus,
      currency: saleCurrency
    };

    saveSale(sale, validItems, isEditMode ? saleId : null);
    
    toast({ 
        title: "Success!",
        description: `Sale ${isEditMode ? 'updated' : 'recorded'} successfully.`,
        className: 'bg-green-500/10 border-green-500/20 text-foreground'
    });
    navigate(isEditMode ? `/customer/${selectedCustomer}` : '/sales-history');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">{isEditMode ? 'Edit Sale' : 'Add New Sale'}</h1>
        <p className="text-muted-foreground mt-2">{isEditMode ? 'Update the sale transaction details' : 'Record a new sale transaction'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" />Customer Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Select Customer</Label>
                <CustomerCombobox
                  customers={customers}
                  value={selectedCustomer}
                  onSelect={setSelectedCustomer}
                  placeholder="Search or select customer..."
                />
              </div>
              <Button onClick={() => setShowNewCustomerForm(!showNewCustomerForm)} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add New Customer
              </Button>
              {showNewCustomerForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 border-t border-border pt-4">
                  <Input value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} placeholder="Customer Name *" />
                  <Input value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} placeholder="Phone Number (Optional)" />
                  <Input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} placeholder="Email (Optional)" />
                  <Input value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} placeholder="Address (Optional)" />
                  <Button onClick={handleAddCustomer} className="w-full bg-gradient-to-r from-teal-500 to-green-600">Add Customer</Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center justify-between"><span>Sale Items</span><Button onClick={addItem} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Item</Button></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {saleItems.map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-[1fr,80px,100px,120px] gap-4 items-center p-3 rounded-lg bg-secondary/50">
                  <Input value={item.product_name} onChange={(e) => updateItem(index, 'product_name', e.target.value)} placeholder="Product Name" />
                  <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} placeholder="Qty" />
                  <Input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', e.target.value)} placeholder="Price" />
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-right font-semibold text-green-400">{(item.quantity * item.unit_price).toLocaleString()}</div>
                    {saleItems.length > 1 && <Button onClick={() => removeItem(index)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 hover:text-red-400 h-8 w-8"><Trash2 className="w-4 h-4" /></Button>}
                  </div>
                </motion.div>
              ))}
              <div className="border-t border-border pt-4 mt-4 space-y-4">
                <div className="flex justify-between items-center text-lg"><span className="font-semibold">Total Amount:</span><span className="font-bold text-green-400">{saleCurrency} {totalAmount.toLocaleString()}</span></div>
                
                {paymentStatus === 'partial' && (
                  <div className="flex justify-between items-center text-lg"><span className="font-semibold">Amount Due:</span><span className="font-bold text-orange-400">{saleCurrency} {dueAmount.toLocaleString()}</span></div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Status</Label>
                    <Select value={paymentStatus} onValueChange={handlePaymentStatusChange}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentStatus === 'partial' && (
                    <div>
                      <Label>Amount Paid</Label>
                      <Input type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} placeholder="Enter paid amount" />
                    </div>
                  )}
                </div>

                <div className="flex items-end"><Button onClick={handleSaveSale} className="w-full text-lg py-6 bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700">{isEditMode ? <><Edit className="w-5 h-5 mr-2"/>Update Sale</> : <><Save className="w-5 h-5 mr-2"/>Save Sale</>}</Button></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AddSale;