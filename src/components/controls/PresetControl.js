import classNames from 'classnames';
import React from 'react';

import { CONTROL_TYPES, CONTROLS } from '../../constants/controls';
import Button from './Button';

import './preset-control.css';

export default ({ selectedValue, onChange }) => {
  const selectableOptions = CONTROLS[CONTROL_TYPES.PRESET].options.slice(1);

  const getPreviousSelectedValue = () => {
    const nextValue =
      selectedValue === 0 || selectedValue === 1
        ? selectableOptions.length
        : selectedValue - 1;
    onChange(nextValue);
  };
  const getNextSelectedValue = () => {
    const nextValue =
      selectedValue < selectableOptions.length ? selectedValue + 1 : 1;
    onChange(nextValue);
  };

  return (
    <div
      className={classNames('preset-control', {
        'preset-control--active': selectedValue,
      })}
    >
      <Button
        modifiers={{ arrowLeft: true }}
        onPress={getPreviousSelectedValue}
      />

      <div className="preset-control__select-wrapper">
        <select
          className="preset-control__select"
          onChange={({ target }) => onChange(parseInt(target.value, 10))}
          value={selectedValue}
        >
          {!selectedValue &&
            <option key={0} value={0}>
              Custom
            </option>}
          {selectableOptions.map(({ value, name }, index) =>
            <option key={value} value={index + 1}>
              {name}
            </option>,
          )}
        </select>
        <div className="preset-control__select-arrow" />
      </div>

      <Button modifiers={{ arrowRight: true }} onPress={getNextSelectedValue} />
    </div>
  );
};
