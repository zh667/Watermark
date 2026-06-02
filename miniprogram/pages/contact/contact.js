Page({
  data: {
    contacts: [
      {
        label: '微信号',
        value: 'zh667_dev',
        copyable: true
      },
      {
        label: '邮箱',
        value: '3257696116@qq.com',
        copyable: true
      },
      {
        label: 'GitHub',
        value: 'github.com/zh667',
        copyable: true
      }
    ]
  },

  onCopy(e) {
    const value = e.currentTarget.dataset.value
    wx.setClipboardData({
      data: value,
      success() {
        wx.showToast({ title: '已复制', icon: 'success' })
      }
    })
  }
})
