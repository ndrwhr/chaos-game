import React, {Component} from 'react';

import Canvas from './Canvas';
import Controls from './controls/Controls';
import Games, { createPolygon } from '../utils/games';
import {
  getControlValues,
  readSavedControlValues,
  saveControlValues,
} from '../utils/control-utils';
import { DEFAULT_CONTROLS } from '../utils/options';

import './app.css';

const getPoints = ({shapeIndex}) =>
  createPolygon(DEFAULT_CONTROLS.shapeIndex.options[shapeIndex].value);

class App extends Component {
  constructor(props){
    super(props);

    const controls = getControlValues(readSavedControlValues());

    saveControlValues(controls);

    const points = getPoints(controls);
    const game = Games[controls.gameIndex];
    const attractor = game.createAttractor(points, controls);

    this.state = {
      attractor,
      canvasSize: 0,
      controls,
      isRunning: false,
      points,
    };

    this.canvas = null;

    this.onControlChange = this.onControlChange.bind(this);
  }

  componentDidMount(){
    this.onResize();
    window.addEventListener('resize', () => this.onResize());
  }

  render() {
    const game = Games[this.state.controls.gameIndex];

    const qualityIndex = this.state.controls.qualityIndex;
    const quality = DEFAULT_CONTROLS.qualityIndex.options[qualityIndex];

    const speedIndex = this.state.controls.speedIndex;
    const speed = DEFAULT_CONTROLS.speedIndex.options[speedIndex].value;

    return (
      <div className="app">
        <div
            className="app__canvas-container"
            ref={canvasContainer => {this.canvasContainer = canvasContainer;}}
        >
          <Canvas
              attractor={this.state.attractor}
              isRunning={this.state.isRunning}
              quality={quality.value}
              ref={canvas => {this.canvas = canvas;}}
              size={this.state.canvasSize}
              speed={speed}
          />
        </div>
        <div className="app__controls">
          <Controls
              {...this.state.controls}
              isRunning={this.state.isRunning}
              onChange={this.onControlChange}
              fixedNumTransforms={!!game.numTransforms}
            />
        </div>
      </div>
    );
  }

  onControlChange(option, newValue){
    if (option === 'isRunning'){
      this.setState({
        isRunning: newValue,
      });
    } else if (option === 'speedIndex'){
      const controls = Object.assign({}, this.state.controls, {
        [option]: newValue,
      });

      this.setState({
        controls,
        isRunning: true,
      });
    } else {
      this.canvas.clear();

      const controls = getControlValues({
        ...this.state.controls,
        [option]: newValue,
      });

      saveControlValues(controls);

      const game = Games[controls.gameIndex];
      const points = option === 'shapeIndex' ? getPoints(controls) : this.state.points;
      const attractor = game.createAttractor(points, controls);

      this.setState({
        attractor,
        controls,
        points,
        isRunning: true,
      });
    }
  }

  onPointChange(points){
    this.canvas.clear();

    const game = Games[this.state.controls.gameIndex];
    const attractor = game.createAttractor(points, this.state.controls);

    this.setState({
      attractor,
      points,
      isRunning: true,
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
