define(function (require, exports, module) {
    /**
     * VM Parser for Lazy Loading.
     * functions
     * 对暴露的方法做切面处理
     */
    var $ = require('$');
    var Aspect = require('mi.util.Aspect');
    var funcAspect = require('#funcAspect');
    var util = require('cellula')._util;
    var ajaxQueue = {
        queue:[],
        get:function (url) {
            var result = null;
            util.each(ajaxQueue.queue, function (value) {
                if (value.url === url) {
                    result = value;
                    return util.breaker;
                }
            }, undefined ,util.breaker);
            return result;
        },
        remove:function (url) {
            var result = null;
            util.each(ajaxQueue.queue, function (value, index) {
                if (value.url === url) {
                    ajaxQueue.queue.splice(index, 1);
                    result = value;
                    return util.breaker;
                }
            }, undefined ,util.breaker);
            return result;
        }
    };
    var asyncspect = {
        _init:function (module) {
            var node = module.rootNode;
            var config = {
                /** 是否已同步加载*/
                sync:!!node.attr('data-sync'),

                /** 数据请求返回类型html, text, script, xml, json, jsonp */
                // TODO should separate success func for different mime types
                dataType:node.attr('data-type') || 'text',

                /** 数据请求方式 get, post */
                method:node.attr('data-method') || 'get',

                /** 请求超时时间 */
                timeout:parseInt(node.attr('data-timeout')) || 0,

                /** 请求url */
                url:node.attr('href') || node.attr('data-url') || false

            };
            util.mix(module, config);
        },
        _load:function(){
            var module = this, _origin = this._origin, args = arguments;

            if (!module.sync) {
                var tmpAjax = ajaxQueue.get(module.url);
                if (tmpAjax) {
                    if (!$.isArray(tmpAjax.success)) tmpAjax.success = [tmpAjax.success];

                    tmpAjax.success.push(module._origin);
                } else {
                    var tmpAjaxInstance = $.ajax({
                        url:module.url + ('?t=' + new Date().getTime()),
                        data:module.data,
                        type:module.method,
                        timeout:module.timeout,
                        dataType:module.dataType, // context fix ,do remember!
                        success:[function (response) {
                            ajaxQueue.remove(module.url);
                            if (module.dataType == 'text') {
                                $(module.getRoot()).html($(response));
                                (module._fill_times) ? module._fill_times++ : (module._fill_times = 1);
                            }
                            seajs.log('syncspect._clean:' + module.url);
                            module.sync = true;
                            module.trigger('DOMLOADED', module);

                            return _origin.apply(module, args);
                        }]
                    });

                    tmpAjaxInstance.url = module.url;
                    ajaxQueue.queue.push(tmpAjaxInstance);
                }

            } else {
                return _origin.apply(this, arguments);
            }
        },
        /**
         * 对api暴露出来的方法，增加切面
         * @param module
         */
        aspect:function (module) {
            this._init(module);
            var api = module.getApiMap();

            for (var n in api) {
                if (module[api[n]]) {
                    funcAspect(module).wrap(api[n], this._load);
                }
            }
        }
    };
    return asyncspect;
});