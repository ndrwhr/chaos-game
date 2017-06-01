import React, {Component} from 'react';

import Canvas from './Canvas';
import Controls from './controls/Controls';
import Game from './Game';
import GameUtils from './game-utils';
import Options from './Options';
import PointControl from './PointControl';

import './app.css';

class App extends Component {
  constructor(props){
    super(props);

    const controls = Object.keys(Options.defaultControls).reduce(
        (acc, option) => {
          acc[option] = Options.defaultControls[option].defaultValue();
          return acc;
        }, {});

    const game = Game.games[controls.gameIndex];

    Object.keys(game.controls).forEach(option => {
      controls[option] = game.controls[option].defaultValue(controls);
    });

    const points = this.createPointControls(controls);
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
    const qualityIndex = this.state.controls.qualityIndex;
    const quality = Options.defaultControls.qualityIndex.options[qualityIndex];

    const speedIndex = this.state.controls.speedIndex;
    const speed = Options.defaultControls.speedIndex.options[speedIndex].value;

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
          <PointControl
              onChange={(points) => this.onPointChange(points)}
              points={this.state.points}
              size={this.state.canvasSize}
          />
        </div>
        <div className="app__controls">
          <Controls
              {...this.state.controls}
              isRunning={this.state.isRunning}
              onChange={this.onControlChange}
            />
        </div>
      </div>
    );
  }

  createPointControls(controls){
    const numPoints =
        Options.defaultControls.shapeIndex.options[controls.shapeIndex].value;
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

      const controls = Object.assign({}, this.state.controls, {
        [option]: newValue,
      });

      const game = Game.games[controls.gameIndex];
      if (option === 'gameIndex'){
        Object.keys(Options.optionalControlFactory).forEach(key =>
          delete controls[key]);

        Object.keys(game.controls).forEach(gameOption => {
          controls[gameOption] =
            game.controls[gameOption].defaultValue(controls);
        });
      }

      let points = this.state.points;
      if (option === 'shapeIndex'){
        points = this.createPointControls(controls);

        if (game.controls.pointTransforms){
          controls.pointTransforms =
            game.controls.pointTransforms.defaultValue(controls);
        }
      }

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
