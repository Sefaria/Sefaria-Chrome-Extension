import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TextContainer from './TextContainer';
import TextChooser from './TextChooser';
import dataApi from './dataApi';
import { domain } from './const';
import { REDUX_ACTIONS } from './ReduxStore';

const TextManager = ({ onTabClick, title, titleUrl, text, calendarMap, calendarKeys, tab, initScrollPos, topic, topicUrl, language }) => (
  <div className="mega-div">
    <div>
      <h1><a href="https://www.sefaria.org"><img className="sefaria-logo" src="icons/sefaria.svg"/></a></h1>
      <TextChooser
        onTabClick={onTabClick}
        calendarMap={calendarMap}
        calendarKeys={calendarKeys}
        tab={tab}
        language={language}
      />
    </div>
    <TextContainer />
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
  language:   PropTypes.oneOf(["en", "bi", "he"]).isRequired,
};

const mapStateToProps = state => ({
  title: state.text && state.text.length > 0 ? (state.language === "en" ? state.text[0].ref : state.text[0].heRef) : "",
  titleUrl: state.titleUrl,
  text: state.text,
  calendarMap: state.calendarMap,
  calendarKeys: state.calendarKeys,
  tab: state.tab,
  initScrollPos: state.initScrollPos,
  topic: state.topic,
  topicUrl: `${domain}/topics/${state.topic}`,
  language: state.language,
});

const mapDispatchToProps = dispatch => ({
  onTabClick: tab => {
    dataApi.abortRunningRequest();
    dataApi.getTextForTab(tab);
    dispatch({type: REDUX_ACTIONS.SET_TAB, tab});
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TextManager);
