import hexRgb from 'hex-rgb';

import Game from './Game';

const colors = [
    ['#ffe082', '#ffca28', '#ffc107', '#ffb300', '#ff8f00'],
    ['#ffcc80', '#ffa726', '#ff9800', '#fb8c00', '#ef6c00'],
    ['#ffab91', '#ff7043', '#ff5722', '#f4511e', '#d84315'],
    ['#f48fb1', '#ec407a', '#e91e63', '#d81b60', '#ad1457'],
    ['#ce93d8', '#ab47bc', '#9c27b0', '#8e24aa', '#6a1b9a'],
    ['#b39ddb', '#7e57c2', '#673ab7', '#5e35b1', '#4527a0'],
    ['#b0bec5', '#78909c', '#607d8b', '#546e7a', '#37474f'],
    ['#90caf9', '#42a5f5', '#2196f3', '#1e88e5', '#1565c0'],
    ['#80deea', '#26c6da', '#00bcd4', '#00acc1', '#00838f'],
    ['#80cbc4', '#26a69a', '#009688', '#00897b', '#00695c'],
    ['#c5e1a5', '#9ccc65', '#8bc34a', '#7cb342', '#558b2f'],
    ['#e6ee9c', '#d4e157', '#cddc39', '#c0ca33', '#9e9d24'],
].map(colorGroup => colorGroup.map(color =>
    `rgba(${hexRgb(color).join(',')}, 0.5)`));

const Options = {

  colors,

  defaultGame: 0,

  defaultControls: {
    gameIndex: {
      options: Game.games,
      defaultValue: () => 1,
    },

    exclusions: {
      defaultValue: () => new Set([1, 4]),
    },

    shapeIndex: {
      options: [
        {
          "value": 3,
          "name": "Triangle"
        },
        {
          "value": 4,
          "name": "Square"
        },
        {
          "value": 5,
          "name": "Pentagon"
        },
        {
          "value": 6,
          "name": "Hexagon"
        },
        {
          "value": 7,
          "name": "Heptagon"
        },
        {
          "value": 8,
          "name": "Octagon"
        },
        {
          "value": 9,
          "name": "Nonagon"
        },
        {
          "value": 10,
          "name": "Decagon"
        }
      ],
      defaultValue: () => 2,
    },

    speedIndex: {
      options: [
        10,
        100,
        500,
        1000,
      ],
      defaultValue: () => 1,
    },

    transforms: {
      options: [
        'compression',
        'rotation',
        'probability',
        'color',
      ],

      compression: {
        minValue: 0.1,
        maxValue: 0.9,
      },

      rotation: {
        minValue: -Math.PI / 8,
        maxValue: Math.PI / 8,
      },

      probability: {
        minValue: 0.001,
        maxValue: 1,
      },

      defaultValue: () => ([
        {
          compression: 0.5,
          rotation: 0,
          probability: 0.9,
          color: colors[0][4],
        },
      ]),
    },

    qualityIndex: {
      options: [
        {
          value: 2,
          name: 'Rough',
        },
        {
          value: 1,
          name: 'Low',
        },
        {
          value: 0.5,
          name: 'Medium',
        },
        {
          value: 0.2,
          name: 'Fine',
        },
        {
          value: 0.1,
          name: 'Super Fine',
        },
      ],
      defaultValue: () => 0,
    }
  },
};

export default Options;
