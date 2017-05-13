import _ from 'lodash';
import classNames from 'classnames';
import ordinal from 'ordinal-number-suffix';
import React from 'react';

import Options from './Options';

import './controls.css';

const renderGameControl = (name, isSelected, onChange) => {
  const classes = classNames('controls__name', {
    'controls__name--selected': isSelected,
  });

  return (
    <label key={name} title={name} className={classes}>
      <input type="radio"
          name="game"
          onChange={onChange}
          checked={isSelected} />
      {name}
    </label>
  );
};


const renderShapeControl = (name, numPoints, isSelected, onChange) => {
  const classes = classNames('controls__shape', `controls__shape--${name}`, {
    'controls__shape--selected': isSelected,
  });

  return (
    <label key={name} title={name} className={classes}>
      <input type="radio"
          name="shape"
          onChange={onChange}
          checked={isSelected} />
      {name}
    </label>
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

const renderHistorySizeControl = (name, isSelected, onChange) => {
  const classes = classNames('controls__history', {
    'controls__history--selected': isSelected,
  });

  return (
    <label key={name} className={classes}>
      <input type="radio"
          name="history"
          onChange={onChange}
          checked={isSelected} />
      {name}
    </label>
  );
};

const renderSpeedControl = (value, isSelected, onChange) => {
  const classes = classNames('controls__speed', {
    'controls__speed--selected': isSelected,
  });

  return (
    <label key={value} className={classes}>
      <input type="radio"
          name="speed"
          onChange={onChange}
          checked={isSelected} />
      {value}
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
  const gameControls = Options.defaultControls.gameIndex.values
      .map(({name}, index) => [
        name,
        index === props.gameIndex,
        () => props.onChange('gameIndex', index),
      ])
      .map(args => renderGameControl(...args));

  const shapeIndexControls = Options.defaultControls.shapeIndex.values
      .map(([numPoints, name], index) => [
        name,
        numPoints,
        index === props.shapeIndex,
        () => props.onChange('shapeIndex', index),
      ])
      .map(args => renderShapeControl(...args));

  const numPoints =
    Options.defaultControls.shapeIndex.values[props.shapeIndex][0];

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

  const game = Options.defaultControls.gameIndex.values[props.gameIndex];
  let historyControls = null;
  if (game.controls && game.controls.historyIndex &&
      game.controls.historyIndex.values.length > 1){

    historyControls = (
      <div className="controls__set">
        {
          game.controls.historyIndex.values
              .map((value, index) => [
                value,
                index === props.historyIndex,
                () => props.onChange('historyIndex', index),
              ])
              .map(args => renderHistorySizeControl(...args))
        }
      </div>
    );
  }

  const speedControls = Options.defaultControls.speedIndex.values
      .map((value, index) => [
        value * 60,
        index === props.speedIndex,
        () => props.onChange('speedIndex', index),
      ])
      .map(args => renderSpeedControl(...args));

  return (
    <div className="controls">
      <div className="controls__set">
        {gameControls}
      </div>
      <div className="controls__set">
        {shapeIndexControls}
      </div>
      <div className="controls__set">
        {exclusionControls}
      </div>
      <div className="controls__set">
        {offsetControls}
      </div>
      {historyControls}
      <div className="controls__set">
        {speedControls}
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
