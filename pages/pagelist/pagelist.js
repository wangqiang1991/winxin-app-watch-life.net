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
    self.fetchPostsData();
    Auth.checkLogin(self);

  },

  onReady: function () {
    var self = this;
    // 动态设置页面标题
    wx.setNavigationBarTitle({
      title: "页面列表"
    })
  },

  // 跳转至查看文章详情
  redictDetail: function (e) {
    var id = e.currentTarget.id;
    var posttype = e.currentTarget.dataset.posttype ? e.currentTarget.dataset.posttype : "post";
    var url = '../page/page?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  onShareAppMessage: function () {
    var title =  config.getWebsiteName + "的页面列表";
    var path = "pages/pagelist/pagelist";
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
  fetchPostsData: function () {
    self = this;
    var data={};
    data.pageCount=100;
    data.page=1;    
    API.getPages(data).then(res => {
        self.setData({
        articlesList: self.data.articlesList.concat(res.map(function (item) {
          // count++;
          // item["id"] = item.id;
          // item["date"] = item.date;
          // var titleRendered = { "rendered": item.title.rendered };
          // item["title"] = titleRendered;
          // item["pageviews"] = item.pageviews;
          // item["like_count"] = item.like_count;
          // item["post_large_image"] = item.post_large_image;
          // item["post_medium_image"] = item.post_medium_image;
          return item;
        }))
      })
    });

  }
})