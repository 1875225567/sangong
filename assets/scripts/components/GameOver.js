cc.Class({
    extends: cc.Component,

    properties: {
        _gameover:null,
        _gameresult:null,
        _seats:[],
        _isGameEnd:false,
        _win:null,
        _lose:null,
        _scoringNode:null,
        _scoreNode:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        if(cc.vv.gameNetMgr.conf == null){
            return;
        }
        if(cc.vv.gameNetMgr.conf.type != "wzq"){
            this._gameover = this.node.getChildByName("game_over");
        }
        
        this._gameover.active = false;
        
        this._win = this._gameover.getChildByName("win");
        this._lose = this._gameover.getChildByName("lose");
        
        this._gameresult = this.node.getChildByName("game_result");
        
        var wanfa = this._gameover.getChildByName("wanfa").getComponent(cc.Label);
        wanfa.string = cc.vv.gameNetMgr.getWanfa();
        
        var listRoot = this._gameover.getChildByName("result_list");
        for(var i = 1; i <= listRoot.childrenCount; ++i){
            var s = "s" + i;
            var sn = listRoot.getChildByName(s);
            var viewdata = {};

            viewdata.score = sn.getChildByName('score').getComponent(cc.Label);
            viewdata.poker = sn.getChildByName('poker');
            viewdata.winner = sn.getChildByName('winner');
            viewdata.loser = sn.getChildByName('loser');
            viewdata.dogfall = sn.getChildByName('dogfall');

            this._seats.push(viewdata);
        }

        this._scoringNode = this._gameover.getChildByName("scoring");
        this._scoreNode = this._gameover.getChildByName("myscore");

        //初始化网络事件监听器
        var self = this;
        //this.node.on('state_showResult',function(data){self.onGameOver(data.detail);});
        
        this.node.on('game_end',function(data){self._isGameEnd = true;});

        var btnclose = cc.find("Canvas/game_over/close");
        if(btnclose){
            cc.vv.utils.addClickEvent(btnclose,this.node,"GameOver","onGameOver_close");
        }
    },
    
    onGameOver(data,obj){
        if(cc.vv.gameNetMgr.conf.type != "wzq"){
            this.onGameOver_SG(data,obj);
        }
    },

    onGameOver_SG:function(data,obj){
        this._gameover.active = true;
        if(data.myResult){
            this._scoringNode.getComponent(cc.Label).string = data.myResult;
        }
        else{
            this._scoringNode.getComponent(cc.Label).string = 0;
        }
        if(cc.vv.gameNetMgr.conf.type == "goldsangong"){
            this._scoreNode.getComponent(cc.Label).string = cc.vv.userMgr.coins;
        }
        else{
            this._scoreNode.getComponent(cc.Label).string = cc.vv.userMgr.gamegold;
        }

        for (var i = 0; i < this._seats.length; i++) {
            if(data.result){
                if(i < data.result.length){
                    var listdata = data.result[i];
                    if(listdata.mySeatResult != null){
                        this._seats[i].score.string = listdata.mySeatResult;
                    }
                    for(var y = 0 ; y < this._seats[i].poker.childrenCount ; y++){
                        this.setPokerSpriteFrame(this._seats[i].poker.children[y],listdata.pais[y]+1);
                    }
                    this._seats[i].winner.active = false;
                    this._seats[i].loser.active = false;
                    this._seats[i].dogfall.active = false;
    
                    if(listdata.mySeatResult > 0){
                        this._seats[i].winner.active = true;
                    }
                    else if(listdata.mySeatResult < 0){
                        this._seats[i].loser.active = true;
                    }
                    else{
                        this._seats[i].dogfall.active = true;
                    }
                    if(obj){
                        var result = this._gameover.getChildByName("result_list");
                        var pokerType = result.children[i].getChildByName("pokerType");
                        this.setspriteframePokerpoints(pokerType,this.getPokerImageName(i,obj));
                    }
                }
                else{
                    var result_list = this._gameover.getChildByName("result_list");
                    result_list.children[i].active = false;
                }
            }
            else{
                this._seats[i].score.string = 0;
                this._seats[i].winner.active = false;
                this._seats[i].loser.active = false;
                //this._seats[i].dogfall.active = false;
            }
        }
        this.fadeaway(this._gameover);
    },

    onGameOver_close:function(){
        var action = this._gameover.getActionByTag(0);
        if(action){
            this._gameover.removeAllActions();
        }
        this._gameover.active = false;
        var num = parseInt(cc.vv.gameNetMgr.numOfGames);
        var maxNum = parseInt(cc.vv.gameNetMgr.maxNumOfGames);
        if(num === maxNum){
            this.scheduleOnce(function() {
                var game_result = this.node.getComponent("GameResult");
                game_result.emergeResult();
            }, 0.8);
        }
    },

    setPokerSpriteFrame:function(pokerprefab,str){
        cc.loader.loadRes("textures/wrapper/poker",cc.SpriteAtlas,function(err,atlas){
            var frame = atlas.getSpriteFrame(str);
            pokerprefab.getComponent(cc.Sprite).spriteFrame = frame;
        })
    },

    fadeaway:function(node){
        // var action = cc.fadeOut(5.0);
        // var cb = cc.callFunc(function(target){
        //     target.active = false;
        // },this);
        // var sq = cc.sequence(action,cb);
        // node.runAction(sq);
        var self = this;
        setTimeout(() => {
            node.active = false;
            var num = parseInt(cc.vv.gameNetMgr.numOfGames);
            var maxNum = parseInt(cc.vv.gameNetMgr.maxNumOfGames);
            if(num === maxNum){
                self.scheduleOnce(function() {
                    var game_result = self.node.getComponent("GameResult");
                    game_result.emergeResult();
                }, 0.8);
            }
        }, 5000);
    },

    setspriteframePokerpoints:function(node,name){
        cc.loader.loadRes("textures/wrapper/game_scene",cc.SpriteAtlas,function(err,atlas){
            var spriteframe = atlas.getSpriteFrame(name);
            node.getComponent(cc.Sprite).spriteFrame = spriteframe;
        });
    },

    getPokerImageName:function(index,obj){
        let type =  obj[index].type;
        let points = obj[index].points;
        if(type == 1){
            return ""+points;
        }
        else if(type == 2){
            return ""+points;
        }
        else if(type == 4){
            return "hunsangong";
        }
        else if(type == 8){
            return "xiaosangong";
        }
        else if(type == 16){
            return "dasangong";
        }
        else{
            return '0';
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
