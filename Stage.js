define(function (require, exports, module) {
    /**
     * Stage parse modules on page dom
     */
    var $ = require('$');
    var mcenter = require('message');
    var cellula = require('cellula');
    var moduleClassName = ".module";
    var Stage = {
        modules:{},
        _unbindEvents:[],
        _init:function () {
            this._parseModulesByDom($(document.body))
        },
        _parseModulesByDom:function (dom, mod) {
            $(moduleClassName, dom).each(function (index, el) {
                seajs.use($(el).attr('data-module'), function (mo) {
                    if (Stage.modules[$(el).attr('data-module')]) {
                        return;
                    }
                    var tmp = new mo($(el));
                    //To registration message center for the instance
                    mcenter.subscribe(tmp);
                    tmp.on('DOMLOADED', Stage._onModuleDomLoadedHandler);
                    //seajs.log('A new module has been bulid. cid = ' + tmp.__cid__);
                    Stage.modules[$(el).attr('data-module')] = tmp;
                });
            });
        },
        _onModuleDomLoadedHandler:function (mod) {
            seajs.log(mod.__cid__ + " module's dom has loaded.");
            if (mod) {
                //Potential problem : deepCopy problem
                Stage._parseModulesByDom(mod.getRoot(), mod);
            }
        },
        run:function () {
            this._init();
        }
    };
    window.Stage = Stage;
    return Stage;
});