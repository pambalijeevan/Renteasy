interface TourAssetRecord {
  id: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
  createdAt: string;
}

const DB_NAME = 'rentEasy_media';
const DB_VERSION = 1;
const STORE_NAME = 'tour_assets';

const ensureIndexedDb = () => {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    throw new Error('IndexedDB is not available in this browser.');
  }
};

const openDb = (): Promise<IDBDatabase> => {
  ensureIndexedDb();
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB.'));
  });
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `tour-${crypto.randomUUID()}`;
  }
  return `tour-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const saveTourAsset = async (file: File): Promise<{ id: string; fileName: string; mimeType: string }> => {
  const db = await openDb();
  const id = generateId();
  const mimeType = file.type || 'application/octet-stream';

  const record: TourAssetRecord = {
    id,
    fileName: file.name,
    mimeType,
    blob: file,
    createdAt: new Date().toISOString(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to store 3D file.'));
    tx.onabort = () => reject(tx.error ?? new Error('3D file storage was aborted.'));
  });

  db.close();
  return { id, fileName: record.fileName, mimeType: record.mimeType };
};

export const getTourAssetBlob = async (id: string): Promise<Blob | null> => {
  const db = await openDb();
  const record = await new Promise<TourAssetRecord | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result as TourAssetRecord | undefined);
    req.onerror = () => reject(req.error ?? new Error('Failed to read 3D file.'));
  });
  db.close();
  return record?.blob ?? null;
};

