const DB_NAME = 'DairyAppDB';
const DB_VERSION = 4;
const CUSTOMER_STORE = 'customers';

// Helper to detect account number field name
const getAccountNumberField = (customer) => {
    if (!customer) return null;
    // Try various possible field names
    const possibleFields = [
        'customer_account_number',
        'account_no',
        'accountNo',
        'account_number',
        'accountNumber',
        'ac_no',
        'account',
        'id'
    ];
    
    for (const field of possibleFields) {
        if (customer[field]) {
            return { field, value: customer[field] };
        }
    }
    
    return null;
};

export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Delete old store if it exists
            if (db.objectStoreNames.contains(CUSTOMER_STORE)) {
                db.deleteObjectStore(CUSTOMER_STORE);
            }
            
            // Create new object store with auto-increment key
            const objectStore = db.createObjectStore(CUSTOMER_STORE, { keyPath: 'dbKey', autoIncrement: true });
            
            // Create multiple indexes for account numbers (different possible field names)
            try {
                objectStore.createIndex('customer_account_number', 'customer_account_number', { unique: false });
            } catch (e) { console.log("Index customer_account_number:", e.message); }
            
            try {
                objectStore.createIndex('account_no', 'account_no', { unique: false });
            } catch (e) { console.log("Index account_no:", e.message); }
            
            try {
                objectStore.createIndex('accountNumber', 'accountNumber', { unique: false });
            } catch (e) { console.log("Index accountNumber:", e.message); }
            
            try {
                objectStore.createIndex('account_number', 'account_number', { unique: false });
            } catch (e) { console.log("Index account_number:", e.message); }
            
            console.log("IndexedDB upgraded/created successfully");
        };
    });
};

export const saveCustomersToDB = async (customers) => {
    try {
        console.log("🔵 saveCustomersToDB: Starting to save", customers.length, "customers");
        
        if (!Array.isArray(customers) || customers.length === 0) {
            console.log("⚠️ No customers to save");
            return;
        }

        // Log first customer to understand structure
        const firstCustomer = customers[0];
        console.log("📋 First customer from API:", JSON.stringify(firstCustomer, null, 2));
        
        const accountField = getAccountNumberField(firstCustomer);
        console.log("📋 Detected account number field:", accountField);

        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readwrite');
        const store = transaction.objectStore(CUSTOMER_STORE);

        return new Promise((resolve, reject) => {
            let savedCount = 0;

            // Clear old data first
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                console.log("🗑️ Store cleared, now adding customers...");

                // Add each customer
                customers.forEach((customer, index) => {
                    if (!customer) {
                        console.warn("⚠️ Customer at index", index, "is null/undefined");
                        return;
                    }

                    // Normalize customer - add standardized account number fields
                    const accountInfo = getAccountNumberField(customer);
                    const normalizedCustomer = {
                        ...customer,
                        // Add all possible account number field names for index compatibility
                        customer_account_number: accountInfo?.value,
                        account_no: accountInfo?.value,
                        accountNumber: accountInfo?.value,
                        account_number: accountInfo?.value
                    };

                    // Store normalized customer
                    const addRequest = store.add(normalizedCustomer);

                    addRequest.onsuccess = () => {
                        savedCount++;
                        console.log(`✅ Saved customer ${savedCount}: Account=${accountInfo?.value || 'N/A'} (field: ${accountInfo?.field})`);
                    };

                    addRequest.onerror = (e) => {
                        console.error(`❌ Error saving customer at index ${index}:`, e.target.error);
                    };
                });
            };

            clearRequest.onerror = () => {
                console.error("❌ Error clearing store:", clearRequest.error);
                reject(clearRequest.error);
            };

            // Wait for transaction to complete
            transaction.oncomplete = () => {
                console.log(`✅ Transaction complete. Saved: ${savedCount}/${customers.length} customers`);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("❌ Transaction error:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("❌ Error saving customers to DB:", error);
        throw error;
    }
};

export const getCustomerFromDB = async (accountNumber) => {
    try {
        console.log("🔵 getCustomerFromDB: Looking for account:", accountNumber, "Type:", typeof accountNumber);

        if (!accountNumber) {
            console.warn("⚠️ No account number provided");
            return null;
        }

        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readonly');
        const store = transaction.objectStore(CUSTOMER_STORE);

        return new Promise((resolve, reject) => {
            const stringKey = String(accountNumber).trim();
            const numberKey = Number(accountNumber);

            // Try each possible index
            const possibleIndexes = [
                'customer_account_number',
                'account_no',
                'accountNumber',
                'account_number'
            ];

            let attemptedIndexes = 0;

            const tryNextIndex = (indexList, listIndex = 0) => {
                if (listIndex >= indexList.length) {
                    // All indexes tried, do full scan
                    console.log("⚠️ All indexes failed, scanning all records...");
                    const allRequest = store.getAll();
                    
                    allRequest.onsuccess = (scanEvent) => {
                        const allCustomers = scanEvent.target.result;
                        console.log(`📊 Total customers in DB: ${allCustomers.length}`);
                        
                        const foundCustomer = allCustomers.find(cust => {
                            const custAccount = String(cust.customer_account_number || cust.account_no || cust.accountNumber || cust.account_number || '').trim();
                            return custAccount === stringKey || custAccount === String(numberKey);
                        });

                        if (foundCustomer) {
                            console.log("✅ Found customer by scanning all records:", foundCustomer);
                            resolve(foundCustomer);
                        } else {
                            console.log("❌ Customer not found in DB");
                            resolve(null);
                        }
                    };

                    allRequest.onerror = () => {
                        console.error("❌ Error scanning all records");
                        resolve(null);
                    };
                    return;
                }

                const indexName = indexList[listIndex];
                console.log(`🔍 Trying index: ${indexName}`);

                try {
                    const index = store.index(indexName);
                    
                    // Try string first
                    const request = index.get(stringKey);
                    
                    request.onsuccess = (event) => {
                        const result = event.target.result;
                        if (result) {
                            console.log(`✅ Found customer using ${indexName} (string):`, result);
                            resolve(result);
                        } else {
                            // Try number
                            const numRequest = index.get(numberKey);
                            numRequest.onsuccess = (e) => {
                                const numResult = e.target.result;
                                if (numResult) {
                                    console.log(`✅ Found customer using ${indexName} (number):`, numResult);
                                    resolve(numResult);
                                } else {
                                    console.log(`⚠️ ${indexName} lookup failed, trying next...`);
                                    tryNextIndex(indexList, listIndex + 1);
                                }
                            };
                            numRequest.onerror = () => {
                                console.log(`⚠️ ${indexName} number lookup error, trying next...`);
                                tryNextIndex(indexList, listIndex + 1);
                            };
                        }
                    };

                    request.onerror = () => {
                        console.log(`⚠️ ${indexName} lookup error, trying next...`);
                        tryNextIndex(indexList, listIndex + 1);
                    };
                } catch (e) {
                    console.log(`⚠️ ${indexName} not available, trying next...`);
                    tryNextIndex(indexList, listIndex + 1);
                }
            };

            tryNextIndex(possibleIndexes);
        });
    } catch (error) {
        console.error("❌ Error getting customer from DB:", error);
        return null;
    }
};

// Check if DB has any customers
export const hasCustomersInDB = async () => {
    try {
        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readonly');
        const store = transaction.objectStore(CUSTOMER_STORE);

        return new Promise((resolve) => {
            const request = store.count();

            request.onsuccess = (event) => {
                const count = event.target.result;
                console.log(`📊 DB has ${count} customers`);
                resolve(count > 0);
            };

            request.onerror = () => {
                console.error("❌ Error counting customers");
                resolve(false);
            };
        });
    } catch (error) {
        console.error("❌ Error checking DB:", error);
        return false;
    }
};

// Debug function to see all customers in DB
export const getAllCustomersFromDB = async () => {
    try {
        console.log("🔵 getAllCustomersFromDB: Fetching all customers...");
        
        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readonly');
        const store = transaction.objectStore(CUSTOMER_STORE);

        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = (event) => {
                const customers = event.target.result;
                console.log(`📊 Total customers in DB: ${customers.length}`);
                
                if (customers.length > 0) {
                    console.log("📋 First customer:", JSON.stringify(customers[0], null, 2));
                    console.log("📋 Account numbers in DB:", customers.map(c => c.customer_account_number || c.account_no || 'N/A'));
                } else {
                    console.log("⚠️ Database is empty!");
                }
                
                resolve(customers);
            };

            request.onerror = (event) => {
                console.error("❌ Error getting all customers:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("❌ Error getting all customers from DB:", error);
        return [];
    }
};

// Clear all data from DB
export const clearAllCustomersFromDB = async () => {
    try {
        console.log("🔵 clearAllCustomersFromDB: Clearing database...");
        
        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readwrite');
        const store = transaction.objectStore(CUSTOMER_STORE);
        const request = store.clear();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log("✅ Database cleared successfully");
                resolve();
            };

            request.onerror = (e) => {
                console.error("❌ Error clearing database:", e.target.error);
                reject(e.target.error);
            };
        });
    } catch (error) {
        console.error("❌ Error clearing database:", error);
    }
};
