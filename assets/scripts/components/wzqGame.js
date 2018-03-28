cc.Class({
    extends: cc.Component,

    properties: {
        _gametype:"",
        studyMoneyNode:cc.Node,
        mimeHeadImg:cc.Sprite,
        otherHeadImg:cc.Sprite,
        _chessmen:null,
        _gamestate:null,
        _btnloser:null,
        _gameStartNode:null,
        _inviteFriends: null,
        _editBox: null,
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        if(!cc.vv){
            cc.director.loadScene("loading");
            return;
        }

        this.addComponent("ReConnect");

        cc.vv.gameNetMgr.dataEventHandler = this.node;
        this._gametype = "wzq";
        this._gamestate = '';
        this._inviteFriends = cc.find("Canvas/inviteFriends");
        this._editBox = cc.find("Canvas/studymoney/editBox");
        
        this.initTouchNodes();
        this.initView();
        this.initEventHandlers();

        this._btnloser = this.node.getChildByName("btnloser");
        this._btnloser.active = false;
    },

    initTouchNodes:function(){
        var touchNodes = cc.find("Canvas/game/touchNodes");
        for (let i = 0; i < 13; i++) {
            for (let y = 0; y < 13; y++) {
                var chessNode = new cc.Node(i + '-' + y);
                chessNode.active = true;
                chessNode.parent = touchNodes;
                chessNode.width = 41.5;
                chessNode.height = 41.5;
                chessNode.addComponent(cc.Button);
            }
        }
    },

    initView:function(){
        this.initSelfInfo();
        
        var lblRoomNo = cc.find("Canvas/roomidbg/roomid").getComponent(cc.Label);
        lblRoomNo.string = "房间号:" + cc.vv.gameNetMgr.roomId;

        this._chessmen = cc.find("Canvas/game/touchNodes");
        for (let i = 0; i < this._chessmen.childrenCount; i++) {
            const chessman = this._chessmen.children[i];
            cc.vv.utils.addClickEvent(chessman,this.node,'wzqGame','touchChessmen');
        }

        var btnExit = this.node.getChildByName("btnexit");
        if(btnExit){
            cc.vv.utils.addClickEvent(btnExit,this.node,"wzqGame","onBtnExit");
        }
        var btn_ready = cc.find("Canvas/btn_ready");
        btn_ready.active = false;
        var btn_start = cc.find("Canvas/btn_start");
        btn_start.active = false;
        var btnready = cc.find("Canvas/btnready");
        btnready.active = false;
        var btnstart = cc.find("Canvas/btnstart");
        btnstart.active = false;
        if(cc.vv.gameNetMgr.conf.creator == cc.vv.userMgr.userId){
            // var btnsetmoney = cc.find("Canvas/btnsetmoney");
            // btnsetmoney.active = true;
            this.studyMoneyNode.active = true;
        }
        this._gameStartNode = cc.find("Canvas/gameStartTips/gamestart").getComponent(cc.Animation);
        // this._gameStartNode.active = false;

        var btnWechat = cc.find("Canvas/inviteFriends");
        if(btnWechat){
            cc.vv.utils.addClickEvent(btnWechat,this.node,"wzqGame","onBtnWeichatClicked");
        }
    },

    initSelfInfo:function(){
        if(cc.vv.gameNetMgr.conf.creator == cc.vv.userMgr.userId){
            this.setSelf(cc.vv.userMgr.userId,cc.vv.userMgr.coins);
        }
        else{
            this.setUser(cc.vv.userMgr.userId,cc.vv.userMgr.coins);
        }
    },

    onBtnExit:function(){
        if(this._gamestate == 'playing'){
            cc.vv.alert.show("正在游戏中，是否解散房间？",function(){
                cc.vv.net.send("dissolve_request");
            },true);
        }
        else{
            if(cc.vv.gameNetMgr.conf.creator == cc.vv.userMgr.userId){
                cc.vv.alert.show("是否确定解散？",function(){
                    cc.vv.net.send("dispress");
                },true);
            }
            else{
                cc.vv.alert.show("是否退出房间？",function(){
                    cc.vv.net.send("exit");
                },true);
            }
        }
    },
    start:function(){
        cc.vv.net.send("enterGame");
    },
    readyGame:function(event){
        // var _studyMoney = cc.find("Canvas/Get_title/xuefei").getComponent(cc.Label);
        // var str = parseInt(_studyMoney.string.replace(/[^0-9]/ig,""));
        // if(str <= cc.vv.userMgr.coins){
            event.target.active = false;
            cc.vv.net.send("ready");
            console.log("ready");
        // }
        // else{
        //     cc.vv.alert.show('金币不足，无法准备，请充值。');
        // }
    },
    //投降接口
    capitulate:function(){
        cc.vv.net.send('giveup');
    },

    initEventHandlers:function(){
        var self = this;
        this.node.on('new_user_comes',function(data){
            var _data = data.detail;
            if(_data.userInfo.userId == cc.vv.gameNetMgr.conf.creator){
                self.setSelf(_data.userInfo.userId,_data.userInfo.coins);
            }
            else{
                self.setUser(_data.userInfo.userId,_data.userInfo.coins);
                self._inviteFriends.active = false;
            }
        });
        this.node.on('user_state_changed',function(data){
            var _data = data.detail;
            if(!_data){
                self.setUser('','0');
                self._inviteFriends.active = true;
            }
        });
        this.node.on('stake_notify_push',function(data){
            var _data = data.detail;
            if(_data.error){
                if(!self.studyMoneyNode.activeInHierarchy){
                    cc.vv.transition.active(self.studyMoneyNode);
                }
                cc.vv.alert.show('请设置正确学费');
                return;
            }
            var _studyMoney = cc.find("Canvas/Get_title/xuefei").getComponent(cc.Label);
            _studyMoney.string = "学费:" + _data.stake;
            if(cc.vv.gameNetMgr.conf.creator == cc.vv.userMgr.userId){
                var btnready = cc.find("Canvas/btnready");
                btnready.active = false;
                var btnstart = cc.find("Canvas/btnstart");
                btnstart.active = true;
                var btn_ready = cc.find("Canvas/btn_ready");
                btn_ready.active = false;
                var btn_start = cc.find("Canvas/btn_start");
                btn_start.active = true;
            }
            else{
                var btnready = cc.find("Canvas/btnready");
                btnready.active = true;
                var btnstart = cc.find("Canvas/btnstart");
                btnstart.active = false;
                var btn_ready = cc.find("Canvas/btn_ready");
                btn_ready.active = true;
                var btn_start = cc.find("Canvas/btn_start");
                btn_start.active = false;
            }
        });
        this.node.on('game_sync',function(data){
            var _data = data.detail;
            self._gamestate = _data.state;
            if(_data.seats.length == 2){
                self._inviteFriends.active = false;
            }
            for (let i = 0; i < _data.seats.length; i++) {
                let element = _data.seats[i];
                if(element.userid == cc.vv.gameNetMgr.conf.creator){
                    self.setSelf(element.userid,element.coins);
                }
                else{
                    self.setUser(element.userid,element.coins);
                }
            }

            var _studyMoney = cc.find("Canvas/Get_title/xuefei").getComponent(cc.Label);
            if(_data.stake){
                _studyMoney.string = "学费:" + _data.stake;
                self.studyMoneyNode.active = false;
                if(_data.state == "idle"){
                    if(cc.vv.gameNetMgr.conf.creator == cc.vv.userMgr.userId){
                        var btnready = cc.find("Canvas/btnready");
                        btnready.active = false;
                        var btnstart = cc.find("Canvas/btnstart");
                        btnstart.active = true;
                        var btn_ready = cc.find("Canvas/btn_ready");
                        btn_ready.active = false;
                        var btn_start = cc.find("Canvas/btn_start");
                        btn_start.active = true;
                    }
                    else{
                        var btnready = cc.find("Canvas/btnready");
                        btnready.active = true;
                        var btnstart = cc.find("Canvas/btnstart");
                        btnstart.active = false;
                        var btn_ready = cc.find("Canvas/btn_ready");
                        btn_ready.active = true;
                        var btn_start = cc.find("Canvas/btn_start");
                        btn_start.active = false;
                    }
                }
                else{
                    var btn_ready = cc.find("Canvas/btn_ready");
                    btn_ready.active = false;
                    var btn_start = cc.find("Canvas/btn_start");
                    btn_start.active = false;
                }
            }
            else{
                _studyMoney.string = "学费:0";
                if(cc.vv.gameNetMgr.conf.creator == cc.vv.userMgr.userId){
                    self.studyMoneyNode.active = true;
                }
            }
            cc.vv.gameNetMgr.seats = _data.seats;
            self.syncqipan(_data.goBoard);
        });
        this.node.on('game_begin',function(data){
            var _data = data.detail;
            self._btnloser.active = true;
            console.log('game_begin');
            self.clearspriteframe();
            self._gameStartNode.play();
            var btn_ready = cc.find("Canvas/btn_ready");
            btn_ready.active = false;
            var btn_start = cc.find("Canvas/btn_start");
            btn_start.active = false;
            var btnready = cc.find("Canvas/btnready");
            btnready.active = false;
            var btnstart = cc.find("Canvas/btnstart");
            btnstart.active = false;
            // setTimeout(() => {
            //     self._gameStartNode.active = false;
            // }, 1000);
        });
        this.node.on('game_turn',function(data){
            var _data = data.detail;
            //console.log('game_turn: ' + _data.userId + 'play chess');
        });
        this.node.on('drop_notify',function(data){
            var _data = data.detail;
            self.chessmanResponse(_data);
        });

        this.node.on('game_end',function(data){
            var _data = data.detail.results;
            self._gamestate = 'game_over';
            self._btnloser.active = false;
            for (let i = 0; i < _data.length; i++) {
                if(_data[i].userId == cc.vv.userMgr.userId){
                    if(_data[i].score > 0){
                        setTimeout(() => {
                            cc.vv.alert.show('您赢了' + _data[i].score + '金币');
                        }, 500);
                    }
                    else{
                        var _score = -1 * _data[i].score;
                        setTimeout(() => {
                            cc.vv.alert.show('您输了' + _score + '金币');
                        }, 500);
                    }
                }
            }
            if(cc.vv.gameNetMgr.conf.creator == cc.vv.userMgr.userId){
                var btn_ok = cc.find("Canvas/alert/btn_ok");
                btn_ok.on('touchstart', function ( event ) {
                    setTimeout(() => {
                        self.studyMoneyNode.active = true;
                    }, 500);
                  });
            }
            var _studyMoney = cc.find("Canvas/Get_title/xuefei").getComponent(cc.Label);
            _studyMoney.string = "学费:0";
        });

        this.node.on('user_coins_notify',function(data){
            var _data = data.detail;
            if(_data.userId == cc.vv.gameNetMgr.conf.creator){
                self.setSelf(_data.userId,_data.coins);
            }
            else{
                self.setUser(_data.userId,_data.coins);
            }
        });

        this.node.on('giveup_notify',function(data){
            var _data = data.detail;
            if(_data.error){
                cc.vv.alert.show('认输失败了');
            }
        });
        
        this.node.on('game_playing',function(data){
            var _data = data.detail;
            self._gamestate = 'playing';
        });

        this.node.on('dissolve_done',function(data){
            cc.director.loadScene('hall');
        });

        this.node.on('exit_notify',function(data){
            console.log(exit_notify_push);
        });
        //cc.vv.alert.show("钻石不足，创建房间失败!");
    },
    onBtnWeichatClicked:function(){
        var title = "<五子棋>";
        cc.vv.anysdkMgr.share("你的好友邀请你进入三公王棋牌" + title,"房号:" + cc.vv.gameNetMgr.roomId);
    },

    studyMoneyClick:function(){
        cc.vv.transition.active(this.studyMoneyNode);
    },
    studyMoneyClose:function(){
        this.studyMoneyNode.active = false;
    },
    setStudyMoney:function(){       //输入想设置的学费
        var _studymoney = cc.find("Canvas/studymoney/editBox");
        var _studymoneyStr = _studymoney.getComponent(cc.EditBox).string;
        if(_studymoneyStr != '' && parseInt(_studymoneyStr) <= cc.vv.userMgr.coins){
            cc.vv.net.send("stake",_studymoneyStr);
            this.studyMoneyNode.active = false;
        }
        else{
            cc.vv.alert.show("请设置学费");
        }
    },
    setSelf:function(_userid,_money){
        cc.vv.userMgr.coins = _money;
        var userid = cc.find("Canvas/self/id");
        userid.getComponent(cc.Label).string = "ID:" + _userid;
        var money = cc.find("Canvas/self/bg1/money");
        money.getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(_money);
        var imgLoader = this.mimeHeadImg.node.getComponent("ImageLoader");
        imgLoader.setUserID(_userid);
    },
    setUser:function(_userid,_money){
        var userid = cc.find("Canvas/user/id");
        userid.getComponent(cc.Label).string = "ID:" + _userid;
        var money = cc.find("Canvas/user/bg1/money");
        money.getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(_money);
        var imgLoader = this.otherHeadImg.node.getComponent("ImageLoader");
        imgLoader.setUserID(_userid);
    },
    setToMoney:function(_userid,_addmoney){
        if(_userid == cc.vv.gameNetMgr.conf.creator)
        {
            let money = cc.find("Canvas/self/bg1/money");
            money.getComponent(cc.Label).string = parseInt(money.getComponent(cc.Label).string) + _addmoney;
        }
        else{
            let money2 = cc.find("Canvas/user/bg1/money");
            money2.getComponent(cc.Label).string = parseInt(money2.getComponent(cc.Label).string) + _addmoney;
        }
    },

    touchChessmen:function(event){
        var nodeName = event.target.name;
        var _x = nodeName.split('-')[0];
        var _y = nodeName.split('-')[1];
        console.log("touch node x:" + _x + "  y:"+_y);
        var data = {x:_x,y:_y};
        cc.vv.net.send("drop",data);
    },
    chessmanResponse:function(data){
        if(!data.error){
            var nodestr = data.pointX + '-' + data.pointY;
            console.log('nodestr : ' + nodestr);
            var node = this._chessmen.getChildByName(nodestr);
            console.log("node :" + node);
            this.setspriteframe(node,data.userid);
        }
        else{
            console.log(data.error);
        }
    },
    setspriteframe:function(node,_userid){
        var chessimgstr = null;
        if(_userid == cc.vv.gameNetMgr.conf.creator){
            chessimgstr = "black";
        }
        else{
            chessimgstr = "white";
        }
        cc.loader.loadRes("textures/wrapper/wuziqi",cc.SpriteAtlas,function(err,atlas){
            var spriteframe = atlas.getSpriteFrame(chessimgstr);
            var childnode = new cc.Node();
            var sp = childnode.addComponent(cc.Sprite);
            sp.spriteFrame = spriteframe;
            node.addChild(childnode);
        });
    },
    setspriteframe2:function(node,id){
        var chessimgstr = null;
        if(id == 0){
            chessimgstr = "black";
        }
        else{
            chessimgstr = "white";
        }
        cc.loader.loadRes("textures/wrapper/wuziqi",cc.SpriteAtlas,function(err,atlas){
            var spriteframe = atlas.getSpriteFrame(chessimgstr);
            var childnode = new cc.Node();
            var sp = childnode.addComponent(cc.Sprite);
            sp.spriteFrame = spriteframe;
            node.addChild(childnode);
        });
    },
    clearspriteframe:function(){
        for (let i = 0; i < this._chessmen.childrenCount; i++) {
            this._chessmen.children[i].removeAllChildren();
        }
    },
    syncqipan:function(_goBoard){
        if(_goBoard){
            for (let i = 0; i < _goBoard.length; i++) {
                var hang = _goBoard[i];
                for (let y = 0; y < hang.length; y++) {
                    if(hang[y] == 0 || hang[y] == 1){
                        var nodestr = i + '-' + y;
                        var node = this._chessmen.getChildByName(nodestr);
                        this.setspriteframe2(node,hang[y]);
                    }
                }
            }
        }
    },

});
