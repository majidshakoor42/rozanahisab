import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, User, Package, Folder, Command as CommandIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { searchCustomers, getSales } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';


const Header = () => {
  const [open, setOpen] = useState(false)
  const [customerResults, setCustomerResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = (query) => {
    if (query.length > 1) {
      const customers = searchCustomers(query);
      setCustomerResults(customers);
    } else {
      setCustomerResults([]);
    }
  }

  const handleSelect = (path) => {
    setOpen(false);
    navigate(path);
  }

  const handleNotificationClick = () => {
    toast({
        title: "Coming Soon!",
        description: "🚧 Notifications are not yet implemented. Stay tuned!",
    });
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-effect sticky top-0 z-30 border-b border-border p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search customers...</span>
              <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <Button variant="ghost" size="icon" onClick={handleNotificationClick}>
              <Bell className="w-5 h-5 text-gray-300" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-500 to-green-600 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">A</span>
            </div>
          </div>
        </div>
      </motion.header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search by name or phone..."
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {customerResults.length > 0 && (
            <CommandGroup heading="Customers">
              {customerResults.slice(0, 5).map(customer => (
                <CommandItem key={customer.customer_id} onSelect={() => handleSelect(`/customer/${customer.customer_id}`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{customer.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{customer.phone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandSeparator />
          <CommandGroup heading="Quick Links">
             <CommandItem onSelect={() => handleSelect('/add-sale')}>
              <Package className="mr-2 h-4 w-4" />
              <span>Add New Sale</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/customers')}>
              <Folder className="mr-2 h-4 w-4" />
              <span>All Customers</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/reports')}>
              <Folder className="mr-2 h-4 w-4" />
              <span>View Reports</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default Header;