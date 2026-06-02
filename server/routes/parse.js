const express = require('express');
const axios = require('axios');
const router = express.Router();
const { parseUrl } = require('../services/watermark');

// POST /api/parse — 解析链接
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

// GET /api/proxy — 代理下载图片/视频（解决小程序域名限制）
router.get('/proxy', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: '请提供资源地址' });
  }

  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://www.douyin.com/',
      },
    });

    res.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    if (response.headers['content-length']) {
      res.set('Content-Length', response.headers['content-length']);
    }
    response.data.pipe(res);
  } catch {
    res.status(500).json({ success: false, message: '资源下载失败' });
  }
});

module.exports = router;
