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
const util = require('../../utils/util.js');
const Adapter = require('../../utils/adapter.js')
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'
const app = getApp()
const pageCount = config.getPageCount;

const backgroundAudioManager = wx.getBackgroundAudioManager();

const options = {
  data: {
    isArticlesList: true,
    isSearch: false,
    isTag: false,
    tagname: '',
    isCategory: false,
    forumId: "",
    searchKey: "",
    topicsList: [],
    categoryImage: "",
    isLastPage: false,
    isPull: false,
    page: 1,
    shareTitle: '',
    pageTitle: '',
    tag: '',
    listStyle: config.getListStyle,
    category: [],
    categoryImage: "",
    showAddbtn: false,

    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    topicListAdsuccess: true,
    topiclistAdId: "",
    topiclistAd: "",
    topiclistAdEvery: 0,

    isPlaying: 0,
    dataId: 0,
  },
  onLoad: function (options) {
    let args = {};
    var self = this;
    backgroundAudioManager.onEnded(function(){
      self.setData({
        isPlaying: 0
      })
    })

    Auth.setUserMemberInfoData(self);
    Auth.checkLogin(self);
    args.page = this.data.page;
    args.pageCount = pageCount;
    if (options.searchKey && options.searchKey != '') {
      args.isSearch = true;
      args.isCategory = false;
      args.searchKey = options.searchKey;
      args.istag = false;
      this.setData({
        searchKey: options.searchKey,
        isSearch: true,
        isCategory: false,
        istag: false,
        pageTitle: "动态搜索",
        shareTitle: config.getWebsiteName + "-动态搜索"
      });
    }
    if (options.forumId && options.forumId != '') {
      args.isSearch = false;
      args.isCategory = true;
      args.isTag = false;
      args.forumId = options.forumId;
      this.setData({
        isSearch: false,
        isCategory: true,
        isTag: false,
        forumId: options.forumId,
        pageTitle: "动态圈子",
        shareTitle: "动态圈子"
      });
    }

    if (options.tag && options.tag != '') {
      args.isSearch = false;
      args.isCategory = false;
      args.isTag = true;
      args.tag = options.tag;
      this.setData({
        isSearch: false,
        isCategory: false,
        isTag: true,
        tag: options.tag,
        tagname: options.tagname,
        pageTitle: "#" + options.tagname,
        shareTitle: options.tagname + "标签的话题"
      });
      //this.loadArticles(args,);
    }
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    args.userId = userId;
    args.sessionId = sessionId;
    Adapter.loadBBTopics(args, this, API);
  },

  followAuthor: function (e) {
    var self = this;

    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var flag = e.currentTarget.dataset.follow;
    var authorid = e.currentTarget.dataset.authorid
    var listType = e.currentTarget.dataset.listtype;
    if (!sessionId || !userId) {
      self.setData({ isLoginPopup: true });
      return;
    }

    var args = {};
    args.userId = userId;
    args.sessionId = sessionId;
    args.id = authorid
    args.flag = flag;
    args.listType = listType;
    Adapter.userFollow(API, self, args)

  },
  postLike: function (e) {
    var self = this;
    var id = e.currentTarget.id;
    if (!self.data.userSession.sessionId) {

      self.setData({ isLoginPopup: true });

    }
    else {
      Adapter.postLike(id, self, app, API, "topicList");

    }
  },
  deleteTopic: function (e) {
    var self = this;
    var id = e.currentTarget.id;
    var data = {};
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    var deletetype = 'publishStatus';
    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    data.id = id;
    data.userid = userId;
    data.sessionid = sessionId;
    data.deletetype = deletetype;
    var posttype = 'topic'
    wx.lin.showDialog({
      type: "confirm",
      title: "标题",
      showTitle: false,
      confirmText: "确认",
      confirmColor: "#f60",
      content: "确认删除？",
      success: (res) => {
        if (res.confirm) {
          API.deleteTopicById(data).then(res => {
            if (res.code == 'error') {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            }
            else {

              self.setData({
                page: 1,
                isLastPage: false
              });

              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
              self.onPullDownRefresh();
            }

          })

        } else if (res.cancel) {


        }
      }
    })
  },

  sendPost: function () {// 跳转
    var self = this
    if (!self.data.userSession.sessionId) {

      self.setData({ isLoginPopup: true });

    }
    else {
      var forumId = self.data.forumId == 0 ? self.data.default_forum_id : self.data.forumId;
      var raw_default_videoposter_image = self.data.raw_default_videoposter_image;
      //   this.setData({
      //     displayPostimage: true,
      //     displayInputContent: false

      //   })
      var url = '../../pages/postopic/postopic?forumid=' + forumId + '&videoposter=' + raw_default_videoposter_image;
      wx.navigateTo({
        url: url
      })
    }
  },

  openmap: function (e) {
    var self = this;
    var lat = Number(e.currentTarget.dataset.lat);
    var lng = Number(e.currentTarget.dataset.lng);
    var address = e.currentTarget.dataset.address;
    //console.log(self.data.latitude);
    var lati = Number(self.data.thislatitude);
    var long = Number(self.data.thislongitude);
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      scale: 10,
      name: address,
    })

  },

  onShow: function () {

    this.setData({ listStyle: wx.getStorageSync('listStyle') });

  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: this.data.category.name || this.data.pageTitle });
  },

  onUnload: function () {
    // this.removeArticleChange();
  },

  onPullDownRefresh: function () {
    this.setData({
      isPull: true,
      isError: false,
      isArticlesList: false,
      topicsList: []
    })
    let args = {};
    args.page = 1;
    args.pageCount = pageCount;
    if (this.data.isSearch) {
      args.isSearch = true;
      args.isCategory = false;
      args.isTag = false;
      args.searchKey = this.data.searchKey;
    }
    if (this.data.isCategory) {
      args.isSearch = false;
      args.isCategory = true;
      args.isTag = false;
      args.forumId = this.data.forumId;
    }
    if (this.data.isTag) {
      args.isSearch = false;
      args.isCategory = false;
      args.isTag = true;
      args.tag = this.data.tag;
    }
    var sessionId = this.data.userSession.sessionId;
    var userId = this.data.userSession.userId;
    args.userId = userId;
    args.sessionId = sessionId;
    Adapter.loadBBTopics(args, this, API);
  },
  onReachBottom: function () {
    let args = {};
    var self = this;
    args.pageCount = pageCount;
    if (!this.data.isLastPage) {
      args.page = this.data.page + 1;
      if (this.data.isSearch) {
        args.isSearch = true;
        args.isCategory = false;
        args.isTag = false;
        args.searchKey = this.data.searchKey;
      }
      if (this.data.isCategory) {
        args.isSearch = false;
        args.isCategory = true;
        args.isTag = false;
        args.forumId = this.data.forumId;
      }
      if (this.data.isTag) {
        args.isSearch = false;
        args.isCategory = false;
        args.isTag = true
        args.tag = this.data.tag;
      }
      this.setData({
        page: args.page
      });
      var sessionId = self.data.userSession.sessionId;
      var userId = self.data.userSession.userId;
      args.userId = userId;
      args.sessionId = sessionId;
      Adapter.loadBBTopics(args, this, API);
    }
    else {
      console.log("最后一页了");
      // wx.showToast({
      //     title: '没有更多内容',
      //     mask: false,
      //     duration: 1000
      // });
    }
  },

  // 跳转至查看文章详情
  TopicDetail: function (e) {
    //console.log(url);
    var sid = e.currentTarget.id,
      url = '../topicarticle/topicarticle?id=' + sid;
    wx.navigateTo({
      url: url
    })
  },
  onShareAppMessage: function () {
    var path = '/pages/sociallist/sociallist';
    var shareTitle = this.data.shareTitle;


    if (this.data.isSearch) {
      path += "?searchKey=" + this.data.searchKey;

    }
    if (this.data.isCategory) {
      path += "?forumId=" + this.data.forumId;
      shareTitle =  this.data.category.name + "类的话题";

    }
    if (this.data.isTag) {
      shareTitle =  this.data.tagname + "标签的话题";
      path += "?tag=" + this.data.tag + "&tagname=" + this.data.tagname;

    }

    return {
      title: shareTitle,
      path: path
    }
  },

  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  formSubmit: function (e) {
    var url = '../sociallist/sociallist'
    var key = '';
    if (e.currentTarget.id == "search-input") {
      key = e.detail.value;
    }
    else {
      key = e.detail.value.input;
    }
    if (key != '') {
      url = url + '?searchKey=' + key;
      wx.redirectTo({
        url: url,
      })
    }
    else {
      wx.showModal({
        title: '提示',
        content: '请输入搜索内容',
        showCancel: false,
      });


    }
  },

  //获取分类列表
  LoadCategory: function (args) {
    API.getBBForumsById(args).then(res => {
      var catImage = "";
      if (typeof (res.category_thumbnail_image) == "undefined" || res.category_thumbnail_image == "") {
        catImage = "../../images/uploads/default_image.jpg";
      }
      else {
        catImage = res.category_thumbnail_image;
      }
      this.setData({
        category: res,
        categoryImage: catImage
      });
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: res.name || res.title
      })
    })
  },

  //--------------------------------------
  removeArticleChange: function () {
    //NC.removeNotification("articleChange", this)
  },
  previewImage: function (e) {
    var imgallsrc = e.currentTarget.dataset.imgallsrc;
    var imgsrc = e.currentTarget.dataset.imgsrc;
    wx.previewImage({
      current: imgsrc,
      urls: imgallsrc,
    });
  },
  closeLoginPopup() {
    this.setData({ isLoginPopup: false });
  },
  openLoginPopup() {
    this.setData({ isLoginPopup: true });
  },
  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, '0');

  },
  zanAuthor: function (e) {
    var zanimage = e.currentTarget.dataset.zanimage;
    wx.previewImage({
      current: zanimage,
      urls: [zanimage]
    });
  },

  playRemoteAudio: function (e) {
    var self = this;
    var audioUrl = e.currentTarget.dataset.audiourl;
    var dataId = e.currentTarget.dataset.id;
    backgroundAudioManager.src = audioUrl;
    backgroundAudioManager.title = "录音";
    self.setData(
      {
        isPlaying: 1,
        dataId: dataId
      }
    )

  },
  stopRemoteAudio: function (e) {
    backgroundAudioManager.stop();
    var dataId = e.currentTarget.dataset.id;
    this.setData(
      {
        isPlaying: 0,
        dataId: dataId
      }
    )
  },
  open_link_doc: function (e) {
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

  }
}
//-------------------------------------------------
Page(options)

