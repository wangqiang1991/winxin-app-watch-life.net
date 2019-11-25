const API = require('../../utils/api.js')

Page({
  data: {
    fileList: [],
    page: 1,
    per_page: 15,
    isPlay: false,
    shareTitle: "你的朋友给你分享了一大波文件，快来查看吧！"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFileList()
  },
  // 获取文件列表数据
  getFileList: function () {
    var self = this;
    var pramas = {};
    pramas.filetype = 'document';
    pramas.usertype = "all";
    pramas.page = this.data.page;
    pramas.per_page = this.data.per_page;

    API.getAttachments(pramas).then(res => {
      if (!this.data.fileList.length) {
        self.setData({
          fileList: res
        })
      } else {
        self.setData({
          fileList: [].concat(this.data.fileList, res)
        })
      }
    })
  },
  // 打开文档
  openDoc: function (e) {
    var self = this;
    var url = e.currentTarget.dataset.filelink;
    var fileType = e.currentTarget.dataset.filetype;
    wx.downloadFile({
      url: url,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          fieldType: fileType,
          success: function (res) {
            console.log('打开文档成功')
          }
        })
      },
      fail: function (error) {
        console.log('下载文档失败')
      }
    })

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      fileList: []
    })
    this.getFileList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      page: this.data.page + 1
    })
    this.getFileList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.shareTitle,
      path: '/pages/fileList/fileList'
    }
  }
})