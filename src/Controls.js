import _ from 'lodash';
import classNames from 'classnames';
import ordinal from 'ordinal-number-suffix';
import React from 'react';
import rgbHex from 'rgb-hex';

import Options from './Options';

import './controls.css';

const renderSelectBox = (selectedValue, options, onChange) => {
  return (
    <select value={selectedValue} onChange={evt => onChange(evt.target.value)}>
      {options.map(({name, value}) =>
          <option key={value} value={value}>{name}</option>)}
    </select>
  );
};

const renderExclusionControl = (name, isSelected, onChange) => {
  const classes = classNames('controls__exclusion', {
    'controls__exclusion--selected': isSelected,
  });

  return (
    <label key={name} className={classes}>
      <input type="checkbox"
          onChange={onChange}
          checked={isSelected} />
      {name}
    </label>
  );
};

class ColorPicker extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  rgbaToHex(rgba){
    return '#' + rgbHex(rgba).slice(0, -2);
  }

  renderColor(rgba){
    return (
      <button
          key={rgba}
          className={classNames('color-picker__color', {
            'color-picker__color--selected': rgba === this.props.color,
          })}
          style={{background: this.rgbaToHex(rgba)}}
          onClick={() => {
            this.props.onSelect(rgba);
          }}
      />
    );
  }

  render(){
    const props = this.props;

    return (
      <div
          className={classNames('color-picker', {
            'color-picker--open': this.state.isOpen,
          })}>
        <button
            className="color-picker__selected-color"
            style={{background: this.rgbaToHex(props.color)}}
            onClick={() => {
              this.setState({
                isOpen: !this.state.isOpen,
              });
            }}
        />
        <div className="color-picker__color-list">
          {Options.colors.map(colorGroup => (
            <div key={colorGroup} className="color-picker__color-row">
              {colorGroup.map(color => this.renderColor(color))}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

const Controls = props => {
  const gameOptions = Options.defaultControls.gameIndex.options
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  const shapeOptions = Options.defaultControls.shapeIndex.options
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  const numPoints =
    Options.defaultControls.shapeIndex.options[props.shapeIndex].value;

  const exclusionControls = _.times(numPoints, index => {
    let name;
    if (index === 0){
      name = 'Self';
    } else if (index === 1){
      name = 'Neighbor';
    } else {
      name = `${ordinal(index)} Neighbor`;
    }

    return [
      name,
      props.exclusions.has(index),
      () => {
        const updatedExclusions = new Set(props.exclusions);

        if (updatedExclusions.has(index)){
          updatedExclusions.delete(index);
        } else {
          updatedExclusions.add(index);
        }

        props.onChange('exclusions', updatedExclusions);
      },
    ];
  }).map(args => renderExclusionControl(...args));

  const game = Options.defaultControls.gameIndex.options[props.gameIndex];
  let historyControls = null;
  if (game.controls.historyIndex){
    const historyOptions = game.controls.historyIndex.values
        .map((value, index) => ({
          name: `${value} Point${value !== 1 ? 's' : ''}`,
          value: index,
        }));

    historyControls = (
      <div className="controls__set">
        {renderSelectBox(props.historyIndex, historyOptions, index =>
            props.onChange('historyIndex', index))}
      </div>
    );
  }

  const SCALE = 1000;

  const onTransformUpdate = (index, type, newValue) => {
    const updatedTransforms = props.transforms.slice();
    updatedTransforms[index] = Object.assign({}, updatedTransforms[index], {
      [type]: newValue,
    });

    props.onChange('transforms', updatedTransforms);
  };

  const onAddTransform = () => {
    props.onChange('transforms', [
      ...props.transforms,
      Options.defaultControls.transforms.createTransform(),
    ]);
  };

  const onRemoveTransform = (index) => {
    props.onChange('transforms', props.transforms.filter((_, transformIndex) =>
        transformIndex !== index));
  };

  const transformControls = props.transforms.map((transform, index) => {
    const options = Options.defaultControls.transforms.options.map(type => {
      if (type === 'color'){
        return (
          <ColorPicker
              key={type + index}
              color={transform[type]}
              onSelect={newValue => onTransformUpdate(index, type, newValue)}
          />
        );
      }

      const min = Options.defaultControls.transforms[type].minValue * SCALE;
      const max = Options.defaultControls.transforms[type].maxValue * SCALE;
      const value = transform[type] * SCALE;

      return (
        <input
            title={type}
            key={type + index}
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(evt) =>
                onTransformUpdate(index, type, evt.target.value / SCALE)}
        />
      );
    });

    const removeButton = props.transforms.length > 1 ? (
      <button onClick={() => onRemoveTransform(index)}>
        remove transform
      </button>
    ) : null;

    return (
      <div key={index}>
        {options}
        {removeButton}
      </div>
    )
  });

  const speedOptions = Options.defaultControls.speedIndex.options
      .map((value, index) => ({
        name: `~${value * 60} dps`,
        value: index,
      }));

  const qualityOptions = Options.defaultControls.qualityIndex.options
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  return (
    <div className="controls">
      <div className="controls__set">
        {renderSelectBox(props.gameIndex, gameOptions, index =>
            props.onChange('gameIndex', index))}
      </div>
      <div className="controls__set">
        {renderSelectBox(props.shapeIndex, shapeOptions, index =>
            props.onChange('shapeIndex', index))}
      </div>
      <div className="controls__set">
        {exclusionControls}
      </div>
      {historyControls}
      <div classname="controls__set">
        {transformControls}
        <button onClick={onAddTransform}>Add Transform</button>
      </div>
      <div className="controls__set">
        {renderSelectBox(props.qualityIndex, qualityOptions, index =>
            props.onChange('qualityIndex', index))}
      </div>
      <div className="controls__set">
        {renderSelectBox(props.speedIndex, speedOptions, index =>
            props.onChange('speedIndex', index))}
      </div>
      <div className="controls__set">
         <button onClick={() => props.onChange('isRunning', !props.isRunning)}>
           {props.isRunning ? 'Pause' : 'Play'}
         </button>
      </div>
    </div>
  );
};

export default Controls;
