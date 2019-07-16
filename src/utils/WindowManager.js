// Options format:
// [{
//   name: 'OPTION-NAME',
//   file: '',
//   options: {},
// }]
import { BrowserWindow } from 'electron';

class WindowManager {
  constructor(windowOptions) {
    windowOptions &&
      windowOptions.forEach((option) => {
        if (!this.windowOptions) {
          this.windowOptions = {};
        }

        this.windowOptions[option.name] = option;
      });
    this.windows = {};
  }

  createOrShowWindow(name, onClose, area, showDevTools = false) {
    if (!this.windows[name]) {
      return this.createWindow(name, onClose, area, showDevTools);
    }

    !this.windows[name].isVisible() && this.windows[name].show();

    return this.windows[name];
  }

  createWindow(name, onClose, area, showDevTools = false) {
    // Get the window options
    const config = this.windowOptions[name];
    let options = config.options;

    if (typeof options === 'function') {
      options = options({ area });
    }

    // Create the browser window.
    const window = new BrowserWindow(options);

    // and load the index.html of the app.
    window.loadURL(config.file);

    if (showDevTools) {
      window.webContents.openDevTools();
    }

    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // Emitted when the window is closed.
    window.on('closed', () => {
      onClose();
    });

    // Add to the windows list
    this.windows[config.name] = window;

    return window;
  }

  closeWindow(name) {
    const window = this.windows[name];
    window && window.close();
    this.windows[name] = null;
  }

  hideWindow(name) {
    const window = this.windows[name];
    window && window.hide();
  }

  showWindow(name) {
    const window = this.windows[name];
    window && window.show();
  }
}
export default WindowManager;
