import _ from 'lodash';
import classNames from 'classnames';
import ordinal from 'ordinal-number-suffix';
import React from 'react';

import './controls.css';

/**
 * How many dots should be added every frame.
 *
 * @type {Array}
 */
const SPEEDS = [
  10,
  100,
  500,
  1000,
];

const MAX_HISTORY_SIZE = 3;

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

const Controls = props => {
  const shapes = [
    ['Triangle', 3],
    ['Square', 4],
    ['Pentagon', 5],
    ['Hexagon', 6],
    ['Heptagon', 7],
    ['Octagon', 8],
    ['Nonagon', 9],
    ['Decagon', 10],
  ].map(([name, numPoints]) =>
      [name, props, numPoints === props.numPoints,
          () => props.onNumPointsChange(numPoints)]);

  const exclusions = _.times(props.numPoints, index => {
    let name;
    if (index === 0){
      name = 'Self';
    } else if (index === 1){
      name = 'Neighbor';
    } else {
      name = `${ordinal(index)} Neighbor`;
    }

    return [name, props.exclusions.has(index), () => {
      const updatedExclusions = new Set(props.exclusions);

      if (updatedExclusions.has(index)){
        updatedExclusions.delete(index);
      } else {
        updatedExclusions.add(index);
      }

      props.onExclusionsChange(updatedExclusions);
    }];
  });

  const historySizes = _.times(MAX_HISTORY_SIZE + 1, historySize => {
    return [historySize, historySize === props.historySize, () => {
      props.onHistorySizeChange(historySize);
    }];
  });

  const speeds = SPEEDS.map(speed => [speed * 60, speed === props.speed,
    () => props.onSpeedChange(speed)]);

  return (
    <div className="controls">
      <div className="controls__set">
        {shapes.map(args => renderShapeControl(...args))}
      </div>

      <div className="controls__set">
        {exclusions.map(args => renderExclusionControl(...args))}
      </div>

      <div className="controls__set">
        {historySizes.map(args => renderHistorySizeControl(...args))}
      </div>

      <div className="controls__set">
        {speeds.map(args => renderSpeedControl(...args))}
      </div>

      <div className="controls__set">
        <button onClick={props.onToggleIsRunning}>
          {props.isRunning ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
};

export default Controls;

export const CONTROL_DEFAULTS = {
  EXCLUSIONS: new Set(),
  HISTORY_SIZE: 1,
  IS_RUNNING: true,
  NUM_POINTS: 3,
  SPEED: SPEEDS[1],
};
