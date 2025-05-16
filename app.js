const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const userProfileRoutes = require('./routes/userProfile');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Route cập nhật thông tin user
app.use('/api/users', userProfileRoutes);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
