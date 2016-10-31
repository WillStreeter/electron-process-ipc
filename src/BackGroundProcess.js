"use strict";
var _ = require("lodash");
var electron_1 = require("electron");
var objectHash = require("object-hash");
var Promise = require("bluebird");
var BackGroundProcess = (function () {
    function BackGroundProcess() {
        this.backgroundTasks = {};
        this.hasRegisteredListeners = false;
    }
    BackGroundProcess.prototype.turnCallbackIntoIpcCall = function (functionId) {
        return function () {
            // Filter all non-enumarable properties
            var args = _.map(arguments, function (argument) { return argument; });
            electron_1.ipcRenderer.send('CALLBACK', {
                functionId: functionId,
                args: args
            });
        };
    };
    BackGroundProcess.prototype.registerListeners = function () {
        var _this = this;
        electron_1.ipcRenderer.on('BACKGROUND_START', function (event, payload) {
            var moduleHash = payload.moduleHash, funcName = payload.funcName, args = payload.args, eventKey = payload.eventKey;
            // In order for callbacks to execute in the foreground they
            // must be replaced with an IPC call
            var argsWithCallbacksReplaced = _.map(args, function (arg) { return _.get(arg, '$isFunction') ? _this.turnCallbackIntoIpcCall(arg['functionId']) : arg; });
            Promise.resolve()
                .then(function () { return (_a = _this.backgroundTasks[moduleHash])[funcName].apply(_a, argsWithCallbacksReplaced); var _a; })
                .then(function (result) {
                electron_1.ipcRenderer.send('BACKGROUND_REPLY', {
                    result: result,
                    eventKey: eventKey,
                    resultType: 'BACKGROUND_RESOLVE'
                });
            })
                .catch(function (reason) {
                electron_1.ipcRenderer.send('BACKGROUND_REPLY', {
                    reason: reason,
                    eventKey: eventKey,
                    resultType: 'BACKGROUND_REJECT'
                });
            });
        });
    };
    BackGroundProcess.prototype.registerModule = function (backgroundModule) {
        if (!this.hasRegisteredListeners) {
            this.registerListeners();
            this.hasRegisteredListeners = true;
        }
        this.backgroundTasks[objectHash(backgroundModule)] = backgroundModule;
    };
    return BackGroundProcess;
}());
exports.BackGroundProcess = BackGroundProcess;
