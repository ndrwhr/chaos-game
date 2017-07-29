import classNames from 'classnames';
import _ from 'lodash';
import React, { Component } from 'react';

import './range.css';

const getClientX = evt => {
  return evt.clientX;
};

export default class Range extends Component {
  constructor(props) {
    super(props);

    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.state = {
      isDragging: false,
    };
  }

  componentWillUnmount() {
    this.cleanupEvents();
  }

  cleanupEvents() {
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.onDragEnd);
  }

  render() {
    const barWidth =
      (this.props.value - this.props.minValue) /
      (this.props.maxValue - this.props.minValue);

    return (
      <div className="range" title={this.props.title}>
        <div className={`range__icon range__icon--${this.props.title}`}>
          {this.props.icon}
        </div>
        <div
          className={classNames('range__slider-container', {
            'range__slider-container--active': this.state.isDragging,
          })}
          ref={el => {
            this.sliderContainerEl = el;
          }}
          onMouseDown={this.onDragStart}
        >
          <div
            style={{
              transform: `scaleX(${barWidth})`,
            }}
            className="range__slider-bar"
          />
        </div>
      </div>
    );
  }

  onDragStart(evt) {
    document.activeElement.blur();

    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.onDragEnd);

    this.onDrag(evt);

    this.setState({
      isDragging: true,
    });
  }

  onDrag(evt) {
    evt.preventDefault();

    const containerRect = this.sliderContainerEl.getBoundingClientRect();
    const position = _.clamp(
      (getClientX(evt) - containerRect.left) /
        (containerRect.right - containerRect.left),
      0,
      1,
    );
    const newValue =
      (this.props.maxValue - this.props.minValue) * position +
      this.props.minValue;

    this.props.onChange(newValue);
  }

  onDragEnd() {
    this.setState({
      isDragging: false,
    });
    this.cleanupEvents();
  }
}
