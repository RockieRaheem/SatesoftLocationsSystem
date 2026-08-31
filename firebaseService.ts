import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { ProductDefinition, StockItem, RegionalEconomicLevel, User } from './types';

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

export type OperationType = typeof OperationType[keyof typeof OperationType];

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Products
export const subscribeToProducts = (callback: (products: ProductDefinition[]) => void) => {
  const path = 'products';
  return onSnapshot(collection(db, path), (snapshot) => {
    const products = snapshot.docs.map(doc => doc.data() as ProductDefinition);
    callback(products);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const saveProduct = async (product: ProductDefinition) => {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id.toString()), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// Stock Items
export const subscribeToStockItems = (callback: (items: StockItem[]) => void) => {
  const path = 'stock';
  return onSnapshot(collection(db, path), (snapshot) => {
    const items = snapshot.docs.map(doc => doc.data() as StockItem);
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const saveStockItem = async (item: StockItem) => {
  const path = `stock/${item.id}`;
  try {
    await setDoc(doc(db, 'stock', item.id.toString()), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateStockItem = async (id: number, updates: Partial<StockItem>) => {
  const path = `stock/${id}`;
  try {
    await updateDoc(doc(db, 'stock', id.toString()), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Regional Economic Levels
export const subscribeToRegionalLevels = (callback: (levels: RegionalEconomicLevel[]) => void) => {
  const path = 'regionalEconomicLevels';
  return onSnapshot(collection(db, path), (snapshot) => {
    const levels = snapshot.docs.map(doc => doc.data() as RegionalEconomicLevel);
    callback(levels);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const saveRegionalLevel = async (level: RegionalEconomicLevel) => {
  const path = `regionalEconomicLevels/${level.id}`;
  try {
    await setDoc(doc(db, 'regionalEconomicLevels', level.id.toString()), level);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteRegionalLevel = async (id: number, remarks?: string) => {
  const path = `regionalEconomicLevels/${id}`;
  try {
    await deleteDoc(doc(db, 'regionalEconomicLevels', id.toString()));
    if (remarks) {
      console.log(`Region ${id} deleted with remarks: ${remarks}`);
      // In a real app, you might want to save this to a 'deletionLogs' collection
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// User Profiles
export const saveUserProfile = async (user: Partial<User> & { uid: string, email: string }) => {
  const path = `users/${user.uid}`;
  try {
    await setDoc(doc(db, 'users', user.uid), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
