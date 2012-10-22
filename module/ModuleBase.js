define(function (require, exports, module) {
    var cellula = require('cellula');
    var util = cellula._util;
    var mc = require('message');
    var $ = require("$");
    var ajaxQueue = require('#ajaxQueue');
    /**
     * 模块抽象类，不被实例化
     */
    var ModuleBase = new cellula.Class('ModuleBase', {
        init:function (node, conf) {
            //this._super();
            this.rootNode = node;
            this.key = node.attr('id');
            this._conf = conf;
            this.registerInterface('deliver', mc);
            this.clean();
            //add aspect to module's api function
            util.each(this._apiMap,function(v){
                if(this[v]) util.aspect(this).wrap(v, this._load);
            }, this);

            //relay表示用户触发，如果是用户触发，则不主动运行render入口
            if (!this.relay || this._conf.sync) {
                this.render();
            }
        },
        _load:function () {
            var module = this, _origin = this._origin, args = arguments, conf = module._conf;

            if (!conf.sync) {
                var tmpAjax = ajaxQueue.get(conf.url);
                if (tmpAjax) {
                    if (!$.isArray(tmpAjax.success)) tmpAjax.success = [tmpAjax.success];
                    return tmpAjax.success.push(module._origin);
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
                            }
                            seajs.log('syncspect._clean:' + conf.url);
                            conf.sync = true;
                            module.trigger('DOMLOADED', module);

                            return _origin.apply(module, args);
                        }]
                    });
                    tmpAjaxInstance.url = conf.url;
                    return ajaxQueue.queue.push(tmpAjaxInstance);
                }
            } else {
                return _origin.apply(this, arguments);
            }
        },
        render:function () {
        },
        clean:function () {
        },
        getApiMap:function () {
            return this._apiMap;
        },
        _apiMap:{},
        //modules:[],
        deliver:function () {
            this.applyInterface.apply(this, ['deliver'].concat(util.slice.call(arguments)));
        }
    }).inherits(cellula.Cell);


    /** 对外接口 */
    return ModuleBase;
});