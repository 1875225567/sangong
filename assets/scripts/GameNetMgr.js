cc.Class({
    extends: cc.Component,

    properties: {
        dataEventHandler:null,
        roomId:null,
        maxNumOfGames:0,
        numOfGames:0,
        numOfMJ:0,
        seatIndex:-1,
        seats:null,
        users:null,
        turn:-1,
        button:-1,
        dingque:-1,
        chupai:-1,
        isDingQueing:false,
        isHuanSanZhang:false,
        gamestate:"",
        isOver:false,
        dissoveData:null,
        roomType:"",
        _medium:false,
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },
    
    reset:function(){
        this.turn = -1;
        this.chupai = -1,
        this.dingque = -1;
        this.button = -1;
        this.gamestate = "";
        this.dingque = -1;
        this.isDingQueing = false;
        this.isHuanSanZhang = false;
        this.curaction = null;
        for(var i = 0; i < this.seats.length; ++i){
            this.seats[i].name = "";
            this.seats[i].yuanbaos = 0;
            this.seats[i].coins = 0;
            this.seats[i].holds = [];
            this.seats[i].folds = [];
            this.seats[i].pengs = [];
            this.seats[i].angangs = [];
            this.seats[i].diangangs = [];
            this.seats[i].wangangs = [];
            this.seats[i].dingque = -1;
            this.seats[i].ready = false;
            this.seats[i].hued = false;
            this.seats[i].huanpais = null;
            this.huanpaimethod = -1;
        }
    },
    
    clear:function(){
        this.dataEventHandler = null;
        if(this.isOver == null){
            this.seats = null;
            this.roomId = null;
            this.maxNumOfGames = 0;
            this.numOfGames = 0;        
        }
    },
    
    dispatchEvent(event,data){
        if(this.dataEventHandler){
            this.dataEventHandler.emit(event,data);
        }
    },
    
    getSeatIndexByID:function(userId){
        for(var i = 0; i < this.seats.length; ++i){
            var s = this.seats[i];
            if(s.seatUserId == userId){
                return i;
            }
        }
        return -1;
    },

    getUserIndexByID:function(userId){
        for(var i = 0; i < this.users.length; ++i){
            var s = this.users[i];
            if(s.userId == userId){
                return i;
            }
        }
        return -1;
    },

    getUserNameByID:function(userId){
        for(var i = 0; i < this.users.length; ++i){
            var s = this.users[i];
            if(s.userId == userId){
                if(s.name != ""){
                    return s.name;
                }
                else{
                    return "-1";
                }
            }
        }
        return "-1";
    },

    isOwner:function(){
        return this.seatIndex == 0;   
    },
    
    getSeatByID:function(userId){
        var seatIndex = this.getSeatIndexByID(userId);
        var seat = this.seats[seatIndex];
        return seat;
    },
    getUserByID:function(userId){
        var userIndex = this.getUserIndexByID(userId);
        var user = this.users[userIndex];
        return user;
    },

    syncUserinfoToSeatinfo:function(){
        for (let i = 0; i < this.users.length; i++) {
            const user = this.users[i];
            var seatindex = this.getSeatIndexByID(user.userId);
            if(seatindex != -1){
                this.seats[seatindex].name = user.name;
                this.seats[seatindex].yuanbaos = user.yuanbaos;
                this.seats[seatindex].coins = user.coins;
            }
        }
    },

    clearSeatByID:function(userid){
        if(this.users){
            for (var i = 0; i < this.users.length; i++) {
                if(this.users[i].userId == userid){
                    //this.users.splice(i,1);
                    console.log("clear Seat By ID : "+this.users);
                    return this.users[i];
                }
            }
        }
    },
    
    getSelfData:function(){
        return this.seats[this.seatIndex];
    },
    
    getLocalIndex:function(index){
        var ret = (index - this.seatIndex + 4) % 4;
        return ret;
    },
    
    prepareReplay:function(roomInfo,detailOfGame){
        this.roomId = roomInfo.id;
        this.seats = roomInfo.seats;
        this.turn = detailOfGame.base_info.button;
        var baseInfo = detailOfGame.base_info;
        for(var i = 0; i < this.seats.length; ++i){
            var s = this.seats[i];
            s.seatindex = i;
            s.score = null;
            s.holds = baseInfo.game_seats[i];
            s.pengs = [];
            s.angangs = [];
            s.diangangs = [];
            s.wangangs = [];
            s.folds = [];
            console.log(s);
            if(cc.vv.userMgr.userId == s.userid){
                this.seatIndex = i;
            }
        }
        this.conf = {
            type:baseInfo.type,
        }
        if(this.conf.type == null){
            this.conf.type == "sangong";
        }
    },
    
    getWanfa:function(){
        var conf = this.conf;
        if(conf && conf.maxGames!=null && conf.maxFan!=null){
            var strArr = [];
            strArr.push(conf.maxGames + "局");
            strArr.push(conf.maxFan + "番封顶");
            if(conf.hsz){
                strArr.push("换三张");   
            }
            if(conf.zimo == 1){
                strArr.push("自摸加番");
            }
            else{
                strArr.push("自摸加底");
            }
            if(conf.jiangdui){
                strArr.push("将对");   
            }
            if(conf.dianganghua == 1){
                strArr.push("点杠花(自摸)");   
            }
            else{
                strArr.push("点杠花(放炮)");
            }
            if(conf.menqing){
                strArr.push("门清、中张");   
            }
            if(conf.tiandihu){
                strArr.push("天地胡");   
            }
            return strArr.join(" ");
        }
        return "";
    },
    
    initHandlers:function(){
        var self = this;
        cc.vv.net.addHandler("login_result",function(data){
            console.log(data);
            if(data.errcode === 0){
                var data = data.data;
                self.roomId = data.roomid;
                self.conf = data.conf;
                self.maxNumOfGames = data.conf.maxGames;
                self.numOfGames = data.numofgames;
                //self.seats = data.users;
                //self.seatIndex = self.getSeatIndexByID(cc.vv.userMgr.userId);
                self.isOver = false;
            }
            else{
                console.log(data.errmsg);
            }
            self.dispatchEvent('login_result');
        });
                
        cc.vv.net.addHandler("login_finished",function(data){
            console.log("login_finished");
            if(data.gameType == "sangong"){
                cc.director.loadScene("sggame",function(){
                    cc.vv.net.ping();
                    cc.vv.wc.hide();
                });
            }
            else if(data.gameType == "goldsangong"){
                cc.director.loadScene("sggame",function(){
                    cc.vv.net.ping();
                    cc.vv.wc.hide();
                });
            }
            else if(data.gameType == "wzq"){
                cc.director.loadScene("wzqgame",function(){
                    cc.vv.net.ping();
                    cc.vv.wc.hide();
                });
            }
            self.dispatchEvent("login_finished");
        });

        cc.vv.net.addHandler("exit_result",function(data){
            self.roomId = null;
            self.turn = -1;
            self.dingque = -1;
            self.isDingQueing = false;
            self.seats = null;
        });
        
        cc.vv.net.addHandler("exit_notify_push",function(data){
            console.log("exit_notify_push");
            var userId = data;
            console.log(userId);
            var s = self.clearSeatByID(userId);
            if(s != null){
                s.userid = 0;
                s.name = "";
                self.dispatchEvent("user_state_changed",s);
            }
            if(self.conf.type == 'wzq'){
                self.dispatchEvent("user_state_changed");
                for(let i= 0;i < self.seats.length;i++){
                    if(data == self.seats[i].userId){
                        self.seats.splice(i, 1);
                    }
                }
            }
        });
        
        cc.vv.net.addHandler("dispress_push",function(data){
            self.roomId = null;
            self.turn = -1;
            self.seats = null;
            if(self.conf.type == 'wzq'){
                cc.vv.wc.show('正在返回游戏大厅');
                cc.director.loadScene("hall");
            }
        });

        cc.vv.net.addHandler("disconnect",function(data){
            if(self.roomId == null){
                cc.vv.wc.show('正在返回游戏大厅');
                cc.director.loadScene("hall");
            }
            else{
                if(self.isOver == false){
                    cc.vv.userMgr.oldRoomId = self.roomId;
                    self.dispatchEvent("disconnect");                    
                }
                else{
                    self.roomId = null;
                }
            }
        });
        
        cc.vv.net.addHandler("user_enter_push",function(data){
            var count = self.seats.length;
            self.users.push(data);
            self.dispatchEvent('new_user',self.seats[count]);
        });

        cc.vv.net.addHandler("user_state_push",function(data){
            self.dispatchEvent('user_state_changed',data);
        });
        
        cc.vv.net.addHandler("user_ready_push",function(data){
            //console.log(data);
            var userId = data.userid;
            var seat = self.getSeatByID(userId);
            seat.ready = data.ready;
            self.dispatchEvent('user_state_changed',seat);
        });
        
        cc.vv.net.addHandler("game_holds_push",function(data){
            var seat = self.seats[self.seatIndex]; 
            seat.holds = data;
            
            for(var i = 0; i < self.seats.length; ++i){
                var s = self.seats[i]; 
                if(s.folds == null){
                    s.folds = [];
                }
                if(s.pengs == null){
                    s.pengs = [];
                }
                if(s.angangs == null){
                    s.angangs = [];
                }
                if(s.diangangs == null){
                    s.diangangs = [];
                }
                if(s.wangangs == null){
                    s.wangangs = [];
                }
                s.ready = false;
            }
            self.dispatchEvent('game_holds');
        });
         
        cc.vv.net.addHandler("game_begin_push",function(data){
            console.log('game_action_push');
            self.button = data;
            self.turn = self.button;
            self.gamestate = "begin";
            self.dispatchEvent('game_begin');
        });
        
        cc.vv.net.addHandler("game_playing_push",function(data){
            console.log('game_playing_push'); 
            self.gamestate = "playing";
            self.dispatchEvent('game_playing');
        });
        
        cc.vv.net.addHandler("game_sync_push",function(data){
            console.log("game_sync_push");
            self.numOfMJ = data.remainingGames;
            self.gamestate = data.state;
            self.button = data.button;
            self.seats = [];
            self.users = [];
            self.roomType = data.roomType;
            
            for(var i = 0; i < data.seats.length; ++i){
                // self.seats[i].name = "";
                // self.seats[i].yuanbaos = 0;
                // self.seats[i].coins = 0;
                self.seats.push(data.seats[i]);
            }
            if(data.users){
                for(var i = 0; i < data.users.length; ++i){
                    self.users.push(data.users[i]);
                }
            }

           self.dispatchEvent('game_sync',data);
        });
        
        cc.vv.net.addHandler("game_dingque_push",function(data){
            self.isDingQueing = true;
            self.isHuanSanZhang = false;
            self.gamestate = 'dingque';
            self.dispatchEvent('game_dingque');
        });
        
        cc.vv.net.addHandler("game_huanpai_push",function(data){
            self.isHuanSanZhang = true;
            self.dispatchEvent('game_huanpai');
        });
        
        cc.vv.net.addHandler("hangang_notify_push",function(data){
            self.dispatchEvent('hangang_notify',data);
        });
        
        cc.vv.net.addHandler("game_action_push",function(data){
            self.curaction = data;
            console.log(data);
            self.dispatchEvent('game_action',data);
        });
        
        cc.vv.net.addHandler("game_chupai_push",function(data){
            console.log('game_chupai_push');
            var turnUserID = data;
            var si = self.getSeatIndexByID(turnUserID);
            self.doTurnChange(si);
        });
        
        cc.vv.net.addHandler("game_num_push",function(data){
            self.numOfGames = data;
            self.dispatchEvent('game_num',data);
        });

        cc.vv.net.addHandler("game_over_push",function(data){
            console.log('game_over_push');
            var results = data.results;
            // for(var i = 0; i <  self.seats.length; ++i){
            //     self.seats[i].score = results.length == 0? 0:results[i].totalscore;
            // }
            // self.dispatchEvent('game_over',results);
            if(data){
                self.isOver = true;
                self.dispatchEvent('game_end',data);
                //self.dispatchEvent('state_showResult',data);
            }
            if(self.conf.type != 'wzq'){
                self.reset();
                for(var i = 0; i <  self.seats.length; ++i){
                    self.dispatchEvent('user_state_changed',self.seats[i]);    
                }
            }
        });
        
        cc.vv.net.addHandler("mj_count_push",function(data){
            console.log('mj_count_push');
            self.numOfMJ = data;
            self.dispatchEvent('mj_count',data);
        });
        
        cc.vv.net.addHandler("hu_push",function(data){
            console.log('hu_push');
            console.log(data);
            self.doHu(data);
        });
        
        cc.vv.net.addHandler("game_chupai_notify_push",function(data){
            var userId = data.userId;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doChupai(si,pai);
        });
        
        cc.vv.net.addHandler("game_mopai_push",function(data){
            console.log('game_mopai_push');
            self.doMopai(self.seatIndex,data);
        });
        
        cc.vv.net.addHandler("guo_notify_push",function(data){
            console.log('guo_notify_push');
            var userId = data.userId;
            var pai = data.pai;
            var si = self.getSeatIndexByID(userId);
            self.doGuo(si,pai);
        });
        
        cc.vv.net.addHandler("chat_push",function(data){
            self.dispatchEvent("chat_push",data);    
        });
        
        cc.vv.net.addHandler("quick_chat_push",function(data){
            self.dispatchEvent("quick_chat_push",data);
        });
        
        cc.vv.net.addHandler("emoji_push",function(data){
            self.dispatchEvent("emoji_push",data);
        });
        
        cc.vv.net.addHandler("dissolve_notice_push",function(data){
            console.log("dissolve_notice_push"); 
            self.dissoveData = data;
            self.dispatchEvent("dissolve_notice",data);
        });
        
        cc.vv.net.addHandler("dissolve_cancel_push",function(data){
            self.dissoveData = null;
            self.dispatchEvent("dissolve_cancel",data);
        });
        
        cc.vv.net.addHandler("voice_msg_push",function(data){
            self.dispatchEvent("voice_msg",data);
        });
        cc.vv.net.addHandler("allvoice_msg_push",function(data){
            self.dispatchEvent("allvoice_msg",data);
        });
        /**
         * 新增网络回调
         */
        //游戏开始
        cc.vv.net.addHandler("game_start_push",function(data){
            console.log("game_start_push");
            self.dispatchEvent("game_start_push",data);
        });
        //空闲
        cc.vv.net.addHandler("state_idle_notify_push",function(data){
            console.log("state_idle_notify_push");
            self.gamestate = data.state;
            self.dispatchEvent("state_idle",data);
            cc.vv.gameNetMgr.numOfGames = data.gameIndex+1;
            cc.vv.gameNetMgr.maxNumOfGames = data.gameLength;
            self.dispatchEvent('game_num');
        });
        //下注
        cc.vv.net.addHandler("state_stake_notify_push",function(data){
            console.log("state_stake_notify_push");
            self.gamestate = data.state;
            self.dispatchEvent("state_stake",data);
        });
        //开牌
        cc.vv.net.addHandler("state_turnOverCard_notify_push",function(data){
            console.log("state_turnOverCard_notify_push");
            self.gamestate = data.state;
            self.dispatchEvent("state_turnOverCard",data);
        });
        //亮牌
        cc.vv.net.addHandler("state_showCard_notify_push",function(data){
            console.log("state_showCard_notify_push");
            self.gamestate = data.state;
            self.dispatchEvent("state_showCard",data);
        });
        //结算
        cc.vv.net.addHandler("state_showResult_notify_push",function(data){
            console.log("state_showResult_notify_push");
            self.gamestate = data.state;
            self.dispatchEvent("state_showResult",data);
        });
        cc.vv.net.addHandler('getRoomHistroy_push',function(data){
            console.log("getRoomHistroy_push");
            self.dispatchEvent("getRoomHistroy",data);
        });
        //坐下
        cc.vv.net.addHandler("room_seatdown_notify_push",function(data){
            console.log("room_seatdown_notify_push");
            self.dispatchEvent("room_seatdown",data);
        });
        //下注回调
        cc.vv.net.addHandler("stake_notify_push",function(data){
            console.log("stake_notify_push");
            self.dispatchEvent("stake_notify_push",data);
            self._medium = true;
        });
        //存钱取钱下注都会收到的消息
        cc.vv.net.addHandler("user_yuanbaos_notify_push",function(data){
            console.log("user_yuanbaos_notify_push");
            self.dispatchEvent("user_yuanbaos_notify",data);
        });
        //打赏
        cc.vv.net.addHandler("tip_notify_push",function(data){
            console.log("tip_notify_push");
            self.dispatchEvent("tip_notify",data);
        });
        /**
         * 五子棋
         */
        //
        cc.vv.net.addHandler("new_user_comes_push",function(data){
            console.log("有用户进入你的五子棋房间");
            let isOnSeats = 0;
            for (let i = 0; i < self.seats.length; i++) {
                if(self.seats[i].userid == data.userInfo.userId){
                    isOnSeats++;
                }
            }
            if(isOnSeats==0){
                self.seats.push(data.userInfo/* .userId */);
            }
            self.dispatchEvent("new_user_comes",data);
        });
        cc.vv.net.addHandler("game_turn_push",function(data){
            console.log("notify game_turn_push");
            self.dispatchEvent('game_turn');
        });
        cc.vv.net.addHandler("drop_notify_push",function(data){
            console.log("drop_notify_push");
            self.dispatchEvent('drop_notify',data);
        });
        cc.vv.net.addHandler("giveup_notify_push",function(data){
            console.log("giveup_notify_push");
            self.dispatchEvent('giveup_notify',data);
        });
        cc.vv.net.addHandler("dissolve_done_push",function(data){
            console.log("dissolve_done_push");
            self.dispatchEvent('dissolve_done',data);
        });
        cc.vv.net.addHandler("user_coins_notify_push",function(data){
            console.log("user_coins_notify_push");
            self.dispatchEvent('user_coins_notify',data);
        });     
        cc.vv.net.addHandler("kick_notify_push",function(data){
            console.log("kick_notify_push");
            self.dispatchEvent('kick_notify',data);
        });
    },
    
    doGuo:function(seatIndex,pai){
        var seatData = this.seats[seatIndex];
        var folds = seatData.folds;
        folds.push(pai);
        this.dispatchEvent('guo_notify',seatData);    
    },
    
    doMopai:function(seatIndex,pai){
        var seatData = this.seats[seatIndex];
        if(seatData.holds){
            seatData.holds.push(pai);
            this.dispatchEvent('game_mopai',{seatIndex:seatIndex,pai:pai});            
        }
    },
    
    doChupai:function(seatIndex,pai){
        this.chupai = pai;
        var seatData = this.seats[seatIndex];
        if(seatData.holds){             
            var idx = seatData.holds.indexOf(pai);
            seatData.holds.splice(idx,1);
        }
        this.dispatchEvent('game_chupai_notify',{seatData:seatData,pai:pai});    
    },
    
    doPeng:function(seatIndex,pai){
        var seatData = this.seats[seatIndex];
        //移除手牌
        if(seatData.holds){
            for(var i = 0; i < 2; ++i){
                var idx = seatData.holds.indexOf(pai);
                seatData.holds.splice(idx,1);
            }                
        }
            
        //更新碰牌数据
        var pengs = seatData.pengs;
        pengs.push(pai);
            
        this.dispatchEvent('peng_notify',seatData);
    },
    
    getGangType:function(seatData,pai){
        if(seatData.pengs.indexOf(pai) != -1){
            return "wangang";
        }
        else{
            var cnt = 0;
            for(var i = 0; i < seatData.holds.length; ++i){
                if(seatData.holds[i] == pai){
                    cnt++;
                }
            }
            if(cnt == 3){
                return "diangang";
            }
            else{
                return "angang";
            }
        }
    },
    
    doGang:function(seatIndex,pai,gangtype){
        var seatData = this.seats[seatIndex];
        
        if(!gangtype){
            gangtype = this.getGangType(seatData,pai);
        }
        
        if(gangtype == "wangang"){
            if(seatData.pengs.indexOf(pai) != -1){
                var idx = seatData.pengs.indexOf(pai);
                if(idx != -1){
                    seatData.pengs.splice(idx,1);
                }
            }
            seatData.wangangs.push(pai);      
        }
        if(seatData.holds){
            for(var i = 0; i <= 4; ++i){
                var idx = seatData.holds.indexOf(pai);
                if(idx == -1){
                    //如果没有找到，表示移完了，直接跳出循环
                    break;
                }
                seatData.holds.splice(idx,1);
            }
        }
        if(gangtype == "angang"){
            seatData.angangs.push(pai);
        }
        else if(gangtype == "diangang"){
            seatData.diangangs.push(pai);
        }
        this.dispatchEvent('gang_notify',{seatData:seatData,gangtype:gangtype});
    },
    
    doHu:function(data){
        this.dispatchEvent('hupai',data);
    },
    
    doTurnChange:function(si){
        var data = {
            last:this.turn,
            turn:si,
        }
        this.turn = si;
        this.dispatchEvent('game_chupai',data);
    },
    
    connectGameServer:function(data){
        this.dissoveData = null;
        cc.vv.net.ip = data.ip + ":" + data.port;
        console.log(cc.vv.net.ip);
        var self = this;

        var onConnectOK = function(){
            console.log("onConnectOK");
            var sd = {
                token:data.token,
                roomid:data.roomid,
                time:data.time,
                sign:data.sign,
            };
            cc.vv.net.send("login",sd);
        };
        
        var onConnectFailed = function(){
            console.log("failed.");
            cc.vv.wc.hide();
        };
        cc.vv.wc.show("正在进入房间");
        cc.vv.net.connect(onConnectOK,onConnectFailed);
    },

    getNumbersToString:function(num){
        var numb = '';
        if(num > 99999999){
            numb = num / 100000000;
            numb = numb.toFixed(2);
            numb += '亿';
        }
        else if(num > 9999){
            numb = num / 10000;
            numb = numb.toFixed(2);
            numb += '万';
        }
        else{
            numb = num;
        }
        return numb;
    },
    getNumbersToString2:function(num){
        var numb = '';
        if(num > 99999999){
            numb = num / 100000000;
            numb = numb.toFixed(0);
            numb += '亿';
        }
        else if(num > 9999999){
            numb = num / 10000000;
            numb = numb.toFixed(0);
            numb += '千万';
        }
        else if(num > 999999){
            numb = num / 1000000;
            numb = numb.toFixed(0);
            numb += '百万';
        }
        else if(num > 99999){
            numb = num / 100000;
            numb = numb.toFixed(0);
            numb += '十万';
        }
        else if(num > 9999){
            numb = num / 10000;
            numb = numb.toFixed(0);
            numb += '万';
        }
        else if(num > 999){
            numb = num / 1000;
            numb = numb.toFixed(0);
            numb += '千';
        }
        else if(num > 99){
            numb = num / 100;
            numb = numb.toFixed(0);
            numb += '百';
        }
        else{
            numb = num;
        }
        return numb;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    isset:function(){
        console.log(this._medium)
    }
});
