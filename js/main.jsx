//zip -r chrome.zip Sefaria-Chrome-Extension -x '*node_modules*'

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Component from 'react-class';
import { Provider, connect } from 'react-redux';
import { REDUX_ACTIONS, store } from './ReduxStore';
import TextManager from './TextManager';
import dataApi from './dataApi';
import { domain } from './const';


const getTextForTab = tab => {
  const currTab = store.getState().tab;
  store.dispatch({ type: REDUX_ACTIONS.SET_TEXT, text: null });
  store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: "" });
  if (tab === "Random") {
    dataApi.getRandomSource(onRandomApi);
  } else {
    //calendars
    dataApi.getCalendarText(store.getState().calendars, tab, onTextApi);
  }
}

const flattenArray = (array) => {
  if (array.constructor === String) {
    return [array];
  }
  while (true) {
    if ((array.length > 0 && array[0].constructor === String) || array.length === 0) {
      return array;
    } else {
      array = array.reduce((accum, curr) => accum.concat(curr), []);
    }
  }
}

const getTextFromState = s => {
  if (!s.text) return null;
  return { en: flattenArray(s.text.text), he: flattenArray(s.text.he)};
}

const onTextApi = (text, status, jqXHR, initScrollPos, fromCache) => {
  store.dispatch({ type: REDUX_ACTIONS.SET_SCROLL_POS, initScrollPos });
  store.dispatch({type: REDUX_ACTIONS.SET_TEXT, text});
  const siteUrl = dataApi.api2siteUrl(jqXHR.responseURL);
  store.dispatch({ type: REDUX_ACTIONS.SET_TITLE_URL, titleUrl: siteUrl });
  if (!fromCache) {
    chrome.storage.local.set({[siteUrl]: { text, jqXHR: { responseURL: jqXHR.responseURL } }});
  }
}

const onRandomApi = (topic, text, status, jqXHR, initScrollPos, fromCache) => {
  store.dispatch({ type: REDUX_ACTIONS.SET_TOPIC, topic: topic });
  onTextApi(text, status, jqXHR, initScrollPos, fromCache);
}

const mapStateToProps = state => {
  return {
    title: state.text ? (state.language === "en" ? state.text.ref : state.text.heRef) : "",
    titleUrl: state.titleUrl,
    text: getTextFromState(state),
    calendars: state.calendars,
    tab: state.tab,
    initScrollPos: state.initScrollPos,
    topic: state.topic,
    topicUrl: `${domain}/topics/${state.topic}`,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    onTabClick: tab => {
      dataApi.abortRunningRequest();
      getTextForTab(tab);
      dispatch({type: REDUX_ACTIONS.SET_TAB, tab});
    },
  }
}

const Root = connect(
  mapStateToProps,
  mapDispatchToProps
)(TextManager);

//Initialize App
//chrome.storage.local.clear(()=>{ console.log("cleared"); });
dataApi.init((data) => {
  if (!!data.calendars) {
    store.dispatch({ type: REDUX_ACTIONS.SET_CALENDARS, calendars: data.calendars });
  }

  const initTab = !!data.tab ? data.tab : "Random";
  store.dispatch({type: REDUX_ACTIONS.SET_TAB, tab: initTab});
  dataApi.getCalendars((data) => {
    store.dispatch({ type: REDUX_ACTIONS.SET_CALENDARS, calendars: data });
    getTextForTab(initTab);
  });
});
ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById("root")
);
