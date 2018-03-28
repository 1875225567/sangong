cc.Class({
    extends: cc.Component,

    properties: {
        editBox:cc.EditBox
    },

    onLoad: function () {

    },

    openInvite:function(){
        cc.vv.transition.active(this.node);
    },

    closeInvite:function(){
        this.node.active = false;
        this.editBox.string = "";
    },

    sendInvite:function(){
        var str = this.editBox.string;
        var data = {
            agencyname: str,
            userid: cc.vv.userMgr.userId,
        };
        cc.vv.http.sendRequest("/add_agency",data, function(obj){
            if(obj.errmsg = "ok"){
            }
            console.log(obj);
        });
    },
});
