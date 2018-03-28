cc.Class({
    extends: cc.Component,

    properties: {
        gameRoot:{
            default:null,
            type:cc.Node
        },
        
        prepareRoot:{
            default:null,
            type:cc.Node
        },
        tableTopPokerPrefab:cc.Prefab,
        _thetablebymoney:[],
        _gambleNode:null,
        _tabletopPokerNode:null,
        _choumaNodes:[],
        _choumaType:0,
        _pokers:null,
        _gamecount:0,
        //_jetton: null,
        _seatsPaisResults:null,
        _belleNode:null,
        _heartNode:null,
        _whetherToPlay:true,
        _whetherToWin:true,
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
        //this.addComponent("NoticeTip");
        this.addComponent("SGRoom");
        this.addComponent("GameOver");
        this.addComponent("GameResult");
        this.addComponent("Chat");
        // this.addComponent("Folds");
        this.addComponent("ReplayCtrl");
        this.addComponent("PopupMgr");
        this.addComponent("ReConnect");
        this.addComponent("Voice");
        this.addComponent("UserInfoShow");
        this.addComponent("Status");
        this.addComponent("touchPokerMgr");
        
        this.initView();
        this.initEventHandlers();
        
        this.gameRoot.active = false;
        this.prepareRoot.active = true;
        this._pokers = null;
        //this.onGameBeign();
        cc.vv.audioMgr.playBGM("room_bg.mp3");
        cc.vv.utils.addEscEvent(this.node);

        this._wingLabel = cc.find("Canvas/prepare/selfinfo/seat/wingChange").getComponent(cc.Label);
        //this._wingLabel.node.color = cc.color(255,230,0,255);
    },

    start:function(){
        cc.vv.gameNetMgr.dataEventHandler = this.node;
        console.log("enterGame");
        cc.vv.net.send("enterGame");
    },

    initEventHandlers:function(){
        var self = this;

        this.node.on('game_num',function(data){
            if(cc.vv.gameNetMgr.conf.type == "sangong"){
                self._gamecount.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
            }
        });
        
        this.node.on('login_result', function () {
            console.log('login_result');
        });

        this.node.on("start_push",function(data){
            var _data = data.detail;
            console.log("start_push");
        });

        this.node.on('game_sync',function(data){
            var _data = data.detail;
            self.onSync(_data);
            console.log("game_sync");
        });
        this.node.on('state_idle',function(data){
            var _data = data.detail;
            console.log("state_idle");
            cc.vv.gameNetMgr.gamestate = _data.state;
            self.gameRoot.active = true;
            self._gambleNode.active = true;
            self.gotoTime(_data.stateTime);
            self.clearTabletopPoker();
            self.initTabletop(false);
            //self.choumaDisabled(false);
            self.gamestartAnimation();
        });
        this.node.on('state_stake',function(data){
            var _data = data.detail;
            console.log("state_stake");
            self.gotoTime(_data.stateTime);
            self.initTabletop(true);
            //self.choumaDisabled(true);
            self.isShowCM();
            self.addscoreAnimation();
            var timeMgr = self.node.getComponent("timeManager");
            timeMgr.example(true,_data.stateTime);
        });
        this.node.on('state_turnOverCard',function(data){
            var _data = data.detail;
            console.log("state_turnOverCard");
            self.gotoTime(_data.stateTime);
            self.clearTabletopPoker();
            self.showTabletopPokerback();
            if(_data.mostStakeUserId != "" && parseInt(_data.mostStakeUserId) == cc.vv.userMgr.userId){
                var tm = self.getComponent("touchPokerMgr");
                tm.clickTouchPoker(_data.seats[_data.mostStakeSeatIndex]);
            }
            cc.vv.audioMgr.playSFX("31.mp3");
            self.initTabletop(false);
            //self.choumaDisabled(false);
        });
        this.node.on('state_showCard',function(data){
            var _data = data.detail;
            console.log("state_showCard");
            self.getComponent("touchPokerMgr").clickTouchPoker();
            self.gotoTime(_data.stateTime);
            self.clearTabletopPoker();
            self._pokers = _data.seats;
            self.startbipaiAnimation();
            self._seatsPaisResults = _data.seatsPaisResults;
            self.showTabletopPoker(self._pokers);
            
            self.initTabletop(false);
            //self.choumaDisabled(false);
        });
        this.node.on('state_showResult',function(data){
            console.log("state_showResult");
            var _data = data.detail;

            for (var i = 0; i < self._tabletopPokerNode.childrenCount; i++) {
                var xzw = self._tabletopPokerNode.children[i];
                var chipNode = xzw.getChildByName("chip");
                var _mine = chipNode.children[0].getChildByName("Label").getComponent(cc.Label);
                var _ours = chipNode.children[1].getChildByName("Label").getComponent(cc.Label);
                _mine.string = "我:0";
                _ours.string = "总:0";
            }

            if(_data.stateTime){
                self.gotoTime(_data.stateTime);
            }
            self.initTabletop(false);
            //self.choumaDisabled(false);
            self._pokers = null;
            setTimeout(() => {
                self.clearTabletopScore(_data.result);
            }, 5000);
            var gameover = self.node.getComponent("GameOver");
            gameover.onGameOver(_data,self._seatsPaisResults);
        });
        this.node.on('stake_notify_push',function(data){
            var _data = data.detail;
            if(!_data.error){
                if(cc.vv.userMgr.userId == _data.userid){
                    var parentNode = self._thetablebymoney[_data.seatIndex];
                    var moneyNode = self.newCoinsNode(self._choumaType+1);
                    var pour_item = null;
                    if(self._choumaType === 4){
                        cc.loader.loadRes("prefabs/pour",function(err,prefab){
                            pour_item = cc.instantiate(prefab);
                            moneyNode.addChild(pour_item);
                            pour_item.x = 0;
                            pour_item.y = 160;
                            pour_item.active = false;
                            self.nodeFiyAction(moneyNode,parentNode);
                            setTimeout(() => {
                                pour_item.active = true;
                                var anim = pour_item.getComponent(cc.Animation);
                                anim.play("pour");
                                setTimeout(() => {
                                    pour_item.active = false;
                                }, 780);
                            }, 320);
                        });
                        if(self._whetherToWin){
                            self._whetherToWin = false;
                            cc.vv.audioMgr.playSFX("win.mp3");
                            self.scheduleOnce(function() {
                                self._whetherToWin = true;
                            }, 5.2);
                        }
                    }
                    else{
                        self.nodeFiyAction(moneyNode,parentNode);
                    }
                    self.isShowCM();
                    self.updateSeatinfo(_data);

                    if(_data.stake != null){
                        self._wingLabel.string = "-" + _data.stake;//self._jetton;
                        var node = cc.instantiate(self._wingLabel.node);
                        var sp = cc.spawn(cc.moveTo(1.5,185,130), cc.fadeOut(1.5));
                        var cf = cc.callFunc(function(terget){
                        terget.destroy();
                    },self);
                    var sequence = cc.sequence(sp,cf);

                    node.parent = self._wingLabel.node.parent;//cc.director.getScene();
                    node.setPosition(185, 70);
                    self._wingLabel.string = "";
                    node.runAction(sequence);
                    // self._jetton = null
                    }
                }
                else{
                    var parentNode = self._thetablebymoney[_data.seatIndex];
                    var amount = self.getNumbersToString2(_data.stake);
                    for (let i = 0, max = self._gambleNode.childrenCount; i < max; i++) {
                        var numLabel = self._gambleNode.children[i].getChildByName("num").getComponent(cc.Label);
                        var count = numLabel.string;
                        if(amount === count){
                            var moneyNode = self.newCoinsNode(i + 1);
                            moneyNode.x = 645;
                            moneyNode.y = 0;
                            if(i === 4){
                                cc.loader.loadRes("prefabs/pour",function(err,prefab){
                                    pour_item = cc.instantiate(prefab);
                                    moneyNode.addChild(pour_item);
                                    pour_item.y = 35;
                                    pour_item.active = false;
                                    self.nodeFiyAction(moneyNode,parentNode);
                                    setTimeout(() => {
                                        pour_item.active = true;
                                        var anim = pour_item.getComponent(cc.Animation);
                                        anim.play("pour");
                                        setTimeout(() => {
                                            pour_item.active = false;
                                        }, 780);
                                    }, 300);
                                });
                                if(self._whetherToWin){
                                    self._whetherToWin = false;
                                    cc.vv.audioMgr.playSFX("win.mp3");
                                    self.scheduleOnce(function() {
                                        self._whetherToWin = true;
                                    }, 5.2);
                                }
                            }
                            else{
                                self.nodeFiyAction(moneyNode,parentNode);
                            }
                            break;
                        }
                    }
                }
                self.chipShow(_data);
            }
            else{
                if(cc.vv.gameNetMgr.conf.type == "sangong"){
                    cc.vv.alert.show('元宝不足，请充值');
                }
                else{
                    cc.vv.alert.show('金币不足，请充值');
                }
            }
        });

        this.node.on('tip_notify',function(data){
            var _data = data.detail;
            if(!_data.error){
                self.playtourSeatinfo(_data);
                if(_data.userId == cc.vv.userMgr.userId){
                    var anisState = self._belleNode.getAnimationState("belle");
                    if(anisState.isPlaying == false){
                        self._belleNode.play();
                    }
                    self.flyheart();
                    if(self._whetherToPlay){
                        self._whetherToPlay = false;
                        cc.vv.audioMgr.playSFX("21.mp3");
                        self.scheduleOnce(function() {
                            self._whetherToPlay = true;
                        }, 1.1);
                    }
                }
            }
        });
    },
    initView:function(){
        this._gambleNode = cc.find("Canvas/game/gamble");
        this._gambleNode.active = true;

        if(cc.vv.gameNetMgr.conf.seatNum != 6){
            this._tabletopPokerNode = cc.find("Canvas/game/tabletop8");
            var closetable = cc.find("Canvas/game/tabletop6");
            closetable.active = false;
        }
        else{
            this._tabletopPokerNode = cc.find("Canvas/game/tabletop6");
            var closetable = cc.find("Canvas/game/tabletop8");
            closetable.active = false;
        }

        this._thetablebymoney = [];
        for (let i = 0, max = cc.vv.gameNetMgr.conf.seatNum; i < max; i++) {
            var moneybgNode = this._tabletopPokerNode.children[i].getChildByName("xzw-fg");
            this._thetablebymoney.push(moneybgNode);
        }

        this.initTabletop(false);

        for (var i = 0; i < this._gambleNode.childrenCount; i++) {
            var element = this._gambleNode.children[i];
            this._choumaNodes.push(element);
        }
        //this.choumaDisabled(false);
        this.initgamble(false);
        this.initCMNumber();
        this.isShowCM();

        var gameChild = cc.find("Canvas/infobar/roominfo/remaining");
        this._gamecount = gameChild.getComponent(cc.Label);
        if(cc.vv.gameNetMgr.conf.type == "goldsangong"){
            this._gamecount.string = "金币场";
            var seq = cc.spawn(cc.scaleTo(0, 1.3, 1.3), cc.moveBy(0, 0, 20));
            gameChild.runAction(seq);
        }
        else if(cc.vv.gameNetMgr.conf.type == "sangong"){
            this._gamecount.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
            var btn = this.node.getChildByName("btn_record");
            btn.active = false;
        }

        this._belleNode = cc.find("Canvas/game/belle/belle").getComponent(cc.Animation);
        this._heartNode = cc.find("Canvas/game/heart");

        this.clearTabletopPoker();
    },

    initCMNumber:function(){
        if(cc.vv.gameNetMgr.conf.stakes){
            let stakes = cc.vv.gameNetMgr.conf.stakes;
            for (let i = 0; i < stakes.length; i++) {
                var numLabel = this._gambleNode.children[i].getChildByName("num").getComponent(cc.Label);
                //numLabel.string = cc.vv.gameNetMgr.getNumbersToString2(stakes[i]);
                numLabel.string = this.getNumbersToString2(stakes[i]);
            }
        }
    },

    getNumbersToString2:function(num){
        var numb = '';
        if(num > 99999999){
            numb = num / 100000000;
            numb += '亿';
        }
        else if(num > 9999999){
            numb = num / 10000000;
            numb += '千万';
        }
        else if(num > 9999){
            numb = num / 10000;
            numb += '万';
        }
        else if(num > 999){
            numb = num / 1000;
            numb += '千';
        }
        else if(num > 99){
            numb = num / 100;
            numb += '百';
        }
        else{
            numb = num;
        }
        return numb;
    },

    onSync:function(data){
        this._gambleNode.active = true;
        if(cc.vv.gameNetMgr.gamestate != "stop"){
            let btnready = cc.find("Canvas/prepare/btnready");
            btnready.active = false;
            this.gameRoot.active = true;
            this.gotoTime(data.getNextStateTimeLeft);
            switch (cc.vv.gameNetMgr.gamestate) {
                case 'idle':
                    console.log('onSync idle');
                    cc.vv.gameNetMgr.gamestate = data.state;
                    this.gameRoot.active = true;
                    this._gambleNode.active = true;
                    this.clearTabletopPoker();
                    this.gamestartAnimation();
                    break;
                case 'stake':
                    console.log('onSync stake');
                    this.addscoreAnimation();
                    var timeMgr = this.node.getComponent("timeManager");
                    timeMgr.example(true,data.getNextStateTimeLeft);
                    break;
                case 'turnOverCard':
                    console.log('onSync turnOverCard');
                    this.clearTabletopPoker();
                    this.showTabletopPokerback();
                    var tm = this.getComponent("touchPokerMgr");
                    tm.clickTouchPoker(data.seats[data.mostStakeSeatIndex]);
                    break;
                case 'showCard':
                    console.log('onSync showCard');
                    this.getComponent("touchPokerMgr").clickTouchPoker()
                    this.clearTabletopPoker();
                    this._pokers = data.seats;
                    this.startbipaiAnimation();
                    this._seatsPaisResults = [];
                    for (let i = 0; i <  data.seats.length; i++) {
                        this._seatsPaisResults.push({type:data.seats[i].paisResult.type,points:data.seats[i].paisResult.points});
                    }
                    this.showAllPoker(this._pokers);
                    break;
                case 'showResult':
                    console.log('onSync showResult');
                    this._pokers = null;
/*                     var gameover = this.node.getComponent("GameOver");
                    gameover.onGameOver(data); */
                    setTimeout(() => {
                        this.clearTabletopScore(data.result);
                    }, 5000);
                    break;
                default:
                    break;
            }
            if(cc.vv.gameNetMgr.gamestate == 'stake'){
                this.initTabletop(true);
                //this.choumaDisabled(true);
                this.isShowCM();
            }
            else{
                this.initTabletop(false);
                //this.choumaDisabled(false);
            }
        }
        var room = this.node.getComponent("SGRoom");
        room.loadSeatInfo();
    },

    // onGameBeign:function(){
    //     if(cc.vv.gameNetMgr.gamestate == "" && cc.vv.replayMgr.isReplay() == false){
    //         return;
    //     }
    // },
    flyheart:function(){
        // this._heartNode.removeAllChildren();
        for (let i = 0; i < 5; i++) {
            setTimeout((i) => {
            var heart = new cc.Node("heart");
            this._heartNode.addChild(heart);
            heart.addComponent(cc.Sprite);
            cc.loader.loadRes("textures/wrapper/heart/heart_"+i,cc.SpriteFrame,function(err,spriteFrame){
                heart.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
            heart.x = 210;
            heart.y = 10;
            var move = cc.moveTo(1,cc.p(-466,-580));
            var cf = cc.callFunc(function(terget){
                terget.destroy();
            },this);
            var sq = cc.sequence(move,cf);
                heart.runAction(sq);
            }, i*100,i);
        }
    },

    playtourSeatinfo : function(_data){
        var data = {userid:_data.userId,stake:_data.tip};
        this.updateSeatinfo(data);
    },

    playtour:function(){
        cc.vv.net.send('tip');
    },

    gotoTime:function(time){
        var timeMgr = this.node.getComponent("timeManager");
        timeMgr.runTime(time);
    },

    initTabletop:function(isfg){
        var tt = this._tabletopPokerNode;
        for (var i = 0; i < tt.childrenCount; i++) {
            var element = tt.children[i];
            element.getChildByName("xzw-fg").active = isfg;
        }
    },
    
    clearTabletopPoker:function(){
        for (var i = 0; i < this._tabletopPokerNode.childrenCount; i++) {
            var xzw = this._tabletopPokerNode.children[i];
            xzw.getChildByName("tabletopPokers").removeAllChildren();
            xzw.getChildByName("pokerType").removeAllChildren();
        }
    },

    showAllPoker:function(seatsPoker){
        if(seatsPoker!=null){
            for (var i = 0; i < seatsPoker.length; i++) {
                var xzw = this._tabletopPokerNode.children[i];
                var pokerNode = xzw.getChildByName("tabletopPokers");
                var poker = seatsPoker[i];
                for (var x = 0; x < 3; x++) {
                    var pokerprefab = cc.instantiate(this.tableTopPokerPrefab);
                    pokerNode.addChild(pokerprefab);
                    pokerprefab.x = -30 + x * 30;
                    pokerprefab.y = 0;
                    var str = ""+(poker.holds[x]+1);
                    this.setPokerSpriteFrame(pokerprefab,str);
                }
                this.setPokerPointsImage(i);
            }
        }
    },

    showTabletopPoker:function(seatsPoker){
        if(seatsPoker!=null){
            for (var i = 0; i < seatsPoker.length; i++) {
                var xzw = this._tabletopPokerNode.children[i];
                var pokerNode = xzw.getChildByName("tabletopPokers");
                for (var x = 0; x < 3; x++) {
                    var pokerprefab = cc.instantiate(this.tableTopPokerPrefab);
                    pokerNode.addChild(pokerprefab);
                    pokerprefab.x = -30 + x * 30;
                    pokerprefab.y = 0;
                    if(i == seatsPoker.length - 1 && x == 2){
                        this.theFirstRow(seatsPoker);
                    }
                }
            }
        }
    },

    theFirstRow:function(seatsPoker){
        var self = this;
        var count = 0;
        var callback = function () {
            var xzw = self._tabletopPokerNode.children[count];
            var pokerNode = xzw.getChildByName("tabletopPokers");
            var poker = seatsPoker[count];
            if(count == seatsPoker.length - 1){
                self.unschedule(callback);
            }
            var points = "z" + (count + 1);
            cc.vv.audioMgr.playSFX(points + ".mp3");
            self.scheduleOnce(function() {
                if(pokerNode){
                    for (var x = 0; x < 3; x++) {
                        var pokerprefab = pokerNode.children[x];
                        var str = ""+(poker[x]+1);
                        self.setPokerSpriteFrame(pokerprefab,str);
                    }
                }
                self.setPokerPointsImage(count);
                let type =  this._seatsPaisResults[count].type;
                let points = this._seatsPaisResults[count].points;
                if(type === 4 || type === 8 || type === 16){
                    cc.vv.audioMgr.playSFX("10.mp3");
                }
                else{
                    cc.vv.audioMgr.playSFX(points + ".mp3");
                }
                count++;
            }, 0.8);
        }
        this.schedule(callback, 1.8);
    },

    showTabletopPokerback:function(){
        for (var i = 0; i < this._tabletopPokerNode.childrenCount; i++) {
            var xzw = this._tabletopPokerNode.children[i];
            var pokerNode = xzw.getChildByName("tabletopPokers");
            for (var x = 0; x < 3; x++) {
                var pokerprefab = cc.instantiate(this.tableTopPokerPrefab);
                pokerNode.addChild(pokerprefab);
                pokerprefab.x = -30 + x * 30;
                pokerprefab.y = 0;
                this.setPokerSpriteFrame(pokerprefab,0);
            }
        }
    },

    chipShow:function(_data){
        var data = _data;
        var seatIndex = parseInt(data.seatIndex);
        var seatChip = this._tabletopPokerNode.children[seatIndex].getChildByName("chip");
        var ourScore = cc.find("ourScorebg/Label",seatChip).getComponent(cc.Label);
        ourScore.string = "总:" + data.seatStake;
        if(data.userid == cc.vv.userMgr.userId){
        var myScore = cc.find("myScorebg/Label",seatChip).getComponent(cc.Label);
        myScore.string = "我:" + data.userStake;
        }
    },

    setPokerSpriteFrame:function(pokerprefab,str){
        cc.loader.loadRes("textures/wrapper/poker",cc.SpriteAtlas,function(err,atlas){
            var frame = atlas.getSpriteFrame(str);
            pokerprefab.getComponent(cc.Sprite).spriteFrame = frame;
        })
    },

    initgamble:function(isshow){
        this._gambleNode.active = isshow;
        for (var i = 0; i < this._gambleNode.childrenCount; i++) {
            var element = this._gambleNode.children[i];
            element.getChildByName("guang").active = false;
        }
    },
    choumaDisabled:function(isinteractable){
        for (var i = 0; i < this._choumaNodes.length; i++) {
            this._choumaNodes[i].getComponent(cc.Button).interactable = isinteractable;
        }
        if(isinteractable == false){
            this.initgamble(true);
        }
        else{
            this._choumaNodes[0].getComponent(cc.Button).interactable = isinteractable;
        }
    },
    gamblecm1:function(){
        this._choumaType = 0;
        cc.vv.audioMgr.playSFX("click.mp3");
        this._choumaNodes[0].getChildByName("guang").active = true;
        this._choumaNodes[1].getChildByName("guang").active = false;
        this._choumaNodes[2].getChildByName("guang").active = false;
        this._choumaNodes[3].getChildByName("guang").active = false;
        this._choumaNodes[4].getChildByName("guang").active = false;
    },
    gamblecm2:function(){
        this._choumaType = 1;
        cc.vv.audioMgr.playSFX("click.mp3");
        this._choumaNodes[0].getChildByName("guang").active = false;
        this._choumaNodes[1].getChildByName("guang").active = true;
        this._choumaNodes[2].getChildByName("guang").active = false;
        this._choumaNodes[3].getChildByName("guang").active = false;
        this._choumaNodes[4].getChildByName("guang").active = false;
    },
    gamblecm3:function(){
        this._choumaType = 2;
        cc.vv.audioMgr.playSFX("click.mp3");
        this._choumaNodes[0].getChildByName("guang").active = false;
        this._choumaNodes[1].getChildByName("guang").active = false;
        this._choumaNodes[2].getChildByName("guang").active = true;
        this._choumaNodes[3].getChildByName("guang").active = false;
        this._choumaNodes[4].getChildByName("guang").active = false;
    },
    gamblecm4:function(){
        this._choumaType = 3;
        cc.vv.audioMgr.playSFX("click.mp3");
        this._choumaNodes[0].getChildByName("guang").active = false;
        this._choumaNodes[1].getChildByName("guang").active = false;
        this._choumaNodes[2].getChildByName("guang").active = false;
        this._choumaNodes[3].getChildByName("guang").active = true;
        this._choumaNodes[4].getChildByName("guang").active = false;
    },
    gamblecm5:function(){
        this._choumaType = 4;
        cc.vv.audioMgr.playSFX("click.mp3");
        this._choumaNodes[0].getChildByName("guang").active = false;
        this._choumaNodes[1].getChildByName("guang").active = false;
        this._choumaNodes[2].getChildByName("guang").active = false;
        this._choumaNodes[3].getChildByName("guang").active = false;
        this._choumaNodes[4].getChildByName("guang").active = true;
    },
    bet1:function(){
        this.sendStakeMsg(this.returnChoumaNums(),0);
    },
    bet2:function(){
        this.sendStakeMsg(this.returnChoumaNums(),1);
    },
    bet3:function(){
        this.sendStakeMsg(this.returnChoumaNums(),2);
    },
    bet4:function(){
        this.sendStakeMsg(this.returnChoumaNums(),3);
    },
    bet5:function(){
        this.sendStakeMsg(this.returnChoumaNums(),4);
    },
    bet6:function(){
        this.sendStakeMsg(this.returnChoumaNums(),5);
    },
    bet7:function(){
        this.sendStakeMsg(this.returnChoumaNums(),6);
    },
    bet8:function(){
        this.sendStakeMsg(this.returnChoumaNums(),7);
    },

    clearTable:function(){
        for (var i = 0; i < this._thetablebymoney.length; i++) {
            var element = this._thetablebymoney[i];
            element.removeAllChildren();
        }
    },
    sendStakeMsg:function(gold,index){
        //this._jetton = gold;
        var conf = {
            stake:gold,
            seatIndex:index,
        };
        cc.vv.net.send("stake",conf);
    },
    returnChoumaNums:function(){
        return cc.vv.gameNetMgr.conf.stakes[this._choumaType];
    },
    newCoinsNode:function(type){
        var node = new cc.Node('money');
        var sp = node.addComponent(cc.Sprite);
        cc.loader.loadRes("textures/wrapper/game_scene",cc.SpriteAtlas,function(err,atlas){
            var sprite = atlas.getSpriteFrame("cm-"+type);
            sp.spriteFrame = sprite;
        });

        var number = new cc.Node('num');
        //number.addComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString2(cc.vv.gameNetMgr.conf.stakes[type-1]);
        number.addComponent(cc.Label).string = this.getNumbersToString2(cc.vv.gameNetMgr.conf.stakes[type-1]);
        number.color = cc.color(0,0,0);
        number.getComponent(cc.Label).fontSize = 30;
        node.addChild(number);
        node.scaleX = 0.6;
        node.scaleY = 0.6;
        node.x = -450;
        node.y = -300;
        node.parent = this.gameRoot;
        return node;
    },

    nodeFiyAction:function(node,parentNode){
        var targetPos = {x:0,y:0};
        targetPos.x = parentNode.parent.x;
        targetPos.y = parentNode.parent.y;
        targetPos.x += (-40 + Math.random() * 80);
        targetPos.y += (-35 + Math.random() * 70);
        var move = cc.moveTo(0.3,targetPos);
        var cb = cc.callFunc(function(target){
            target.parent = parentNode;
            target.x -= parentNode.parent.x;
            target.y -= parentNode.parent.y;
        },this);
        var seq = cc.sequence(move,cb);
        node.runAction(seq);
    },
    clearTabletopScore:function(result){
        console.log("result:" + result);
        var report = 0;
        if(result){
            for (let i = 0; i < result.length; i++) {
                var cb = result[i].mySeatResult;
                if(cb > 0){
                    this.timeoutCircle(this._thetablebymoney[i]);
                }
                else{
                    var childrenNode = this._thetablebymoney[i];
                    if(childrenNode){
                        childrenNode.removeAllChildren();
                    }
                }

                if(result[i].myHaveStake != 0 && result[i].mySeatResult == 0){
                    if(result[i].myHaveStake != null){
                        report = parseInt(result[i].myHaveStake);
                    }
                    //console.log(i + "+-*/!@#$%^&*" + result[i].myHaveStake);
                }
                else{
                    if(result[i].mySeatResult != null){
                        report += parseInt(result[i].mySeatResult);
                    }
                }
            }
  
            if(report > 0){
                this._wingLabel.string = "+" + report;
            }
            else if(report == 0){
                return;
            }
            else{
                this._wingLabel.string = report;
            }

            var scene = cc.director.getScene();
            var node = cc.instantiate(this._wingLabel.node);
            var seq = cc.spawn(cc.moveTo(1.5,185,130), cc.fadeOut(1.5));

            node.parent = this._wingLabel.node.parent;
            node.setPosition(185, 70);
            this._wingLabel.string = "";
            node.runAction(seq);
            //node.destroy();
        }
    },
    
    timeoutCircle:function(nodes){
        for (let i = 0; i < nodes.childrenCount; i++) {
            this.timeoutByfor(nodes.children[i],i);
        }
    },
    
    timeoutByfor:function(node,i){
        var self = this;
        setTimeout(() => {
            if(node != null){
                self.tableMoneyAction(node);
            }
            else{
                console.log("timeoutCircle is null");
            }
        }, i*200);
    },

    tableMoneyAction:function(node){
        var move = cc.moveTo(0.3,cc.p(-450-(node.parent.x+node.x),-300-(node.parent.y+node.y)));
        node.parent = this.gameRoot;
        var cb = cc.callFunc((target)=>{
            target.destroy();
        },this);
        var seq = cc.sequence(move,cb);
        node.runAction(seq);
    },
    updateSelfinfo:function(stake){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                var selfinfo = cc.find("prepare/selfinfo/seat",this.node);
                if(cc.vv.gameNetMgr.conf.type == 'sangong'){
                    selfinfo.getChildByName("score").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(ret.yuanbaos);
                }
                else{
                    selfinfo.getChildByName("score").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(ret.coins);
                }
            }
        };
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_user_status",data,onGet.bind(this));
    },
    updateSeatinfo:function(_data){
        var userid = _data.userid;
        var stake = _data.stake;
        var room = this.node.getComponent("SGRoom");
        var seatindex = cc.vv.gameNetMgr.getSeatIndexByID(userid);
        if(seatindex != -1){
            if(cc.vv.gameNetMgr.conf.type == 'sangong'){
                cc.vv.gameNetMgr.seats[seatindex].yuanbaos -= stake;
            }
            else{
                cc.vv.gameNetMgr.seats[seatindex].coins -= stake;
            }
            var data = {userId:userid,seatIndex:seatindex};
            room.initSingleSeat(data);
        }
        var userindex = cc.vv.gameNetMgr.getUserIndexByID(userid);
        if(cc.vv.gameNetMgr.conf.type == 'sangong'){
            cc.vv.gameNetMgr.users[userindex].yuanbaos -= stake;
            cc.vv.userMgr.gamegold -= stake;
        }
        else{
            cc.vv.gameNetMgr.users[userindex].coins -= stake;
            cc.vv.userMgr.coins -= stake;
        }
        // if(userid == cc.vv.userMgr.userId){
        //     if(cc.vv.gameNetMgr.conf.type == 'sangong'){
        //         cc.vv.userMgr.gamegold -= stake;
        //     }
        //     else{
        //         cc.vv.userMgr.coins -= stake;
        //     }
        // }
        room.initSelfInfo();
    },
    isShowCM:function(){
        let myScore = 0;
        if(cc.vv.gameNetMgr.conf.type == 'sangong'){
            myScore = cc.vv.userMgr.gamegold;
        }
        else{
            myScore = cc.vv.userMgr.coins;
        }
        let showIndex = 0;
        let stakes = cc.vv.gameNetMgr.conf.stakes;
        for (let i = stakes.length; i > 0 ; i--) {
            if(myScore >= stakes[i-1]){
                showIndex = i;
                break;
            }
        }
        for (let i = 0; i < this._choumaNodes.length; i++) {
            let cm = this._choumaNodes[i];
            if(i < showIndex){
                cm.getComponent(cc.Button).interactable = true;
            }
            else{
                cm.getComponent(cc.Button).interactable = false;
                if(cm.getChildByName("guang").active){
                    cm.getChildByName("guang").active = false;
                }
            }
        }
    },
    gamestartAnimation:function(){
        let gamestartNode = cc.find("Canvas/game/gameTipsAction/gamestart");
        gamestartNode.getComponent(cc.Animation).play();
    },
    addscoreAnimation:function(){
        let addscore = cc.find("Canvas/game/gameTipsAction/startaddscore");
        addscore.getComponent(cc.Animation).play();
        cc.vv.audioMgr.playSFX("30.mp3");
    },
    startbipaiAnimation(){
        let addscore = cc.find("Canvas/game/gameTipsAction/startbipai");
        addscore.getComponent(cc.Animation).play();
        cc.vv.audioMgr.playSFX("32.mp3");
    },

    setPokerPointsImage:function(index){
        var pokerType = this._tabletopPokerNode.children[index].getChildByName("pokerType");
        var pointsNode = new cc.Node('points');
        pointsNode.addComponent(cc.Sprite);
        pokerType.addChild(pointsNode)
        this.setspriteframePokerpoints(pointsNode,this.getPokerImageName(index));
        pointsNode.y = -20;
    },

    setspriteframePokerpoints:function(node,name){
        cc.loader.loadRes("textures/wrapper/game_count",cc.SpriteAtlas,function(err,atlas){
            var spriteframe = atlas.getSpriteFrame(name);
            node.getComponent(cc.Sprite).spriteFrame = spriteframe;//game_scene
        });
    },

    getPokerImageName:function(index){
        let type =  this._seatsPaisResults[index].type;
        let points = this._seatsPaisResults[index].points;
        if(type == 1){
            //cc.vv.audioMgr.playSFX(points + ".mp3");
            return ""+points;
        }
        else if(type == 2){
            //cc.vv.audioMgr.playSFX(points + ".mp3");
            return ""+points;
        }
        else if(type == 4){
            //cc.vv.audioMgr.playSFX("10.mp3");
            return "hunsangong";
        }
        else if(type == 8){
            //cc.vv.audioMgr.playSFX("10.mp3");
            return "xiaosangong";
        }
        else if(type == 16){
            //cc.vv.audioMgr.playSFX("10.mp3");
            return "dasangong";
        }
        else{
            //cc.vv.audioMgr.playSFX("0.mp3");
            return '0';
        }
    },
});
