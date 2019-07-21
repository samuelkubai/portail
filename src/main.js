import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { enableLiveReload } from 'electron-compile';
import { menubar } from 'menubar';
const { enforceMacOSAppLocation } = require('electron-util');
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import path from 'path';
import WindowManager from './utils/WindowManager';
import SentryUtility from './utils/SentryUtility';
import { initializeAnalytics } from './utils/Analytics';

let cropper;
let controlPanel;
let mainMenu;
let mainWindow;
let settingsWindow;

const isDevMode = true;
if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

// Initialize the window manager
const windowManager = new WindowManager([
  {
    name: 'controlPanel',
    file: `file://${__dirname}/controls.html`,
    options: ({ area }) => {
      console.log('[WindowManager => ControlPanel]: Init => ', { area });
      return {
        x: area.workArea.x + 16,
        y: 16 + area.workArea.y,
        width: 269,
        height: 42,
        acceptFirstMouse: true,
        alwaysOnTop: true,
        frame: false,
        focusable: false,
        hasShadow: false,
        maximizable: false,
        movable: false,
        transparent: true,
        resizable: false,
      };
    },
  },
  {
    name: 'cropper',
    file: `file://${__dirname}/cropper.html`,
    options: ({ area }) => {
      console.log('[WindowManager => Cropper]: Init => ', { area });
      return {
        x: area.workArea.x,
        y: area.workArea.y,
        width: area.workArea.width,
        height: area.workArea.height,
        alwaysOnTop: true,
        frame: false,
        focusable: false,
        hasShadow: false,
        acceptFirstMouse: true,
        movable: false,
        transparent: true,
        resizable: false,
      };
    },
  },
  {
    name: 'settings',
    file: `file://${__dirname}/settings.html`,
    options: ({ area }) => {
      console.log('[WindowManager => Settings]: Init => ', { area });
      return {
        x: area.workArea.x / 2,
        y: area.workArea.y / 2,
        width: 483,
        height: 483,
        acceptFirstMouse: true,
        alwaysOnTop: false,
        title: 'Settings',
      };
    },
  },
]);

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 320,
    height: 450,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

const createMenuBar = () => {
  mainMenu = menubar({
    browserWindow: {
      width: 320,
      height: 450,
    },
    preloadWindow: true,
    icon: path.join(__dirname, 'assets/icon.png'),
    index: `file://${__dirname}/index.html`,
  });
};

// TODO: Review this event listeners.
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Ensure the app is in the Applications folder
  enforceMacOSAppLocation();

  // Initialize Google analytics
  initializeAnalytics();

  // Track any exceptions to sentry
  SentryUtility.instance.track();

  // Initialize the application
  // createWindow();
  createMenuBar();
});

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
  if (menubar() === null) {
    createMenuBar();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on('cancel-recording', () => {
  mainWindow && mainWindow.webContents.send('cancel-recording');
  mainMenu.window.webContents.send('cancel-recording');
});

ipcMain.on('close-control-panel', () => {
  windowManager.closeWindow('controlPanel');
});

ipcMain.on('deactivate-cropping', () => {
  console.log('[Main Process] In the "deactivate-cropping" event:');
  cropper && cropper.setIgnoreMouseEvents(true, { forward: true });
});

ipcMain.on('cancel-cropper', () => {
  console.log('[Main Process] In the "cancel-cropper" event:');
  windowManager.closeWindow('cropper');
  mainWindow && mainWindow.webContents.send('cancel-cropper');
  mainMenu.window.webContents.send('cancel-cropper');
});

ipcMain.on('close-cropper', () => {
  console.log('[Main Process] In the "close-cropper" event:');
  windowManager.closeWindow('cropper');
});

ipcMain.on('finish-cropping', (evt, arg) => {
  console.log('[Main Process] In the "finish-cropping" event:');
  console.log('Arguments: ', arg);
  mainWindow && mainWindow.webContents.send('cropping-finished', arg);
  mainMenu.window.webContents.send('cropping-finished', arg);
});

ipcMain.on('init-control-panel', (evt, arg) => {
  console.log('[Main Process] In the "init-control-panel" event:');
  console.log('Arguments: ', arg);
  mainWindow && mainWindow.webContents.send('init-control-panel', arg);
  mainMenu.window.webContents.send('init-control-panel', arg);
});

ipcMain.on('pause-recording', () => {
  mainWindow && mainWindow.webContents.send('pause-recording');
  mainMenu.window.webContents.send('pause-recording');
});

ipcMain.on('pick-destination', () => {
  const files = dialog.showOpenDialog(settingsWindow, {
    properties: ['createDirectory', 'openDirectory'],
    buttonLabel: 'Select',
    title: 'Select destination for recordings',
  });

  if (files && files.length > 0) {
    settingsWindow.webContents.send('destination-selected', { file: files[0] });
  }
});

ipcMain.on('show-control-panel', (evt, arg) => {
  controlPanel = windowManager.createOrShowWindow(
    'controlPanel',
    () => {
      controlPanel = null;
    },
    arg.area,
  );
});

ipcMain.on('stop-recording', () => {
  mainWindow && mainWindow.webContents.send('stop-recording');
  mainMenu.window.webContents.send('stop-recording');
});

ipcMain.on('toggle-settings', (evt, arg) => {
  console.log('[Main Process] In the "toggle-settings" event:');
  console.log('Arguments: ', arg);
  console.log('[Main Process] Create or show the settings window');
  settingsWindow = windowManager.createOrShowWindow(
    'settings',
    () => {
      console.log('Closed the settings window');
    },
    arg.area,
    true,
  );
});

ipcMain.on('toggle-webcam', () => {
  mainWindow && mainWindow.webContents.send('toggle-webcam');
  mainMenu.window.webContents.send('toggle-webcam');
});

ipcMain.on('toggle-cropper', (evt, arg) => {
  console.log(`[Main process] Toggle cropper`);
  console.log(`Arguments passed`, arg);

  cropper = windowManager.createOrShowWindow(
    'cropper',
    () => {
      cropper = null;
    },
    arg.area,
    isDevMode,
  );
});

ipcMain.on('quit-application', () => {
  app.quit();
});

ipcMain.on('update-control-panel', (evt, arg) => {
  console.log('[Main Process] In the "update-control-panel" event:');
  console.log('Arguments: ', arg);
  controlPanel && controlPanel.webContents.send('update-control-panel', arg);
});
