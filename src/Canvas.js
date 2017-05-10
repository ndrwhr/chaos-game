import React, {Component} from 'react';

import Game from './Game';

const PASS_THROUGH_KEYS = [
  'exclusions',
  'historySize',
  'points',
];

const canvasWidth = 900;
const canvasHeight = 900;

class Canvas extends Component {
  constructor(props){
    super(props);

    this._setupGame(props);
  }

  componentDidMount() {
    this._context = this._canvas.getContext('2d');

    this._canvas.width = canvasWidth * 2;
    this._canvas.height = canvasHeight * 2;
    this._canvas.style.width = `${canvasWidth}px`;
    this._canvas.style.height = `${canvasHeight}px`;
    this._context.scale(2, 2);

    this._context.fillStyle = 'rgba(0,0,0,0.5)';
    this._context.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this._context.fillStyle = 'rgba(38, 50, 56, 0.66)';

    this._start();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isRunning === true){
      if (PASS_THROUGH_KEYS.some(key => nextProps[key] !== this.props[key])){
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._setupGame(nextProps);
      }

      this._start();
    }
  }

  render() {
    return (
      <canvas ref={canvas => {this._canvas = canvas;}}/>
    );
  }

  _start(){
    cancelAnimationFrame(this._animationId);
    const update = () => {
      for (let i = 0; i < this.props.speed; i++){
        this._draw();
      }

      if(this.props.isRunning){
        this._animationId = requestAnimationFrame(update);
      }
    };
    update();
  }

  _draw(){
    const point = this._attractor.getNextPoint();
    if (!point) return;

    const [x, y] = point;
    const size = 1;
    this._context.fillRect(x * canvasWidth, y * canvasHeight, size, size);
  }

  _setupGame({points, exclusions, historySize}){
    this._attractor = Game.createAttractor({
      exclusions,
      historySize,
      points,
    });
  }
}

export default Canvas;