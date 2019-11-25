/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */
const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js');
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'

const app = getApp()
const pageCount = config.getPageCount;

Page({

  data: {
    userInfo: {},
    readLogs: [],
    userSession: {},
    articlesList: [],
    copyright: app.globalData.copyright,
    listStyle: config.getListStyle,
    navigationBarTitle: '' // 页面标题  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.setData({
      userInfo: wx.getStorageSync('userInfo'),
      userSession: wx.getStorageSync('userSession')
    });
    Auth.setUserMemberInfoData(self);
    var mytype = options.mytype;
    self.fetchPostsData(mytype);
    Auth.checkLogin(self);
    this.setData({ listStyle: wx.getStorageSync('listStyle') });
  },

  onReady: function () {
    var self = this;
    // 动态设置页面标题
    wx.setNavigationBarTitle({
      title: this.data.navigationBarTitle
    })
  },

  // 跳转至查看文章详情
  redictDetail: function (e) {
    var id = e.currentTarget.id;
    var type = null;
    if (e.currentTarget.dataset.type) {
      type = e.currentTarget.dataset.type == "product" ? 1 : 2;
    } else {
      type = e.currentTarget.dataset.posttype == "product" ? 1 : 2;
    }
    var posttype = e.currentTarget.dataset.posttype ? e.currentTarget.dataset.posttype : "post";
    var url = "";
    if (posttype == "post") {
      url = '../detail/detail?id=' + id + '&type=' + type;
    }
    else if (posttype == "product") {
      url = '../detail/detail?id=' + id + '&type=' + type;
    }
    else if (posttype == "topic") {
      url = '../topicarticle/topicarticle?id=' + id;
    }


    wx.navigateTo({
      url: url
    })
  },

  onShareAppMessage: function () {
    var title =  + config.getWebsiteName + "浏览、评论、点赞、鼓励的文章";
    var path = "pages/readlog/readlog";
    return {
      title: title,
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  fetchPostsData: function (mytype) {
    self = this;
    // self.setData({
    //     showerror: 'none',
    //     shownodata:'none'
    // }); 
    var count = 0;
    if (mytype == 'myreads') {
      self.setData({
        articlesList: (wx.getStorageSync('readLogs') || []).map(function (log) {
          count++;
          return log;
        }),
        navigationBarTitle: '我的浏览'
      });
      if (count == 0) {
        self.setData({
          shownodata: 'block',
          navigationBarTitle: '我的浏览'
        });
      }


    }
    else if (mytype == 'mycomments') {
      self.setData({
        articlesList: [],
        navigationBarTitle: '我的评论'
      });
      var data = {};
      data.userId = self.data.userSession.userId;
      data.sessionId = self.data.userSession.sessionId;
      API.getMyComments(data).then(res => {
        var dd = res;
        if (res && res.length) {
          res.forEach(item => {
            if (item.goods_image) {
              item.post_large_image = item.goods_image;
              item.post_medium_image = item.goods_image;
            }
          })
        }
        console.log(res)
        self.setData({
          articlesList: self.data.articlesList.concat(res.map(function (item) {
            count++;
            item["id"] = item.id;
            item["date"] = item.date;
            var titleRendered = { "rendered": item.title.rendered };
            item["title"] = titleRendered;
            item["pageviews"] = item.pageviews;
            item["like_count"] = item.like_count;
            item["post_large_image"] = item.post_large_image;
            item["post_medium_image"] = item.post_medium_image;
            return item;
          }))
        })

      });



    }

    else if (mytype == 'mylikes') {
      self.setData({
        readLogs: [],
        navigationBarTitle: '我的点赞'
      });
      var data = {};
      data.userId = self.data.userSession.userId;
      data.sessionId = self.data.userSession.sessionId;
      API.getMyLikes(data).then(res => {
        if(res && res.length) {
          res.forEach(item=>{
            if (item.goods_image){
              item.post_large_image = item.goods_image;
              item.post_medium_image = item.goods_image;
            } 
          })
        }
        
        self.setData({
          articlesList: self.data.articlesList.concat(res.map(function (item) {
            count++;
            item["id"] = item.id;
            item["date"] = item.date;
            var titleRendered = { "rendered": item.title.rendered };
            item["title"] = titleRendered;
            item["pageviews"] = item.pageviews;
            item["like_count"] = item.like_count;
            item["post_large_image"] = item.post_large_image;
            item["post_medium_image"] = item.post_medium_image;
            return item;
          }))
        })
      });

    }
    else if (mytype == 'mypraises') {
      self.setData({
        readLogs: [],
        navigationBarTitle: '我的鼓励'
      });
      var data = {};
      data.userId = self.data.userSession.userId;
      data.sessionId = self.data.userSession.sessionId;
      API.getMyPrainses(data).then(res => {
        self.setData({
          articlesList: self.data.articlesList.concat(res.map(function (item) {
            count++;
            item["id"] = item.id;
            item["date"] = item.date;
            var titleRendered = { "rendered": item.title.rendered };
            item["title"] = titleRendered;
            item["pageviews"] = item.pageviews;
            item["like_count"] = item.like_count;
            item["post_large_image"] = item.post_large_image;
            item["post_medium_image"] = item.post_medium_image;
            return item;
          }))
        })
      });

    }


  }
})