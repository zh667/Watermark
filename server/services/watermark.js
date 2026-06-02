const axios = require('axios');

// Douyin_TikTok_Download_API 服务地址
const API_BASE = process.env.PARSE_API_BASE || 'http://localhost:80';

/**
 * 调用 Douyin_TikTok_Download_API 解析链接
 * @param {string} url - 抖音分享链接
 * @returns {object} 解析结果
 */
async function parseUrl(url) {
  const response = await axios.get(`${API_BASE}/api/hybrid/video_data`, {
    params: { url },
    timeout: 15000
  });

  const data = response.data;

  if (!data || data.code !== 200) {
    throw new Error(data?.message || '解析失败');
  }

  const result = data.data;

  return {
    type: result.type || 'video',
    title: result.desc || '',
    author: result.author?.nickname || '',
    images: result.images || [],
    video_url: result.video?.play_addr?.url_list?.[0] || result.video_url || '',
    text: result.desc || '',
    cover: result.cover || ''
  };
}

module.exports = { parseUrl };
