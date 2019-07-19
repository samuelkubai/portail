import { concat } from 'video-stitch';
import aperture from 'aperture';
import fs from 'fs';

import SettingsStore from '../utils/Settings';
import * as Constants from '../utils/Constants';

class Recorder {
  static deleteClip(clipPath) {
    try {
      fs.unlinkSync(clipPath);
    } catch (e) {
      console.error(`Error deleting the clip: ${clipPath}`);
      console.error(e);
    }
  }

  static initializeFirebase() {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: 'AIzaSyBcUSH4QyrT_pdnTO61GlY4VibnOdNwFAk',
      authDomain: 'portail-5eb81.firebaseapp.com',
      databaseURL: 'https://portail-5eb81.firebaseio.com',
      projectId: 'portail-5eb81',
      storageBucket: 'portail-5eb81.appspot.com',
      messagingSenderId: '169585713190',
      appId: '1:169585713190:web:215646ac54361c76',
    };

    // Initialize Firebase
    // eslint-disable-next-line no-undef
    firebase.initializeApp(firebaseConfig);

    this.firebaseInitialized = true;
  }

  static async saveRecording(data) {
    // TODO: Integrate external storage
    const filePath = `${SettingsStore.instance.store.get(
      'portailDir',
    )}/output-${new Date().getTime()}.mp4`;
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, (err) => {
        if (err) {
          console.log(`Failed to save the recording here: ${filePath}`, err);
          reject(err);
        }
        console.log(`Successfully saved the recording here: ${filePath}`);
        resolve(filePath);
      });
    });
  }

  static async saveToFirebase(blob) {
    if (!this.firebaseInitialized) {
      this.initializeFirebase();
    }

    // Create the file reference
    const date = new Date();

    // eslint-disable-next-line no-undef
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(
      `videos/${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.mp4`,
    );
    const storageResponse = await fileRef.put(blob);
    console.log('Successfully uploaded file');
    console.log(storageResponse);

    return storageResponse;
  }

  constructor() {
    if (!!Recorder.instance) {
      return Recorder.instance;
    }

    console.log('Create new recorder instance...');

    Recorder.instance = this;
    Recorder.firebaseInitialized = false;
    this.recording = { options: {}, instance: null, source: null, clips: [] };

    return this;
  }

  cancelRecording(cb) {
    if (!this.recorder) {
      this.clearRecording(cb);
      return;
    }

    this.recorder.stopRecording().then(async (video) => {
      try {
        this.recording.clips.push(video);
        this.clearRecording(cb);
      } catch (e) {
        console.error(e);
      }
    });
  }

  clearRecording(cb) {
    try {
      // Delete all the clips
      this.recording.clips.forEach((clip) => {
        Recorder.deleteClip(clip);
      });
      // Execute the callback passed
      cb && cb();
    } catch (e) {
      console.error(e);
    }
  }

  cleanupRecording() {
    try {
      // Delete the recording clips
      this.recording.clips.forEach((clip) => {
        fs.unlinkSync(clip);
      });
      console.log(`Successfully deleted the recording clips.`);
    } catch (e) {
      console.log(`Failed to delete the recording clips: `, e);
    }

    // Reinitialize the recording object
    this.recording.clips = [];
  }

  async compileRecording() {
    // Combine the videos if more than one clip
    if (this.recording.clips.length > 1) {
      const clips = this.recording.clips.map((clip) => ({ fileName: clip }));
      console.log(clips);
      const finalFile = await concat({ overwrite: false })
        .clips(clips)
        .output(`output-${new Date().getTime()}.mp4`)
        .concat();

      console.log(`Final file: ${finalFile}`);

      this.recording.clips = [finalFile];
    }

    fs.readFile(this.recording.clips[0], async (err, data) => {
      try {
        if (err) {
          console.error(err);
          return;
        }

        await Recorder.saveRecording(data);
        // await Recorder.saveToFirebase(data);
        this.cleanupRecording();
      } catch (e) {
        console.error(e);
      }
    });
  }

  isRecording() {
    return this.recorder !== null;
  }

  pauseRecording() {
    this.recorder.stopRecording().then(async (video) => {
      console.log(`Successfully paused the recording, saved the clip here: ${video}`);
      this.recording.clips.push(video);
      this.recorder = null;
    });
  }

  async record(source, options) {
    console.log(`Recorder.record() Source => `, source);
    this.recorder = aperture();
    try {
      const adjustedRecorderArea = Object.assign(source.recorderArea, {
        y: source.recorderArea.y + (source.bounds.height - source.originalWorkArea.height) - 23,
      });

      // Initialize recording options
      this.recording.options = {
        cropArea: adjustedRecorderArea,
        highlightClicks: true,
        screenId: source.id,
      };

      console.log(`Recorder.record() Recording options => `, this.recording);

      // Check whether we need audio
      if (options[Constants.MICROPHONE_TYPE].active) {
        this.recording.options.audioDeviceId = options[Constants.MICROPHONE_TYPE].choice;
      }

      this.recording.instance = await this.recorder.startRecording(this.recording.options);

      return this.recording;
    } catch (e) {
      console.log(e);
    }
  }

  stopRecording() {
    if (!this.recorder) {
      return this.compileRecording();
    }

    this.recorder.stopRecording().then(async (video) => {
      try {
        console.log(`Successfully stopped the recording, saved it here: ${video}`);
        this.recording.clips.push(video);
        this.recorder = null;

        return this.compileRecording();
      } catch (e) {
        console.error(e);
      }
    });
  }
}

// Singleton implementation
export default (function() {
  let singleInstance = new Recorder();

  return {
    instance: singleInstance,
  };
})();
