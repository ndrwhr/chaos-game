import _ from 'lodash';
import React from 'react';

import Game from '../Game';
import Options from '../Options';
import ColorControls from './ColorControls';
import ExclusionControl from './ExclusionControl';
import RadioControl from './RadioControl';
import TransformControls from './TransformControls';

import './controls.css';

const Control = ({title, description, children}) => (
  <div className="controls__control">
    <h3 className="controls__control-title">
      {title}
    </h3>
    {description &&
      <p className="controls__control-description">{description}</p>}
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
        description="The number of points to remember."
      >
        <RadioControl
          buttonStyle={true}
          selectedValue={props.historyIndex}
          options={historyOptions}
          onChange={index => props.onChange('historyIndex', index)}
        />
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

      <Control
        title="Number of Points"
        description="You can also move the points around by hovering over (or tapping) the generated fractal."
      >
        <RadioControl
          buttonStyle={true}
          selectedValue={props.shapeIndex}
          options={shapeOptions}
          onChange={index => props.onChange('shapeIndex', index)}
        />
      </Control>

      <Control
        title="Exclusions"
        description="When choosing the next target point, you can optionally tell the chaos game to not select a particular neighbor based on the previously selected target(s)."
      >
        <ExclusionControl
          numPoints={numPoints}
          exclusions={props.exclusions}
          onChange={(exclusions) => props.onChange('exclusions', exclusions)}
        />
      </Control>

      <Control
        title="Transformations"
        description="Adjust the core rules of the Chaos Game below."
      >
        <TransformControls
          colors={props.colorModeIndex ? null : props.colors}
          fixedNumTransforms={props.fixedNumTransforms}
          onColorChange={colors => props.onChange('colors', colors)}
          onChange={transforms => props.onChange('transforms', transforms)}
          transforms={props.transforms}
        />
      </Control>

      <Control title="Colors">
        <ColorControls
          colorModeIndex={props.colorModeIndex}
          colors={props.colors}
          game={game}
          onChange={props.onChange}
        />
      </Control>

      <Control
        title="Rendering Quality"
        description="Adjusts the size of the point drawn on every iteration."
      >
        <RadioControl
          buttonStyle
          selectedValue={props.qualityIndex}
          options={qualityOptions}
          onChange={index => props.onChange('qualityIndex', index)}
        />
      </Control>

      <Control
        title="Rendering Speed"
        description="Adjusts the number of points drawn. Faster speeds require more CPU usage."
      >
        <RadioControl
          buttonStyle
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
