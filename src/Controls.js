import _ from 'lodash';
import classNames from 'classnames';
import ordinal from 'ordinal-number-suffix';
import React from 'react';

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
      <div className="controls__set">
        {renderSelectBox(props.speedIndex, speedOptions, index =>
            props.onChange('speedIndex', index))}
      </div>
      <div className="controls__set">
        {renderSelectBox(props.qualityIndex, qualityOptions, index =>
            props.onChange('qualityIndex', index))}
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
