import React, {Component} from 'react';

class Canvas extends Component {
  componentDidMount() {
    this._context = this._canvas.getContext('2d');

    this.resizeCanvas(this.props.size);

    this._context.fillStyle = 'rgba(38, 50, 56, 0.5)';

    this.start();
  }

  componentWillUpdate(nextProps){
    if (nextProps.size !== this.props.size){
      this.resizeCanvas(nextProps.size);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isRunning === true && !prevProps.isRunning){
      this.start();
    }
  }

  clear(){
    this._context.fillStyle = 'white';
    this._context.fillRect(0, 0, this.props.size, this.props.size);
  }

  resizeCanvas(newSize){
    this.clear();

    this._canvas.width = newSize * 2;
    this._canvas.height = newSize * 2;
    this._canvas.style.width = `${newSize}px`;
    this._canvas.style.height = `${newSize}px`;
    this._context.scale(2, 2);
  }

  render() {
    return (
      <canvas ref={canvas => {this._canvas = canvas;}}/>
    );
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