import classNames from 'classnames';
import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

import Canvas from './Canvas';
import Controls from './controls/Controls';
import {
  BACKGROUND_TYPES,
  CONTROL_TYPES,
  CONTROLS,
  SERIALIZABLE_CONTROLS,
} from '../constants/controls';
import Games from '../constants/games';
import {
  createPolygon,
  getControlValues,
  getRandomControlValues,
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
      isRunning: true,
      isGeneratingDownloadLink: false,
      targets,
    };

    this.canvas = null;

    this.onControlChange = this.onControlChange.bind(this);
    this.onRandomizeAll = this.onRandomizeAll.bind(this);
  }

  componentDidMount(){
    this.onResize();
    window.addEventListener('resize', () => this.onResize());
  }

  render() {
    const background = CONTROLS[CONTROL_TYPES.BACKGROUND].extractValueFrom(this.state.controls);
    const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(this.state.controls)];
    const quality = CONTROLS[CONTROL_TYPES.QUALITY].extractValueFrom(this.state.controls);

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
              onRandomizeAll={this.onRandomizeAll}
            />
        </div>
      </div>
    );
  }

  onControlChange(controlType, newValue){
    const controlUpdate = {
      ...this.state.controls,
      [controlType]: newValue,
    };

    // Because we're going to be rendering a preset bump up the quality.
    if (controlType === CONTROL_TYPES.PRESET) {
      controlUpdate[CONTROL_TYPES.QUALITY] = Math.max(
        controlUpdate[CONTROL_TYPES.QUALITY],
        CONTROLS[CONTROL_TYPES.QUALITY].options.length - 2,
      );
    }

    // If the user changed something that will be serialized to the URL then we should clear
    // the preset state.
    if (SERIALIZABLE_CONTROLS.has(controlType)) {
      controlUpdate[CONTROL_TYPES.PRESET] = 0;
    }

    const controls = getControlValues(controlUpdate);
    this.updateStateWithNewControls(controls);
  }

  onRandomizeAll() {
    this.updateStateWithNewControls(getRandomControlValues({
      ...this.state.controls,
    }));
  }

  updateStateWithNewControls(controls) {
    saveControlValues(controls);

    const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(controls)];
    const targets = getTargets(controls);
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
