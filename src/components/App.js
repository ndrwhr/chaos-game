import React, {Component} from 'react';

import Canvas from './Canvas';
import Controls from './controls/Controls';
import { CONTROL_TYPES, CONTROLS } from '../constants/controls';
import Games from '../constants/games';
import {
  createPolygon,
  getControlValues,
  readSavedControlValues,
  saveControlValues,
} from '../utils/control-utils';

import './app.css';

const getTargets = (controls) => (
  createPolygon(CONTROLS[CONTROL_TYPES.NUM_TARGETS].extractValueFrom(controls))
);

class App extends Component {
  constructor(props){
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
      isRunning: false,
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
    const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(this.state.controls)];
    const quality = CONTROLS[CONTROL_TYPES.QUALITY].extractValueFrom(this.state.controls);
    const speed = CONTROLS[CONTROL_TYPES.SPEED].extractValueFrom(this.state.controls);

    return (
      <div className="app">
        <div
            className="app__canvas-container"
            ref={canvasContainer => {this.canvasContainer = canvasContainer;}}
        >
          <Canvas
              attractor={this.state.attractor}
              isRunning={this.state.isRunning}
              quality={quality}
              ref={canvas => {this.canvas = canvas;}}
              size={this.state.canvasSize}
              speed={speed}
          />
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
        isRunning: true,
      });
    } else {
      this.canvas.clear();

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
        targets,
        isRunning: true,
      });
    }
  }

  onResize(){
    const rect = this.canvasContainer.getBoundingClientRect();
    this.setState({
      canvasSize: Math.min(rect.width, rect.height),
    });
  }
}

export default App;
