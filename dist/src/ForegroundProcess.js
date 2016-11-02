"use strict";
var _ = require("lodash");
var ipcRenderer = require("electron").ipcRenderer;
var uuid = require('node-uuid');
var Hashids = require("hashids");
var Promise = require("bluebird");
var ForegroundProcess = (function () {
    function ForegroundProcess() {
    }
    ForegroundProcess.prototype.getModule = function (originalModule) {
        var promiseWrappedModule = {};
        var hashIds = new Hashids('my cpu intensive');
        var moduleHash = hashIds.encode([1, 2, 3]);
        var _ref = this;
        _.forEach(originalModule, function (func, funcName) {
            if (_.isFunction(func)) {
                promiseWrappedModule[funcName] = function () {
                    var args = _.map(arguments, function (element) { return element; });
                    return _ref.run(moduleHash, funcName, args);
                };
            }
        });
        return promiseWrappedModule;
    };
    ForegroundProcess.prototype.taskCompleteCallback = function (eventKey, resolve, reject, event, data) {
        var resultType = data.resultType, result = data.result, reason = data.reason, replyEventKey = data.eventKey;
        if (replyEventKey === eventKey) {
            switch (resultType) {
                case 'BACKGROUND_RESOLVE':
                    ipcRenderer.removeListener('BACKGROUND_REPLY', this.taskCompleteCallback);
                    resolve(result);
                    break;
                case 'BACKGROUND_REJECT':
                    ipcRenderer.removeListener('BACKGROUND_REPLY', this.taskCompleteCallback);
                    reject(reason);
                    break;
                default:
            }
        }
    };
    ForegroundProcess.prototype.callbackCallback = function (functionsById, event, data) {
        var functionId = data.functionId, args = data.args;
        if (functionsById[functionId]) {
            functionsById[functionId].apply(functionsById, args);
        }
    };
    ForegroundProcess.prototype.run = function (moduleHash, funcName, args) {
        var _this = this;
        var eventKey = uuid.v4();
        var functionsById = {};
        var argsWithCallbacksReplaced = _.map(args, function (arg) {
            if (!_.isFunction(arg)) {
                return arg;
            }
            var functionId = uuid.v4();
            functionsById[functionId] = arg;
            return {
                $isFunction: true,
                functionId: functionId
            };
        });
        var payload = {
            moduleHash: moduleHash,
            funcName: funcName,
            args: argsWithCallbacksReplaced,
            eventKey: eventKey
        };
        return new Promise(function (resolve, reject) {
            if (_.some(args, _.isFunction)) {
                ipcRenderer.on('CALLBACK', _this.callbackCallback.bind(_this, functionsById));
            }
            ipcRenderer.on('BACKGROUND_REPLY', _this.taskCompleteCallback.bind(_this, eventKey, resolve, reject));
            ipcRenderer.send('BACKGROUND_START', payload);
        });
    };
    return ForegroundProcess;
}());
exports.ForegroundProcess = ForegroundProcess;

//# sourceMappingURL=ForegroundProcess.js.map
