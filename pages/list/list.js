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

const options = {
  data: {
    slug:null,
    isGoodsType:false,
    isArticlesList: true,
    isSearch: false,
    isTag: false,
    tagname: '',
    isCategory: false,
    categoryId: "",
    searchKey: "",
    articlesList: [],
    categoryImage: "",
    isLastPage: false,
    isPull: false,
    page: 1,
    shareTitle: '',
    pageTitle: '',
    tag: '',
    listStyle: config.getListStyle
  },
  onLoad: function (options) {
    
    this.setData({
      slug: options.slug
    })
    if(options.type == 1) {
      this.setData({
        isGoodsType:false
      })
      wx.setNavigationBarTitle({
        title: options.title,
        success: function (res) {
          // success
          console.log(res)
        }
      });
    } else {
      this.setData({
        isGoodsType:true
      })
    }
    // 设置插屏广告
    this.setInterstitialAd();

    let args = {};
    args.page = this.data.page;
    args.pageCount = pageCount;
    args.cate = this.data.slug;
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
        pageTitle: config.getWebsiteName + "-搜索",
        shareTitle: config.getWebsiteName + "-搜索",
      });
    }
    if (options.categoryIds && options.categoryIds != '') {
      args.isSearch = false;
      args.isCategory = true;
      args.isTag = false;
      args.categoryIds = options.categoryIds;
      this.setData({
        isSearch: false,
        isCategory: true,
        isTag: false,
        categoryIds: options.categoryIds,

      });
      if(this.data.isGoodsType){
        this.LoadCategory(args);
      }
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
        shareTitle: options.tagname + "# 标签相关的文章"
      });
    }

    if (options.type == 1) {
      Adapter.loadTabGoodsList(args, this, API);
    } else {
      Adapter.loadArticles(args, this, API);
    }

  },

  onShow: function () {
    this.setData({
      listStyle: wx.getStorageSync('listStyle')
    });
  },

  onReady: function () {
    // wx.setNavigationBarTitle({
    //   title: this.data.pageTitle
    // });
  },

  onUnload: function () {
    // this.removeArticleChange();
  },

  onPullDownRefresh: function () {
    this.setData({
      isPull: true,
      isError: false,
      isArticlesList: false,
      articlesList: []
    })
    let args = {};
    args.page = 1;
    args.cate = this.data.slug;
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
      args.categoryIds = this.data.categoryIds;
    }
    if (this.data.isTag) {
      args.isSearch = false;
      args.isCategory = false;
      args.isTag = true;
      args.tag = this.data.tag;
    }
    
    if (!this.data.isGoodsType) {
      Adapter.loadTabGoodsList(args, this, API, true);
    } else {
      Adapter.loadArticles(args, this, API, true);
    }
  },
  onReachBottom: function () {
    let args = {};
    args.pageCount = pageCount;
    args.cate = this.data.slug;
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
        args.categoryIds = this.data.categoryIds;
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
      
      if (!this.data.isGoodsType) {
        Adapter.loadTabGoodsList(args, this, API );
      } else {
        Adapter.loadArticles(args, this, API);
      }
    } else {
      console.log("最后一页了");
      // wx.showToast({
      //     title: '没有更多内容',
      //     mask: false,
      //     duration: 1000
      // });
    }
  },

  onShareAppMessage: function () {
    var path = '/pages/list/list';
    if (this.data.isSearch) {
      path += "?searchKey=" + this.data.searchKey;

    }
    if (this.data.isCategory) {
      path += "?categoryIds=" + this.data.categoryIds;

    }
    if (this.data.isTag) {

      path += "?tag=" + this.data.tag + "&tagname=" + this.data.tagname;

    }

    return {
      title: this.data.shareTitle,
      path: path
    }
  },
  // 获取小程序插屏广告
  setInterstitialAd: function () {
    API.getSettings().then(res => {
      // 获取广告id，创建插屏广告组件
      if(!res.success) return
      let interstitialAd = wx.createInterstitialAd({
        adUnitId: res.settings.raw_interstitial_ad_id
      })
      // 监听插屏错误事件
      interstitialAd.onError((err) => {
        console.error(err)
      })
      // 显示广告
      if (interstitialAd) {
        interstitialAd.show().catch((err) => {
          console.error(err)
        })
      }
    })
  },

  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id;
    var type = null;
    if (!this.data.isGoodsType) {
      type = 1;
    } else {
      type = 2;
    }
    var url = '../detail/detail?id=' + id + '&type=' + type;
    wx.navigateTo({
      url: url
    })
  },

  formSubmit: function (e) {
    var url = '../list/list'
    var key = '';
    if (e.currentTarget.id == "search-input") {
      key = e.detail.value;
    } else {
      key = e.detail.value.input;
    }
    if (key != '') {
      url = url + '?search=' + key;
      wx.redirectTo({
        url: url,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入搜索内容',
        showCancel: false,
      });


    }
  },

  //获取分类列表
  LoadCategory: function (args) {
    API.getCategoryById(args).then(res => {
      var catImage = "";
      if (typeof (res.category_thumbnail_image) == "undefined" || res.category_thumbnail_image == "") {
        catImage = "../../images/uploads/default_image.jpg";
      } else {
        catImage = res.category_thumbnail_image;
      }

      this.setData({
        category: res,
        shareTitle: res.name + "专题类的文章”",
        pageTitle: "“" + res.name + "专题类的文章”",
        categoryImage: catImage
      });

      wx.setNavigationBarTitle({
        title: res.name,
        success: function (res) {
          // success
        }
      });
    })
  },

  //--------------------------------------
  removeArticleChange: function () {
    //NC.removeNotification("articleChange", this)
  }
}
//-------------------------------------------------
Page(options)