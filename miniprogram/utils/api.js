const app = getApp()

function getBaseUrl() {
  return app.globalData.baseUrl
}

/**
 * 解析短视频链接
 * @param {string} url - 短视频分享链接
 * @returns {Promise<object>} 解析结果
 */
function parseUrl(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getBaseUrl()}/api/parse`,
      method: 'POST',
      data: { url },
      header: { 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data.data)
        } else {
          reject(new Error(res.data.message || '解析失败'))
        }
      },
      fail(err) {
        reject(new Error('网络请求失败，请检查网络'))
      }
    })
  })
}

module.exports = { parseUrl }
