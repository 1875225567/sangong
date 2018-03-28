cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _gameresult:null,
        _seats:[],
        _leftrank:null,
        _rightrank:null,
        _showResult:null,
        _scoreNode:null,
        _rankList:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        this._gameresult = this.node.getChildByName("game_result");
        this._gameresult.active = false;
        
/*         this._leftrank = cc.find("Canvas/game_result/rank/leftrank/view/content");
        this._rightrank = cc.find("Canvas/game_result/rank/rightrank/view/content"); */

        this._rankList = cc.find("Canvas/game_result/rankList/rank/view/content");
        
        var btnClose = cc.find("Canvas/game_result/btnClose");
        if(btnClose){
            cc.vv.utils.addClickEvent(btnClose,this.node,"GameResult","onBtnCloseClicked");
        }
        
        var btnShare = cc.find("Canvas/game_result/btnShare");
        if(btnShare){
            cc.vv.utils.addClickEvent(btnShare,this.node,"GameResult","onBtnShareClicked");
        }

        this._scoreNode = cc.find("Canvas/game_result/myscore");

        //初始化网络事件监听器
        var self = this;
        this.node.on('game_end',function(data){self.onGameEnd(data.detail);});
    },
    
    showResult:function(index,_score){
        var self = this;
/*         this._leftrank.removeAllChildren();
        this._rightrank.removeAllChildren(); */
        this._rankList.removeAllChildren();
        cc.loader.loadRes("prefabs/rankitem",function(err,prefab){
            var count = 0;
            var rankitem = cc.instantiate(prefab);
            var itemLabel = rankitem.getChildByName("bureau").getComponent(cc.Label);
            self._rankList.addChild(rankitem);
            var num = index % 2;
            var line = index / 2;
            line = line.toFixed(0);
            if(index < 10){
                itemLabel.string = "第0" + index + "局";
            }
            else{
                itemLabel.string = "第" + index + "局";
            }
            if(index === 1){
                rankitem.x = -283;
                rankitem.y = -45;
            }
            else{
                if(num === 0){
                    rankitem.x = 308;
                }
                else{
                    rankitem.x = -283;
                }
                rankitem.y = -(((line - 1) * 80) + 45);
            }
            if(line > 5){
                self._rankList.height = line * 79;
            }
/*             if(index % 2 === 0){
                self._leftrank.addChild(rankitem);
                count = self._leftrank.childrenCount;
                if(count > 5){
                    self._leftrank.height = count * 80;
                }
            }
            else{
                self._rightrank.addChild(rankitem);
                count = self._rightrank.childrenCount;
                if(count > 5){
                    self._rightrank.height = count * 80;
                }
            }
            var bureau = rankitem.getChildByName("bureau");
            self.setItemSpriteFrame(bureau,"bureau"+(index+1));
            rankitem.x = 0;
            rankitem.y = -(((count - 1) * 80) + 45); */
            var winner = rankitem.getChildByName("winner");
            if(_score > 0){
                self.setItemSpriteFrame(winner,"winner");
            }
            else if(_score < 0)
            {
                self.setItemSpriteFrame(winner,"loser");
            }
            else{
                winner.active = false;
            }
            var score = rankitem.getChildByName("score");
            score.getComponent(cc.Label).string = _score;
        });
    },

    setItemSpriteFrame:function(node,framestr){
        cc.loader.loadRes("textures/wrapper/game_result",cc.SpriteAtlas,function(err,atlas){
            var spriteFrame = atlas.getSpriteFrame(framestr);
            node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    },

    onGameEnd:function(endinfo){
        //this._gameresult.active = true;
        if(endinfo.yuanbaos){
            cc.vv.userMgr.gamegold = endinfo.yuanbaos;
            this._scoreNode.getComponent(cc.Label).string = cc.vv.userMgr.gamegold;
        }
        console.log("ongameend : " + endinfo);
        for (let i = 0; i < endinfo.results.length; i++) {
            this.showResult(i + 1,endinfo.results[i]);
        }

        var totalscore = cc.find("Canvas/game_result/totalscorelabel/score").getComponent(cc.Label);
        totalscore.string = endinfo.total;
    },
    
    emergeResult:function(){
        this._gameresult.active = true;
    },

    onBtnCloseClicked:function(){
        cc.vv.wc.show('正在返回游戏大厅');
        cc.director.loadScene("hall");
    },
    
    onBtnShareClicked:function(){
        cc.vv.anysdkMgr.shareResult();
    }
});
