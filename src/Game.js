import _ from 'lodash';
import {vec2, mat2} from 'gl-matrix';

import Options from './Options';

const memoize = fn => {
  const createNewMap = () => new Map();
  const getOrCreate = (map, key, creator) => {
    if (map.has(key)){
      return map.get(key);
    } else {
      const val = creator();
      map.set(key, val);
      return val;
    }
  };


  const receivers = new Map();
  const symbol = Symbol();

  return function(...args){
    let current = args.reduce((curr, arg) => {
      return getOrCreate(curr, arg, createNewMap);
    }, getOrCreate(receivers, this, createNewMap));

    return getOrCreate(current, symbol, () => fn.apply(this, args));
  };
}

const generateLookupTable = (points, exclusions) => {
  return new Map(points.map((targetPoint, targetIndex) => {
    const possibleValues = [
      ...points.slice(targetIndex),
      ...points.slice(0, targetIndex),
    ].filter((point, index) => !exclusions.has(index));

    return [targetPoint, possibleValues];
  }));
}

const createAttractor = ({historySize, offsetIndexes}, targetSelector) => {
  const possibleOffsets = Options.defaultControls.offsetIndexes.values.filter(
    (value, index) => offsetIndexes.has(index));
  let currentPoint = vec2.fromValues(Math.random(), Math.random());
  let previousTargets = [];

  return {
    getNextPoint(){
      const newTarget = targetSelector(previousTargets);

      previousTargets = [newTarget, ...previousTargets].slice(0, historySize);

      if (newTarget){
        currentPoint = vec2.lerp(vec2.create(), currentPoint, newTarget,
            _.sample(possibleOffsets));
        return currentPoint;
      } else {
        return null;
      }
    },
  };
};

const games = [
  {
    name: 'Exclusion Intersection',

    description: '',

    controls: {
      historyIndex: {
        values: [0, 1, 2, 3],
        defaultValue: 1,
      },
    },

    createAttractor(points, {exclusions, historyIndex, offsetIndexes}){
      const getIntersection = (a, b) => new Set([...a].filter(x => b.has(x)));

      const historySize = this.controls.historyIndex.values[historyIndex];
      const possibleTargetLookup = generateLookupTable(points, exclusions);

      const getPossibleTargets = memoize((n, ...previousTargets) => {
        // If the previous target was undefined it means that there are no
        // other choices.
        if (previousTargets.length && !previousTargets[0]) return [];

        return [
          ...(previousTargets
              .map(target => new Set(possibleTargetLookup.get(target)))
              .reduce((intersection, possibleTargets) => {
                return getIntersection(intersection, possibleTargets);
              }, new Set(points)))
        ];
      });

      return createAttractor({historySize, offsetIndexes},
          previousTargets => _.sample(
              getPossibleTargets(previousTargets.length, ...previousTargets)));
    },
  },
  {
    name: 'Complex',

    controls: {},

    createAttractor(points, {exclusions, offsetIndexes}){
      const possibleTargetLookup = generateLookupTable(points, exclusions);

      return createAttractor({historySize: 2, offsetIndexes},
        previousTargets => {
          // If the previous target was undefined it means that there are no
          // other choices.
          if (previousTargets.length && !previousTargets[0]) return;

          const uniquePreviousTargets = new Set(previousTargets);

          let possibleTargets = uniquePreviousTargets.size === 1 ?
            possibleTargetLookup.get(previousTargets[0]) :
            points;

          return _.sample(possibleTargets);
        });
    }
  }
];

export default {
  games,

  setupNPoints(n){
    const lerp = 2 * Math.PI / n;
    return _.times(n, index => {
      const angle = lerp * (n - index - 1);
      const vector = vec2.fromValues(0, -0.5);
      const rotationMatrix = mat2.fromRotation(mat2.create(), angle);

      return vec2.transformMat2(vec2.create(), vector, rotationMatrix);
    }).map(point => vec2.add(vec2.create(), point, vec2.fromValues(0.5, 0.5)));
  },
};
