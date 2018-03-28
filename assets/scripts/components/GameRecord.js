cc.Class({
    extends: cc.Component,

    properties: {
        _seats:[],
        _scoringNode:null,
        _scoreNode:null,
        _falseData:[],
        _fingerClick:null,
        _touchEnd:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        if(cc.vv.gameNetMgr.conf == null){
            return;
        }
        this._falseData = [[{poker:[12,25,34]},{score:125},{personWinner:125},{"personLoser":125},{"personDogfall":125},{"totalWinner":125},{"totalLoser":125},{"totalDogfall":125}],
                            [{poker:[12,25,34]},{score:125},{"personWinner":125},{"personLoser":125},{"personDogfall":125},{"totalWinner":125},{"totalLoser":125},{"totalDogfall":125}],
                            [{poker:[12,25,34]},{score:125},{"personWinner":125},{"personLoser":125},{"personDogfall":125},{"totalWinner":125},{"totalLoser":125},{"totalDogfall":125}]];
        var listRoot = this.node.getChildByName("result_list");
        for(var i = 0, max = listRoot.childrenCount; i < max; i += 1){
            var numberS = [];
            var childNode = listRoot.children[i];
            childNode.on(cc.Node.EventType.TOUCH_START,this.fingerClick,this);
            childNode.on(cc.Node.EventType.TOUCH_END,this.fingerLeave,this);
            for(var j = 1, childMax = childNode.childrenCount; j <= childMax; j += 1){
                var s = "s" + j;
                var sn = childNode.getChildByName(s);
                var viewdata = {};

                viewdata.score = sn.getChildByName('score').getComponent(cc.Label);
                viewdata.poker = sn.getChildByName('poker');
                //viewdata.personWinner = sn.getChildByName('personWinner');
                //viewdata.personLoser = sn.getChildByName('personLoser');
                //viewdata.personDogfall = sn.getChildByName('personDogfall');
                viewdata.totalWinner = sn.getChildByName('totalWinner');
                viewdata.totalLoser = sn.getChildByName('totalLoser');
                viewdata.totalDogfall = sn.getChildByName('totalDogfall');
                numberS.push(viewdata);
            }
            this._seats.push(numberS);
        }

        //this._scoringNode = this.node.getChildByName("scoring");
        //this._scoreNode = this.node.getChildByName("myscore");

        


        var btnclose = this.node.getChildByName("close");
        if(btnclose){
            cc.vv.utils.addClickEvent(btnclose,this.node,"GameRecord","onGameRecord_close");
        }
        this.init();
    },

    init:function(){
        this.node.on('getRoomHistroy',function(data){
            console.log(data);
        });
    },

    onGameRecord_SG:function(data,obj){
/*         if(data.myResult){
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
        } */

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
                        var result = this.node.getChildByName("result_list");
                        var pokerType = result.children[i].getChildByName("pokerType");
                        this.setspriteframePokerpoints(pokerType,this.getPokerImageName(i,obj));
                    }
                }
                else{
                    var result_list = this.node.getChildByName("result_list");
                    result_list.children[i].active = false;
                }
            }
            else{
                this._seats[i].score.string = 0;
                this._seats[i].winner.active = false;
                this._seats[i].loser.active = false;
            }
        }
    },

    recordOpen:function(){
        this.node.active = true;
        var data = {
            roomid: cc.vv.gameNetMgr.roomId,
        };
        cc.vv.net.send("get_room_histroy");
        console.log('get_room_histroy');
    },

    fingerClick:function(event){
        var point = event.touch;
        this._fingerClick = point._point.x;
    },

    fingerLeave:function(event){
        var point = event.touch;
        var touchVec = point._point.x;
        this.processingData(touchVec);
    },

    processingData:function(distance){
        var result = distance - this._fingerClick;
        var listRoot = this.node.getChildByName("result_list");
        for(var i = 0, max = listRoot.childrenCount; i < max; i += 1){
            if(listRoot.children[i].active){
                var present = i;
                break;
            }
        }
        if(result > 0){
            present -= 1;
            this.pageSwitching(present);
        }
        else if(result < 0){
            present += 1;
            this.pageSwitching(present);
        }
    },

    pageSwitching:function(data){
        var listRoot = this.node.getChildByName("result_list");
        var max = listRoot.childrenCount;
        if(data >= 0 && data < max){
            for(var i = 0; i < max; i += 1){
                if(i !== data){
                    listRoot.children[i].active = false;
                }
                else{
                    listRoot.children[i].active = true;
                }
            }
        }
    },

    onGameRecord_close:function(){
        var action = this.node.getActionByTag(0);
        if(action){
            this.node.removeAllActions();
        }
        this.node.active = false;
    },

    setPokerSpriteFrame:function(pokerprefab,str){
        cc.loader.loadRes("textures/wrapper/poker",cc.SpriteAtlas,function(err,atlas){
            var frame = atlas.getSpriteFrame(str);
            pokerprefab.getComponent(cc.Sprite).spriteFrame = frame;
        })
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
});
