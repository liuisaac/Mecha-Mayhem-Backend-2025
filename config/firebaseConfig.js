const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_FILE_LOC);

console.log(process.env.FIREBASE_FILE_LOC)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://mecha-mayhem-2024.appspot.com',
});

const db = admin.firestore();

module.exports = { db }; 