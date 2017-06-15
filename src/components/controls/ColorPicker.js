import classNames from 'classnames';
import _ from 'lodash';
import React, { Component } from 'react';

import { COLOR_INDEXES } from '../../constants/colors';
import { getActualColor, isLightColor } from '../../utils/color-utils';

import './color-picker.css';

export default class ColorPicker extends Component {
  constructor(props){
    super(props);
    this.onBodyClick = this.onBodyClick.bind(this);
  }

  componentDidMount(){
    document.body.addEventListener('click', this.onBodyClick);
  }

  componentWillUnmount(){
    document.body.removeEventListener('click', this.onBodyClick);
  }

  render(){
    const props = this.props;
    const hueIndex = 4;
    const color = props.color === null || props.color === undefined ?
      COLOR_INDEXES[0][hueIndex] : props.color;

    const shades = COLOR_INDEXES.find(shadeList => shadeList.includes(color));
    const shadeIndex = shades.indexOf(color);

    const hues = COLOR_INDEXES.map(shadeList => shadeList[hueIndex]);
    const selectedHue = shades[hueIndex];

    const selectRandomColor = () => {
      const shiftedShadeIndex = shadeIndex + _.sample(_.range(-2, 2));
      const newShadeIndex = _.clamp(shiftedShadeIndex, 0, shades.length);
      const newColor = _.sample(COLOR_INDEXES)[newShadeIndex];
      props.onChange(newColor);
    };

    const classes = classNames('color-picker', {
      'color-picker--open': props.open,
    });

    return (
      <div className={classes}>
        <div className="color-picker__lists">
          <div className="color-picker__list color-picker__list--hues">
            {hues.map(hue => (
              <button
                key={`hue-${hue}`}
                className={
                  classNames('color-picker__button color-picker__button--hue', {
                    'color-picker__button--dark-text': isLightColor(hue),
                    'color-picker__button--selected': hue === selectedHue,
                  })
                }
                style={{background: getActualColor(hue)}}
                onClick={() => this.props.onChange(hue)}
              />
            ))}
          </div>

          <div className="color-picker__list color-picker__list--shades">
            {shades.map((shade, index) => (
              <button
                key={`shade-${index}`}
                className={
                  classNames('color-picker__button color-picker__button--shade', {
                    'color-picker__button--dark-text': isLightColor(shade),
                    'color-picker__button--selected': shade === color,
                  })
                }
                style={{background: getActualColor(shade)}}
                onClick={() => this.props.onChange(shade)}
              />
            ))}
          </div>
        </div>
        <div className="color-picker__controls">
          <button
            className="btn btn--inline"
            onClick={selectRandomColor}
          >
            select random
          </button>
          <button
            className="btn btn--inline"
            onClick={props.onClose}
          >
            close
          </button>
        </div>
      </div>
    );
  }

  onBodyClick(evt){
    if (!evt.target.matches('.color-picker, .color-picker *') && this.props.open){
      this.props.onClose();
    }
  }
}
