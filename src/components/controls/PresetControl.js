import classNames from 'classnames';
import React from 'react';

import { CONTROL_TYPES, CONTROLS } from '../../constants/controls';

import './preset-control.css';

export default ({ selectedValue, onChange }) => {
  return (
    <div
      className={classNames('preset-control', {
        'preset-control--active': selectedValue,
      })}
    >
      <select
        className="preset-control__select"
        onChange={({target}) => onChange(parseInt(target.value, 10))}
        value={selectedValue}
      >
        {!selectedValue && (<option key={0} value={0}>custom</option>)}
        {CONTROLS[CONTROL_TYPES.PRESET].options.slice(1).map(({ value, name }, index) => (
          <option key={value} value={index + 1}>{name}</option>
        ))}
      </select>
      <div className="preset-control__arrow" />
    </div>
  );
};
