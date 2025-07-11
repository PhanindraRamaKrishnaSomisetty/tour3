const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
  }
  return getFirestore();
};

// Database collections
const COLLECTIONS = {
  DESTINATIONS: 'destinations',
  BOOKINGS: 'bookings',
  USERS: 'users',
  REVIEWS: 'reviews',
  HOSTS: 'hosts',
  TRANSACTIONS: 'transactions'
};

// Optimized query helpers
const dbHelpers = {
  // Get document with caching
  async getDoc(collection, id) {
    const db = initializeFirebase();
    const doc = await db.collection(collection).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  // Batch operations for efficiency
  async batchWrite(operations) {
    const db = initializeFirebase();
    const batch = db.batch();
    
    operations.forEach(({ type, ref, data }) => {
      if (type === 'set') batch.set(ref, data);
      if (type === 'update') batch.update(ref, data);
      if (type === 'delete') batch.delete(ref);
    });
    
    return await batch.commit();
  },

  // Paginated queries
  async getPaginated(collection, filters = {}, limit = 10, startAfter = null) {
    const db = initializeFirebase();
    let query = db.collection(collection);
    
    Object.entries(filters).forEach(([field, value]) => {
      query = query.where(field, '==', value);
    });
    
    query = query.limit(limit);
    if (startAfter) query = query.startAfter(startAfter);
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

module.exports = {
  initializeFirebase,
  COLLECTIONS,
  dbHelpers,
  admin
};