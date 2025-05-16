const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
storageBucket: 'your-project-id.appspot.com' // thay bằng đúng bucket
});

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = { db, auth, bucket };