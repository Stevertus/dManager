import { app, BrowserWindow, screen, shell, dialog, autoUpdater, ipcMain, protocol } from 'electron';
import * as path from 'path';
import * as url from 'url';
/*
const ChildProcess = require('child_process');
const exeName = path.basename(process.execPath);
const updateDotExe = path.resolve(path.join(path.resolve(path.resolve(process.execPath, '..'), '..'), 'Update.exe'));

const squirrelUrl = "https://dmanager.stevertus.com/cdn/Releases"

const startAutoUpdater = (squirrelUrl) => {
  console.log(squirrelUrl)
  autoUpdater.setFeedURL(`${squirrelUrl}/`);

  autoUpdater.addListener("update-available", (event, releaseNotes, releaseName) => {
    win.webContents.executeJavaScript(`console.log("downloading${JSON.stringify(event)}")`)
    win.webContents.send('update-state','downloading',releaseName)
  });
  autoUpdater.addListener("update-downloaded", (event, releaseNotes, releaseName) => {
    win.webContents.executeJavaScript(`console.log("downloaded${JSON.stringify(event)}")`)
    win.webContents.send('update-state','restart',releaseName)
  });

  autoUpdater.addListener("error", function(error: any,msg: any = ""){
    win.webContents.executeJavaScript(`console.log("download error${JSON.stringify(msg)}")`)
    win.webContents.send('update-state','error',msg)
  })
  autoUpdater.checkForUpdates();
}
const handleSquirrelEvent = () => {
  if (process.argv.length === 1) {
    return false;
  }

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      ChildProcess.spawn(updateDotExe,['--createShortcut', exeName], {detached: true});
      setTimeout(app.quit, 1000);
      app.setAsDefaultProtocolClient('dmanager')
      return true;
    case '--squirrel-uninstall':
      app.removeAsDefaultProtocolClient('dmanager')
      ChildProcess.spawn(updateDotExe,['--removeShortcut', exeName], {detached: true});
      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;
  }
}
handleSquirrelEvent()

ipcMain.on('restart',(e,a) => {
  autoUpdater.quitAndInstall()
})
*/
let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

try {
  require('dotenv').config();
} catch {
  console.log('asar');
}

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  win = new BrowserWindow({
  webPreferences: {
  webSecurity: false
},
    x: 0,
    y: 0,
    minHeight: 340,
    minWidth: 840,
    width: size.width,
    height: size.height
  });
  win.setMenu(null)
  if (serve) {
    require('electron-reload')(__dirname, {
     electron: require(`${__dirname}/node_modules/electron`)});
    win.loadURL('http://localhost:4200');
  } else {
    //if (process.env.NODE_ENV !== "dev") startAutoUpdater(squirrelUrl)
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
    protocol.registerHttpProtocol('dmananger',(req,cb) => {
      win.webContents.executeJavaScript(`console.log("${JSON.stringify(req)}")`)
    })
  }
  var handleRedirect = (e, url) => {
    if(url.includes('javascript()')) e.preventDefault()
    else if(url != win.webContents.getURL()) {
    console.log(url)
    e.preventDefault()
    require('electron').shell.openExternal(url)
  }
}

win.webContents.on('will-navigate', handleRedirect)
win.webContents.on('new-window', handleRedirect)
  //win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
