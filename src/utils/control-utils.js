import {vec2, mat2} from 'gl-matrix';
import _ from 'lodash';
import queryString from 'query-string';

import Games from '../constants/games';
import {
  COLORING_MODES,
  CONTROL_TYPES,
  CONTROLS,
  SERIALIZATIONS_TO_CONTROL_TYPES,
} from '../constants/controls';

export function createPolygon(n, clockwise=true) {
  if (n === 4){
    const offset = 0.146446609;
    return [
      vec2.fromValues(offset, offset),
      vec2.fromValues(1 - offset, offset),
      vec2.fromValues(1 - offset, 1 - offset),
      vec2.fromValues(offset, 1 - offset),
    ];
  }

  const lerp = 2 * Math.PI / n;
  return _.times(n, index => {
    const angle = lerp * (index);
    const vector = vec2.fromValues(0, -0.5);
    const rotationMatrix = mat2.fromRotation(mat2.create(), angle);

    return vec2.transformMat2(vec2.create(), vector, rotationMatrix);
  }).map(point => vec2.add(vec2.create(), point, vec2.fromValues(0.5, 0.5)));
}

export function getControlValues(previousValues = {}) {
  const maybeUseDefault = (controlType, getDefault) => {
    const previousValue = previousValues[controlType];
    return previousValue !== null && previousValue !== undefined ?
      previousValue : CONTROLS[controlType].defaultValue();
  };

  const controls = [
    CONTROL_TYPES.EXCLUSIONS,
    CONTROL_TYPES.GAME,
    CONTROL_TYPES.NUM_TARGETS,
    CONTROL_TYPES.QUALITY,
    CONTROL_TYPES.SPEED,
  ].reduce((acc, controlType) => ({
    ...acc,
    [controlType]: maybeUseDefault(controlType),
  }), {});

  const numPoints = CONTROLS[CONTROL_TYPES.NUM_TARGETS].extractValueFrom(controls);

  const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(controls)];
  game.additionalControls.forEach((controlType) => {
    controls[controlType] = maybeUseDefault(controlType);
  });

  if (game.numTransforms) {
    const numTransforms = game.numTransforms(controls);
    controls[CONTROL_TYPES.TRANSFORMS] =
      (previousValues[CONTROL_TYPES.TRANSFORMS] || []).slice(0, numTransforms);
    while (controls[CONTROL_TYPES.TRANSFORMS].length < numTransforms) {
      controls[CONTROL_TYPES.TRANSFORMS].push(CONTROLS[CONTROL_TYPES.TRANSFORMS].createTransform());
    }
  } else {
    controls[CONTROL_TYPES.TRANSFORMS] = previousValues[CONTROL_TYPES.TRANSFORMS] ||
      CONTROLS[CONTROL_TYPES.TRANSFORMS].defaultValue();
  }

  const numColors = !controls[CONTROL_TYPES.COLORING_MODE] ||
    controls[CONTROL_TYPES.COLORING_MODE] === COLORING_MODES.BY_TRANSFORM ?
    controls[CONTROL_TYPES.TRANSFORMS].length : numPoints;

  // Set up the color controls based on the previously set color options.
  controls[CONTROL_TYPES.COLORS] = CONTROLS[CONTROL_TYPES.COLORS]
    .defaultValue(previousValues[CONTROL_TYPES.COLORS], numColors);

  return controls;
}

export function saveControlValues(controls) {
  const serializedParams = Object.keys(controls).reduce((params, controlType) => {
    const serializeFn = CONTROLS[controlType] && CONTROLS[controlType].serialize;
    return serializeFn ? {
      ...params,
      ...serializeFn(controls[controlType]),
    } : params;
  }, {});

  const paramsString = queryString.stringify(serializedParams);
  window.history.replaceState({}, document.title, `?${paramsString}`);
}

export function readSavedControlValues() {
  const parsedParams = queryString.parse(window.location.search);

  const controls = Object.keys(parsedParams).reduce((result, serializedControlType) => {
    const controlType = SERIALIZATIONS_TO_CONTROL_TYPES[serializedControlType];
    return CONTROLS[controlType] && CONTROLS[controlType].deserialize ? {
      ...result,
      ...CONTROLS[controlType].deserialize(parsedParams[serializedControlType]),
    } : {};
  }, {});

  return controls;
}
