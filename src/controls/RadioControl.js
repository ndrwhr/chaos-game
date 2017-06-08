import classNames from 'classnames';
import React from 'react';

import './radio-control.css';

const renderButtonStyle = (props) => (
  <div className="radio-control">
    {props.options.map(({name, value}) => (
      <button
        key={value}
        className={
          classNames('btn btn--inline', {
            'btn--active': props.selectedValue === value,
          })
        }
        onClick={() => props.onChange(value)}
      >
        {name}
      </button>
    ))}
  </div>
);

const renderRadioStyle = (props) => (
  <ul className="radio-control radio-control--list">
    {props.options.map(({name, value}) => (
      <li className="radio-control-item" key={value}>
        <label className="radio-control__item-label">
          <input
            className="radio-control__radio-input"
            type="radio"
            checked={props.selectedValue === value}
            onChange={() => props.onChange(value)}
          />
          <div className="radio-control__fake-radio"/>
          <span className="radio-control__item-name">{name}</span>
        </label>
      </li>
    ))}
  </ul>
);

export default ({buttonStyle, ...props}) => (
  buttonStyle ? renderButtonStyle(props) : renderRadioStyle(props)
);