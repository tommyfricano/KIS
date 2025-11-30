/**
 * IndexedDB Database Wrapper
 * Provides low-level database operations with proper error handling
 * Follows Single Responsibility Principle - only handles database connection and schema
 */

const DB_NAME = 'FitnessTrackerDB';
const DB_VERSION = 1;

export const STORES = {
  EXERCISES: 'exercises',
  FOODS: 'foods',
  SETTINGS: 'settings',
} as const;

/**
 * Database schema definition
 */
interface DatabaseSchema {
  exercises: {
    keyPath: 'id';
    indexes: {
      name: { keyPath: 'name'; unique: false };
      date: { keyPath: 'date'; unique: false };
    };
  };
  foods: {
    keyPath: 'id';
    indexes: {
      date: { keyPath: 'date'; unique: false };
      mealType: { keyPath: 'mealType'; unique: false };
      name: { keyPath: 'name'; unique: false };
    };
  };
  settings: {
    keyPath: 'id';
    indexes: {};
  };
}

/**
 * Open or create the IndexedDB database
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create exercises store
      if (!db.objectStoreNames.contains(STORES.EXERCISES)) {
        const exerciseStore = db.createObjectStore(STORES.EXERCISES, {
          keyPath: 'id',
        });
        exerciseStore.createIndex('name', 'name', { unique: false });
        exerciseStore.createIndex('date', 'date', { unique: false });
      }

      // Create foods store
      if (!db.objectStoreNames.contains(STORES.FOODS)) {
        const foodStore = db.createObjectStore(STORES.FOODS, {
          keyPath: 'id',
        });
        foodStore.createIndex('date', 'date', { unique: false });
        foodStore.createIndex('mealType', 'mealType', { unique: false });
        foodStore.createIndex('name', 'name', { unique: false });
      }

      // Create settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, {
          keyPath: 'id',
        });
      }
    };
  });
}

/**
 * Generic get operation
 */
export async function getById<T>(
  storeName: string,
  id: string
): Promise<T | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get item from ${storeName}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Generic get all operation
 */
export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get all items from ${storeName}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Generic add operation
 */
export async function add<T>(storeName: string, item: T): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => {
      resolve(item);
    };

    request.onerror = () => {
      reject(new Error(`Failed to add item to ${storeName}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Generic update operation
 */
export async function update<T>(storeName: string, item: T): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => {
      resolve(item);
    };

    request.onerror = () => {
      reject(new Error(`Failed to update item in ${storeName}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Generic delete operation
 */
export async function deleteById(
  storeName: string,
  id: string
): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete item from ${storeName}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get items by index
 */
export async function getByIndex<T>(
  storeName: string,
  indexName: string,
  value: unknown
): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value as IDBValidKey);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get items by index from ${storeName}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get items by index range
 */
export async function getByIndexRange<T>(
  storeName: string,
  indexName: string,
  lowerBound: unknown,
  upperBound: unknown
): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const range = IDBKeyRange.bound(lowerBound as IDBValidKey, upperBound as IDBValidKey);
    const request = index.getAll(range);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get items by index range from ${storeName}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to clear ${storeName}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'indexedDB' in window;
}
