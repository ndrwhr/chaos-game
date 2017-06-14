import _ from 'lodash';
import colorConvert from 'color-convert';

import { getActualColor, getNextColor } from './colors';

export const COLOR_MODES = {
  BY_TRANSFORM: 0,
  BY_TARGET: 1,
  RANDOM: 2,
};

export const TRANSFORM_PARAMS = {
  SCALE: 's',
  ROTATION: 'r',
  PROBABILITY: 'p',
};

const createTransform = () => ({
  [TRANSFORM_PARAMS.SCALE]: 0.5,
  [TRANSFORM_PARAMS.ROTATION]: 0,
  [TRANSFORM_PARAMS.PROBABILITY]: 0.5,
});

const withIntSerializer = (control, options) => ({
  ...options,

  serialize: value => ({
    [options.serializeTo]: value
  }),

  deserialize: value => {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) ? {} : {
      [control]: parsedValue,
    };
  },
});

const withIntArraySerializer = (control, options) => ({
  ...options,

  serialize: values => ({
    [options.serializeTo]: values
  }),

  deserialize: values => (Array.isArray(values) ? {
    [control]: values.map(value => parseInt(value, 10)).filter(value => !isNaN(value)),
  } : {}),
});

export const DEFAULT_CONTROLS = {
  colors: withIntArraySerializer('colors', {
    serializeTo: 'c',

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

  gameIndex: withIntSerializer('gameIndex', {
    serializeTo: 'g',

    defaultValue: () => 0,
  }),

  exclusions: withIntArraySerializer('exclusions', {
    serializeTo: 'e',

    defaultValue: () => [1, 4],
  }),

  qualityIndex: {
    options: [
      {
        value: 1,
        name: 'Rough',
      },
      {
        value: 0.5,
        name: 'Low',
      },
      {
        value: 0.2,
        name: 'Medium',
      },
      {
        value: 0.1,
        name: 'Fine',
      },
    ],
    defaultValue: () => 0,
  },

  shapeIndex: withIntSerializer('shapeIndex', {
    serializeTo: 's',

    options: [
      {
        value: 3,
        name: 3,
      },
      {
        value: 4,
        name: 4,
      },
      {
        value: 5,
        name: 5,
      },
      {
        value: 6,
        name: 6,
      },
      {
        value: 7,
        name: 7,
      },
      {
        value: 8,
        name: 8,
      },
      {
        value: 9,
        name: 9,
      },
      {
        value: 10,
        name: 10,
      }
    ],
    defaultValue: () => 2,
  }),

  speedIndex: {
    options: [
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
    ],
    defaultValue: () => 0,
  },

  transforms: {
    serializeTo: 't',

    serialize: (values) => ({
      t: values.map(transform => (
        Object.keys(transform).map(key => (
          `${key}${Math.floor(transform[key] * 10000) / 10000}`)
        ).join('')
      )),
    }),

    deserialize: (values) => {
      const parseTransform = (str) => {
        const transform = {};

        const valueRegex = /([srp])(-?\d+(?:\.\d+)?)/g;
        let result = valueRegex.exec(str);
        while (result) {
          const [, key, value] = result;
          const parsedValue = parseFloat(value);

          if (!isNaN(parsedValue)) {
            transform[key] = parsedValue;
          }

          result = valueRegex.exec(str);
        }

        return Object.keys(transform).length === 3 ? transform : null;
      };

      return {
        transforms: values.reduce((transforms, value) => {
          const transform = parseTransform(value);
          return transform ? [...transforms, transform] : transforms;
        }, []),
      };
    },

    options: [
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

    defaultValue: () => ([createTransform()]),
  },
};

export const OPTIONAL_CONTROL_FACTORY = {
  colorModeIndex: () => (withIntSerializer('colorModeIndex', {
    serializeTo: 'cm',

    options: [
      {
        name: 'Color via transforms',
        value: COLOR_MODES.BY_TRANSFORM,
      },
      {
        name: 'Color via targets',
        value: COLOR_MODES.BY_TARGET,
      },
    ],
    defaultValue: () => 1,
  })),

  historyIndex: (max) => (withIntSerializer('historyIndex', {
    serializeTo: 'h',

    options: _.range(1, max + 1),

    defaultValue: () => 0,
  })),
};
