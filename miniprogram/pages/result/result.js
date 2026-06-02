const { parseUrl } = require('../../utils/api');

Page({
  data: {
    activeTab: 0, // 0=图片 1=视频 2=文案
    result: null,
    originalUrl: '',
    loading: false,
    error: '',
  },

  onLoad(options) {
    if (options.data) {
      try {
        const result = JSON.parse(decodeURIComponent(options.data));
        this.setData({ result });
      } catch {
        this.setData({ error: '数据解析异常' });
      }
    }
    if (options.url) {
      this.setData({ originalUrl: decodeURIComponent(options.url) });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 保存单张图片
  saveImage(e) {
    const url = e.currentTarget.dataset.url;
    this._downloadAndSave(url, 'image');
  },

  // 批量保存图片
  saveAllImages() {
    const images = this.data.result.images || [];
    if (images.length === 0) return;

    wx.showLoading({ title: '保存中...' });
    let saved = 0;
    let failed = 0;

    const tasks = images.map((url) =>
      this._downloadFile(url)
        .then((tempPath) => this._saveToAlbum(tempPath, 'image'))
        .then(() => {
          saved++;
        })
        .catch(() => {
          failed++;
        }),
    );

    Promise.all(tasks).then(() => {
      wx.hideLoading();
      if (failed === 0) {
        wx.showToast({ title: `已保存 ${saved} 张图片`, icon: 'success' });
      } else {
        wx.showToast({ title: `成功 ${saved} 张，失败 ${failed} 张`, icon: 'none' });
      }
    });
  },

  // 保存视频
  saveVideo() {
    const url = this.data.result.video_url;
    if (!url) return;
    this._downloadAndSave(url, 'video');
  },

  // 复制文案
  copyText() {
    const text = this.data.result.text || this.data.result.title || '';
    if (!text) {
      wx.showToast({ title: '暂无文案', icon: 'none' });
      return;
    }
    wx.setClipboardData({
      data: text,
      success() {
        wx.showToast({ title: '文案已复制', icon: 'success' });
      },
    });
  },

  // 重新解析
  onRetry() {
    const { originalUrl } = this.data;
    if (!originalUrl) return;

    this.setData({ loading: true, error: '' });
    parseUrl(originalUrl)
      .then((data) => {
        this.setData({ result: data, error: '' });
      })
      .catch((err) => {
        this.setData({ error: err.message || '解析失败' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.url;
    const urls = this.data.result.images || [];
    wx.previewImage({ current, urls });
  },

  // 下载文件
  _downloadFile(url) {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url,
        success(res) {
          if (res.statusCode === 200) {
            resolve(res.tempFilePath);
          } else {
            reject(new Error('下载失败'));
          }
        },
        fail: reject,
      });
    });
  },

  // 保存到相册
  _saveToAlbum(tempPath, type) {
    return new Promise((resolve, reject) => {
      const method = type === 'video' ? 'saveVideoToPhotosAlbum' : 'saveImageToPhotosAlbum';
      wx[method]({
        filePath: tempPath,
        success: resolve,
        fail(err) {
          if (err.errMsg && err.errMsg.includes('auth deny')) {
            wx.showModal({
              title: '需要授权',
              content: '请在设置中允许保存到相册',
              confirmText: '去设置',
              success(modalRes) {
                if (modalRes.confirm) {
                  wx.openSetting();
                }
              },
            });
          }
          reject(err);
        },
      });
    });
  },

  // 下载并保存
  _downloadAndSave(url, type) {
    wx.showLoading({ title: '保存中...' });
    this._downloadFile(url)
      .then((tempPath) => this._saveToAlbum(tempPath, type))
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '已保存到相册', icon: 'success' });
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '保存失败', icon: 'none' });
      });
  },
});
