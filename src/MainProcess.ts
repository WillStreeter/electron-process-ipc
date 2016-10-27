import * as _ from "lodash";
import {BrowserWindow, ipcMain} from "electron";



export class MainProcess{

    public foregroundWindows:any;

    public backgroundWindow:any;

    public backgroundProcessHandler:any;

    constructor(){
        this.foregroundWindows = [];
        this.backgroundProcessHandler = {
            addWindow(browserWindow) {
                this.foregroundWindows.push(browserWindow);
            }
        }
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
        _.forEach(this.foregroundWindows, (foregroundWindow) => {
            foregroundWindow.webContents.send.apply(foregroundWindow.webContents, [eventName, payload]);
        });
    }


}