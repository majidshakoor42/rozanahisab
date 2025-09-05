import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Building, DollarSign, Download, Upload, Trash2, FileText } from 'lucide-react';
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
import { getSettings, updateSettings, exportDataToJSON, importDataFromJSON, getSales, getCustomers } from '@/lib/storage';
import Papa from 'papaparse';

const Settings = () => {
  const [settings, setSettings] = useState({ currency: 'PKR', businessName: 'My Business', taxRate: 0 });
  const importFileRef = useRef(null);
  const importCustomersFileRef = useRef(null);

  useEffect(() => {
    const currentSettings = getSettings();
    if(currentSettings) setSettings(currentSettings);
  }, []);

  const handleSave = () => {
    updateSettings(settings);
    toast({ title: "Success", description: "Settings saved successfully" });
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: field === 'taxRate' ? Number(value) : value }));
  };

  const handleBackup = () => {
    exportDataToJSON();
    toast({ title: "Success", description: "Backup downloaded successfully." });
  };

  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (file) {
      importDataFromJSON(file)
        .then(() => {
          toast({ title: "Success", description: "Data restored successfully. Please refresh the page." });
          window.location.reload();
        })
        .catch(err => {
          toast({ title: "Error", description: "Failed to restore data. Invalid file.", variant: "destructive" });
        });
    }
  };
  
  const handleExportSales = () => {
    const sales = getSales();
    const customers = getCustomers();
    const dataToExport = sales.map(s => {
      const customer = customers.find(c => c.customer_id === s.customer_id);
      return {
        ...s,
        customer_name: customer ? customer.name : 'Unknown',
        date: new Date(s.date).toLocaleDateString(),
      };
    });
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'sales_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Success", description: "Sales data exported to CSV." });
  };
  
  const handleClearData = () => {
    if (window.confirm('ARE YOU SURE? This will delete all sales, customers, and settings. This action is irreversible.')) {
      localStorage.clear();
      toast({ title: "DATA CLEARED", description: "All application data has been deleted. Please refresh.", variant: "destructive" });
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-gray-400 mt-2">Configure your business settings and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building className="w-5 h-5" />Business Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><Label htmlFor="businessName">Business Name</Label><Input id="businessName" value={settings.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} /></div>
          <div>
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={settings.currency} onValueChange={(value) => handleInputChange('currency', value)}>
              <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="taxRate">Tax Rate (%)</Label><Input id="taxRate" type="number" min="0" max="100" step="0.01" value={settings.taxRate} onChange={(e) => handleInputChange('taxRate', e.target.value)} /></div>
          <div className="flex items-end"><Button onClick={handleSave} className="w-full bg-gradient-to-r from-green-500 to-emerald-600"><Save className="w-4 h-4 mr-2" />Save Settings</Button></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Data Export</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <p className="text-sm text-gray-400">Export your sales and customer data to a CSV file for use in other applications.</p>
             <Button onClick={handleExportSales} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10"><Download className="w-4 h-4 mr-2" />Export Sales to CSV</Button>
             <Button onClick={() => toast({ description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"})} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10"><Download className="w-4 h-4 mr-2" />Export Customers to CSV</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />Backup & Restore</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">Save a full backup of all your app data, or restore from a previous backup file.</p>
            <Button onClick={handleBackup} variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"><Download className="w-4 h-4 mr-2" />Backup Data</Button>
            <input type="file" ref={importFileRef} onChange={handleRestore} className="hidden" accept=".json" />
            <Button onClick={() => importFileRef.current.click()} variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"><Upload className="w-4 h-4 mr-2" />Restore from Backup</Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-red-500/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-red-400"><Trash2 className="w-5 h-5" />Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-4">Permanently delete all data from this application. This cannot be undone.</p>
          <Button onClick={handleClearData} variant="destructive" className="w-full bg-red-600/80 hover:bg-red-600"><Trash2 className="w-4 h-4 mr-2" />Clear All Data</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;