import dotenv from 'dotenv';
dotenv.config();

const firebaseApiKey = process.env.FIREBASE_API_KEY;
console.log("Firebase API Key:", firebaseApiKey);

import { readFileSync } from 'fs';
const serviceAccount = JSON.parse(
  readFileSync('./hlearnhub-testing-firebase-adminsdk-fbsvc-7cdcc148e1.json', 'utf8')
);

import path from 'path';
import express from 'express';
const app = express()
import session from './session.mjs';

// sử dụng session middleware
app.use(session) 

//cai nay se cho phep su dung cac file trong folder
app.use(express.static('./frontend_stranger'))
app.use(express.static('./frontend_member'))

// Route login
// app.post('/login', express.urlencoded({ extended: true }), (req, res) => {
//   const { username, password } = req.body

//   //xác định role theo username
//   if (username === 'student') {
//     req.session.role = 'student'
//   } else if (username === 'mentor') {
//     req.session.role = 'mentor'
//   } else {
//     req.session.role = 'guest'
//   }

//   res.redirect('/')
// })

//import React from "react";
//import EmailVerificationApp from "./EmailVerificationApp"; // 👈 import component bạn vừa tạo

//function App() {
  //return (
    //<div>
      //<EmailVerificationApp />
    //</div>
  //);
//}

//export default App;

app.post('/register', (req, res) => {
  req.session.role = 'member'; // Gán role thành member
  res.redirect('/'); // Redirect về trang chủ
})


// Middleware checkRole 
function checkRole(req, res, next) {
  if (!req.session.role) {
    req.session.role = 'stranger'
  }
  next()
}

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Home page
app.get('/', checkRole, (req, res) => {
  const role = req.session.role

  if (role == 'member') {
    res.sendFile(path.resolve(__dirname, './frontend_member/Index_member.html'))
  } else if (role == 'stranger') {
    res.sendFile(path.resolve(__dirname, './frontend_stranger/Index_stranger.html'))
  }
})

//Account register 
app.get('/accreg', checkRole, (req, res) => {

    res.sendFile(path.resolve(__dirname, './frontend_stranger/account_register.html'))
})

// About page
app.get('/about', (req, res) => {
  const role = req.session.role

  if (role == 'member') {
    res.sendFile(path.resolve(__dirname, './frontend_member/About_member.html'))
  } else if (role == 'stranger') {
    res.sendFile(path.resolve(__dirname, './frontend_stranger/About_stranger.html'))
  }
})

// Register page
app.get('/register', (req, res) => {
  res.sendFile(path.resolve(__dirname, './frontend_stranger/Member_register.html'))
})

//register test, verify test, success test - xóa sau khi test xong
app.get('/signup', (req, res) => {
  res.sendFile(path.resolve(__dirname, './frontend_stranger/register-test.html'))
})

app.get('/verify', (req, res) => {
  res.sendFile(path.resolve(__dirname, './frontend_stranger/verify-test.html'))
})

app.get('/success', (req, res) => {
  res.sendFile(path.resolve(__dirname, './frontend_stranger/success-test.html'))
})

// study page
app.get('/study_register', (req, res) => {
  const role = req.session.role
  if (role == 'member') {
    res.sendFile(path.resolve(__dirname, './frontend_member/Study_register.html'))
  } else {
    res.status(404).send('resource not found')
  }
})

// teaching page
app.get('/teaching_register', (req, res) => {
  const role = req.session.role
  if (role == 'member') {
    res.sendFile(path.resolve(__dirname, './frontend_member/Teaching_register.html'))
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

app.all('*', (req, res) => {
  res.status(404).send('resource not found')
})

app.listen(3000, () => {
  console.log('server is listening on port 3000....')
})

// init firebase
// Load service account key -> firebase-admin là serviceaccountkey theo chatgpt :))
import admin from 'firebase-admin';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

import cors from 'cors'
import axios from 'axios'

//Lưu API 
app.use(cors());
app.use(express.json());

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

// API: Đăng ký và gửi email xác minh
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Đăng ký user (tạo user tạm thời trên Firebase)
    const signUpRes = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const idToken = signUpRes.data.idToken;

    // 2. Gửi email xác minh
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
    });

  } catch (error) {
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

