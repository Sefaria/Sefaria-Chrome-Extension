import React from 'react';
import PropTypes from 'prop-types';
import TextContainer from './TextContainer';
import TextChooser from './TextChooser';

const TextManager = ({ onTabClick, title, titleUrl, text, calendarMap, calendarKeys, tab, initScrollPos, topic, topicUrl }) => (
  <div className="mega-div">
    <div>
      <h1><a href="https://www.sefaria.org"><img className="sefaria-logo" src="icons/sefaria.svg"/></a></h1>
      <TextChooser
        onTabClick={onTabClick}
        calendarMap={calendarMap}
        calendarKeys={calendarKeys}
        tab={tab}
      />
    </div>
    <TextContainer
      title={title}
      titleUrl={titleUrl}
      text={text}
      tab={tab}
      topic={topic}
      topicUrl={topicUrl}
      initScrollPos={initScrollPos}
    />
  </div>
);

TextManager.propTypes = {
  onTabClick: PropTypes.func.isRequired,
  title:      PropTypes.string,
  titleUrl:   PropTypes.array,
  text: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    he:   PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    alts: PropTypes.array,
  })).isRequired,
  calendarMap:  PropTypes.object,
  calendarKeys: PropTypes.array,
  tab:        PropTypes.string,
  initScrollPos: PropTypes.number,
  topic:      PropTypes.string,
  topicUrl:   PropTypes.string,
};

export default TextManager;
