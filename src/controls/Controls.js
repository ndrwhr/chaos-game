import _ from 'lodash';
import classNames from 'classnames';
import ordinal from 'ordinal-number-suffix';
import React from 'react';
import rgbHex from 'rgb-hex';

import Game from '../Game';
import Options from '../Options';

import './controls.css';

const renderSelectBox = (selectedValue, options, onChange) => {
  return (
    <select
      className="controls__select-box"
      value={selectedValue}
      onChange={evt => onChange(evt.target.value)}
    >
      {options.map(({name, value}) =>
          <option key={value} value={value}>{name}</option>)}
    </select>
  );
};

const renderExclusionControl = (name, isSelected, onChange) => {
  const classes = classNames('controls__exclusion', {
    'controls__exclusion--selected': isSelected,
  });

  return (
    <label key={name} className={classes}>
      <input type="checkbox"
          onChange={onChange}
          checked={isSelected} />
      {name}
    </label>
  );
};

class ColorPicker extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  rgbaToHex(rgba){
    return '#' + rgbHex(rgba).slice(0, -2);
  }

  renderColor(rgba){
    return (
      <button
          key={rgba}
          className={classNames('color-picker__color', {
            'color-picker__color--selected': rgba === this.props.color,
          })}
          style={{background: this.rgbaToHex(rgba)}}
          onClick={() => {
            this.props.onSelect(rgba);
          }}
      />
    );
  }

  render(){
    const props = this.props;

    return (
      <div
          className={classNames('color-picker', {
            'color-picker--open': this.state.isOpen,
          })}>
        <button
            className="color-picker__selected-color"
            style={{background: this.rgbaToHex(props.color)}}
            onClick={() => {
              this.setState({
                isOpen: !this.state.isOpen,
              });
            }}
        />
        <div className="color-picker__color-list">
          {Options.colors.map(colorGroup => (
            <div key={colorGroup} className="color-picker__color-row">
              {colorGroup.map(color => this.renderColor(color))}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

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

  const exclusionControls = _.times(numPoints, index => {
    let name;
    if (index === 0){
      name = 'Self';
    } else if (index === 1){
      name = 'Neighbor';
    } else {
      name = `${ordinal(index)} Neighbor`;
    }

    return [
      name,
      props.exclusions.has(index),
      () => {
        const updatedExclusions = new Set(props.exclusions);

        if (updatedExclusions.has(index)){
          updatedExclusions.delete(index);
        } else {
          updatedExclusions.add(index);
        }

        props.onChange('exclusions', updatedExclusions);
      },
    ];
  }).map(args => renderExclusionControl(...args));

  const game = Game.games[props.gameIndex];
  let historyControls = null;
  if (game.controls.historyIndex){
    const historyOptions = game.controls.historyIndex.options
        .map((value, index) => ({
          name: `${value} Point${value !== 1 ? 's' : ''}`,
          value: index,
        }));

    historyControls = (
      <div className="controls__set">
        {renderSelectBox(props.historyIndex, historyOptions, index =>
            props.onChange('historyIndex', index))}
      </div>
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
              className="controls__range-input"
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
      <div className="controls__set">
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
      </div>
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
              className="controls__range-input"
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
      <div className="controls__set">
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
      </div>
    );
  }

  const speedOptions = Options.defaultControls.speedIndex.options
      .map((value, index) => ({
        name: `~${value * 60} dps`,
        value: index,
      }));

  const qualityOptions = Options.defaultControls.qualityIndex.options
      .map(({name}, index) => ({
        name,
        value: index,
      }));

  return (
    <div className="controls">
      <div className="controls__set">
        {renderSelectBox(props.gameIndex, gameOptions, index =>
            props.onChange('gameIndex', index))}
      </div>
      <div className="controls__set">
        {renderSelectBox(props.shapeIndex, shapeOptions, index =>
            props.onChange('shapeIndex', index))}
      </div>
      <div className="controls__set">
        {exclusionControls}
        <button
          onClick={() => {
            props.onChange('exclusions', new Set(
              _.sampleSize(_.range(numPoints), _.random(1, numPoints - 2))
            ));
          }}
        >
          shuffle
        </button>
      </div>
      {historyControls}
      {transformControls}
      {pointTransformControls}
      <div className="controls__set">
        {renderSelectBox(props.qualityIndex, qualityOptions, index =>
            props.onChange('qualityIndex', index))}
      </div>
      <div className="controls__set">
        {renderSelectBox(props.speedIndex, speedOptions, index =>
            props.onChange('speedIndex', index))}
      </div>
      <div className="controls__set">
         <button onClick={() => props.onChange('isRunning', !props.isRunning)}>
           {props.isRunning ? 'Pause' : 'Play'}
         </button>
      </div>
    </div>
  );
};

export default Controls;
