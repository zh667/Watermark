const HISTORY_KEY = 'parse_history'
const MAX_HISTORY = 50

/**
 * 获取全部历史记录
 * @returns {Array}
 */
function getHistory() {
  return wx.getStorageSync(HISTORY_KEY) || []
}

/**
 * 添加一条历史记录
 * @param {object} record - { url, title, author, cover, type, time }
 */
function addHistory(record) {
  const list = getHistory()
  // 去重：相同 url 只保留最新
  const filtered = list.filter(item => item.url !== record.url)
  filtered.unshift({
    ...record,
    time: record.time || Date.now()
  })
  // 限制最多 50 条
  if (filtered.length > MAX_HISTORY) {
    filtered.length = MAX_HISTORY
  }
  wx.setStorageSync(HISTORY_KEY, filtered)
}

/**
 * 清空历史记录
 */
function clearHistory() {
  wx.removeStorageSync(HISTORY_KEY)
}

module.exports = { getHistory, addHistory, clearHistory }
