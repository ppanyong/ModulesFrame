define(function (require, exports, module) {
    /**
     * Stage parse modules on page dom
     */
    var $ = require('$');
    var mcenter = require('message');
    var cellula = require('cellula');
    var moduleClassName = ".module";
    var moduleSelector = '*[data-module]'
    var Stage = {
        modules:{},
        init:function () {
            this._parseModulesByDom($(document.body))
        },
        _config:function(el){
            var conf = {},
                tmp = el.attr('data-module').split(':');
            conf.module = tmp[0];
            conf.sync = !/(async)/.test(tmp[1]);
            conf.url = tmp[2];
            conf.type = el.attr('data-type') || 'text';
            conf.method = el.attr('data-method') || 'get';
            conf.timeout = el.attr('data-timeout') || 0;
            return conf;
        },
        _parseModulesByDom:function (dom, mod) {
            $(moduleSelector, dom).each(function (index, el) {
                var conf = Stage._config($(el));

                seajs.use(conf.module, function (mo) {
                    if (Stage.modules[conf.module]) return;

                    var tmp = new mo($(el), conf);
                    //To registration message center for the instance
                    mcenter.subscribe(tmp);
                    tmp.on('DOMLOADED', Stage._onModuleDomLoadedHandler);
                    Stage.modules[conf.module] = tmp;
                });
            });
        },
        _onModuleDomLoadedHandler:function (mod) {
            seajs.log(mod.__cid__ + " module's dom has loaded.");
            if (mod) {
                //Potential problem : deepCopy problem
                Stage._parseModulesByDom(mod.rootNode, mod);
            }
        }
    };
    window.Stage = Stage;
    return Stage;
});