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

const renderOffsetControl = (value, isSelected, onChange) => {
  const classes = classNames('controls__offset', {
    'controls__offset--selected': isSelected,
  });

  return (
    <label key={value} className={classes}>
      <input type="checkbox"
          onChange={onChange}
          checked={isSelected} />
      {value}
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
      .map(([numPoints, name], index) => ({
        name,
        value: index,
      }));

  const numPoints =
    Options.defaultControls.shapeIndex.options[props.shapeIndex][0];

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

  const offsetControls = Options.defaultControls.offsetIndexes.values
    .map((offset, index) => [
      offset,
      props.offsetIndexes.has(index),
      () => {
        const updatedOffests = new Set(props.offsetIndexes);

        if (updatedOffests.has(index)){
          updatedOffests.delete(index);
        } else {
          updatedOffests.add(index);
        }

        if (updatedOffests.size === 0){
          [...Options.defaultControls.offsetIndexes.defaultValue].forEach(
              index => updatedOffests.add(index));
        }

        props.onChange('offsetIndexes', updatedOffests);
      }
    ])
    .map(args => renderOffsetControl(...args));

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
        name: `${value * 60} dps`,
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
      <div className="controls__set">
        {offsetControls}
      </div>
      {historyControls}
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
