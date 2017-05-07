import React, {Component} from 'react';

import Canvas from './Canvas';
import Controls, {CONTROL_DEFAULTS} from './Controls';
import Game from './Game';
import './app.css';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      exclusions: CONTROL_DEFAULTS.EXCLUSIONS,
      historySize: CONTROL_DEFAULTS.HISTORY_SIZE,
      isRunning: CONTROL_DEFAULTS.IS_RUNNING,
      points: Game.setupNPoints(CONTROL_DEFAULTS.NUM_POINTS),
      speed: CONTROL_DEFAULTS.SPEED,
    };

    this._changeNumPoints = this._changeNumPoints.bind(this);
    this._changeExclusions = this._changeExclusions.bind(this);
    this._changeHistorySize = this._changeHistorySize.bind(this);
    this._changeSpeed = this._changeSpeed.bind(this);
    this._toggleIsRunning = this._toggleIsRunning.bind(this);
  }

  render() {
    return (
      <div className="app">
        <div className="app__controls">
          <Controls
              numPoints={this.state.points.length}
              onNumPointsChange={this._changeNumPoints}
              exclusions={this.state.exclusions}
              onExclusionsChange={this._changeExclusions}
              historySize={this.state.historySize}
              onHistorySizeChange={this._changeHistorySize}
              speed={this.state.speed}
              onSpeedChange={this._changeSpeed}
              isRunning={this.state.isRunning}
              onToggleIsRunning={this._toggleIsRunning}/>
        </div>
        <div className="app__canvas">
          <Canvas exclusions={this.state.exclusions}
              points={this.state.points}
              historySize={this.state.historySize}
              speed={this.state.speed}
              isRunning={this.state.isRunning}/>
        </div>
      </div>
    );
  }

  _changeNumPoints(numPoints) {
    this.setState({
      points: Game.setupNPoints(numPoints),
      isRunning: true,
    });
  }

  _changeExclusions(exclusions) {
    this.setState({
      exclusions,
      isRunning: true,
    });
  }

  _changeHistorySize(historySize) {
    this.setState({
      historySize,
      isRunning: true,
    });
  }

  _changeSpeed(speed){
    this.setState({
      speed,
      isRunning: true,
    });
  }

  _toggleIsRunning(){
    this.setState({
      isRunning: !this.state.isRunning,
    })
  }
}

export default App;
