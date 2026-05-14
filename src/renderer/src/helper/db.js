const DB_NAME = 'DairyAppDB';
const DB_VERSION = 5; // Bumped version to reset indexes
const CUSTOMER_STORE = 'customers';

// Helper to standardize account number field
const getAccountNumber = (customer) => {
    if (!customer) return null;
    const possibleFields = [
        'account_no',
        'customer_account_number',
        'accountNumber',
        'account_number',
        'ac_no',
        'id'
    ];
    
    for (const field of possibleFields) {
        if (customer[field] !== undefined && customer[field] !== null) {
            return String(customer[field]).trim();
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
            
            // Delete old store to clean up multiple indexes
            if (db.objectStoreNames.contains(CUSTOMER_STORE)) {
                db.deleteObjectStore(CUSTOMER_STORE);
            }
            
            // Create new object store with a single standard index
            const objectStore = db.createObjectStore(CUSTOMER_STORE, { keyPath: 'dbKey', autoIncrement: true });
            objectStore.createIndex('account_no', 'account_no', { unique: false });
            
        };
    });
};

export const saveCustomersToDB = async (customers) => {
    try {
        console.log("🔵 saveCustomersToDB: Saving", customers.length, "customers");
        
        if (!Array.isArray(customers) || customers.length === 0) return;

        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readwrite');
        const store = transaction.objectStore(CUSTOMER_STORE);

        return new Promise((resolve, reject) => {
            let savedCount = 0;
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                customers.forEach((customer) => {
                    if (!customer) return;

                    const accNo = getAccountNumber(customer);
                    const normalizedCustomer = {
                        ...customer,
                        account_no: accNo // Standardized field
                    };

                    const addRequest = store.add(normalizedCustomer);
                    addRequest.onsuccess = () => savedCount++;
                });
            };

            transaction.oncomplete = () => {
                console.log(`✅ Saved: ${savedCount} customers with standardized index`);
                resolve();
            };
            transaction.onerror = (e) => reject(e.target.error);
        });
    } catch (error) {
        console.error("❌ Error saving customers:", error);
        throw error;
    }
};

export const getCustomerFromDB = async (accountNumber) => {
    try {
        if (!accountNumber) return null;

        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readonly');
        const store = transaction.objectStore(CUSTOMER_STORE);
        const index = store.index('account_no');

        return new Promise((resolve) => {
            const key = String(accountNumber).trim();
            const request = index.get(key);
            
            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    console.log("✅ Found customer by account_no:", key);
                    resolve(result);
                } else {
                    // One last attempt: maybe it's stored as a number?
                    const numRequest = index.get(Number(key));
                    numRequest.onsuccess = (e) => resolve(e.target.result || null);
                    numRequest.onerror = () => resolve(null);
                }
            };
            request.onerror = () => resolve(null);
        });
    } catch (error) {
        console.error("❌ Error getting customer:", error);
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
       
        
        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readonly');
        const store = transaction.objectStore(CUSTOMER_STORE);

        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = (event) => {
                const customers = event.target.result;
              
                
                if (customers.length > 0) {
                   
                } else {
                   
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
       
        
        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readwrite');
        const store = transaction.objectStore(CUSTOMER_STORE);
        const request = store.clear();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
               
                resolve();
            };

            request.onerror = (e) => {
               
                reject(e.target.error);
            };
        });
    } catch (error) {
        console.error("❌ Error clearing database:", error);
    }
};
