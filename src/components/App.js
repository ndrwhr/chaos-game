import classNames from 'classnames';
import React, { Component } from 'react';

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
import Canvas from './Canvas';
import Controls from './controls/Controls';
import Button from './controls/Button';
import DownloadModal, { DOWNLOAD_MODAL_STEPS } from './DownloadModal';

import './app.css';

const getTargets = controls =>
  createPolygon(CONTROLS[CONTROL_TYPES.NUM_TARGETS].extractValueFrom(controls));

const getDelayPromise = time =>
  new Promise(resolve => setTimeout(resolve, time));

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
      downloadModalStep: null,
      downloadUrl: null,
      isRunning: true,
      isGeneratingDownloadLink: false,
      targets,
    };

    this.canvas = null;

    this.onControlChange = this.onControlChange.bind(this);
    this.onRandomizeAll = this.onRandomizeAll.bind(this);
  }

  componentDidMount() {
    this.onResize();
    window.addEventListener('resize', () => this.onResize());
  }

  render() {
    const background = CONTROLS[CONTROL_TYPES.BACKGROUND].extractValueFrom(
      this.state.controls,
    );
    const game =
      Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(this.state.controls)];
    const quality = CONTROLS[CONTROL_TYPES.QUALITY].extractValueFrom(
      this.state.controls,
    );

    return (
      <div
        className={classNames('app', {
          'app--dark': background === BACKGROUND_TYPES.DARK,
        })}
      >
        <div
          className="app__canvas-container"
          ref={canvasContainer => {
            this.canvasContainer = canvasContainer;
          }}
        >
          <Canvas
            background={background}
            attractor={this.state.attractor}
            isRunning={this.state.isRunning}
            quality={quality}
            ref={canvas => {
              this.canvas = canvas;
            }}
            size={this.state.canvasSize}
          />
          <div className="app__meta-controls">
            <Button
              baseClassName="app__meta-control"
              modifiers={{ download: true }}
              onPress={() =>
                this.setState({
                  isRunning: false,
                  downloadModalStep: DOWNLOAD_MODAL_STEPS.INITIAL,
                })}
              title="Download"
            />
            <Button
              baseClassName="app__meta-control"
              modifiers={{
                pause: this.state.isRunning,
                play: !this.state.isRunning,
              }}
              onPress={() =>
                this.setState({ isRunning: !this.state.isRunning })}
              title={this.state.isRunning ? 'Pause' : 'Play'}
            />
          </div>

          <DownloadModal
            downloadUrl={this.state.downloadUrl}
            step={this.state.downloadModalStep}
            onAspectratioSelect={aspectRation => {
              this.setState(
                {
                  downloadModalStep: DOWNLOAD_MODAL_STEPS.GENERATING,
                },
                () => {
                  Promise.all([
                    this.canvas.toBlob(aspectRation),
                    getDelayPromise(2 * 1000),
                  ]).then(([blob]) => {
                    this.setState({
                      downloadUrl: window.URL.createObjectURL(blob),
                      downloadModalStep: DOWNLOAD_MODAL_STEPS.READY,
                    });
                  });
                },
              );
            }}
            onClose={() =>
              this.setState({
                downloadModalStep: null,
                downloadUrl: null,
                isRunning: true,
              })}
          />
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

  onControlChange(controlType, newValue) {
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
    this.updateStateWithNewControls(
      getRandomControlValues({
        ...this.state.controls,
      }),
    );
  }

  updateStateWithNewControls(controls) {
    saveControlValues(controls);

    const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(controls)];
    const targets = getTargets(controls);
    const attractor = game.createAttractor(targets, controls);

    this.setState(
      {
        attractor,
        controls,
        downloadUrl: null,
        isRunning: true,
        targets,
      },
      () => {
        // Clear the canvas once we know it's properties have been updated.
        this.canvas.clear();
      },
    );
  }

  onResize() {
    const rect = this.canvasContainer.getBoundingClientRect();
    this.setState({
      canvasSize: Math.min(rect.width, rect.height),
    });
  }
}

export default App;
