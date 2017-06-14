import _ from 'lodash';

const ACTUAL_COLORS = [
  ['#fff9c4','#fff59d','#fff176','#ffee58','#ffeb3b','#fdd835','#fbc02d','#f9a825','#f57f17'],
  ['#ffecb3','#ffe082','#ffd54f','#ffca28','#ffc107','#ffb300','#ffa000','#ff8f00','#ff6f00'],
  ['#ffe0b2','#ffcc80','#ffb74d','#ffa726','#ff9800','#fb8c00','#f57c00','#ef6c00','#e65100'],
  ['#ffcdd2','#ef9a9a','#e57373','#ef5350','#f44336','#e53935','#d32f2f','#c62828','#b71c1c'],
  ['#f8bbd0','#f48fb1','#f06292','#ec407a','#e91e63','#d81b60','#c2185b','#ad1457','#880e4f'],
  ['#e1bee7','#ce93d8','#ba68c8','#ab47bc','#9c27b0','#8e24aa','#7b1fa2','#6a1b9a','#4a148c'],
  ['#d1c4e9','#b39ddb','#9575cd','#7e57c2','#673ab7','#5e35b1','#512da8','#4527a0','#311b92'],
  ['#c5cae9','#9fa8da','#7986cb','#5c6bc0','#3f51b5','#3949ab','#303f9f','#283593','#1a237e'],
  ['#bbdefb','#90caf9','#64b5f6','#42a5f5','#2196f3','#1e88e5','#1976d2','#1565c0','#0d47a1'],
  ['#b3e5fc','#81d4fa','#4fc3f7','#29b6f6','#03a9f4','#039be5','#0288d1','#0277bd','#01579b'],
  ['#b2ebf2','#80deea','#4dd0e1','#26c6da','#00bcd4','#00acc1','#0097a7','#00838f','#006064'],
  ['#b2dfdb','#80cbc4','#4db6ac','#26a69a','#009688','#00897b','#00796b','#00695c','#004d40'],
  ['#c8e6c9','#a5d6a7','#81c784','#66bb6a','#4caf50','#43a047','#388e3c','#2e7d32','#1b5e20'],
  ['#dcedc8','#c5e1a5','#aed581','#9ccc65','#8bc34a','#7cb342','#689f38','#558b2f','#33691e'],
  ['#cfd8dc','#b0bec5','#90a4ae','#78909c','#607d8b','#546e7a','#455a64','#37474f','#263238'],
];

const LIGHT_COLOR_LOOKUP = new Set([
  '#ffcdd2','#ef9a9a','#e57373','#f8bbd0','#f48fb1','#e1bee7','#ce93d8','#d1c4e9','#b39ddb',
  '#c5cae9','#9fa8da','#bbdefb','#90caf9','#64b5f6','#42a5f5','#b3e5fc','#81d4fa','#4fc3f7',
  '#29b6f6','#03a9f4','#b2ebf2','#80deea','#4dd0e1','#26c6da','#00bcd4','#00acc1','#b2dfdb',
  '#80cbc4','#4db6ac','#26a69a','#c8e6c9','#a5d6a7','#81c784','#66bb6a','#4caf50','#dcedc8',
  '#c5e1a5','#aed581','#9ccc65','#8bc34a','#7cb342','#fff9c4','#fff59d','#fff176','#ffee58',
  '#ffeb3b','#fdd835','#fbc02d','#f9a825','#f57f17','#ffecb3','#ffe082','#ffd54f','#ffca28',
  '#ffc107','#ffb300','#ffa000','#ff8f00','#ff6f00','#ffe0b2','#ffcc80','#ffb74d','#ffa726',
  '#ff9800','#fb8c00','#f57c00','#cfd8dc','#b0bec5','#90a4ae',
]);

const ROW_SIZE = ACTUAL_COLORS[0].length;

function indexToRowCol(index){
  return [Math.floor(index / ROW_SIZE), index % ROW_SIZE];
}

export const COLOR_INDEXES = ACTUAL_COLORS.map((shades, rowIndex) => (
  shades.map((shade, colIndex) => (rowIndex * ROW_SIZE) + colIndex)
));

export function isLightColor(index) {
  return LIGHT_COLOR_LOOKUP.has(getActualColor(index));
}

export function getActualColor(index) {
  const [rowIndex, colIndex] = indexToRowCol(index);
  return ACTUAL_COLORS[rowIndex][colIndex];
}

export function getNextColor(pastColorIndexes = []) {
    if (!pastColorIndexes.length) return _.sample(COLOR_INDEXES.map(set => set[4]));

    const options = pastColorIndexes.reduce((options, pastColorIndex) => {
      const [rowIndex, colIndex] = indexToRowCol(pastColorIndex);

      const previousRow1 = COLOR_INDEXES[(rowIndex - 1)];
      const previousRow2 = COLOR_INDEXES[(rowIndex - 2)];
      const nextRow1 = COLOR_INDEXES[(rowIndex + 1)];
      const nextRow2 = COLOR_INDEXES[(rowIndex + 2)];

      if (previousRow1) options.add(previousRow1[colIndex]);
      if (previousRow2) options.add(previousRow2[colIndex]);
      if (nextRow1) options.add(nextRow1[colIndex]);
      if (nextRow2) options.add(nextRow2[colIndex]);

      if (colIndex > 0){
        options.add(COLOR_INDEXES[rowIndex][colIndex - 1]);
      }
      if (colIndex > 1){
        options.add(COLOR_INDEXES[rowIndex][colIndex - 2]);
      }

      if (colIndex < COLOR_INDEXES[0].length - 1){
        options.add(COLOR_INDEXES[rowIndex][colIndex + 1]);
      }
      if (colIndex < COLOR_INDEXES[0].length - 2){
        options.add(COLOR_INDEXES[rowIndex][colIndex + 2]);
      }

      return options;
    }, new Set());

    return _.sample([...options].filter(index => !pastColorIndexes.includes(index)));
};
