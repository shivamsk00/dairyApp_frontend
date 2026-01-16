const DB_NAME = 'DairyAppDB';
const DB_VERSION = 1;
const CUSTOMER_STORE = 'customers';

export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(CUSTOMER_STORE)) {
                // Create object store with 'id' as keyPath
                const objectStore = db.createObjectStore(CUSTOMER_STORE, { keyPath: 'id' });
                // Create index for searching by account number
                // Note: customer_account_number might be string or number in API, let's assume loose matching 
                // but IDB is strict types. We'll store as is, and search carefully.
                objectStore.createIndex('customer_account_number', 'customer_account_number', { unique: false });
            }
        };
    });
};

export const saveCustomersToDB = async (customers) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readwrite');
        const store = transaction.objectStore(CUSTOMER_STORE);

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Transaction error:", event.target.error);
                reject(event.target.error);
            };

            // We can choose to clear and rewrite, or upsert. 
            // Clearing ensures deleted customers are removed.
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => {
                customers.forEach(customer => {
                    // Ensure customer has id. If not, this will fail. API usually provides id.
                    if(customer.id) {
                        store.put(customer);
                    }
                });
            };
        });
    } catch (error) {
        console.error("Error saving customers to DB:", error);
    }
};

export const getCustomerFromDB = async (accountNumber) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([CUSTOMER_STORE], 'readonly');
        const store = transaction.objectStore(CUSTOMER_STORE);
        const index = store.index('customer_account_number');

        return new Promise((resolve, reject) => {
            // Try matching as string first (common in inputs)
            const request = index.get(String(accountNumber));

            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    resolve(result);
                } else {
                    // Fallback: try as number if input was string but stored as number
                    const numRequest = index.get(Number(accountNumber));
                    numRequest.onsuccess = (e) => resolve(e.target.result);
                    numRequest.onerror = () => resolve(null);
                }
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error getting customer from DB:", error);
        return null;
    }
};
