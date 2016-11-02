

# electron-process-ipc
I was unable to use [smith-kyle's electron-process](https://www.npmjs.com/package/electron-process) in my application due to use of the [npm module object-hash](https://www.npmjs.com/package/object-hash), as it depends
on nodejs's crypto, which I was unable to reference correctly from my electron angular2 code. I replaced the object-hash requirements with [hashids npm](https://www.npmjs.com/package/hashids).

While I have hard coded Hashids seed with HashIds('my intensive work'), it seems easy enough to stringify an object in the future, to
account for using and correctly identifying various objects/modules. Since my current needs only involve one object/module, I did not go the extra step and enable multiple object/mdoules. Should be easy to update in the future.

Although I refactored Kyle Smith's javascript files using typescript, I made sure it compiles back to javascript so that it correctly loades with .require(). (in otherwords: I am not making use of the
.d.ts file  that are created!)


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