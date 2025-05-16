const express = require('express');
const router = express.Router();
const { db } = require('../admin');

// PUT /api/users/:uid
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const {
    fullName,
    dateOfBirth,
    phone,
    studentId,
    class: classCode,
    major,
    gpa,
    cpa
  } = req.body;

  try {
    await db.collection('users').doc(uid).set({
      fullName,
      dateOfBirth,
      phone,
      studentId,
      class: classCode,
      major,
      gpa,
      cpa,
      updatedAt: new Date()
    }, { merge: true });

    res.json({ message: 'Thông tin người dùng đã được cập nhật.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
