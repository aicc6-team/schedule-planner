import 'dotenv/config';
export declare const db: FirebaseFirestore.Firestore;
export declare const getFirebaseAuth: () => import("firebase-admin/auth").Auth;
export declare const getCollection: (collectionName: string) => FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
export declare const getDocument: (collectionName: string, docId: string) => FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
export declare const getBatch: () => FirebaseFirestore.WriteBatch;
export declare const getTransaction: () => <T>(updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<T>, transactionOptions?: FirebaseFirestore.ReadWriteTransactionOptions | FirebaseFirestore.ReadOnlyTransactionOptions) => Promise<T>;
//# sourceMappingURL=firebase.d.ts.map