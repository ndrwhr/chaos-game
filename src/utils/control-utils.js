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

function toQueryString(controls) {
  const serializedParams = Object.keys(controls).reduce((params, controlType) => {
    const serializeFn = CONTROLS[controlType] && CONTROLS[controlType].serialize;
    return serializeFn ? {
      ...params,
      ...serializeFn(controls[controlType]),
    } : params;
  }, {});

  const paramsString = queryString.stringify(serializedParams);
  return paramsString
}

function parseQueryString(string) {
  const parsedParams = queryString.parse(string);

  const controls = Object.keys(parsedParams).reduce((result, serializedControlType) => {
    const controlType = SERIALIZATIONS_TO_CONTROL_TYPES[serializedControlType];
    return CONTROLS[controlType] && CONTROLS[controlType].deserialize ? {
      ...result,
      ...CONTROLS[controlType].deserialize(parsedParams[serializedControlType]),
    } : {};
  }, {});

  return controls;
}

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
  const maybeUseDefault = (controlType) => {
    const previousValue = previousValues[controlType];
    return previousValue !== null && previousValue !== undefined ?
      previousValue : CONTROLS[controlType].defaultValue();
  };

  let controls = {
    [CONTROL_TYPES.PRESET]: maybeUseDefault(CONTROL_TYPES.PRESET),
  };

  if (controls.preset) {
    Object.assign(previousValues, {
      ...parseQueryString(CONTROLS[CONTROL_TYPES.PRESET].extractValueFrom(controls)),
    });
  }

  controls = [
    CONTROL_TYPES.BACKGROUND,
    CONTROL_TYPES.COLORING_MODE,
    CONTROL_TYPES.EXCLUSIONS,
    CONTROL_TYPES.GAME,
    CONTROL_TYPES.NUM_TARGETS,
    CONTROL_TYPES.QUALITY,
  ].reduce((acc, controlType) => ({
    ...acc,
    [controlType]: maybeUseDefault(controlType),
  }), controls);

  const numTargets = CONTROLS[CONTROL_TYPES.NUM_TARGETS].extractValueFrom(controls);

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

  if (game.disableTargetColoringMode &&
      controls[CONTROL_TYPES.COLORING_MODE] === COLORING_MODES.BY_TARGET) {
    controls[CONTROL_TYPES.COLORING_MODE] = COLORING_MODES.BY_TRANSFORM;
  }

  let numColors;
  if (controls[CONTROL_TYPES.COLORING_MODE] === COLORING_MODES.BY_TRANSFORM) {
    numColors = controls[CONTROL_TYPES.TRANSFORMS].length;
  } else if (controls[CONTROL_TYPES.COLORING_MODE] === COLORING_MODES.BY_TARGET) {
    numColors = numTargets;
  } else {
    numColors = CONTROLS[CONTROL_TYPES.COLORING_MODE].gradientOptions.numColors;
  }

  // Set up the color controls based on the previously set color options.
  controls[CONTROL_TYPES.COLORS] = CONTROLS[CONTROL_TYPES.COLORS]
    .defaultValue(previousValues[CONTROL_TYPES.COLORS], numColors);

  return controls;
}

export function saveControlValues(controls) {
  const paramsString = toQueryString(controls);
  window.history.replaceState({}, document.title, `?${paramsString}`);
}

export function readSavedControlValues() {
  const searchString = window.location.search.replace('?', '');
  const controls = parseQueryString(searchString);

  // Check if the parsed controls matches one of the preset.
  const presetIndex = CONTROLS[CONTROL_TYPES.PRESET].options.findIndex(({ value }) => {
    if (!value) return false;
    const presetValues = parseQueryString(value);
    return Object.keys(presetValues).every(controlType => (
      _.isEqual(controls[controlType], presetValues[controlType])
    ));
  });

  // If so then set the preset control.
  if (presetIndex > 0) {
    controls[CONTROL_TYPES.PRESET] = presetIndex;
  }

  return controls;
}
