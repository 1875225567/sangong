cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {

    },

    createMethodClck:function(){
        cc.vv.transition.active(this.node);
    },

    createMethodClose:function(){
        this.node.active = false;
    },
});
