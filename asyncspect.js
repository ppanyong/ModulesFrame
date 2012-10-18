define(function (require, exports, module) {
    /**
     * VM Parser for Lazy Loading.
     * functions
     * 对暴露的方法做切面处理
     */
    var $ = require('$');
    var aspect = require('#aspect');
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
        _load:function(){
            var module = this, _origin = this._origin, args = arguments, conf = module._conf;

            if (!conf.sync) {
                var tmpAjax = ajaxQueue.get(conf.url);
                if (tmpAjax) {
                    if (!$.isArray(tmpAjax.success)) tmpAjax.success = [tmpAjax.success];
                    tmpAjax.success.push(module._origin);
                } else {
                    var tmpAjaxInstance = $.ajax({
                        url:conf.url + ('?t=' + new Date().getTime()),
                        context:module,
                        type:conf.method,
                        timeout:conf.timeout,
                        dataType:conf.type,
                        success:[function (response) {
                            ajaxQueue.remove(conf.url);
                            if (conf.type == 'text') {
                                $(module.rootNode).html($(response));
                                //(conf._fill_times) ? conf._fill_times++ : (conf._fill_times = 1);
                            }
                            seajs.log('syncspect._clean:' + conf.url);
                            conf.sync = true;
                            module.trigger('DOMLOADED', module);

                            return _origin.apply(module, args);
                        }]
                    });

                    tmpAjaxInstance.url = conf.url;
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
            //this.init(module);
            var api = module.getApiMap();

            for (var n in api) {
                if (module[api[n]]) {
                    aspect(module).wrap(api[n], this._load);
                }
            }
        }
    };
    return asyncspect;
});