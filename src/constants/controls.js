import _ from 'lodash';
import colorConvert from 'color-convert';

import { getActualColor, getNextColor } from '../utils/color-utils';

export const COLORING_MODES = {
  BY_TRANSFORM: 0,
  BY_TARGET: 1,
  GRADIENT: 2,
};

export const BACKGROUND_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const BACKGROUND_COLORS = {
  [BACKGROUND_TYPES.LIGHT]: '#fff',
  [BACKGROUND_TYPES.DARK]: '#263238',
};

export const TRANSFORM_PARAMS = {
  SCALE: 's',
  ROTATION: 'r',
  PROBABILITY: 'p',
};

export const CONTROL_TYPES = {
  BACKGROUND: 'background',
  COLORING_MODE: 'coloringMode',
  COLORS: 'colors',
  EXCLUSIONS: 'exclusions',
  GAME: 'gameVariation',
  HISTORY: 'historySize',
  NUM_TARGETS: 'numTargets',
  PRESET: 'preset',
  QUALITY: 'quality',
  TRANSFORMS: 'transforms',
};

export const GAME_TYPES = {
  HISTORY_EXCLUSION: 'HISTORY_EXCLUSION',
  HISTORY_EXCLUSION_2: 'HISTORY_EXCLUSION_2',
  TARGET_TRANSFORMS: 'TARGET_TRANSFORMS',
};

const CONTROL_TYPES_SERIALIZATIONS = {
  [CONTROL_TYPES.BACKGROUND]: 'b',
  [CONTROL_TYPES.COLORING_MODE]: 'cm',
  [CONTROL_TYPES.COLORS]: 'c',
  [CONTROL_TYPES.EXCLUSIONS]: 'e',
  [CONTROL_TYPES.GAME]: 'v',
  [CONTROL_TYPES.HISTORY]: 'h',
  [CONTROL_TYPES.NUM_TARGETS]: 'n',
  [CONTROL_TYPES.QUALITY]: 'q',
  [CONTROL_TYPES.TRANSFORMS]: 't',
};

export const SERIALIZATIONS_TO_CONTROL_TYPES = Object.keys(CONTROL_TYPES_SERIALIZATIONS)
  .reduce((obj, key) => ({
    ...obj,
    [CONTROL_TYPES_SERIALIZATIONS[key]]: key,
  }), {});

export const createTransform = () => ({
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

  extractValueFrom: controls => {
    const index = controls[params.type];
    return (index !== null && index !== undefined) ? options[index].value : null;
  },
});

export const CONTROLS = {
  [CONTROL_TYPES.BACKGROUND]: composeControl(
    withIntSerializer(),
    withOptions([
      {
        name: 'Light',
        value: BACKGROUND_TYPES.LIGHT,
      },
      {
        name: 'Dark',
        value: BACKGROUND_TYPES.DARK,
      },
    ]),
  )({
    type: CONTROL_TYPES.BACKGROUND,

    defaultValue: () => 0,
  }),

  [CONTROL_TYPES.COLORING_MODE]: composeControl(
    withIntSerializer(),
    withOptions([
      {
        name: 'Color via transforms',
        value: COLORING_MODES.BY_TRANSFORM,
        description: 'Adjust the color for each transform above.',
      },
      {
        name: 'Color via targets',
        value: COLORING_MODES.BY_TARGET,
        description: 'Use the controls above to change the color assigned to each target.',
      },
      {
        name: '4 Corner Gradient',
        value: COLORING_MODES.GRADIENT,
        description: 'Use the controls above to change the color of each corner of the gradient.',
      },
    ]),
  )({
    type: CONTROL_TYPES.COLORING_MODE,

    gradientOptions: {
      numColors: 4,
    },

    defaultValue: () => 0,
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
        value: 4,
      },
      {
        name: 'Low',
        value: 2,
      },
      {
        name: 'Medium',
        value: 1,
      },
      {
        name: 'Fine',
        value: 0.2,
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

  [CONTROL_TYPES.PRESET]: composeControl(
    withOptions([
      {
        name: 'custom',
        value: null,
      },
      {
        name: 'History Exclusion 1',
        value: 'c=94_103_102_112&cm=2&e=5_1_4_3&h=0&n=4&t=s0.7239r-0.3106p0.25_s0.611r0.2758p0.7107_s0.727r-0.15p0.2256&v=0',
      },
      {
        name: 'History Exclusion 2',
        value: 'c=67_76_74_92&cm=2&e=5_6_4_3_2_1&h=1&n=7&t=s0.8833r0.2955p0.3125_s0.3874r0.165p0.8605_s0.5981r0.1829p0.47&v=0',
      },
      {
        name: 'History Exclusion 3',
        value: 'c=130&cm=0&e=0_4_5_3&h=0&n=5&t=s0.5r0p0.5&v=0',
      }
    ]),
  )({
    type: CONTROL_TYPES.PRESET,

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
        formatValue: (value) => {
          return `Move about ${Math.round(value * 100)}% of the way towards the next target.`;
        },
      },
      {
        name: 'rotation',
        key: TRANSFORM_PARAMS.ROTATION,
        minValue: -Math.PI / 10,
        maxValue: Math.PI / 10,
        formatValue(value){
          const degrees = (180 / Math.PI) * value;
          const absDegrees = Math.abs(degrees);
          const formattedDeg = Math.round(absDegrees * 10) / 10;

          if (absDegrees < 0.2) {
            return 'Move just about straight towards the target.';
          }

          const direction = degrees < 0 ? 'left' : 'right';
          return `Rotate about ${formattedDeg} degrees to the ${direction}.`;
        },
      },
      {
        name: 'probability',
        key: TRANSFORM_PARAMS.PROBABILITY,
        minValue: 0.001,
        maxValue: 1,
        formatValue(value){
          return `Probability ${value}.`;
        },
      },
    ],

    createTransform,

    defaultValue: () => ([
      createTransform()
    ]),
  }),
};

export const SERIALIZABLE_CONTROLS = new Set(Object.keys(CONTROLS).filter(controlType => (
  !!CONTROLS[controlType].serialize
)));
