// Hàm đăng ký user
async function registerUser(email, password, displayName) {
  try {
    console.log('Sending registration request:', { email, password, displayName }); // Debug log

    // 1. Đăng ký
    const registerRes = await fetch('/api/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password, displayName })
    });

    const data = await registerRes.json();
    console.log('Registration response:', data); // Debug log

    if (!registerRes.ok) {
      throw new Error(data.error || 'Đăng ký thất bại');
    }

    // Lưu token vào localStorage để sử dụng sau
    localStorage.setItem('idToken', data.idToken);
    localStorage.setItem('uid', data.uid);

    // Chuyển đến trang xác thực
    window.location.href = '/verify-test.html';
  } catch (error) {
    console.error('Registration error:', error);
    throw error; // Re-throw để xử lý ở form
  }
}

// Hàm kiểm tra trạng thái xác thực
async function checkVerification() {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) {
    window.location.href = '/register-test.html';
    return;
  }

  try {
    const verifyRes = await fetch('/api/check-verification', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });

    if (!verifyRes.ok) {
      throw new Error('Kiểm tra xác thực thất bại');
    }

    const { emailVerified } = await verifyRes.json();
    
    if (emailVerified) {
      // Email đã được xác thực
      window.location.href = '/success-test.html';
    } else {
      // Chưa xác thực, kiểm tra lại sau 5 giây
      setTimeout(checkVerification, 5000);
    }
  } catch (error) {
    console.error('Verification check error:', error);
  }
}

// Hàm gửi lại email xác thực
async function resendVerificationEmail() {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) {
    window.location.href = '/register-test.html';
    return;
  }

  try {
    const res = await fetch('/api/resend-verification', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });

    if (!res.ok) {
      throw new Error('Gửi lại email thất bại');
    }

    const data = await res.json();
    alert('Email xác thực đã được gửi lại');
  } catch (error) {
    console.error('Resend verification error:', error);
    alert('Gửi lại email thất bại: ' + error.message);
  }
}

// Hàm đăng xuất
function logout() {
  localStorage.removeItem('idToken');
  localStorage.removeItem('uid');
  window.location.href = '/register-test.html';
} 