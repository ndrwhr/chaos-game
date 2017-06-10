import _ from 'lodash';
import classNames from 'classnames';
import React from 'react';

import Options from '../Options';

import './color-picker.css';

export default (props) => {
  const hueIndex = 4;

  const shades = Options.colors.find(colorList =>
    colorList.includes(props.color));
  const shadeIndex = shades.indexOf(props.color);

  const hues = Options.colors.map(colorList => colorList[hueIndex]);
  const selectedHue = shades[hueIndex];

  const selectRandomColor = () => {
    const shiftedShadeIndex = shadeIndex + _.sample(_.range(-2, 2));
    const newShadeIndex = _.clamp(shiftedShadeIndex, 0, shades.length);
    const newColor = _.sample(Options.colors)[newShadeIndex];
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
                  'color-picker__button--dark-text':
                    Options.lightColorLookup.has(hue),
                  'color-picker__button--selected': hue === selectedHue,
                })
              }
              style={{background: hue}}
              onClick={() => props.onChange(hue)}
            />
          ))}
        </div>

        <div className="color-picker__list color-picker__list--shades">
          {shades.map((shade, index) => (
            <button
              key={`shade-${index}`}
              className={
                classNames('color-picker__button color-picker__button--shade', {
                  'color-picker__button--dark-text':
                    Options.lightColorLookup.has(shade),
                  'color-picker__button--selected': shade === props.color,
                })
              }
              style={{background: shade}}
              onClick={() => props.onChange(shade)}
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
  )
};