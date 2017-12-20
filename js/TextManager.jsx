import React from 'react';
import PropTypes from 'prop-types';
import TextTitle from './TextTitle';
import TextContainer from './TextContainer';
import TextChooser from './TextChooser';

const TextManager = ({ onTabClick, title, titleUrl, text, calendars, tab }) => (
  <div className="mega-div">
    <div>
      <h1>Sefaria Yomi</h1>
      <TextTitle
        title={title}
        titleUrl={titleUrl}
      />
    </div>
    <TextContainer
      text={text}
    />
    <TextChooser
      onTabClick={onTabClick}
      calendars={calendars}
      tab={tab}
    />
  </div>
);

TextManager.propTypes = {
  onTabClick: PropTypes.func.isRequired,
  title:      PropTypes.string,
  text:       PropTypes.shape({
                en: PropTypes.array.isRequired,
                he: PropTypes.array.isRequired,
              }),
  calendars:  PropTypes.array,
  tab:        PropTypes.string,
};

export default TextManager;
