import _ from 'lodash';
import React from 'react';

import Game from '../Game';
import Options from '../Options';
import ColorPicker from './ColorPicker';
import ExclusionControl from './ExclusionControl';
import RadioControl from './RadioControl';

import './controls.css';

const Control = ({title, children}) => (
  <div className="controls__control">
    <h3 className="controls__control-title">{title}</h3>
    <div className="controls__control-children">
      {children}
    </div>
  </div>
);

const Controls = props => {
  const gameOptions = Game.games
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  const shapeOptions = Options.defaultControls.shapeIndex.options
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  const numPoints =
    Options.defaultControls.shapeIndex.options[props.shapeIndex].value;

  const game = Game.games[props.gameIndex];
  let historyControls = null;
  if (game.controls.historyIndex){
    const historyOptions = game.controls.historyIndex.options
        .map((name, index) => ({
          name,
          value: index,
        }));

    historyControls = (
      <Control
        title="Point History"
      >
        <RadioControl
          selectedValue={props.historyIndex}
          options={historyOptions}
          onChange={index => props.onChange('historyIndex', index)}
        />
      </Control>
    );
  }

  const SCALE = 1000;

  const onTransformUpdate = (controlKey, index, update) => {
    const updatedTransforms = props[controlKey].slice();
    updatedTransforms[index] = Object.assign({}, updatedTransforms[index],
      update);

    props.onChange(controlKey, updatedTransforms);
  };

  const onAddTransform = () => {
    props.onChange('transforms', [
      ...props.transforms,
      game.controls.transforms.createTransform(
        props.transforms.map(transform => transform.color)),
    ]);
  };

  const onRemoveTransform = (index) => {
    props.onChange('transforms', props.transforms.filter((_, transformIndex) =>
        transformIndex !== index));
  };

  const randomTransform = (controlKey) => {
    return game.controls[controlKey].options
      .reduce((update, type) => {
        if (type !== 'color'){
          update[type] = _.random(
            game.controls[controlKey][type].minValue,
            game.controls[controlKey][type].maxValue
          );
        }
        return update;
      }, {});
  };

  let transformControls;
  if (props.transforms){
    const controls = props.transforms.map((transform, index) => {
      const options = game.controls.transforms.options.map(type => {
        if (type === 'color'){
          return (
            <ColorPicker
                key={type + index}
                color={transform[type]}
                onSelect={newValue =>
                  onTransformUpdate('transforms', index, {[type]: newValue})}
            />
          );
        }

        const min = game.controls.transforms[type].minValue * SCALE;
        const max = game.controls.transforms[type].maxValue * SCALE;
        const value = transform[type] * SCALE;

        return (
          <input
              className="range"
              title={type}
              key={type + index}
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(evt) =>
                onTransformUpdate(
                  'transforms',
                  index,
                  {[type]: evt.target.value / SCALE}
                )
              }
          />
        );
      });

      const removeButton = props.transforms.length > 1 ? (
        <button onClick={() => onRemoveTransform(index)}>
          remove
        </button>
      ) : null;

      return (
        <div key={index}>
          {options}
          {removeButton}
          <button
            onClick={() => {
              onTransformUpdate(
                'transforms',
                index,
                randomTransform('transforms')
              );
            }}
          >
            shuffle
          </button>
        </div>
      )
    });

    transformControls = (
      <Control title="Shared Transformations">
        {controls}
        <button onClick={onAddTransform}>Add Transform</button>
        <button
          onClick={() => {
            const transforms = props.transforms.map((transform) => {
              return {...transform, ...randomTransform('transforms')};
            });
            props.onChange('transforms', transforms);
          }}
        >
          Shuffle Parameters
        </button>
        <button
          onClick={() => {
            const transforms = [];
            props.transforms.reduce((colors, transform) => {
              const color = Options.getNextColor(colors);
              colors.push(color);
              transforms.push({
                ...transform, color,
              });
              return colors;
            }, []);
            props.onChange('transforms', transforms);
          }}
        >
          Shuffle Colors
        </button>
      </Control>
    );
  }

  let pointTransformControls;
  if (props.pointTransforms){
    const controls = props.pointTransforms.map((transform, index) => {
      const options = game.controls.pointTransforms.options.map(type => {
        if (type === 'color'){
          return (
            <ColorPicker
                key={type + index}
                color={transform[type]}
                onSelect={newValue =>
                  onTransformUpdate(
                    'pointTransforms',
                    index,
                    {[type]: newValue}
                  )
                }
            />
          );
        }

        const min = game.controls.pointTransforms[type].minValue * SCALE;
        const max = game.controls.pointTransforms[type].maxValue * SCALE;
        const value = transform[type] * SCALE;

        return (
          <input
              className="range"
              title={type}
              key={type + index}
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(evt) =>
                onTransformUpdate(
                  'pointTransforms',
                  index,
                  {[type]: evt.target.value / SCALE}
                )
              }
          />
        );
      });

      return (
        <div key={index}>
          {options}
          <button
            onClick={() => {
              onTransformUpdate(
                'pointTransforms',
                index,
                randomTransform('pointTransforms')
              );
            }}
          >
            shuffle
          </button>
        </div>
      )
    });

    pointTransformControls = (
      <Control title="Point Transformations">
        {controls}
        <button
          onClick={() => {
            const transforms = props.pointTransforms.map((transform) => {
              return {...transform, ...randomTransform('pointTransforms')};
            });
            props.onChange('pointTransforms', transforms);
          }}
        >
          Shuffle Parameters
        </button>
        <button
          onClick={() => {
            const transforms = [];
            props.pointTransforms.reduce((colors, transform) => {
              const color = Options.getNextColor(colors);
              colors.push(color);
              transforms.push({
                ...transform, color,
              });
              return colors;
            }, []);
            props.onChange('pointTransforms', transforms);
          }}
        >
          Shuffle Colors
        </button>
      </Control>
    );
  }

  const speedOptions = Options.defaultControls.speedIndex.options
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  const qualityOptions = Options.defaultControls.qualityIndex.options
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  return (
    <div className="controls">
      <Control title="Variation">
        <RadioControl
          selectedValue={props.gameIndex}
          options={gameOptions}
          onChange={index => props.onChange('gameIndex', index)}
        />
      </Control>

      {historyControls}

      <Control title="Number of Points">
        <RadioControl
          selectedValue={props.shapeIndex}
          options={shapeOptions}
          onChange={index => props.onChange('shapeIndex', index)}
        />
      </Control>

      <Control title="Exclusions">
        <ExclusionControl
          numPoints={numPoints}
          exclusions={props.exclusions}
          onChange={(exclusions) => props.onChange('exclusions', exclusions)}
        />
      </Control>

      <Control title="Colors">
        <RadioControl
          selectedValue={props.colorIndex}
          options={Options.defaultControls.colorIndex.options}
          onChange={index => props.onChange('colorIndex', index)}
        />
      </Control>

      {transformControls}

      {pointTransformControls}

      <Control title="Rendering Quality">
        <RadioControl
          selectedValue={props.qualityIndex}
          options={qualityOptions}
          onChange={index => props.onChange('qualityIndex', index)}
        />
      </Control>

      <Control title="Rendering Speed">
        <RadioControl
          selectedValue={props.speedIndex}
          options={speedOptions}
          onChange={index => props.onChange('speedIndex', index)}
        />
      </Control>

      <Control title="">
        <button onClick={() => props.onChange('isRunning', !props.isRunning)}>
           {props.isRunning ? 'Pause' : 'Play'}
         </button>
      </Control>
    </div>
  );
};

export default Controls;
