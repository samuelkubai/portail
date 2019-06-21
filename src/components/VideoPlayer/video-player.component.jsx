import { desktopCapturer } from 'electron';
import React, { Component, PropTypes } from 'react';
import RecordRTC from 'recordrtc';

export default class VideoPlayer extends Component {
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

  static saveToFirebase(blob) {
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

    // Create the file reference
    const date = new Date();
    // eslint-disable-next-line no-undef
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(`images/${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.webm`);
    fileRef.put(blob).then(() => {
      console.log('Successfully uploaded file');
    });
  }

  static startRecording(stream) {
    const recorder = RecordRTC(stream, { type: 'video' });
    recorder.startRecording();

    return recorder;
  }

  static stopRecording(recorder) {
    recorder.stopRecording(() => {
      const blob = recorder.getBlob();
      VideoPlayer.saveToFirebase(blob);
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      recorder: null,
    };

    this.record.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { recorder } = this.state;

    if (this.props.recording !== prevProps.recording) {
      // eslint-disable-next-line react/prop-types
      this.props.recording ?
        this.record() :
        VideoPlayer.stopRecording(recorder);
    }
  }

  record() {
    desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
      sources.forEach((source) => {
        if (source.name === 'Screen 2') {
          try {
            VideoPlayer.getUserMedia(source).then((stream) => {
              const recorder = VideoPlayer.startRecording(stream);

              this.setState(state => Object.assign(state, { recorder }));
            });
          } catch (e) {
            console.log(e);
          }
        }
      });
    });
  }

  render() {
    return (
      <div className="c-video-player" />
    );
  }
}

VideoPlayer.propTypes = {
  recording: PropTypes.bool.isRequired,
};
