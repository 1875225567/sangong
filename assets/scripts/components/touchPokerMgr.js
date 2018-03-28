cc.Class({
    extends: cc.Component,

    properties: {
        _pokerNodes:null,
    },

    // use this for initialization
    onLoad: function () {
        this._pokerNodes = cc.find("Canvas/TouchPoker");
        this._pokerNodes.active = false;
        //this.node.on(cc.Node.EventType.TOUCH_MOVE,this.movePoker,this);
    },

    movePoker:function(event){
        var touchVec = event.getDelta();
        if(event.target.rotation < 35 && event.target.rotation >= -5){
            if(touchVec.x > 1){
                event.target.rotation += 0.5;
            }
            else if(touchVec.x < 1){
                event.target.rotation -= 0.5;
            }
            if(touchVec.y < 1){
                event.target.rotation += 0.5;
            }
            else if(touchVec.y > 1){
                event.target.rotation -= 0.5;
            }
        }
    },

    clickTouchPoker:function(data){
        if(cc.vv.gameNetMgr.gamestate == "turnOverCard" && data){
            this._pokerNodes.active = true;
            this.showTouchPoker(data);
        }
        else{
            this._pokerNodes.active = false;
        }
    },

    showTouchPoker:function(pokers){
        this._pokerNodes.removeAllChildren();
        for (let i = 0; i < pokers.length; i++) {
            this.addPokerNode(pokers[i]+1,3);
        }
        this.addPokerNode(99,1.5);
    },

    addPokerNode:function(_poker,_scale){
        var pokerNode = cc.instantiate(this._pokerNodes);
        pokerNode.parent = this._pokerNodes;
        pokerNode.anchorX = -0.1;
        pokerNode.anchorY = -0.2;
        pokerNode.scale = _scale;
        pokerNode.x = -188;
        pokerNode.y = -270;
        pokerNode.addComponent(cc.Sprite);
        
        pokerNode.on(cc.Node.EventType.TOUCH_MOVE,this.movePoker,this);
        cc.loader.loadRes("textures/wrapper/poker",cc.SpriteAtlas,function(err,atlas){
            var frame = atlas.getSpriteFrame(_poker);
            pokerNode.getComponent(cc.Sprite).spriteFrame = frame;
        });
        return pokerNode;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
