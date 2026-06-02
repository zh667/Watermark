Page({
  data: {
    list: [
      {
        q: '支持哪些平台？',
        a: '目前仅支持抖音平台的短视频和图集，更多平台（快手、小红书等）正在适配中。',
        open: false
      },
      {
        q: '为什么解析失败了？',
        a: '请检查链接是否正确、是否为抖音分享链接。部分私密作品或已删除的内容无法解析。如果仍然失败，请稍后重试。',
        open: false
      },
      {
        q: '视频保存到哪里了？',
        a: '视频和图片会保存到手机相册中。首次保存时需要授权访问相册，请点击「允许」。',
        open: false
      },
      {
        q: '解析出来的内容有水印吗？',
        a: '解析出的图片和视频均为无水印的原始内容。',
        open: false
      },
      {
        q: '历史记录会同步吗？',
        a: '历史记录保存在本地，不会上传到服务器，也不会在不同设备间同步。清除小程序缓存会丢失历史记录。',
        open: false
      },
      {
        q: '有使用次数限制吗？',
        a: '为保证服务稳定，每分钟最多解析 10 次。正常使用不会触发限制。',
        open: false
      }
    ]
  },

  toggleItem(e) {
    const idx = e.currentTarget.dataset.idx
    const key = `list[${idx}].open`
    this.setData({ [key]: !this.data.list[idx].open })
  }
})
