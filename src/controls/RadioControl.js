import classNames from 'classnames';
import React from 'react';

import './radio-control.css';

export default (props) => (
  <div className="radio-control">
    {props.options.map(({name, value}) => (
      <button
        key={value}
        className={
          classNames('btn', {
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