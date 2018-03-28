cc.Class({
    extends: cc.Component,

    properties: {
        lblRoomNo:{
            default:null,
            type:cc.Label,
        },
        _userListNode:{
            default:null,
            type:cc.Node,
        },
        _seats:[],
        _lastPlayingSeat:null,
        _playingSeat:null,
        _userlist_item:cc.prefab,
        _userListContent:null,
        _userNotifyRootNode:null,
        _otherUsers:null,
        _peopleGetKicked:null,
        _PeopleDropped: [],
        _voiceMsgQueue:[],
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        let self = this;

        cc.loader.loadRes("prefabs/userlist_item",function(err,prefab){
            self._userlist_item = cc.instantiate(prefab);
        });
        
        
        this.initView();
        this.initSelfInfo();
        //this.initSeats();
        this.initprepareseats();
        this.initEventHandlers();
    },
    initView:function(){
        var prepare = this.node.getChildByName("prepare");
        var seats = prepare.getChildByName("seats");
        for(var i = 0; i < seats.children.length; ++i){
            this._seats.push(seats.children[i].getComponent("Seat"));
            var sitdown = cc.find("actionBtn/btnsitdown",seats.children[i]);
            var icon = seats.children[i].getChildByName("icon");
            if(sitdown){
                var str = "sitdown"+ (i+1);
                cc.vv.utils.addClickEvent(sitdown,this.node,"SGRoom",str);
            }
            // if(icon){
            //     var str = "clickPicture"+ (i+1);
            //     cc.vv.utils.addClickEvent(icon,this.node,"SGRoom",str);
            // }
        }

        if(cc.vv.gameNetMgr.conf.seatNum == 6){
            seats.children[6].active = false;
            seats.children[7].active = false;
        }

        this.refreshBtns();
        this.lblRoomNo = cc.find("Canvas/infobar/Z_room_txt/New Label").getComponent(cc.Label);
        this._timeLabel = cc.find("Canvas/infobar/time").getComponent(cc.Label);
        this.lblRoomNo.string = cc.vv.gameNetMgr.roomId;

        var btnWechat = cc.find("Canvas/prepare/btnWeichat");
        if(btnWechat){
            cc.vv.utils.addClickEvent(btnWechat,this.node,"SGRoom","onBtnWeichatClicked");
        }
        var btnsettings = cc.find("Canvas/btn_settings");
        if(btnsettings){
            cc.vv.utils.addClickEvent(btnsettings,this.node,"SGRoom","onBtnSettingsClicked");
        }
        // var btnExit = this.node.getChildByName("btn_exit");
        // if(btnExit){
        //     cc.vv.utils.addClickEvent(btnExit,this.node,"SGRoom","onBtnExit");
        // }

        var btnready = cc.find("Canvas/prepare/btnready");
        if(cc.vv.gameNetMgr.conf.creator == cc.vv.userMgr.userId){
            console.log("readyBtn active true");
            btnready.active = true;
        }
        else{
            console.log("readyBtn active false");
            btnready.active = false;
        }
        if(btnready){
            cc.vv.utils.addClickEvent(btnready,this.node,"SGRoom","gameReady");
        }

        var closeBank = cc.find("Canvas/bank/close");
        if(closeBank){
            cc.vv.utils.addClickEvent(closeBank,this.node,"SGRoom","initSelfInfo");
        }

        this._userListNode = cc.find("Canvas/prepare/userlist");

        var btnuserlist = cc.find("Canvas/prepare/userlist/btnuserlist");
        if(btnuserlist){
            cc.vv.utils.addClickEvent(btnuserlist,this.node,"SGRoom","popupUserList");
        }

        this._userListContent = cc.find("Canvas/prepare/userlist/userlistbg/view/content");

        this._userNotifyRootNode = cc.find("Canvas/userNotify");

        var btnChongZhi = cc.find("Canvas/prepare/selfinfo/seat/btncun");
        if(cc.vv.gameNetMgr.conf.type == "sangong"){
            if(btnChongZhi){
                cc.vv.utils.addClickEvent(btnChongZhi,this.node,"SGRoom","chongzhiTips");
            }
        }
        else{
            btnChongZhi.active = false;
        }

        var btnWeichat = cc.find("Canvas/prepare/btnWeichat");
        if(btnWeichat){
            cc.vv.utils.addClickEvent(btnWeichat,this.node,"SGRoom","onBtnWeichatClicked");
        }
    },

    chongzhiTips:function(){
        cc.vv.alert.show("充值元宝请联系代理");
    },
    
    onShare:function(){
        cc.vv.anysdkMgr.share("三公扑克","三公扑克，包含了百人三公玩法。");
    },

    // clickPicture1:function(){
    //     this.getData(0);
    // },
    // clickPicture2:function(){
    //     this.getData(1);
    // },
    // clickPicture3:function(){
    //     this.getData(2);
    // },
    // clickPicture4:function(){
    //     this.getData(3);
    // },
    // clickPicture5:function(){
    //     this.getData(4);
    // },
    // clickPicture6:function(){
    //     this.getData(5);
    // },
    // clickPicture7:function(){
    //     this.getData(6);
    // },
    // clickPicture8:function(){
    //     this.getData(7);
    // },
    // getData:function(obj){
    //     var data = cc.vv.gameNetMgr.seats[obj].seatUserId;
    //     for(var i = 0;i < cc.vv.gameNetMgr.users.length;++i){
    //         if(data == cc.vv.gameNetMgr.users[i].userId){
    //             cc.vv.userinfoShow.show(cc.vv.gameNetMgr.users[i]);
    //         }
    //     }
    // },

    initSelfInfo:function(){
        var selfinfo = cc.find("prepare/selfinfo/seat",this.node);
        selfinfo.getChildByName("name").getComponent(cc.Label).string = cc.vv.userMgr.userName;
        if(cc.vv.gameNetMgr.conf.type == 'sangong'){
            selfinfo.getChildByName("score").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.gamegold);
            cc.loader.loadRes("textures/wrapper/public",cc.SpriteAtlas,function(err,atlas){
                let spriteframe = atlas.getSpriteFrame("gamegold");
                selfinfo.getChildByName("gamegold").getComponent(cc.Sprite).spriteFrame = spriteframe;
            });
        }
        else{
            selfinfo.getChildByName("score").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.coins);
            cc.loader.loadRes("textures/wrapper/public",cc.SpriteAtlas,function(err,atlas){
                let spriteframe = atlas.getSpriteFrame("money");
                selfinfo.getChildByName("gamegold").getComponent(cc.Sprite).spriteFrame = spriteframe;
            });
            var roomNumber = cc.find("Canvas/infobar/Z_room_txt");
            roomNumber.active = false;
        }
        var icon = cc.find("prepare/selfinfo/seat/icon",this.node).getComponent("ImageLoader");
        icon.setUserID(cc.vv.userMgr.userId);
    },
    initSeats:function(){
        var seats = cc.vv.gameNetMgr.seats;
        for(var i = 0; i < seats.length; ++i){
            if(seats[i].name != ""){
                this.initSingleSeat(seats[i]);
            }
        }
    },
    initprepareseats:function(){
        if(cc.vv.gameNetMgr.conf.seatNum == 6){

        }
    },
    initEventHandlers:function(){
        var self = this;
        this.node.on('new_user',function(data){
            console.log("有用户进来了:"+data);
            //self.initSingleSeat(data.detail);
        });
        
        this.node.on('user_state_changed',function(data){
            if(data.detail.userid){
                if(cc.vv.gameNetMgr.conf.type != "sangong"){
                    self.leaveSeat(data.detail.userid);
                    self.pushUserList(data.detail.userid);
                    if(self.pushUserList.length > 0){
                        for(let i =0;i < self.pushUserList.length;i++){
                            if(self.pushUserList[i] == data.detail.userid){
                                break;
                            }
                            else if(i == self.pushUserList.length - 1 && self.pushUserList[i] != data.detail.userid){
                                self._PeopleDropped.push(data.detail.userid);
                            }
                        }
                    }
                    else{
                        self._PeopleDropped.push(data.detail.userid);
                    }
                }
            }
            else if(data.detail.userId){
                self.leaveSeat(data.detail.userId);
                self.pushUserList(data.detail.userId);
                if(self.pushUserList.length > 0){
                    for(let i =0;i < self.pushUserList.length;i++){
                        if(self.pushUserList[i] == data.detail.userId){
                            break;
                        }
                        else if(i == self.pushUserList.length - 1 && self.pushUserList[i] != data.detail.userId){
                            self._PeopleDropped.push(data.detail.userId);
                        }
                    }
                }
                else{
                    self._PeopleDropped.push(data.detail.userId);
                }
            }
            //self.initSingleSeat(data.detail);
        });
        
        this.node.on('game_begin',function(data){
            self.refreshBtns();
            self.initSeats();
        });
        
        this.node.on('game_num',function(data){
            self.refreshBtns();
        });

        this.node.on('voice_msg',function(data){
            var voice = cc.sys.localStorage.getItem("voice");
            if(voice == "1"){
                var data = data.detail;
                self._voiceMsgQueue.push(data);
                self.playVoice();
            }
        });
        this.node.on('allvoice_msg',function(data){
            if(!data.err){
                var voice = cc.sys.localStorage.getItem("voice");
                if(voice == "1"){
                    var data = data.detail;
                    self._voiceMsgQueue.push(data);
                    self.playVoice();
                }
            }
            else{
                cc.vv.alert.show('钻石不足，请充值');
            }

        });
        
        
        this.node.on('chat_push',function(data){
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getUserNameByID(data.sender);
            var _type = "diction";
            self.playUserNotify(idx,data.content,_type);
            // var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            // self._seats[localIdx].chat(data.content);
            // self._seats2[localIdx].chat(data.content);
        });
        
        this.node.on('quick_chat_push',function(data){
            var data = data.detail;
            var idx = cc.vv.gameNetMgr.getUserNameByID(data.sender);
            //var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
            var index = data.content;
            var info = cc.vv.chat.getQuickChatInfo(index);
            var _type = "diction";
            self.playUserNotify(idx,info.content,_type);
            // self._seats[localIdx].chat(info.content);
            // self._seats2[localIdx].chat(info.content);
            //播放文字对应的语音
            //cc.vv.audioMgr.playSFX(info.sound);
        });
        
        this.node.on('emoji_push',function(data){
            var t = cc.sys.localStorage.getItem("bullet");
            if(t != null){
                if(parseInt(t) > 0){
                    var data = data.detail;
                    //var localIdx = cc.vv.gameNetMgr.getLocalIndex(idx);
                    var seats = cc.vv.gameNetMgr.seats;
                    for(let i = 0;i < seats.length;i++){
                        if(seats[i].seatUserId == data.sender){
                            if(self._PeopleDropped.length > 0){
                                for(let j = 0;j < self._PeopleDropped.length;j++){
                                    if(self._PeopleDropped[j] == data.sender){
                                        var _type = "emoji";
                                        var idx = cc.vv.gameNetMgr.getUserNameByID(data.sender);
                                        self.playUserNotify(idx,data.content,_type);
                                        return;
                                    }
                                    else if(j == self._PeopleDropped - 1 && self._PeopleDropped[j] != data.sender){
                                        self._seats[seats[i].seatIndex].emoji(data.content);
                                        return;
                                    }
                                }
                            }
                            else{
                                self._seats[seats[i].seatIndex].emoji(data.content);
                                break;
                            }
                        }
                        else if(i == seats.length - 1 && seats[i].seatUserId != data.sender){
                            var _type = "emoji";
                            var idx = cc.vv.gameNetMgr.getUserNameByID(data.sender);
                            self.playUserNotify(idx,data.content,_type);
                        }
                    }
                    //self._seats2[localIdx].emoji(data.content);
                }
            }
        });

        this.node.on("room_seatdown",function(data){
            var _data = data.detail;
            self.sitdown(_data);
            if(self._PeopleDropped.length > 0){
                for(let j = 0;j < self._PeopleDropped.length;j++){
                    if(self._PeopleDropped[j] == _data.userId){
                        self._PeopleDropped.splice(j,1);
                    }
                }
            }
        });
        this.node.on("user_yuanbaos_notify",function(data){
            var _data = data.detail;
            self.updateSeatGamegoldinfo(_data);
            let game = self.getComponent("SGGame");
            game.isShowCM();
        });
        this.node.on("user_coins_notify",function(data){
            var _data = data.detail;
            self.updateSeatCoinsinfo(_data);
            let game = self.getComponent("SGGame");
            game.isShowCM();
        });
        this.node.on("kick_notify",function(data){
            self.leaveSeat(data.detail.kickedUserId);
            self.pushUserList(data.detail.kickedUserId);
        });

    },
    playVoice:function(){
        if(this._playingSeat == null && this._voiceMsgQueue.length){
            console.log("playVoice");
            var data = this._voiceMsgQueue.shift();
            var seat = cc.vv.gameNetMgr.getSeatByID(data.sender);
            if(seat){
                this._playingSeat = seat.seatIndex;
                this._seats[seat.seatIndex].voiceMsg(true);
            }
            //this._seats2[localIndex].voiceMsg(true);
            
            var msgInfo = JSON.parse(data.content);
            
            var msgfile = "voicemsg.amr";
            console.log(msgInfo.msg.length);
            cc.vv.voiceMgr.writeVoice(msgfile,msgInfo.msg);
            cc.vv.voiceMgr.play(msgfile);
            this._lastPlayTime = Date.now() + msgInfo.time;
        }
    },
    refreshBtns:function(){
        var prepare = this.node.getChildByName("prepare");
        var btnExit = this.node.getChildByName("btn_exit");
        var btnDispress = prepare.getChildByName("btnDissolve");
        var btnWeichat = prepare.getChildByName("btnWeichat");
        var btnBack = prepare.getChildByName("btnBack");
        var isIdle = cc.vv.gameNetMgr.numOfGames == 0;
        
        //btnExit.active = !cc.vv.gameNetMgr.isOwner() && isIdle;
        //btnDispress.active = cc.vv.gameNetMgr.isOwner() && isIdle;
        
        btnWeichat.active = isIdle;
        // var btnready = prepare.getChildByName("btnready");
        // if(cc.vv.gameNetMgr.conf.creator == cc.vv.userMgr.userId){
        //     btnready.active = true;
        // }
        // else{
        //     btnready.active = false;
        // }
        //btnBack.active = isIdle;
    },
    initSingleSeat:function(seat){
        var isOffline = !seat.online;
        //var isZhuang = seat.seatIndex == cc.vv.gameNetMgr.button;
        //console.log("isOffline:" + isOffline);
        var users = cc.vv.gameNetMgr.users;
        var seats = cc.vv.gameNetMgr.seats;
        var userindex = cc.vv.gameNetMgr.getUserIndexByID(seat.userId);
        var seatindex = seat.seatIndex;
        seats[seatindex].name = users[userindex].name;
        if(cc.vv.gameNetMgr.conf.type == 'sangong'){
            seats[seatindex].score = users[userindex].yuanbaos;
        }
        else{
            seats[seatindex].score = users[userindex].coins;
        }
        this._seats[seatindex].setInfo(seats[seatindex].name,seats[seatindex].score);
        this._seats[seatindex].setID(seats[seatindex].seatUserId);
        this._seats[seatindex].voiceMsg(false);
    },
    leaveSeat:function(obj){
        var seats = cc.vv.gameNetMgr.seats;
        for(let i = 0;i < seats.length;i++){
            if(seats[i].seatUserId == obj){
                this._seats[i].setInfo("",0);
            }
        }
    },

    clearSingleSeat:function(userid){
        var seats = cc.vv.gameNetMgr.seats;
        for (var i = 0; i < seats.length; i++) {
            if(seats[i].seatUserId == userid){
                this._seats[i].setInfo('',0);
            }
        }
    },
    loadSeatInfo:function(){
        var seatsinfo = cc.vv.gameNetMgr.seats;
        var usersinfo = cc.vv.gameNetMgr.users;
        for (var i = 0; i < seatsinfo.length; i++) {
            var index = seatsinfo[i].seatIndex;
            var seat = this._seats[index];
            for (let y = 0; y < usersinfo.length; y++) {
                if(seatsinfo[i].seatUserId == usersinfo[y].userId){
                    if(cc.vv.gameNetMgr.conf.type == 'sangong'){
                        this._seats[i].setInfo(usersinfo[y].name,usersinfo[y].yuanbaos);
                    }
                    else{
                        this._seats[i].setInfo(usersinfo[y].name,usersinfo[y].coins);
                    }
                    this._seats[i].setID(usersinfo[y].userId);
                }
            }
        }
    },

    onBtnSettingsClicked:function(){
        cc.vv.popupMgr.showSettings();
    },
    onBtnDissolveClicked:function(){
        cc.vv.alert.show(/*"解散房间",*/"解散房间不扣房卡，是否确定解散？",function(){
            cc.vv.net.send("dispress");
        },true);
    },
    // onBtnExit:function(){
    //     cc.vv.net.send("exit");
    // },
    onBtnWeichatClicked:function(){
        var title = "<三公>";
        cc.vv.anysdkMgr.share("你的好友邀请你进入三公王棋牌" + title,"房号:" + cc.vv.gameNetMgr.roomId);
    },

    gameReady:function(){
        var btnready = cc.find("Canvas/prepare/btnready");
        btnready.active = false;
        cc.vv.net.send("startGame");
    },
    
    sitdown1:function(){
        cc.vv.net.send("seat_down","0");
    },
    
    sitdown2:function(){
        cc.vv.net.send("seat_down","1");
    },
    
    sitdown3:function(){
        cc.vv.net.send("seat_down","2");
    },
    
    sitdown4:function(){
        cc.vv.net.send("seat_down","3");
    },
    
    sitdown5:function(){
        cc.vv.net.send("seat_down","4");
    },
    
    sitdown6:function(){
        cc.vv.net.send("seat_down","5");
    },
    
    sitdown7:function(){
        cc.vv.net.send("seat_down","6");
    },
    
    sitdown8:function(){
        cc.vv.net.send("seat_down","7");
    },
    sitdown:function(data){
        console.log("sitdown:");
        var seats = cc.vv.gameNetMgr.seats;
        var seatindex = cc.vv.gameNetMgr.getSeatIndexByID(data.userId);
        this.clearSingleSeat(data.userId);
        if(seatindex != -1)
        {
            seats[seatindex].seatUserId = '0';
        }
        seats[data.seatIndex].seatUserId = data.userId;
        this.initSingleSeat(data);
    },
    updateSeatGamegoldinfo:function(data){
        var userindex = cc.vv.gameNetMgr.getUserIndexByID(data.userid);
        var users = cc.vv.gameNetMgr.users;
        users[userindex].yuanbaos = data.yuanbaos;
        cc.vv.gameNetMgr.syncUserinfoToSeatinfo();
        var seatindex = cc.vv.gameNetMgr.getSeatIndexByID(data.userid);
        if(seatindex != -1){
            this._seats[seatindex].setInfo(users[userindex].name,users[userindex].yuanbaos);
        }

        if(data.userid == cc.vv.userMgr.userId){
            cc.vv.userMgr.gamegold = data.yuanbaos;
            this.initSelfInfo();
        }
    },
    updateSeatCoinsinfo:function(data){
        var userindex = cc.vv.gameNetMgr.getUserIndexByID(data.userid);
        var users = cc.vv.gameNetMgr.users;
        users[userindex].coins = data.coins;
        cc.vv.gameNetMgr.syncUserinfoToSeatinfo();
        var seatindex = cc.vv.gameNetMgr.getSeatIndexByID(data.userid);
        if(seatindex != -1){
            this._seats[seatindex].setInfo(users[userindex].name,users[userindex].coins);
        }

        if(data.userid == cc.vv.userMgr.userId){
            cc.vv.userMgr.coins = data.coins;
            this.initSelfInfo();
        }
    },

    popupUserList:function(){
        this.pushUserList();
        if(this._userListNode.x == 647){
            let move = cc.moveTo(0.5,cc.p(397,0));
            this._userListNode.runAction(move);
        }
        else{
            let move = cc.moveTo(0.5,cc.p(647,0));
            this._userListNode.runAction(move);
        }
    },
    pushUserList:function(obj){
        var users = cc.vv.gameNetMgr.users;
        if(obj){
            this._peopleGetKicked = obj;
        }
        if(users.length > 1){
            for (let i = 0; i < users.length - 1; i++) {
                for (let j = i + 1; j < users.length; j++) {
                    if(users[i].userId == this._peopleGetKicked){
                        users.splice(i,1);
                        this._peopleGetKicked = 0;
                    }
                    else if(users[j].userId == this._peopleGetKicked){
                        users.splice(j,1);
                        this._peopleGetKicked = 0;
                    }
                    else if(users[j].userId == users[i].userId){
                        users.splice(j,1);
                    }
                }
            }
        }

        this._userListContent.removeAllChildren();
        for (let i = 0; i < users.length; i++) {
            // for(var j = users.length - 1;j >= 0;--j){

            // }
            let item = cc.instantiate(this._userlist_item);
            this._userListContent.addChild(item);
            item.getChildByName("username").getComponent(cc.Label).string = users[i].name;
            if(cc.vv.gameNetMgr.conf.type == "goldsangong"){
                item.getChildByName("moneylabel").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(users[i].coins);
                cc.loader.loadRes("textures/wrapper/public",cc.SpriteAtlas,function(err,atlas){
                    let spriteframe = atlas.getSpriteFrame("money");
                    item.getChildByName("gamegold").getComponent(cc.Sprite).spriteFrame = spriteframe;
                });
            }
            else{
                item.getChildByName("moneylabel").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(users[i].yuanbaos);
                cc.loader.loadRes("textures/wrapper/public",cc.SpriteAtlas,function(err,atlas){
                    let spriteframe = atlas.getSpriteFrame("gamegold");
                    item.getChildByName("gamegold").getComponent(cc.Sprite).spriteFrame = spriteframe;
                });
            }
            item.x = -4;
            item.y = -40 + (-70 * i);
            var head = item.getChildByName("useritemhand")
            head.height = 46;
            head.width = 46;
            var headimg = head.getComponent("ImageLoader");
            headimg.setUserID(users[i].userId);
        }
        if(users.length > 7){
            this._userListContent.height = 510 + users.length * 70;
        }
    },

    playUserNotify:function(userid,str,type){
        var t = cc.sys.localStorage.getItem("bullet");
        if(t != null){
            if(parseInt(t) > 0){
                if(type == "diction"){
                    var strNode = cc.instantiate(this._userNotifyRootNode.getChildByName("str"));
                }
                else{
                    var strNode = cc.instantiate(this._userNotifyRootNode.getChildByName("emoji"));
                    var name = strNode.getChildByName("name");
                    var emoji = strNode.getChildByName("emoji");
                }
                strNode.y = -50 + Math.random() * 100;
                strNode.x = 900;
                strNode.parent = this._userNotifyRootNode;
                if(type == "diction"){
                    strNode.getComponent(cc.Label).string = userid + ": " + str;
                }
                else{
                    name.getComponent(cc.Label).string = userid + ": " 
                    emoji.getComponent(cc.Animation).play(str);
                }
                var move = cc.moveTo(5,cc.p(-1200,strNode.y));
                var cb = cc.callFunc(function(target){
                    target.destroy();
                },this);
                var sq = cc.sequence(move,cb);
                strNode.runAction(sq);
            }
        }
    },
    
    update: function (dt) {
        var minutes = Math.floor(Date.now()/1000/60);
        if(this._lastMinute != minutes){
            this._lastMinute = minutes;
            var date = new Date();
            var h = date.getHours();
            h = h < 10? "0"+h:h;
            
            var m = date.getMinutes();
            m = m < 10? "0"+m:m;
            //this._timeLabel.string = "" + h + ":" + m;
        }
        
        
        if(this._lastPlayTime != null){
            if(Date.now() > this._lastPlayTime + 200){
                this.onPlayerOver();
                this._lastPlayTime = null;    
            }
        }
        else{
            this.playVoice();
        }
    },
    
        
    onPlayerOver:function(){
        cc.vv.audioMgr.resumeAll();
        console.log("onPlayCallback:" + this._playingSeat);
        var localIndex = this._playingSeat;
        this._playingSeat = null;
        if(localIndex){
            this._seats[localIndex].voiceMsg(false);
        }
        // this._seats2[localIndex].voiceMsg(false);
    },
    
    onDestroy:function(){
        cc.vv.voiceMgr.stop();
//        cc.vv.voiceMgr.onPlayCallback = null;
    }
});
