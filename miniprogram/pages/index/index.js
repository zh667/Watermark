const { parseUrl } = require('../../utils/api');
const { addHistory } = require('../../utils/storage');

Page({
  data: {
    url: '',
    loading: false,
  },

  onInputChange(e) {
    this.setData({ url: e.detail.value.trim() });
  },

  onPaste() {
    wx.getClipboardData({
      success: (res) => {
        if (res.data) {
          this.setData({ url: res.data.trim() });
        } else {
          wx.showToast({ title: '剪贴板为空', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '读取剪贴板失败，请手动粘贴', icon: 'none' });
      },
    });
  },

  onParse() {
    const { url } = this.data;
    if (!url) {
      wx.showToast({ title: '请先粘贴链接', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    parseUrl(url)
      .then((data) => {
        // 保存历史记录
        addHistory({
          url,
          title: data.title || '未知标题',
          author: data.author || '',
          cover: data.cover || '',
          type: data.type || 'video',
        });
        // 跳转结果页
        wx.navigateTo({
          url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(data))}&url=${encodeURIComponent(url)}`,
        });
      })
      .catch((err) => {
        wx.showModal({
          title: '解析失败',
          content: err.message || '请检查链接是否正确',
          showCancel: false,
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  onClear() {
    this.setData({ url: '' });
  },

  goTutorial() {
    wx.navigateTo({ url: '/pages/tutorial/tutorial' });
  },

  goFaq() {
    wx.navigateTo({ url: '/pages/faq/faq' });
  },

  goContact() {
    wx.navigateTo({ url: '/pages/contact/contact' });
  },
});
