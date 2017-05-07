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

const createAttractor = (targets, historySize, targetGenerator) => Object.assign({
  getInitialPoint(){
    return vec2.clone(_.sample(targets));
  },

  getNextTarget: (() => {
    let previousTargets = [];

    return () => {
      const newTarget = targetGenerator(previousTargets);

      previousTargets = [newTarget, ...previousTargets].slice(0, historySize);

      return newTarget;
    };
  })(),
});

export default {
  createAttractor({points, exclusions, historySize}){
    const getIntersection = (a, b) => new Set([...a].filter(x => b.has(x)));

    const firstLevelLookup = generateLookupTable(points, exclusions);

    const secondLevelLookup = new Map(points.map(ithPoint => {
      const ithPointLookup = new Map(points.map(jthPoint => {
        const jthPointLookup = getIntersection(
          new Set(firstLevelLookup.get(ithPoint)),
          new Set(firstLevelLookup.get(jthPoint))
        );
        return [jthPoint, jthPointLookup];
      }));
      return [ithPoint, ithPointLookup];
    }));

    const thirdLevelLookup = new Map(points.map(ithPoint => {
      const ithPointLookup = new Map(points.map(jthPoint => {
        const jthPointLookup = new Map(points.map(kthPoint => {
          const kthPointLookup = getIntersection(getIntersection(
            new Set(firstLevelLookup.get(ithPoint)),
            new Set(firstLevelLookup.get(jthPoint))
          ), new Set(firstLevelLookup.get(kthPoint)));
          return [kthPoint, kthPointLookup];
        }));
        return [jthPoint, jthPointLookup];
      }));
      return [ithPoint, ithPointLookup];
    }));

    return createAttractor(points, historySize, previousTargets => {
      const uniquePreviousTargets = Array.from(new Set(previousTargets));
      let possibleTargets = points;

      if (uniquePreviousTargets.length === 1){
        possibleTargets = firstLevelLookup.get(uniquePreviousTargets[0]);
      } else if (uniquePreviousTargets === 2){
        possibleTargets = secondLevelLookup.get(uniquePreviousTargets[0])
            .get(uniquePreviousTargets[1]);
      } else if (uniquePreviousTargets === 3){
        possibleTargets = thirdLevelLookup.get(uniquePreviousTargets[0])
            .get(uniquePreviousTargets[1]).get(uniquePreviousTargets[2]);
      }

      return _.sample(possibleTargets);
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
