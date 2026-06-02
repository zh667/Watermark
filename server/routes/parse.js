const express = require('express');
const router = express.Router();
const { parseUrl } = require('../services/watermark');

// POST /api/parse — 解析抖音链接
router.post('/parse', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: '请提供链接' });
  }

  try {
    const data = await parseUrl(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || '解析失败，请稍后重试',
    });
  }
});

module.exports = router;
