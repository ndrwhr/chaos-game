import _ from 'lodash';

import { COLOR_INDEXES, COLORS, LIGHT_COLORS_SET } from '../constants/colors';

const ROW_SIZE = COLORS[0].length;

function indexToRowCol(index) {
  return [Math.floor(index / ROW_SIZE), index % ROW_SIZE];
}

export function isLightColor(index) {
  return LIGHT_COLORS_SET.has(getActualColor(index));
}

export function getActualColor(index) {
  const [rowIndex, colIndex] = indexToRowCol(index);
  return COLORS[rowIndex][colIndex];
}

export function getNextColor(pastColorIndexes = []) {
  if (!pastColorIndexes.length)
    return _.sample(COLOR_INDEXES.map(set => set[4]));

  const options = pastColorIndexes.reduce((options, pastColorIndex) => {
    const [rowIndex, colIndex] = indexToRowCol(pastColorIndex);

    const previousRow1 = COLOR_INDEXES[rowIndex - 1];
    const previousRow2 = COLOR_INDEXES[rowIndex - 2];
    const nextRow1 = COLOR_INDEXES[rowIndex + 1];
    const nextRow2 = COLOR_INDEXES[rowIndex + 2];

    if (previousRow1) options.add(previousRow1[colIndex]);
    if (previousRow2) options.add(previousRow2[colIndex]);
    if (nextRow1) options.add(nextRow1[colIndex]);
    if (nextRow2) options.add(nextRow2[colIndex]);

    if (colIndex > 0) {
      options.add(COLOR_INDEXES[rowIndex][colIndex - 1]);
    }
    if (colIndex > 1) {
      options.add(COLOR_INDEXES[rowIndex][colIndex - 2]);
    }

    if (colIndex < COLOR_INDEXES[0].length - 1) {
      options.add(COLOR_INDEXES[rowIndex][colIndex + 1]);
    }
    if (colIndex < COLOR_INDEXES[0].length - 2) {
      options.add(COLOR_INDEXES[rowIndex][colIndex + 2]);
    }

    return options;
  }, new Set());

  return _.sample(
    [...options].filter(index => !pastColorIndexes.includes(index)),
  );
}
