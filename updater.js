const {autoUpdater, AppUpdater} = require("electron-updater");

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.checkForUpdates();