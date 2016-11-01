export declare class MainProcess {
    backgroundWindow: any;
    backgroundProcessHandler: any;
    constructor();
    getBackgroundWindow(): any;
    createBackgroundProcess(url: string, debug: any): any;
    private sendToAllForegroundWindows(eventName, payload);
}
