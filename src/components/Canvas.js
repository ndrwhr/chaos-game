import React, { Component } from 'react';

import { BACKGROUND_COLORS } from '../constants/controls';
import '../utils/canvas-to-blob-polyfill';

import './canvas.css';

const CANVAS_SCALE = 2;
const DRAWING_SCALE = 0.8;

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

    const size = this.props.size * CANVAS_SCALE;

    this._context.fillRect(
      -size,
      -size,
      size * 3,
      size * 3,
    );
  }

  resizeCanvas() {
    this._canvas.width = this.props.size * CANVAS_SCALE;
    this._canvas.height = this.props.size * CANVAS_SCALE;
    this._canvas.style.width = `${this.props.size}px`;
    this._canvas.style.height = `${this.props.size}px`;

    const offset = this.props.size * CANVAS_SCALE * (1 - DRAWING_SCALE) / 2;
    this._context.setTransform(DRAWING_SCALE, 0, 0, DRAWING_SCALE, offset, offset);

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
      while (performance.now() - start < 40){
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

    const [x, y] = point;
    const pointSize = this.props.quality;
    this._context.fillStyle = color;
    this._context.fillRect(
      x * this.props.size * CANVAS_SCALE,
      y * this.props.size * CANVAS_SCALE,
      pointSize,
      pointSize
    );
  }
}

export default Canvas;