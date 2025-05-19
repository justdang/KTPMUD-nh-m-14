import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

db.settings({
      timestampsInSnapshots: true
    });

document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

document.querySelectorAll('.error').forEach(el => el.textContent = '');
      
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const displayName = document.getElementById('displayName').value;
  const submitBtn = document.getElementById('submitBtn');

// Validate
  if (password.length < 6) {
    document.getElementById('passwordError').textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
    return;
  }
  //Tránh việc người dùng nhấn nút đăng ký nhiều lần
  submitBtn.disabled = true;
  submitBtn.textContent = 'Đang xử lý...';

 try {
          // Lưu thông tin đăng nhập tạm thời
          localStorage.setItem('pendingEmail', email);
          localStorage.setItem('pendingPassword', password);

          // Tạo tài khoản người dùng
          // Tạo tài khoản
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Lưu thông tin tạm thời vào Firestore
          await db.collection('pendingUsers').doc(user.uid).set({
            email: email,
            displayName: displayName,
            createdAt: serverTimestamp(),
            verified: false
          });

          // Chuyển đến trang xác thực
          window.location.href = '/verify';
        } catch (error) {
          console.error('Registration error:', error);
          document.getElementById('emailError').textContent = error.message;
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Đăng Ký';
        }
  });

export async function registerUser(email, password, userData) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, 'users', user.uid), {
    ...userData,
    createdAt: serverTimestamp()
  });

  return user;
}
