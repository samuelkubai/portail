// Launch the cropper
// Allow user to select a custom area
// Countdown to 3 secs before launching next step
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

const count = 5;

export default class Cropper extends Component {
  static getCanvas() {
    return document.getElementById('cropper-canvas');
  }

  static getCanvasCtx() {
    return this.getCanvas().getContext('2d');
  }

  constructor(props) {
    super(props);
    this.state = {
      area: { width: 0, height: 0 },
      canvas: { height: 0, width: 0 },
      start: { x: 0, y: 0 },
      completedCropping: false,
      countdown: null,
      counter: 5,
      drag: false,
      thickness: 2,
    };

    this.draw.bind(this);
    this.endDrag.bind(this);
    this.moveDrag.bind(this);
    this.startArea.bind(this);
    this.triggerCountdown.bind(this);
    this.markCroppingCompleted.bind(this);
    this.resetCounter.bind(this);
    this.renderPrompt.bind(this);
    this.updateCounter.bind(this);
  }

  static cancelCropping() {
    ipcRenderer.send('cancel-cropper');
  }

  componentDidMount() {
    this.setState(state => {
      return Object.assign(state, {
        canvas: {
          height: Cropper.getCanvas().parentElement.getBoundingClientRect().height,
          width: Cropper.getCanvas().parentElement.getBoundingClientRect().width
        }
      })
    }, () => this.draw())
  }

  draw() {
    const { area, start } = this.state;

    // Define fill color
    Cropper.getCanvasCtx().fillStyle = "rgba(0,0,0,0.5)";

    // Draw the top
    let top = {
      x: 0,
      y: 0,
      width: Cropper.getCanvas().parentElement.getBoundingClientRect().width,
      height: start.y
    };
    if (area.height < 1) {
      top = Object.assign(top, { height: start.y - Math.abs(area.height) })
    }

    Cropper.getCanvasCtx().fillRect(top.x, top.y, top.width, top.height);

    // Draw the left
    let left = { x: 0, y: top.height, width: start.x, height: Math.abs(area.height)};
    if (area.width < 1) {
      left = Object.assign(left, { width: start.x - Math.abs(area.width) })
    }
    console.log(`Cropper.draw(): Left => `, left);
    Cropper.getCanvasCtx().fillRect(left.x, left.y, left.width, left.height);

    // Draw the bottom
    let bottom = {
      x: 0,
      y: left.height + left.y,
      width: Cropper.getCanvas().parentElement.getBoundingClientRect().width,
      height: Cropper.getCanvas().parentElement.getBoundingClientRect().height - (left.height + left.y)
    };
    console.log(`Cropper.draw(): Bottom => `, bottom);
    Cropper.getCanvasCtx().fillRect(bottom.x, bottom.y, bottom.width, bottom.height);

    // Draw the right
    let right = {
      x: start.x + area.width,
      y: start.y,
      width: Cropper.getCanvas().parentElement.getBoundingClientRect().width - (start.x + area.width),
      height: area.height
    };
    if (area.width < 1) {
      right = Object.assign(right, { x: start.x })
    }
    console.log(`Cropper.draw(): Right => `, right);
    Cropper.getCanvasCtx().fillRect(right.x, right.y, right.width, right.height);
  }

  endDrag() {
    console.log(`Cropper.endDrag(): State => `, this.state);
    this.setState(state => {
      return Object.assign(state, { drag: false });
    }, () => this.triggerCountdown());
  }

  markCroppingCompleted() {
    console.log(`Cropper.markCroppingCompleted() => Called`);
    this.resetCounter();
    this.setState(state => {
      return Object.assign(state, { completedCropping: true })
    }, () => {
      ipcRenderer.send('finish-cropping', { state: this.state });
    });
  }

  moveDrag(evt) {
    const { drag, start } = this.state;

    if (drag) {
      console.log(`Cropper.moveDrag() => Called`);
      const boundingClientRect = Cropper.getCanvas().getBoundingClientRect();
      console.log(`Cropper.moveDrag() => Bounding client `, Cropper.getCanvas().parentElement.getBoundingClientRect());
      const area = {
        width: (evt.clientX - boundingClientRect.left) - start.x,
        height: (evt.clientY - boundingClientRect.top) - start.y
      };

      // Updating the inverted version of the start co-ordinate
      const invertedY = area.height > 0 ?
        Cropper.getCanvas().parentElement.getBoundingClientRect().height - evt.clientY :
        Cropper.getCanvas().parentElement.getBoundingClientRect().height - start.y;

      const invertedX = area.width > 0 ? start.x : evt.clientX;

      const startWithInversion = Object.assign(start, {
        inverted: {
          x: invertedX,
          y: invertedY
        }
      });

      this.setState(state => {
        return Object.assign(state, { area, start: startWithInversion });
      }, () => {
        Cropper.getCanvasCtx().clearRect(0, 0, Cropper.getCanvas().width, Cropper.getCanvas().height);
        this.draw();
      });
    }
  }

  startArea(evt) {
    console.log(`Cropper.startArea() => Called`);
    this.resetCounter();

    const boundingClientRect = Cropper.getCanvas().getBoundingClientRect();
    const start = {
      x: evt.clientX - boundingClientRect.left,
      y: evt.clientY - boundingClientRect.top,
    };

    this.setState(state => {
      return Object.assign(
        state,
        {
          countdown: null,
          drag: true,
          start,
        }
      );
    });
  }

  triggerCountdown() {
    console.log(`Cropper.triggerCountdown() => Called`);
    const c = setInterval(
      () => {
        if (!this.updateCounter()) {
          this.markCroppingCompleted()
        }
      },
      1000
    );

    this.setState(state => {
      return Object.assign(state, {
        countdown: c
      });
    })
  }

  resetCounter() {
    const { countdown } = this.state;

    clearInterval(countdown);
    this.setState(state => Object.assign(state, { countdown: null, counter: count }));
  }

  updateCounter() {
    const { counter } = this.state;

    if (counter > 1) {
      this.setState(state => Object.assign(state, { counter: counter - 1 }));
      return true;
    }

    return false;
  }

  renderCounter() {
    const { counter } = this.state;

    return (
      <div className="c-prompt">
        <div className="c-prompt__text">
          About to start recording in:
        </div>

        <div className="c-prompt__action c-prompt__action--inverted">
          { counter }
        </div>
      </div>
    )
  }

  renderPrompt({ onCancel }) {
    return (
      <div className="c-prompt">
        <div className="c-prompt__text">
          Select area to record
        </div>

        <div className="c-prompt__action" onClick={evt => (onCancel(evt))}>
          <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0)">
              <path d="M7.061 6l4.72-4.718A.75.75 0 1 0 10.718.221L6 4.94 1.281.22A.75.75 0 1 0 .22 1.283l4.719 4.719-4.72 4.719a.75.75 0 1 0 1.062 1.06l4.72-4.718 4.718 4.719a.748.748 0 0 0 1.061 0 .75.75 0 0 0 0-1.062L7.061 6.002z" fill="#1E2834"/>
            </g>
            <defs>
              <clipPath id="clip0">
                <path fill="#fff" d="M0 0h12v12H0z"/>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    )
  }

  render() {
    const { canvas: { height, width }, drag, completedCropping, countdown } = this.state;
    return (
      <div className="fragment">
        <canvas
          width={width}
          height={height}
          id="cropper-canvas"
          onMouseDown={evt => { this.startArea(evt) }}
          onMouseMove={evt => { this.moveDrag(evt) }}
          onMouseUp={() => { this.endDrag() }}
        />

        { !drag && !completedCropping && !countdown &&  this.renderPrompt({ onCancel: Cropper.cancelCropping }) }
        { !drag && !completedCropping && countdown &&  this.renderCounter() }
      </div>
    );
  }
}
