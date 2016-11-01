import * as _ from "lodash";
const {BrowserWindow, ipcMain} = require('electron');

var foregroundWindows:any = [];

export class MainProcess{

    public backgroundWindow:any;

    public backgroundProcessHandler:any;



    constructor(){
        this.backgroundProcessHandler = {
            addWindow(browserWindow) {
                foregroundWindows.push(browserWindow);
            }
        }
    }

     getBackgroundWindow(){
         return this.backgroundWindow;
     }

    createBackgroundProcess(url:string, debug:any) {
        this.backgroundWindow = new BrowserWindow();

        if (!debug) {
            this.backgroundWindow.hide();
        }

        this.backgroundWindow.loadURL(url);

        ipcMain.on('BACKGROUND_START', (event, result) => {
            this.backgroundWindow.webContents.send.apply(this.backgroundWindow.webContents, ['BACKGROUND_START', result]);
        });


        ipcMain.on('BACKGROUND_REPLY', (event, result) => {
            this.sendToAllForegroundWindows('BACKGROUND_REPLY', result);
        });


        ipcMain.on('CALLBACK', (event, payload) => {
            this.sendToAllForegroundWindows('CALLBACK', payload);
        });


        return this.backgroundProcessHandler;
    }

    private sendToAllForegroundWindows(eventName:string, payload:any) {
        _.forEach(foregroundWindows, (foregroundWindow) => {
            foregroundWindow.webContents.send.apply(foregroundWindow.webContents, [eventName, payload]);
        });
    }


}