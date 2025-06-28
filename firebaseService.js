// import admin from 'firebase-admin';
// import path from 'path';

// const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './firebase-admin-sdk.json';
// const serviceAccount = await import(path.resolve(serviceAccountPath));

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// export default admin;


import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import dotenv from 'dotenv';

dotenv.config();

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create `require` to load JSON files
const require = createRequire(import.meta.url);

// Resolve path to Firebase service key JSON
let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './firebase-admin-sdk.json';
// Clean up the path to remove potential comments and extra whitespace/characters
serviceAccountPath = serviceAccountPath.split('#')[0].trim();

const absolutePath = path.resolve(__dirname, serviceAccountPath);

const serviceAccount = require(absolutePath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;