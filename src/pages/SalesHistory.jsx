import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, DollarSign, User, Package, Eye, Edit, Trash2, CheckCircle, Undo, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { getSales, getCustomers, getSaleWithDetails, deleteSale, returnSale, addPaymentToSale, getSettings } from '@/lib/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, subDays } from 'date-fns';

const SalesHistory = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [settings, setSettings] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 30), to: new Date() });

  const fetchData = () => {
    setSales(getSales());
    setCustomers(getCustomers());
    setSettings(getSettings());
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...sales].reverse();

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.payment_status === statusFilter);
    }
    
    if (dateRange.from && dateRange.to) {
        filtered = filtered.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= dateRange.from && saleDate <= dateRange.to;
        });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sale => {
        const customer = customers.find(c => c.customer_id === sale.customer_id);
        const customerName = customer ? customer.name.toLowerCase() : '';
        const saleId = sale.sale_id.toLowerCase();
        return customerName.includes(query) || saleId.includes(query);
      });
    }
    setFilteredSales(filtered);
  }, [searchQuery, sales, customers, statusFilter, dateRange]);

  const getCustomerName = (customerId) => customers.find(c => c.customer_id === customerId)?.name || 'Unknown';

  const getStatusProps = (status) => {
    switch (status) {
      case 'paid': return { color: 'text-green-400', bg: 'bg-green-500/10' };
      case 'pending': return { color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
      case 'partial': return { color: 'text-orange-400', bg: 'bg-orange-500/10' };
      case 'returned': return { color: 'text-gray-400', bg: 'bg-gray-500/10' };
      default: return { color: 'text-gray-400', bg: 'bg-gray-500/10' };
    }
  };
  
  const handleDeleteSale = (saleId) => {
    if (window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      deleteSale(saleId);
      toast({ title: "Success", description: "Sale deleted successfully." });
      fetchData();
      setSelectedSale(null);
    }
  };

  const handleReturnSale = (saleId) => {
    if (window.confirm('Are you sure you want to mark this sale as returned? This will reverse any payment from daily earnings.')) {
        returnSale(saleId);
        toast({ title: "Success", description: "Sale marked as returned." });
        fetchData();
        setSelectedSale(null);
    }
  };

  const handleSettlePayment = () => {
    if (paymentAmount <= 0) {
      toast({ title: 'Error', description: 'Payment amount must be greater than zero.', variant: 'destructive'});
      return;
    }
    addPaymentToSale(selectedSale.sale_id, paymentAmount);
    toast({ title: 'Success', description: 'Payment added successfully.' });
    setPaymentDialogOpen(false);
    setPaymentAmount(0);
    fetchData();
    setSelectedSale(prev => getSaleWithDetails(prev.sale.sale_id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Sales History</h1>
        <p className="text-muted-foreground mt-2">View and manage all your sales transactions</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by customer name or sale ID..." className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange.from ? (dateRange.to ? `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`: format(dateRange.from, 'LLL dd, y')) : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><CalendarComponent mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} /></PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredSales.length > 0 ? (
          filteredSales.map((sale, index) => {
            const {color, bg} = getStatusProps(sale.payment_status);
            return(
              <motion.div key={sale.sale_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }}>
                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600"><Package className="w-6 h-6 text-white" /></div>
                        <div>
                          <div className="flex items-center gap-3 mb-2"><h3 className="font-semibold text-foreground text-lg">Sale #{sale.sale_id.slice(-6)}</h3><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${color} ${bg}`}>{sale.payment_status}</span></div>
                          <div className="space-y-1 text-muted-foreground"><div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{getCustomerName(sale.customer_id)}</span></div><div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{new Date(sale.date).toLocaleString()}</span></div></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-green-400 font-semibold text-xl"><DollarSign className="w-5 h-5" />{sale.currency} {sale.total_amount.toLocaleString()}</div>
                          {sale.due_amount > 0 && <div className="text-xs text-orange-400">Due: {sale.currency} {sale.due_amount.toLocaleString()}</div>}
                        </div>
                        <Button onClick={() => setSelectedSale(getSaleWithDetails(sale.sale_id))} variant="outline" size="sm"><Eye className="w-4 h-4 mr-2" />View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        ) : (<Card><CardContent className="p-12 text-center"><Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-xl font-semibold text-foreground mb-2">{searchQuery || statusFilter !== 'all' ? 'No sales found' : 'No sales yet'}</h3><p className="text-muted-foreground">{searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first sale'}</p></CardContent></Card>)}
      </div>
      
      {selectedSale && (
        <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Sale Details</DialogTitle>
              <DialogDescription>Sale ID: #{selectedSale.sale.sale_id.slice(-6)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-muted-foreground text-sm">Customer</p><p className="font-semibold">{getCustomerName(selectedSale.sale.customer_id)}</p></div>
                <div><p className="text-muted-foreground text-sm">Date</p><p className="font-semibold">{new Date(selectedSale.sale.date).toLocaleString()}</p></div>
                <div><p className="text-muted-foreground text-sm">Status</p><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusProps(selectedSale.sale.payment_status).color} ${getStatusProps(selectedSale.sale.payment_status).bg}`}>{selectedSale.sale.payment_status}</span></div>
                <div><p className="text-muted-foreground text-sm">Total Amount</p><p className="font-semibold text-green-400">{selectedSale.sale.currency} {selectedSale.sale.total_amount.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground text-sm">Amount Paid</p><p className="font-semibold text-green-400">{selectedSale.sale.currency} {(selectedSale.sale.paid_amount || 0).toLocaleString()}</p></div>
                <div><p className="text-muted-foreground text-sm">Amount Due</p><p className="font-semibold text-orange-400">{selectedSale.sale.currency} {(selectedSale.sale.due_amount || 0).toLocaleString()}</p></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Items</h3>
                <div className="space-y-3">{selectedSale.items.map((item) => (<div key={item.item_id} className="flex justify-between items-center p-3 rounded-lg bg-secondary"><div><p className="font-medium">{item.product_name}</p><p className="text-muted-foreground text-sm">{item.quantity} × {selectedSale.sale.currency} {item.unit_price.toLocaleString()}</p></div><p className="font-semibold">{selectedSale.sale.currency} {item.total_price.toLocaleString()}</p></div>))}</div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
              <div className="flex gap-2">
                <Button onClick={() => handleDeleteSale(selectedSale.sale.sale_id)} variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                <Button onClick={() => handleReturnSale(selectedSale.sale.sale_id)} variant="outline"><Undo className="w-4 h-4 mr-2" />Return Sale</Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/edit-sale/${selectedSale.sale.sale_id}`)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
                {selectedSale.sale.due_amount > 0 && <Button onClick={() => { setPaymentAmount(selectedSale.sale.due_amount); setPaymentDialogOpen(true); }} className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-2" />Settle Dues</Button>}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedSale && (
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settle Due Payment</DialogTitle>
              <DialogDescription>Add a payment for Sale #{selectedSale.sale.sale_id.slice(-6)}. Due amount is {settings.currency} {selectedSale.sale.due_amount.toLocaleString()}.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input id="paymentAmount" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} max={selectedSale.sale.due_amount} />
            </div>
            <DialogFooter>
              <Button onClick={handleSettlePayment}>Add Payment</Button>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SalesHistory;