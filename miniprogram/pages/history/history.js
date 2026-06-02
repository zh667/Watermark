const { getHistory, clearHistory } = require('../../utils/storage');
const { parseUrl } = require('../../utils/api');
const { addHistory } = require('../../utils/storage');

Page({
  data: {
    list: [],
  },

  onShow() {
    this.setData({ list: getHistory() });
  },

  onReparse(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) return;

    wx.showLoading({ title: '解析中...' });
    parseUrl(url)
      .then((data) => {
        addHistory({
          url,
          title: data.title || '未知标题',
          author: data.author || '',
          cover: data.cover || '',
          type: data.type || 'video',
        });
        wx.hideLoading();
        wx.navigateTo({
          url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(data))}&url=${encodeURIComponent(url)}`,
        });
      })
      .catch((err) => {
        wx.hideLoading();
        wx.showToast({ title: err.message || '解析失败', icon: 'none' });
      });
  },

  onCopyLink(e) {
    const url = e.currentTarget.dataset.url;
    wx.setClipboardData({
      data: url,
      success() {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      },
    });
  },

  onClear() {
    if (this.data.list.length === 0) return;
    wx.showModal({
      title: '确认清空',
      content: '清空后无法恢复，确定吗？',
      confirmColor: '#CC785C',
      success: (res) => {
        if (res.confirm) {
          clearHistory();
          this.setData({ list: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      },
    });
  },

  formatTime(timestamp) {
    const d = new Date(timestamp);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hour = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${min}`;
  },
});
