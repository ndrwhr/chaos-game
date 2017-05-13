import React, {Component} from 'react';

const canvasWidth = 900;
const canvasHeight = 900;

class Canvas extends Component {
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

  componentDidUpdate(prevProps) {
    if (this.props.isRunning === true && !prevProps.isRunning){
      this._start();
    }
  }

  clear(){
    this._context.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  render() {
    return (
      <canvas ref={canvas => {this._canvas = canvas;}}/>
    );
  }

  _start(){
    // clearTimeout(this._animationId);
    cancelAnimationFrame(this._animationId);
    const update = () => {
      // console.time('update');
      for (let i = 0; i < this.props.speed; i++){
        this._draw();
      }
      // console.timeEnd('update');

      if(this.props.isRunning){
        // this._animationId = setTimeout(update, 1000);
        this._animationId = requestAnimationFrame(update);
      }
    };
    update();
  }

  _draw(){
    const point = this.props.attractor.getNextPoint();
    if (!point) return;

    const [x, y] = point;
    const size = 1;
    this._context.fillRect(x * canvasWidth, y * canvasHeight, size, size);
  }
}

export default Canvas;