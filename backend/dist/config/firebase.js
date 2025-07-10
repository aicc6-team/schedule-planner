"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransaction = exports.getBatch = exports.getDocument = exports.getCollection = exports.getFirebaseAuth = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
require("dotenv/config");
const firebaseConfig = {
    type: process.env['FIREBASE_TYPE'],
    project_id: process.env['FIREBASE_PROJECT_ID'],
    private_key_id: process.env['FIREBASE_PRIVATE_KEY_ID'],
    private_key: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
    client_email: process.env['FIREBASE_CLIENT_EMAIL'],
    client_id: process.env['FIREBASE_CLIENT_ID'],
    auth_uri: process.env['FIREBASE_AUTH_URI'],
    token_uri: process.env['FIREBASE_TOKEN_URI'],
    auth_provider_x509_cert_url: process.env['FIREBASE_AUTH_PROVIDER_X509_CERT_URL'],
    client_x509_cert_url: process.env['FIREBASE_CLIENT_X509_CERT_URL'],
    universe_domain: process.env['FIREBASE_UNIVERSE_DOMAIN'],
};
if (!(0, app_1.getApps)().length) {
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(firebaseConfig),
    });
}
exports.db = (0, firestore_1.getFirestore)();
const getFirebaseAuth = () => {
    return (0, auth_1.getAuth)();
};
exports.getFirebaseAuth = getFirebaseAuth;
const getCollection = (collectionName) => {
    return exports.db.collection(collectionName);
};
exports.getCollection = getCollection;
const getDocument = (collectionName, docId) => {
    return exports.db.collection(collectionName).doc(docId);
};
exports.getDocument = getDocument;
const getBatch = () => {
    return exports.db.batch();
};
exports.getBatch = getBatch;
const getTransaction = () => {
    return exports.db.runTransaction.bind(exports.db);
};
exports.getTransaction = getTransaction;
//# sourceMappingURL=firebase.js.map