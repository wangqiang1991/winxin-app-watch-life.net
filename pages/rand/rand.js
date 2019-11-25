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
    title: '文章列表',
    postsList: {},
    pagesList: {},
    categoriesList: {},
    postsShowSwiperList: {},
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    categoriesName: '',
    categoriesImage: "",
    showerror: "none",
    isCategoryPage: "none",
    isSearchPage: "none",
    showallDisplay: "block",
    displaySwiper: "block",
    floatDisplay: "none",
    searchKey: "",
    listStyle: config.getListStyle,
    copyright: app.globalData.copyright,
    pageTitle: '随机文章',
    isShow: false,

  },
  onShareAppMessage: function() {
    var title =  config.getWebsiteName + "”的随机文章。";
    var path = "pages/rand/rand";
    return {
      title: title,
      path: path,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  onShow: function() {
    wx.setStorageSync('openLinkCount', 0);
  },

  refresh: function() {
    this.fetchPostsData();
  },
  onReady: function() {
    this.fetchPostsData();
  },

  onLoad: function(options) {
    var self = this;
    this.setData({
      listStyle: wx.getStorageSync('listStyle')
    });
    wx.setNavigationBarTitle({
      title: this.data.pageTitle
    });
  },
  //获取文章列表数据
  fetchPostsData: function() {
    var self = this;
    self.setData({
      articlesList: []
    });
    API.getRandPosts().then(res => {
      self.setData({
        showallDisplay: "block",
        floatDisplay: "block",
        articlesList: self.data.articlesList.concat(res.map(function(item) {
          var strdate = item.date
          if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
            item.post_thumbnail_image = '../../images/uploads/default_image.jpg';
          }
          item.post_date = util.cutstr(strdate, 10, 1);
          return item;
        })),

      });
      wx.stopPullDownRefresh();
    })

  },
  onPullDownRefresh: function() {

    this.fetchPostsData();
  },
  onHide: function() {
    this.isShow = false;
  },
  // 跳转至查看文章详情
  redictDetail: function(e) {
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  }
})