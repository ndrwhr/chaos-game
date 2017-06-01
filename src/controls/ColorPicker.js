import classNames from 'classnames';
import React from 'react';
import rgbHex from 'rgb-hex';

import Options from '../Options';

export default class ColorPicker extends React.Component {
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