/*
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

const options = {
  data: {
    tabType:1,  //1 最新所有 2热门原料 3其他
    showAddBtnType:false,
    isArticlesList: true,
    isLastPage: false,
    isLoading: false,
    isCategory: false,
    isError: false,
    isPull: false,
    isWiper: false,
    isTags: false,
    categories: '',
    swiperArticles: [],
    articlesList: [],
    billboardList:[],
    page: 1,
    shareTitle: config.getWebsiteName,
    pageTitle: config.getWebsiteName,
    copyright: app.globalData.copyright,
    listStyle: config.getListStyle,
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    topNav: [],
    columns: [],
    isColumnPannelOpen: !1,
    columnsSelected: [],
    columnsUnselected: [],
    currentMovingIndex: -1,
    moveToIndex: -1,
    columnItemHeight: 60,
    isInEdit: !1,
    showRefreshTipBtn: !1,
    scrollTop: [],
    windowHeight: 0,
    windowWidth: 0,
    tagsList: [],
    commentsList: [],
    homepageAd:'0',
    homepageAdId:'',
    homepageAdsuccess:true,
    listAdsuccess:true,
    logo:config.getLogo,
    homepageMediaDisplay:false,
    isFirst: false, // 是否第一次打开,
   
    scopeSubscribeMessage:'',
    isLoginPopup: false,

  },

  pannelData: {
    columns: [],
    needRefreshAfterClose: !1,
    touchX: 0,
    touchY: 0
  },
  onLoad: function () {
    var self = this;
    var args = {};
    args.pageCount = pageCount;
    args.cateType = 'all';
    Adapter.loadCategories(args, self, API, true);
    // args = {};
    // args.pageCount = 6;
    // args.page = 1;
    // Adapter.loadTags(args, self, API);
    var currentColumn = 0;
    self.setData({
      currentColumn: currentColumn,
      categoryId: '0'
    });
    self.loadSwiper();
    var listStyle=wx.getStorageSync('listStyle');
    if(!listStyle)
    {
      listStyle= config.getListStyle;
    }

    self.setData({
      topNav: config.getIndexNav,
      listStyle:listStyle
    });
    Auth.setUserMemberInfoData(self);
    Auth.checkLogin(self);

    self.loadBillboard();

    // 判断用户是不是第一次打开，弹出添加到我的小程序提示
    var isFirstStorage = wx.getStorageSync('isFirst');
    // console.log(isFirstStorage);
    if (!isFirstStorage) {
      self.setData({
        isFirst: true
      });
      wx.setStorageSync('isFirst', 'no')
      // console.log(wx.getStorageSync('isFirst'));
      setTimeout(function () {
        self.setData({
          isFirst: false
        });
      }, 5000)
    }

    // 获取最新评论数据
    //self.fetchCommentsData();
  },
  onShow: function () {
    let self = this;    
    var showAddbtn = false;
    wx.setStorageSync('openLinkCount', 0);
    if (parseInt(self.data.memberUserInfo.level) > 0 && self.data.currentColumn != 0) {
      showAddbtn = true;

    }
    self.setData({
      showAddbtn: showAddbtn
    });
    wx.getSystemInfo({
      success: function (t) {
        self.setData({
          windowHeight: t.windowHeight,
          windowWidth: t.windowWidth

        })
      }
    })
   
    var nowDate = new Date();
    nowDate = nowDate.getFullYear()+"-"+(nowDate.getMonth() + 1)+'-'+nowDate.getDate();
    nowDate= new Date(nowDate).getTime();   
    var _openAdLogs =wx.getStorageSync('openAdLogs')|| [];
    var openAdLogs=[];
    _openAdLogs.map(function (log) {   
      if(new Date(log["date"]).getTime() >= nowDate)
      {
        openAdLogs.unshift(log);
      }
    
    })
    
    wx.setStorageSync('openAdLogs',openAdLogs);
    console.log(wx.getStorageSync('openAdLogs'));

    Auth.setUserMemberInfoData(self);


  },
  onReady: function () {
    let args = {};
    wx.setNavigationBarTitle({
      title: this.data.pageTitle
    });

  },
  onPullDownRefresh: function () {
    var listStyle=wx.getStorageSync('listStyle')
    if(!listStyle)
    {
      listStyle=config.getListStyle;
    }
    this.setData({
      isPull: true,
      isError: false,
      isWiper: false,
      isArticlesList: false,
      isLastPage: false,
      swiperArticles: [],
      articlesList: [],
      listStyle:listStyle,
      homepageAdsuccess:true,
      listAdsuccess:true
    })
    let args = {};
    if (this.data.currentColumn == 0) {
      this.loadSwiper();
      args.pageCount = pageCount;
      Adapter.loadCategories(args, this, API,true,true);
    } else {
      args = {};
      args.page = 1;
      args.pageCount = pageCount;
      args.isCategory = this.data.isCategory;
      args.categoryId = this.data.categoryId;
      args.categoryIds = this.data.categoryIds;
      if (this.data.tabType == 1) {
        Adapter.loadNewArticles(args, this, API, true);
      } else if (this.data.tabType == 2) {
        Adapter.loadGoodsList(args, this, API, true);
      } else {
        Adapter.loadArticles(args, this, API, true);
      }
      
    }
   // this.fetchCommentsData();
    Auth.setUserMemberInfoData(this);
  },
  onReachBottom: function () {
    let args = {};
    if (!this.data.isLastPage) {
      args.page = this.data.page + 1;
      args.pageCount = pageCount;
      args.isCategory = this.data.isCategory;
      args.categoryId = this.data.categoryId;
      args.categoryIds = this.data.categoryIds;
      this.setData({
        isLoading: true
      });
      if(this.data.tabType == 1) {
        Adapter.loadNewArticles(args, this, API);
      } else if(this.data.tabType == 2) {
        Adapter.loadGoodsList(args, this, API);
      } else {
        Adapter.loadArticles(args, this, API);
      }
      
      this.setData({
        isLoading: false
      });
    } else {
      console.log("最后一页了");

    }
  },
  onShareAppMessage: function () {
    return {
      title: this.data.shareTitle,
      path: '/pages/index/index',
      imageUrl:this.data.logo
    }
  },
  //--------------------------------------
  // 轮播图片
  loadSwiper: function () {
    const self = this;
    API.getSwiperPosts().then(response => {      
      if (response.posts.length > 0) {
        self.setData({
          swiperArticles: self.data.swiperArticles.concat(response.posts.map(function (item) {
            return item;
          })),
          isWiper: true,          
          homepageAd:response.homepageAd,
          homepageAdId:response.homepageAdId,
          homepageMediaDisplay:response.homepageMediaDisplay=='1'?true:false
        });
      } else {
        self.setData({
          isWiper: false
        });
      }
    }).catch(err => {
      this.setData({
        isLoading: false,
        isPull: false,
        isWiper: false
      })
      wx.stopPullDownRefresh()
    })
  },
  //获取最新评论数据
  fetchCommentsData: function () {
    var self = this;
    // wx.showLoading({
    //   title: '正在加载',
    //   mask: true
    // });

    let args = {};
    // 设置最新评论显示的条数
    args.limit = 2;
    args.page = 1;
    args.flag = "newcomment"
    self.setData({commentsList:[]})
    Adapter.loadComments(args, this, API);
  },
  // 点击评论跳转至查看文章详情
  commentRedictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.dataset.postid;
    var url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  //首页图标跳转
  onNavRedirect: function (e) {
    var redicttype = e.currentTarget.dataset.redicttype;
    var url = e.currentTarget.dataset.url == null ? '' : e.currentTarget.dataset.url;
    var appid = e.currentTarget.dataset.appid == null ? '' : e.currentTarget.dataset.appid;
    var extraData = e.currentTarget.dataset.extraData == null ? '' : e.currentTarget.dataset.extraData;
    if (redicttype == 'apppage') { //跳转到小程序内部页面         
      wx.navigateTo({
        url: url
      })
    } else if (redicttype == 'webpage') //跳转到web-view内嵌的页面
    {
      url = '../webpage/webpage?url=' + url;
      wx.navigateTo({
        url: url
      })
    }

  },
  // 跳转至查看文章详情
  redictDetail: function (e) {
    console.log(e)
    Adapter.redictDetail(e, "post");
  },

  loadBillboard: function () {
    var data = {};
    data.pageCount = 5;
    data.page = 1;
    data.listName = 'billboardList';
    data.isCategory=true;
    var billboardList = ["test","eeee"];
    
    API.getPosts(data).then(res => {
      if (res.length && res.length > 0) {
        billboardList = res;
        this.setData({
          billboardList: billboardList
        });

      }

    })

  },
  //--------------------------------------
  removeArticleChange: function () {
    // NC.removeNotification("articleChange", this)
  },
  addArticle: function () {
    let flag = this.data.showAddBtnType;
    this.setData({
      showAddBtnType: !flag
    })
    // var url = '../addarticle/addarticle';
    // wx.navigateTo({
    //   url: url
    // })
  },
  //添加文章页面
  gotoAddArticle: function() {
    var url = '../addarticle/addarticle';
    wx.navigateTo({
      url: url
    })
  },
  //添加商品页面
  gotoAddGoods: function () {
    var url = '../addgoods/addgoods';
    wx.navigateTo({
      url: url
    })
  },
  onHide:function() {
    this.setData({
      showAddBtnType: false
    })
  },
  openSearch: function () {
    var url = '../search/search?postype=post';
    wx.navigateTo({
      url: url
    })

  },
  //媒体中心
 goimage: function () {
   var url = '/pages/photolist/photolist';
    wx.navigateTo({
      url: url
    })
  },
 govideo: function () {
   var url = '/pages/videolist/videolist';
    wx.navigateTo({
      url: url
    })
  },
  gofile: function () {
    var url = '/pages/filelist/filelist';
    wx.navigateTo({
      url: url
    })
  },
  goaudio: function () {
    var url = '/pages/audiolist/audiolist';
    wx.navigateTo({
      url: url
    })
  },
  // 选择文章列表样式
  changeListStyle: function (e) {
    var listStyle = e.detail.value;
    wx.setStorageSync('listStyle', listStyle);
    this.setData({
      listStyle: listStyle
    });
    this.setData({
      isColumnPannelOpen: !this.data.isColumnPannelOpen
      // isInEdit: !1
    });
    
    // 如果选择的是瀑布流，重新请求下数据
    if (listStyle === "waterFlowArticle") {
      this.setData({
        articlesList: [],
        currentColumn:0
      })
      var self = this;
      var args = {};
      args.pageCount = pageCount;
      args.cateType = 'all';
      Adapter.loadCategories(args, self, API, true);
    }
  },

  openCustomPannel: function () {
    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : -1;
    if (this.data.isColumnPannelOpen && this.pannelData.needRefreshAfterClose) {

      this.setData({
        isColumnPannelOpen: !1,
        columns: this.data.columnsSelected.slice(0),
        currentColumn: -1 == e ? 0 : e,
        // columnSliders: [],
        // columnNews: [],
        // isInEdit: !1
      });
      this.pannelData.needRefreshAfterClose = !1;

    }
    //  this.getListData(!0, this.data.currentColumn), this.pannelData.needRefreshAfterClose = !1, 
    // this.saveColumnSortState()) 
    else {

      this.setData({
        isColumnPannelOpen: !this.data.isColumnPannelOpen,
        isInEdit: !this.data.isColumnPannelOpen && this.data.isInEdit,
        currentColumn: -1 == e ? this.data.currentColumn : e
      });

    }

    var showAddbtn = false;
    if (parseInt(this.data.memberUserInfo.level) > 0 && this.data.currentColumn != 0) {
      showAddbtn = true;

    }
    this.setData({
      showAddbtn: showAddbtn
    });


  },
  switchColumn: function (t) {
    var e = t.currentTarget.dataset.idx;
    this.setData({
      tabType:e+1
    })
    var categoryId = t.currentTarget.dataset.categoryid;
    var categoryIds = t.currentTarget.dataset.categoryids;
    var _categoryId = this.data.categoryId;
    if (_categoryId == categoryId) {
      return;
    }
    this.setData({
      isPull: true,
      isError: false,
      isWiper: false,
      isArticlesList: false,
      isLastPage: false,
      swiperArticles: [],
      articlesList: []
    })
    var args = {};
    args.page = 1;
    if (categoryId == '0') {
      wx.setNavigationBarTitle({
        title: this.data.pageTitle
      });
      this.loadSwiper();
    } else {
      wx.setNavigationBarTitle({
        //title: t.currentTarget.dataset.categorynames
        title: this.data.pageTitle
      });
    }
    args.categoryId = categoryId;
    args.categoryIds = categoryIds;
    args.isCategory = true;
    this.setData({
      currentColumn: e,
      isCategory: args.isCategory,
      categoryId: categoryId,
      categoryIds: categoryIds
    });
    var showAddbtn = false;
    if (parseInt(this.data.memberUserInfo.level) > 0 && this.data.currentColumn != 0) {
      showAddbtn = true;
    }
    this.setData({
      showAddbtn: showAddbtn
    });
    if (this.data.tabType == 1) {
      Adapter.loadNewArticles(args, this, API, true);
    } else if (this.data.tabType == 2) {
      Adapter.loadGoodsList(args, this, API, true);
    } else {
      Adapter.loadArticles(args, this, API, true);
    }
    
  },
  selectColumn: function (t) {
    var e = t.currentTarget.dataset.index;
    this.setData({
      tabType:e+1,
      isPull: true,
      isError: false,
      isWiper: false,
      isArticlesList: false,
      swiperArticles: [],
      articlesList: [],
      //listStyle: wx.getStorageSync()
    })
    //var e = t.currentTarget.dataset.idx;
    var categoryId = t.currentTarget.dataset.categoryid;
    var categoryIds = t.currentTarget.dataset.categoryids;

    // this.other.isSwitchColumn || e == this.data.currentColumn || (this.other.isSwitchColumn = !0, 
    // );
    var args = {};
    args.page = 1;
    if (categoryId == '0') {
      wx.setNavigationBarTitle({
        title: this.data.pageTitle
      });
      this.loadSwiper();

    } else {
      wx.setNavigationBarTitle({
        title: t.currentTarget.dataset.categorynames
      });
    }
    args.categoryId = categoryId;
    args.categoryIds = categoryIds;
    args.isCategory = true;
    this.setData({
      isCategory: true,
      categoryId: categoryId,
      categoryIds: categoryIds

    });
    this.openCustomPannel(t, e);

    if (this.data.tabType == 1) {
      Adapter.loadNewArticles(args, this, API);
    } else if (this.data.tabType == 2) {
      Adapter.loadGoodsList(args, this, API);
    } else {
      Adapter.loadArticles(args, this, API);
    }

  },
  openCustomPannel: function (t) {
    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : -1;
    if (this.data.isColumnPannelOpen && this.pannelData.needRefreshAfterClose) {
      this.setData({
        isColumnPannelOpen: !1,
        columns: this.data.columnsSelected.slice(0),
        currentColumn: -1 == e ? 0 : e,
        // columnSliders: [],
        // columnNews: [],
        // isInEdit: !1
      });
    }
    // , this.getListData(!0, this.data.currentColumn), this.pannelData.needRefreshAfterClose = !1, 
    // this.saveColumnSortState())
    else {
      this.setData({
        isColumnPannelOpen: !this.data.isColumnPannelOpen,
        //isInEdit: !this.data.isColumnPannelOpen && this.data.isInEdit,
        currentColumn: -1 == e ? this.data.currentColumn : e
      });

    }


  },
  columnItemTouchEnd: function (t) {
    if (!(this.data.currentMovingIndex <= 0)) {
      var e = this;
      e.pannelData.columns = [], e.setData({
        currentMovingIndex: -1,
        moveToIndex: -1
      });
    }
  },
  columnItemTouchStart: function (t) {
    var e = t.currentTarget.dataset.index;
    if (e > 0 && e < this.data.columnsSelected.length) {
      this.setData({
        currentMovingIndex: e,
        moveToIndex: e
      }), this.pannelData.columns = this.data.columnsSelected.slice(0);
      var n = this.px2Rpx(t.touches[0].pageX),
        a = this.px2Rpx(t.touches[0].pageY);
      this.pannelData.touchX = n, this.pannelData.touchY = a;
    }
  },
  homepageAdbinderror:function(e)
  {
    var self=this;
    if(e.errCode)
    {
      self.setData({homepageAdsuccess:false})
      
    }
  },
  homepageAdLoad:function(e)
  {
    this.setData({homepageAdsuccess:true})
  },
  homepageAdClose:function(e)
  {
    this.setData({homepageAdsuccess:false})
  },
  
  listAdbinderror:function(e)
  {
    var self=this;
    if(e.errCode)
    {
      self.setData({listAdsuccess:false})
      
    }

  },
  sendSubscribeMessage:function(e)
  {

    var self= this;
    var id = e.currentTarget.id;
    var author=e.currentTarget.dataset.author;
    var title =e.currentTarget.dataset.title;
    var data={};

    var userId=self.data.userSession.userId;
    var sessionId =self.data.userSession.sessionId;

    
    if(!sessionId || !userId)
    {
        Adapter.toast('请先授权登录',3000);
        return;
    }

    wx.lin.showDialog({
      type:"confirm",     
      title:"标题",
      showTitle:false,
      confirmText:"确认" ,
      confirmColor:"#f60" ,
      content:"确认发送？",          
      success: (res) => {
        if (res.confirm) { 

          var res =Adapter.sendSubscribeMessage(self,id,author,title,'newcontent','',API).then(res=>{
            console.log(res);
            if(res.code=='error')
            {
                  wx.showToast({
                  title: res.message,
                  mask: false,
                  icon: "none",
                  duration: 3000
              });                 
            }
            else{ 
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });  
            }
          });
           
        } else if (res.cancel) {        
            
        }
      }
    })
  },
  deleteTopic:function(e)
  {
    var self= this;
    var id = e.currentTarget.id;
    var data={};
    var userId=self.data.userSession.userId;
    var sessionId =self.data.userSession.sessionId;
    var deletetype='publishStatus';
    if(!sessionId || !userId)
    {
        Adapter.toast('请先授权登录',3000);
        return;
    }
    data.id=id;
    data.userid=userId;
    data.sessionid=sessionId;
    data.deletetype=deletetype;
    var posttype= 'topic'    
    wx.lin.showDialog({
      type:"confirm",     
      title:"标题",
      showTitle:false,
      confirmText:"确认" ,
      confirmColor:"#f60" ,
      content:"确认删除？",          
      success: (res) => {
        if (res.confirm) { 
          API.deletePostById(data).then(res => {
            if(res.code=='error')
            {
                  wx.showToast({
                  title: res.message,
                  mask: false,
                  icon: "none",
                  duration: 3000
              });                 
            }
            else{             
              self.onPullDownRefresh();
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
    
  },
  // 点击关闭添加到我的小程序提示框
  shutAddMyMiniapp() {
    this.setData({
      isFirst: false
    })
  }

}
//-------------------------------------------------
Page(options)