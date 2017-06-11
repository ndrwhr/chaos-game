import { vec2 } from 'gl-matrix';
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
          viewBox="0 0 1 1"
        >
          {points.map((point, index) => {
            const previousPoint = points[(index + points.length - 1) % points.length];
            const nextPoint = points[(index + 1) % points.length];
            const serializedPoints = [
              point,
              vec2.lerp(vec2.create(), point, nextPoint, 0.48),
              vec2.lerp(vec2.create(), point, [0.5, 0.5], 0.96),
              vec2.lerp(vec2.create(), point, previousPoint, 0.48),
            ].map(([x, y]) => `${x},${y}`).join(' ');

            return (
              <polygon
                key={point}
                fill={this.props.colors[index]}
                points={serializedPoints}
                onClick={() => this.setState({selectedIndex: index})}
              />
            );
          })}
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
          DEFAULT_CONTROLS.colors.defaultValue([], colors.length, true))}
      >
        randomize colors
      </button>
    </div>
  );
};