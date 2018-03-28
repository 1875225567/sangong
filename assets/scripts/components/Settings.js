cc.Class({
    extends: cc.Component,

    properties: {
        _btnYXOpen:null,
        _btnYXClose:null,
        _btnYYOpen:null,
        _btnYYClose:null,
        _danOpen:null,
        _danClose:null,
        _yuOpen:null,
        _yuClose:null,
        _decoratedan:null,
        _decorateyu:null,
    },

    onLoad: function () {
        if(cc.vv == null){
            return;
        }
                
        this._btnYXOpen = this.node.getChildByName("yinxiao").getChildByName("btn_yx_open");
        this._btnYXClose = this.node.getChildByName("yinxiao").getChildByName("btn_yx_close");
        
        this._btnYYOpen = this.node.getChildByName("yinyue").getChildByName("btn_yy_open");
        this._btnYYClose = this.node.getChildByName("yinyue").getChildByName("btn_yy_close");

        this._danOpen = this.node.getChildByName("danmu").getChildByName("opendan");
        this._danClose = this.node.getChildByName("danmu").getChildByName("closedan");
        this._decoratedan = this.node.getChildByName("danmu").getChildByName("string2");

        this._yuOpen = this.node.getChildByName("yuyin").getChildByName("openyu");
        this._yuClose = this.node.getChildByName("yuyin").getChildByName("closeyu");
        this._decorateyu = this.node.getChildByName("yuyin").getChildByName("string2");

        
        this.initButtonHandler(this.node.getChildByName("btn_close"));
        this.initButtonHandler(this.node.getChildByName("btn_exit"));
        this.initButtonHandler(this.node.getChildByName("btn_sqjsfj"));
        
        
        this.initButtonHandler(this._btnYXOpen);
        this.initButtonHandler(this._btnYXClose);
        this.initButtonHandler(this._btnYYOpen);
        this.initButtonHandler(this._btnYYClose);


        this.initButtonHandler(this._danOpen);
        this.initButtonHandler(this._danClose);
        this.initButtonHandler(this._yuOpen);
        this.initButtonHandler(this._yuClose);
        

        var slider = this.node.getChildByName("yinxiao").getChildByName("progress");
        cc.vv.utils.addSlideEvent(slider,this.node,"Settings","onSlided");
        
        var slider = this.node.getChildByName("yinyue").getChildByName("progress");
        cc.vv.utils.addSlideEvent(slider,this.node,"Settings","onSlided");
        
        this.refreshVolume();
        this.initialize();
    },
    
    initialize:function(){
        var t = cc.sys.localStorage.getItem("bullet");
        if(t != null){
            if(parseInt(t) > 0){
                this._danOpen.active = true;
                this._danClose.active = false;
                this._decoratedan.setPosition(249, 0);
            }
            else{
                this._danOpen.active = false;
                this._danClose.active = true;
                this._decoratedan.setPosition(199,0);
            }
        }
        else{
            cc.sys.localStorage.setItem("bullet",1);
        }

        var t = cc.sys.localStorage.getItem("voice");
        if(t != null){
            if(parseInt(t) > 0){
                this._yuOpen.active = true;
                this._yuClose.active = false;
                this._decorateyu.setPosition(484, 0);
            }
            else{
                this._yuOpen.active = false;
                this._yuClose.active = true;
                this._decorateyu.setPosition(434, 0);
            }
        }
        else{
            cc.sys.localStorage.setItem("voice",1);
        }
    },

    onSlided:function(slider){
        if(slider.node.parent.name == "yinxiao"){
            cc.vv.audioMgr.setSFXVolume(slider.progress);
        }
        else if(slider.node.parent.name == "yinyue"){
            cc.vv.audioMgr.setBGMVolume(slider.progress);
        }
        this.refreshVolume();
    },
    
    initButtonHandler:function(btn){
        cc.vv.utils.addClickEvent(btn,this.node,"Settings","onBtnClicked");    
    },
    
    refreshVolume:function(){
        this._btnYXClose.active = cc.vv.audioMgr.sfxVolume > 0;
        this._btnYXOpen.active = !this._btnYXClose.active;
        
        var yx = this.node.getChildByName("yinxiao");
        var width = 430 * cc.vv.audioMgr.sfxVolume;
        var progress = yx.getChildByName("progress")
        progress.getComponent(cc.Slider).progress = cc.vv.audioMgr.sfxVolume;
        progress.getChildByName("progress").width = width;  
        //yx.getChildByName("btn_progress").x = progress.x + width;
        
        
        this._btnYYClose.active = cc.vv.audioMgr.bgmVolume > 0;
        this._btnYYOpen.active = !this._btnYYClose.active;
        var yy = this.node.getChildByName("yinyue");
        var width = 430 * cc.vv.audioMgr.bgmVolume;
        var progress = yy.getChildByName("progress");
        progress.getComponent(cc.Slider).progress = cc.vv.audioMgr.bgmVolume; 
        
        progress.getChildByName("progress").width = width;
        //yy.getChildByName("btn_progress").x = progress.x + width;
    },
    
    onBtnClicked:function(event){
        var can = cc.find("Canvas");
        if(event.target.name == "btn_close"){
            this.node.active = false;
        }
        else if(event.target.name == "btn_exit"){
            cc.sys.localStorage.removeItem("wx_account");
            cc.sys.localStorage.removeItem("wx_sign");
            cc.director.loadScene("login");
        }
        else if(event.target.name == "btn_yx_open"){
            cc.vv.audioMgr.setSFXVolume(1.0);
            this.refreshVolume(); 
        }
        else if(event.target.name == "btn_yx_close"){
            cc.vv.audioMgr.setSFXVolume(0);
            this.refreshVolume();
        }
        else if(event.target.name == "btn_yy_open"){
            cc.vv.audioMgr.setBGMVolume(1);
            this.refreshVolume();
        }
        else if(event.target.name == "btn_yy_close"){
            cc.vv.audioMgr.setBGMVolume(0);
            this.refreshVolume();
        }
        else if(event.target.name == "btn_sqjsfj"){
            cc.vv.net.send("exit");
        }
        else if(event.target.name == "opendan"){
            this._danOpen.active = false;
            this._danClose.active = true;
            cc.sys.localStorage.setItem("bullet",0);
            this.initialize();
            if(can.getComponent('Chat')){
                can.getComponent('Chat').init();
            }
        }
        else if(event.target.name == "closedan"){
            this._danOpen.active = true;
            this._danClose.active = false;
            cc.sys.localStorage.setItem("bullet",1);
            this.initialize();
            if(can.getComponent('Chat')){
                can.getComponent('Chat').init();
            }
        }
        else if(event.target.name == "openyu"){
            this._yuOpen.active = false;
            this._yuClose.active = true;
            cc.sys.localStorage.setItem("voice",0);
            this.initialize();
            if(can.getComponent('Voice')){
                can.getComponent('Voice').init();
            }
        }
        else if(event.target.name == "closeyu"){
            this._yuOpen.active = true;
            this._yuClose.active = false;
            cc.sys.localStorage.setItem("voice",1);
            this.initialize();
            if(can.getComponent('Voice')){
                can.getComponent('Voice').init();
            }
        }
    }
});
