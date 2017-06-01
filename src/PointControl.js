import classNames from 'classnames';
import {vec2} from 'gl-matrix';
import React, {Component} from 'react';

import './point-control.css';

export default class PointControl extends Component {
  constructor(props){
    super(props);

    this.state = {
      points: props.points.slice().map(point => vec2.clone(point)),
      activePoint: null,
    };
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      points: nextProps.points.slice().map(point => vec2.clone(point)),
      activePoint: null,
    });
  }

  onMouseMove(evt){
    const index = this.state.activePoint;
    if (index !== null){
      const rect = this.el.getBoundingClientRect();
      const rectTop = rect.top + (0.1 * this.props.size);
      const rectLeft = rect.left + (0.1 * this.props.size);
      const max = this.props.size * 0.8;

      const x = Math.max(Math.min(evt.pageX - rectLeft, max), 0);
      const y = Math.max(Math.min(evt.pageY - rectTop, max), 0);

      if (this.state.points[index][0] !== x ||
          this.state.points[index][0] !== y){

        const updatedPoints = this.state.points.slice();
        updatedPoints[index] = vec2.fromValues(x / max, y / max);
        this.setState({
          points: updatedPoints,
        });
      }
    }
  }

  onMouseUp(){
    if (this.state.activePoint !== null){
      this.props.onChange(this.state.points);
    }
  }

  onPointMouseDown(index){
    this.setState({
      activePoint: index,
    })
  }

  renderPoint(point, index){
    const scale = 0.8;
    const offset = (1 - scale) / 2;

    const [left, top] = point;

    const style = {
      top: ((top * scale) + offset) * this.props.size,
      left: ((left * scale) + offset) * this.props.size,
    };

    const classes = classNames('point-control__point', {
      'point-control__point--active': index === this.state.activePoint,
    });

    return (
      <div
          className={classes}
          key={`${index},${left},${top}`}
          onMouseDown={() => this.onPointMouseDown(index)}
          style={style}
      />
    );
  }

  render(){
    return (
      <div
          className="point-control"
          onMouseUp={() => this.onMouseUp()}
          onMouseLeave={() => this.onMouseUp()}
          onMouseMove={(evt) => this.onMouseMove(evt)}
          ref={el => {this.el = el;}}
          style={{
            height: this.props.size,
            width: this.props.size,
          }}
      >
        {this.state.points.map((point, index) =>
            this.renderPoint(point, index))}
      </div>
    );
  }
}