
import { openDB } from 'idb';

const dbPromise = openDB('crypto-keys', 1, {
  upgrade(db) {
    db.createObjectStore('privateKeys');
  },
});

export const storePrivateKey = async (userId, privateKey) => {
  const db = await dbPromise;
  await db.put('privateKeys', privateKey, userId);
};

export const getPrivateKey = async (userId) => {
  const db = await dbPromise;
  return await db.get('privateKeys', userId);
};

export const deletePrivateKey = async (userId) => {
  const db = await dbPromise;
  await db.delete('privateKeys', userId);
};
