import { app, BrowserWindow, ipcMain } from 'electron';
import { enableLiveReload } from 'electron-compile';
import { menubar } from 'menubar';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import path from 'path';
import WindowManager from './utils/WindowManager';

let controlPanel;

// Initialize the window manager
const windowManager = new WindowManager([
  {
    name: 'controlPanel',
    file: `file://${__dirname}/controls.html`,
    options: ({ area }) => {
      console.log('[WindowManager]: Init => ', { area });
      return {
        x: area.bounds.x + 16,
        // eslint-disable-next-line no-mixed-operators
        y: 48 + area.bounds.y,
        width: 269,
        height: 42,
        alwaysOnTop: true,
        frame: false,
        focusable: true,
        hasShadow: false,
        acceptFirstMouse: true,
        movable: false,
        transparent: true,
      };
    },
  },
]);

// TODO: Activate the menubar here.
let mainMenu;

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

let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
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

// TODO: Review this event listeners.
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

ipcMain.on('show-control-panel', (evt, arg) => {
  controlPanel = windowManager.createOrShowWindow(
    'controlPanel',
    () => {
      controlPanel = null;
    },
    arg.area,
  );
});

ipcMain.on('close-control-panel', () => {
  windowManager.closeWindow('controlPanel');
});

ipcMain.on('init-control-panel', (evt, arg) => {
  console.log('[Main Process] In the "init-control-panel" event:');
  console.log('Arguments: ', arg);
  mainWindow && mainWindow.webContents.send('init-control-panel', arg);
  mainMenu.window.webContents.send('init-control-panel', arg);
});

ipcMain.on('update-control-panel', (evt, arg) => {
  console.log('[Main Process] In the "update-control-panel" event:');
  console.log('Arguments: ', arg);
  controlPanel && controlPanel.webContents.send('update-control-panel', arg);
});

ipcMain.on('stop-recording', () => {
  mainWindow && mainWindow.webContents.send('stop-recording');
  mainMenu.window.webContents.send('stop-recording');
});

ipcMain.on('pause-recording', () => {
  mainWindow && mainWindow.webContents.send('pause-recording');
  mainMenu.window.webContents.send('pause-recording');
});

ipcMain.on('toggle-webcam', () => {
  mainWindow && mainWindow.webContents.send('toggle-webcam');
  mainMenu.window.webContents.send('toggle-webcam');
});
