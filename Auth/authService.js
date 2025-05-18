import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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
  
 try {
          // Lưu thông tin đăng nhập tạm thời
          localStorage.setItem('pendingEmail', email);
          localStorage.setItem('pendingPassword', password);

          // Lưu thông tin tạm thời vào Firestore
          await db.collection('pendingUsers').doc(user.uid).set({
            email: email,
            displayName: displayName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            verified: false
          });

          // Chuyển đến trang xác thực
          window.location.href = '/verify';
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          // Nếu có lỗi Firestore, xóa tài khoản đã tạo
          await user.delete();
          throw new Error('Không thể lưu thông tin người dùng. Vui lòng thử lại sau.');
        }

      } catch (error) {
        console.error('Registration error:', error);
        document.getElementById('emailError').textContent = error.message;
      } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Đăng Ký';
      }
    });

export async function registerUser(email, password, userData) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, 'users', user.uid), {
    ...userData,
    createdAt: new Date()
  });

  return user;
}
