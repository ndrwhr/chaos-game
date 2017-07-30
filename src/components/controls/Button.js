import React from 'react';

import Tappable from './Tappable';

import './button.css';

export default ({ baseClassName = 'btn', children, ...rest }) =>
  <Tappable baseClassName={baseClassName} {...rest}>
    <button>
      {children}
    </button>
  </Tappable>;
