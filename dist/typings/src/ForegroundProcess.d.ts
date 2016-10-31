export declare class ForegroundProcess {
    constructor();
    getModule(originalModule: any): any;
    private taskCompleteCallback(eventKey, resolve, reject, event, data);
    callbackCallback(functionsById: any, event: any, data: any): void;
    private run(moduleHash, funcName, args);
}
