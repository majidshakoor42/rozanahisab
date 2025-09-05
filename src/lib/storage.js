// Database schema and localStorage management
export const STORAGE_KEYS = {
  CUSTOMERS: 'khata_customers',
  SALES: 'khata_sales',
  SALE_ITEMS: 'khata_sale_items',
  PAYMENTS: 'khata_payments', // To track all payments, including partial ones
  SETTINGS: 'khata_settings',
  INVENTORY: 'khata_inventory',
};

// Initialize default settings
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    const defaultSettings = {
      currency: 'PKR',
      businessName: 'My Business',
      taxRate: 0,
      created: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }

  [
    STORAGE_KEYS.CUSTOMERS, 
    STORAGE_KEYS.SALES, 
    STORAGE_KEYS.SALE_ITEMS,
    STORAGE_KEYS.PAYMENTS,
    STORAGE_KEYS.INVENTORY
  ].forEach(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
};

// Generic GETTER/SETTER
const getData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Customer operations
export const getCustomers = () => getData(STORAGE_KEYS.CUSTOMERS);
export const getCustomerById = (customerId) => getCustomers().find(c => c.customer_id === customerId);

export const saveCustomer = (customer) => {
  const customers = getCustomers();
  const newCustomer = {
    customer_id: Date.now().toString(),
    ...customer,
    created_date: new Date().toISOString()
  };
  customers.push(newCustomer);
  setData(STORAGE_KEYS.CUSTOMERS, customers);
  return newCustomer;
};

export const updateCustomer = (updatedCustomer) => {
  let customers = getCustomers();
  customers = customers.map(c => c.customer_id === updatedCustomer.customer_id ? updatedCustomer : c);
  setData(STORAGE_KEYS.CUSTOMERS, customers);
  return updatedCustomer;
};

export const searchCustomers = (query) => {
  if (!query) return getCustomers();
  const lowercasedQuery = query.toLowerCase();
  return getCustomers().filter(customer => 
    customer.name.toLowerCase().includes(lowercasedQuery) ||
    (customer.phone && customer.phone.includes(query))
  );
};

// Sales operations
export const getSales = () => getData(STORAGE_KEYS.SALES);
export const getSaleItems = () => getData(STORAGE_KEYS.SALE_ITEMS);
export const getPayments = () => getData(STORAGE_KEYS.PAYMENTS);

export const saveSale = (saleData, items, saleIdToUpdate = null) => {
  let sales = getSales();
  let saleItems = getSaleItems();
  let payments = getPayments();
  const now = new Date().toISOString();

  if (saleIdToUpdate) {
    const existingSale = sales.find(s => s.sale_id === saleIdToUpdate);
    if (!existingSale) return null;
    
    Object.assign(existingSale, {
        ...saleData,
        updated_date: now,
    });
    
    saleItems = saleItems.filter(item => item.sale_id !== saleIdToUpdate);
    payments = payments.filter(p => p.sale_id !== saleIdToUpdate);

  }
  
  const saleId = saleIdToUpdate || Date.now().toString();

  const newSale = saleIdToUpdate 
    ? sales.find(s => s.sale_id === saleId) 
    : {
        sale_id: saleId,
        ...saleData,
        date: now,
      };

  if (!saleIdToUpdate) {
    sales.push(newSale);
  } else {
    sales = sales.map(s => s.sale_id === saleId ? newSale : s);
  }

  const newItems = items.map(item => ({
    item_id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    sale_id: saleId,
    ...item,
    total_price: item.quantity * item.unit_price
  }));
  saleItems.push(...newItems);
  
  // Handle payment
  if (saleData.paid_amount > 0) {
      const newPayment = {
          payment_id: Date.now().toString(),
          sale_id: saleId,
          amount: saleData.paid_amount,
          date: now,
          method: 'cash' // default method
      };
      payments.push(newPayment);
  }

  setData(STORAGE_KEYS.SALES, sales);
  setData(STORAGE_KEYS.SALE_ITEMS, saleItems);
  setData(STORAGE_KEYS.PAYMENTS, payments);

  if (!saleIdToUpdate) {
    updateDailySummary(saleData.paid_amount || 0, saleData.currency);
  }
  
  return { sale: newSale, items: newItems };
};

export const addPaymentToSale = (saleId, amount) => {
  const sales = getSales();
  const sale = sales.find(s => s.sale_id === saleId);
  if (!sale) return;

  sale.paid_amount = (sale.paid_amount || 0) + amount;
  sale.due_amount = sale.total_amount - sale.paid_amount;

  if (sale.due_amount <= 0) {
    sale.payment_status = 'paid';
    sale.due_amount = 0;
  } else {
    sale.payment_status = 'partial';
  }
  
  const payments = getPayments();
  payments.push({
    payment_id: Date.now().toString(),
    sale_id: saleId,
    amount: amount,
    date: new Date().toISOString(),
    method: 'cash'
  });

  setData(STORAGE_KEYS.SALES, sales);
  setData(STORAGE_KEYS.PAYMENTS, payments);
  updateDailySummary(amount, sale.currency);

  return sale;
};


export const deleteSale = (saleId) => {
  let sales = getSales();
  let saleItems = getSaleItems();
  let payments = getPayments();
  
  sales = sales.filter(s => s.sale_id !== saleId);
  saleItems = saleItems.filter(item => item.sale_id !== saleId);
  payments = payments.filter(p => p.sale_id !== saleId);
  
  setData(STORAGE_KEYS.SALES, sales);
  setData(STORAGE_KEYS.SALE_ITEMS, saleItems);
  setData(STORAGE_KEYS.PAYMENTS, payments);
};

export const returnSale = (saleId) => {
    let sales = getSales();
    const sale = sales.find(s => s.sale_id === saleId);
    if(sale) {
        sale.payment_status = 'returned';
        sale.updated_date = new Date().toISOString();
        setData(STORAGE_KEYS.SALES, sales);

        // Reverse the daily summary transaction
        const payments = getPayments().filter(p => p.sale_id === saleId);
        const totalPaidOnSale = payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaidOnSale > 0) {
          updateDailySummary(-totalPaidOnSale, sale.currency);
        }
    }
}


export const getSaleWithDetails = (saleId) => {
  const sale = getSales().find(s => s.sale_id === saleId);
  if (!sale) return null;
  const items = getSaleItems().filter(item => item.sale_id === saleId);
  const payments = getPayments().filter(p => p.sale_id === saleId);
  return { sale, items, payments };
};

// Daily summary operations
export const updateDailySummary = (amount, currency) => {
  const today = new Date().toISOString().split('T')[0];
  let dailyData = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARY) || '{}');

  if (!dailyData[today]) {
    dailyData[today] = { total_sales: 0, currency: currency || 'PKR', number_of_transactions: 0 };
  }

  dailyData[today].total_sales += amount;
  if(amount > 0) { // Only count sales, not reversals
      dailyData[today].number_of_transactions += 1;
  }
  
  localStorage.setItem(STORAGE_KEYS.DAILY_SUMMARY, JSON.stringify(dailyData));
};

export const getDailySummaries = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARY) || '{}');

export const getTodaysSummary = () => {
  const summaries = getDailySummaries();
  const today = new Date().toISOString().split('T')[0];
  const settings = getSettings();
  return summaries[today] || {
    total_sales: 0,
    currency: settings.currency || 'PKR',
    number_of_transactions: 0
  };
};


// Settings operations
export const getSettings = () => {
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return settings ? JSON.parse(settings) : { currency: 'PKR', businessName: 'My Business', taxRate: 0 };
};

export const updateSettings = (newSettings) => {
  const currentSettings = getSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
  return updatedSettings;
};

// Data management
export const exportDataToJSON = () => {
  const data = {};
  Object.values(STORAGE_KEYS).forEach(key => {
    data[key] = localStorage.getItem(key);
  });
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = `khata_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};

export const importDataFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        Object.keys(data).forEach(key => {
          if (Object.values(STORAGE_KEYS).includes(key) && data[key]) {
            localStorage.setItem(key, data[key]);
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

initializeStorage();