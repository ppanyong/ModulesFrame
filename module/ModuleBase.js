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
        relay:false,
        _conf:{},
        init:function (cfg) {
            this._super(cfg);
            this._config();
            this.registerInterface('deliver', mc);
            this.clean();

            //add aspect to module's api function
            util.each(this._mcMap,function(v){
                if(this[v]) util.aspect(this).wrap(v, this._load);
            }, this);

            //relay表示用户触发，如果是用户触发，则不主动运行render入口
            if (!this.relay || this._conf.sync) {
                this.render();
            }
        },
        _config:function () {
            var conf = {},el = this.rootNode;
            if (!el || !el.attr) return conf;
            conf.sync = !/(async)/.test(el.attr('data-mode'));
            conf.url = el.attr('data-url') || '';
            conf.type = el.attr('data-type') || 'text';
            conf.method = el.attr('data-method') || 'get';
            conf.timeout = el.attr('data-timeout') || 0;
            this._conf = conf;
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
                            return module._loadSuccess.call(module, response, _origin, args);
                        }]
                    });
                    tmpAjaxInstance.url = conf.url;
                    return ajaxQueue.queue.push(tmpAjaxInstance);
                }
            } else {
                return _origin.apply(this, arguments);
            }
        },
        _loadSuccess:function(resp, _origin, args){
            var conf = this._conf;
            ajaxQueue.remove(conf.url);
            if (conf.type == 'text') this.rootNode.html($(resp));

            conf.sync = true;
            this.trigger('DOMLOADED', this);
            return _origin.apply(this, args);
        },
        clean:function () {},
        getApiMap:function () {
            return this._mcMap;
        },
        _mcMap:{},
        deliver:function () {
            this.applyInterface.apply(this, ['deliver'].concat(util.slice.call(arguments)));
        }
    }).inherits(cellula.Cell);


    /** 对外接口 */
    return ModuleBase;
});