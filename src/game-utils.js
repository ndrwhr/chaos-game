import _ from 'lodash';
import {vec2, mat2} from 'gl-matrix';

export default {
  createPolygon(n, clockwise=true){
    if (n === 4){
      const offset = 0.146446609;
      return [
        vec2.fromValues(offset, offset),
        vec2.fromValues(1 - offset, offset),
        vec2.fromValues(1 - offset, 1 - offset),
        vec2.fromValues(offset, 1 - offset),
      ];
    }

    const lerp = 2 * Math.PI / n;
    return _.times(n, index => {
      const angle = lerp * (index);
      const vector = vec2.fromValues(0, -0.5);
      const rotationMatrix = mat2.fromRotation(mat2.create(), angle);

      return vec2.transformMat2(vec2.create(), vector, rotationMatrix);
    }).map(point => vec2.add(vec2.create(), point, vec2.fromValues(0.5, 0.5)));
  },
};