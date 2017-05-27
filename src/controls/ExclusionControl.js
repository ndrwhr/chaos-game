import _ from 'lodash';
import classNames from 'classnames';
import React from 'react';

import GameUtils from '../game-utils';

import './exclusion-control.css';

export default ({exclusions, numPoints, onChange}) => {
  const points = GameUtils.createPolygon(numPoints);

  const onToggle = (index) => {
    const updatedExclusions = new Set(exclusions);

    if (updatedExclusions.has(index)){
      updatedExclusions.delete(index);
    } else {
      updatedExclusions.add(index);
    }

    onChange(updatedExclusions);
  };

  const onShuffle = () => onChange(new Set(
    _.sampleSize(_.range(numPoints), _.random(1, numPoints - 2))
  ));

  return (
    <div className="exclusion-control">
      <svg className="exclusion-control__points"
        viewBox="-0.1 -0.1 1.2 1.2"
      >
        <defs>
          <mask id="points">
            <circle
              cx="0.5"
              cy="0.5"
              r="1"
              fill="white"
            />
            {points.map((point, index) => (
              <circle
                key={`mask-${point[0]}-${point[1]}`}
                cx={point[0]}
                cy={point[1]}
                r="0.1"
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <circle
          cx="0.5"
          cy="0.5"
          r="0.5"
          fill="none"
          stroke="black"
          strokeWidth="0.01"
          mask="url(#points)"
        />
        {points.map((point, index) => (
          <circle
            className={
              classNames('exclusion-control__point', {
                'exclusion-control__point--excluded': exclusions.has(index),
                'exclusion-control__point--first': index === 0,
              })
            }
            onClick={() => onToggle(index)}
            key={point}
            cx={point[0]}
            cy={point[1]}
            r="0.06"
          />
        ))}
      </svg>
      <button onClick={onShuffle}>
        shuffle
      </button>
    </div>
  );
};