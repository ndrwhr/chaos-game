import _ from 'lodash';
import hexRgb from 'hex-rgb';

const colors = [
  ['#ffee58', '#ffeb3b', '#fbc02d', '#f9a825', '#f57f17'],
  ['#ffca28', '#ffc107', '#ffa000', '#ff8f00', '#ff6f00'],
  ['#ffa726', '#ff9800', '#f57c00', '#ef6c00', '#e65100'],
  ['#ff7043', '#ff5722', '#e64a19', '#d84315', '#bf360c'],
  ['#ef5350', '#f44336', '#d32f2f', '#c62828', '#b71c1c'],
  ['#ec407a', '#e91e63', '#c2185b', '#ad1457', '#880e4f'],
  ['#ab47bc', '#9c27b0', '#7b1fa2', '#6a1b9a', '#4a148c'],
  ['#7e57c2', '#673ab7', '#512da8', '#4527a0', '#311b92'],
  ['#5c6bc0', '#3f51b5', '#303f9f', '#283593', '#1a237e'],
  ['#42a5f5', '#2196f3', '#1976d2', '#1565c0', '#0d47a1'],
  ['#29b6f6', '#03a9f4', '#0288d1', '#0277bd', '#01579b'],
  ['#26c6da', '#00bcd4', '#0097a7', '#00838f', '#006064'],
  ['#26a69a', '#009688', '#00796b', '#00695c', '#004d40'],
  ['#66bb6a', '#4caf50', '#388e3c', '#2e7d32', '#1b5e20'],
  ['#9ccc65', '#8bc34a', '#689f38', '#558b2f', '#33691e'],
  ['#78909c', '#607d8b', '#455a64', '#37474f', '#263238'],
]
  .map(colorGroup => colorGroup.map(color =>
    `rgba(${hexRgb(color).join(',')}, 1)`));

const colorLookup = colors.reduce((lookup, set, setIndex) => {
    set.forEach((color, colorIndex) =>
      lookup.set(color, [setIndex, colorIndex]));
    return lookup;
}, new Map());

function getNextColor(pastColors = []){
    if (!pastColors.length) return _.sample(colors.map(set => set[2]));

    const options = pastColors.reduce((options, pastColor) => {
        const [setIndex, colorIndex] = colorLookup.get(pastColor);

        const previousSet1 = colors[(setIndex - 1)];
        const previousSet2 = colors[(setIndex - 2)];
        const nextSet1 = colors[(setIndex + 1)];
        const nextSet2 = colors[(setIndex + 2)];

        if (previousSet1) options.add(previousSet1[colorIndex]);
        if (previousSet2) options.add(previousSet2[colorIndex]);
        if (nextSet1) options.add(nextSet1[colorIndex]);
        if (nextSet2) options.add(nextSet2[colorIndex]);

        if (colorIndex > 0){
          options.add(colors[setIndex][colorIndex - 1]);
        }
        if (colorIndex > 1){
          options.add(colors[setIndex][colorIndex - 2]);
        }

        if (colorIndex < colors[0].length - 1){
          options.add(colors[setIndex][colorIndex + 1]);
        }
        if (colorIndex < colors[0].length - 2){
          options.add(colors[setIndex][colorIndex + 2]);
        }

        return options;
    }, new Set());

    return _.sample([...options].filter(option => !pastColors.includes(option)));
}

const createTransform = (pastColors) => {
  return {
    scale: 0.5,
    rotation: 0,
    sheerX: 0,
    sheerY: 0,
    probability: 0.5,
    color: getNextColor(pastColors),
  };
};

const defaultControls = {
  colorIndex: {
    options: [
      {
        name: 'Color Via Transforms',
        value: 0,
      },
      {
        name: 'Color Via Targets',
        value: 1,
      },
    ],
    defaultValue: () => 0,
  },
  gameIndex: {
    defaultValue: () => 1,
  },

  exclusions: {
    defaultValue: () => new Set([1, 4]),
  },

  shapeIndex: {
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
  },

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
};

const optionalControlFactory = {
  historyIndex: (size) => ({
    options: _.range(size + 1),
    defaultValue: () => 1,
  }),

  pointTransforms: () => ({
    options: [
      'scale',
      'rotation',
      'probability',
      'color',
    ],

    scale: {
      minValue: 0.1,
      maxValue: 0.9,
    },

    rotation: {
      minValue: -Math.PI / 10,
      maxValue: Math.PI / 10,
    },

    probability: {
      minValue: 0.001,
      maxValue: 1,
    },

    createTransform,

    defaultValue: (controls) => {
      const numPoints =
        defaultControls.shapeIndex.options[controls.shapeIndex].value;
      return _.range(numPoints).reduce((transforms) => {
        const pastColors = transforms.map(({color}) => color);
        transforms.push(createTransform(pastColors));
        return transforms;
      }, []);
    },
  }),

  transforms: () => ({
    options: [
      'scale',
      'rotation',

      'probability',
      'color',
    ],

    scale: {
      minValue: 0.1,
      maxValue: 0.9,
    },

    rotation: {
      minValue: -Math.PI / 10,
      maxValue: Math.PI / 10,
    },

    probability: {
      minValue: 0.001,
      maxValue: 1,
    },

    createTransform,

    defaultValue: () => ([
      createTransform(),
    ]),
  }),
};

export default {
  colors,
  defaultControls,
  getNextColor,
  optionalControlFactory,
};
