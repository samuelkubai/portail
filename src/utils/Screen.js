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

  static async getAllApplications(cb) {
    desktopCapturer.getSources({ types: ['screen', 'window'] }, (error, sources) => {
      sources.forEach(async (source) => {
        const media = await window.navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
              minWidth: 1280,
              maxWidth: 1280,
              minHeight: 720,
              maxHeight: 720,
            },
          },
        });

        console.log(media);
      });

      cb(sources, error);
    });
  }

  static createWebcamPlayer(area) {
    const height = area.bounds.height;

    // Create the browser window.
    webcamPlayer = new remote.BrowserWindow({
      x: area.bounds.x + 16,
      // eslint-disable-next-line no-mixed-operators
      y: height - 200 - 58 + area.bounds.y,
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
