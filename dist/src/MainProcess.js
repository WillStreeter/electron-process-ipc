"use strict";
var _ = require("lodash");
var electron_1 = require("electron");
var MainProcess = (function () {
    function MainProcess() {
        this.foregroundWindows = [];
        this.backgroundProcessHandler = {
            addWindow: function (browserWindow) {
                this.foregroundWindows.push(browserWindow);
            }
        };
    }
    MainProcess.prototype.createBackgroundProcess = function (url, debug) {
        var _this = this;
        var backgroundWindow = new electron_1.BrowserWindow();
        if (!debug) {
            backgroundWindow.hide();
        }
        backgroundWindow.loadURL(url);
        electron_1.ipcMain.on('BACKGROUND_START', function (event, result) {
            backgroundWindow.webContents.send.apply(backgroundWindow.webContents, ['BACKGROUND_START', result]);
        });
        electron_1.ipcMain.on('BACKGROUND_REPLY', function (event, result) {
            _this.sendToAllForegroundWindows('BACKGROUND_REPLY', result);
        });
        electron_1.ipcMain.on('CALLBACK', function (event, payload) {
            _this.sendToAllForegroundWindows('CALLBACK', payload);
        });
        return this.backgroundProcessHandler;
    };
    MainProcess.prototype.sendToAllForegroundWindows = function (eventName, payload) {
        _.forEach(this.foregroundWindows, function (foregroundWindow) {
            foregroundWindow.webContents.send.apply(foregroundWindow.webContents, [eventName, payload]);
        });
    };
    return MainProcess;
}());
exports.MainProcess = MainProcess;

//# sourceMappingURL=MainProcess.js.map
