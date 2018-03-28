cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {

    },

    init:function(obj){
        var date = this.node.getChildByName("date").getComponent(cc.Label);
        var time = this.node.getChildByName("time").getComponent(cc.Label);
        var number = this.node.getChildByName("number").getComponent(cc.Label);
        var lose = this.node.getChildByName("lose");
        var win = this.node.getChildByName("win");
        console.log();
        date.string = obj.create_time.substring(0,10);
        time.string = obj.create_time.substring(11,19);
        number.string = parseInt(obj.result_value);
        if(parseInt(obj.result_value) >= 0){
            win.active = true;
        }
        else{
            lose.active = true;
        }
    },
});
