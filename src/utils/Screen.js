import electron, { desktopCapturer, remote } from 'electron';
import aperture from 'aperture';

let webcamPlayer = null;

export default class Screen {
  static getAllWindows(cb) {
    // Get electron windows
    const displays = electron.screen.getAllDisplays();

    // Get sources from the browser API
    desktopCapturer.getSources({ types: ['screen'] }, (error, sources) => {
      let hydratedSources = sources;
      if (!error) {
        // Match and hydrate the sources with display information.
        hydratedSources = sources.map((source) => {
          const display = displays.filter((d) => d.id === parseInt(source.display_id))[0];
          return Object.assign(source, display);
        });
      }
      console.log(`Screen::getAllWindows()`, hydratedSources);
      cb(hydratedSources, error);
    });
  }

  static getPrimaryWindow(cb) {
    const display = electron.screen.getPrimaryDisplay();
    console.log(`Screen::getPrimaryWindow() Get electron display`, display);
    desktopCapturer.getSources({ types: ['screen'] }, (error, sources) => {
      console.log(`Screen::getPrimaryWindow() Captured sources: `, sources);
      const displayInfo = sources.filter((source) => parseInt(source.display_id) === display.id)[0];
      const hydratedDisplay = Object.assign(displayInfo, display);

      console.log(`Screen::getPrimaryWindow()`, hydratedDisplay);
      cb(hydratedDisplay, error);
    });
  }

  static createWebcamPlayer(area) {
    // Create the browser window.
    webcamPlayer = new remote.BrowserWindow({
      x: area.workArea.x + 16,
      // eslint-disable-next-line no-mixed-operators
      y: area.workArea.height - 200 - 16 + area.workArea.y,
      width: 200,
      height: 200,
      alwaysOnTop: true,
      frame: false,
      focusable: true,
      movable: true,
      resizable: false,
      transparent: true,
    });

    // and load the index.html of the app.
    webcamPlayer.loadURL(`file://${__dirname}/../webcam.html`);

    webcamPlayer.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // Emitted when the window is closed.
    webcamPlayer.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      webcamPlayer = null;
    });
  }

  static closeWebcamPlayer() {
    webcamPlayer.close();
  }

  static hideWebcamPlayer() {
    webcamPlayer.hide();
  }

  static isWebcamVisible() {
    return webcamPlayer && webcamPlayer.isVisible();
  }

  static showWebcamPlayer(area) {
    if (!webcamPlayer) {
      this.createWebcamPlayer(area);
      return;
    }

    webcamPlayer.show();
  }
}
