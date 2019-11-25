const API = require('../../utils/api.js')

Page({
  data: {
    videoList: [],
    page: 1,
    per_page: 5,
    isPlay: false,
    shareTitle: "你的朋友和你分享了一条不错的视频，快来查看吧！"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getVideoList()
  },
  // 获取视频列表数据
  getVideoList: function() {
    var self = this;
    var pramas = {};
    pramas.filetype = 'video';
    pramas.usertype = "all";
    pramas.page = this.data.page;
    pramas.per_page = this.data.per_page;

    API.getAttachments(pramas).then(res => {
      if(!this.data.videoList.length) {
        self.setData({
          videoList: res
        })
      }else {
        self.setData({
          videoList: [].concat(this.data.videoList, res)
        })
      }
    })
  },
  // 点击播放时
  handlePlay: function(e) {
    let id = e.currentTarget.dataset.id;
    // 遍历视频数组，如果是当前点击的视屏，就给添加一个isplay属性
    let newVideoList = this.data.videoList
    newVideoList = newVideoList.map(item => {
      if(item.id === id) {
        item.isPlay = true
      }
      return item
    })
    // 重新更新下data里的数据
    this.setData({
      videoList: newVideoList
    })
  },
  // 点击暂停时
  handlePause: function (e) {
    let id = e.currentTarget.dataset.id;
    // 遍历视频数组，如果是当前点击的视屏，就把isplay属性改为false
    let newVideoList = this.data.videoList
    newVideoList = newVideoList.map(item => {
      if (item.id === id) {
        item.isPlay = false
      }
      return item
    })
    // 重新更新下data里的数据
    this.setData({
      videoList: newVideoList
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      videoList: []
    })
    this.getVideoList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.setData({
      page: this.data.page + 1
    })
    this.getVideoList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: this.data.shareTitle,
      path: '/pages/videolist/videolist'
    }
  }
})