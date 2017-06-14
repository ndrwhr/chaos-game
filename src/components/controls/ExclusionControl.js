import listify from 'listify';
import _ from 'lodash';
import classNames from 'classnames';
import pluralize from 'pluralize';
import React from 'react';

import { createPolygon } from '../../utils/games';

import './exclusion-control.css';

const getExclusionHelp = (exclusionsSet, historySize) => {
  if (exclusionsSet.size){
    let excludedTargets = [...exclusionsSet].sort((a, b) => a - b);
    let str = 'The next chosen target cannot be ';

    if (excludedTargets[0] === 0) {
      str = `${str} the same ${excludedTargets.length > 1 ? 'or' : 'as'}`;
      excludedTargets.shift();
    }

    if (excludedTargets.length) {
      str = `${str} ${listify(excludedTargets, { finalWord: 'or' })}
        ${pluralize('place', excludedTargets[excludedTargets.length - 1])} away from`;
    }

    const actualHistorySize = historySize || 2;

    return `${str} the ${actualHistorySize > 1 ? 'last' : 'previously'}
      ${actualHistorySize > 1 ? actualHistorySize : ''} chosen
      ${pluralize('target', historySize)}
      ${historySize === null ? '(provided both previous targets were the same)' : ''}.`;
  }

  return 'The next target will be chosen randomly.';
};

export default ({exclusions, historySize, numPoints, onChange}) => {
  const exclusionsSet = new Set(exclusions);
  const points = createPolygon(numPoints);

  const onToggle = (index) => {
    const updatedExclusions = new Set(exclusions);

    if (updatedExclusions.has(index)){
      updatedExclusions.delete(index);
    } else {
      updatedExclusions.add(index);
    }

    onChange([...updatedExclusions]);
  };

  const onShuffle = () => onChange([
    ...(new Set(_.sampleSize(_.range(1, numPoints - 1), _.random(1, numPoints - 2)))),
  ]);

  const angleLerp = 360 / numPoints;
  let triangleAngles = _.times(numPoints - 1,
    index => ((angleLerp * (index + 1)) - 18));

  if (numPoints === 4){
    triangleAngles = triangleAngles.map(angle => angle - 45);
  }

  return (
    <div className="exclusion-control">
      <svg className="exclusion-control__points"
        viewBox="-0.15 -0.15 1.3 1.3"
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
                r="0.13"
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <path
          className="exclusion-control__loop"
          mask="url(#points)"
          d={`M${points[points.length - 1][0]} ${points[points.length - 1][1]}
            A 0.5 0.5 1 1 ${points[0][0]} ${points[0][1]}`}
        />
        {points.map((point, index) => (
          <g
            className={
              classNames('exclusion-control__point', {
                'exclusion-control__point--excluded': exclusionsSet.has(index),
                'exclusion-control__point--first': index === 0,
              })
            }
            key={point}
            transform={`translate(${point[0]}, ${point[1]})`}
            onClick={() => onToggle(index)}
          >
            <circle
              className="exclusion-control__point-background"
              cx="0"
              cy="0"
              r="0.09"
            />
            <g
              className="exclusion-control__point-cross"
              transform="rotate(45)"
            >
              <rect x="-0.06" y="-0.01" width="0.12" height="0.02"/>
              <rect x="-0.01" y="-0.06" width="0.02" height="0.12"/>
            </g>
          </g>
        ))}

        {triangleAngles.map(angle => (
          <g
            key={angle}
            transform={`translate(0, -0.5) rotate(${angle} 0.5 1)`}
          >
            <g transform="translate(0.5, 0.5)">
              <polygon
                className="exclusion-control__loop-triangle"
                transform="translate(0, -0.0225)"
                points="0,0 0.045,0.0225 0,0.045"
              />
            </g>
          </g>
        ))}
      </svg>

      <p className="exclusion-control__help">{getExclusionHelp(exclusionsSet, historySize)}</p>

      <button className="btn btn--block-center" onClick={onShuffle}>
        randomize exclusions
      </button>
    </div>
  );
};
