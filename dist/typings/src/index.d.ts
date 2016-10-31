import { MainProcess } from './MainProcess';
import { BackGroundProcess } from './BackGroundProcess';
import { ForegroundProcess } from './ForegroundProcess';
export declare class ElectronProcessIPC {
    background: BackGroundProcess;
    foreground: ForegroundProcess;
    main: MainProcess;
    constructor();
}
