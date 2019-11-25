/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */


const Auth = {}
Auth.wxLogin= function () {
    return new Promise(function (resolve, reject) {
        wx.login({
            success: function (res) {               
                let args = {};
                args.js_code = res.code;                                
                resolve(args);                
            },
            fail: function (err) {
                console.log(err);
                reject(err);
            }
        });
    })
}

Auth.wxGetUserInfo=function()
{
    return new Promise(function (resolve, reject) {
        wx.getUserInfo({            
            success: function (res) {
                //console.log(res);
                resolve(res);
            },
            fail: function (err) {
                resolve(err);
            }
        });
    });
}

Auth.userLogin = function (args,api){    
    return new Promise(function (resolve, reject) {
        api.userLogin(args).then(res => {
            if (res.raw_session) {                
                console.log("获取用户会话成功");
                resolve(res.raw_session);

            }
            else {
                console.log("获取用户会话失败");
                if(res.data.message)
                {
                    console.log(res.data.message);
                    reject(res.data.message);
                }
                else if(res.message)
                  {
                    console.log(res.message);
                    reject(res.message);
                  }

                
            }

        })
    })
        
}


Auth.scopeUserInfo=function () {
	return new Promise(function(resolve, reject) {
		let args = {};
		wx.getSetting({
	        success: function success(res) {
	            console.log(res.authSetting);
	            var authSetting = res.authSetting;
	            if (!('scope.userInfo' in authSetting)) {
	                //if (util.isEmptyObject(authSetting)) {
	                console.log('首次授权');
	                args.scopeUserInfo ='none';

	            } else {
	                console.log('再次授权', authSetting);                
	                if (authSetting['scope.userInfo'] === false) {
	                    
	                    args.scopeUserInfo ='0';
	                }
	                else {
	                    args.scopeUserInfo ='1';
	                }
	            }

	            resolve(args.scopeUserInfo);
	        },
	        fail:function(err)
	        {
	        	reject(err);
	        }

    	});

	}) 
}

Auth.agreeGetUser=function(e,api,wxLoginInfo,authFlag){
    return new Promise(function(resolve, reject) {
       let args={};        
       args.js_code =wxLoginInfo.js_code;
       if(authFlag=='0'  && e.detail.errMsg=='getUserInfo:fail auth deny'){
            args.errcode=e.detail.errMsg;
            args.userInfo={isLogin:false}
            args.userSession="";            
            resolve(args);
            return;
       } 
        var userInfoDetail = {};
        if(authFlag=='0')//未授权过,通过按钮授权
         {
            userInfoDetail = e.detail;
         }
        else if(authFlag=='1')//已经授权过，直接通过wx.getUserInfo获取
        {
          userInfoDetail = e;
        }
        if (userInfoDetail && userInfoDetail.userInfo){
            args.iv = userInfoDetail.iv;
            args.encryptedData = userInfoDetail.encryptedData;
            let userInfo =  userInfoDetail.userInfo;
            userInfo.isLogin =true;
            args.userInfo=userInfo;                                           
            Auth.userLogin(args,api).then(userSession=>{
                args.userSession=userSession;
                args.errcode ="";
                resolve(args);
            }).catch(function (error) {
                console.log('error: ' + error);                        
                reject(error);
            })
        }
        else
        {
           args.errcode="error";
           args.userInfo={isLogin:false};
           args.userSession="";            
           resolve(args);
        }
    }) 
}

Auth.getMemberUserInfo=function(args,api)
{
    return new Promise(function(resolve, reject) {
        let weixinUsreInfo ={};
        api.getMemberUserInfo(args).then(res=>{
            resolve(res);
        })
    })

}

Auth.getUserInfo=function(args,api)
{
    return new Promise(function(resolve, reject) {        
        api.getUserInfo(args).then(res=>{
            resolve(res);
        })
    })

}

Auth.checkLogin = function(appPage){    
    let wxLoginInfo =wx.getStorageSync('wxLoginInfo');   
    wx.checkSession({
          success: function(){
            if(!wxLoginInfo.js_code)
            {
                Auth.wxLogin().then(res=>{              
                    appPage.setData({wxLoginInfo:res});
                    wx.setStorageSync('wxLoginInfo',res);                    
                    console.log('checkSession_success_wxLogins');
                })  
            }
          },
          fail: function(){
             Auth.wxLogin().then(res=>{              
                    appPage.setData({wxLoginInfo:res});
                    wx.setStorageSync('wxLoginInfo',res);
                    console.log('checkSession_fail_wxLoginfo');
            })
          }
    })
    
    
}

Auth.checkSession=function(app,api,appPage,flag,util)
{
    let  userSession =wx.getStorageSync('userSession');
    if(!userSession.sessionId){
       if ('isLoginNow'==flag) {             
            var userInfo ={avatarUrl:"../../images/gravatar.png",nickName:"立即登录",isLogin:false}          
            appPage.setData({isLoginPopup: true,userInfo:userInfo});
        }
        
    }
    else
    {
        if(util.checkSessionExpire(userSession.sessionExpire))
        {
            var data={};
            data.userId=userSession.userId;
            data.sessionId=userSession.sessionId;
            api.updateSession(data).then(res=>{
                if(res.raw_session)
                {
                    wx.setStorageSync('userSession',res.raw_session);
                    
                }
                else if(res.code =='user_parameter_error')
                {
                    console.log(res);
                    Auth.logout(appPage);
                    wx.reLaunch({
                      url: '../index/index'
                    })

                }
            })
        }
    }

}


Auth.checkGetMumber =function(app,appPage,api)
{

    let  memberUserInfo = wx.getStorageSync('memberUserInfo');
    let  userSession =wx.getStorageSync('userSession');
    if(userSession.sessionId && !memberUserInfo.membername)
    {
      Auth.getMemberUserInfo(userSession,api).then(res=>{
        if(res.memberUserInfo)
        {
            appPage.setData({memberUserInfo:res.memberUserInfo});
            wx.setStorageSync('memberUserInfo',res.memberUserInfo);
        }
        else
        {
            console.log(res);

        }
    })  
    }
}

Auth.checkAgreeGetUser =function(e,app,appPage,api,authFlag)
{
    
    let wxLoginInfo =wx.getStorageSync('wxLoginInfo');
    if(wxLoginInfo.js_code)
        {
            Auth.agreeGetUser(e,api,wxLoginInfo,authFlag).then(res=>{
            if (res.errcode==""){
                appPage.setData({userInfo:res.userInfo});
                wx.setStorageSync('userInfo',res.userInfo);
                wx.setStorageSync('userSession',res.userSession);
                appPage.setData({userSession:res.userSession});                
                Auth.getMemberUserInfo(res.userSession,api).then(response=>{
                        if(response.memberUserInfo)
                        {
                            appPage.setData({memberUserInfo:response.memberUserInfo});
                            wx.setStorageSync('memberUserInfo',response.memberUserInfo);
                        }
                        else
                        {
                            console.log(res);

                        }
                    })
            }
            else
            {
                var userInfo ={avatarUrl:"../../images/gravatar.png",nickName:"点击登录",isLogin:false}
                appPage.setData({userInfo:userInfo});
                console.log("用户拒绝了授权");
            }
            appPage.setData({ isLoginPopup: false });

            })
        }
        else
        {
            console.log("登录失败");
            wx.showToast({
                title: '登录失败',
                mask: false,
                duration: 1000
            });

        }
}

Auth.checkGetMemberUserInfo=function(userSession,appPage,api)
{

    if(userSession.sessionId)
        {
          Auth.getMemberUserInfo(userSession,api).then(res=>{
                if(res.memberUserInfo)
                {
                    appPage.setData({memberUserInfo:res.memberUserInfo});
                    wx.setStorageSync('memberUserInfo',res.memberUserInfo);
                }
                else
                {
                    console.log(res);

                }
                if (appPage.data.isPull) {
                wx.stopPullDownRefresh()
                }
            })  
      } 

}
Auth.setUserMemberInfoData = function(appPage)
{
    appPage.setData({listStyle:wx.getStorageSync('listStyle')});
    if(!appPage.data.userSession.sessionId){
          appPage.setData({
            userInfo: wx.getStorageSync('userInfo'),
            userSession:wx.getStorageSync('userSession'),            
            wxLoginInfo:wx.getStorageSync('wxLoginInfo'),
            memberUserInfo:wx.getStorageSync('memberUserInfo')

        })
      
    }
    
}

Auth.logout =function(appPage)
{
    appPage.setData({
        userSession:{},
        memberUserInfo:{},
        userInfo:{avatarUrl:"../../images/gravatar.png",nickName:"立即登录",isLogin:false},
        wxLoginInfo:{}
        }
    )
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('userSession');
    wx.removeStorageSync('memberUserInfo');
    wx.removeStorageSync('wxLoginInfo');


}
module.exports = Auth