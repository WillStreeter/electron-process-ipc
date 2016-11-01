import * as _ from "lodash";
import { ipcRenderer } from "electron";
import hashids = require("hashids");
import Promise = require("bluebird");


export class  BackGroundProcess {


    backgroundTasks:any = <any>{};
    hasRegisteredListeners:boolean = false;

     constructor(){}

     turnCallbackIntoIpcCall(functionId:any) {
        return function() {
            // Filter all non-enumarable properties
            const args = _.map(arguments, argument => argument);

            ipcRenderer.send(
                'CALLBACK',
                {
                    functionId,
                    args
                }
            );
        };
     }


     registerListeners() {
        ipcRenderer.on('BACKGROUND_START', (event, payload) => {
            const {moduleHash, funcName, args, eventKey} = payload;

            // In order for callbacks to execute in the foreground they
            // must be replaced with an IPC call
            const argsWithCallbacksReplaced:any = _.map(
                args,
                arg => _.get(arg, '$isFunction') ? this.turnCallbackIntoIpcCall( arg['functionId'] ) : arg
            );

            Promise.resolve()
                .then(() => this.backgroundTasks[moduleHash][funcName](...argsWithCallbacksReplaced))
                .then((result) => {
                    ipcRenderer.send(
                        'BACKGROUND_REPLY',
                        {
                            result,
                            eventKey,
                            resultType: 'BACKGROUND_RESOLVE'
                        }
                    );
                })
                .catch((reason) => {
                    ipcRenderer.send(
                        'BACKGROUND_REPLY',
                        {
                            reason,
                            eventKey,
                            resultType: 'BACKGROUND_REJECT'
                        }
                    );
                });
        });
     }


     registerModule(backgroundModule:any) {
        if (!this.hasRegisteredListeners) {
            this.registerListeners();
            this.hasRegisteredListeners = true;
        }
        this.backgroundTasks[hashids.encode(backgroundModule)] = backgroundModule;
     }

}