import React, { Component, PropTypes } from 'react';
import Recorder from '../../utils/Recorder';

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.record.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.recording !== prevProps.recording) ||
      (this.props.paused !== prevProps.paused) ||
      (this.props.cancel !== prevProps.cancel)
    ) {
      const { cancel, paused, recording } = this.props;

      if (cancel && !recording) { return; }

      // Check if to pause the recording
      if (paused && recording && !cancel) {
          VideoPlayer.pauseRecording();
          return;
      }

      // Check if to cancel the recording
      if (cancel && (recording || paused)) {
        this.cancelRecording();
        return;
      }

      recording ?
        this.record() :
        VideoPlayer.stopRecording();
    }
  }

  cancelRecording() {
    const { onReset } = this.props;
    Recorder.instance.cancelRecording(onReset);
  }

  static pauseRecording() {
    Recorder.instance.pauseRecording();
  }

  static stopRecording() {
    Recorder.instance.stopRecording();
  }

  record() {
    const { source } = this.props;

    Recorder.instance.record(source);
  }

  render() {
    return (
      <div className="c-video-player" />
    );
  }
}

VideoPlayer.propTypes = {
  source: PropTypes.object,
  recording: PropTypes.bool.isRequired,
};

VideoPlayer.defaultProps = {
  source: {}
};
