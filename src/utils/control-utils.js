import { vec2, mat2 } from 'gl-matrix';
import _ from 'lodash';
import queryString from 'query-string';

import {
  COLORING_MODES,
  CONTROL_TYPES,
  CONTROLS,
  PRESETS,
  SERIALIZATIONS_TO_CONTROL_TYPES,
} from '../constants/controls';
import Games from '../constants/games';

function toQueryString(controls) {
  const serializedParams = Object.keys(
    controls,
  ).reduce((params, controlType) => {
    const serializeFn =
      CONTROLS[controlType] && CONTROLS[controlType].serialize;
    return serializeFn
      ? {
          ...params,
          ...serializeFn(controls[controlType]),
        }
      : params;
  }, {});

  const paramsString = queryString.stringify(serializedParams);
  return paramsString;
}

function parseQueryString(string) {
  const parsedParams = queryString.parse(string);

  const controls = Object.keys(
    parsedParams,
  ).reduce((result, serializedControlType) => {
    const controlType = SERIALIZATIONS_TO_CONTROL_TYPES[serializedControlType];
    return CONTROLS[controlType] && CONTROLS[controlType].deserialize
      ? {
          ...result,
          ...CONTROLS[controlType].deserialize(
            parsedParams[serializedControlType],
          ),
        }
      : {};
  }, {});

  return controls;
}

export function createPolygon(n, clockwise = true) {
  if (n === 4) {
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
    const angle = lerp * index;
    const vector = vec2.fromValues(0, -0.5);
    const rotationMatrix = mat2.fromRotation(mat2.create(), angle);

    return vec2.transformMat2(vec2.create(), vector, rotationMatrix);
  }).map(point => vec2.add(vec2.create(), point, vec2.fromValues(0.5, 0.5)));
}

const maybeUseDefaultValue = (previousValues, controlType) => {
  const previousValue = previousValues[controlType];
  return previousValue !== null && previousValue !== undefined
    ? previousValue
    : CONTROLS[controlType].defaultValue();
};

export function getControlValues(previousValues = {}) {
  let controls = {
    [CONTROL_TYPES.PRESET]: maybeUseDefaultValue(
      previousValues,
      CONTROL_TYPES.PRESET,
    ),
  };

  if (controls.preset) {
    Object.assign(previousValues, {
      ...parseQueryString(
        CONTROLS[CONTROL_TYPES.PRESET].extractValueFrom(controls),
      ),
    });
  }

  controls = [
    CONTROL_TYPES.BACKGROUND,
    CONTROL_TYPES.COLORING_MODE,
    CONTROL_TYPES.EXCLUSIONS,
    CONTROL_TYPES.GAME,
    CONTROL_TYPES.NUM_TARGETS,
    CONTROL_TYPES.QUALITY,
  ].reduce(
    (acc, controlType) => ({
      ...acc,
      [controlType]: maybeUseDefaultValue(previousValues, controlType),
    }),
    controls,
  );

  const numTargets = CONTROLS[CONTROL_TYPES.NUM_TARGETS].extractValueFrom(
    controls,
  );

  const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(controls)];
  game.additionalControls.forEach(controlType => {
    controls[controlType] = maybeUseDefaultValue(previousValues, controlType);
  });

  if (game.numTransforms) {
    const numTransforms = game.numTransforms(controls);
    controls[CONTROL_TYPES.TRANSFORMS] = (previousValues[
      CONTROL_TYPES.TRANSFORMS
    ] || [])
      .slice(0, numTransforms);
    while (controls[CONTROL_TYPES.TRANSFORMS].length < numTransforms) {
      controls[CONTROL_TYPES.TRANSFORMS].push(
        CONTROLS[CONTROL_TYPES.TRANSFORMS].createTransform(),
      );
    }
  } else {
    controls[CONTROL_TYPES.TRANSFORMS] =
      previousValues[CONTROL_TYPES.TRANSFORMS] ||
      CONTROLS[CONTROL_TYPES.TRANSFORMS].defaultValue();
  }

  if (
    game.disableTargetColoringMode &&
    controls[CONTROL_TYPES.COLORING_MODE] === COLORING_MODES.BY_TARGET
  ) {
    controls[CONTROL_TYPES.COLORING_MODE] = COLORING_MODES.BY_TRANSFORM;
  }

  let numColors;
  if (controls[CONTROL_TYPES.COLORING_MODE] === COLORING_MODES.BY_TRANSFORM) {
    numColors = controls[CONTROL_TYPES.TRANSFORMS].length;
  } else if (
    controls[CONTROL_TYPES.COLORING_MODE] === COLORING_MODES.BY_TARGET
  ) {
    numColors = numTargets;
  } else {
    numColors = CONTROLS[CONTROL_TYPES.COLORING_MODE].gradientOptions.numColors;
  }

  // Set up the color controls based on the previously set color options.
  controls[CONTROL_TYPES.COLORS] = CONTROLS[CONTROL_TYPES.COLORS].defaultValue(
    previousValues[CONTROL_TYPES.COLORS],
    numColors,
  );

  return controls;
}

export function getRandomControlValues(previousValues = {}) {
  const controls = {
    [CONTROL_TYPES.PRESET]: 0,
  };

  // Copy over non random values:
  [CONTROL_TYPES.BACKGROUND, CONTROL_TYPES.QUALITY].forEach(controlType =>
    Object.assign(controls, {
      [controlType]: maybeUseDefaultValue(previousValues, controlType),
    }),
  );

  // Choose some random values for the base controls. These values will be used to randomize
  // the remaining controls.
  [
    CONTROL_TYPES.COLORING_MODE,
    CONTROL_TYPES.NUM_TARGETS,
  ].forEach(controlType =>
    Object.assign(controls, {
      [controlType]: CONTROLS[controlType].random(),
    }),
  );

  // Variation selection should not be randomized.
  Object.assign(controls, {
    [CONTROL_TYPES.GAME]: maybeUseDefaultValue(
      previousValues,
      CONTROL_TYPES.GAME,
    ),
  });

  const numTargets = CONTROLS[CONTROL_TYPES.NUM_TARGETS].extractValueFrom(
    controls,
  );

  Object.assign(controls, {
    [CONTROL_TYPES.EXCLUSIONS]: CONTROLS[CONTROL_TYPES.EXCLUSIONS].random(
      numTargets,
    ),
  });

  const game = Games[CONTROLS[CONTROL_TYPES.GAME].extractValueFrom(controls)];
  game.additionalControls.forEach(controlType =>
    Object.assign(controls, {
      [controlType]: CONTROLS[controlType].random(),
    }),
  );

  const numTransforms = game.numTransforms
    ? game.numTransforms(controls)
    : _.sample([1, 1, 1, 1, 2, 2, 2, 3, 3, 4]);
  Object.assign(controls, {
    [CONTROL_TYPES.TRANSFORMS]: _.times(numTransforms, () =>
      CONTROLS[CONTROL_TYPES.TRANSFORMS].randomTransform(),
    ),
  });

  if (
    game.disableTargetColoringMode &&
    controls[CONTROL_TYPES.COLORING_MODE] === COLORING_MODES.BY_TARGET
  ) {
    Object.assign(controls, {
      [CONTROL_TYPES.COLORING_MODE]: COLORING_MODES.BY_TRANSFORM,
    });
  }

  let numColors;
  if (controls[CONTROL_TYPES.COLORING_MODE] === COLORING_MODES.BY_TRANSFORM) {
    numColors = controls[CONTROL_TYPES.TRANSFORMS].length;
  } else if (
    controls[CONTROL_TYPES.COLORING_MODE] === COLORING_MODES.BY_TARGET
  ) {
    numColors = numTargets;
  } else {
    numColors = CONTROLS[CONTROL_TYPES.COLORING_MODE].gradientOptions.numColors;
  }

  // Set up the color controls based on the previously set color options.
  Object.assign(controls, {
    [CONTROL_TYPES.COLORS]: CONTROLS[CONTROL_TYPES.COLORS].defaultValue(
      [],
      numColors,
      true,
    ),
  });

  return controls;
}

// Debounce updating the query string to prevent mobile safar locking up.
export const saveControlValues = _.debounce(controls => {
  const paramsString = toQueryString(controls);
  window.history.replaceState({}, document.title, `?${paramsString}`);
}, 500);

export function readSavedControlValues() {
  const searchString =
    window.location.search.replace('?', '') || _.sample(PRESETS);
  const controls = parseQueryString(searchString);

  // Check if the parsed controls matches one of the preset.
  const presetIndex = CONTROLS[
    CONTROL_TYPES.PRESET
  ].options.findIndex(({ value }, index) => {
    if (!value) return false;
    const presetValues = parseQueryString(value);
    return Object.keys(presetValues).every(controlType =>
      _.isEqual(controls[controlType], presetValues[controlType]),
    );
  });

  // If so then set the preset control.
  if (presetIndex > 0) {
    controls[CONTROL_TYPES.PRESET] = presetIndex;
    controls[CONTROL_TYPES.QUALITY] =
      CONTROLS[CONTROL_TYPES.QUALITY].options.length - 2;
  }

  return controls;
}
