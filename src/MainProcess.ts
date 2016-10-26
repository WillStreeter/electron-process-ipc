import * as _ from "lodash";
import {BrowserWindow, ipcMain} from "electron";



export class MediaProcess{

    public foregroundWindows:any = [];

    public backgroundProcessHandler:any = {
        addWindow(browserWindow) {
            this.foregroundWindows.push(browserWindow);
        }
    }

    constructor(){}

    createBackgroundProcess(url:string, debug:any) {
        const backgroundWindow = new BrowserWindow();

        if (!debug) {
            backgroundWindow.hide();
        }

        backgroundWindow.loadURL(url);

        ipcMain.on('BACKGROUND_START', (event, result) => {
            backgroundWindow.webContents.send.apply(backgroundWindow.webContents, ['BACKGROUND_START', result]);
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