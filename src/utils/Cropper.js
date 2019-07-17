import { ipcRenderer } from 'electron';

class Cropper {
  static launchCropper(area) {
    ipcRenderer.send('toggle-cropper', { area });
  }
}

export default Cropper;
