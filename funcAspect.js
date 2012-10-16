define(function (require, exports, module) {
    var util = require('cellula')._util;

    var aspect = function (obj) {
        if (!util.isObject(obj)) throw new Error("invalid parameter!");

        var __aspect__ = {
            __method__:function (method, func, context) {
                if (!util.isFunction(func)) throw new Error("invalid parameter!");

                var origin = obj[name],
                    args = context ? Array.prototype.slice.call(arguments, 2) : [];
            },

            //afterReturning
            //afterThrowing
            //destroy
            before:function (name, func, context) {
                if (!util.isString(name) || !util.isFunction(func)) throw new Error("invalid parameter!");

                var origin = obj[name],
                    args = context ? util.slice.call(arguments, 3) : [];
                obj[name] = function () {
                    func.apply(context || obj, args);
                    return origin.apply(obj, arguments);
                };
            },
            after:function (name, func, context) {
                if (!util.isString(name) || !util.isFunction(func)) throw new Error("invalid parameter!");

                var origin = obj[name],
                    args = context ? util.slice.call(arguments, 3) : [];
                obj[name] = function () {
                    var ret = origin.apply(obj, arguments);
                    func.apply(context || obj, args);
                    return ret;
                };
            },
            wrap:function (name, func) { // around
                if (!util.isString(name) || !util.isFunction(func)) throw new Error("invalid parameter!");

                var origin = obj[name];

                obj[name] = function () { // arguments belongs to origin
                    var temp = obj._origin;
                    obj._origin = origin;
obj.__funcname__ = name;
                    var ret = func.apply(obj, arguments);
delete obj.__funcname__;
                    obj._origin = temp;
                    return ret;
                };
            }
        };
        return __aspect__;
    };

    return aspect;
});