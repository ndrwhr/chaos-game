import _ from 'lodash';
import {vec2, mat2} from 'gl-matrix';

const generateLookupTable = (points, exclusions) => {
  return new Map(points.map((targetPoint, targetIndex) => {
    const possibleValues = [
      ...points.slice(targetIndex),
      ...points.slice(0, targetIndex),
    ].filter((point, index) => !exclusions.has(index));

    return [targetPoint, possibleValues];
  }));
}

const createAttractor = (targets, historySize, offsets, targetGenerator) => Object.assign({
  getNextPoint: (() => {
    const offsetSize = [...offsets];
    let currentPoint = vec2.fromValues(Math.random(), Math.random());
    let previousTargets = [];

    return () => {
      const newTarget = targetGenerator(previousTargets);

      previousTargets = [newTarget, ...previousTargets].slice(0, historySize);

      currentPoint = vec2.lerp(vec2.create(), currentPoint, newTarget,
        _.sample(offsetSize));

      return currentPoint;
    };
  })(),
});

export default {
  createAttractor({points, offsets, exclusions, historySize}){
    const getIntersection = (a, b) => (new Set([...a].filter(x => b.has(x))));

    const possibleTargetLookup = generateLookupTable(points, exclusions);

    return createAttractor(points, historySize, offsets, previousTargets => {
      // If the previous target was undefined it means that there are no
      // other choices.
      if (previousTargets.length && !previousTargets[0]) return;

      const possibleTargets = previousTargets
          .map(target => new Set(possibleTargetLookup.get(target)))
          .reduce((intersection, possibleTargets) => {
            return getIntersection(intersection, possibleTargets);
          }, new Set(points));

      return _.sample([...possibleTargets]);
    });
  },

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
