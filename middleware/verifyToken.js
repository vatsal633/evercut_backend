import admin from '../firebaseService.js';

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

    // 🚨 Temporary dev token for local testing
    if (token === 'test-barber-token') {
      req.firebaseUser = {
        uid: 'test_firebase_uid_124',
        phone_number: '+911234567890'
      };
      return next();
    }

  try {
    const decodedUser = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decodedUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default verifyToken;
