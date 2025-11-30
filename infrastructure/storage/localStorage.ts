/**
 * LocalStorage Fallback Wrapper
 * Provides same interface as IndexedDB for browsers without IndexedDB support
 * Follows Liskov Substitution Principle - can be used interchangeably with IndexedDB
 */

const STORAGE_PREFIX = 'fitness-tracker:';

export const STORES = {
  EXERCISES: 'exercises',
  FOODS: 'foods',
  SETTINGS: 'settings',
} as const;

interface StorageData {
  [key: string]: unknown;
}

/**
 * Get storage key for a store
 */
function getStoreKey(storeName: string): string {
  return `${STORAGE_PREFIX}${storeName}`;
}

/**
 * Get all items from a store
 */
function getStoreData(storeName: string): StorageData {
  if (typeof window === 'undefined') return {};

  const key = getStoreKey(storeName);
  const data = localStorage.getItem(key);

  if (!data) return {};

  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Save all items to a store
 */
function setStoreData(storeName: string, data: StorageData): void {
  if (typeof window === 'undefined') return;

  const key = getStoreKey(storeName);
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Generic get by ID operation
 */
export async function getById<T>(
  storeName: string,
  id: string
): Promise<T | null> {
  const data = getStoreData(storeName);
  return (data[id] as T) || null;
}

/**
 * Generic get all operation
 */
export async function getAll<T>(storeName: string): Promise<T[]> {
  const data = getStoreData(storeName);
  return Object.values(data) as T[];
}

/**
 * Generic add operation
 */
export async function add<T extends { id: string }>(
  storeName: string,
  item: T
): Promise<T> {
  const data = getStoreData(storeName);

  if (data[item.id]) {
    throw new Error(`Item with id ${item.id} already exists`);
  }

  data[item.id] = item;
  setStoreData(storeName, data);

  return item;
}

/**
 * Generic update operation
 */
export async function update<T extends { id: string }>(
  storeName: string,
  item: T
): Promise<T> {
  const data = getStoreData(storeName);
  data[item.id] = item;
  setStoreData(storeName, data);

  return item;
}

/**
 * Generic delete operation
 */
export async function deleteById(
  storeName: string,
  id: string
): Promise<void> {
  const data = getStoreData(storeName);
  delete data[id];
  setStoreData(storeName, data);
}

/**
 * Get items by index (simulated - less efficient than IndexedDB)
 */
export async function getByIndex<T>(
  storeName: string,
  indexName: string,
  value: unknown
): Promise<T[]> {
  const items = await getAll<any>(storeName);
  return items.filter((item) => item[indexName] === value);
}

/**
 * Get items by index range (simulated - less efficient than IndexedDB)
 */
export async function getByIndexRange<T>(
  storeName: string,
  indexName: string,
  lowerBound: unknown,
  upperBound: unknown
): Promise<T[]> {
  const items = await getAll<any>(storeName);
  const lower = lowerBound as any;
  const upper = upperBound as any;
  return items.filter(
    (item) => item[indexName] >= lower && item[indexName] <= upper
  );
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  const key = getStoreKey(storeName);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * No-op function for compatibility (IndexedDB needs opening, localStorage doesn't)
 */
export async function openDatabase(): Promise<void> {
  // No-op for localStorage
  return Promise.resolve();
}
