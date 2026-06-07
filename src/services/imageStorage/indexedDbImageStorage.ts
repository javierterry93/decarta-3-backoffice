export type ImageBlobVariant = 'full' | 'thumb';

const DB_NAME = 'decarta-images';
const DB_VERSION = 1;
const STORE = 'blobs';

function blobKey(imageId: string, variant: ImageBlobVariant): string {
	return `${imageId}:${variant}`;
}

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('IndexedDB error'));
	});
}

async function withStore<T>(
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, mode);
		const request = run(tx.objectStore(STORE));
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('IndexedDB error'));
		tx.oncomplete = () => db.close();
		tx.onerror = () =>
			reject(tx.error ?? new Error('IndexedDB transaction error'));
	});
}

export async function storeImageBlobs(
	imageId: string,
	full: Blob,
	thumb: Blob,
): Promise<void> {
	const db = await openDb();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE, 'readwrite');
		const store = tx.objectStore(STORE);
		store.put(full, blobKey(imageId, 'full'));
		store.put(thumb, blobKey(imageId, 'thumb'));
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () =>
			reject(tx.error ?? new Error('IndexedDB transaction error'));
	});
}

export async function getImageBlob(
	imageId: string,
	variant: ImageBlobVariant,
): Promise<Blob | null> {
	try {
		return await withStore('readonly', (store) =>
			store.get(blobKey(imageId, variant)),
		);
	} catch {
		return null;
	}
}

export async function deleteImageBlobs(imageId: string): Promise<void> {
	const db = await openDb();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE, 'readwrite');
		const store = tx.objectStore(STORE);
		store.delete(blobKey(imageId, 'full'));
		store.delete(blobKey(imageId, 'thumb'));
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () =>
			reject(tx.error ?? new Error('IndexedDB transaction error'));
	});
}

export async function clearAllImageBlobs(): Promise<void> {
	const db = await openDb();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE, 'readwrite');
		tx.objectStore(STORE).clear();
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () =>
			reject(tx.error ?? new Error('IndexedDB transaction error'));
	});
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
	const response = await fetch(dataUrl);
	return response.blob();
}

export async function storeImageFromDataUrls(
	imageId: string,
	url: string,
	thumbnailUrl: string,
): Promise<void> {
	const [full, thumb] = await Promise.all([
		dataUrlToBlob(url),
		dataUrlToBlob(thumbnailUrl),
	]);
	await storeImageBlobs(imageId, full, thumb);
}
