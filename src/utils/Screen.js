import electron, { desktopCapturer, remote } from 'electron';

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
      cb(hydratedSources, error);
    });
  }

  static getAllApplications(cb) {
    desktopCapturer.getSources({ types: ['window'] }, (error, sources) => {
      cb(sources, error);
    });
  }

  static createWebcamPlayer(display) {
    const height = display.bounds.height;

    // Create the browser window.
    webcamPlayer = new remote.BrowserWindow({
      x: 0,
      // eslint-disable-next-line no-mixed-operators
      y: height - 200 + display.bounds.y,
      width: 200,
      height: 200,
      alwaysOnTop: true,
      frame: false,
      focusable: false,
      movable: false,
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
}
