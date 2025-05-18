import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//PHẦN KHAI BÁO firebaseconfig KHÔNG BAO GIỜ ĐƯỢC XÓA NHÉ
const firebaseConfig = {
    apiKey: "AIzaSyAWXMEwMPSyMBVf4LikdsVCZ0kN4BhYB6E",
    authDomain: "hlearnhub-testing.firebaseapp.com",
    projectId: "hlearnhub-testing",
    messagingSenderId: "1054297107041",
    appId: "1:1054297107041:web:e2e985461b9ac570441820"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

// Đọc service account key
const serviceAccount = JSON.parse(
  readFileSync('./hlearnhub-testing-firebase-adminsdk-fbsvc-7cdcc148e1.json', 'utf8')
);

// Khởi tạo Firebase Admin SDK nếu chưa được khởi tạo
let app;
try {
  app = admin.app();
} catch (error) {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Khởi tạo Firestore
const db = getFirestore(app);

// Hàm lưu thông tin user vào database
export const saveUserData = async (uid, userData) => {
  try {
    const userRef = db.collection('users').doc(uid);
    await userRef.set({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

// Hàm lấy thông tin user từ database
export const getUserData = async (uid) => {
  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    return userDoc.exists ? userDoc.data() : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Hàm cập nhật thông tin user
export const updateUserData = async (uid, userData) => {
  try {
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      ...userData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};

// Hàm xóa user
export const deleteUserData = async (uid) => {
  try {
    // Xóa user document
    await db.collection('users').doc(uid).delete();
    
    // Xóa tất cả subcollections
    const loginHistoryRef = db.collection('users').doc(uid).collection('loginHistory');
    const loginHistoryDocs = await loginHistoryRef.get();
    
    const batch = db.batch();
    loginHistoryDocs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    return false;
  }
};

// Hàm lưu lịch sử đăng nhập
export const saveLoginHistory = async (uid, loginData) => {
  try {
    const loginHistoryRef = db.collection('users').doc(uid).collection('loginHistory');
    await loginHistoryRef.add({
      ...loginData,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving login history:', error);
    return false;
  }
};

// Hàm lấy lịch sử đăng nhập
export const getLoginHistory = async (uid, limit = 10) => {
  try {
    const loginHistoryRef = db.collection('users').doc(uid).collection('loginHistory');
    const snapshot = await loginHistoryRef
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting login history:', error);
    return null;
  }
};

// Hàm tìm kiếm user
export const searchUsers = async (searchTerm) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('displayName', '>=', searchTerm)
      .where('displayName', '<=', searchTerm + '\uf8ff')
      .limit(10)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    return null;
  }
};

// Hàm lấy danh sách user mới nhất
export const getRecentUsers = async (limit = 10) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recent users:', error);
    return null;
  }
}; 