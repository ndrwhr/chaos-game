import React from 'react';

import { DEFAULT_CONTROLS } from '../Options';
import RadioControl from './RadioControl';

export default ({colorModeIndex, colors, game, onChange}) => {
  let colorModeControls;
  if (game.controls.colorModeIndex){
    colorModeControls = (
      <RadioControl
        selectedValue={colorModeIndex}
        options={game.controls.colorModeIndex.options}
        onChange={index => onChange('colorModeIndex', index)}
      />
    );
  }

  return (
    <div className="color-mode">
      {colorModeControls}
      <button
        className="btn btn--block-center"
        onClick={() => onChange('colors',
          DEFAULT_CONTROLS.colors.defaultValue([], colors.length))}
      >
        randomize colors
      </button>
    </div>
  );
};