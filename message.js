define(function(require, exports, module){
    var cellula = require('cellula'),
        Class = cellula.Class,
        util = cellula._util;

    var MessageCenter = new Class('MessageCenter',{
        init : function(){},
        deliver : function(msg){
            if(util.isString(msg)) this.trigger.apply(this, arguments);
            if(util.isObject(msg) && util.has(msg,'code') && util.has(msg,'body')) this.trigger.apply(this, util.isArray(msg.body) ? [msg.code].concat(msg.body) : [msg.code, msg.body]);
        },
        subscribe : function(o){
            if(util.isObject(o) && !util.isEmpty(o._mcMap)) util.each(o._mcMap, function(v, i){ this.on(i, o[v], o); }, this);
        }
    });

    return new MessageCenter;
});