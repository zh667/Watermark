const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const parseRouter = require('./routes/parse');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 限流：每IP每分钟最多10次请求
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: '请求过于频繁，请稍后再试' }
});
app.use('/api/', limiter);

// 路由
app.use('/api', parseRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
