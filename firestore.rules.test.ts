
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, updateDoc, type Firestore } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

const firestoreFor = (uid: string, token: Record<string, unknown>): Firestore =>
  testEnv.authenticatedContext(uid, token).firestore() as unknown as Firestore;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {
  const aliceId = 'alice';
  const bobId = 'bob';
  const adminId = 'admin_user';
  const adminEmail = 'jabuyapm@gmail.com';

  const aliceAuth = { uid: aliceId, token: { email: 'alice@example.com', email_verified: true } };
  const bobAuth = { uid: bobId, token: { email: 'bob@example.com', email_verified: true } };
  const adminAuth = { uid: adminId, token: { email: adminEmail, email_verified: true } };

  describe('User Profiles', () => {
    it('allows Alice to create her own profile', async () => {
      const aliceDb = firestoreFor(aliceId, aliceAuth.token);
      await assertSucceeds(setDoc(doc(aliceDb, 'users', aliceId), {
        uid: aliceId,
        email: 'alice@example.com'
      }));
    });

    it('denies Alice from creating Bob profile', async () => {
      const aliceDb = firestoreFor(aliceId, aliceAuth.token);
      await assertFails(setDoc(doc(aliceDb, 'users', bobId), {
        uid: bobId,
        email: 'bob@example.com'
      }));
    });

    it('denies Alice from assigning herself the admin role on create', async () => {
      const aliceDb = firestoreFor(aliceId, aliceAuth.token);
      await assertFails(setDoc(doc(aliceDb, 'users', aliceId), {
        uid: aliceId,
        email: 'alice@example.com',
        role: 'admin'
      }));
    });

    it('denies Alice from becoming admin via update', async () => {
      const adminDb = firestoreFor(adminId, adminAuth.token);
      await setDoc(doc(adminDb, 'users', aliceId), {
        uid: aliceId,
        email: 'alice@example.com',
        role: 'user'
      });

      const aliceDb = firestoreFor(aliceId, aliceAuth.token);
      await assertFails(updateDoc(doc(aliceDb, 'users', aliceId), {
        role: 'admin'
      }));
    });
  });

  describe('Shops', () => {
    it('denies regular user from creating shop', async () => {
      const aliceDb = firestoreFor(aliceId, aliceAuth.token);
      await assertFails(setDoc(doc(aliceDb, 'shops', '1'), {
        id: 1,
        name: 'Alice Shop',
        ownerId: 123
      }));
    });

    it('allows admin to create shop', async () => {
      const adminDb = firestoreFor(adminId, adminAuth.token);
      // Need to seed admin user doc for isAdmin() helper
      await setDoc(doc(adminDb, 'users', adminId), { uid: adminId, email: adminEmail, role: 'admin' });
      
      await assertSucceeds(setDoc(doc(adminDb, 'shops', '1'), {
        id: 1,
        name: 'Store 1',
        ownerId: 1
      }));
    });
  });

  describe('Products', () => {
    it('allows admin to create product', async () => {
      const adminDb = firestoreFor(adminId, adminAuth.token);
      await setDoc(doc(adminDb, 'users', adminId), { uid: adminId, email: adminEmail, role: 'admin' });

      await assertSucceeds(setDoc(doc(adminDb, 'products', 'p1'), {
        id: 1,
        sn: 'SN1',
        name: 'Product 1',
        status: 'ACTIVE'
      }));
    });

    it('denies admin from injecting ghost fields in product', async () => {
      const adminDb = firestoreFor(adminId, adminAuth.token);
      await setDoc(doc(adminDb, 'users', adminId), { uid: adminId, email: adminEmail, role: 'admin' });

      await assertFails(setDoc(doc(adminDb, 'products', 'p1'), {
        id: 1,
        sn: 'SN1',
        name: 'Product 1',
        status: 'ACTIVE',
        isLegacy: true // Ghost field not in isValidProduct
      }));
    });
  });
});
