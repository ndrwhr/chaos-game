import { vec2 } from 'gl-matrix';
import _ from 'lodash';
import React, { Component } from 'react';

import { getActualColor } from '../../utils/color-utils';
import {
  CONTROL_TYPES,
  CONTROLS,
  createTransform,
  TRANSFORM_PARAMS,
} from '../../constants/controls';
import Button from './Button';
import ColorPicker from './ColorPicker';
import Range from './Range';

import './transform-controls.css';

const PARAM_VALUES = CONTROLS[CONTROL_TYPES.TRANSFORMS].paramsValues;

const ICONS = {
  [TRANSFORM_PARAMS.SCALE]: percent => {
    const minPercent = 0.1;
    const dotRadius = 8;
    const lineSpace = dotRadius + 3;

    const lowerDot = vec2.fromValues(dotRadius, 100 - dotRadius * 2);
    const upperDot = vec2.fromValues(100 - dotRadius * 2, dotRadius);

    const lineStart = vec2.add(
      vec2.create(),
      lowerDot,
      vec2.fromValues(lineSpace, -lineSpace),
    );
    const lineEnd = vec2.add(
      vec2.create(),
      upperDot,
      vec2.fromValues(-lineSpace, lineSpace),
    );

    const realLineEnd = vec2.lerp(
      vec2.create(),
      lineStart,
      lineEnd,
      Math.max(percent, minPercent),
    );

    const polygonPoints = [[-16, 0], [3, -3], [0, 16]]
      .map(([x, y]) => `${x + realLineEnd[0]},${y + realLineEnd[1]}`)
      .join(' ');

    return (
      <svg viewBox="0 0 100 100" className="transform-controls__icon">
        <circle cx={lowerDot[0]} cy={lowerDot[1]} r={dotRadius} />

        <line
          className="transform-controls__icon-line transform-controls__icon-line--light"
          x1={lineStart[0]}
          y1={lineStart[1]}
          x2={lineEnd[0]}
          y2={lineEnd[1]}
          strokeWidth="5"
        />

        <line
          className="transform-controls__icon-line"
          x1={lineStart[0]}
          y1={lineStart[1]}
          x2={realLineEnd[0]}
          y2={realLineEnd[1]}
          strokeWidth="5"
        />
        <polygon points={polygonPoints} />

        <circle cx={upperDot[0]} cy={upperDot[1]} r={dotRadius} />
      </svg>
    );
  },

  [TRANSFORM_PARAMS.ROTATION]: percent => {
    const angle = -65 * (0.5 - percent);

    const lineLength = 70;
    const offset = (100 - lineLength) / 2;

    return (
      <svg viewBox="0 0 100 100" className="transform-controls__icon">
        <line
          className="transform-controls__icon-line"
          x1={7}
          y1={100 - offset}
          x2={100 - 7}
          y2={100 - offset}
        />

        <line
          className="transform-controls__icon-line transform-controls__icon-line--light"
          x1={50}
          y1={offset}
          x2={50}
          y2={100 - offset}
        />

        <g transform={`rotate(${angle}, 50, ${100 - offset})`}>
          <line
            className="transform-controls__icon-line"
            x1={50}
            y1={offset}
            x2={50}
            y2={100 - offset}
            strokeLinecap="butt"
          />
          <polygon
            points={`50,${offset - 5} 62,${offset + 13 - 5} 37,${offset +
              13 -
              5}`}
          />
        </g>
      </svg>
    );
  },

  [TRANSFORM_PARAMS.PROBABILITY]: percent => {
    const dots = [
      [20.1525, 26.4814],
      [45.7556, 86.7558],
      [65.6184, 62.4926],
      [14.1637, 34.6129],
      [33.3041, 11.4611],
      [47.2978, 67.796],
      [88.9868, 34.3786],
      [57.6612, 43.5731],
      [72.8979, 69.3827],
      [10.0829, 47.3946],
      [85.9362, 52.1418],
      [56.8483, 78.1798],
      [79.1065, 57.2672],
      [60.5099, 36.638],
      [18.7678, 69.8381],
      [35.0694, 23.9793],
      [76.3759, 40.6025],
      [80.2001, 71.3765],
      [48.2663, 78.9481],
      [44.9797, 13.3422],
      [26.7543, 59.1998],
      [62.4722, 72.8132],
      [40.1044, 48.5588],
      [33.0055, 39.4554],
      [45.3946, 23.3957],
      [49.2679, 48.1388],
      [31.6338, 66.9612],
      [47.502, 35.2095],
      [60.7389, 10.4314],
      [69.0, 26.7836],
      [66.8664, 52.127],
      [83.1163, 25.8275],
      [23.92, 39.81],
      [70.8222, 18.2126],
      [37.9984, 82.878],
      [67.1557, 88.3364],
      [13.8373, 57.8267],
      [46.9526, 60.5694],
      [87.0496, 41.5546],
      [70.015, 43.6439],
      [25.2557, 82.6913],
    ]
      .filter((coords, index, allCoords) => index < percent * allCoords.length)
      .map(([cx, cy], index, allCoords) => ({
        key: index,
        cx,
        cy,
      }))
      .map(attrs => <circle r="8" {...attrs} />);

    return (
      <svg viewBox="0 0 100 100" className="transform-controls__icon">
        {dots}
      </svg>
    );
  },
};

const createRandomTransform = () =>
  PARAM_VALUES.reduce((update, option) => {
    update[option.key] = _.random(option.minValue, option.maxValue);
    return update;
  }, {});

class TransformControl extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isColorPickerOpen: false,
    };
  }

  render() {
    const {
      actualProbability,
      color,
      colors,
      hideProbability,
      onChange,
      onRemove,
      transform,
      transformIndex,
    } = this.props;

    const probability = Math.floor(actualProbability * 10000) / 100;

    const colorEl =
      color !== null &&
      color !== undefined &&
      <Button
        baseClassName="transform-controls__transform-color"
        style={{ backgroundColor: getActualColor(color) }}
        onPress={() => this.setState({ isColorPickerOpen: true })}
      />;

    return (
      <div className="transform-controls__transform">
        <h4 className="transform-controls__transform-header">
          Transform {transformIndex + 1}
          <span
            className="transform-controls__transform-probability"
            title={`There is (approximately) a ${probability}% chance of this transform being selected`}
          >
            ~{probability}%
          </span>
          <div className="transform-controls__transform-buttons">
            {colorEl}
            <Button
              baseClassName="transform-controls__transform-button"
              modifiers={{ reset: true }}
              onPress={() => onChange(createTransform())}
            />
            <Button
              baseClassName="transform-controls__transform-button"
              modifiers={{ shuffle: true }}
              onPress={() => onChange(createRandomTransform())}
            />
            {onRemove &&
              <Button
                baseClassName="transform-controls__transform-button"
                modifiers={{ trash: true }}
                onPress={onRemove}
              />}
          </div>
        </h4>

        {PARAM_VALUES.filter(
          ({ key }) =>
            !(hideProbability && key === TRANSFORM_PARAMS.PROBABILITY),
        ).map(option =>
          <div
            key={option.key}
            className="transform-controls__transform-range"
            title={option.formatValue(transform[option.key])}
          >
            <Range
              icon={ICONS[option.key](
                (transform[option.key] - option.minValue) /
                  (option.maxValue - option.minValue),
              )}
              value={transform[option.key]}
              minValue={option.minValue}
              maxValue={option.maxValue}
              onChange={value =>
                onChange(
                  Object.assign({}, transform, {
                    [option.key]: value,
                  }),
                )}
            />
          </div>,
        )}

        {color &&
          <ColorPicker
            colors={colors}
            color={color}
            open={this.state.isColorPickerOpen}
            onChange={this.props.onColorChange}
            onClose={() => this.setState({ isColorPickerOpen: false })}
          />}
      </div>
    );
  }
}

export default ({ controls, fixedNumTransforms, onChange }) => {
  const colors = controls[CONTROL_TYPES.COLORING_MODE]
    ? null
    : controls[CONTROL_TYPES.COLORS];
  const transforms = controls[CONTROL_TYPES.TRANSFORMS];

  const updateTransform = (index, updatedTransform) => {
    const updatedTransforms = transforms.slice();
    updatedTransforms[index] = updatedTransform;
    onChange(CONTROL_TYPES.TRANSFORMS, updatedTransforms);
  };

  const updateColors = (index, newColor) => {
    const newColors = colors.slice();
    newColors[index] = newColor;
    onChange(CONTROL_TYPES.COLORS, newColors);
  };

  const totalProbability = transforms.reduce(
    (acc, transform) => acc + transform[TRANSFORM_PARAMS.PROBABILITY],
    0,
  );

  return (
    <div className="transform-controls">
      {transforms.map((transform, index) =>
        <TransformControl
          key={`transform-${index}`}
          colors={colors}
          color={colors && colors[index]}
          onColorChange={newColor => updateColors(index, newColor)}
          actualProbability={
            transform[TRANSFORM_PARAMS.PROBABILITY] / totalProbability
          }
          transform={transform}
          transformIndex={index}
          hideProbability={transforms.length === 1}
          onChange={updatedTransform =>
            updateTransform(index, updatedTransform)}
          onRemove={
            transforms.length > 1 &&
            !fixedNumTransforms &&
            (() =>
              onChange(CONTROL_TYPES.TRANSFORMS, [
                ...transforms.slice(0, index),
                ...transforms.slice(index + 1),
              ]))
          }
        />,
      )}

      <div className="transform-controls__buttons">
        <Button
          modifiers={{
            inline: true,
            reset: true,
          }}
          onPress={() =>
            onChange(
              CONTROL_TYPES.TRANSFORMS,
              transforms.map(() =>
                CONTROLS[CONTROL_TYPES.TRANSFORMS].createTransform(),
              ),
            )}
        >
          all
        </Button>

        <Button
          modifiers={{
            inline: true,
            shuffle: true,
          }}
          onPress={() =>
            onChange(
              CONTROL_TYPES.TRANSFORMS,
              transforms.map(() => createRandomTransform()),
            )}
        >
          all
        </Button>

        {!fixedNumTransforms &&
          <Button
            modifiers={{
              inline: true,
              add: true,
            }}
            onPress={() =>
              onChange(CONTROL_TYPES.TRANSFORMS, [
                ...transforms,
                CONTROLS[CONTROL_TYPES.TRANSFORMS].createTransform(),
              ])}
          >
            transform
          </Button>}
      </div>
    </div>
  );
};
