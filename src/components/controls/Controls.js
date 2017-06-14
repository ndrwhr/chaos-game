import _ from 'lodash';
import React from 'react';

import Games from '../../utils/games';
import { DEFAULT_CONTROLS } from '../../utils/options';
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
  const gameOptions = Games
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  const shapeOptions = DEFAULT_CONTROLS.shapeIndex.options
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  const numPoints =
    DEFAULT_CONTROLS.shapeIndex.options[props.shapeIndex].value;

  const game = Games[props.gameIndex];
  let historyControls = null;
  let historySize = null;
  if (game.controls.historyIndex){
    const historyOptions = game.controls.historyIndex.options
        .map((name, index) => ({
          name,
          value: index,
        }));

    historySize = game.controls.historyIndex.options[props.historyIndex];

    historyControls = (
      <Control
        title="Point History"
        description="The number of previous targets to take into consideration when choosing the next target."
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

  const speedOptions = DEFAULT_CONTROLS.speedIndex.options
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  const qualityOptions = DEFAULT_CONTROLS.qualityIndex.options
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  return (
    <div className="controls">
      <Control
        title="Variation"
        description="Change the core rules of the chaos game."
      >
        <RadioControl
          selectedValue={props.gameIndex}
          options={gameOptions}
          onChange={index => props.onChange('gameIndex', index)}
        />
        <p className="controls__description">{game.description}</p>
      </Control>

      {historyControls}

      <Control title="Number of Points">
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
          historySize={historySize}
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
    </div>
  );
};

export default Controls;
