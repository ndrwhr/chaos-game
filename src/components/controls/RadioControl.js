import React from 'react';

import Button from './Button';

import './radio-control.css';

const renderButtonStyle = props =>
  <div className="radio-control">
    {props.options.map(({ name, value }) =>
      <Button
        key={value}
        modifiers={{
          inline: true,
          selected: props.selectedValue === value,
        }}
        onPress={() => props.onChange(value)}
      >
        {name}
      </Button>,
    )}
  </div>;

const renderRadioStyle = props =>
  <ul className="radio-control radio-control--list">
    {props.options.map(({ name, value }) =>
      <li className="radio-control__item" key={value}>
        <Button
          baseClassName="radio-control__radio"
          modifiers={{
            selected: props.selectedValue === value,
          }}
          onPress={() => props.onChange(value)}
        >
          <div className="radio-control__radio-dot" />
          <div className="radio-control__radio-name">
            {name}
          </div>
        </Button>
      </li>,
    )}
  </ul>;

export default ({ buttonStyle, ...props }) =>
  buttonStyle ? renderButtonStyle(props) : renderRadioStyle(props);
