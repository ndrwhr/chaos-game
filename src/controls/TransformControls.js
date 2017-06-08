import _ from 'lodash';
import React from 'react';

import Options from '../Options';

const TRANSFORM_OPTIONS = Options.defaultControls.transforms.options;

const createRandomTransform = () => TRANSFORM_OPTIONS.reduce((update, option) => {
  update[option.name] = _.random(option.minValue, option.maxValue);
  return update;
}, {});

const RANGE_SCALE = 1000;

const RangeControl = props => (
  <div
    className={`transform-control__range transform-control__range--${props.name}`}
  >
    <input
      type="range"
      min={props.minValue * RANGE_SCALE}
      max={props.maxValue * RANGE_SCALE}
      value={props.value * RANGE_SCALE}
      onChange={evt => props.onChange(evt.target.value / RANGE_SCALE)}
    />
    <input
      type="text"
      value={props.value}
      onChange={evt => {
        const newValue = parseFloat(evt.target.value);
        if (newValue >= props.minValue && newValue <= props.maxValue){
          props.onChange(newValue);
        }
      }}
    />
  </div>
);

const TransformControl = ({onChange, onRemove, transform, transformIndex}) => {
  return (
    <div className="transform-controls__transform">
      <h4 className="transform-controls__transform-header">
        Transform #{transformIndex + 1}
      </h4>
      {
        TRANSFORM_OPTIONS.map(option => (
          <RangeControl
            key={option.name}
            name={option.name}
            minValue={option.minValue}
            maxValue={option.maxValue}
            value={transform[option.name]}
            onChange={value => onChange(Object.assign({}, transform, {
              [option.name]: value,
            }))}
          />
        ))
      }
      <button className="btn" onClick={() => onChange(createRandomTransform())}>shuffle</button>

      {onRemove && (
        <button className="btn" onClick={onRemove}>remove</button>
      )}
    </div>
  );
};

export default ({fixedNumTransforms, onChange, transforms}) => {
  const updateTransform = (index, updatedTransform) => {
    const updatedTransforms = transforms.slice();
    updatedTransforms[index] = updatedTransform;
    onChange(updatedTransforms);
  };

  return (
    <div className="transform-control">
      {
        transforms.map((transform, index) => (
          <TransformControl
            key={`transform-${index}`}
            transform={transform}
            transformIndex={index}
            onChange={updatedTransform => updateTransform(index, updatedTransform)}
            onRemove={transforms.length > 1 && !fixedNumTransforms && (() =>
              onChange([...transforms.slice(0, index), ...transforms.slice(index +1)]))}
          />
        ))
      }

      {!fixedNumTransforms && (
        <button
          className="btn"
          onClick={() =>
            onChange([...transforms, Options.defaultControls.transforms.createTransform()])}
        >
          add transform
        </button>
      )}

      <button
        className="btn"
        onClick={() => onChange(transforms.map(() => createRandomTransform()))}
      >
        randomize transforms
      </button>

      <button
        className="btn"
        onClick={() => {
          onChange(transforms.map(() =>
            Options.defaultControls.transforms.createTransform()));
        }}
      >
        reset transforms
      </button>
    </div>
  );
};