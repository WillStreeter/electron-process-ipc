import * as _ from "lodash";
const { ipcRenderer } =  require("electron");
import * as uuid from 'node-uuid';
import Hashids  = require("hashids");
import Promise = require("bluebird");



export class ForegroundProcess{


    constructor(){}


    getModule(originalModule:any):any{

        const promiseWrappedModule:any = {};
        var hashIds  =  new Hashids('my cpu intensive');
        var moduleHash =  hashIds.encode([1,2,3]);
        const _ref:any = this;
        _.forEach(originalModule, (func, funcName) => {
          if (_.isFunction(func)) {
            promiseWrappedModule[funcName] = function() {
              // Remove non-enumarable properties of arguments
              const args:any  = _.map(arguments, (element) => element);
              return _ref.run(  moduleHash,
                           funcName,
                           args
                         );
            };
          }
        });
        return promiseWrappedModule;
    }


    private taskCompleteCallback(eventKey, resolve, reject, event, data) {
          const {resultType, result, reason, eventKey: replyEventKey} = data;

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
    }

    callbackCallback(functionsById, event, data) {
      const {functionId, args} = data;
      if (functionsById[functionId]) {
        functionsById[functionId](...args);
      }
    }


    private  run(moduleHash, funcName, args):any {
          const eventKey = uuid.v4();

          const functionsById = {};
          const argsWithCallbacksReplaced = _.map(args, arg => {
            if (!_.isFunction(arg)) {
              return arg;
            }

            const functionId = uuid.v4();
            functionsById[functionId] = arg;
            return {
              $isFunction: true,
              functionId
            };
          });

          const payload = {
            moduleHash,
            funcName,
            args: argsWithCallbacksReplaced,
            eventKey
          };

          return new Promise((resolve, reject) => {
            if (_.some(args, _.isFunction)) {
              // When a callback is executed in the background process it sends an
              // IPC event named 'CALLBACK'.
              ipcRenderer.on('CALLBACK', this.callbackCallback.bind(this, functionsById));
            }
            ipcRenderer.on('BACKGROUND_REPLY', this.taskCompleteCallback.bind(this, eventKey, resolve, reject));
            ipcRenderer.send('BACKGROUND_START', payload);
          });
     }



}