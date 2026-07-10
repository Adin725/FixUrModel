export const IDB_DB_NAME = "CV_DSP_IMAGES_DB";
export const IDB_STORE_NAME = "image_previews";
export const IDB_VERSION = 1;

function openImagesDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const request = indexedDB.open(IDB_DB_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveImageMapToIndexedDB(
  imageMap: Record<number, string>
): Promise<void> {
  if (typeof window === "undefined" || Object.keys(imageMap).length === 0) {
    return;
  }
  try {
    const db = await openImagesDB();
    const tx = db.transaction(IDB_STORE_NAME, "readwrite");
    const store = tx.objectStore(IDB_STORE_NAME);

    for (const [idStr, base64] of Object.entries(imageMap)) {
      const id = Number(idStr);
      if (!isNaN(id) && base64) {
        store.put(base64, id);
      }
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Failed to save images to IndexedDB:", err);
  }
}

export async function loadImageMapFromIndexedDB(): Promise<
  Record<number, string>
> {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const db = await openImagesDB();
    const tx = db.transaction(IDB_STORE_NAME, "readonly");
    const store = tx.objectStore(IDB_STORE_NAME);

    return new Promise((resolve, reject) => {
      const result: Record<number, string> = {};
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const key = Number(cursor.key);
          const val = cursor.value;
          if (!isNaN(key) && typeof val === "string") {
            result[key] = val;
          }
          cursor.continue();
        } else {
          resolve(result);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to load image map from IndexedDB:", err);
    return {};
  }
}

export async function clearImageMapIndexedDB(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openImagesDB();
    const tx = db.transaction(IDB_STORE_NAME, "readwrite");
    const store = tx.objectStore(IDB_STORE_NAME);
    store.clear();
  } catch (err) {
    console.error("Failed to clear images in IndexedDB:", err);
  }
}
