import { registerUser } from './authService';

async function onFormSubmit(e) {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  const userData = {
    fullName: e.target.fullName.value,
    birthday: e.target.birthday.value,
    mssv: e.target.mssv.value,
    gpa: parseFloat(e.target.gpa.value),
    photoUrl: '', // Nếu có upload ảnh sau này
  };

  try {
    await registerUser(email, password, userData);
    alert('Đăng ký thành công!');
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}
