import React, {Component} from 'react';

import { BACKGROUND_COLORS } from '../constants/controls';
import '../utils/canvas-to-blob-polyfill';

import './canvas.css';

class Canvas extends Component {
  componentDidMount() {
    this._context = this._canvas.getContext('2d');

    this.resizeCanvas();

    this.start();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.size !== this.props.size) {
      this.resizeCanvas();
    }

    if (this.props.isRunning === true && !prevProps.isRunning) {
      this.start();
    }
  }

  clear() {
    this._context.fillStyle = BACKGROUND_COLORS[this.props.background];
    this._context.fillRect(0, 0, this.props.size, this.props.size);
  }

  resizeCanvas() {
    this._canvas.width = this.props.size * 2;
    this._canvas.height = this.props.size * 2;
    this._canvas.style.width = `${this.props.size}px`;
    this._canvas.style.height = `${this.props.size}px`;
    this._context.scale(2, 2);
    this.clear();
  }

  render() {
    return (
      <canvas className="canvas" ref={canvas => {this._canvas = canvas;}} />
    );
  }

  toBlob(){
    return new Promise(resolve => {
      this._canvas.toBlob((blob) => {
        resolve(blob);
      });
    });
  }

  start(){
    cancelAnimationFrame(this._animationId);
    const update = () => {
      // Draw as many points as possible in 50 milliseconds.
      const start = performance.now();
      while (performance.now() - start < this.props.speed){
        this.draw();
      }

      if(this.props.isRunning){
        this._animationId = requestAnimationFrame(update);
      }
    };
    update();
  }

  draw(){
    const {color, point} = this.props.attractor.getNextPoint();
    if (!point) return;

    const scale = 0.8;
    const offset = (1 - scale) / 2;

    const [x, y] = point;
    const pointSize = this.props.quality;
    this._context.fillStyle = color;
    this._context.fillRect(
      ((x * scale) + offset) * this.props.size,
      ((y * scale) + offset) * this.props.size,
      pointSize,
      pointSize
    );
  }
}

export default Canvas;