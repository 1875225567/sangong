cc.Class({
    extends: cc.Component,

    properties: {
        qiZiNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        //this.delet = new Array();
        var children = this.qiZiNode.children;
        for (var i = 0; i < children.length; ++i) {
            children[i].on('touchstart',this.touchPosition);
        }
    },

    createQiRoom:function(){
        cc.vv.transition.active(this.node);
    },

    qiRoomClose:function(){
        this.node.active = false;
    },

    touchPosition:function(event){
        var touchNode = event.target;
        var node = new cc.Node();
        var sp = node.addComponent(cc.Sprite);
        cc.loader.loadRes("textures/wrapper/wuziqi",cc.SpriteAtlas,function(err,atlas){
            var frame = atlas.getSpriteFrame("black");
            node.getComponent(cc.Sprite).spriteFrame = frame;
        });
        touchNode.addChild(node);
    },
});
