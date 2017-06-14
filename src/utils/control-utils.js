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

export function saveControlValues(controls) {
  const game = Games[controls.gameIndex];

  const serializedParams = Object.keys(controls).reduce((params, controlName) => {
    const serializeFn =
      (DEFAULT_CONTROLS[controlName] && DEFAULT_CONTROLS[controlName].serialize) ||
      (game.controls[controlName] && game.controls[controlName].serialize);

    return serializeFn ? {
      ...params,
      ...serializeFn(controls[controlName]),
    } : params;
  }, {});

  const paramsString = queryString.stringify(serializedParams, {arrayFormat: 'bracket'});
  window.history.replaceState({}, document.title, `?${paramsString}`);
}

export function readSavedControlValues() {
  const parsedParams = queryString.parse(window.location.search, {arrayFormat: 'bracket'});

  const iterateControls = controls => (
    Object.keys(controls).reduce((result, control) => {
      const serializedValue = parsedParams[controls[control].serializeTo];
      return serializedValue ? {
        ...result,
        ...controls[control].deserialize(serializedValue),
      } : result;
    }, {})
  );

  let controls = iterateControls(DEFAULT_CONTROLS);

  const game = Games[controls.gameIndex];
  if (game) {
    controls = Object.assign({}, controls, iterateControls(game.controls));
  }

  return controls;
}
