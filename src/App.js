import React, {Component} from 'react';

import Canvas from './Canvas';
import Controls from './Controls';
import Game from './Game';
import Options from './Options';

import './app.css';

class App extends Component {
  constructor(props){
    super(props);

    const controls = Object.keys(Options.defaultControls).reduce(
        (acc, option) => {
          acc[option] = Options.defaultControls[option].defaultValue;
          return acc;
        }, {});

    const game = Game.games[controls.gameIndex];

    Object.keys(game.controls).forEach(option => {
      controls[option] = game.controls[option].defaultValue;
    });

    const numPoints =
      Options.defaultControls.shapeIndex.options[controls.shapeIndex].value;
    const points = Game.setupNPoints(numPoints);
    const attractor = game.createAttractor(points, controls);

    this.state = {
      attractor,
      points,
      controls,
      isRunning: true,
    };

    this.canvas = null;

    this.onControlChange = this.onControlChange.bind(this);
  }

  render() {
    const speedIndex = this.state.controls.speedIndex;
    const speed = Options.defaultControls.speedIndex.options[speedIndex];

    const qualityIndex = this.state.controls.qualityIndex;
    const quality = Options.defaultControls.qualityIndex.options[qualityIndex];

    return (
      <div className="app">
        <div className="app__controls">
          <Controls
              {...this.state.controls}
              isRunning={this.state.isRunning}
              onChange={this.onControlChange}
            />
        </div>
        <div className="app__canvas">
          <Canvas
              ref={canvas => {this.canvas = canvas;}}
              attractor={this.state.attractor}
              speed={speed}
              size={quality.value}
              isRunning={this.state.isRunning}
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

      const controls = Object.assign({}, this.state.controls, {
        [option]: newValue,
      });

      const numPoints =
          Options.defaultControls.shapeIndex.options[controls.shapeIndex].value;
      const points = option === 'shapeIndex' ?
          Game.setupNPoints(numPoints) : this.state.points;

      const game = Game.games[controls.gameIndex];
      if (option === 'gameIndex'){
        Object.keys(game.controls).forEach(gameOption => {
          controls[gameOption] = game.controls[gameOption].defaultValue;
        });
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
}

export default App;
