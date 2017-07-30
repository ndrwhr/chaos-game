import classNames from 'classnames';
import _ from 'lodash';
import React, { Component } from 'react';

import './range.css';

const getClientX = evt => {
  if (evt.touches && evt.touches[0]) {
    return evt.touches[0].clientX;
  }
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
    window.removeEventListener('touchmove', this.onDrag, true);
    window.removeEventListener('touchend', this.onDragEnd, true);
    window.removeEventListener('mousemove', this.onDrag, true);
    window.removeEventListener('mouseup', this.onDragEnd, true);
  }

  render() {
    const barWidth =
      (this.props.value - this.props.minValue) /
      (this.props.maxValue - this.props.minValue);

    return (
      <div
        className={classNames('range', {
          'range--dragging': this.state.isDragging,
        })}
        title={this.props.title}
      >
        <div className={`range__icon range__icon--${this.props.title}`}>
          {this.props.icon}
        </div>
        <div
          className="range__slider-container"
          ref={el => {
            this.sliderContainerEl = el;
          }}
          onTouchStart={this.onDragStart}
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

    window.addEventListener('touchmove', this.onDrag, true);
    window.addEventListener('touchend', this.onDragEnd, true);
    window.addEventListener('mousemove', this.onDrag, true);
    window.addEventListener('mouseup', this.onDragEnd, true);

    this.onDrag(evt);

    this.setState({
      isDragging: true,
    });
  }

  onDrag(evt) {
    evt.stopPropagation();

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
