import classNames from 'classnames';
import React from 'react';
import toSlugCase from 'to-slug-case';

import './tappable.css';

export default ({
  children,
  baseClassName,
  onPress,
  modifiers = {},
  ...rest
}) => {
  const classNameOptions = Object.keys(modifiers).reduce(
    (acc, modifier) => ({
      ...acc,
      [`${baseClassName}--${toSlugCase(modifier)}`]: !!modifiers[modifier],
    }),
    {},
  );
  const classes = classNames('tappable', baseClassName, classNameOptions);
  const hoverClass = `${baseClassName}--hover`;

  return React.cloneElement(children, {
    className: classes,
    onTouchStartCapture({ currentTarget }) {
      currentTarget.classList.add(hoverClass);
    },
    onTouchEndCapture({ currentTarget }) {
      currentTarget.classList.remove(hoverClass);
    },
    onMouseEnter({ currentTarget }) {
      currentTarget.classList.add(hoverClass);
    },
    onMouseLeave({ currentTarget }) {
      currentTarget.classList.remove(hoverClass);
    },
    onClick(evt) {
      evt.currentTarget.classList.remove(hoverClass);
      onPress(evt);
    },
    ...rest,
  });
};
