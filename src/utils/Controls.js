import { remote } from 'electron';

let controlsPanel = null;

export default class Controls {
  static launchControlsPanel(display) {
    const height = display.bounds.height;
    const width = display.bounds.width;

    // Create the browser window.
    controlsPanel = new remote.BrowserWindow({
      x: display.bounds.x + 16,
      // eslint-disable-next-line no-mixed-operators
      y: 48 + display.bounds.y,
      width: 269,
      height: 42,
      alwaysOnTop: true,
      frame: false,
      focusable: true,
      hasShadow: false,
      acceptFirstMouse: true,
      movable: false,
      transparent: true,
    });

    // and load the index.html of the app.
    controlsPanel.loadURL(`file://${__dirname}/../controls.html`);

    // controlsPanel.webContents.openDevTools();

    controlsPanel.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // Emitted when the window is closed.
    controlsPanel.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      controlsPanel = null;
    });
  }

  static closeControlsPanel() {
    controlsPanel.close();
  }
}
