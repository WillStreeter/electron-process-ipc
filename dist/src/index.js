"use strict";
var MainProcess_1 = require('./MainProcess');
var BackGroundProcess_1 = require('./BackGroundProcess');
var ForegroundProcess_1 = require('./ForegroundProcess');
var ElectronProcessIPC = (function () {
    function ElectronProcessIPC() {
        this.main = new MainProcess_1.MainProcess();
        this.background = new BackGroundProcess_1.BackGroundProcess();
        this.foreground = new ForegroundProcess_1.ForegroundProcess();
    }
    return ElectronProcessIPC;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ElectronProcessIPC;

//# sourceMappingURL=index.js.map
