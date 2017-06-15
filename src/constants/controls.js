import _ from 'lodash';
import colorConvert from 'color-convert';

import { getActualColor, getNextColor } from '../utils/color-utils';

export const COLORING_MODES = {
  BY_TRANSFORM: 0,
  BY_TARGET: 1,
  RANDOM: 2,
};

export const TRANSFORM_PARAMS = {
  SCALE: 's',
  ROTATION: 'r',
  PROBABILITY: 'p',
};

export const CONTROL_TYPES = {
  COLORING_MODE: 'coloringMode',
  COLORS: 'colors',
  EXCLUSIONS: 'exclusions',
  GAME: 'gameVariation',
  HISTORY: 'historySize',
  NUM_TARGETS: 'numTargets',
  QUALITY: 'quality',
  SPEED: 'speed',
  TRANSFORMS: 'transforms',
};

export const GAME_TYPES = {
  HISTORY_EXCLUSION: 'HISTORY_EXCLUSION',
  HISTORY_EXCLUSION_2: 'HISTORY_EXCLUSION_2',
  TARGET_TRANSFORMS: 'TARGET_TRANSFORMS',
};

const CONTROL_TYPES_SERIALIZATIONS = {
  [CONTROL_TYPES.COLORING_MODE]: 'cm',
  [CONTROL_TYPES.COLORS]: 'c',
  [CONTROL_TYPES.EXCLUSIONS]: 'e',
  [CONTROL_TYPES.GAME]: 'v',
  [CONTROL_TYPES.HISTORY]: 'h',
  [CONTROL_TYPES.NUM_TARGETS]: 'n',
  [CONTROL_TYPES.QUALITY]: 'q',
  [CONTROL_TYPES.SPEED]: 's',
  [CONTROL_TYPES.TRANSFORMS]: 't',
};

export const SERIALIZATIONS_TO_CONTROL_TYPES = Object.keys(CONTROL_TYPES_SERIALIZATIONS)
  .reduce((obj, key) => ({
    ...obj,
    [CONTROL_TYPES_SERIALIZATIONS[key]]: key,
  }), {});

const createTransform = () => ({
  [TRANSFORM_PARAMS.SCALE]: 0.5,
  [TRANSFORM_PARAMS.ROTATION]: 0,
  [TRANSFORM_PARAMS.PROBABILITY]: 0.5,
});

const composeControl = (...decorators) => (
  params => decorators.reduce((updatedParams, decorator) => decorator(updatedParams), params)
);

const withIntSerializer = () => params => ({
  ...params,

  serialize: value => ({
    [CONTROL_TYPES_SERIALIZATIONS[params.type]]: value,
  }),

  deserialize: value => {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) ? {} : {
      [params.type]: parsedValue,
    };
  },
});

const withArraySerializer = ({
  valueSerializer = value => `${value}`,
  valueParser = value => parseInt(value, 10),
  valueSanitizer = value => !isNaN(value),
} = {}) => params => ({
  ...params,

  serialize: values => ({
    [CONTROL_TYPES_SERIALIZATIONS[params.type]]: values.map(valueSerializer).join('_'),
  }),

  deserialize: valuesString => {
    const values = valuesString.split('_');
    return Array.isArray(values) ? {
      [params.type]: values.map(valueParser).filter(valueSanitizer),
    } : {};
  },
});

const withOptions = options => params => ({
  ...params,

  options,

  extractValueFrom: controls => options[controls[params.type]].value,
});

export const CONTROLS = {
  [CONTROL_TYPES.COLORING_MODE]: composeControl(
    withIntSerializer(),
    withOptions([
      {
        name: 'Color via transforms',
        value: COLORING_MODES.BY_TRANSFORM,
      },
      {
        name: 'Color via targets',
        value: COLORING_MODES.BY_TARGET,
      },
    ]),
  )({
    type: CONTROL_TYPES.COLORING_MODE,

    defaultValue: () => 1,
  }),

  [CONTROL_TYPES.COLORS]: composeControl(
    withArraySerializer(),
  )({
    type: CONTROL_TYPES.COLORS,

    defaultValue: (existingColors = [], expectedNumColors, sortByHue =  false) => {
      const colors = existingColors.slice(0, expectedNumColors);
      while (colors.length < expectedNumColors){
        colors.push(getNextColor(colors));
      }

      if (sortByHue){
        colors.sort((a, b) => {
            const [aH,,aL] = colorConvert.hex.hsl(getActualColor(a));
            const [bH,,bL] = colorConvert.hex.hsl(getActualColor(b));
            return (bH - aH) || (aL-bL);
        });
      }

      return colors;
    },
  }),

  [CONTROL_TYPES.EXCLUSIONS]: composeControl(
    withArraySerializer(),
  )({
    type: CONTROL_TYPES.EXCLUSIONS,

    defaultValue: () => [1, 4],
  }),

  [CONTROL_TYPES.GAME]: composeControl(
    withIntSerializer(),
    withOptions([
      {
        name: 'History Exclusion',
        value: GAME_TYPES.HISTORY_EXCLUSION,
      },
      {
        name: 'History Exclusion II',
        value: GAME_TYPES.HISTORY_EXCLUSION_2,
      },
      {
        name: 'Target Transforms',
        value: GAME_TYPES.TARGET_TRANSFORMS,
      },
    ]),
  )({
    type: CONTROL_TYPES.GAME,

    defaultValue: () => 0,
  }),

  [CONTROL_TYPES.HISTORY]: composeControl(
    withIntSerializer(),
    withOptions(_.range(1, 4).map(i => ({
      name: i,
      value: i,
    }))),
  )({
    type: CONTROL_TYPES.HISTORY,

    defaultValue: () => 0,
  }),

  [CONTROL_TYPES.QUALITY]: composeControl(
    withOptions([
      {
        name: 'Rough',
        value: 1,
      },
      {
        name: 'Low',
        value: 0.5,
      },
      {
        name: 'Medium',
        value: 0.2,
      },
      {
        name: 'Fine',
        value: 0.1,
      },
    ]),
  )({
    type: CONTROL_TYPES.QUALITY,

    defaultValue: () => 0,
  }),

  [CONTROL_TYPES.NUM_TARGETS]: composeControl(
    withIntSerializer(),
    withOptions(_.range(3,11).map(i => ({
      name: i,
      value: i,
    }))),
  )({
    type: CONTROL_TYPES.NUM_TARGETS,

    defaultValue: () => 2,
  }),

  [CONTROL_TYPES.SPEED]: composeControl(
    withOptions([
      {
        name: 'Slow',
        value: 5,
      },
      {
        name: 'Medium',
        value: 20,
      },
      {
        name: 'Fast',
        value: 40,
      },
    ]),
  )({
    type: CONTROL_TYPES.SPEED,

    defaultValue: () => 0,
  }),

  [CONTROL_TYPES.TRANSFORMS]: composeControl(
    withArraySerializer({
      valueSerializer: transform => (
        Object.keys(transform).map(key => (
          `${key}${Math.floor(transform[key] * 10000) / 10000}`)
        ).join('')
      ),

      valueParser: valueString => {
        const transform = {};

        const valueRegex = /([srp])(-?\d+(?:\.\d+)?)/g;
        let result = valueRegex.exec(valueString);
        while (result) {
          const [, key, value] = result;
          const parsedValue = parseFloat(value);

          if (!isNaN(parsedValue)) {
            transform[key] = parsedValue;
          }

          result = valueRegex.exec(valueString);
        }

        return Object.keys(transform).length === 3 ? transform : null;
      },

      valueSanitizer: value => !!value,
    })
  )({
    type: CONTROL_TYPES.TRANSFORMS,

    paramsValues: [
      {
        name: 'scale',
        key: TRANSFORM_PARAMS.SCALE,
        minValue: 0.1,
        maxValue: 0.9,
      },
      {
        name: 'rotation',
        key: TRANSFORM_PARAMS.ROTATION,
        minValue: -Math.PI / 10,
        maxValue: Math.PI / 10,
      },
      {
        name: 'probability',
        key: TRANSFORM_PARAMS.PROBABILITY,
        minValue: 0.001,
        maxValue: 1,
      },
    ],

    createTransform,

    defaultValue: () => ([
      createTransform()
    ]),
  }),
};
