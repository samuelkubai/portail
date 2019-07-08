import { desktopCapturer } from 'electron';
import RecordRTC from 'recordrtc';

class Recorder {
  static getUserMedia(source) {
    let media = null;
    try {
      media = window.navigator.mediaDevices.getUserMedia({
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
    } catch (e) {
      console.log(e);
    }

    return media;
  }

  static layerAudio(stream, cb) {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(function(mediaStream) {
        const audioTracks = mediaStream.getAudioTracks();

        // mix audio tracks
        if (audioTracks.length > 0) {
          const mixAudioTrack = Recorder.mixTracks(audioTracks);
          stream.addTrack(mixAudioTrack);
        }

        cb(stream);
      })
      .catch(function(err) {
        console.log('Layering audio error');
        console.log(err);
      });

    return stream;
  }

  static mixTracks(tracks) {
    const ac = new AudioContext();
    const dest = ac.createMediaStreamDestination();

    tracks.forEach((track) => {
      const source = ac.createMediaStreamSource(new MediaStream([track]));
      source.connect(dest);
    });

    return dest.stream.getTracks()[0];
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

  static async saveToFirebase(blob) {
    if (!this.firebaseInitialized) {
      this.initializeFirebase();
    }

    // Create the file reference
    const date = new Date();

    // eslint-disable-next-line no-undef
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(
      `images/${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.webm`,
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
    this.recorderObject = null;
    this.onCloseListeners = [];
    Recorder.firebaseInitialized = false;

    return this;
  }

  addEventListener(listener) {
    this.onCloseListeners.push(listener);
  }

  getEventListeners() {
    return this.onCloseListeners;
  }

  removeListener(listener) {
    this.onCloseListeners = this.onCloseListeners.filter((l) => l !== listener);
  }

  isRecording() {
    console.log(this.recorderObject);
    return this.recorderObject !== null;
  }

  startRecording(stream, listener) {
    this.recorderObject = RecordRTC(stream, { type: 'video' });
    this.recorderObject.startRecording();

    // Register the onClose listeners
    if (listener) {
      this.addEventListener(listener);
    }

    return this.recorderObject;
  }

  stopRecording() {
    this.recorderObject.stopRecording(async () => {
      const blob = this.recorderObject.getBlob();
      const storageResponse = await Recorder.saveToFirebase(blob);

      // Call the on close listeners
      this.getEventListeners().forEach((listener) => {
        if (listener) {
          listener(storageResponse);
        }
      });
    });
  }

  record(source) {
    desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
      sources.forEach((s) => {
        if (s.name === source.name) {
          try {
            Recorder.getUserMedia(s).then((stream) => {
              Recorder.layerAudio(stream, (streamWithAudio) => {
                this.startRecording(streamWithAudio);
              });
            });
          } catch (e) {
            console.log(e);
          }
        }
      });
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
