// src/authService.js
import { auth, db } from './firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Đăng ký người dùng và lưu thông tin cá nhân
 */
export async function registerUser(email, password, userData) {
  try {
    // 1. Đăng ký Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Lưu thông tin vào Firestore với ID là user.uid
    await setDoc(doc(db, 'users', user.uid), {
      ...userData, // VD: { fullName, birthday, mssv, gpa, photoUrl }
      createdAt: new Date()
    });

    console.log('Đăng ký thành công!');
    return user;
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    throw error;
  }
}
