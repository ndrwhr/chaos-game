import _ from 'lodash';
import colorConvert from 'color-convert';

import { getActualColor, getNextColor } from '../utils/color-utils';

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

export const PRESETS = [
  'c=130&cm=0&e=0_4_5_3&h=0&n=5&t=s0.5r0p0.5&v=0',
  'c=40_11_22_20&cm=2&e=2_4&h=0&n=3&t=s0.5r0p0.5&v=0',
  'c=130_129_128_132&cm=2&e=2_1_3_4&h=0&n=4&t=s0.4426r0.1195p0.5659_s0.1121r-0.1723p0.6476_s0.2701r-0.1093p0.6435_s0.538r-0.0354p0.2751_s0.1195r-0.2693p0.3045_s0.4824r0.1949p0.5628_s0.8829r-0.236p0.4709&v=2',
  'c=13_22_13_22&cm=1&e=1_4_3&n=1&t=s0.5r0p0.5&v=1',
  'c=40_58_22_31&cm=2&e=1&h=1&n=5&t=s0.4634r0.0072p0.4228_s0.8455r-0.0668p0.4446_s0.8366r0.2193p0.4935&v=0',
  'c=69_67_76_94&cm=2&e=8_4_6_7_5_2&h=0&n=1&t=s0.6981r0p0.5_s0.3535r0p0.5_s0.5r0p0.5&v=0',
  'c=40_38_37_20&cm=2&e=2_4_3&h=0&n=3&t=s0.777r0.2287p0.2885_s0.8517r0.1184p0.323_s0.2277r-0.2879p0.5118_s0.2076r-0.1929p0.9965_s0.4118r0.0993p0.3887_s0.5557r0.0984p0.888&v=2',
  'c=86_85_83_95_94_92&cm=1&e=2_1_4_3&n=3&t=s0.5r0p0.5&v=1',
  'c=40_22_21_24&cm=2&e=5_2&h=1&n=4&t=s0.8807r-0.1679p0.4155_s0.5462r0.2013p0.817&v=0',
  'c=40&cm=0&e=0&h=0&n=2&t=s0.5r0p0.5&v=0',
  'c=4_13_15_17_31_29&cm=0&e=2_3&h=1&n=3&t=s0.2501r0p0.1731_s0.2649r0p0.5_s0.2673r0p0.5_s0.5971r0p0.5_s0.4003r0p0.5_s0.2353r0p0.5&v=2',
  'c=79_76_79_76_79_76_79_76&cm=1&e=8_1_6_2_7_4&h=1&n=5&t=s0.71r0.3141p0.5_s0.71r-0.3142p0.5&v=0',
  'c=130&cm=0&e=8_2_6_4&h=1&n=5&t=s0.5r0p0.5&v=0',
  'c=67_76_74_92&cm=2&e=5_6_4_3_2_1&h=1&n=7&t=s0.8833r0.2955p0.3125_s0.3874r0.165p0.8605_s0.5981r0.1829p0.47&v=0',
  'c=84_94_93_103&cm=2&e=1_4&n=2&t=s0.5r0p0.5&v=1',
  'c=49_47_67_85&cm=2&e=3_4_5_2&n=4&t=s0.5824r0p0.5&v=1',
  'c=111_110_112_120&cm=2&e=5_4_3&h=1&n=4&t=s0.6676r-0.077p0.3259_s0.8011r-0.2629p0.9318_s0.4913r-0.1833p0.6381_s0.4823r0.1795p0.3341_s0.1171r-0.1598p0.581_s0.4907r0.2629p0.9744_s0.6905r-0.2852p0.4224&v=2',
  'c=49_50_58_68&cm=2&e=4_2&n=1&t=s0.5r0p0.5&v=1',
  'c=94_103_102_112&cm=2&e=5_1_4_3&h=0&n=4&t=s0.7239r-0.3106p0.25_s0.611r0.2758p0.7107_s0.727r-0.15p0.2256&v=0',
  'c=58_76_31_49&cm=2&e=9_1_4_6_8_3&h=0&n=4&t=s0.5r0p0.5&v=0',
  'c=40_42_43&cm=0&e=8_6_4_7_2&h=0&n=0&t=s0.4906r-0.0192p0.3983_s0.7905r0.3141p0.8513_s0.484r-0.3142p0.8407&v=0',
  'c=58_76_58_76&cm=2&e=8_2_6_4_7_3&h=0&n=7&t=s0.5r0p0.5&v=0',
  'c=4_4_40_40&cm=2&e=8_1_6_3_5_4&h=0&n=6&t=s0.3116r0p0.5_s0.703r0p0.5&v=0',
  'c=94_103_105_112&cm=2&e=8_1_6_5_4&h=1&n=2&t=s0.71r0.3141p0.5_s0.71r-0.3142p0.5&v=0',
  'c=49_47_46_29&cm=2&e=8_6_5_1&h=0&n=3&t=s0.653r0p0.0509_s0.4004r0p0.0615_s0.7664r0p0.3479&v=0',
];

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

  random: () => _.random(0, options.length - 1),
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

    random: numTargets => ([
      ...(new Set(_.sampleSize(_.range(1, numTargets - 1), _.random(1, numTargets - 2)))),
    ]),

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
        name: 'Custom',
        value: null,
      },
      ...PRESETS.map((value, index) => ({
        name: `Preset ${index + 1}`,
        value,
      })),
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

    randomTransform: () => {
      const control = CONTROLS[CONTROL_TYPES.TRANSFORMS];
      return control.paramsValues.reduce((acc, params) => ({
        ...acc,
        [params.key]: _.random(params.minValue, params.maxValue, true),
      }), {});
    },

    defaultValue: () => ([
      createTransform()
    ]),
  }),
};

export const SERIALIZABLE_CONTROLS = new Set(Object.keys(CONTROLS).filter(controlType => (
  !!CONTROLS[controlType].serialize
)));
