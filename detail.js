/**
 * detail
 */
define(function(require, exports) {
    var Class = require('cellula').Class;
    var $ = require('$');
    var ModuleBase = require('mi.net.ModuleBase');
    var Detail = new Class('Detail', {
        relay:true,
        render:function() {
            $(this.rootNode).show();
            this.deliver({code : 'mi.order.hideShortDetail',body:''});
            console.log('Detail.render');
        },
        hide:function(){
            console.log('do mi.detail.hide');
            $(this.rootNode).hide();
        },
        _apiMap : {
            'mi.detail.render' : 'render',
            'mi.detail.hide' : 'hide'
        }
    }).inherits(ModuleBase);

    return function (node){ return new Detail(node)};
});