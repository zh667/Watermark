const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const API_BASE = 'https://api.tikhub.io';
const API_TOKEN = process.env.TIKHUB_TOKEN || '';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';

/**
 * 调用 TikHub API 根据分享链接解析抖音视频/图集
 * @param {string} url - 抖音分享链接
 * @returns {object} 解析结果
 */
async function parseUrl(url) {
  const config = {
    params: { share_url: url },
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    },
    timeout: 20000
  };

  if (PROXY) {
    config.httpsAgent = new HttpsProxyAgent(PROXY);
    config.proxy = false;
  }

  const response = await axios.get(`${API_BASE}/api/v1/douyin/web/fetch_one_video_by_share_url`, config);

  const data = response.data;

  if (!data || data.code !== 200) {
    throw new Error(data?.message || '解析失败');
  }

  const aweme = data.data?.aweme_detail || data.data || {};

  // 提取图集图片
  const images = [];
  if (aweme.images) {
    for (const img of aweme.images) {
      const imgUrl = img.url_list?.[0] || img.url || '';
      if (imgUrl) images.push(imgUrl);
    }
  }

  // 提取视频地址（无水印）
  const videoUrl = aweme.video?.play_addr?.url_list?.[0]
    || aweme.video?.play_addr_lowbr?.url_list?.[0]
    || '';

  return {
    type: images.length > 0 ? 'images' : 'video',
    title: aweme.desc || '',
    author: aweme.author?.nickname || '',
    author_avatar: aweme.author?.avatar_thumb?.url_list?.[0] || '',
    images,
    video_url: videoUrl,
    text: aweme.desc || '',
    cover: aweme.video?.cover?.url_list?.[0] || ''
  };
}

module.exports = { parseUrl };
