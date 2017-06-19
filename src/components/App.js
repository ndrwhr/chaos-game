import classNames from 'classnames';
import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

import Canvas from './Canvas';
import Controls from './controls/Controls';
import { BACKGROUND_TYPES, CONTROL_TYPES, CONTROLS } from '../constants/controls';
import Games from '../constants/games';
import {
  createPolygon,
  getControlValues,
  readSavedControlValues,
  saveControlValues,
} from '../utils/control-utils';
import { isTouchDevice } from '../utils/browser-utils';

import './app.css';

const getTargets = (controls) => (
  createPolygon(CONTROLS[CONTROL_TYPES.NUM_TARGETS].extractValueFrom(controls))
);

const getDelayPromise = time => new Promise(resolve => setTimeout(resolve, time));

class App extends Component {
  constructor(props) {
    super(props);

    const controls = getControlValues(readSavedControlValues());

    saveControlValues(controls);

    const targets = getTargets(controls);
    const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(controls)];
    const attractor = game.createAttractor(targets, controls);

    this.state = {
      attractor,
      canvasSize: 0,
      controls,
      downloadUrl: null,
      isRunning: false,
      isGeneratingDownloadLink: false,
      targets,
    };

    this.canvas = null;

    this.onControlChange = this.onControlChange.bind(this);
  }

  componentDidMount(){
    this.onResize();
    window.addEventListener('resize', () => this.onResize());
  }

  render() {
    const background = CONTROLS[CONTROL_TYPES.BACKGROUND].extractValueFrom(this.state.controls);
    const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(this.state.controls)];
    const quality = CONTROLS[CONTROL_TYPES.QUALITY].extractValueFrom(this.state.controls);
    const speed = CONTROLS[CONTROL_TYPES.SPEED].extractValueFrom(this.state.controls);

    return (
      <div
        className={classNames('app', {
          'app--dark': background === BACKGROUND_TYPES.DARK,
        })}
      >
        <div
            className="app__canvas-container"
            ref={canvasContainer => {this.canvasContainer = canvasContainer;}}
        >
          <Canvas
              background={background}
              attractor={this.state.attractor}
              isRunning={this.state.isRunning}
              quality={quality}
              ref={canvas => {this.canvas = canvas;}}
              size={this.state.canvasSize}
              speed={speed}
          />

          <div className="app__meta-controls">
            <button
              className="app__meta-control app__meta-control--download"
              onClick={() => this.onDownloadButtonClick()}
              download="chaos-game.jpeg"
              title="Download"
            />
            <button
              className={classNames('app__meta-control', {
                'app__meta-control--pause': this.state.isRunning,
                'app__meta-control--play': !this.state.isRunning,
              })}
              onClick={() => this.setState({ isRunning: !this.state.isRunning })}
              title={this.state.isRunning ? 'Pause' : 'Play'}
            />
          </div>

          <CSSTransitionGroup
            transitionName={{
              leave: 'app__download-mask--leave',
              leaveActive: 'app__download-mask--leave-active',
              enter: 'app__download-mask--enter',
              enterActive: 'app__download-mask--enter-active',
            }}
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}
          >
            {(this.state.isGeneratingDownloadLink || this.state.downloadUrl) && (
              <div
                className="app__download-mask"
                onClick={() => this.state.downloadUrl && this.onDownloadLinkClick()}
              >
                {this.state.isGeneratingDownloadLink ? (
                  <div className="app__download-progress">generating download link...</div>
                ) : (
                  <a
                    className="btn btn--large"
                    download="chaos-game.png"
                    href={this.state.downloadUrl}
                  >
                    {isTouchDevice() ? 'tap' : 'click'} here to download
                  </a>
                )}
              </div>
            )}
          </CSSTransitionGroup>
        </div>
        <div className="app__controls">
          <Controls
              controls={this.state.controls}
              fixedNumTransforms={!!game.numTransforms}
              onChange={this.onControlChange}
            />
        </div>
      </div>
    );
  }

  onControlChange(controlType, newValue){
    if (controlType === CONTROL_TYPES.SPEED){
      const controls = Object.assign({}, this.state.controls, {
        [controlType]: newValue,
      });

      this.setState({
        controls,
        downloadUrl: null,
        isRunning: true,
      });
    } else {
      const controls = getControlValues({
        ...this.state.controls,
        [controlType]: newValue,
      });

      saveControlValues(controls);

      const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(controls)];
      const targets = controlType === CONTROL_TYPES.NUM_TARGETS ?
        getTargets(controls) : this.state.targets;
      const attractor = game.createAttractor(targets, controls);

      this.setState({
        attractor,
        controls,
        downloadUrl: null,
        isRunning: true,
        targets,
      }, () => {
        // Clear the canvas once we know it's properties have been updated.
        this.canvas.clear();
      });
    }
  }

  onDownloadButtonClick(){
    this.setState({
      isRunning: false,
      isGeneratingDownloadLink: true,
    }, () => {
      Promise.all([
        this.canvas.toBlob(),
        getDelayPromise(2 * 1000),
      ]).then(([blob]) => {
        this.setState({
          downloadUrl: window.URL.createObjectURL(blob),
          isGeneratingDownloadLink: false,
        });
      });
    });
  }

  onDownloadLinkClick(){
    this.setState({
      downloadUrl: null,
    });
  }

  onResize(){
    const rect = this.canvasContainer.getBoundingClientRect();
    this.setState({
      canvasSize: Math.min(rect.width, rect.height),
    });
  }
}

export default App;
