const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js')
const NC = require('../../utils/notificationcenter.js')

import config from '../../utils/config.js'

const app = getApp()
const pageCount = config.getPageCount;

let rewardedVideoAd = null

const options = {
  data: {
    shareTitle: config.getWebsiteName,
    pageTitle:config.getWebsiteName,
    logo:config.getLogo,
    // pageTitle: config.getWebsiteName + '-我的',
    copyright: app.globalData.copyright,
    listStyle: '',
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    settings:{},
    isLoginPopup: false,
    system: '',
    enterpriseMinapp:'',
    task:{signined:false,shareapped:false,openAdVideoed:false},
    taskError:false
  },
  onLoad: function (option) {
    let self = this;
    
    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        self.setData({system:system,platform:t.platform});

      }
    })
    Auth.setUserMemberInfoData(self);
    Auth.checkLogin(self);
    self.getMytaskStatus();
    self.getSetting();
   
  },
  getSetting:function()
  {
    var self=this;
    API.getSettings().then(res=>{
        self.setData({settings:res.settings});
    })
  },
  getMytaskStatus:function()
  {
    var data={};
    var self= this;
    data.userId=this.data.userSession.userId;
    data.sessionId=this.data.userSession.sessionId;
    API.myTask(data).then(res=>{
        
        if(res.code)
        {
          self.setData({taskError:true})
          wx.showToast({
            title: res.message,
            mask: false,
            icon: "none",
            duration: 2000
          });

        }
        else{

          self.setData({task:res.task})   
          self.loadInterstitialAd(self.data.task.excitationAdId);   

        }
        
    })

  },
  signin:function()
  {
    var self=this;
    var data={};
        data.userId=this.data.userSession.userId;
        data.sessionId=this.data.userSession.sessionId;
      API.signin(data).then(res=>{
        if (res.code == 'error') {

          wx.showToast({
            title: res.message,
            mask: false,
            icon: "none",
            duration: 2000
          });

        }
        else{
            var task=self.data.task;
            task.signined=true;
            self.setData({task:task});

            wx.showToast({
              title: res.message,
              mask: false,
              icon: "none",
              duration:4000
            });
        }
        
      })
  },
  onShareAppMessage: function (e) {
    var self= this;  
    var data={};
    if (e.from === 'button') {

      data.userId=this.data.userSession.userId;
      data.sessionId=this.data.userSession.sessionId;
        API.shareApp(data).then(res=>{
          if (res.code == 'error') {

            wx.showToast({
              title: res.message,
              mask: false,
              icon: "none",
              duration: 2000
            });

          }
          else{
              var task=self.data.task;
              task.shareapped=true;
              self.setData({task:task});

              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 4000
              });
          }
          
        })
    }
    return {
      title: self.data.shareTitle,
      path: '/pages/index/index',
      imageUrl:self.data.logo
   }  
    
   
   
    
},
  openAdVideo:function()
  {
    var  platform=this.data.platform
        if(platform=='devtools')
        {
 
            Adapter.toast("开发工具无法显示激励视频",2000);
            
        }
        else
        {
          rewardedVideoAd.show()
          .catch(() => {
              rewardedVideoAd.load()
              .then(() => rewardedVideoAd.show())            
              .catch(err => {
                  console.log('激励视频 广告显示失败');
                  
              })
          }) 
        }

      
  },

  loadInterstitialAd:function(excitationAdId)    
    {
        var self=this;     
        var data={};
        data.userId=this.data.userSession.userId;
        data.sessionId=this.data.userSession.sessionId;
        if(wx.createRewardedVideoAd){
            rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: excitationAdId })
            rewardedVideoAd.onLoad(() => {
              console.log('onLoad event emit')
            })
            rewardedVideoAd.onError((err) => {
              
            })
            rewardedVideoAd.onClose((res) => {                
                
                if (res && res.isEnded) {
                  API.openAdVideo(data).then(res=>{
                    if (res.code == 'error') {            
                      wx.showToast({
                        title: res.message,
                        mask: false,
                        icon: "none",
                        duration: 2000
                      });
            
                    }
                    else{
                        var task=self.data.task;
                        task.openAdVideoed=true;
                        self.setData({task:task});            
                        wx.showToast({
                          title: res.message,
                          mask: false,
                          icon: "none",
                          duration: 4000
                        });
                    }
                    
                  })

                   
                  } else {

                    Adapter.toast("你中途关闭了视频",3000);
                    
                  }
            })
          }

    },
  
}

Page(options)