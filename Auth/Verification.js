import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

/**
 * Gửi email xác nhận cho user đã đăng ký nhưng chưa xác thực (pending user).
 * @param {string} email - Email người dùng.
 * @param {string} password - Mật khẩu đã lưu tạm ở localStorage hoặc truyền vào.
 */
export async function sendVerificationToPendingUser(email, password) {
  try {
    // 1. Đăng nhập bằng email và password đã lưu
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      // 2. Kiểm tra xem user có tồn tại trong pendingUsers không
      const pendingRef = doc(db, 'pendingUsers', user.uid);
      const pendingSnap = await getDoc(pendingRef);

      if (pendingSnap.exists()) {
        // 3. Gửi email xác thực
        await user.sendEmailVerification();

        console.log(`Email xác thực đã gửi tới: ${user.email}`);
        window.location.href = '/success.html';
      } else {
        throw new Error('Không tìm thấy người dùng trong pendingUsers.');
      }
    } else {
      return { success: false, message: 'Email đã được xác thực trước đó.' };
    }
  } catch (error) {
    console.error('Gửi email xác thực thất bại:', error);
    alert('Gửi email xác thực thất bại. Vui lòng thử lại.');
  }
}
