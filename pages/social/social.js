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


const pageCount = config.getPageCount;
const authorPageCount = 5;
const authorListPageCount = 20;
var app = getApp();


const backgroundAudioManager = wx.getBackgroundAudioManager();



Page({
  data: {
    title: '动态',
    topicsList: [],
    authorTopicsList: [],
    isLastPage: false,
    isError: false,
    isLoading: false,
    isPull: false,
    page: 1,
    authorPage: 1,
    authorlistPage: 1,
    isLastAuthorPage: false,
    isLastAuthorListPage: false,
    forumId: '0',
    currentColumn: 0,
    forums: [],
    forum: {},
    copyright: app.globalData.copyright,
    listStyle: '',
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    shareTitle: config.getWebsiteName + '-动态',
    pageTitle: '动态',
    showAddbtn: false,
    displayPostimage: true,
    displayInputContent: false,
    focus: false,
    placeholder: "说点什么...",
    toUserId: "",
    toFormId: "",
    commentdate: "",
    content: "",
    default_forum_id: 0,
    inputContentValue: '',
    isPlaying: 0,
    dataId: 0,

    topiclistAdId: "",
    topiclistAd: "",
    topiclistAdEvery: 0,
    topicListAdsuccess: true,

    authorList: [],


    curActiveKey: "one",
    oneTabOPen: true,
    twoTabOpen: false,
    fourTabOPen: false,

    isOneTabOPened: false,
    isTwoTabOpened: false,
    isFourTabOPened: false


  },
  onLoad: function (e) {
    var self = this;
    var systemInfo = wx.getSystemInfoSync()
    var screenRatio = 750 / systemInfo.windowWidth;
    self.setData({
      screenRatio: screenRatio,
      oneTabOPen: true,
      isOneTabOPened: true
    })
    wx.setNavigationBarTitle({ title: self.data.pageTitle });
    Auth.setUserMemberInfoData(self);
    Auth.checkLogin(self);
    this.loadBBForums();
    backgroundAudioManager.onEnded(function () {
      self.setData({
        isPlaying: 0
      })
    })

  },

  openmap: function (e) {
    var self = this;
    var lat = Number(e.currentTarget.dataset.lat);
    var lng = Number(e.currentTarget.dataset.lng);
    var address = e.currentTarget.dataset.address;
    console.log(self.data.latitude);
    var lati = Number(self.data.thislatitude);
    var long = Number(self.data.thislongitude);
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      scale: 10,
      name: address,
    })

  },
  openweizhi: function (e) {
    var url = '../socialmap/socialmap';
    wx.navigateTo({
      url: url
    })

  },
  onShow: function (options) {
    let self = this;
    Auth.setUserMemberInfoData(self);
  },

  onReady: function () {
    let self = this;
    Auth.setUserMemberInfoData(self);
    Auth.checkSession(app, API, this, 'isLoginLater', util);
    wx.setNavigationBarTitle({ title: this.data.pageTitle });

  },
  //切换标签
  changeTabs: function (e) {
    var self = this;
    var curActiveKey = e.detail.activeKey;
    var oneTabOPen = self.data.oneTabOPen;
    var twoTabOpen = self.data.twoTabOpen;
    var fourTabOPen = self.data.fourTabOPen;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var isOneTabOPened = self.data.isOneTabOPened;
    var isTwoTabOpened = self.data.isTwoTabOpened;
    var isFourTabOPened = self.data.isFourTabOPened;
    var args = {};
    self.setData({ curActiveKey: curActiveKey });
    if (curActiveKey == 'one') {
      self.setData({
        twoTabOpen: false,
        oneTabOPen: true,
        threeTabOpen: false
      });
      if (isOneTabOPened) {
        self.setData({
          page: 1,
          isLastPage: false
        });
        self.loadBBForums();
      }
    }
    else if (curActiveKey == 'two') {
      if (!isTwoTabOpened) {
        self.loadMyfollowAuthorTopics();
        self.setData({ isTwoTabOpened: true })

      }
      else {
        args.authorPage = 1;
        args.per_page = authorPageCount;
        args.userId = userId;
        args.sessionId = sessionId;
        var authorTopicsList = [];
        self.setData({ authorTopicsList: authorTopicsList, isLastAuthorPage: false });
        Adapter.loadMyfollowAuthorTopics(args, self, API);
      }
      self.setData({
        twoTabOpen: true,
        oneTabOPen: false,
        threeTabOpen: false
      });

    }
    else if (curActiveKey == 'four') {
      if (!isFourTabOPened) {
        self.loadAuthorList();
        self.setData({ isFourTabOPened: true })

      }
      else {
        args.authorlistPage = 1;
        args.per_page = authorListPageCount;
        args.userId = userId;
        args.sessionId = sessionId;
        self.setData({ isLastAuthorListPage: false, authorList: [] })
        Adapter.loadAuthorList(args, self, API);
      }
      self.setData({
        twoTabOpen: false,
        oneTabOPen: false,
        threeTabOpen: true
      });
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    var self = this;
    var curActiveKey = self.data.curActiveKey;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var args = {};
    if (curActiveKey == 'one') {
      self.setData({
        page: 1,
        isLastPage: false
      });
      self.loadBBForums();
    }
    else if (curActiveKey == 'two') {
      args.authorPage = 1;
      args.per_page = authorPageCount;
      args.userId = userId;
      args.sessionId = sessionId;
      var authorTopicsList = [];
      self.setData({ authorTopicsList: authorTopicsList, isLastAuthorPage: false });
      Adapter.loadMyfollowAuthorTopics(args, self, API);
    }
    else if (curActiveKey == 'four') {
      args.authorlistPage = 1;
      args.per_page = authorListPageCount;
      args.userId = userId;
      args.sessionId = sessionId;
      self.setData({ isLastAuthorListPage: false, authorList: [] })
      Adapter.loadAuthorList(args, self, API);
    }
  },
  // 点击圈子去圈子列表页
  toQuanziList(e) {
    // console.log(e)
    var id = e.currentTarget.dataset.forumid;
    var url = '../sociallist/sociallist?forumId=' + id;
    wx.navigateTo({
      url: url
    })
  },
  openSearch: function () {
    var url = '../search/search?postype=topic';
    wx.navigateTo({
      url: url
    })
  },
  loadBBForums: function () {
    var self = this;
    var forums = [];

    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;

    self.setData({
      isPull: true,
      isError: false,
      topicsList: [],
      forums: []

    })
    API.getBBForums().then(res => {
      //console.log(res)
      var raw_enable_newtopic_option = '0';
      var raw_enable_newtopic_integral = 0;
      var default_forum_id = 0;
      var raw_default_videoposter_image = "";
      if (res.length && res.length > 0) {
        forums = forums.concat(res);
        self.setData({
          forums: forums
        });
        default_forum_id = parseInt(forums[0].default_forum_id);
        raw_default_videoposter_image = forums[0].raw_default_videoposter_image;
        raw_enable_newtopic_option = forums[0].raw_enable_newtopic_option;
        raw_enable_newtopic_integral = parseInt(forums[0].raw_enable_newtopic_integral);

        let data = {};
        data.page = self.data.page;
        data.pageCount = pageCount;

        data.forumId = "0";
        data.isCategory = true;
        data.userId = userId;
        data.sessionId = sessionId;
        Adapter.loadBBTopics(data, self, API);

        if (raw_enable_newtopic_option == "1") {
          self.setData({ showAddbtn: true, forumId: '0', default_forum_id: default_forum_id, raw_default_videoposter_image: raw_default_videoposter_image });

        }
        else {
          self.setData({ showAddbtn: false });
        }

      }
      else {
        wx.showToast({
          title: res,
          duration: 1500
        })
      }
    }).catch(err => {
    });
    wx.stopPullDownRefresh()
  },

  loadAuthorList: function (e) {

    let data = {};
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;

    data.userId = userId;
    data.sessionId = sessionId;
    data.per_page = authorListPageCount;
    data.authorlistPage = 1
    Adapter.loadAuthorList(data, self, API);

  },
  redictAuthorDetail: function (e) {
    var authorId = e.currentTarget.id;
    var url = '../author/author?userid=' + authorId + '&postype=topic';
    wx.navigateTo({
      url: url
    })

  },
  topiclistAdbinderror: function (e) {
    var self = this;
    if (e.errCode) {
      self.setData({ topicListAdsuccess: false })

    }

  },

  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, '0');

  },

  onShareAppMessage: function () {
    var shareTitle = this.data.shareTitle;
    return {
      title: shareTitle,
      path: 'pages/social/social',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
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

  onReachBottom: function () {
    let args = {};
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var oneTabOPen = self.data.oneTabOPen;
    var twoTabOpen = self.data.twoTabOpen;
    var fourTabOpen = self.data.fourTabOpen;

    if (oneTabOPen && !self.data.isLastPage) {
      args.page = self.data.page + 1;
      args.forumId = self.data.forumId;
      args.pageCount = pageCount;
      args.isCategory = true;
      args.userId = userId;
      args.sessionId = sessionId;

      self.setData({ isLoading: true }); self
      Adapter.loadBBTopics(args, this, API);
      self.setData({ isLoading: false });
    }
    else if (twoTabOpen && !self.data.isLastAuthorPage) {

      args.authorPage = self.data.authorPage + 1;
      args.per_page = authorPageCount;
      args.userId = userId;
      args.sessionId = sessionId;
      self.setData({ isLoading: true }); self
      Adapter.loadMyfollowAuthorTopics(args, self, API);
      self.setData({ isLoading: false });
    }
    else if (fourTabOpen && !self.data.isLastAuthorListPage) {

      args.authorlistPage = self.data.authorlistPage + 1;
      args.per_page = authorListPageCount;
      args.userId = userId;
      args.sessionId = sessionId;
      self.setData({ isLoading: true }); self
      Adapter.loadAuthorList(args, self, API);
      self.setData({ isLoading: false });

    }
    else {
      console.log("已经最后一页了")

    }

  },
  loadMyfollowAuthorTopics: function (e) {
    let data = {};
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    data.authorPage = self.data.authorPage;
    data.per_page = authorPageCount;
    data.userId = userId;
    data.sessionId = sessionId;
    Adapter.loadMyfollowAuthorTopics(data, self, API);

  },
  sendPost: function () {// 跳转
    var self = this
    if (!self.data.userSession.sessionId) {

      self.setData({ isLoginPopup: true });

    }
    else {
      var forumId = self.data.default_forum_id;
      var raw_default_videoposter_image = self.data.raw_default_videoposter_image;
      this.setData({
        displayPostimage: true,
        displayInputContent: false

      })
      var url = '../../pages/postopic/postopic?forumid=' + forumId + '&videoposter=' + raw_default_videoposter_image;
      wx.navigateTo({
        url: url
      })
    }
  },
  //显示输入框
  showCommentInputDialog: function () {
    var self = this
    if (!self.data.userSession.sessionId) {

      self.setData({ isLoginPopup: true });

    }
    else {
      this.setData({
        displayPostimage: false,
        displayInputContent: true
      })
    }

  },
  postLike: function (e) {
    var self = this;
    var id = e.currentTarget.id;
    var listType = e.currentTarget.dataset.listtype;
    if (!self.data.userSession.sessionId) {

      self.setData({ isLoginPopup: true });

    }
    else {
      Adapter.postLike(id, self, app, API, listType); //"topicList"

    }
  },
  //隐藏输入框
  hiddenCommentInputDialog: function () {
    this.setData({
      displayPostimage: true,
      displayInputContent: false
    })
  },
  closeLoginPopup() {
    this.setData({ isLoginPopup: false });
  },
  openLoginPopup() {
    this.setData({ isLoginPopup: true });
  },
  previewImage: function (e) {
    var imgallsrc = e.currentTarget.dataset.imgallsrc;
    var imgsrc = e.currentTarget.dataset.imgsrc;
    wx.previewImage({
      current: imgsrc,
      urls: imgallsrc,
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

  },
  followAuthor: function (e) {
    var self = this;

    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var flag = e.currentTarget.dataset.follow;
    var authorid = parseInt(e.currentTarget.dataset.authorid);
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
  zanAuthor: function (e) {
    var zanimage = e.currentTarget.dataset.zanimage;
    wx.previewImage({
      current: zanimage,
      urls: [zanimage]
    });
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
              self.loadBBForums();
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            }

          })

        } else if (res.cancel) {


        }
      }
    })
  }
})

