//处理切面
define(function(require, exports) {
    var actsAsAspect = function(object) {
        object.yield = null;
        object.rv = { };
        object.before = function(method, f, isAsyn) {
            //var original = eval("this." + method);
            var original = object[method];
            if (isAsyn) {
                this[method + '_Asyn'] = original;
                this[method] = function() {
                    //f.apply(this, method);
                    f(method,this);
                    var empty = function() {
                        //console.log(this[method + '_Asyn'] )
                    };
                    return empty.apply(this, arguments);
                }
            } else {
                this[method] = function() {
                    f.apply(this, arguments);
                    return original.apply(this, arguments);
                };
            }
        };
        object.after = function(method, f) {
            var original = eval("this." + method);
            this[method] = function() {
                this.rv[method] = original.apply(this, arguments);
                return f.apply(this, arguments);
            }
        };
        object.around = function(method, f) {
            var original = eval("this." + method);
            this[method] = function() {
                this.yield = original;
                return f.apply(this, arguments);
            }
        };

    }
    return actsAsAspect;
});
