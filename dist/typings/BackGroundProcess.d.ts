export declare class BackGroundProcess {
    backgroundTasks: any;
    hasRegisteredListeners: boolean;
    constructor();
    turnCallbackIntoIpcCall(functionId: any): () => void;
    registerListeners(): void;
    registerModule(backgroundModule: any): void;
}
