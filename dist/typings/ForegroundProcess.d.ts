export declare class ForegroundProcess {
    constructor();
    getModule(originalModule: any): any;
    private taskCompleteCallback(eventKey, resolve, reject, event, data);
    private callbackCallback(functionsById, event, data);
    run(moduleHash: any, funcName: any, args: any): any;
}
