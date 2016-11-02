

# electron-process-ipc
I was unable to use smith-kyle's electron-process in my application due to use of the npm module object-hash, as it depends
on nodejs's crypto, which I was unable to reference correctly from my electron angular2 code. I replaced the object-hash requirements with hashids npm.

While I have hard coded Hashids seed with HashIds('my intensive work'), it seems easy enough. to have loaded module stringify the object in the future, so that
a mulitude of different objects could be used. Since my current needs only involve one object, I did not implement it with this in mind. Should be easy to update in the future.
I refactorsmith-kyle's electron-process javascript files using typescript, but made sure it compiles back to javascript so that it will load correctly in my current project.


### ToDo #
Eventually, it would be nice to convert it into npm with @types, with DefinitelyTyped listing, pointing to javascirpt implementation.



## setting electron's main.js  (advanced seed: main.desktop.ts)


```
    var electron = require('electron');
    var epIPC = require('electron-process-ipc');
    var electronProcessIPC = new epIPC.ElectronProcessIPC();
    var main = electronProcessIPC.main;

    ...

    var backgroundURL = 'file://' + __dirname + '/background.html';
    var backgroundProcessHandler = main.createBackgroundProcess(backgroundURL, false);
    mainWindow = new BrowserWindow({ width: 1200, height: 920 });
    var bgWin = main.getBackgroundWindow();
    backgroundProcessHandler.addWindow(mainWindow);
    mainWindow.loadURL('file://' + __dirname + '/index.desktop.html');

```

## setting up background.html to load  some work


```
    <!DOCTYPE html>
    <html>
      <head>
        <script>
          const epIPC = require('electron-process-ipc');
          const electronProcessIPC = new epIPC.ElectronProcessIPC();
          const background = electronProcessIPC.background;
          background.registerModule(require('./app/ngrx-redux/services/record-webrtc-services/cpuIntensive'));
        </script>
      </head>
      <body>
        <h1>Background window</h1>
      </body>
    </html>

```


## receiving some call back information in an Angular 2 services.

```

    import { Injectable } from '@angular/core';
    import * as electronProcessIPC from 'electron-process-ipc';

    @Injectable()
    export class WorkerBridgeService {
      cpuIntensive:any;
      electronProcessIPC:any;

      constructor() {
             this.electronProcessIPC = new electronProcessIPC['ElectronProcessIPC']();
             this.cpuIntensive = this.electronProcessIPC.foreground.getModule(require('./intensive/cpuIntensive'));
      }

      beginWork():void{
             this.cpuIntensive.doCallbackStuff((response)=>{
                 console.log('[WorkerBridgeService]---- response =', response);
               }).then((result)=>{ console.log('[WorkerBridgeService]---- reject =', result)})
                 .catch((reason)=>{ console.log('[WorkerBridgeService]---- reason =', reason)});
      }

    }
```