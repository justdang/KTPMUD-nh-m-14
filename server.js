import dotenv from 'dotenv';
dotenv.config();

const firebaseApiKey = process.env.FIREBASE_API_KEY;
console.log("Firebase API Key:", firebaseApiKey);

import { readFileSync } from 'fs';
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  readFileSync('./hlearnhub-testing-firebase-adminsdk-fbsvc-7cdcc148e1.json', 'utf8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: 'https://hlearnhub-testing.firebaseio.com' // nếu cần
  });
}

import path from 'path';
import express from 'express';
import cors from 'cors';
const app = express()
import session from './session.mjs';
// import userProfileRoutes from './routes/userProfile';

// Middleware
app.use(express.json());
app.use(cors());
app.use(session);

app.use(express.static('./frontend_stranger'));
app.use(express.static('./frontend_member'));
app.use(express.static('./Auth'));

// Middleware checkRole 
function checkRole(req, res, next) {
  if (!req.session.role) {
    req.session.role = 'stranger'
  }
  next()
}

app.get('/', checkRole, (req, res) => {
  const role = req.session.role

  if (role == 'member') {
    res.sendFile(path.resolve(__dirname, './frontend_member/Index_member.html'))
  } else if (role == 'stranger') {
    res.sendFile(path.resolve(__dirname, './frontend_stranger/Index_stranger.html'))
  }
})

app.get('/about', (req, res) => {
  const role = req.session.role;
  if (role == 'member') {
    res.sendFile(path.resolve(__dirname, './frontend_member/About_member.html'));
  } else if (role == 'stranger') {
    res.sendFile(path.resolve(__dirname, './frontend_stranger/about_stranger.html'));
  }
});

app.get('/signup', (req, res) => {
  res.sendFile(path.resolve(__dirname, './Auth/register-test.html'))
});

app.get('/signin', (req, res) => {
  res.sendFile(path.resolve(__dirname, './Auth/signin.html'))
});

app.get('/dayVaHoc', (req, res) => {
  res.sendFile(path.resolve(__dirname, './frontend_member/DayVaHoc.html'))
});

app.get('/dkyHoc', (req, res) => {
  res.sendFile(path.resolve(__dirname, './frontend_member/dkyHoc_test.html'))
});


// // ... các route HTML khác ...

// // 404 cho các route còn lại
// app.use((req, res) => {
//   res.status(404).send('resource not found');
// });

// app.post('/register', (req, res) => {
//   req.session.role = 'member'; // Gán role thành member
//   res.redirect('/'); // Redirect về trang chủ
// })



// // Home page

//verify test, success test - xóa sau khi test xong
app.get('/verify', (req, res) => {
  res.sendFile(path.resolve(__dirname, './Auth/verify-test.html'))
})

app.get('/edit', (req, res) => {
  res.sendFile(path.resolve(__dirname, './frontend/Profile editing.html'))
})

// study page
app.get('/studyregister', (req, res) => {
  const role = req.session.role
  if (role == 'member') {
    res.sendFile(path.resolve(__dirname, './frontend_member/Study_register.html'))
  } else {
    res.status(404).send('resource not found')
  }
})

// schedule page
app.get('/schedule', (req, res) => {
  const role = req.session.role
  if (role == 'member') {
    res.sendFile(path.resolve(__dirname, './frontend_member/Schedule.html'))
  } else {
    res.status(404).send('resource not found')
  }
})

// profile page
app.get('/profile', (req, res) => {
  const role = req.session.role
  if (role == 'member') {
    res.sendFile(path.resolve(__dirname, './frontend_member/Profile_user.html'))
  } else {
    res.status(404).send('resource not found')
  }
})

app.get('/profileOther', (req, res) => {
  const role = req.session.role
  if (role == 'member') {
    res.sendFile(path.resolve(__dirname, './frontend_member/Profile other.html'))
  } else {
    res.status(404).send('resource not found')
  }
})





// app.use('/api/users', userProfileRoutes);

// ==== ROUTE API (Đặt ở đây, TRƯỚC static và HTML) ====
import {
  saveUserData,
  getUserData,
  updateUserData,
  deleteUserData,
  saveLoginHistory,
  getLoginHistory,
  searchUsers,
  getRecentUsers
} from './firebase-config.js';
import axios from 'axios';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

// API: Đăng ký và gửi email xác minh
app.post('/api/register', async (req, res) => {
  console.log('Received registration request:', req.body); // Debug log
  const { email, password, displayName } = req.body;
  try {
    const signUpRes = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );
    console.log('Firebase signup response:', signUpRes.data); // Debug log
    const idToken = signUpRes.data.idToken;
    const uid = signUpRes.data.localId;
    await saveUserData(uid, {
      email,
      displayName,
      emailVerified: false
    });
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        requestType: "VERIFY_EMAIL",
        idToken,
      }
    );
    res.json({
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.",
      idToken,
      uid
    });
  } catch (error) {
    console.error('Registration error:', error.response?.data || error); // Debug log
    const msg = error.response?.data?.error?.message || error.message;
    res.status(400).json({ error: msg });
  }
});

// API: Kiểm tra user đã xác minh email hay chưa
app.post('/api/check-verification', async (req, res) => {
  const { idToken } = req.body;
  try {
    const lookupRes = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        idToken,
      }
    );
    const emailVerified = lookupRes.data.users[0].emailVerified;
    res.json({ emailVerified });
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    res.status(400).json({ error: msg });
  }
});

// API: Đăng nhập
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const signInRes = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const uid = signInRes.data.localId;
    
    // Lưu lịch sử đăng nhập
    await saveLoginHistory(uid, {
      email,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    // Lấy thông tin user từ database
    const userData = await getUserData(uid);

    res.json({
      message: "Đăng nhập thành công",
      idToken: signInRes.data.idToken,
      user: {
        ...signInRes.data,
        ...userData
      }
    });

  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    res.status(400).json({ error: msg });
  }
});

// API: Lấy thông tin user
app.get('/api/user', async (req, res) => {
  const { idToken } = req.headers;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);
    const userData = await getUserData(decodedToken.uid);
    
    res.json({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
      ...userData
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// API: Cập nhật thông tin user
app.put('/api/user', async (req, res) => {
  const { idToken } = req.headers;
  const { displayName, photoURL, ...otherData } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Cập nhật thông tin cơ bản
    await admin.auth().updateUser(decodedToken.uid, {
      displayName,
      photoURL
    });

    // Cập nhật thông tin bổ sung trong database
    await updateUserData(decodedToken.uid, otherData);
    
    res.json({ message: 'Cập nhật thông tin thành công' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API: Đổi mật khẩu
app.post('/api/change-password', async (req, res) => {
  const { idToken, newPassword } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    await admin.auth().updateUser(decodedToken.uid, {
      password: newPassword
    });
    
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API: Quên mật khẩu
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        requestType: "PASSWORD_RESET",
        email
      }
    );

    res.json({ message: 'Email khôi phục mật khẩu đã được gửi' });
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    res.status(400).json({ error: msg });
  }
});

// API: Tìm kiếm user
app.get('/api/users/search', async (req, res) => {
  const { query } = req.query;
  
  try {
    const users = await searchUsers(query);
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API: Lấy danh sách user mới nhất
app.get('/api/users/recent', async (req, res) => {
  const { limit } = req.query;
  
  try {
    const users = await getRecentUsers(parseInt(limit) || 10);
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API: Lấy lịch sử đăng nhập
app.get('/api/users/:uid/login-history', async (req, res) => {
  const { uid } = req.params;
  const { limit } = req.query;
  
  try {
    const history = await getLoginHistory(uid, parseInt(limit) || 10);
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API: Cập nhật thông tin tài khoản
app.post('/api/set-role-member', (req, res) => {
  req.session.role = 'member';
  res.json({ message: 'Role updated to member' });
});

// API: Xóa tài khoản
app.delete('/api/users/:uid', async (req, res) => {
  const { uid } = req.params;
  const { idToken } = req.headers;

  try {
    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.uid !== uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete user from Authentication
    await admin.auth().deleteUser(uid);
    
    // Delete user data from Firestore
    await deleteUserData(uid);
    
    // Sau khi xóa thành công, trả về success để client chuyển hướng
    res.json({ success: true, message: 'Tài khoản đã được xóa thành công' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API đăng xuất
app.get('/logout', (req, res) => {
  req.session.role = 'stranger'; // Đổi role thành stranger
  req.session.destroy((err) => {
    if (err) {
      console.error("Lỗi khi xóa session:", err);
      return res.status(500).send("Lỗi khi đăng xuất.");
    }
    res.redirect('/'); // Chuyển hướng về trang chủ
  });
});

// 404 cho API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});


// ==== STATIC & ROUTE HTML ====


import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.listen(3000, () => {
  console.log('server is listening on port 3000....')
})


