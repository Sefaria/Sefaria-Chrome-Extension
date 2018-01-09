import React from 'react';
import PropTypes from 'prop-types';
import TextContainer from './TextContainer';
import TextChooser from './TextChooser';

const TextManager = ({ onTabClick, title, titleUrl, text, calendars, tab }) => (
  <div className="mega-div">
    <div>
      <h1><a href="https://www.sefaria.org"><img className="sefaria-logo" src="icons/sefaria.svg"/></a></h1>
      <TextChooser
        onTabClick={onTabClick}
        calendars={calendars}
        tab={tab}
      />
    </div>
    <TextContainer
      title={title}
      titleUrl={titleUrl}
      text={text}
    />
  </div>
);

TextManager.propTypes = {
  onTabClick: PropTypes.func.isRequired,
  title:      PropTypes.string,
  titleUrl:   PropTypes.string,
  text:       PropTypes.shape({
                en: PropTypes.array.isRequired,
                he: PropTypes.array.isRequired,
              }),
  calendars:  PropTypes.array,
  tab:        PropTypes.string,
};

export default TextManager;
