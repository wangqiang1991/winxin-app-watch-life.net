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

  /**
   * 页面的初始数据
   */
  data: {
    tagsList: [],
    isPull: false,
    page: 1,
    isLastPage: false,
    isLoading: false,
    copyright: app.globalData.copyright,
    shareTitle: config.getWebsiteName,
    pageTitle: config.getWebsiteName + '-标签'

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var args = {};
    var self = this;
    args.pageCount = pageCount;
    args.page = 1;

    Adapter.loadTags(args, self, API);
    wx.setNavigationBarTitle({
      title: '热门标签'
    })
  },

  redictTaglist: function(e) {
    var id = e.currentTarget.id;
    var name = e.currentTarget.dataset.name;
    var url = '../list/list?tag=' + id + "&tagname=" + name;
    wx.navigateTo({
      url: url
    })

  },  

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

    var args = {};
    var self = this;
    self.setData({isPull:true,tagsList:[]})
    args.pageCount = pageCount;
    args.page = 1;
    Adapter.loadTags(args, self, API);

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let args = {};
    if (!this.data.isLastPage) {
      args.page = this.data.page + 1;
      args.pageCount = pageCount;
      this.setData({
        isLoading: true
      });
      Adapter.loadTags(args, this, API);
      this.setData({
        isLoading: false
      });
    } else {
      console.log("最后一页了");

    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: this.data.shareTitle,
      path: '/pages/postags/postags'
    }
  }
})