define(function(require, exports, module) {
    /**
     * VM Parser for Lazy Loading.
     * functions
     * 对暴露的方法做切面处理
     * 需要将模块解析装配到模块积累中。是否需要一个页面级别的模块解析？
     */
    var $ = require('$');
    var Aspect = require('mi.util.Aspect');
    var cellula = require('cellula');
    var asyncspect = {
        _init: function(module) {
            var node = module.rootNode;
            var config = {
                /** 是否已同步加载*/
                sync: !!node.attr('data-sync'),

                /** 是否支持重复请求 */
                refresh: !!node.attr('data-refresh'),

                /** 数据请求返回类型html, text, script, xml, json, jsonp */
                    // TODO should separate success func for different mime types
                dataType: node.attr('data-type') || 'text',

                /** 数据请求方式 get, post */
                method: node.attr('data-method') || 'get',

                /** 请求超时时间 */
                timeout: parseInt(node.attr('data-timeout')) || 0,

                /** 请求url */
                url: node.attr('href') || node.attr('data-url') || false

            };
            cellula._util.mix(module, config);
        },

        _execute: function(module, callback) {
            module.trigger('DOMLOADED', module);
            callback && module[callback + '_Asyn'] && (module[callback + '_Asyn']());
            asyncspect._clean(module);
        },

        _clean: function(config) {
            seajs.log('syncspect._clean:' + config.url);
            config.sync = true;
        },
        /**
         * ajax get data||text||html
         * @param config
         */
        _load: function(config, callback) {
           
            if (!config.sync) {
                $.ajax({
                    url: config.url + (config.refresh ? ('?t=' + new Date().getTime()) : ''),
                    data: config.data,
                    type: config.method,
                    timeout: config.timeout,
                    dataType: config.dataType,
                    success: function(response) {
                        if (config.dataType == 'text') {
                            $(config.rootNode).html($(response));
                        }
                        asyncspect._execute(config, callback);
                    }
                });
            } else {
                callback && config[callback + '_Asyn'] && (config[callback + '_Asyn']());
            }
        },
        /**
         * 对api暴露出来的方法，增加切面
         * @param module
         */
        aspect:function(module) {
            this._init(module);
            var api = module.getApiMap();
            Aspect(module);
            var that = this;
            if (!module.sync) {
                for (var n in api) {
                    if (module[api[n]]) {
                        module.before(api[n], function(method, context) {
                            that._load(context, method);
                        }, true);
                    }
                }
            }
        }

    };
    return asyncspect;
});