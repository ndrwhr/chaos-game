import Game from './Game';

const Options = {
  defaultGame: 0,

  defaultControls: {
    gameIndex: {
      options: Game.games,
      defaultValue: 1,
    },

    exclusions: {
      defaultValue: new Set([1, 4]),
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
      defaultValue: 2,
    },

    speedIndex: {
      options: [
        10,
        100,
        500,
        1000,
      ],
      defaultValue: 2,
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
      defaultValue: 1,
    }
  },
};

export default Options;
