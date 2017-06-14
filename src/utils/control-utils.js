import queryString from 'query-string';

import Games from './games';
import { COLOR_MODES, DEFAULT_CONTROLS } from './options';

export function getControlValues(previousValues = {}) {
  const controls = [
    'gameIndex',
    'exclusions',
    'qualityIndex',
    'shapeIndex',
    'speedIndex',
  ].reduce((acc, control) => {
    const previousValue = previousValues[control];
    acc[control] = previousValue !== null && previousValue !== undefined ?
      previousValue : DEFAULT_CONTROLS[control].defaultValue();
    return acc;
  }, {});

  const numPoints = DEFAULT_CONTROLS.shapeIndex.options[controls.shapeIndex].value;
  const game = Games[controls.gameIndex];

  Object.keys(game.controls).forEach(control => {
    const previousValue = previousValues[control];
    controls[control] = previousValue !== null && previousValue !== undefined ?
      previousValue : game.controls[control].defaultValue();
  });

  if (game.numTransforms){
    const numTransforms = game.numTransforms(controls);
    controls.transforms = (previousValues.transforms || []).slice(0, numTransforms);
    while (controls.transforms.length < numTransforms){
      controls.transforms.push(DEFAULT_CONTROLS.transforms.createTransform());
    }
  } else {
    controls.transforms = previousValues.transforms ||
      DEFAULT_CONTROLS.transforms.defaultValue();
  }

  let numColors = !controls.colorModeIndex ||
    controls.colorModeIndex === COLOR_MODES.BY_TRANSFORM ?
    controls.transforms.length : numPoints;

  // Set up the color controls based on the previously set color options.
  controls.colors = DEFAULT_CONTROLS.colors
    .defaultValue(previousValues.colors, numColors);

  return controls;
}

function serializeTransformObject(obj) {
  return Object.keys(obj).map(key => `${key}${Math.floor(obj[key] * 10000) / 10000}`).join('');
}

function deserializeTransformObject(str) {
  const obj = {};
  const regex = /([a-z])(-?\d+(?:\.\d+)?)/g;

  let result = regex.exec(str);
  while (result) {
    const [, key, value] = result;
    obj[key] = parseFloat(value);
    result = regex.exec(str);
  }

  return obj;
}

export function saveControlValues(values) {
  const game = Games[values.gameIndex];

  const smallParams = Object.keys(values).reduce((params, control) => {
    const serializedName =
      (DEFAULT_CONTROLS[control] && DEFAULT_CONTROLS[control].serializedName) ||
      (game.controls[control] && game.controls[control].serializedName);

    if (serializedName){
      const value = values[control];
      if (Array.isArray(value)) {
        params[serializedName] = value.map(entry => (
          (typeof entry === 'object') ? serializeTransformObject(entry) : entry)
        );
      } else {
        params[serializedName] = value;
      }
    }

    return params;
  }, {});

  const serializedParams = queryString.stringify(smallParams, {arrayFormat: 'bracket'});
  window.history.replaceState({}, document.title, `?${serializedParams}`);
}

export function readSavedControlValues() {
  const parsedParams = queryString.parse(window.location.search, {arrayFormat: 'bracket'});

  function iterateControls(controls){
    return Object.keys(controls).reduce((result, control) => {
      const serializeValue = parsedParams[controls[control].serializedName];
      if (serializeValue){
        if (Array.isArray(serializeValue)) {
          result[control] = serializeValue.map(value => (
            isNaN(parseInt(value, 10)) ? deserializeTransformObject(value) : parseInt(value, 10)
          ));
        } else {
          result[control] = parseInt(serializeValue, 10);
        }
      }
      return result;
    }, {});
  }

  let controls = iterateControls(DEFAULT_CONTROLS);

  const game = Games[controls.gameIndex];
  if (game){
    controls = Object.assign({}, controls, iterateControls(game.controls));
  }

  return controls;
}
