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
};

const generateExclusionTargetLookup = (points, exclusions) => {
  return new Map(points.map((targetPoint, targetIndex) => {
    const possibleValues = [
      ...points.slice(targetIndex),
      ...points.slice(0, targetIndex),
    ].filter((point, index) => !exclusions.has(index));

    return [targetPoint, possibleValues];
  }));
};

const createTargetSelectorWithHistory = (historySize, targetSelector) => {
  let previousTargets = [];

  return () => {
    const newTarget = targetSelector(previousTargets);

    previousTargets = [newTarget, ...previousTargets].slice(0, historySize);

    return newTarget;
  };
};

const createSharedTransformSelector = (transforms) => {
  const totalProbability = transforms.reduce(
      (acc, {probability}) => acc + probability, 0);

  const transformPool = transforms.reduce((pool, transform) => {
    _.times(Math.floor(100 * transform.probability / totalProbability), () => {
      pool.push(transform);
    });

    return pool;
  }, []);

  return () => _.sample(transformPool);
};

const createAttractor = ({
      targetSelector,
      transforms,
      transformSelector,
    }) => {
  const transformMatrixLookup = transforms.reduce((lookup, transform) => {
    const scaleMatrix = mat2.fromScaling(
      mat2.create(),
      vec2.fromValues(transform.scale, transform.scale),
    );
    const rotationMatrix = mat2.fromRotation(mat2.create(), transform.rotation);
    const transformMatrix = mat2.multiply(
      mat2.create(),
      scaleMatrix,
      rotationMatrix,
    );

    lookup.set(transform, transformMatrix);

    return lookup;
  }, new Map());

  let currentPoint = vec2.fromValues(Math.random(), Math.random());
  const moveCurrentPoint = (target, transformMatrix) => {
    const delta = vec2.subtract(vec2.create(), target, currentPoint);
    const currentTemp = vec2.transformMat2(vec2.create(), delta,
        transformMatrix);

    currentPoint = vec2.add(vec2.create(), currentTemp, currentPoint);

    return currentPoint;
  };

  const getNextPoint = () => {
    const target = targetSelector();
    if (!target) return {};

    const transform = transformSelector(target);
    const transformMatrix = transformMatrixLookup.get(transform);

    return {
      point: moveCurrentPoint(target, transformMatrix),
      color: transform.color,
    };
  };

  // Prime the attractor so that we don't see any random points lingering
  // around outside of the main fractal.
  for (var i = 0; i < 100; i++){
    getNextPoint();
  }

  return {
    getNextPoint,
  };
};

const games = [
  {
    name: 'Target Transforms',

    controls: {
      historyIndex: Options.optionalControlFactory.historyIndex(3),
      pointTransforms: Options.optionalControlFactory.pointTransforms(),
    },

    createAttractor(points, {exclusions, historyIndex, pointTransforms}){
      const transformMap = points.reduce((map, point, index) => {
        map.set(point, pointTransforms[index]);
        return map;
      }, new Map());

      const getIntersection = (a, b) => new Set([...a].filter(x => b.has(x)));

      const historySize = this.controls.historyIndex.options[historyIndex];
      const possibleTargetLookup = generateExclusionTargetLookup(points, exclusions);

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

      const targetSelector = createTargetSelectorWithHistory(
        historySize,
        previousTargets => _.sample(
          getPossibleTargets(previousTargets.length, ...previousTargets)
        )
      );

      const transformSelector = (target) => {
        return transformMap.get(target);
      };

      return createAttractor({
        targetSelector,
        transforms: pointTransforms,
        transformSelector,
      });
    },
  },
  {
    name: 'Exclusion Intersection',

    description: '',

    controls: {
      historyIndex: Options.optionalControlFactory.historyIndex(3),
      transforms: Options.optionalControlFactory.transforms(),
    },

    createAttractor(points, {exclusions, historyIndex, transforms}){
      const getIntersection = (a, b) => new Set([...a].filter(x => b.has(x)));

      const historySize = this.controls.historyIndex.options[historyIndex];
      const possibleTargetLookup = generateExclusionTargetLookup(points, exclusions);

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

      const targetSelector = createTargetSelectorWithHistory(
        historySize,
        previousTargets => _.sample(
          getPossibleTargets(previousTargets.length, ...previousTargets)
        )
      );

      const transformSelector = createSharedTransformSelector(transforms);

      return createAttractor({
        targetSelector,
        transforms,
        transformSelector,
      });
    },
  },
  {
    name: 'Last Two',

    controls: {
      transforms: Options.optionalControlFactory.transforms(),
    },

    createAttractor(points, {exclusions, transforms}){
      const possibleTargetLookup = generateExclusionTargetLookup(points, exclusions);

      const targetSelector = createTargetSelectorWithHistory(2,
        (previousTargets) => {
          // If the previous target was undefined it means that there are no
          // other choices.
          if (previousTargets.length && !previousTargets[0]) return;

          const uniquePreviousTargets = new Set(previousTargets);

          let possibleTargets = uniquePreviousTargets.size === 1 ?
            possibleTargetLookup.get(previousTargets[0]) :
            points;

          return _.sample(possibleTargets);
        });

      const transformSelector = createSharedTransformSelector(transforms);

      return createAttractor({
        targetSelector,
        transforms,
        transformSelector,
      });
    }
  }
];

export default {
  games,
};
