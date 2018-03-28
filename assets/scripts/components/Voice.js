cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _lastTouchTime:null,
        _voice:null,
        _volume:null,
        _voice_failed:null,
        _lastCheckTime:-1,
        _timeBar:null,
        MAX_TIME:15000,
        _voiceSelectNode:null,
        _select:0,
    },

    // use this for initialization
    onLoad: function () {
        
        this._select = 0;

        this._voice = cc.find("Canvas/voice");
        this._voice.active = false;

        this._voiceSelectNode = cc.find("Canvas/voiceSelect");
        this._voiceSelectNode.active = false;
        
        this._voice_failed = cc.find("Canvas/voice/voice_failed");
        this._voice_failed.active = false;
        
        this._timeBar = cc.find("Canvas/voice/time");
        this._timeBar.scaleX = 0.0;
        
        this._volume = cc.find("Canvas/voice/volume");
        for(var i = 1; i < this._volume.children.length; ++i){
            this._volume.children[i].active = false;
        }
        
        var btnVoice = cc.find("Canvas/voice/voice_failed/btn_ok");
        if(btnVoice){
            cc.vv.utils.addClickEvent(btnVoice,this.node,"Voice","onBtnOKClicked");
        }
        var selectbj = cc.find("Canvas/voiceSelect/shadow");
        if(selectbj){
            cc.vv.utils.addClickEvent(selectbj,this.node,"Voice","closeVoiceSelect");
        }
        
        var room = cc.find("Canvas/voiceSelect/room");
        if(room){
            cc.vv.utils.addClickEvent(room,this.node,"Voice","selectRoom");
        }
        
        var allroom = cc.find("Canvas/voiceSelect/allroom");
        if(allroom){
            cc.vv.utils.addClickEvent(allroom,this.node,"Voice","selectAllRoom");
        }
        

        if(cc.sys.localStorage.getItem("voice") == null){
            cc.sys.localStorage.setItem("voice",1);
        }

        this.init();
    },

    init:function(){
        var self = this;
        var btn_Voice = cc.find("Canvas/btn_voice");
        var btnVoice = cc.find("Canvas/btnvoice");
        var t = cc.sys.localStorage.getItem("voice");
        if(t != null){
            if(parseInt(t) > 0){
                btnVoice.active = false;
                if(btn_Voice){
                    btn_Voice.on(cc.Node.EventType.TOUCH_START,function(){
                        if(self._voiceSelectNode.activeInHierarchy == true){
                            console.log("cc.Node.EventType.TOUCH_START");
                            cc.vv.voiceMgr.prepare("record.amr");
                            self._lastTouchTime = Date.now();
                            self._voice.active = true;
                            self._voice_failed.active = false;
                        }
                    });
        
                    btn_Voice.on(cc.Node.EventType.TOUCH_MOVE,function(){
                        console.log("cc.Node.EventType.TOUCH_MOVE");
                    });
                                
                    btn_Voice.on(cc.Node.EventType.TOUCH_END,function(){
                        if(self._voiceSelectNode.activeInHierarchy == true){
                            console.log("cc.Node.EventType.TOUCH_END");
                            if(Date.now() - self._lastTouchTime < 1000){
                                self._voice_failed.active = true;
                                cc.vv.voiceMgr.cancel();
                            }
                            else{
                                self.onBtnOKClicked();
                                // self.onVoiceOK();
                            }
                            self._lastTouchTime = null;
                        }
                        else{
                            self._voiceSelectNode.active = true;
                        }
                    });
                    
                    btn_Voice.on(cc.Node.EventType.TOUCH_CANCEL,function(){
                        console.log("cc.Node.EventType.TOUCH_CANCEL");
                        cc.vv.voiceMgr.cancel();
                        self._lastTouchTime = null;
                        self._voice.active = false;
                    });
                }
            }
            else{
                btnVoice.active = true;
            }
        }
        else{
            cc.sys.localStorage.setItem("voice",1);
        }
    },

    closeVoiceSelect:function(){
        this._voiceSelectNode.active = false;
    },
    
    onVoiceOK:function(){
        if(cc.sys.localStorage.getItem("voice") == "1"){
            if(this._lastTouchTime != null){
                cc.vv.voiceMgr.release();
                var time = Date.now() - this._lastTouchTime;
                var msg = cc.vv.voiceMgr.getVoiceData("record.amr");
                if(this._select == 0){
                    cc.vv.net.send("voice_msg",{msg:msg,time:time});
                }
                else if(this._select == 1){
                    cc.vv.net.send("allvoice_msg",{msg:msg,time:time});
                }
            }
        }
        else{
            cc.vv.alert.show("语音功能已关闭，如需发语音请打开设置里的语音功能");
        }
        this._voice.active = false;
    },
    
    onBtnOKClicked:function(){
        this._voice.active = false;
    },

    selectRoom:function(){
        this._select = 0;
        var room = cc.find("Canvas/voiceSelect/room");
        var allroom = cc.find("Canvas/voiceSelect/allroom");
        this.setSpriteFrame(room,"loudspeaker_inclick");
        this.setSpriteFrame(allroom,"loudspeaker_onclick");
    },
    selectAllRoom:function(){
        this._select = 1;
        var room = cc.find("Canvas/voiceSelect/room");
        var allroom = cc.find("Canvas/voiceSelect/allroom");
        this.setSpriteFrame(room,"loudspeaker_onclick");
        this.setSpriteFrame(allroom,"loudspeaker_inclick");
    },

    setSpriteFrame:function(node,spriteName){
        cc.loader.loadRes("textures/wrapper/loudspeaker",cc.SpriteAtlas,function(err,atlas){
            var spriteFrame = atlas.getSpriteFrame(spriteName);
            node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this._voice.active == true && this._voice_failed.active == false){
            if(Date.now() - this._lastCheckTime > 300){
                for(var i = 0; i < this._volume.children.length; ++i){
                    this._volume.children[i].active = false;
                }
                var v = cc.vv.voiceMgr.getVoiceLevel(7);
                if(v >= 1 && v <= 7){
                    this._volume.children[v-1].active = true;   
                }
                this._lastCheckTime = Date.now();
            }
        }
        
        if(this._lastTouchTime){
            var time = Date.now() - this._lastTouchTime;
            if(time >= this.MAX_TIME){
                this.onVoiceOK();
                this._lastTouchTime = null;
            }
            else{
                var percent = time / this.MAX_TIME;
                this._timeBar.scaleX = 1 - percent;
            }
        }
    },
});
