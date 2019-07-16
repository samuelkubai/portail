import { ipcRenderer } from 'electron';

export default class Controls {
  static launchControlsPanel(area) {
    ipcRenderer.send('show-control-panel', { area });
  }

  static closeControlsPanel() {
    ipcRenderer.send('close-control-panel');
  }
}
