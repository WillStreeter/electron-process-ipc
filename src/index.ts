


import { MainProcess } from './MainProcess';
import { BackGroundProcess } from './BackGroundProcess';
import { ForegroundProcess } from './ForegroundProcess';

export class ElectronProcessIPC {

  public background:BackGroundProcess;
  public foreground:ForegroundProcess;
  public main:MainProcess;

      constructor(){
         this.main = new MainProcess();
         this.background = new BackGroundProcess();
         this.foreground = new ForegroundProcess();
      }


}