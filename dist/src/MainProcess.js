"use strict";
var _ = require("lodash");
var _a = require('electron'), BrowserWindow = _a.BrowserWindow, ipcMain = _a.ipcMain;
var foregroundWindows = [];
var MainProcess = (function () {
    function MainProcess() {
        this.backgroundProcessHandler = {
            addWindow: function (browserWindow) {
                foregroundWindows.push(browserWindow);
            }
        };
    }
    MainProcess.prototype.getBackgroundWindow = function () {
        return this.backgroundWindow;
    };
    MainProcess.prototype.createBackgroundProcess = function (url, debug) {
        var _this = this;
        this.backgroundWindow = new BrowserWindow();
        if (!debug) {
            this.backgroundWindow.hide();
        }
        this.backgroundWindow.loadURL(url);
        ipcMain.on('BACKGROUND_START', function (event, result) {
            _this.backgroundWindow.webContents.send.apply(_this.backgroundWindow.webContents, ['BACKGROUND_START', result]);
        });
        ipcMain.on('BACKGROUND_REPLY', function (event, result) {
            _this.sendToAllForegroundWindows('BACKGROUND_REPLY', result);
        });
        ipcMain.on('CALLBACK', function (event, payload) {
            _this.sendToAllForegroundWindows('CALLBACK', payload);
        });
        return this.backgroundProcessHandler;
    };
    MainProcess.prototype.sendToAllForegroundWindows = function (eventName, payload) {
        _.forEach(foregroundWindows, function (foregroundWindow) {
            foregroundWindow.webContents.send.apply(foregroundWindow.webContents, [eventName, payload]);
        });
    };
    return MainProcess;
}());
exports.MainProcess = MainProcess;

//# sourceMappingURL=MainProcess.js.map
