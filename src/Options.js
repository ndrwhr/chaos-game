import Game from './Game';

const Options = {
  defaultGame: 0,

  defaultControls: {
    gameIndex: {
      values: Game.games,
      defaultValue: 1,
    },

    exclusions: {
      defaultValue: new Set(),
    },

    offsetIndexes: {
      values: [
        0.3,
        0.35,
        0.4,
        0.45,
        0.5,
        0.55,
        0.6,
        0.65,
        0.7,
      ],
      defaultValue: new Set([4]),
    },

    shapeIndex: {
      values: [
        [3, 'Triangle'],
        [4, 'Square'],
        [5, 'Pentagon'],
        [6, 'Hexagon'],
        [7, 'Heptagon'],
        [8, 'Octagon'],
        [9, 'Nonagon'],
        [10, 'Decagon'],
      ],
      defaultValue: 2,
    },

    speedIndex: {
      values: [
        10,
        100,
        500,
        1000,
      ],
      defaultValue: 2,
    },
  },
};

export default Options;
