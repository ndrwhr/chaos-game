import { vec2 } from 'gl-matrix';
import React, {Component} from 'react';

import { getActualColor } from '../../utils/color-utils';
import { createPolygon }  from '../../utils/control-utils';
import { COLORING_MODES, CONTROL_TYPES, CONTROLS } from '../../constants/controls';
import Games from '../../constants/games';
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
    const points = createPolygon(this.props.colors.length);

    return (
      <div className="color-controls__target-control">
        <svg
          viewBox="0 0 1 1"
        >
          {points.map((point, index) => {
            const nextPoint = vec2.lerp(
              vec2.create(),
              point,
              points[(index + 1) % points.length],
              0.48
            );
            const previousPoint = vec2.lerp(
              vec2.create(),
              point,
              points[(index + points.length - 1) % points.length],
              0.48
            );
            const centerPoint = vec2.lerp(vec2.create(), point, [0.5, 0.5], 0.96);

            const serializedPoints = [
              point,
              nextPoint,
              vec2.lerp(vec2.create(), nextPoint, centerPoint, 0.6),
              vec2.lerp(vec2.create(), previousPoint, centerPoint, 0.6),
              previousPoint,
            ].map(([x, y]) => `${x},${y}`).join(' ');

            return (
              <polygon
                key={point}
                fill={getActualColor(this.props.colors[index])}
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

export default ({ controls, onChange }) => {
  const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(controls)];
  const coloringMode = controls[CONTROL_TYPES.COLORING_MODE];
  const colors = controls[CONTROL_TYPES.COLORS]

  const hasColoringModeControls = game.additionalControls.includes(CONTROL_TYPES.COLORING_MODE);
  const colorModeControls = hasColoringModeControls && (
    <RadioControl
      selectedValue={coloringMode}
      options={CONTROLS[CONTROL_TYPES.COLORING_MODE].options}
      onChange={index => onChange(CONTROL_TYPES.COLORING_MODE, index)}
    />
  );

  let colorControls;
  if (!hasColoringModeControls || coloringMode === COLORING_MODES.BY_TRANSFORM) {
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
          CONTROLS[CONTROL_TYPES.COLORS].defaultValue([], colors.length, true))}
      >
        randomize colors
      </button>
    </div>
  );
};