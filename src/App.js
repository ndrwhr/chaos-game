import React, {Component} from 'react';

import Canvas from './Canvas';
import Controls from './controls/Controls';
import Game from './Game';
import GameUtils from './game-utils';
import { COLOR_MODES, DEFAULT_CONTROLS } from './Options';

import './app.css';

const getControlValues = (existingControls = {}) => {
  const controls = [
    'gameIndex',
    'exclusions',
    'qualityIndex',
    'shapeIndex',
    'speedIndex',
  ].reduce((acc, control) => {
    const previousValue = existingControls[control];
    acc[control] = previousValue !== null && previousValue !== undefined ?
      previousValue : DEFAULT_CONTROLS[control].defaultValue();
    return acc;
  }, {});

  const numPoints = DEFAULT_CONTROLS.shapeIndex.options[controls.shapeIndex].value;
  const game = Game.games[controls.gameIndex];

  Object.keys(game.controls).forEach(control => {
    const previousValue = existingControls[control];
    controls[control] = previousValue !== null && previousValue !== undefined ?
      previousValue : game.controls[control].defaultValue();
  });

  if (game.numTransforms){
    const numTransforms = game.numTransforms(controls);
    controls.transforms = (existingControls.transforms || []).slice(0, numTransforms);
    while (controls.transforms.length < numTransforms){
      controls.transforms.push(DEFAULT_CONTROLS.transforms.createTransform());
    }
  } else {
    controls.transforms = existingControls.transforms ||
      DEFAULT_CONTROLS.transforms.defaultValue();
  }

  let numColors = !controls.colorModeIndex ||
    controls.colorModeIndex === COLOR_MODES.BY_TRANSFORM ?
    controls.transforms.length : numPoints;

  // Set up the color controls based on the previously set color options.
  controls.colors = DEFAULT_CONTROLS.colors
    .defaultValue(existingControls.colors, numColors);

  return controls;
};

const getPoints = ({shapeIndex}) =>
  GameUtils.createPolygon(DEFAULT_CONTROLS.shapeIndex.options[shapeIndex].value);

class App extends Component {
  constructor(props){
    super(props);

    const controls = getControlValues();
    const points = getPoints(controls);
    const game = Game.games[controls.gameIndex];
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
    const game = Game.games[this.state.controls.gameIndex];

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

  createPointControls(controls){
    const numPoints =
        DEFAULT_CONTROLS.shapeIndex.options[controls.shapeIndex].value;
    return GameUtils.createPolygon(numPoints);
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
      const game = Game.games[controls.gameIndex];
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

    const game = Game.games[this.state.controls.gameIndex];
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
