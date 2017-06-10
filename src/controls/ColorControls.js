import React, {Component} from 'react';

import GameUtils  from '../game-utils';
import { COLOR_MODES, DEFAULT_CONTROLS } from '../Options';
import ColorPicker from './ColorPicker';
import RadioControl from './RadioControl';

import './color-controls.css';

class TargetColorControl extends Component {
  constructor(props){
    super(props);

    this.state = {
      selectedIndex: null,
    };
  }

  render(){
    const points = GameUtils.createPolygon(this.props.colors.length);

    return (
      <div className="color-controls__target-control">
        <svg
          viewBox="-0.15 -0.15 1.3 1.3"
        >
          {points.map((point, index) => (
            <g
              className="color-controls__target-control-point"
              key={point}
              transform={`translate(${point[0]}, ${point[1]})`}
              onClick={() => {
                this.setState({
                  selectedIndex: index,
                });
              }}
            >
              <circle
                cx="0"
                cy="0"
                r="0.12"
                fill={this.props.colors[index]}
              />
            </g>
          ))}
        </svg>
        <ColorPicker
          color={this.props.colors[this.state.selectedIndex]}
          open={this.state.selectedIndex !== null}
          onChange={newColor => this.props.onChange(this.state.selectedIndex, newColor)}
          onClose={() => this.setState({selectedIndex: null})}
        />
      </div>
    );
  }
}

export default ({colorModeIndex, colors, game, onChange}) => {
  let colorModeControls;
  if (game.controls.colorModeIndex) {
    colorModeControls = (
      <RadioControl
        selectedValue={colorModeIndex}
        options={game.controls.colorModeIndex.options}
        onChange={index => onChange('colorModeIndex', index)}
      />
    );
  }

  let colorControls;
  if (!game.controls.colorModeIndex || colorModeIndex === COLOR_MODES.BY_TRANSFORM) {
    colorControls = (
      <p className="color-controls__help">Adjust the color for each transform above.</p>
    );
  } else {
    colorControls = (
      <TargetColorControl
        colors={colors}
        onChange={(index, newColor) => {
          const updatedColors = [...colors];
          updatedColors[index] = newColor;
          onChange('colors', updatedColors);
        }}
      />
    );
  }

  return (
    <div className="color-controls">
      {colorModeControls}
      {colorControls}
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