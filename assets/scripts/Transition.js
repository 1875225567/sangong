var transition = cc.Class({
    extends: cc.Component,

    active:function(node){
        node.active = true;
        node.scale = 0.4;
        var scaleAction = cc.scaleTo(0.2,1,1);
        var shadow = node.getChildByName("shadow");
        if(!shadow){
            node.runAction(scaleAction);
        }
        else{
            shadow.active = false;
            var cb = cc.callFunc(function(targer){
                shadow.active = true;
            },this);
            var seq = cc.sequence(scaleAction,cb);
            node.runAction(seq);
        }
    }

});
