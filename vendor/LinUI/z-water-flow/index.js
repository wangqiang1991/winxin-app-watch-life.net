// demo.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: Object
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转至查看文章详情
    redictDetail: function (e) {
      console.log('查看文章');
      var id = e.currentTarget.id;
      var type = null;
      if (e.currentTarget.dataset.type) {
        type = e.currentTarget.dataset.type == "product" ? 1 : 2;
      } else {
        type = e.currentTarget.dataset.posttype == "product" ? 1 : 2;
      }
      var url = '../detail/detail?id=' + id + '&type=' + type;
      wx.navigateTo({
        url: url
      })
    }
  }
})