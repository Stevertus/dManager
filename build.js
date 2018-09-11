var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './release/package/dManager-win32-x64',
    outputDirectory: './release/installer',
    authors: 'Me',
    exe: 'dManager.exe'
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
