import classNames from 'classnames';
import React from 'react';

import { isTouchDevice } from '../utils/browser-utils';
import Button from './controls/Button';

import './download-modal.css';

export const DOWNLOAD_MODAL_STEPS = {
  INITIAL: 'initial',
  GENERATING: 'generating',
  READY: 'ready',
};

const makeOnPressCallback = (aspectRatio, cb) => evt => {
  evt.preventDefault();
  evt.stopPropagation();
  cb(aspectRatio);
};

const RATIOS = [
  {
    text: '16:9',
    value: 16 / 9,
    modifiers: {
      sixteenNine: true,
    },
  },
  {
    text: '4:3',
    value: 4 / 3,
    modifiers: {
      fourThree: true,
    },
  },
  {
    text: '1:1',
    value: 1,
    modifiers: {
      square: true,
    },
  },
  {
    text: '3:4',
    value: 3 / 4,
    modifiers: {
      threeFour: true,
    },
  },
  {
    text: '9:16',
    value: 9 / 16,
    modifiers: {
      nineSixteen: true,
    },
  },
];

export default ({ downloadUrl, onAspectratioSelect, onClose, step }) =>
  <div
    className={classNames('download-modal', {
      [`download-modal--visible`]: !!step,
    })}
    onClick={() => {
      if (step !== DOWNLOAD_MODAL_STEPS.GENERATING) onClose();
    }}
  >
    {step === DOWNLOAD_MODAL_STEPS.INITIAL &&
      <div className="download-modal__initial-step">
        <h2 className="download-modal__header">select an aspect ratio:</h2>

        <div className="download-modal__initial-step-buttons">
          {RATIOS.map(def =>
            <Button
              key={def.value}
              baseClassName="download-modal__initial-step-button"
              modifiers={def.modifiers}
              onPress={makeOnPressCallback(def.value, onAspectratioSelect)}
            >
              <span className="download-modal__initial-step-button-rect" />
              <span className="download-modal__initial-step-button-text">
                {def.text}
              </span>
            </Button>,
          )}
        </div>
      </div>}

    {step === DOWNLOAD_MODAL_STEPS.GENERATING &&
      <div className="download-modal__progress">processing</div>}

    {step === DOWNLOAD_MODAL_STEPS.READY &&
      <a
        className="btn btn--large"
        download="chaos-game.png"
        href={downloadUrl}
      >
        {isTouchDevice() ? 'tap' : 'click'} here to download
      </a>}
  </div>;
