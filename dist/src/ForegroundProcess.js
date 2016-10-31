"use strict";
var _ = require("lodash");
var electron_1 = require("electron");
var uuid = require('node-uuid');
var objectHash = require("object-hash");
var Promise = require("bluebird");
var ForegroundProcess = (function () {
    function ForegroundProcess() {
    }
    ForegroundProcess.prototype.getModule = function (originalModule) {
        var promiseWrappedModule = {};
        var moduleHash = objectHash(originalModule);
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
                    electron_1.ipcRenderer.removeListener('BACKGROUND_REPLY', this.taskCompleteCallback);
                    resolve(result);
                    break;
                case 'BACKGROUND_REJECT':
                    electron_1.ipcRenderer.removeListener('BACKGROUND_REPLY', this.taskCompleteCallback);
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
                electron_1.ipcRenderer.on('CALLBACK', _this.callbackCallback.bind(_this, functionsById));
            }
            electron_1.ipcRenderer.on('BACKGROUND_REPLY', _this.taskCompleteCallback.bind(_this, eventKey, resolve, reject));
            electron_1.ipcRenderer.send('BACKGROUND_START', payload);
        });
    };
    return ForegroundProcess;
}());
exports.ForegroundProcess = ForegroundProcess;
//# sourceMappingURL=ForegroundProcess.js.map